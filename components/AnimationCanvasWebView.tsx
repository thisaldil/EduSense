/**
 * AnimationCanvasWebView.tsx – v3 (fully fixed)
 *
 * Fixes in this version:
 *  1. isLabelOnly() was too broad — mixed arrays (label + plant + sun) caused
 *     inferActors() to also run, painting a SECOND full set of characters on top
 *     (duplicate suns, trees, water drops, etc.).
 *  2. `cell` actor type had no renderer → fell through to drawLabel() which
 *     drew a smiley-face pill. Now renders as a proper chloroplast/cell oval.
 *  3. Double JSON.stringify in inject() (from v2).
 *  4. Stale closure in sendInit (from v2).
 */

import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
};

const ANIM_JS = `
(function () {
  "use strict";
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  var W = 800, H = 600;
  var state = { script: null, playing: false, t: 0, lastTs: null, domain: "generic" };

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { var x = clamp01(t); return 1 - Math.pow(1 - x, 3); }
  function fadeIn(elapsed, delay, dur) { return easeOut((elapsed - (delay || 0)) / Math.max(1, dur || 500)); }
  function post(msg) { try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch (_e) {} }

  function resizeCanvas() {
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    var rect = canvas.getBoundingClientRect();
    W = Math.max(300, Math.round(rect.width || 800));
    H = Math.max(220, Math.round(rect.height || 600));
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function normalize(raw) {
    if (!raw || typeof raw !== "object") {
      return { title:"Untitled", duration:6000, scenes:[{ id:"fallback", startTime:0, duration:6000, text:"Animation data is loading...", actors:[], environment:"minimal" }] };
    }
    var scenes = Array.isArray(raw.scenes) ? raw.scenes.slice() : [];
    var cursor = 0;
    scenes = scenes.map(function(s, i) {
      var sc = Object.assign({}, s || {});
      sc.id        = String(sc.id || ("scene_" + i));
      sc.duration  = Number(sc.duration) > 0 ? Number(sc.duration) : 6000;
      sc.startTime = Number(sc.startTime) >= 0 ? Number(sc.startTime) : cursor;
      sc.text      = String(sc.text || "");
      sc.environment = String(sc.environment || "");
      sc.actors = Array.isArray(sc.actors) ? sc.actors.map(function(a) {
        var actor = Object.assign({}, a || {});
        actor.type      = String(actor.type || "label").toLowerCase().trim();
        actor.animation = String(actor.animation || "appear").toLowerCase().trim();
        actor.x    = Number.isFinite(actor.x) ? Number(actor.x) : null;
        actor.y    = Number.isFinite(actor.y) ? Number(actor.y) : null;
        actor.size = Number(actor.size) > 0 ? Number(actor.size) : 40;
        actor.timeline = Array.isArray(actor.timeline)
          ? actor.timeline.filter(function(step) { return step && Number.isFinite(step.at); })
          : [];
        return actor;
      }) : [];
      cursor = sc.startTime + sc.duration;
      return sc;
    });
    if (!scenes.length) {
      scenes = [{ id:"fallback", startTime:0, duration:6000, text:String(raw.title||"Untitled"), actors:[], environment:"minimal" }];
      cursor = 6000;
    }
    scenes.sort(function(a, b) { return a.startTime - b.startTime; });
    var rebase = 0;
    scenes.forEach(function(sc) {
      if (!Number.isFinite(sc.startTime) || sc.startTime < rebase) sc.startTime = rebase;
      rebase = sc.startTime + sc.duration;
    });
    var computed = scenes.reduce(function(max, sc) { return Math.max(max, sc.startTime + sc.duration); }, 0);
    return {
      title:    String(raw.title || "Untitled Animation"),
      concept:  String(raw.concept || raw.title || ""),
      duration: Number(raw.duration) > 0 ? Math.max(Number(raw.duration), computed) : computed,
      scenes:   scenes,
    };
  }

  function detectDomain(script) {
    if (!script) return "generic";
    var corpus = (String(script.title||"") + " " + script.scenes.map(function(s){ return s.text; }).join(" ")).toLowerCase();
    if (/photosynthesis|chlorophyll|glucose|stomata|carbon.?dioxide|co2|chloroplast|plant.food/.test(corpus)) return "photosynthesis";
    if (/water.?cycle|evaporation|condensation|precipitation/.test(corpus)) return "water_cycle";
    if (/food.?chain|food.?web|producer|consumer|herbivore|carnivore/.test(corpus)) return "food_chain";
    if (/battery|switch|bulb|wire|current|electric|circuit/.test(corpus)) return "electric_circuit";
    if (/sound|vibration|hearing|ear|echo/.test(corpus)) return "sound";
    if (/heat|thermal|conduction|convection|radiation/.test(corpus)) return "heat_transfer";
    if (/gravity|weight|fall|pull/.test(corpus)) return "gravity";
    return "generic";
  }

  // FIX 1 — Check whether the actor list already contains real visual elements.
  // VISUAL_TYPES are every type that has a dedicated draw function.
  // If ANY of these appear in the script's actors we must NOT call inferActors()
  // because that would overlay an entire second set of characters.
  var VISUAL_TYPES = [
    "sun","plant","leaf","tree","root","cloud","waterdrop","water",
    "co2","o2","oxygen","molecule","glucose","bolt","energy",
    "rock","planet","earth","cell","chloroplast","bulb","ear","rabbit","lion","animal"
  ];
  function hasRealVisualActors(actors) {
    if (!actors || !actors.length) return false;
    return actors.some(function(a) {
      return a && VISUAL_TYPES.indexOf(String(a.type || "").toLowerCase()) !== -1;
    });
  }

  function sceneAt(timeMs) {
    if (!state.script || !state.script.scenes.length) return null;
    for (var i = state.script.scenes.length - 1; i >= 0; i--) {
      if (timeMs >= state.script.scenes[i].startTime) return state.script.scenes[i];
    }
    return state.script.scenes[0];
  }

  function inferActors(text) {
    if (state.domain === "photosynthesis") {
      return [
        { type:"sun",       x:W*0.78, y:H*0.14, size:52, animation:"rotate" },
        { type:"plant",     x:W*0.46, y:H*0.72, size:90, animation:"sway"   },
        { type:"root",      x:W*0.46, y:H*0.82, size:48, animation:"idle"   },
        { type:"waterdrop", x:W*0.22, y:H*0.78, size:28, animation:"float"  },
        { type:"co2",       x:W*0.72, y:H*0.32, size:34, animation:"drift"  },
      ];
    }
    if (state.domain === "water_cycle") {
      return [
        { type:"sun",       x:W*0.8,  y:H*0.14, size:46, animation:"rotate" },
        { type:"cloud",     x:W*0.5,  y:H*0.18, size:54, animation:"float"  },
        { type:"waterdrop", x:W*0.35, y:H*0.72, size:30, animation:"bounce" },
        { type:"waterdrop", x:W*0.5,  y:H*0.72, size:28, animation:"bounce" },
      ];
    }
    if (state.domain === "electric_circuit") {
      return [
        { type:"bolt",  x:W*0.22, y:H*0.5,  size:52, animation:"pulse", color:"#FACC15" },
        { type:"arrow", x:W*0.33, y:H*0.5,  angle:0, length:W*0.24,     color:"#FACC15" },
        { type:"bulb",  x:W*0.76, y:H*0.46, size:34, animation:"glow"  },
      ];
    }
    return [
      { type:"label", x:W*0.5,  y:H*0.44, text: text || "Science concept" },
      { type:"arrow", x:W*0.32, y:H*0.56, angle:0, length:W*0.32          },
    ];
  }

  // ── Background ──────────────────────────────────────────────────────────────
  function drawBackground(t) {
    var top="#B5D9FF", bottom="#ECF6FF", ground="#7C5A45";
    if (state.domain==="photosynthesis")    { top="#A8E6A1"; bottom="#DFF7D8"; ground="#795548"; }
    else if (state.domain==="water_cycle")  { top="#9EDBFF"; bottom="#E2F5FF"; ground="#8D6E63"; }
    else if (state.domain==="food_chain")   { top="#C9EFA5"; bottom="#F4FCE8"; ground="#7F5539"; }
    else if (state.domain==="electric_circuit") { top="#1E3A8A"; bottom="#111827"; ground=""; }
    else if (state.domain==="sound")        { top="#CFE8FF"; bottom="#EFF6FF"; ground=""; }
    else if (state.domain==="heat_transfer"){ top="#FFD6A5"; bottom="#FFEFD5"; ground=""; }

    var sky = ctx.createLinearGradient(0,0,0,H*0.75);
    sky.addColorStop(0,top); sky.addColorStop(1,bottom);
    ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);

    if (ground) {
      var soil = ctx.createLinearGradient(0,H*0.68,0,H);
      soil.addColorStop(0,ground); soil.addColorStop(1,"#4E342E");
      ctx.fillStyle = soil; ctx.fillRect(0,H*0.68,W,H*0.32);
      ctx.fillStyle = "#5DBB63"; ctx.fillRect(0,H*0.68,W,20);
    }
    if (state.domain==="electric_circuit") {
      ctx.save(); ctx.strokeStyle="rgba(255,255,255,0.08)"; ctx.lineWidth=1;
      var off=(t*18)%40;
      for (var gx=-40;gx<=W+40;gx+=40){ ctx.beginPath(); ctx.moveTo(gx+off,0); ctx.lineTo(gx+off,H); ctx.stroke(); }
      for (var gy=-40;gy<=H+40;gy+=40){ ctx.beginPath(); ctx.moveTo(0,gy+off); ctx.lineTo(W,gy+off); ctx.stroke(); }
      ctx.restore(); return;
    }
    drawCloud(W*0.14+Math.sin(t*0.25)*20, H*0.1, 1, 0.78);
    drawCloud(W*0.68+Math.cos(t*0.22)*16, H*0.12, 0.85, 0.68);
  }

  // ── Shape primitives ────────────────────────────────────────────────────────
  function drawCloud(cx,cy,scale,alpha) {
    var r=20*scale;
    ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle="#FFFFFF";
    [[0,0,r],[r*0.95,-r*0.3,r*0.82],[r*1.9,0,r*0.9],[-r*0.82,-r*0.2,r*0.72]].forEach(function(p){
      ctx.beginPath(); ctx.arc(cx+p[0],cy+p[1],p[2],0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }

  function drawArrow(x,y,angle,length,color,thickness,alpha) {
    if (length<=0||alpha<=0) return;
    var ex=x+Math.cos(angle)*length, ey=y+Math.sin(angle)*length;
    var head=Math.max(8,(thickness||3)*3.6);
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.strokeStyle=color||"#1565C0"; ctx.lineWidth=thickness||3; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.fillStyle=color||"#1565C0";
    ctx.beginPath();
    ctx.moveTo(ex-Math.cos(angle-0.42)*head,ey-Math.sin(angle-0.42)*head);
    ctx.lineTo(ex,ey);
    ctx.lineTo(ex-Math.cos(angle+0.42)*head,ey-Math.sin(angle+0.42)*head);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function drawWaterDrop(x,y,r,alpha,color) {
    var rad=Math.max(3,r);
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle=color||"#29B6F6"; ctx.strokeStyle="#0288D1"; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(x,y-rad*1.4);
    ctx.bezierCurveTo(x+rad,y-rad*0.3,x+rad,y+rad*0.7,x,y+rad);
    ctx.bezierCurveTo(x-rad,y+rad*0.7,x-rad,y-rad*0.3,x,y-rad*1.4);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  function drawSun(x,y,radius,t,alpha) {
    ctx.save(); ctx.globalAlpha=alpha;
    for (var i=0;i<12;i++) {
      var ang=(i/12)*Math.PI*2+t*0.7;
      var ray=radius*0.42+Math.sin(t*2+i)*radius*0.08;
      ctx.strokeStyle="rgba(255,213,79,0.9)"; ctx.lineWidth=3; ctx.lineCap="round";
      ctx.beginPath();
      ctx.moveTo(x+Math.cos(ang)*(radius+2),y+Math.sin(ang)*(radius+2));
      ctx.lineTo(x+Math.cos(ang)*(radius+ray),y+Math.sin(ang)*(radius+ray));
      ctx.stroke();
    }
    var grad=ctx.createRadialGradient(x-radius*0.25,y-radius*0.25,1,x,y,radius);
    grad.addColorStop(0,"#FFF9C4"); grad.addColorStop(0.5,"#FFE066"); grad.addColorStop(1,"#FF9800");
    ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawPlant(x,y,t,alpha,scale) {
    var s=Math.max(0.25,scale||1);
    var sway=Math.sin(t*1.4)*5;
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.scale(s,s);
    ctx.strokeStyle="#6D4C41"; ctx.lineWidth=9; ctx.lineCap="round";
    ctx.beginPath();
    ctx.moveTo(0,0); ctx.bezierCurveTo(sway,-38,sway*0.8,-84,sway*1.35,-132); ctx.stroke();
    [[sway*0.45-8,-78,-0.55,false],[sway*0.85+8,-98,0.58,true]].forEach(function(leaf){
      ctx.save(); ctx.translate(leaf[0],leaf[1]); ctx.rotate(leaf[2]);
      if(leaf[3]) ctx.scale(-1,1);
      ctx.fillStyle="#4CAF50";
      ctx.beginPath(); ctx.moveTo(-46,0); ctx.bezierCurveTo(-22,-22,0,-10,0,0);
      ctx.bezierCurveTo(0,10,-22,22,-46,0); ctx.closePath(); ctx.fill(); ctx.restore();
    });
    ctx.restore();
  }

  function drawRoot(x,y,alpha,color) {
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.strokeStyle=color||"#6D4C41"; ctx.lineWidth=3.5;
    [[-40,46],[-16,56],[12,58],[36,46]].forEach(function(r){
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+r[0],y+r[1]); ctx.stroke();
    });
    ctx.restore();
  }

  // FIX 2 — drawCell renders a proper chloroplast oval, not a smiley pill.
  function drawCell(x,y,r,alpha,color,t) {
    var rx=r*1.3, ry=r*0.85;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle=color||"#E1BEE7"; ctx.strokeStyle="#7B1FA2"; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    var pulse=1+Math.sin(t*1.8)*0.04;
    ctx.fillStyle="rgba(149,117,205,0.45)";
    ctx.beginPath(); ctx.ellipse(x,y,rx*0.58*pulse,ry*0.5*pulse,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#4A148C"; ctx.font="bold 10px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("cell",x,y);
    ctx.restore();
  }

  function drawCO2(x,y,r,alpha) {
    var radius=Math.max(4,r);
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle="#CFD8DC"; ctx.strokeStyle="#78909C"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#455A64"; ctx.font="bold "+Math.max(9,radius*0.58)+"px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("CO\u2082",x,y);
    ctx.restore();
  }

  function drawO2(x,y,r,alpha) {
    var radius=Math.max(4,r);
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle="#D6F5DD"; ctx.strokeStyle="#2E7D32"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#2E7D32"; ctx.font="bold "+Math.max(8,radius*0.72)+"px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("O\u2082",x,y);
    ctx.restore();
  }

  function drawGlucose(x,y,r,alpha,t) {
    var radius=Math.max(6,r);
    var p=1+Math.sin(t*1.8)*0.06;
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.scale(p,p);
    ctx.fillStyle="#FB923C"; ctx.strokeStyle="#E65100"; ctx.lineWidth=2.3;
    ctx.beginPath();
    for (var i=0;i<6;i++) {
      var ang=(i/6)*Math.PI*2-Math.PI/6;
      if(i===0) ctx.moveTo(Math.cos(ang)*radius,Math.sin(ang)*radius);
      else ctx.lineTo(Math.cos(ang)*radius,Math.sin(ang)*radius);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#7C2D00"; ctx.font="bold 9px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("C\u2086H\u2081\u2082O\u2086",0,0);
    ctx.restore();
  }

  function drawBolt(x,y,size,alpha,color) {
    var s=Math.max(4,size);
    ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color||"#A855F7";
    ctx.beginPath();
    ctx.moveTo(x+s*0.25,y-s); ctx.lineTo(x-s*0.3,y+s*0.08); ctx.lineTo(x+s*0.08,y+s*0.08);
    ctx.lineTo(x-s*0.25,y+s); ctx.lineTo(x+s*0.36,y-s*0.04); ctx.lineTo(x-s*0.04,y-s*0.04);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function drawRock(x,y,r,alpha,color) {
    var radius=Math.max(6,r);
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle=color||"#795548"; ctx.strokeStyle="#5D4037"; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(x-radius,y+radius*0.3); ctx.lineTo(x-radius*0.55,y-radius);
    ctx.lineTo(x+radius*0.34,y-radius*0.82); ctx.lineTo(x+radius,y+radius*0.05);
    ctx.lineTo(x+radius*0.56,y+radius); ctx.lineTo(x-radius*0.5,y+radius);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  function drawPlanet(x,y,r,alpha,color) {
    var radius=Math.max(8,r);
    ctx.save(); ctx.globalAlpha=alpha;
    var grad=ctx.createRadialGradient(x-radius*0.3,y-radius*0.3,1,x,y,radius);
    grad.addColorStop(0,"#9ED4FF"); grad.addColorStop(0.7,color||"#42A5F5"); grad.addColorStop(1,"#1565C0");
    ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  function drawLabel(text,x,y,alpha,color) {
    if (!text) return;
    var fs=13;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.font="600 "+fs+"px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    var w=Math.max(72,ctx.measureText(text).width+22), h=fs+14;
    ctx.fillStyle="rgba(255,255,255,0.92)";
    if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(x-w*0.5,y-h*0.5,w,h,h*0.5); ctx.fill(); }
    else { ctx.fillRect(x-w*0.5,y-h*0.5,w,h); }
    ctx.strokeStyle="rgba(37,99,235,0.22)"; ctx.lineWidth=1.5;
    if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(x-w*0.5,y-h*0.5,w,h,h*0.5); ctx.stroke(); }
    else { ctx.strokeRect(x-w*0.5,y-h*0.5,w,h); }
    ctx.fillStyle=color||"#1E3A8A"; ctx.fillText(text,x,y);
    ctx.restore();
  }

  // ── Actor motion offsets ────────────────────────────────────────────────────
  function actorMotion(actor,t,index) {
    var anim=String(actor.animation||"idle").toLowerCase(), phase=index*0.8;
    var dx=0,dy=0,scale=1;
    if(anim==="sway"||anim==="float")  { dx=Math.sin((t+phase)*1.2)*6; dy=Math.sin((t+phase)*0.8)*4; }
    else if(anim==="pulse"||anim==="glow") { scale=1+Math.sin((t+phase)*1.8)*0.08; }
    else if(anim==="bounce")           { dy=-Math.abs(Math.sin((t+phase)*3.2)*14); }
    else if(anim==="drift")            { dx=Math.sin((t+phase)*0.9)*12; dy=Math.sin((t+phase)*0.6)*9; }
    else                               { dy=Math.sin((t+phase)*0.7)*3; }
    return { dx:dx, dy:dy, scale:scale };
  }

  function drawActor(actor,alpha,t,index) {
    if (actor.x == null || actor.y == null) return;
    var m=actorMotion(actor,t,index);
    var x=actor.x+m.dx, y=actor.y+m.dy, size=(actor.size||40)*m.scale, type=actor.type;

    if      (type==="sun")                        drawSun(x,y,size,t,alpha);
    else if (type==="plant"||type==="tree")       drawPlant(x,y,t,alpha,size/90);
    else if (type==="leaf")                       drawPlant(x,y,t,alpha,size/70);
    else if (type==="root")                       drawRoot(x,y,alpha,actor.color);
    else if (type==="cloud")                      drawCloud(x,y,size/24,alpha);
    else if (type==="waterdrop"||type==="water")  drawWaterDrop(x,y,size*0.5,alpha,actor.color||"#29B6F6");
    else if (type==="co2")                        drawCO2(x,y,size*0.52,alpha);
    else if (type==="o2"||type==="oxygen")        drawO2(x,y,size*0.52,alpha);
    else if (type==="glucose")                    drawGlucose(x,y,size*0.56,alpha,t);
    else if (type==="cell"||type==="chloroplast") drawCell(x,y,size*0.52,alpha,actor.color,t);
    else if (type==="molecule") {
      var mType=String(actor.moleculeType||"").toLowerCase();
      if(/co2|carbon/.test(mType))       drawCO2(x,y,size*0.52,alpha);
      else if(/oxygen|o2/.test(mType))   drawO2(x,y,size*0.52,alpha);
      else if(/glucose|sugar/.test(mType)) drawGlucose(x,y,size*0.56,alpha,t);
      else drawWaterDrop(x,y,size*0.5,alpha,actor.color||"#29B6F6");
    }
    else if (type==="bolt"||type==="energy") drawBolt(x,y,size*0.56,alpha,actor.color||"#A855F7");
    else if (type==="rock")                  drawRock(x,y,size*0.52,alpha,actor.color);
    else if (type==="planet"||type==="earth") drawPlanet(x,y,size*0.56,alpha,actor.color);
    else if (type==="arrow")                 drawArrow(x,y,Number(actor.angle)||0,Number(actor.length)||120,actor.color||"#1565C0",actor.thickness||3,alpha);
    else if (type==="label")                 drawLabel(String(actor.text||""),x,y,alpha,actor.color||"#1E3A8A");
    else {
      // Unknown type: draw as a small dot so nothing is invisible
      ctx.save(); ctx.globalAlpha=alpha*0.6; ctx.fillStyle=actor.color||"#94A3B8";
      ctx.beginPath(); ctx.arc(x,y,size*0.28,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  function drawActors(actors,elapsed,t) {
    (actors||[]).forEach(function(actor,index) {
      var start=index*180, base=fadeIn(elapsed,start,520), alpha=base;
      if (Array.isArray(actor.timeline) && actor.timeline.length) {
        var tl=actor.timeline.filter(function(s){ return s&&Number.isFinite(s.at); })
                             .sort(function(a,b){ return a.at-b.at; });
        var current=null, next=null;
        for (var i=0;i<tl.length;i++) {
          if(elapsed>=tl[i].at){ current=tl[i]; next=tl[i+1]||null; } else { next=tl[i]; break; }
        }
        if (current && typeof current.alpha==="number") {
          if (next && typeof next.alpha==="number" && next.at>current.at) {
            alpha=alpha*lerp(current.alpha, next.alpha, easeOut((elapsed-current.at)/(next.at-current.at)));
          } else alpha=alpha*current.alpha;
        }
      }
      if (alpha>0.005) drawActor(actor,alpha,t,index);
    });
  }

  // ── Step overlays ───────────────────────────────────────────────────────────
  function processSteps(text) {
    if (state.domain==="photosynthesis") {
      return [
        { label:"Step 1: Plant absorbs sunlight",     draw:function(p,t,s){ drawPlant(W*0.46,H*0.72,t,p*s,1); drawSun(W*0.78,H*0.14,48*p,t,p*s); }},
        { label:"Step 2: Light travels to leaf",      draw:function(p,_t,s){ drawArrow(W*0.72,H*0.22,Math.PI-0.55,W*0.24*p,"#F59E0B",3,p*s); }},
        { label:"Step 3: Water moves up from roots",  draw:function(p,_t,s){ var y=lerp(H*0.84,H*0.46,easeOut(p)); drawWaterDrop(W*0.44,y,12,p*s); drawArrow(W*0.44,H*0.8,-Math.PI/2,H*0.28*p,"#0288D1",3,p*s); }},
        { label:"Step 4: CO\u2082 enters the leaf",  draw:function(p,_t,s){ var x=lerp(W*0.76,W*0.42,easeOut(p)); drawCO2(x,H*0.3,22,p*s); }},
        { label:"Step 5: Energy conversion",          draw:function(p,_t,s){ drawBolt(W*0.46,H*0.42,30*p,p*s,"#8B5CF6"); }},
        { label:"Step 6: Glucose is produced",        draw:function(p,t,s){ drawGlucose(W*0.56,H*0.44,28*p,p*s,t); }},
        { label:"Step 7: Oxygen is released",         draw:function(p,_t,s){ var ox=lerp(W*0.44,W*0.66,easeOut(p)); var oy=lerp(H*0.38,H*0.2,easeOut(p)); drawO2(ox,oy,17,p*s); }},
      ];
    }
    if (state.domain==="water_cycle") {
      return [
        { label:"Step 1: Sun heats surface water",  draw:function(p,t,s){ drawSun(W*0.78,H*0.16,44*p,t,p*s); }},
        { label:"Step 2: Evaporation rises",        draw:function(p,_t,s){ drawArrow(W*0.44,H*0.72,-Math.PI/2,H*0.28*p,"#0288D1",3,p*s); }},
        { label:"Step 3: Condensation forms cloud", draw:function(p,_t,s){ drawCloud(W*0.5,H*0.2,1.2*p,p*s); }},
        { label:"Step 4: Rain falls",               draw:function(p,_t,s){ for(var i=0;i<5;i++){ var x=W*0.35+i*W*0.07; var y=lerp(H*0.3,H*0.72,easeOut(p)); drawWaterDrop(x,y,10,p*s*(1-i*0.08)); }}},
        { label:"Step 5: Water collects",           draw:function(p,_t,s){ drawArrow(W*0.2,H*0.86,0,W*0.6*p,"#0288D1",3,p*s); }},
      ];
    }
    var short=String(text||"Science concept"); if(short.length>40) short=short.slice(0,40)+"...";
    return [
      { label:short,                   draw:function(p,_t,s){ drawLabel("Key idea",W*0.5,H*0.46,p*s,"#1E3A8A"); }},
      { label:"Observe and explain",   draw:function(p,_t,s){ drawArrow(W*0.32,H*0.56,0,W*0.36*p,"#2563EB",3,p*s); }},
    ];
  }

  function drawCaption(sceneText,stepLabel,elapsed) {
    var text=stepLabel||sceneText; if(!text) return;
    var alpha=fadeIn(elapsed,80,420); if(alpha<=0.01) return;
    var barH=46,barY=H-barH-10,barX=W*0.04,barW=W*0.92;
    ctx.save(); ctx.globalAlpha=alpha;
    var grad=ctx.createLinearGradient(0,barY,0,barY+barH);
    grad.addColorStop(0,"rgba(15,23,42,0.62)"); grad.addColorStop(1,"rgba(2,6,23,0.9)");
    ctx.fillStyle=grad;
    if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(barX,barY,barW,barH,12); ctx.fill(); }
    else { ctx.fillRect(barX,barY,barW,barH); }
    ctx.fillStyle="#FFFFFF"; ctx.font="600 14px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    var maxW=barW-36, out=text;
    while(ctx.measureText(out).width>maxW&&out.length>12) out=out.slice(0,-4)+"...";
    ctx.fillText(out,barX+barW*0.5,barY+barH*0.5);
    ctx.restore();
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  function renderFrame() {
    if (!state.script) { ctx.clearRect(0,0,W,H); return; }
    var scene=sceneAt(state.t); if(!scene) return;
    var elapsed=Math.max(0,state.t-scene.startTime);
    var time=elapsed*0.001, duration=scene.duration||6000;

    ctx.clearRect(0,0,W,H);
    drawBackground(time);

    var rawActors=Array.isArray(scene.actors)?scene.actors:[];

    // FIX 1: Only use inferActors() when the script provides NO real visual actors.
    var actors = hasRealVisualActors(rawActors) ? rawActors : inferActors(scene.text);
    var usingInferred = !hasRealVisualActors(rawActors);

    actors = actors.map(function(actor,index) {
      var a=Object.assign({},actor||{});
      if (!Array.isArray(a.timeline)||!a.timeline.length) {
        var start=Math.min(index*280,1800);
        a.timeline=[{at:start,alpha:0},{at:start+600,alpha:1}];
      }
      return a;
    });

    drawActors(actors,elapsed,time);

    var steps=processSteps(scene.text||"");
    var windowMs=Math.max(700,duration/steps.length);
    var idx=Math.min(steps.length-1,Math.floor(elapsed/windowMs));
    var local=clamp01((elapsed-idx*windowMs)/(windowMs*0.82));
    // When real script actors are present, step overlays are faint so they
    // don't double-paint on top of the properly positioned script actors.
    var strength=usingInferred?1:0.45;
    for(var i=0;i<idx;i++) steps[i].draw(1,time,strength);
    steps[idx].draw(easeOut(local),time,strength);
    drawCaption(scene.text||"",steps[idx].label,elapsed);
  }

  function tick(ts) {
    requestAnimationFrame(tick);
    if (state.playing&&state.script&&state.lastTs!=null) {
      state.t=Math.min(state.t+(ts-state.lastTs),state.script.duration||0);
      if(state.t>=(state.script.duration||0)){state.playing=false;post({completed:true});}
    }
    state.lastTs=state.playing?ts:null;
    renderFrame();
  }

  window.__anim=function(payload) {
    try {
      var msg=(typeof payload==="string")?JSON.parse(payload):payload;
      if(!msg||typeof msg!=="object") return;
      if(msg.type==="init"){
        state.script=normalize(msg.script);
        state.domain=detectDomain(state.script);
        state.playing=!!msg.isPlaying;
        state.t=Number.isFinite(msg.t)?Math.max(0,Math.min(msg.t,state.script.duration||0)):0;
        state.lastTs=null;
      } else if(msg.type==="play"){
        state.playing=!!msg.v; if(!state.playing) state.lastTs=null;
      } else if(msg.type==="seek"){
        var max=state.script?state.script.duration||0:0;
        state.t=Math.max(0,Math.min(Number(msg.t)||0,max));
      }
    } catch(err){ post({debug:String(err&&err.message?err.message:err)}); }
  };

  window.addEventListener("resize",resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(tick);
  post({ready:true});
})();\n`;

function makeHtml() {
  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" /><style>*{box-sizing:border-box;margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden;background:#0f172a}canvas{width:100%;height:100%;display:block;touch-action:none}</style></head><body><canvas id="c"></canvas><script>${ANIM_JS}</script></body></html>`;
}

function inject(payload: object): string {
  return `(function(){if(typeof window.__anim==='function'){window.__anim(${JSON.stringify(payload)});}})();true;`;
}

export function AnimationCanvasWebView({
  isPlaying,
  script,
  currentTimeMs,
}: Props) {
  const webViewRef = useRef<any>(null);
  const readyRef = useRef(false);
  const prevTimeRef = useRef<number | undefined>(undefined);
  const htmlRef = useRef(makeHtml());
  const propsRef = useRef({ isPlaying, script, currentTimeMs });
  useEffect(() => {
    propsRef.current = { isPlaying, script, currentTimeMs };
  });

  const sendInit = useCallback((webView: any) => {
    const { isPlaying: ip, script: sc, currentTimeMs: t } = propsRef.current;
    webView.injectJavaScript(
      inject({ type: "init", script: sc, isPlaying: ip, t: t ?? 0 }),
    );
    readyRef.current = true;
  }, []);

  useEffect(() => {
    if (!webViewRef.current || !script) return;
    sendInit(webViewRef.current);
  }, [script, sendInit]);

  useEffect(() => {
    if (!webViewRef.current || !readyRef.current) return;
    webViewRef.current.injectJavaScript(inject({ type: "play", v: isPlaying }));
  }, [isPlaying]);

  useEffect(() => {
    if (!webViewRef.current || !readyRef.current || currentTimeMs == null)
      return;
    const previous = prevTimeRef.current;
    prevTimeRef.current = currentTimeMs;
    if (
      !isPlaying ||
      previous == null ||
      currentTimeMs < previous ||
      Math.abs(currentTimeMs - previous) > 300
    ) {
      webViewRef.current.injectJavaScript(
        inject({ type: "seek", t: currentTimeMs }),
      );
    }
  }, [currentTimeMs, isPlaying]);

  return (
    <View style={styles.root}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlRef.current }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        onLoadEnd={() => {
          if (script && webViewRef.current) sendInit(webViewRef.current);
        }}
        onMessage={(event: any) => {
          try {
            const payload = JSON.parse(event.nativeEvent.data ?? "{}");
            if (payload.ready && script && webViewRef.current)
              sendInit(webViewRef.current);
            if (typeof __DEV__ !== "undefined" && __DEV__ && payload.debug) {
              console.log("[AnimationWebView]", payload.debug);
            }
          } catch {
            /* no-op */
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },
  webview: { flex: 1, backgroundColor: "transparent" },
});

declare let __DEV__: boolean;

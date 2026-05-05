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

import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { normalizeScript } from "@/animation/scriptNormalizer";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
  /** Fired when the user taps the canvas (WebView) to toggle play/pause on mobile. */
  onTogglePlayRequest?: () => void;
};

const ANIM_JS = `
(function () {
  "use strict";
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  var W = 800, H = 600;
  var GROUND_Y = H * 0.65;
  var state = { script: null, playing: false, t: 0, lastTs: null, domain: "generic", hapticLedger: {} };

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { var x = clamp01(t); return 1 - Math.pow(1 - x, 3); }
  function fadeIn(elapsed, delay, dur) { return easeOut((elapsed - (delay || 0)) / Math.max(1, dur || 500)); }
  function post(msg) { try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch (_e) {} }

  function resizeCanvas() {
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    var rect = canvas.getBoundingClientRect();
    var displayW = Math.max(300, Math.round(rect.width || 800));
    var displayH = Math.max(220, Math.round(rect.height || 600));
    canvas.width  = Math.round(displayW * dpr);
    canvas.height = Math.round(displayH * dpr);
    ctx.setTransform(dpr * displayW / W, 0, 0, dpr * displayH / H, 0, 0);
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
      sc.meta = (s && s.meta && typeof s.meta === "object") ? Object.assign({}, s.meta) : {};
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
      scenes = [{ id:"fallback", startTime:0, duration:6000, text:String(raw.title||"Untitled"), actors:[], environment:"minimal", meta:{} }];
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
  var VISUAL_TYPES_SET = new Set([
    "sun","plant","root","cloud","waterdrop","water","co2","oxygen","glucose","bolt",
    "arrow","line","rock","planet","earth","volcano","molecule","bulb","ear","animal","bird",
    "leaf","tree","cell","chloroplast","rabbit","lion","energy",
    "sun_character","plant_character","co2_bubble","water_drop","energy_bolt",
    "glucose_hexagon","tuning_fork","wave_emitter","air_particle",
    "magnet_bar","circuit_bulb","water_cycle_cloud","rock_layer"
  ]);
  var TYPE_ALIAS = {
    sun_character: "sun_character",
    plant_character: "plant_character",
    co2_bubble: "co2_bubble",
    co2bubble: "co2_bubble",
    water_drop: "water_drop",
    energy_bolt: "energy_bolt",
    glucose_hexagon: "glucose_hexagon",
    tuning_fork: "tuning_fork",
    wave_emitter: "wave_emitter",
    air_particle: "air_particle",
    magnet_bar: "magnet_bar",
    circuit_bulb: "circuit_bulb",
    water_cycle_cloud: "water_cycle_cloud",
    rock_layer: "rock_layer",
    star: "sun",
    leaf: "plant",
    tree: "plant",
    earth: "planet",
    droplet: "waterdrop",
    h2o: "waterdrop",
    water: "waterdrop",
    waterdrop: "waterdrop",
    carbondioxide: "co2",
    carbon_dioxide: "co2",
    o2: "oxygen",
    molecule_o2: "oxygen",
    glucose_molecule: "glucose",
    energy: "bolt",
    lightning: "bolt",
    herbivore: "animal",
    carnivore: "animal",
    producer: "plant",
    consumer: "animal",
  };
  function resolveActorType(raw) {
    var k = String(raw || "label").toLowerCase().trim();
    return TYPE_ALIAS[k] || k;
  }
  function hasRealVisualActors(actors) {
    if (!actors || !actors.length) return false;
    return actors.some(function(a) {
      if (!a) return false;
      var raw = String(a.type || "").toLowerCase();
      if (VISUAL_TYPES_SET.has(raw)) return true;
      return VISUAL_TYPES_SET.has(resolveActorType(raw));
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

  // ── Domain backgrounds (immersive scene, matches web/demo) ─────────────────
  function drawSimpleCloud(cx, cy, scale) {
    ctx.save(); ctx.globalAlpha=0.85; ctx.fillStyle="#FFFFFF";
    var r=22*scale;
    [[0,0,r],[r*0.9,-r*0.3,r*0.8],[r*1.8,r*0.1,r*0.9],[-r*0.9,-r*0.2,r*0.75]].forEach(function(p){
      ctx.beginPath(); ctx.arc(cx+p[0],cy+p[1],p[2],0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }
  function drawBiologyBackground(t) {
    var sky = ctx.createLinearGradient(0,0,0,GROUND_Y);
    sky.addColorStop(0,"#64B5F6"); sky.addColorStop(1,"#B3E5FC");
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,GROUND_Y);
    ctx.fillStyle="#8D6E63"; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
    ctx.fillStyle="#4CAF50";
    ctx.beginPath(); ctx.ellipse(W/2,GROUND_Y,W*0.7,26,0,0,Math.PI*2); ctx.fill();
    ctx.fillRect(0,GROUND_Y,W,24);
    ctx.strokeStyle="rgba(0,0,0,0.06)"; ctx.lineWidth=1;
    var gi, gy;
    for (gi=0;gi<4;gi+=1){
      gy=GROUND_Y+18+gi*((H-GROUND_Y-18)/5);
      ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke();
    }
    drawSimpleCloud(W*0.14,H*0.12,0.9);
    drawSimpleCloud(W*0.70,H*0.08,0.7);
    drawSimpleCloud(W*0.44,H*0.15,0.55);
  }
  function drawPhysicsBackground(t) {
    var bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,"#1A237E"); bg.addColorStop(1,"#283593");
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(255,255,255,0.04)"; ctx.lineWidth=1;
    var x, y;
    for (x=0;x<W;x+=60){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (y=0;y<H;y+=60){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.strokeStyle="rgba(41,182,246,0.15)"; ctx.lineWidth=2;
    ctx.beginPath();
    for (x=0;x<W;x+=4){
      y=H/2+Math.sin((x*0.03)+t*2)*30;
      if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  function drawElectricityBackground(t) {
    ctx.fillStyle="#0D1117"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="rgba(255,193,7,0.06)";
    var px, py;
    for (px=40;px<W;px+=40) for (py=40;py<H;py+=40){
      ctx.beginPath(); ctx.arc(px,py,1.5,0,Math.PI*2); ctx.fill();
    }
    var glow=ctx.createRadialGradient(W/2,H,0,W/2,H,W*0.6);
    glow.addColorStop(0,"rgba(255,193,7,0.08)"); glow.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
  }
  function drawWaterBackground(t) {
    var sky=ctx.createLinearGradient(0,0,0,H*0.7);
    sky.addColorStop(0,"#E3F2FD"); sky.addColorStop(1,"#BBDEFB");
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H*0.7);
    ctx.fillStyle="#1565C0";
    ctx.beginPath(); ctx.moveTo(0,H*0.7);
    var x, wy;
    for (x=0;x<=W;x+=6){
      wy=H*0.7+Math.sin((x*0.02)+t*1.5)*8;
      ctx.lineTo(x,wy);
    }
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
    ctx.fillStyle="rgba(66,165,245,0.4)"; ctx.fillRect(0,H*0.72,W,H*0.28);
  }
  function drawGeologyBackground(t) {
    ctx.fillStyle="#FFF8E1"; ctx.fillRect(0,0,W,H*0.3);
    ctx.fillStyle="#558B2F"; ctx.fillRect(0,H*0.3,W,H*0.08);
    var layers=["#9E9E9E","#795548","#607D8B","#546E7A"];
    var i, ly;
    for (i=0;i<layers.length;i+=1){
      ly=H*0.38+i*(H*0.155);
      ctx.fillStyle=layers[i];
      ctx.fillRect(0,ly,W,H*0.155+2);
    }
    var lava=ctx.createRadialGradient(W/2,H,0,W/2,H,W*0.5);
    lava.addColorStop(0,"rgba(255,87,34,0.2)"); lava.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=lava; ctx.fillRect(0,0,W,H);
  }
  function detectBackgroundFromActors(scene) {
    var types = (scene && Array.isArray(scene.actors) ? scene.actors : []).map(function(a){
      return String(a && a.type || "").toLowerCase();
    }).join(" ");
    if (types.indexOf("plant") >= 0 || types.indexOf("sun_character") >= 0 || types.indexOf("co2_bubble") >= 0 || types.indexOf("water_drop") >= 0 || types.indexOf("root") >= 0 || types.indexOf("glucose_hexagon") >= 0) return "biology";
    if (types.indexOf("tuning_fork") >= 0 || types.indexOf("wave_emitter") >= 0) return "physics";
    if (types.indexOf("circuit_bulb") >= 0) return "electricity";
    if (types.indexOf("water_cycle_cloud") >= 0) return "water";
    if (types.indexOf("rock_layer") >= 0) return "geology";
    return "";
  }
  function drawDomainBackground(t, scene) {
    var actorHint = detectBackgroundFromActors(scene);
    if (actorHint === "biology") { drawBiologyBackground(t); return; }
    if (actorHint === "physics") { drawPhysicsBackground(t); return; }
    if (actorHint === "electricity") { drawElectricityBackground(t); return; }
    if (actorHint === "water") { drawWaterBackground(t); return; }
    if (actorHint === "geology") { drawGeologyBackground(t); return; }

    var meta = (scene && scene.meta && typeof scene.meta === "object") ? scene.meta : {};
    var domain = String(meta.domain || "").toLowerCase();
    var legacy = String(state.domain || "generic").toLowerCase();
    var actorList = (scene && Array.isArray(scene.actors)) ? scene.actors : [];
    function actorTypesHasPlant() {
      var k, ty;
      for (k=0;k<actorList.length;k+=1){
        ty=String(actorList[k] && actorList[k].type || "").toLowerCase();
        if (ty.indexOf("plant") >= 0) return true;
      }
      return false;
    }
    function hasActorTypes(/* names */) {
      var names = [].slice.call(arguments);
      var a, ty, n;
      for (a=0;a<actorList.length;a+=1){
        ty=String(actorList[a] && actorList[a].type || "").toLowerCase();
        for (n=0;n<names.length;n+=1){ if (ty === names[n]) return true; }
      }
      return false;
    }
    var hasPlant = actorTypesHasPlant();
    var hasSound = hasActorTypes("tuning_fork","wave_emitter");
    var hasBulb  = hasActorTypes("circuit_bulb","bolt","bulb");
    var hasWater = hasActorTypes("water_cycle_cloud");
    var hasRock  = hasActorTypes("rock_layer");
    var bioMeta = domain === "biology" || domain === "photosynthesis";
    var bioLegacy = legacy === "photosynthesis" || legacy === "food_chain" || legacy === "respiration" || legacy === "human_body";

    if (bioMeta || bioLegacy || hasPlant) {
      drawBiologyBackground(t);
    } else if (domain === "electricity" || legacy === "electric_circuit" || hasBulb) {
      drawElectricityBackground(t);
    } else if (domain === "water" || domain === "water_cycle" || legacy === "water_cycle" || hasWater) {
      drawWaterBackground(t);
    } else if (domain === "earth_science" || domain === "geology" || hasRock) {
      drawGeologyBackground(t);
    } else if (domain === "physics" || domain === "sound" || legacy === "sound" || hasSound) {
      drawPhysicsBackground(t);
    } else if (legacy === "solar_system" || domain === "solar_system") {
      var darkG = ctx.createLinearGradient(0,0,0,H);
      darkG.addColorStop(0,"#0F172A"); darkG.addColorStop(1,"#1E1B4B");
      ctx.fillStyle=darkG; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.fillStyle="rgba(255,255,255,0.7)";
      var si, sx, sy;
      for (si=0;si<70;si+=1){
        sx=((si*173.7+31+t*12)%(W+50))-25;
        sy=(si*97.13+17)%(H*0.94);
        ctx.globalAlpha=0.25+Math.sin(t*2+si)*0.2;
        ctx.beginPath(); ctx.arc(sx,sy,0.8+(si%4)*0.5,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    } else {
      var bg = ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,"#F0F4F8"); bg.addColorStop(1,"#E2E8F0");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    }
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

  function drawLineSeg(x1,y1,x2,y2,color,thickness,alpha) {
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.strokeStyle=color||"#1565C0"; ctx.lineWidth=thickness||2; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    ctx.restore();
  }

  function drawEarActor(x,y,s,alpha) {
    var sz=Math.max(14,(s||34)*0.42);
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle="#F9A825"; ctx.strokeStyle="#C2410C"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(x,y,sz*0.7,sz,0.2,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+sz*0.08,y+sz*0.08,sz*0.28,0.2,4.8); ctx.stroke();
    ctx.restore();
  }

  function drawSunCharacter(ctx, cx, cy, size, alpha, t) {
    var r = size * 0.52;
    ctx.save(); ctx.globalAlpha = alpha;
    var grd = ctx.createRadialGradient(cx,cy,r*0.5,cx,cy,r*2.2);
    grd.addColorStop(0,"rgba(255,235,0,0.5)");
    grd.addColorStop(0.5,"rgba(255,180,0,0.2)");
    grd.addColorStop(1,"rgba(255,150,0,0)");
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,r*2.2,0,Math.PI*2); ctx.fill();
    var i, ang, rLen, inner, outer, g;
    for(i=0;i<12;i++){
      ang=(i/12)*Math.PI*2+t*0.4;
      rLen=r*0.45+Math.sin(t*2+i*0.8)*r*0.1;
      inner=r+4;
      outer=inner+rLen;
      g=ctx.createLinearGradient(
        cx+Math.cos(ang)*inner,cy+Math.sin(ang)*inner,
        cx+Math.cos(ang)*outer,cy+Math.sin(ang)*outer);
      g.addColorStop(0,"rgba(255,215,0,0.95)");
      g.addColorStop(1,"rgba(255,215,0,0)");
      ctx.strokeStyle=g; ctx.lineWidth=5; ctx.lineCap="round";
      ctx.beginPath();
      ctx.moveTo(cx+Math.cos(ang)*inner,cy+Math.sin(ang)*inner);
      ctx.lineTo(cx+Math.cos(ang)*outer,cy+Math.sin(ang)*outer);
      ctx.stroke();
    }
    var body=ctx.createRadialGradient(cx-r*0.25,cy-r*0.25,0,cx,cy,r);
    body.addColorStop(0,"#FFF9C4"); body.addColorStop(0.4,"#FFE000");
    body.addColorStop(0.8,"#FFA000"); body.addColorStop(1,"#E65100");
    ctx.fillStyle=body; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#E65100";
    ctx.beginPath(); ctx.arc(cx-r*0.3,cy-r*0.15,r*0.12,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+r*0.3,cy-r*0.15,r*0.12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#FFF9C4";
    ctx.beginPath(); ctx.arc(cx-r*0.28,cy-r*0.17,r*0.05,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+r*0.32,cy-r*0.17,r*0.05,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#E65100"; ctx.lineWidth=r*0.08; ctx.lineCap="round";
    ctx.beginPath(); ctx.arc(cx,cy+r*0.1,r*0.22,0.1,Math.PI-0.1); ctx.stroke();
    ctx.fillStyle="rgba(255,100,0,0.2)";
    ctx.beginPath(); ctx.ellipse(cx-r*0.55,cy+r*0.05,r*0.18,r*0.1,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+r*0.55,cy+r*0.05,r*0.18,r*0.1,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawLeafShape(ctx, cx, cy, len, halfW, dark, mid) {
    ctx.fillStyle=mid;
    ctx.beginPath();
    ctx.moveTo(cx-len,cy);
    ctx.bezierCurveTo(cx-len*0.5,cy-halfW,cx,cy-halfW*0.5,cx,cy);
    ctx.bezierCurveTo(cx,cy+halfW*0.5,cx-len*0.5,cy+halfW,cx-len,cy);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle=dark; ctx.globalAlpha*=0.35;
    ctx.beginPath();
    ctx.moveTo(cx-len,cy);
    ctx.bezierCurveTo(cx-len*0.5,cy,cx,cy+halfW*0.3,cx,cy);
    ctx.bezierCurveTo(cx-len*0.5,cy+halfW,cx-len*0.5,cy+halfW*0.5,cx-len,cy);
    ctx.closePath(); ctx.fill(); ctx.globalAlpha/=0.35;
    ctx.strokeStyle=dark; ctx.lineWidth=1.5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(cx-len,cy); ctx.lineTo(cx-len*0.05,cy); ctx.stroke();
  }

  function drawPlantCharacter(ctx, cx, groundY, size, alpha, t, color) {
    var sc = (typeof size === "number" && size > 0 ? size : 1) * (H / 600);
    var sway = Math.sin(t*0.8)*4 * sc;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.translate(cx, GROUND_Y);
    ctx.save(); ctx.globalAlpha=alpha*0.35;
    ctx.strokeStyle="#5D4037"; ctx.lineWidth=3*sc; ctx.lineCap="round";
    [[-18,0,-28,28],[-10,0,-8,32],[10,0,18,30],[18,0,26,26]].forEach(function(seg){
      ctx.beginPath(); ctx.moveTo(seg[0]*sc,seg[1]*sc); ctx.lineTo(seg[2]*sc,seg[3]*sc); ctx.stroke();
    }); ctx.restore();
    ctx.strokeStyle=color||"#6D4C41"; ctx.lineWidth=9*sc; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.bezierCurveTo(sway,-40*sc,sway*0.5,-80*sc,sway*1.2,-130*sc); ctx.stroke();
    var leafG="#2E7D32", leafL="#66BB6A";
    ctx.save(); ctx.translate(sway*0.6-10*sc,-80*sc); ctx.rotate(-0.55);
    drawLeafShape(ctx,0,0,48*sc,22*sc,leafG,leafL); ctx.restore();
    ctx.save(); ctx.translate(sway*0.8+10*sc,-100*sc); ctx.rotate(0.6); ctx.scale(-1,1);
    drawLeafShape(ctx,0,0,44*sc,20*sc,leafG,leafL); ctx.restore();
    ctx.save(); ctx.translate(sway*1.2,-138*sc); ctx.rotate(Math.sin(t*0.5)*0.06);
    drawLeafShape(ctx,0,0,55*sc,25*sc,leafG,leafL); ctx.restore();
    var fx=sway*0.7, fy=-55*sc;
    ctx.fillStyle="#A5D6A7";
    ctx.beginPath(); ctx.arc(fx,fy,18*sc,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#2E7D32"; ctx.lineWidth=2*sc;
    ctx.beginPath(); ctx.arc(fx,fy,18*sc,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle="#1B5E20";
    ctx.beginPath(); ctx.arc(fx-6*sc,fy-4*sc,3*sc,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(fx+6*sc,fy-4*sc,3*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#FFFFFF";
    ctx.beginPath(); ctx.arc(fx-5*sc,fy-5*sc,1*sc,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(fx+7*sc,fy-5*sc,1*sc,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#1B5E20"; ctx.lineWidth=2*sc; ctx.lineCap="round";
    ctx.beginPath(); ctx.arc(fx,fy+1*sc,6*sc,0.2,Math.PI-0.2); ctx.stroke();
    ctx.restore();
  }

  function drawCO2Bubble(ctx, cx, cy, size, alpha, t) {
    var r = size * 0.52;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle="rgba(176,190,197,0.3)"; ctx.strokeStyle="#B0BEC5"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#546E7A";
    ctx.font="bold "+Math.max(10,r*0.65)+"px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("CO\u2082",cx,cy);
    ctx.fillStyle="rgba(255,255,255,0.3)";
    ctx.beginPath(); ctx.ellipse(cx-r*0.3,cy-r*0.35,r*0.25,r*0.18,-0.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawWaterDropCharacter(ctx, cx, cy, size, alpha, t) {
    var r = size * 0.45;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle="#29B6F6"; ctx.strokeStyle="#0288D1"; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(cx,cy-r*1.5);
    ctx.bezierCurveTo(cx+r,cy-r*0.3,cx+r,cy+r*0.7,cx,cy+r);
    ctx.bezierCurveTo(cx-r,cy+r*0.7,cx-r,cy-r*0.3,cx,cy-r*1.5);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.ellipse(cx-r*0.3,cy-r*0.6,r*0.28,r*0.4,-0.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#0288D1";
    ctx.beginPath(); ctx.arc(cx-r*0.3,cy+r*0.1,r*0.12,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+r*0.3,cy+r*0.1,r*0.12,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#0288D1"; ctx.lineWidth=r*0.1; ctx.lineCap="round";
    ctx.beginPath(); ctx.arc(cx,cy+r*0.4,r*0.22,0.1,Math.PI-0.1); ctx.stroke();
    ctx.restore();
  }

  function drawEnergyBolt(ctx, cx, cy, size, alpha, t, color) {
    var s = size * 0.55;
    var pulse = 1 + Math.abs(Math.sin(t*4))*0.12;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.translate(cx,cy); ctx.scale(pulse,pulse);
    ctx.shadowColor="#CE93D8"; ctx.shadowBlur=20;
    ctx.fillStyle=color||"#AB47BC";
    ctx.beginPath();
    ctx.moveTo(s*0.25,-s); ctx.lineTo(-s*0.3,s*0.1); ctx.lineTo(s*0.08,s*0.1);
    ctx.lineTo(-s*0.25,s); ctx.lineTo(s*0.38,-s*0.05); ctx.lineTo(-s*0.05,-s*0.05);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#CE93D8"; ctx.globalAlpha=alpha*0.5;
    ctx.beginPath();
    ctx.moveTo(s*0.1,-s*0.8); ctx.lineTo(-s*0.1,s*0.05); ctx.lineTo(s*0.05,s*0.05);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawGlucoseHexagon(ctx, cx, cy, size, alpha, t, color) {
    var r = size * 0.52;
    var pulse = 1 + Math.sin(t*1.8)*0.06;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.translate(cx,cy); ctx.scale(pulse,pulse);
    var glow=ctx.createRadialGradient(0,0,r*0.5,0,0,r*1.8);
    glow.addColorStop(0,"rgba(255,143,0,0.35)"); glow.addColorStop(1,"rgba(255,143,0,0)");
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,0,r*1.8,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=alpha;
    ctx.fillStyle=color||"#FF8F00"; ctx.strokeStyle="#E65100"; ctx.lineWidth=2.5;
    ctx.beginPath();
    var i, a;
    for(i=0;i<6;i++){
      a=(i/6)*Math.PI*2-Math.PI/6;
      if(i===0) ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);
      else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#FFD54F"; ctx.globalAlpha=alpha*0.5;
    ctx.beginPath();
    for(i=0;i<6;i++){
      a=(i/6)*Math.PI*2-Math.PI/6; var rr=r*0.55;
      if(i===0) ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);
      else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);
    }
    ctx.closePath(); ctx.fill(); ctx.globalAlpha=alpha;
    ctx.fillStyle="#FFFFFF";
    ctx.font="bold "+Math.max(8,r*0.38)+"px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("C\u2086H\u2081\u2082O\u2086",0,0);
    ctx.restore();
  }

  function rrPath(ctx, x, y, w, h, rad) {
    if (typeof ctx.roundRect === "function") { ctx.beginPath(); ctx.roundRect(x,y,w,h,rad); }
    else { ctx.beginPath(); ctx.rect(x,y,w,h); }
  }

  function drawTuningFork(ctx, cx, cy, size, alpha, t) {
    var s = size * 0.45;
    var i, va;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle="#455A64"; ctx.strokeStyle="#263238"; ctx.lineWidth=2;
    rrPath(ctx, cx-4, cy+s*0.2, 8, s*0.8, 4); ctx.fill();
    rrPath(ctx, cx-s*0.35, cy-s, s*0.22, s*0.9, 8); ctx.fill();
    rrPath(ctx, cx+s*0.13, cy-s, s*0.22, s*0.9, 8); ctx.fill();
    for(i=1;i<=3;i++){
      va=Math.sin(t*8+i*0.6)*0.6+0.4;
      ctx.globalAlpha=alpha*va*0.5;
      ctx.strokeStyle="#80CBC4"; ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.arc(cx-s*0.5-i*8,cy-s*0.3,i*10,Math.PI*0.4,Math.PI*1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx+s*0.5+i*8,cy-s*0.3,i*10,-Math.PI*0.6,Math.PI*0.6);
      ctx.stroke();
    }
    ctx.globalAlpha=alpha;
    ctx.restore();
  }

  function drawWaveEmitter(ctx, cx, cy, size, alpha, t, color) {
    var base = size * 0.4;
    var i, r, a;
    ctx.save();
    for(i=0;i<4;i++){
      r = base + i*18 + Math.sin(t*3+i)*6;
      a = alpha*(1-i*0.22);
      ctx.globalAlpha=a;
      ctx.strokeStyle=color||"#29B6F6"; ctx.lineWidth=2.5-i*0.4;
      ctx.beginPath();
      ctx.arc(cx,cy,r,-Math.PI*0.7,Math.PI*0.7);
      ctx.stroke();
    }
    ctx.globalAlpha=alpha;
    ctx.fillStyle=color||"#29B6F6";
    ctx.beginPath(); ctx.arc(cx,cy,6,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawAirParticle(ctx, cx, cy, size, alpha, t) {
    var r = size * 0.4;
    var i, ang, sr;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle="#90A4AE";
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.4)";
    ctx.beginPath(); ctx.arc(cx-r*0.3,cy-r*0.3,r*0.35,0,Math.PI*2); ctx.fill();
    for(i=0;i<3;i++){
      ang = t*2+i*(Math.PI*2/3);
      sr = r*1.8;
      ctx.globalAlpha=alpha*0.4;
      ctx.fillStyle="#B0BEC5";
      ctx.beginPath(); ctx.arc(cx+Math.cos(ang)*sr,cy+Math.sin(ang)*sr,r*0.35,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawMagnetBar(ctx, cx, cy, size, alpha, t) {
    var w = size * 1.1, h = size * 0.38;
    var i, r;
    ctx.save(); ctx.globalAlpha=alpha;
    for(i=0;i<3;i++){
      ctx.globalAlpha=alpha*0.25;
      ctx.strokeStyle=i%2===0?"#EF5350":"#42A5F5"; ctx.lineWidth=1.5;
      r=(i+1)*20;
      ctx.beginPath();
      ctx.arc(cx,cy-h*3,r,0,Math.PI);
      ctx.stroke();
    }
    ctx.globalAlpha=alpha;
    ctx.fillStyle="#EF5350";
    rrPath(ctx, cx-w/2, cy-h/2, w/2, h, 6); ctx.fill();
    ctx.fillStyle="#42A5F5";
    rrPath(ctx, cx, cy-h/2, w/2, h, 6); ctx.fill();
    ctx.fillStyle="#FFFFFF";
    ctx.font="bold "+(h*0.55)+"px sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("N",cx-w*0.25,cy);
    ctx.fillText("S",cx+w*0.25,cy);
    ctx.restore();
  }

  function drawCircuitBulb(ctx, cx, cy, size, alpha, t) {
    var r = size * 0.45;
    var glow = 0.2+Math.max(0,Math.sin(t*5))*0.35;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle="rgba(250,204,21,"+glow+")";
    ctx.beginPath(); ctx.arc(cx,cy,r*1.9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#FDE047";
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#A16207"; ctx.lineWidth=2; ctx.stroke();
    ctx.strokeStyle="#92400E"; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(cx-r*0.3,cy+r*0.2);
    ctx.lineTo(cx-r*0.15,cy-r*0.1); ctx.lineTo(cx,cy+r*0.1);
    ctx.lineTo(cx+r*0.15,cy-r*0.1); ctx.lineTo(cx+r*0.3,cy+r*0.2);
    ctx.stroke();
    ctx.fillStyle="#64748B";
    ctx.fillRect(cx-r*0.5,cy+r*0.75,r,r*0.7);
    ctx.restore();
  }

  function drawWaterCycleCloud(ctx, cx, cy, size, alpha, t) {
    var r = size * 0.38;
    var i, dy;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.shadowColor="rgba(100,181,246,0.4)"; ctx.shadowBlur=8;
    ctx.fillStyle="#FFFFFF";
    [[0,0,r],[r*0.9,-r*0.3,r*0.8],[r*1.8,r*0.1,r*0.9],[-r*0.9,-r*0.2,r*0.75]].forEach(function(p){
      ctx.beginPath(); ctx.arc(cx+p[0],cy+p[1],p[2],0,Math.PI*2); ctx.fill();
    });
    ctx.shadowBlur=0;
    ctx.fillStyle="#29B6F6";
    for(i=0;i<3;i++){
      dy=(t*60+i*40)%80;
      ctx.globalAlpha=alpha*(1-dy/80);
      ctx.beginPath(); ctx.arc(cx-r*0.5+i*r*0.5,cy+r+dy,3,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawRockLayer(ctx, cx, cy, size, alpha, t) {
    var w = size * 1.4, h = size * 0.8;
    var layers = ["#9E9E9E","#795548","#607D8B"];
    var i, ly, lh, x, lava;
    ctx.save(); ctx.globalAlpha=alpha;
    layers.forEach(function(col,idx){
      ly = cy-h/2+idx*(h/3);
      lh = h/3;
      ctx.fillStyle=col;
      ctx.beginPath();
      ctx.moveTo(cx-w/2,ly);
      for(x=cx-w/2;x<=cx+w/2;x+=12){
        ctx.lineTo(x,ly+Math.sin((x+t*10)*0.2)*4);
      }
      ctx.lineTo(cx+w/2,ly+lh);
      ctx.lineTo(cx-w/2,ly+lh);
      ctx.closePath(); ctx.fill();
    });
    lava=ctx.createRadialGradient(cx,cy+h/2,0,cx,cy+h/2,w*0.4);
    lava.addColorStop(0,"rgba(255,87,34,0.5)");
    lava.addColorStop(1,"rgba(255,87,34,0)");
    ctx.fillStyle=lava;
    ctx.beginPath(); ctx.ellipse(cx,cy+h/2,w*0.4,h*0.2,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
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
    else if(anim==="wobble_growth") {
      scale=1+Math.abs(Math.sin((t+phase)*1.5))*0.1;
      dx=Math.sin((t+phase)*1.35)*5;
      dy=Math.sin((t+phase)*0.95)*4;
    }
    else if(anim==="pulse"||anim==="glow"||anim==="shine") { scale=1+Math.sin((t+phase)*1.8)*0.08; }
    else if(anim==="bounce")           { dy=-Math.abs(Math.sin((t+phase)*3.2)*14); }
    else if(anim==="strike") {
      dy=-Math.abs(Math.sin((t+phase)*4.2)*16);
      scale=1+Math.pow(Math.max(0,Math.sin((t+phase)*9.5)),2)*0.22;
    }
    else if(anim==="drift") {
      dx=Math.sin((t+phase)*0.9)*12;
      dy=Math.sin((t+phase)*0.6)*9;
    }
    else if(anim==="float_in") {
      dx=Math.sin((t+phase)*0.9)*12;
      dy=Math.sin((t+phase)*0.6)*9;
    }
    else if(anim==="vibrate") {
      dx=Math.sin((t+phase)*38)*4.2;
      dy=Math.cos((t+phase)*46)*3.6;
    }
    else                               { dy=Math.sin((t+phase)*0.7)*3; }
    return { dx:dx, dy:dy, scale:scale };
  }

  function drawActor(actor,alpha,t,index) {
    if (actor.x == null || actor.y == null) return;
    var rawType = String(actor.type||"").toLowerCase().trim();
    var type = (rawType === "co2_bubble" || rawType === "co2bubble") ? "co2_bubble" : resolveActorType(actor.type);
    var m=actorMotion(actor,t,index);
    var metaphorDef = { sun_character:52, plant_character:60, co2_bubble:28, water_drop:32, energy_bolt:34, glucose_hexagon:36, tuning_fork:40, wave_emitter:44, air_particle:16, magnet_bar:50, circuit_bulb:38, water_cycle_cloud:48, rock_layer:60 };
    var defSz = metaphorDef[type] !== undefined ? metaphorDef[type] : 40;
    var size = (Number(actor.size) || defSz) * m.scale;
    var x=actor.x+m.dx, y=actor.y+m.dy;

    if (type==="sun_character" || type==="sun") {
      drawSunCharacter(ctx, W*0.78, H*0.14, 52, alpha, t);
      return;
    }
    if (type==="plant_character") {
      drawPlantCharacter(ctx, x, GROUND_Y, 1.0, alpha, t, actor.color);
      return;
    }
    if (type==="root") {
      drawRoot(x, GROUND_Y+20, alpha, actor.color);
      return;
    }
    if (type==="water_drop") {
      drawWaterDropCharacter(ctx, x, GROUND_Y-30, Number(actor.size)>0?Number(actor.size):32, alpha, t);
      return;
    }
    if (type==="co2_bubble") {
      drawCO2Bubble(ctx, x, y, Number(actor.size)>0?Number(actor.size):28, alpha, t);
      return;
    }
    if (type==="energy_bolt") drawEnergyBolt(ctx,x,y,size,alpha,t,actor.color);
    else if (type==="glucose_hexagon") drawGlucoseHexagon(ctx,x,y,size,alpha,t,actor.color);
    else if (type==="tuning_fork") drawTuningFork(ctx,x,y,size,alpha,t);
    else if (type==="wave_emitter") drawWaveEmitter(ctx,x,y,size,alpha,t,actor.color);
    else if (type==="air_particle") drawAirParticle(ctx,x,y,size,alpha,t);
    else if (type==="magnet_bar") drawMagnetBar(ctx,x,y,size,alpha,t);
    else if (type==="circuit_bulb") drawCircuitBulb(ctx,x,y,size,alpha,t);
    else if (type==="water_cycle_cloud") drawWaterCycleCloud(ctx,x,y,size,alpha,t);
    else if (type==="rock_layer") drawRockLayer(ctx,x,y,size,alpha,t);
    else if (type==="plant"||type==="tree") drawPlant(x,y,t,alpha,size/90);
    else if (type==="leaf")                       drawPlant(x,y,t,alpha,size/70);
    else if (type==="cloud")                      drawCloud(x,y,size/24,alpha);
    else if (type==="waterdrop"||type==="water") drawWaterDrop(x,y,size*0.5,alpha,actor.color||"#29B6F6");
    else if (type==="co2")   drawCO2(x,y,size*0.52,alpha);
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
    else if (type==="line") {
      var lx1=actor.x1!=null?Number(actor.x1):x, ly1=actor.y1!=null?Number(actor.y1):y;
      var lx2=actor.x2!=null?Number(actor.x2):lx1+120, ly2=actor.y2!=null?Number(actor.y2):ly1;
      drawLineSeg(lx1,ly1,lx2,ly2,actor.color||"#1565C0",actor.thickness||2,alpha);
    }
    else if (type==="ear") drawEarActor(x,y,size,alpha);
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

  function drawActors(actors,elapsed,t,scene) {
    var scId = scene&&scene.id!=null ? String(scene.id) : "scene";
    var sunDrawn = false, plantDrawn = false;
    var SUN_TYPES = new Set(["sun","sun_character","star"]);
    var PLANT_TYPES = new Set(["plant","plant_character","leaf","tree"]);
    (actors||[]).forEach(function(actor,index) {
      var rawTy = String(actor.type||"").toLowerCase().trim();
      var resTy = resolveActorType(actor.type);
      if (SUN_TYPES.has(resTy) || SUN_TYPES.has(rawTy)) {
        if (sunDrawn) return;
        sunDrawn = true;
      }
      if (PLANT_TYPES.has(resTy) || PLANT_TYPES.has(rawTy)) {
        if (plantDrawn) return;
        plantDrawn = true;
      }
      var start=index*180, base=fadeIn(elapsed,start,520), alpha=base, current=null;
      if (Array.isArray(actor.timeline) && actor.timeline.length) {
        var tl=actor.timeline.filter(function(s){ return s&&Number.isFinite(s.at); })
                             .sort(function(a,b){ return a.at-b.at; });
        var next=null;
        for (var i=0;i<tl.length;i++) {
          if(elapsed>=tl[i].at){ current=tl[i]; next=tl[i+1]||null; } else { next=tl[i]; break; }
        }
        if (current && typeof current.alpha==="number") {
          if (next && typeof next.alpha==="number" && next.at>current.at) {
            alpha=alpha*lerp(current.alpha, next.alpha, easeOut((elapsed-current.at)/(next.at-current.at)));
          } else alpha=alpha*current.alpha;
        }
        if (current) {
          var act=String(current.action||"").toLowerCase();
          var wantAction=act==="strike"||act==="vibrate";
          var hs=actor.haptic_sync;
          var hasHapticSync=hs!=null&&hs!==false&&hs!=="";
          if ((wantAction||hasHapticSync) && !current._hapticFired) {
            var hk = scId+":"+index+":"+current.at+":"+(wantAction?"1":"0")+":"+(hasHapticSync?"1":"0");
            if (!state.hapticLedger[hk]) {
              state.hapticLedger[hk]=1;
              current._hapticFired=true;
              var styleStr="light";
              if (typeof hs==="string"&&hs.length) styleStr=hs;
              else if (hs===true||hs===1) styleStr="light";
              else if (wantAction) styleStr="medium";
              post({ type:"HAPTIC", style:styleStr });
            }
          }
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

  // ── Main render ─────────────────────────────────────────────────────────────
  function renderFrame() {
    if (!state.script) { ctx.clearRect(0,0,W,H); return; }
    var scene=sceneAt(state.t); if(!scene) return;
    var elapsed=Math.max(0,state.t-scene.startTime);
    var time=elapsed*0.001, duration=scene.duration||6000;

    ctx.clearRect(0,0,W,H);
    drawDomainBackground(time, scene);

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

    drawActors(actors,elapsed,time,scene);

    var steps=processSteps(scene.text||"");
    var windowMs=Math.max(700,duration/steps.length);
    var idx=Math.min(steps.length-1,Math.floor(elapsed/windowMs));
    var local=clamp01((elapsed-idx*windowMs)/(windowMs*0.82));
    // When real script actors are present, step overlays are faint so they
    // don't double-paint on top of the properly positioned script actors.
    var strength=usingInferred?1:0.45;
    for(var i=0;i<idx;i++) steps[i].draw(1,time,strength);
    steps[idx].draw(easeOut(local),time,strength);
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
        state.hapticLedger={};
      } else if(msg.type==="play"){
        state.playing=!!msg.v; if(!state.playing) state.lastTs=null;
      } else if(msg.type==="seek"){
        var max=state.script?state.script.duration||0:0;
        state.t=Math.max(0,Math.min(Number(msg.t)||0,max));
        state.hapticLedger={};
      }
    } catch(err){ post({debug:String(err&&err.message?err.message:err)}); }
  };

  function togglePlayPause() {
    post({ type: "TOGGLE_PLAY" });
  }
  canvas.addEventListener("click", togglePlayPause);
  canvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    togglePlayPause();
  }, { passive: false });

  window.addEventListener("resize",resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(tick);
  post({ready:true});
})();\n`;

function makeHtml() {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
*{box-sizing:border-box}
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #0F172A;
  width: 100%;
  height: 100%;
  touch-action: none;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
</style>
</head>
<body><canvas id="c"></canvas><script>${ANIM_JS}</script></body>
</html>`;
}

function inject(payload: object): string {
  return `(function(){if(typeof window.__anim==='function'){window.__anim(${JSON.stringify(payload)});}})();true;`;
}

function playHapticFromPayload(style: unknown) {
  const s = String(style ?? "light").toLowerCase();
  let impact: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium;
  if (s === "light" || s === "soft") {
    impact = Haptics.ImpactFeedbackStyle.Light;
  } else if (s === "heavy" || s === "rigid") {
    impact = Haptics.ImpactFeedbackStyle.Heavy;
  } else if (s === "medium") {
    impact = Haptics.ImpactFeedbackStyle.Medium;
  }
  void Haptics.impactAsync(impact);
}

export function AnimationCanvasWebView({
  isPlaying,
  script,
  currentTimeMs,
  onTogglePlayRequest,
}: Props) {
  const webViewRef = useRef<any>(null);
  const readyRef = useRef(false);
  const prevTimeRef = useRef<number | undefined>(undefined);
  const htmlRef = useRef(makeHtml());
  const propsRef = useRef({ isPlaying, script, currentTimeMs, onTogglePlayRequest });
  useEffect(() => {
    propsRef.current = { isPlaying, script, currentTimeMs, onTogglePlayRequest };
  });

  const sendInit = useCallback((webView: any) => {
    const { isPlaying: ip, script: sc, currentTimeMs: t } = propsRef.current;
    const payloadScript =
      sc && typeof sc === "object" ? normalizeScript(sc) : sc;
    webView.injectJavaScript(
      inject({ type: "init", script: payloadScript, isPlaying: ip, t: t ?? 0 }),
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
            if (payload.type === "HAPTIC") {
              playHapticFromPayload(payload.style);
            }
            if (payload.type === "TOGGLE_PLAY") {
              propsRef.current.onTogglePlayRequest?.();
            }
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

import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { normalizeAnimationScript } from "@/animation/runtime";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
};

const DEBUG_ENABLED =
  typeof process !== "undefined" &&
  process?.env?.EXPO_PUBLIC_ANIMATION_DEBUG === "1";

function getAnimationPlayerHtml(debugEnabled: boolean): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" />
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#0f172a}
canvas{display:block;width:100%;height:100%}
</style>
</head>
<body>
<canvas id="c" width="800" height="600"></canvas>
<script>
(function() {
  var DEBUG = ${debugEnabled ? "true" : "false"};
  var canvas = document.getElementById("c");
  var ctx = canvas.getContext("2d");
  var W = 800;
  var H = 600;
  var script = null;
  var isPlaying = false;
  var currentTime = 0;
  var rafId = null;
  var lastTS = null;

  function log(kind, payload) {
    if (!DEBUG) return;
    try { console.log("[anim-webview][" + kind + "]", payload || ""); } catch(_){}
  }

  function resizeCanvas() {
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
  }
  resizeCanvas();

  var ANIM_ALIAS = {
    appear: "appear",
    show: "appear",
    fadein: "appear",
    idle: "idle",
    pulse: "pulse",
    glow: "glow",
    shine: "glow",
    sway: "sway",
    wiggle: "sway",
    rotate: "rotate",
    spin: "rotate",
    grow: "grow",
    fall: "fall",
    drop: "fall",
    drift: "drift",
    float: "float",
    moveup: "float",
    move_up: "float"
  };

  function resolveAnim(v) {
    var k = String(v || "idle").toLowerCase().trim().replace(/\\s+/g, "").replace(/-/g, "_");
    return ANIM_ALIAS[k] || "idle";
  }

  function drawBackground(env) {
    if (env === "classroom") {
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(0,H*0.72,W,H*0.28);
      ctx.fillStyle = "#334155";
      ctx.fillRect(40,40,220,120);
      return;
    }
    if (env === "nature") {
      var g = ctx.createLinearGradient(0,0,0,H*0.68);
      g.addColorStop(0,"#7dd3fc");
      g.addColorStop(1,"#bae6fd");
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H*0.68);
      ctx.fillStyle = "#84cc16";
      ctx.fillRect(0,H*0.68,W,H*0.32);
      return;
    }
    if (env === "science") {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0,0,W,H);
      ctx.strokeStyle = "rgba(148,163,184,0.16)";
      for (var x=0;x<W;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (var y=0;y<H;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      return;
    }
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0,H*0.8,W,H*0.2);
  }

  function getScene(t) {
    if (!script || !script.scenes || script.scenes.length === 0) return null;
    for (var i = script.scenes.length - 1; i >= 0; i--) {
      if (t >= script.scenes[i].startTime) return { scene: script.scenes[i], index: i };
    }
    return { scene: script.scenes[0], index: 0 };
  }

  function actorState(a, elapsed, idx) {
    var x = typeof a.x === "number" ? a.x : 400;
    var y = typeof a.y === "number" ? a.y : 300;
    var alpha = 1;
    var scale = 1;
    var rotation = 0;
    var visible = true;
    var anim = resolveAnim(a.animation);
    var t = elapsed;

    if (anim === "appear") alpha = Math.min(1, Math.max(0, t / 550));
    if (anim === "grow") scale = 0.85 + Math.min(1, t / 650) * 0.15;
    if (anim === "pulse") scale *= 1 + Math.sin(t * 0.01 + idx) * 0.05;
    if (anim === "rotate") rotation += t * 0.0015;
    if (anim === "float") y -= Math.sin(t * 0.004 + idx) * 4;
    if (anim === "drift") x += Math.sin(t * 0.0025 + idx * 0.7) * 6;
    if (anim === "fall") y += Math.min(1, t / 1000) * 14;

    if (Array.isArray(a.timeline) && a.timeline.length > 0) {
      var sorted = a.timeline.slice().sort(function(a1,b1){ return (a1.at||0)-(b1.at||0); });
      var cur = null;
      var next = null;
      for (var i=0;i<sorted.length;i++) {
        if (t >= (sorted[i].at||0)) {
          cur = sorted[i];
          next = sorted[i+1] || null;
        } else {
          next = sorted[i];
          break;
        }
      }
      if (cur) {
        if (typeof cur.x === "number") x = cur.x;
        if (typeof cur.y === "number") y = cur.y;
        if (typeof cur.dx === "number") x += cur.dx;
        if (typeof cur.dy === "number") y += cur.dy;
        if (typeof cur.alpha === "number") alpha *= Math.max(0, Math.min(1, cur.alpha));
        if (typeof cur.opacity === "number") alpha *= Math.max(0, Math.min(1, cur.opacity));
        if (typeof cur.scale === "number") scale *= cur.scale;
        if (typeof cur.rotation === "number") rotation += cur.rotation;
        if (typeof cur.visible === "boolean") visible = cur.visible;
        if (cur.action === "hide") visible = false;
        if (next && typeof cur.alpha === "number" && typeof next.alpha === "number" && (next.at||0) > (cur.at||0)) {
          var tt = Math.max(0, Math.min(1, (t - (cur.at||0)) / ((next.at||0)-(cur.at||0))));
          alpha *= (cur.alpha + (next.alpha - cur.alpha) * tt);
        }
      }
    }

    return {
      x: x,
      y: y,
      alpha: Math.max(0, Math.min(1, alpha)),
      scale: isFinite(scale) ? scale : 1,
      rotation: isFinite(rotation) ? rotation : 0,
      visible: visible
    };
  }

  function drawFallback(a, st) {
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate(st.rotation);
    ctx.scale(st.scale, st.scale);
    ctx.globalAlpha = st.alpha;
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.strokeStyle = "rgba(15,23,42,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-72,-24,144,48,10) : ctx.rect(-72,-24,144,48);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = a.color || "#2563eb";
    ctx.font = "700 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(a.type || "actor").toUpperCase(), 0, 0);
    ctx.restore();
  }

  function drawLabel(a, st) {
    var txt = String(a.text || "Concept");
    var fontSize = Math.max(12, Number(a.fontSize) || 18);
    var width = Math.min(680, Math.max(180, txt.length * fontSize * 0.62));
    var height = fontSize + 18;
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate(st.rotation);
    ctx.scale(st.scale, st.scale);
    ctx.globalAlpha = st.alpha;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "rgba(15,23,42,0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-width/2,-height/2,width,height,12) : ctx.rect(-width/2,-height/2,width,height);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = a.color || "#0f172a";
    ctx.font = "700 " + fontSize + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  }

  function drawActor(a, st, elapsed) {
    var type = String(a.type || "label").toLowerCase();
    if (!st.visible || st.alpha <= 0) return;
    if (type === "label") { drawLabel(a, st); return; }

    if (type === "sun" || type === "star") {
      var r = (Number(a.size) || 52) * 0.5 * st.scale;
      ctx.save();
      ctx.globalAlpha = st.alpha;
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(st.x, st.y, r, 0, Math.PI*2);
      ctx.fill();
      for (var k=0;k<12;k++) {
        var ang = (k/12)*Math.PI*2 + elapsed*0.0006;
        ctx.beginPath();
        ctx.moveTo(st.x + Math.cos(ang)*r, st.y + Math.sin(ang)*r);
        ctx.lineTo(st.x + Math.cos(ang)*(r+18), st.y + Math.sin(ang)*(r+18));
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    if (type === "plant" || type === "leaf") {
      ctx.save();
      ctx.translate(st.x, st.y);
      ctx.scale(st.scale, st.scale);
      ctx.globalAlpha = st.alpha;
      ctx.strokeStyle = "#6d4c41";
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.bezierCurveTo(3,-38,4,-86,4,-126);
      ctx.stroke();
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.moveTo(-44,0);
      ctx.bezierCurveTo(-22,-22,0,-10,0,0);
      ctx.bezierCurveTo(0,10,-22,22,-44,0);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (type === "water" || type === "waterdrop") {
      var dr = (Number(a.size) || 30) * 0.5 * st.scale;
      ctx.save();
      ctx.globalAlpha = st.alpha;
      ctx.fillStyle = a.color || "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(st.x, st.y-dr*1.4);
      ctx.bezierCurveTo(st.x+dr, st.y-dr*0.2, st.x+dr, st.y+dr*0.8, st.x, st.y+dr);
      ctx.bezierCurveTo(st.x-dr, st.y+dr*0.8, st.x-dr, st.y-dr*0.2, st.x, st.y-dr*1.4);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (type === "co2" || type === "molecule") {
      var mr = (Number(a.size) || 34) * 0.45 * st.scale;
      ctx.save();
      ctx.globalAlpha = st.alpha;
      ctx.fillStyle = "#cfd8dc";
      ctx.strokeStyle = "#90a4ae";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(st.x, st.y, mr, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (type === "glucose") {
      var gr = (Number(a.size) || 40) * 0.4 * st.scale;
      ctx.save();
      ctx.globalAlpha = st.alpha;
      ctx.fillStyle = a.color || "#f59e0b";
      ctx.beginPath();
      for (var i=0;i<6;i++) {
        var ga = (i/6)*Math.PI*2 - Math.PI/6;
        if (i===0) ctx.moveTo(st.x + Math.cos(ga)*gr, st.y + Math.sin(ga)*gr);
        else ctx.lineTo(st.x + Math.cos(ga)*gr, st.y + Math.sin(ga)*gr);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    if (type === "arrow") {
      var len = (Number(a.length) || 120) * st.scale;
      var ang0 = (Number(a.angle) || 0) + st.rotation;
      var ex = st.x + Math.cos(ang0)*len;
      var ey = st.y + Math.sin(ang0)*len;
      ctx.save();
      ctx.globalAlpha = st.alpha;
      ctx.strokeStyle = a.color || "#2563eb";
      ctx.lineWidth = Number(a.thickness) || 3;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
      return;
    }

    drawFallback(a, st);
  }

  function draw() {
    if (!script) return;
    var found = getScene(currentTime);
    if (!found) return;
    var scene = found.scene;
    var elapsed = Math.max(0, currentTime - scene.startTime);
    var actors = Array.isArray(scene.actors) ? scene.actors : [];
    ctx.clearRect(0,0,W,H);
    drawBackground(scene.environment || "minimal");
    if (actors.length === 0) {
      drawLabel({ text: scene.text || "No scene actors", color: "#0f172a", fontSize: 24 }, { x: 400, y: 300, alpha: 1, scale: 1, rotation: 0, visible: true });
      return;
    }
    for (var i=0;i<actors.length;i++) {
      var a = actors[i] || {};
      var st = actorState(a, elapsed, i);
      drawActor(a, st, elapsed);
    }
  }

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (!isPlaying || !script) return;
    if (lastTS != null) {
      currentTime = Math.min(currentTime + (ts - lastTS), script.duration || 0);
      if (currentTime >= (script.duration || 0)) {
        isPlaying = false;
      }
    }
    lastTS = ts;
    draw();
  }

  function ensureLoop() {
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  window.__animationUpdate = function(payload) {
    try {
      var d = typeof payload === "string" ? JSON.parse(payload) : payload;
      if (!d) return;
      if (d.type === "init") {
        script = d.script || script;
        currentTime = typeof d.currentTimeMs === "number" ? Math.max(0, Math.min(d.currentTimeMs, (script && script.duration) || 0)) : 0;
        isPlaying = !!d.isPlaying;
        lastTS = null;
        log("scene", script && script.scenes ? script.scenes.length : 0);
        draw();
        ensureLoop();
        return;
      }
      if (d.type === "play") {
        isPlaying = !!d.isPlaying;
        lastTS = null;
        ensureLoop();
        return;
      }
      if (d.type === "seek") {
        currentTime = Math.max(0, Math.min(Number(d.time) || 0, (script && script.duration) || 0));
        draw();
        return;
      }
    } catch (e) {
      log("error", String(e));
    }
  };

  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ ready: true }));
  }
})();
</script>
</body>
</html>`;
}

function buildInitInject(script: any, isPlaying: boolean, currentTimeMs?: number) {
  const payload = JSON.stringify({ type: "init", script, isPlaying, currentTimeMs });
  return `(function(){ if (window.__animationUpdate) window.__animationUpdate(${JSON.stringify(payload)}); })(); true;`;
}

function buildPlayInject(isPlaying: boolean) {
  const payload = JSON.stringify({ type: "play", isPlaying });
  return `(function(){ if (window.__animationUpdate) window.__animationUpdate(${JSON.stringify(payload)}); })(); true;`;
}

function buildSeekInject(time: number) {
  const payload = JSON.stringify({ type: "seek", time });
  return `(function(){ if (window.__animationUpdate) window.__animationUpdate(${JSON.stringify(payload)}); })(); true;`;
}

export function AnimationCanvasWebView({ isPlaying, script, currentTimeMs }: Props) {
  const webViewRef = useRef<WebView>(null);
  const initRef = useRef(false);
  const prevTimeRef = useRef<number | undefined>(undefined);
  const normalizedScript = useMemo(
    () => (script ? normalizeAnimationScript(script) : null),
    [script],
  );
  const html = useMemo(() => getAnimationPlayerHtml(DEBUG_ENABLED), []);

  useEffect(() => {
    if (!webViewRef.current || !normalizedScript) return;
    webViewRef.current.injectJavaScript(
      buildInitInject(normalizedScript, isPlaying, currentTimeMs),
    );
    initRef.current = true;
  }, [normalizedScript, currentTimeMs, isPlaying]);

  useEffect(() => {
    if (!webViewRef.current || !initRef.current) return;
    webViewRef.current.injectJavaScript(buildPlayInject(isPlaying));
  }, [isPlaying]);

  useEffect(() => {
    if (!webViewRef.current || !initRef.current) return;
    if (currentTimeMs == null) return;
    const prev = prevTimeRef.current;
    prevTimeRef.current = currentTimeMs;
    const jumped =
      prev == null || currentTimeMs < prev || Math.abs(currentTimeMs - prev) > 250;
    if (!isPlaying || jumped) {
      webViewRef.current.injectJavaScript(buildSeekInject(currentTimeMs));
    }
  }, [currentTimeMs, isPlaying]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        onLoadEnd={() => {
          if (normalizedScript && webViewRef.current) {
            webViewRef.current.injectJavaScript(
              buildInitInject(normalizedScript, isPlaying, currentTimeMs),
            );
          }
        }}
        onMessage={(e) => {
          try {
            const d = JSON.parse(e.nativeEvent.data || "{}");
            if (d.ready && normalizedScript && webViewRef.current) {
              webViewRef.current.injectJavaScript(
                buildInitInject(normalizedScript, isPlaying, currentTimeMs),
              );
            }
          } catch {
            // ignore malformed messages
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

/**
 * AnimationCanvasWebView — WebView-based animation canvas for Android/iOS.
 *
 * WHY: expo-2d-context (GLView) has known issues on Android:
 * - Crashes, gradient bugs, text not rendering, ellipse/arc issues
 *
 * test-visual.tsx works because it uses WebView with a real HTML canvas.
 * This component uses the same approach: WebView + inline HTML with a real
 * Canvas 2D context. The animation runs in the WebView's JavaScript context
 * where createLinearGradient, fillText, etc. all work correctly.
 *
 * We inject the script and isPlaying via postMessage; the HTML runs the
 * animation using the same logic as our AnimationEngine (ported to vanilla JS).
 */

import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  isPlaying: boolean;
  script?: any | null;
};

/** Generate the full HTML for the animation player. Script is injected at runtime. */
function getAnimationPlayerHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#0F172A}
canvas{display:block;width:100%;height:100%;touch-action:none}
</style>
</head>
<body>
<canvas id="c" width="800" height="600"></canvas>
<script>
(function() {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var W = 800, H = 600;
  var script = null;
  var isPlaying = false;
  var currentTime = 0;
  var lastTS = null;
  var rafId = null;

  function resize() {
    var cw = canvas.clientWidth || W;
    var ch = canvas.clientHeight || H;
    if (cw && ch && (canvas.width !== W || canvas.height !== H)) {
      canvas.width = W;
      canvas.height = H;
    }
  }
  if (canvas.clientWidth && canvas.clientHeight) resize();
  else setTimeout(resize, 50);
  window.addEventListener('resize', resize);

  window.__animationUpdate = function(payload) {
    try {
      var d = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (!d) return;
      if (d.type === 'init' || d.script !== undefined) {
        script = d.script || script;
        isPlaying = d.isPlaying !== undefined ? !!d.isPlaying : isPlaying;
        currentTime = 0;
        lastTS = null;
        if (script) draw();
        if (isPlaying) loop(performance.now());
      } else if (d.type === 'play' || d.isPlaying !== undefined) {
        isPlaying = !!d.isPlaying;
        if (isPlaying) loop(performance.now());
      } else if (d.type === 'seek' && d.time !== undefined) {
        currentTime = Math.max(0, Math.min(d.time, (script && script.duration) || 0));
        if (script) draw();
      }
    } catch (err) {}
  };
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ ready: true }));
  }

  function getScene(t) {
    if (!script || !script.scenes || script.scenes.length === 0) return null;
    var scenes = script.scenes;
    for (var i = scenes.length - 1; i >= 0; i--) {
      if (t >= scenes[i].startTime) return { scene: scenes[i], index: i };
    }
    return { scene: scenes[0], index: 0 };
  }

  function draw() {
    if (!script) return;
    var s = getScene(currentTime);
    if (!s) return;
    var scene = s.scene;
    var elapsed = Math.max(0, currentTime - scene.startTime);
    var t = elapsed * 0.05;

    ctx.clearRect(0, 0, W, H);

    var sk = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    sk.addColorStop(0, '#64B5F6');
    sk.addColorStop(1, '#B3E5FC');
    ctx.fillStyle = sk;
    ctx.fillRect(0, 0, W, H * 0.65);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, H * 0.65, W, H * 0.35);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, H * 0.65, W, 22);

    var actors = scene.actors || [];
    var plant = actors.find(function(a){ return /plant|leaf/.test((a.type||'').toLowerCase()); });
    var sun = actors.find(function(a){ return /sun|star/.test((a.type||'').toLowerCase()); });
    var cx = (plant && plant.x != null) ? plant.x : W * 0.28;
    var gndY = (plant && plant.y != null) ? plant.y : H * 0.65;
    var sunX = (sun && sun.x != null) ? sun.x : W * 0.78;
    var sunY = (sun && sun.y != null) ? sun.y : H * 0.14;

    if (!plant && !sun) {
      cx = W * 0.28;
      gndY = H * 0.65;
      sunX = W * 0.78;
      sunY = H * 0.14;
    }

    for (var i = 0; i < actors.length; i++) {
      var a = actors[i];
      var type = (a.type || '').toLowerCase();
      if (type === 'label' && (!a.color || (a.color || '').toUpperCase() === '#000000' || (a.color || '').toUpperCase() === '#000')) continue;
      var ax = a.x != null ? a.x : 400;
      var ay = a.y != null ? a.y : 300;
      var alpha = 1;
      if (a.timeline && a.timeline.length > 0) {
        var cur = null, next = null;
        for (var j = 0; j < a.timeline.length; j++) {
          if (elapsed >= a.timeline[j].at) cur = a.timeline[j];
          else { next = a.timeline[j]; break; }
        }
        if (cur && typeof cur.alpha === 'number') alpha = cur.alpha;
      }
      if (alpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (type === 'plant' || type === 'leaf') {
        ctx.translate(ax, ay);
        ctx.strokeStyle = '#6D4C41';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(4, -40, 2, -80, 5, -130);
        ctx.stroke();
        ctx.fillStyle = '#66BB6A';
        ctx.beginPath();
        ctx.moveTo(-48, 0);
        ctx.bezierCurveTo(-24, -22, 0, -11, 0, 0);
        ctx.bezierCurveTo(0, 11, -24, 22, -48, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#A5D6A7';
        ctx.beginPath();
        ctx.arc(0, -55, 18, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'sun' || type === 'star') {
        var r = (a.size != null ? a.size : 52) * 0.5;
        ctx.fillStyle = '#FFE000';
        ctx.beginPath();
        ctx.arc(ax, ay, r, 0, Math.PI * 2);
        ctx.fill();
        for (var k = 0; k < 12; k++) {
          var ang = (k/12)*Math.PI*2 + t*0.02;
          ctx.beginPath();
          ctx.moveTo(ax + Math.cos(ang)*r, ay + Math.sin(ang)*r);
          ctx.lineTo(ax + Math.cos(ang)*(r+20), ay + Math.sin(ang)*(r+20));
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      } else if (type === 'arrow') {
        var len = a.length != null ? a.length : 120;
        var ang = a.angle != null ? a.angle : 0;
        var ex = ax + Math.cos(ang) * len;
        var ey = ay + Math.sin(ang) * len;
        ctx.strokeStyle = a.color || '#1565C0';
        ctx.lineWidth = a.thickness != null ? a.thickness : 3;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fillStyle = a.color || '#1565C0';
        ctx.beginPath();
        ctx.moveTo(ex - Math.cos(ang-0.4)*11, ey - Math.sin(ang-0.4)*11);
        ctx.lineTo(ex, ey);
        ctx.lineTo(ex - Math.cos(ang+0.4)*11, ey - Math.sin(ang+0.4)*11);
        ctx.closePath();
        ctx.fill();
      } else if (type === 'glucose') {
        var gr = (a.size != null ? a.size : 40) * 0.4;
        ctx.fillStyle = a.color || '#FF8F00';
        ctx.beginPath();
        for (var g = 0; g < 6; g++) {
          var ga = (g/6)*Math.PI*2 - Math.PI/6;
          if (g === 0) ctx.moveTo(ax + Math.cos(ga)*gr, ay + Math.sin(ga)*gr);
          else ctx.lineTo(ax + Math.cos(ga)*gr, ay + Math.sin(ga)*gr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (type === 'root') {
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 40, ay + 50);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 15, ay + 55);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 10, ay + 60);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 35, ay + 50);
        ctx.stroke();
      } else if (type === 'label' && a.text) {
        var txt = (a.text || '').replace(/\\s/g, '');
        if (/co₂|co2/i.test(txt)) {
          ctx.fillStyle = 'rgba(207,216,220,0.8)';
          ctx.strokeStyle = '#90A4AE';
          ctx.beginPath();
          ctx.arc(ax, ay, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (/h₂o|h2o/i.test(txt)) {
          ctx.fillStyle = '#29B6F6';
          ctx.beginPath();
          ctx.moveTo(ax, ay - 20);
          ctx.bezierCurveTo(ax + 14, ay - 4, ax + 14, ay + 14, ax, ay + 20);
          ctx.bezierCurveTo(ax - 14, ay + 14, ax - 14, ay - 4, ax, ay - 20);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = a.color || '#1565C0';
          ctx.font = 'bold ' + (a.fontSize || 14) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(a.text, ax, ay);
        }
      }

      ctx.restore();
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

})();
</script>
</body>
</html>`;
}

function buildInject(script: any, isPlaying: boolean) {
  const payload = JSON.stringify({ script, isPlaying });
  return `(function(){ if (typeof window.__animationUpdate === 'function') { window.__animationUpdate(${JSON.stringify(payload)}); } })(); true;`;
}

export function AnimationCanvasWebView({ isPlaying, script }: Props) {
  const webViewRef = useRef<WebView>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!webViewRef.current) return;
    if (script) {
      webViewRef.current.injectJavaScript(buildInject(script, isPlaying));
      initRef.current = true;
    }
  }, [script]);

  useEffect(() => {
    if (!webViewRef.current || !initRef.current) return;
    if (script) webViewRef.current.injectJavaScript(buildInject(script, isPlaying));
  }, [isPlaying, script]);

  const html = getAnimationPlayerHtml();

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
          if (script && webViewRef.current) {
            webViewRef.current.injectJavaScript(buildInject(script, isPlaying));
          }
        }}
        onMessage={(e) => {
          try {
            const d = JSON.parse(e.nativeEvent.data || "{}");
            if (d.ready && script && webViewRef.current) {
              webViewRef.current.injectJavaScript(buildInject(script, isPlaying));
            }
          } catch {}
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

/**
 * webview-player.js  — Self-contained animation player for WebView canvas.
 * Embedded as a string into AnimationCanvasWebView.tsx at build time.
 *
 * Design goals:
 *  • Every actor has REAL motion (sway, pulse, float, spin, bounce)
 *  • Atmospheric rich backgrounds (nature, science, space, classroom, minimal)
 *  • Smooth scene crossfade transitions
 *  • Auto-layout when backend x/y missing
 *  • Educational text slide for label-only scenes
 *  • Fallback pill for unknown actor types
 *  • requestAnimationFrame loop — smooth 60fps
 */
(function () {
    var canvas = document.getElementById('c');
    var ctx = canvas.getContext('2d');
    var W = 800, H = 600;
    canvas.width = W; canvas.height = H;

    /* ── State ─────────────────────────────────────────────────────── */
    var script = null;
    var isPlaying = false;
    var currentTime = 0;
    var lastTS = null;
    var rafId = null;
    var sceneAlpha = 1;
    var prevScene = -1;

    /* ── Utils ─────────────────────────────────────────────────────── */
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function clamp01(v) { return clamp(v, 0, 1); }
    function easeOut(t) { return t * (2 - t); }
    function easeInOut(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function sinW(t, freq, amp) { return Math.sin(t * freq) * amp; }
    function cosW(t, freq, amp) { return Math.cos(t * freq) * amp; }
    function fadeIn(elapsed, delay, dur) {
        return easeOut(clamp01((elapsed - (delay || 0)) / (dur || 700)));
    }
    function post(obj) {
        try { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch (e) { }
    }

    /* ── Motion resolver ───────────────────────────────────────────── */
    function resolveMotion(actor, elapsed, phase) {
        var anim = (actor.animation || 'idle').toLowerCase();
        var t = elapsed * 0.001; // seconds
        var p = phase || 0;
        var ox = 0, oy = 0, scale = 1, rot = 0, extraA = 1;

        if (anim === 'float' || anim === 'sway' || anim === 'idle') {
            ox = sinW(t + p, 0.9, 6); oy = sinW(t + p + 1, 0.6, 5);
        } else if (anim === 'pulse' || anim === 'glow') {
            scale = 1 + sinW(t + p, 1.4, 0.07);
        } else if (anim === 'grow') {
            scale = easeOut(clamp01(elapsed / 1400));
        } else if (anim === 'appear') {
            scale = easeOut(clamp01(elapsed / 600));
        } else if (anim === 'rotate' || anim === 'spin') {
            rot = t * 1.1;
        } else if (anim === 'vibrate') {
            ox = sinW(t, 18, 2.5); oy = sinW(t + .5, 22, 1.5);
        } else if (anim === 'orbit') {
            ox = cosW(t + p, 0.7, 32); oy = sinW(t + p, 0.7, 18);
        } else if (anim === 'fall') {
            oy = Math.min(elapsed * 0.09, 90); extraA = clamp01(1 - elapsed / 3000);
        } else if (anim === 'absorb') {
            scale = clamp01(1 - elapsed / 2200 * 0.3);
        } else if (anim === 'shine') {
            extraA = 0.65 + sinW(t + p, 2.5, 0.35);
        } else if (anim === 'bounce') {
            oy = -Math.abs(sinW(t + p, 3, 20));
        } else if (anim === 'drift') {
            ox = sinW(t + p, 0.4, 12); oy = sinW(t + p + 2, 0.3, 8);
        } else {
            // Unknown — gentle bob
            oy = sinW(t + p, 0.5, 4);
        }
        return { ox: ox, oy: oy, scale: scale, rot: rot, extraA: extraA };
    }

    /* ── Timeline alpha ────────────────────────────────────────────── */
    function timelineAlpha(actor, elapsed, base) {
        var tl = actor.timeline;
        if (!tl || !tl.length) return base;
        var cur = null, nxt = null;
        for (var i = 0; i < tl.length; i++) {
            if (elapsed >= tl[i].at) { cur = tl[i]; nxt = tl[i + 1] || null; }
            else { nxt = tl[i]; break; }
        }
        if (!cur || typeof cur.alpha !== 'number') return base;
        if (nxt && typeof nxt.alpha === 'number' && nxt.at > cur.at) {
            var frac = easeInOut(clamp01((elapsed - cur.at) / (nxt.at - cur.at)));
            return base * lerp(cur.alpha, nxt.alpha, frac);
        }
        return base * cur.alpha;
    }

    /* ── Backgrounds ───────────────────────────────────────────────── */
    function bgNature(t) {
        // Sky
        var sk = ctx.createLinearGradient(0, 0, 0, H * .65);
        sk.addColorStop(0, '#42A5F5'); sk.addColorStop(.6, '#B3E5FC');
        ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H * .65);
        // Atmospheric sun glow
        ctx.save(); ctx.globalAlpha = .13 + sinW(t, .4, .05);
        var sg = ctx.createRadialGradient(W * .82, H * .1, 10, W * .82, H * .1, 180);
        sg.addColorStop(0, 'rgba(255,236,64,.7)'); sg.addColorStop(1, 'rgba(255,236,64,0)');
        ctx.fillStyle = sg; ctx.fillRect(W * .5, 0, W * .5, H * .45);
        ctx.restore();
        // Ground
        var gr = ctx.createLinearGradient(0, H * .65, 0, H);
        gr.addColorStop(0, '#6D4C41'); gr.addColorStop(1, '#4E342E');
        ctx.fillStyle = gr; ctx.fillRect(0, H * .65, W, H * .35);
        // Grass layers
        ctx.fillStyle = '#66BB6A'; ctx.fillRect(0, H * .65, W, 20);
        ctx.fillStyle = '#43A047'; ctx.fillRect(0, H * .65 + 20, W, 7);
        // Moving clouds
        ['#fff', '#f1f8e9', '#ffffff'].forEach(function (cl, i) {
            var cx = ((W * .15 + i * W * .33 + t * 10 * (i + 1)) % (W + 120)) - 60;
            drawCloud(cx, H * (.07 + i * .04), .9 - i * .15, cl);
        });
    }

    function bgScience(t) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#1A237E'); g.addColorStop(.6, '#283593'); g.addColorStop(1, '#1A237E');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // Scrolling grid
        ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
        var off = (t * 8) % 40;
        for (var i = -1; i < W / 40 + 1; i++) { ctx.beginPath(); ctx.moveTo(i * 40 + off, 0); ctx.lineTo(i * 40 + off, H); ctx.stroke(); }
        for (var j = -1; j < H / 40 + 1; j++) { ctx.beginPath(); ctx.moveTo(0, j * 40 + off); ctx.lineTo(W, j * 40 + off); ctx.stroke(); }
        // Floating orbs
        for (var k = 0; k < 6; k++) {
            ctx.save();
            ctx.globalAlpha = .1 + sinW(t + k * 1.3, .6, .07);
            ctx.fillStyle = k % 2 ? '#7C4DFF' : '#448AFF';
            var ox = (k * 140 + t * 25 * (k % 3 + 1)) % W, oy = (k * 90 + sinW(t + k, .4, 30)) % H;
            ctx.beginPath(); ctx.arc(ox, oy, 4 + k % 3, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }

    function bgSpace(t) {
        ctx.fillStyle = '#08081E'; ctx.fillRect(0, 0, W, H);
        // Stars
        for (var i = 0; i < 70; i++) {
            var sx = (i * 173.7 + 31) % W, sy = (i * 97.13 + 17) % H;
            var tw = .25 + sinW(t + i * .8, 1 + i % 3 * .4, .4);
            ctx.globalAlpha = clamp01(tw);
            ctx.fillStyle = i % 5 == 0 ? '#BBDEFB' : i % 7 == 0 ? '#FFF9C4' : '#fff';
            ctx.beginPath(); ctx.arc(sx, sy, .5 + (i % 4) * .5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Nebula
        ctx.save(); ctx.globalAlpha = .06;
        var ng = ctx.createRadialGradient(W * .3, H * .4, 10, W * .3, H * .4, 200);
        ng.addColorStop(0, '#CE93D8'); ng.addColorStop(1, 'transparent');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(W * .3, H * .4, 200, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    function bgClassroom(t) {
        ctx.fillStyle = '#EFEBE9'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#D7CCC8'; ctx.fillRect(0, H * .78, W, H);
        // Board
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
        ctx.fillStyle = '#1B5E20'; ctx.fillRect(W * .08, H * .05, W * .84, H * .57);
        ctx.restore();
        ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 8; ctx.strokeRect(W * .08, H * .05, W * .84, H * .57);
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(W * .08, H * .62, W * .84, 10);
        // Lines on board
        ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
        for (var i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(W * .08, H * (.05 + i * .11)); ctx.lineTo(W * .92, H * (.05 + i * .11)); ctx.stroke(); }
    }

    function bgMinimal(t) {
        var g = ctx.createLinearGradient(0, 0, W * .2, H);
        g.addColorStop(0, '#1E293B'); g.addColorStop(1, '#0F172A');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // Geo dots
        ctx.fillStyle = 'rgba(148,163,184,.06)';
        for (var i = 0; i < 28; i++) {
            var px = (i * 137.5 + t * 6 * (i % 4 + 1)) % W, py = (i * 97.3 + sinW(t + i, .2, 20)) % H;
            ctx.beginPath(); ctx.arc(px, py, 1.5 + i % 2, 0, Math.PI * 2); ctx.fill();
        }
    }

    function selectBg(scene, domain) {
        var e = (scene.environment || '').toLowerCase();
        if (e === 'minimal') return bgMinimal;
        if (e === 'classroom') return bgClassroom;
        if (e === 'science') return bgScience;
        if (e === 'space') return bgSpace;
        if (e === 'nature') return bgNature;
        if (domain === 'solar_system' || domain === 'astronomy') return bgSpace;
        if (domain === 'electricity' || domain === 'physics') return bgScience;
        if (domain === 'geography') return bgNature;
        return bgNature; // default: friendly nature
    }

    /* ── Cloud shape ───────────────────────────────────────────────── */
    function drawCloud(cx, cy, s, col) {
        ctx.save(); ctx.globalAlpha = .82;
        ctx.shadowColor = 'rgba(0,0,0,.07)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
        ctx.fillStyle = col || '#fff';
        var r = 22 * s;
        [[0, 0, r], [r * .9, -r * .35, r * .85], [r * 1.85, r * .05, r * .9], [-r * .8, -r * .15, r * .72]].forEach(function (p) {
            ctx.beginPath(); ctx.arc(cx + p[0], cy + p[1], p[2], 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
    }

    /* ── Actor renderers ───────────────────────────────────────────── */
    // Each renderer receives (t=continuous time, m=motion object).
    // Canvas is already translated to actor.x, actor.y.

    var R = {};

    R.sun = R.star = function (a, t, m) {
        var r = (a.size || 54) * .5 * m.scale;
        // Outer glow
        ctx.save(); ctx.globalAlpha = .18 + sinW(t, .5, .06);
        var og = ctx.createRadialGradient(0, 0, r * .4, 0, 0, r * 2.6);
        og.addColorStop(0, 'rgba(255,235,59,.6)'); og.addColorStop(1, 'rgba(255,235,59,0)');
        ctx.fillStyle = og; ctx.beginPath(); ctx.arc(0, 0, r * 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Rays
        for (var k = 0; k < 12; k++) {
            var ang = (k / 12) * Math.PI * 2 + t * .8;
            var rLen = r * .38 + sinW(t + k * .5, 1.2, r * .1);
            ctx.strokeStyle = 'rgba(255,215,0,.8)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * (r + 1), Math.sin(ang) * (r + 1));
            ctx.lineTo(Math.cos(ang) * (r + rLen), Math.sin(ang) * (r + rLen));
            ctx.stroke();
        }
        // Body
        var bg = ctx.createRadialGradient(-r * .25, -r * .25, 0, 0, 0, r);
        bg.addColorStop(0, '#FFF9C4'); bg.addColorStop(.4, '#FFE000'); bg.addColorStop(.85, '#FFA000');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        // Face
        ctx.fillStyle = '#E65100';
        ctx.beginPath(); ctx.arc(-r * .28, -r * .14, r * .1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * .28, -r * .14, r * .1, 0, Math.PI * 2); ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,249,196,.45)';
        ctx.beginPath(); ctx.arc(-r * .26, -r * .16, r * .04, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * .3, -r * .16, r * .04, 0, Math.PI * 2); ctx.fill();
        // Smile
        ctx.strokeStyle = '#E65100'; ctx.lineWidth = r * .06; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, r * .09, r * .2, .18, Math.PI - .18); ctx.stroke();
    };

    R.plant = R.leaf = R.tree = function (a, t, m) {
        var sc = m.scale, sway = sinW(t, .7, 5);
        ctx.save(); ctx.scale(sc, sc);
        // Shadow
        ctx.save(); ctx.globalAlpha = .12;
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 12, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Stem
        ctx.strokeStyle = '#6D4C41'; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sway * 1.2, -38, sway, -80, sway * 1.5, -132); ctx.stroke();
        ctx.strokeStyle = '#A1887F'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-2, 0);
        ctx.bezierCurveTo(sway * 1.2 - 2, -38, sway - 2, -80, sway * 1.5 - 2, -132); ctx.stroke();
        // Leaves
        [[sway * .5 - 10, -78, -.55], [sway * .8 + 10, -100, .6, true]].forEach(function (l, i) {
            ctx.save(); ctx.translate(l[0], l[1]); ctx.rotate(l[2] * (l[3] ? -1 : 1));
            if (l[3]) ctx.scale(-1, 1);
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath(); ctx.moveTo(-48, 0);
            ctx.bezierCurveTo(-24, -22, 0, -10, 0, 0); ctx.bezierCurveTo(0, 10, -24, 22, -48, 0);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#1B5E20'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-48, 0); ctx.lineTo(-6, 0); ctx.stroke();
            ctx.restore();
        });
        // Crown
        ctx.save(); ctx.translate(sway * 1.4, -148);
        ctx.fillStyle = '#A5D6A7';
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 2; ctx.stroke();
        // Face
        ctx.fillStyle = '#1B5E20';
        ctx.beginPath(); ctx.arc(-7, -4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(7, -4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#1B5E20'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 3, 6, .2, Math.PI - .2); ctx.stroke();
        ctx.restore();
        ctx.restore();
    };

    R.water = R.waterdrop = function (a, t, m) {
        var r = (a.size || 38) * .42 * m.scale;
        ctx.save();
        // Shadow
        ctx.save(); ctx.globalAlpha = .12;
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(2, r + 4, r * .55, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Body
        ctx.fillStyle = a.color || '#29B6F6';
        ctx.beginPath(); ctx.moveTo(0, -r * 1.52);
        ctx.bezierCurveTo(r, -r * .3, r, r * .72, 0, r);
        ctx.bezierCurveTo(-r, r * .72, -r, -r * .3, 0, -r * 1.52);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#0288D1'; ctx.lineWidth = 1.6; ctx.stroke();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,.48)';
        ctx.beginPath(); ctx.ellipse(-r * .3, -r * .5, r * .22, r * .34, -.5, 0, Math.PI * 2); ctx.fill();
        // Face
        ctx.fillStyle = '#01579B';
        ctx.beginPath(); ctx.arc(-r * .25, r * .12, r * .1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * .25, r * .12, r * .1, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#01579B'; ctx.lineWidth = r * .08; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, r * .38, r * .18, .15, Math.PI - .15); ctx.stroke();
        ctx.restore();
    };

    R.co2 = function (a, t, m) {
        var r = (a.size || 38) * .48 * m.scale;
        ctx.save();
        ctx.fillStyle = 'rgba(207,216,220,.38)'; ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.22)';
        ctx.beginPath(); ctx.ellipse(-r * .3, -r * .3, r * .2, r * .14, -.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#455A64'; ctx.font = 'bold ' + Math.max(9, r * .58) + 'px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('CO\u2082', 0, 0);
        ctx.restore();
    };

    R.glucose = R.sugar = function (a, t, m) {
        var r = (a.size || 42) * .46 * m.scale;
        ctx.save();
        // Glow
        ctx.save(); ctx.globalAlpha = .28;
        var glow = ctx.createRadialGradient(0, 0, r * .5, 0, 0, r * 1.9);
        glow.addColorStop(0, 'rgba(255,143,0,.5)'); glow.addColorStop(1, 'rgba(255,143,0,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, r * 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Hex
        ctx.fillStyle = a.color || '#FF8F00'; ctx.strokeStyle = '#E65100'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (var i = 0; i < 6; i++) { var g = (i / 6) * Math.PI * 2 - Math.PI / 6; if (i == 0) ctx.moveTo(Math.cos(g) * r, Math.sin(g) * r); else ctx.lineTo(Math.cos(g) * r, Math.sin(g) * r); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFD54F'; ctx.globalAlpha = .5;
        ctx.beginPath();
        for (var j = 0; j < 6; j++) { var h = (j / 6) * Math.PI * 2 - Math.PI / 6, hr = r * .55; if (j == 0) ctx.moveTo(Math.cos(h) * hr, Math.sin(h) * hr); else ctx.lineTo(Math.cos(h) * hr, Math.sin(h) * hr); }
        ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFF'; ctx.font = 'bold ' + Math.max(8, r * .36) + 'px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('C\u2086H\u2081\u2082O\u2086', 0, 0);
        ctx.restore();
    };

    R.bolt = R.energy = R.lightning = function (a, t, m) {
        var s = (a.size || 40) * .48 * m.scale;
        ctx.save();
        ctx.save(); ctx.globalAlpha = .32 + sinW(t, 3, .15);
        ctx.shadowColor = '#CE93D8'; ctx.shadowBlur = 22;
        ctx.fillStyle = a.color || '#AB47BC';
        ctx.beginPath(); ctx.moveTo(s * .25, -s); ctx.lineTo(-s * .3, s * .1); ctx.lineTo(s * .08, s * .1);
        ctx.lineTo(-s * .25, s); ctx.lineTo(s * .38, -s * .05); ctx.lineTo(-s * .05, -s * .05);
        ctx.closePath(); ctx.fill(); ctx.restore();
        ctx.fillStyle = a.color || '#AB47BC';
        ctx.beginPath(); ctx.moveTo(s * .25, -s); ctx.lineTo(-s * .3, s * .1); ctx.lineTo(s * .08, s * .1);
        ctx.lineTo(-s * .25, s); ctx.lineTo(s * .38, -s * .05); ctx.lineTo(-s * .05, -s * .05);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#CE93D8'; ctx.globalAlpha = .5;
        ctx.beginPath(); ctx.moveTo(s * .1, -s * .8); ctx.lineTo(-s * .08, s * .05); ctx.lineTo(s * .04, s * .05); ctx.closePath(); ctx.fill();
        ctx.restore();
    };

    R.rock = function (a, t, m) {
        var r = (a.size || 42) * .52 * m.scale;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
        ctx.fillStyle = a.color || '#795548';
        ctx.beginPath(); ctx.moveTo(-r, r * .3); ctx.lineTo(-r * .62, -r); ctx.lineTo(r * .3, -r * .8);
        ctx.lineTo(r, r * .1); ctx.lineTo(r * .52, r); ctx.lineTo(-r * .52, r); ctx.closePath(); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-r * .4, -r * .3); ctx.lineTo(r * .2, r * .5); ctx.stroke();
    };

    R.planet = R.earth = function (a, t, m) {
        var r = (a.size || 44) * .52 * m.scale;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.15)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
        var bg = ctx.createRadialGradient(-r * .3, -r * .3, 0, 0, 0, r);
        bg.addColorStop(0, '#64B5F6'); bg.addColorStop(.7, a.color || '#42A5F5'); bg.addColorStop(1, '#1565C0');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        // Continent
        ctx.fillStyle = '#66BB6A'; ctx.globalAlpha = .4;
        ctx.beginPath(); ctx.ellipse(-r * .2, -r * .1, r * .36, r * .26, .3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(r * .3, r * .2, r * .2, r * .16, -.2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    };

    R.cloud = function (a, t, m) {
        var s = (a.size || 44) / 30 * m.scale;
        ctx.save(); ctx.globalAlpha = .88;
        drawCloud(0, 0, s, '#ffffff');
        ctx.restore();
    };

    R.root = function (a, t, m) {
        var grow = easeOut(clamp01(t * .6));
        ctx.save(); ctx.strokeStyle = a.color || '#5D4037'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        [[-38, 52], [-14, 57], [12, 62], [36, 52]].forEach(function (r) {
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r[0] * grow, r[1] * grow); ctx.stroke();
        });
        ctx.restore();
    };

    R.arrow = function (a, t, m) {
        var len = a.length || 120, ang = a.angle || 0;
        var dl = len * easeOut(clamp01(m.scale));
        var ex = Math.cos(ang) * dl, ey = Math.sin(ang) * dl;
        ctx.save();
        ctx.strokeStyle = a.color || '#2196F3'; ctx.lineWidth = a.thickness || 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = a.color || '#2196F3';
        ctx.beginPath();
        ctx.moveTo(ex - Math.cos(ang - .42) * 13, ey - Math.sin(ang - .42) * 13);
        ctx.lineTo(ex, ey);
        ctx.lineTo(ex - Math.cos(ang + .42) * 13, ey - Math.sin(ang + .42) * 13);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    };

    R.molecule = function (a, t, m) {
        var mt = ((a.moleculeType || (a.extra && a.extra.moleculeType)) || 'water').toLowerCase();
        if (mt === 'co2' || mt === 'carbon_dioxide') R.co2(a, t, m);
        else if (mt === 'glucose' || mt === 'sugar') R.glucose(a, t, m);
        else R.water(a, t, m);
    };

    R.o2 = R.oxygen = function (a, t, m) {
        var r = (a.size || 32) * .45 * m.scale;
        ctx.save();
        ctx.fillStyle = '#C8E6C9'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#66BB6A'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#2E7D32'; ctx.font = 'bold ' + Math.max(8, r * .72) + 'px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('O\u2082', 0, 0);
        ctx.restore();
    };

    R.cell = function (a, t, m) {
        var r = (a.size || 62) * .52 * m.scale;
        ctx.save();
        ctx.fillStyle = a.color || '#E8F5E9'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#388E3C'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#81C784'; ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.arc(r * .32, -r * .2, r * .16, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-r * .36, r * .26, r * .12, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = '#2E7D32';
        ctx.beginPath(); ctx.arc(0, 0, r * .38, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    R.line = function (a, t, m) {
        var x2 = (a.x2 != null ? a.x2 - a.x : 100), y2 = (a.y2 != null ? a.y2 - a.y : 0);
        ctx.save(); ctx.strokeStyle = a.color || '#2196F3'; ctx.lineWidth = a.thickness || 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
    };

    R.volcano = function (a, t, m) {
        var s = (a.size || 60) * .6 * m.scale;
        ctx.save();
        // Shape
        ctx.fillStyle = a.color || '#5D4037';
        ctx.beginPath(); ctx.moveTo(-s, -s * .1); ctx.lineTo(-s * .4, -s); ctx.lineTo(s * .4, -s); ctx.lineTo(s, -s * .1); ctx.lineTo(s * .8, s * .4); ctx.lineTo(-s * .8, s * .4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#4E342E'; ctx.lineWidth = 2; ctx.stroke();
        // Lava
        ctx.fillStyle = '#FF6D00'; ctx.globalAlpha = .8 + sinW(t, 2, .15);
        ctx.beginPath(); ctx.ellipse(0, -s, s * .35, s * .18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        // Particles
        for (var i = 0; i < 4; i++) {
            var px = sinW(t + i * 2, 2.5, s * .25), py = -s - Math.abs(sinW(t * 2 + i, 1.5, s * .3));
            ctx.fillStyle = '#FF3D00'; ctx.globalAlpha = .6;
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.restore();
    };

    R.mountain = function (a, t, m) {
        var s = (a.size || 60) * .7 * m.scale;
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 10;
        ctx.fillStyle = a.color || '#546E7A';
        ctx.beginPath(); ctx.moveTo(-s, s * .3); ctx.lineTo(0, -s); ctx.lineTo(s, s * .3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ECEFF1'; ctx.globalAlpha = .9;
        ctx.beginPath(); ctx.moveTo(-s * .2, -s * .5); ctx.lineTo(0, -s); ctx.lineTo(s * .2, -s * .5); ctx.closePath(); ctx.fill();
        ctx.restore();
    };

    R.label = function (a, t, m) {
        var txt = (a.text || '').trim();
        if (!txt) return;
        // Chemical shortcuts
        var lo = txt.toLowerCase().replace(/\s/g, '');
        if (/co2|co₂/.test(lo)) { R.co2(a, t, m); return; }
        if (/h2o|h₂o|water/.test(lo)) { R.water(a, t, m); return; }
        if (/glucose|c6h/.test(lo)) { R.glucose(a, t, m); return; }
        if (/energy|bolt|lightning/.test(lo)) { R.bolt(a, t, m); return; }
        // Text pill
        ctx.save();
        var fs = a.fontSize || 15;
        ctx.font = '600 ' + fs + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var tw = ctx.measureText(txt).width + 26, th = fs + 18;
        ctx.shadowColor = 'rgba(0,0,0,.12)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
        ctx.fillStyle = 'rgba(255,255,255,.93)';
        if (ctx.roundRect) ctx.roundRect(-tw / 2, -th / 2, tw, th, th / 2);
        else ctx.rect(-tw / 2, -th / 2, tw, th);
        ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(37,99,235,.18)'; ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-tw / 2, -th / 2, tw, th, th / 2); else ctx.rect(-tw / 2, -th / 2, tw, th);
        ctx.stroke();
        ctx.fillStyle = a.color || '#1E3A8A'; ctx.fillText(txt, 0, 0);
        ctx.restore();
    };

    // Fallback
    function drawFallback(type) {
        ctx.save(); ctx.fillStyle = '#78909C';
        ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#546E7A'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(type || '?', 0, 0);
        ctx.restore();
    }

    /* ── Auto-layout ────────────────────────────────────────────────── */
    function autoLayout(actors) {
        if (!actors || !actors.length) return;
        var needsLayout = actors.every(function (a) { return a.x == null && a.y == null; });
        if (!needsLayout) return;
        var n = actors.length, mx = 80, usable = W - mx * 2, cy = H * .42;
        if (n === 1) { actors[0].x = W / 2; actors[0].y = cy; }
        else {
            actors.forEach(function (a, i) {
                a.x = mx + usable * (i + .5) / n;
                a.y = cy + (i % 2) * 38 - 19;
            });
        }
    }

    /* ── Render actors ──────────────────────────────────────────────── */
    function renderActors(actors, elapsed, globalT) {
        if (!actors || !actors.length) return 0;
        var drawn = 0;
        actors.forEach(function (a, i) {
            if (!a) return;
            var type = (a.type || 'label').toLowerCase();
            var delay = i * 280;
            var base = fadeIn(elapsed, delay, 700);
            drawn++;
            var alpha = timelineAlpha(a, elapsed - delay, base) * ((resolveMotion(a, elapsed - delay, i * .9)).extraA);
            if (alpha < .005) return;
            var el2 = Math.max(0, elapsed - delay);
            var m = resolveMotion(a, el2, i * .9);
            var cx = a.x != null ? a.x : W / 2, cy = a.y != null ? a.y : H / 2;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(cx + m.ox, cy + m.oy);
            if (m.rot) ctx.rotate(m.rot);
            var fn = R[type];
            if (fn) fn(a, globalT + i * .8, m); else drawFallback(type);
            ctx.restore();
        });
        return drawn;
    }

    /* ── Text slide ─────────────────────────────────────────────────── */
    function renderSlide(text, elapsed) {
        var alpha = fadeIn(elapsed, 80, 600);
        if (alpha < .01) return;
        ctx.save(); ctx.globalAlpha = alpha;
        var cw = W * .66, ch = H * .4, cx = (W - cw) / 2, cy = (H - ch) / 2 - 8;
        ctx.shadowColor = 'rgba(0,0,0,.14)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
        ctx.fillStyle = 'rgba(255,255,255,.94)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(cx, cy, cw, ch, 22); else ctx.rect(cx, cy, cw, ch);
        ctx.fill(); ctx.shadowColor = 'transparent';
        // Accent bar
        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(cx, cy, cw, 5, [22, 22, 0, 0]); else ctx.fillRect(cx, cy, cw, 5);
        ctx.fill();
        // Text
        ctx.fillStyle = '#1E293B'; ctx.font = '700 19px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var words = text.split(' '), lines = [], line = '', maxW = cw - 52;
        words.forEach(function (w) {
            var test = line + (line ? ' ' : '') + w;
            if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
        });
        if (line) lines.push(line);
        var lh = 29, sy = cy + ch / 2 - (lines.length - 1) * lh / 2 + 4;
        lines.forEach(function (l, j) { ctx.fillText(l, W / 2, sy + j * lh); });
        ctx.restore();
    }

    /* ── Domain detect ─────────────────────────────────────────────── */
    var domain = 'generic';
    function detectDomain(s) {
        if (!s) return 'generic';
        var c = ((s.title || '') + ' ' + (s.scenes || []).map(function (x) { return x.text || '' }).join(' ')).toLowerCase();
        if (/photo|chloro|autotrop/.test(c)) return 'photosynthesis';
        if (/solar|planet|orbit|galaxy|asteroid/.test(c)) return 'solar_system';
        if (/electric|circuit|current|voltage/.test(c)) return 'electricity';
        if (/gravity|weight|newton|mass/.test(c)) return 'gravity';
        if (/water.?cycle|evaporat|condensat/.test(c)) return 'water_cycle';
        if (/volcano|igneous|sediment|metamorph/.test(c)) return 'rock_cycle';
        return 'generic';
    }

    /* ── Scene lookup ──────────────────────────────────────────────── */
    function getScene(t) {
        if (!script || !script.scenes || !script.scenes.length) return null;
        for (var i = script.scenes.length - 1; i >= 0; i--)
            if (t >= script.scenes[i].startTime) return { s: script.scenes[i], i: i };
        return { s: script.scenes[0], i: 0 };
    }

    /* ── Main draw ─────────────────────────────────────────────────── */
    function draw() {
        if (!script) return;
        var sr = getScene(currentTime); if (!sr) return;
        var scene = sr.s, idx = sr.i;
        var elapsed = Math.max(0, currentTime - (scene.startTime || 0));
        var gT = elapsed * .001; // global time seconds

        // Scene crossfade
        if (idx !== prevScene) { sceneAlpha = 0; prevScene = idx; }
        sceneAlpha = Math.min(1, sceneAlpha + .065);

        ctx.clearRect(0, 0, W, H);
        ctx.save(); ctx.globalAlpha = sceneAlpha;

        // Background
        selectBg(scene, domain)(gT);

        // Auto-layout actors if no positions given
        autoLayout(scene.actors);

        // Actors
        var drawn = renderActors(scene.actors || [], elapsed, gT);

        // Empty scene → text slide
        if (drawn === 0) {
            if (scene.text) renderSlide(scene.text, elapsed);
            else {
                ctx.save(); ctx.globalAlpha = .14 + sinW(gT, .9, .07);
                ctx.fillStyle = '#94A3B8'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 26, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }

        ctx.restore();
    }

    /* ── Playback loop ─────────────────────────────────────────────── */
    function loop(ts) {
        rafId = requestAnimationFrame(loop);
        if (isPlaying && script && lastTS != null) {
            currentTime = Math.min(currentTime + (ts - lastTS), (script.duration || 0));
            if (currentTime >= (script.duration || 0)) {
                isPlaying = false;
                post({ completed: true });
            }
        }
        lastTS = isPlaying ? ts : null;
        draw();
    }

    /* ── Normalizer ─────────────────────────────────────────────────── */
    function normalize(raw) {
        if (!raw) return null;
        var s = Object.assign({}, raw);
        s.title = s.title || 'Untitled'; s.scenes = Array.isArray(s.scenes) ? s.scenes : [];
        var ta = 0;
        s.scenes = s.scenes.map(function (sc, i) {
            sc = Object.assign({}, sc);
            sc.id = sc.id || ('scene_' + i);
            sc.duration = (typeof sc.duration === 'number' && sc.duration > 0) ? sc.duration : 5000;
            sc.startTime = (typeof sc.startTime === 'number' && sc.startTime >= 0) ? sc.startTime : ta;
            sc.text = sc.text || ''; sc.environment = sc.environment || '';
            sc.actors = Array.isArray(sc.actors) ? sc.actors.map(function (a, j) {
                a = Object.assign({}, a);
                a.type = (a.type || 'label').toLowerCase().trim();
                a.animation = a.animation || 'idle';
                a.timeline = Array.isArray(a.timeline) ? a.timeline : [];
                return a;
            }) : [];
            ta = sc.startTime + sc.duration; return sc;
        });
        if (!s.scenes.length) { s.scenes = [{ id: 'fb', startTime: 0, duration: 5000, text: s.title, actors: [], environment: 'minimal' }]; ta = 5000; }
        var comp = s.scenes.reduce(function (m, sc) { return Math.max(m, sc.startTime + sc.duration); }, 0);
        s.duration = (typeof s.duration === 'number' && s.duration > 0) ? Math.max(s.duration, comp) : comp;
        return s;
    }

    /* ── Message handler ────────────────────────────────────────────── */
    window.__animationUpdate = function (payload) {
        try {
            var d = typeof payload === 'string' ? JSON.parse(payload) : payload;
            if (!d) return;
            if (d.type === 'init') {
                script = normalize(d.script || script);
                domain = detectDomain(script);
                isPlaying = d.isPlaying != null ? !!d.isPlaying : false;
                currentTime = typeof d.currentTimeMs === 'number' ? Math.max(0, Math.min(d.currentTimeMs, (script && script.duration) || 0)) : 0;
                lastTS = null; prevScene = -1; sceneAlpha = 1;
                post({ debug: 'Init ok: scenes=' + (script ? script.scenes.length : 0) + ' domain=' + domain });
            } else if (d.type === 'play' || d.isPlaying != null) {
                isPlaying = !!d.isPlaying; if (!isPlaying) lastTS = null;
            } else if (d.type === 'seek' && d.time != null) {
                currentTime = Math.max(0, Math.min(d.time, (script && script.duration) || 0));
            }
        } catch (err) { post({ debug: 'Error: ' + (err.message || err) }); }
    };

    // Start loop immediately
    loop(performance.now());
    post({ ready: true });
})();

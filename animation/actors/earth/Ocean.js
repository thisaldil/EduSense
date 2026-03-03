/**
 * Ocean Actor
 * Draws water bodies with waves
 */
import { applyEasing } from '../../utils/easing';

export class Ocean {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const width = actor.width || 400;
        const height = actor.height || 200;
        const color = actor.color || '#2196F3';

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Appear animation
        if (animation === 'appear') {
            ctx.save();
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(1, scale);
            ctx.translate(-x, -y);
            ctx.restore();
        }

        // Idle subtle ripple
        if (animation === 'idle') {
            const rippleOffset = Math.sin(progress * Math.PI * 2) * 5;
            ctx.translate(0, rippleOffset);
        }

        // Draw ocean body with enhanced gradient
        const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
        bodyGradient.addColorStop(0, this.lightenColor(color, 0.3)); // Brighter surface
        bodyGradient.addColorStop(0.5, color);
        bodyGradient.addColorStop(1, this.darkenColor(color, 0.4)); // Deeper blue

        ctx.fillStyle = bodyGradient;
        ctx.fillRect(x, y, width, height);

        // Surface highlight (reflection)
        const surfaceGradient = ctx.createLinearGradient(x, y, x + width, y);
        surfaceGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        surfaceGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
        surfaceGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = surfaceGradient;
        ctx.fillRect(x, y, width, height * 0.1);

        // Reset shadow for waves to avoid blurring lines
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw waves with enhanced layers
        const waveOffset = (animation === 'wave' || animation === 'idle') ? progress * 50 : 0;

        // Wave lines with varying opacity and width
        for (let layer = 0; layer < 3; layer++) {
            const waveY = y + (layer * height / 4) + 20;
            const amplitude = 12 - layer * 3;
            const frequency = 0.015 + layer * 0.005;
            const opacity = 0.4 - layer * 0.1;

            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 1.5 + layer * 0.5;
            ctx.lineCap = 'round';

            ctx.beginPath();
            for (let i = 0; i <= width; i += 3) {
                const waveX = x + i;
                const wave = Math.sin((i + waveOffset) * frequency) * amplitude;

                if (i === 0) {
                    ctx.moveTo(waveX, waveY + wave);
                } else {
                    ctx.lineTo(waveX, waveY + wave);
                }
            }
            ctx.stroke();
        }

        // Add foam/whitecaps with animation
        if (animation === 'wave' || animation === 'idle') {
            const foamAlpha = 0.4 + Math.sin(progress * Math.PI * 3) * 0.2;
            ctx.fillStyle = `rgba(255, 255, 255, ${foamAlpha})`;
            for (let i = 0; i < 6; i++) {
                const foamX = x + (i * width / 6) + Math.sin(progress * Math.PI * 4 + i * Math.PI / 3) * 15;
                const foamY = y + 25 + Math.cos(progress * Math.PI * 2 + i) * 5;
                const foamSize = 6 + Math.sin(progress * Math.PI * 6 + i) * 3;

                ctx.beginPath();
                ctx.arc(foamX, foamY, foamSize, 0, Math.PI * 2);
                ctx.fill();

                // Foam highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(foamX - 2, foamY - 2, foamSize * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Add sparkles on water surface (deterministic with animation)
        const sparkleAlphaBase = 0.6;
        for (let i = 0; i < 8; i++) {
            // Deterministic positioning based on index
            const seedX = ((i * 13 + 7) % 100) / 100;
            const seedY = ((i * 17 + 11) % 100) / 100;
            const sparkleX = x + seedX * width;
            const sparkleY = y + seedY * 40;
            const sparkleAlpha = sparkleAlphaBase * Math.abs(Math.sin(progress * Math.PI * 4 + i));

            ctx.globalAlpha = sparkleAlpha;
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 4;

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Sparkle glow
            const sparkleGlow = ctx.createRadialGradient(sparkleX, sparkleY, 0, sparkleX, sparkleY, 5);
            sparkleGlow.addColorStop(0, `rgba(255, 255, 255, ${sparkleAlpha})`);
            sparkleGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = sparkleGlow;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;

        ctx.restore();
    }

    // Helper methods for color manipulation (updated to hex)
    static lightenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    static darkenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) - amt > 0 ? (num >> 16) - amt : 0;
        const G = (num >> 8 & 0x00FF) - amt > 0 ? (num >> 8 & 0x00FF) - amt : 0;
        const B = (num & 0x0000FF) - amt > 0 ? (num & 0x0000FF) - amt : 0;
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}
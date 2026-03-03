// ============================================
// SUN.JS - Enhanced Version
// ============================================

/**
 * Sun Actor - Enhanced with corona, solar flares, and dynamic rays
 */
import { applyEasing } from '../../utils/easing';

export class Sun {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const radius = actor.size || 60;

        ctx.save();

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Pulse animation
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 2) * 0.08;
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);
        }

        // Outer corona (largest glow)
        const coronaGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
        coronaGrad.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
        coronaGrad.addColorStop(0.3, 'rgba(255, 180, 0, 0.2)');
        coronaGrad.addColorStop(0.6, 'rgba(255, 150, 0, 0.1)');
        coronaGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Middle glow layer
        const midGlowGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.8);
        midGlowGrad.addColorStop(0, 'rgba(255, 235, 0, 0.6)');
        midGlowGrad.addColorStop(0.5, 'rgba(255, 200, 0, 0.4)');
        midGlowGrad.addColorStop(1, 'rgba(255, 165, 0, 0)');
        ctx.fillStyle = midGlowGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Main sun body with enhanced gradient
        const sunGrad = ctx.createRadialGradient(
            x - radius * 0.2, y - radius * 0.2, 0, x, y, radius
        );
        sunGrad.addColorStop(0, '#FFFDE7');
        sunGrad.addColorStop(0.2, '#FFEB3B');
        sunGrad.addColorStop(0.5, '#FFD700');
        sunGrad.addColorStop(0.8, '#FFA726');
        sunGrad.addColorStop(1, '#FF6F00');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Surface texture (granulation)
        ctx.fillStyle = 'rgba(255, 160, 0, 0.15)';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 0.3 + (i % 3) * 0.15;
            const grainSize = radius * (0.08 + (i % 2) * 0.05);
            ctx.beginPath();
            ctx.arc(
                x + Math.cos(angle) * radius * dist,
                y + Math.sin(angle) * radius * dist,
                grainSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Bright center
        const centerGrad = ctx.createRadialGradient(
            x - radius * 0.2, y - radius * 0.2, 0,
            x, y, radius * 0.4
        );
        centerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        centerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        centerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Dynamic rays with animation
        if (animation === 'shine' || animation === 'pulse') {
            const rayCount = 12;
            const rayProgress = animation === 'shine' ? progress :
                (Math.sin(progress * Math.PI * 2) + 1) / 2;

            for (let i = 0; i < rayCount; i++) {
                const angle = (i / rayCount) * Math.PI * 2;
                const rayLength = 20 + Math.sin(rayProgress * Math.PI * 2 + i) * 10;

                const rayGrad = ctx.createLinearGradient(
                    x + Math.cos(angle) * radius,
                    y + Math.sin(angle) * radius,
                    x + Math.cos(angle) * (radius + rayLength),
                    y + Math.sin(angle) * (radius + rayLength)
                );
                rayGrad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
                rayGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
                rayGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');

                ctx.strokeStyle = rayGrad;
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(
                    x + Math.cos(angle) * radius,
                    y + Math.sin(angle) * radius
                );
                ctx.lineTo(
                    x + Math.cos(angle) * (radius + rayLength),
                    y + Math.sin(angle) * (radius + rayLength)
                );
                ctx.stroke();
            }

            // Solar flares (smaller rays between main rays)
            ctx.lineWidth = 3;
            for (let i = 0; i < rayCount; i++) {
                const angle = (i / rayCount) * Math.PI * 2 + Math.PI / rayCount;
                const flareLength = 12 + Math.sin(rayProgress * Math.PI * 3 + i) * 6;

                ctx.strokeStyle = 'rgba(255, 180, 0, 0.6)';
                ctx.beginPath();
                ctx.moveTo(
                    x + Math.cos(angle) * (radius + 3),
                    y + Math.sin(angle) * (radius + 3)
                );
                ctx.lineTo(
                    x + Math.cos(angle) * (radius + flareLength),
                    y + Math.sin(angle) * (radius + flareLength)
                );
                ctx.stroke();
            }
        }

        ctx.restore();
    }
}

// ============================================
// MOON.JS - Enhanced Version
// ============================================

/**
 * Moon Actor - Enhanced with realistic craters and phases
 */
import { applyEasing } from '../../utils/easing';

export class Moon {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const radius = actor.size || 40;
        const phase = actor.phase || 'full';

        ctx.save();

        // Animations
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        if (animation === 'orbit') {
            const angle = progress * Math.PI * 2;
            const orbitRadius = 150;
            ctx.translate(
                Math.cos(angle) * orbitRadius,
                Math.sin(angle) * orbitRadius
            );
        }

        // Shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(x + 2, y + 2, radius, radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Moon surface gradient
        const moonGrad = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0, x, y, radius
        );
        moonGrad.addColorStop(0, '#FAFAFA');
        moonGrad.addColorStop(0.3, '#F5F5F5');
        moonGrad.addColorStop(0.7, '#E0E0E0');
        moonGrad.addColorStop(1, '#9E9E9E');

        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Enhanced craters with depth
        const craters = [
            { x: 0.2, y: -0.1, size: 0.15 },
            { x: -0.3, y: 0.2, size: 0.12 },
            { x: -0.1, y: -0.3, size: 0.1 },
            { x: 0.3, y: 0.3, size: 0.08 },
            { x: 0.4, y: -0.2, size: 0.06 },
            { x: -0.35, y: -0.15, size: 0.07 }
        ];

        craters.forEach(crater => {
            const cx = x + radius * crater.x;
            const cy = y + radius * crater.y;
            const cSize = radius * crater.size;

            // Crater depression
            const craterGrad = ctx.createRadialGradient(
                cx, cy, 0, cx, cy, cSize
            );
            craterGrad.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            craterGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
            craterGrad.addColorStop(1, 'rgba(0, 0, 0, 0.05)');

            ctx.fillStyle = craterGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, cSize, 0, Math.PI * 2);
            ctx.fill();

            // Crater rim highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(cx - cSize * 0.2, cy - cSize * 0.2, cSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Maria (dark plains)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.2, y + radius * 0.1,
            radius * 0.25, radius * 0.3, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Apply moon phase
        if (phase !== 'full') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.globalCompositeOperation = 'source-atop';

            if (phase === 'new') {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (phase === 'crescent') {
                ctx.beginPath();
                ctx.arc(x + radius * 0.3, y, radius * 0.9, 0, Math.PI * 2);
                ctx.fill();
            } else if (phase === 'half') {
                ctx.fillRect(x, y - radius, radius, radius * 2);
            } else if (phase === 'gibbous') {
                ctx.beginPath();
                ctx.arc(x + radius * 0.5, y, radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = 'source-over';
        }

        // Highlight
        const highlightGrad = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x - radius * 0.3, y - radius * 0.3, radius * 0.5
        );
        highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
        highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        if (animation === 'glow' || phase === 'full') {
            const glowGrad = ctx.createRadialGradient(
                x, y, radius, x, y, radius + 15
            );
            glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            glowGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
            glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(x, y, radius + 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}
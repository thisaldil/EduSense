/**
 * Star Actor
 * Draws twinkling stars
 */
import { applyEasing } from '../../utils/easing';

export class Star {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 5;
        const points = actor.points || 5;
        const color = actor.color || '#FFFF00';

        ctx.save();

        // Twinkle animation
        let alpha = 1;
        if (animation === 'twinkle') {
            alpha = 0.3 + Math.abs(Math.sin(progress * Math.PI * 4)) * 0.7;
        }
        ctx.globalAlpha = alpha;

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Draw star
        ctx.fillStyle = color;
        ctx.beginPath();

        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? size : size / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();
        ctx.fill();

        // Add glow
        if (animation === 'glow' || animation === 'twinkle') {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Add sparkle effect
        if (animation === 'sparkle') {
            const sparkleAlpha = Math.abs(Math.sin(progress * Math.PI * 8));
            ctx.globalAlpha = sparkleAlpha;
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;

            // Draw cross sparkle
            ctx.beginPath();
            ctx.moveTo(x - size * 1.5, y);
            ctx.lineTo(x + size * 1.5, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y - size * 1.5);
            ctx.lineTo(x, y + size * 1.5);
            ctx.stroke();
        }

        // Pulse animation
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.3;
            ctx.globalAlpha = 1;
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);
            ctx.fill();
        }

        ctx.restore();
    }
}
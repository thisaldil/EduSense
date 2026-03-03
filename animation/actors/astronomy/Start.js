// ============================================
// STAR.JS - Enhanced Version
// ============================================

/**
 * Star Actor - Enhanced with better twinkle and sparkle effects
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

        // Pulse animation
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.3;
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);
        }

        // Outer glow
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
        glowGrad.addColorStop(0, color + 'AA');
        glowGrad.addColorStop(0.5, color + '55');
        glowGrad.addColorStop(1, color + '00');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw star shape with gradient
        const starGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
        starGrad.addColorStop(0, '#FFFFFF');
        starGrad.addColorStop(0.5, color);
        starGrad.addColorStop(1, color);

        ctx.fillStyle = starGrad;
        ctx.beginPath();

        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
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

        // Add glow effect
        if (animation === 'glow' || animation === 'twinkle') {
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Sparkle effect
        if (animation === 'sparkle') {
            const sparkleAlpha = Math.abs(Math.sin(progress * Math.PI * 8));
            ctx.globalAlpha = sparkleAlpha;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';

            // Horizontal sparkle line
            ctx.beginPath();
            ctx.moveTo(x - size * 2, y);
            ctx.lineTo(x + size * 2, y);
            ctx.stroke();

            // Vertical sparkle line
            ctx.beginPath();
            ctx.moveTo(x, y - size * 2);
            ctx.lineTo(x, y + size * 2);
            ctx.stroke();

            // Diagonal sparkle lines
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - size * 1.4, y - size * 1.4);
            ctx.lineTo(x + size * 1.4, y + size * 1.4);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + size * 1.4, y - size * 1.4);
            ctx.lineTo(x - size * 1.4, y + size * 1.4);
            ctx.stroke();
        }

        ctx.restore();
    }
}
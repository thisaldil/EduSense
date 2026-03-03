/**
 * Proton Actor
 * Draws positively charged particles in the atomic nucleus
 */
import { applyEasing } from '../../utils/easing';

export class Proton {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const radius = actor.size || 4;
        const color = actor.color || '#FF4500'; // Red for positive charge

        ctx.save();

        // Vibrate animation (for nucleus particles)
        if (animation === 'vibrate' || !animation) {
            const vibrateX = Math.sin(progress * Math.PI * 10) * 1;
            const vibrateY = Math.cos(progress * Math.PI * 8) * 1;
            ctx.translate(x + vibrateX, y + vibrateY);
        }

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Inner glow for proton
        const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        innerGlow.addColorStop(0, color);
        innerGlow.addColorStop(0.7, 'rgba(255, 69, 0, 0.6)');
        innerGlow.addColorStop(1, 'rgba(255, 69, 0, 0)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core particle with border
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD700'; // Gold border for charge
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulse animation
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.15;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);
        }

        ctx.restore();
    }
}
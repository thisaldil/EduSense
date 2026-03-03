/**
 * Electron Actor
 * Draws small negatively charged particles with orbital motion
 */
import { applyEasing } from '../../utils/easing';

export class Electron {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const radius = actor.size || 3;
        const color = actor.color || '#00BFFF'; // Blue for negative charge
        const orbitRadius = actor.orbitRadius || 50;

        ctx.save();

        // Orbital animation (default for electrons)
        if (animation === 'orbit' || !animation) {
            const angle = progress * Math.PI * 4; // Fast orbit
            const orbitX = x + Math.cos(angle) * orbitRadius;
            const orbitY = y + Math.sin(angle) * orbitRadius;
            ctx.translate(orbitX, orbitY);
        }

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Glow effect for electron
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
        glowGradient.addColorStop(0, color);
        glowGradient.addColorStop(0.5, 'rgba(0, 191, 255, 0.5)');
        glowGradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Spin animation (subtle rotation with trail)
        if (animation === 'spin') {
            ctx.rotate(progress * Math.PI * 8);
        }

        // Pulse animation
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 6) * 0.2;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);
        }

        ctx.restore();
    }
}
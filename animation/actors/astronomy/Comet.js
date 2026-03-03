// ============================================
// COMET ACTOR
// ============================================

/**
 * Comet Actor
 * Draws comets with spectacular glowing tails
 */
export class Comet {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 15;
        const tailLength = actor.tailLength || 150;
        const angle = actor.angle || -Math.PI / 4;
        const color = actor.color || '#4FC3F7';

        ctx.save();

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Move animation
        if (animation === 'move') {
            const distance = 200;
            const moveX = Math.cos(angle) * distance * progress;
            const moveY = Math.sin(angle) * distance * progress;
            ctx.translate(moveX, moveY);
        }

        // Streak animation
        if (animation === 'streak') {
            const streakProgress = applyEasing(progress, 'easeIn');
            const moveX = Math.cos(angle) * 400 * streakProgress;
            const moveY = Math.sin(angle) * 400 * streakProgress;
            ctx.translate(moveX, moveY);
        }

        const tailAngle = angle + Math.PI;

        // Multi-layered tail for more spectacular effect
        // Outer tail (widest, most transparent)
        const outerGradient = ctx.createLinearGradient(
            x,
            y,
            x + Math.cos(tailAngle) * tailLength * 1.2,
            y + Math.sin(tailAngle) * tailLength * 1.2
        );
        outerGradient.addColorStop(0, 'rgba(135, 206, 250, 0.3)');
        outerGradient.addColorStop(0.5, 'rgba(100, 180, 250, 0.15)');
        outerGradient.addColorStop(1, 'rgba(100, 180, 250, 0)');

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        const outerWidth = size * 3;
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + Math.cos(tailAngle - 0.25) * outerWidth,
            y + Math.sin(tailAngle - 0.25) * outerWidth
        );
        ctx.lineTo(
            x + Math.cos(tailAngle) * tailLength * 1.2,
            y + Math.sin(tailAngle) * tailLength * 1.2
        );
        ctx.lineTo(
            x + Math.cos(tailAngle + 0.25) * outerWidth,
            y + Math.sin(tailAngle + 0.25) * outerWidth
        );
        ctx.closePath();
        ctx.fill();

        // Middle tail
        const midGradient = ctx.createLinearGradient(
            x,
            y,
            x + Math.cos(tailAngle) * tailLength,
            y + Math.sin(tailAngle) * tailLength
        );
        midGradient.addColorStop(0, 'rgba(135, 206, 250, 0.6)');
        midGradient.addColorStop(0.4, 'rgba(135, 206, 250, 0.3)');
        midGradient.addColorStop(1, 'rgba(135, 206, 250, 0)');

        ctx.fillStyle = midGradient;
        ctx.beginPath();
        const midWidth = size * 2.2;
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + Math.cos(tailAngle - 0.2) * midWidth,
            y + Math.sin(tailAngle - 0.2) * midWidth
        );
        ctx.lineTo(
            x + Math.cos(tailAngle) * tailLength,
            y + Math.sin(tailAngle) * tailLength
        );
        ctx.lineTo(
            x + Math.cos(tailAngle + 0.2) * midWidth,
            y + Math.sin(tailAngle + 0.2) * midWidth
        );
        ctx.closePath();
        ctx.fill();

        // Inner tail (brightest)
        const innerGradient = ctx.createLinearGradient(
            x,
            y,
            x + Math.cos(tailAngle) * tailLength * 0.8,
            y + Math.sin(tailAngle) * tailLength * 0.8
        );
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        innerGradient.addColorStop(0.3, 'rgba(135, 206, 250, 0.6)');
        innerGradient.addColorStop(1, 'rgba(135, 206, 250, 0)');

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        const innerWidth = size * 1.5;
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + Math.cos(tailAngle - 0.15) * innerWidth,
            y + Math.sin(tailAngle - 0.15) * innerWidth
        );
        ctx.lineTo(
            x + Math.cos(tailAngle) * tailLength * 0.8,
            y + Math.sin(tailAngle) * tailLength * 0.8
        );
        ctx.lineTo(
            x + Math.cos(tailAngle + 0.15) * innerWidth,
            y + Math.sin(tailAngle + 0.15) * innerWidth
        );
        ctx.closePath();
        ctx.fill();

        // Outer glow halo
        const haloGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        haloGradient.addColorStop(0, 'rgba(135, 206, 250, 0.4)');
        haloGradient.addColorStop(0.5, 'rgba(135, 206, 250, 0.2)');
        haloGradient.addColorStop(1, 'rgba(135, 206, 250, 0)');
        ctx.fillStyle = haloGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Comet nucleus with enhanced gradient
        const nucleusGradient = ctx.createRadialGradient(
            x - size * 0.3,
            y - size * 0.3,
            0,
            x,
            y,
            size * 1.2
        );
        nucleusGradient.addColorStop(0, '#FFFFFF');
        nucleusGradient.addColorStop(0.2, '#E3F2FD');
        nucleusGradient.addColorStop(0.5, color);
        nucleusGradient.addColorStop(1, '#1565C0');

        ctx.fillStyle = nucleusGradient;
        ctx.shadowColor = color;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Main nucleus body
        ctx.fillStyle = nucleusGradient;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bright inner core
        const coreGradient = ctx.createRadialGradient(
            x - size * 0.2,
            y - size * 0.2,
            0,
            x,
            y,
            size * 0.5
        );
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
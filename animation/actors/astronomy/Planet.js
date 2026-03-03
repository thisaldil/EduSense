// ============================================
// PLANET.JS - Enhanced Version
// ============================================

/**
 * Planet Actor - Enhanced with spectacular rings and atmosphere
 */
import { applyEasing } from '../../utils/easing';

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
    const b = Math.min(255, (num & 0x0000FF) + percent);
    return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
    const b = Math.max(0, (num & 0x0000FF) - percent);
    return `rgb(${r}, ${g}, ${b})`;
}

export class Planet {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const radius = actor.size || 40;
        const color = actor.color || '#4A90E2';
        const hasRings = actor.rings !== false;
        const ringColor = actor.ringColor || '#D4A574';

        ctx.save();

        // Animations
        if (animation === 'orbit') {
            ctx.translate(x, y);
            ctx.rotate(progress * Math.PI * 2);
            ctx.translate(-x, -y);
        }

        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(x + 2, y + 2, radius, radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw back rings first (if enabled)
        if (hasRings) {
            const backRingGrad = ctx.createLinearGradient(
                x - radius * 1.8, y, x + radius * 1.8, y
            );
            backRingGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            backRingGrad.addColorStop(0.2, darkenColor(ringColor, 40));
            backRingGrad.addColorStop(0.5, darkenColor(ringColor, 30));
            backRingGrad.addColorStop(0.8, darkenColor(ringColor, 40));
            backRingGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.strokeStyle = backRingGrad;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(x, y, radius * 1.5, radius * 0.3, 0, Math.PI, Math.PI * 2);
            ctx.stroke();

            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(x, y, radius * 1.8, radius * 0.4, 0, Math.PI, Math.PI * 2);
            ctx.stroke();
        }

        // Planet body with gradient
        const planetGrad = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0, x, y, radius
        );
        planetGrad.addColorStop(0, lightenColor(color, 50));
        planetGrad.addColorStop(0.3, lightenColor(color, 30));
        planetGrad.addColorStop(0.7, color);
        planetGrad.addColorStop(1, darkenColor(color, 30));

        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Atmospheric bands (for gas giants)
        if (hasRings) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.ellipse(x, y - radius * 0.3, radius * 0.9, radius * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = darkenColor(color, 10) + '33';
            ctx.beginPath();
            ctx.ellipse(x, y + radius * 0.2, radius * 0.9, radius * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Highlight
        const highlightGrad = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x - radius * 0.3, y - radius * 0.3, radius * 0.5
        );
        highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        ctx.ellipse(
            x - radius * 0.3, y - radius * 0.3,
            radius * 0.4, radius * 0.3, 0, 0, Math.PI * 2
        );
        ctx.fill();

        // Draw front rings (if enabled)
        if (hasRings) {
            const frontRingGrad = ctx.createLinearGradient(
                x - radius * 1.8, y, x + radius * 1.8, y
            );
            frontRingGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            frontRingGrad.addColorStop(0.2, lightenColor(ringColor, 20));
            frontRingGrad.addColorStop(0.5, ringColor);
            frontRingGrad.addColorStop(0.8, lightenColor(ringColor, 20));
            frontRingGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.strokeStyle = frontRingGrad;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(x, y, radius * 1.5, radius * 0.3, 0, 0, Math.PI);
            ctx.stroke();

            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(x, y, radius * 1.8, radius * 0.4, 0, 0, Math.PI);
            ctx.stroke();

            // Ring highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(x, y, radius * 1.5, radius * 0.3, 0, -0.5, 0.5);
            ctx.stroke();
        }

        // Atmospheric glow
        const glowGrad = ctx.createRadialGradient(
            x, y, radius, x, y, radius + 12
        );
        glowGrad.addColorStop(0, color + '40');
        glowGrad.addColorStop(0.5, color + '20');
        glowGrad.addColorStop(1, color + '00');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius + 12, 0, Math.PI * 2);
        ctx.fill();

        // Pulse animation
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.15;
            const pulseAlpha = 0.4 + Math.sin(progress * Math.PI * 4) * 0.2;

            ctx.strokeStyle = color + Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(x, y, radius * pulseScale + 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    static lightenColor = lightenColor;
    static darkenColor = darkenColor;
}
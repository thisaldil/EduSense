/**
 * Leaf Actor
 * Draws individual leaves
 */
import { applyEasing } from '../../utils/easing';

export class Leaf {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const size = actor.size || 30;
        const color = actor.color || '#4CAF50';
        const angle = actor.angle || 0;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Appear animation
        if (animation === 'appear') {
            ctx.save();
            const scale = applyEasing(progress, 'easeOut');
            ctx.scale(scale, scale);
            ctx.restore();
        }

        // Fall animation
        if (animation === 'fall') {
            ctx.save();
            const fallY = progress * 150;
            const swayX = Math.sin(progress * Math.PI * 4) * 30;
            ctx.translate(swayX, fallY);
            ctx.rotate(progress * Math.PI * 2);
            ctx.restore();
        }

        // Sway animation
        if (animation === 'sway') {
            ctx.save();
            const swayAngle = Math.sin(progress * Math.PI * 2) * 0.2;
            ctx.rotate(swayAngle);
            ctx.restore();
        }

        // Global shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw leaf shape with linear gradient for depth
        const leafGradient = ctx.createLinearGradient(0, -size, 0, size);
        leafGradient.addColorStop(0, this.lightenColor(color, 0.3)); // Lighter tip
        leafGradient.addColorStop(0.7, color);
        leafGradient.addColorStop(1, this.darkenColor(color, 0.2)); // Darker base
        ctx.fillStyle = leafGradient;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.bezierCurveTo(size * 0.6, -size * 0.8, size * 0.8, -size * 0.3, size, 0);
        ctx.bezierCurveTo(size * 0.8, size * 0.3, size * 0.6, size * 0.8, 0, size);
        ctx.bezierCurveTo(-size * 0.6, size * 0.8, -size * 0.8, size * 0.3, -size, 0);
        ctx.bezierCurveTo(-size * 0.8, -size * 0.3, -size * 0.6, -size * 0.8, 0, -size);
        ctx.closePath();
        ctx.fill();

        // Reset shadow for veins to avoid blurring lines
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Add vein (midrib) with gradient stroke
        const midribGradient = ctx.createLinearGradient(0, -size, 0, size);
        midribGradient.addColorStop(0, this.darkenColor(color, 0.4));
        midribGradient.addColorStop(1, this.darkenColor(color, 0.6));
        ctx.strokeStyle = midribGradient;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();

        // Midrib highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -size + 0.5);
        ctx.lineTo(0, size - 0.5);
        ctx.stroke();

        // Add side veins with gradient strokes
        ctx.lineWidth = 1.2;
        for (let i = -0.7; i <= 0.7; i += 0.3) {
            // Right vein
            const rightGradient = ctx.createLinearGradient(0, i * size, size * 0.5, i * size * 0.8);
            rightGradient.addColorStop(0, this.darkenColor(color, 0.3));
            rightGradient.addColorStop(1, this.darkenColor(color, 0.5));
            ctx.strokeStyle = rightGradient;
            ctx.beginPath();
            ctx.moveTo(0, i * size);
            ctx.quadraticCurveTo(size * 0.2, i * size * 0.5, size * 0.5, i * size * 0.8);
            ctx.stroke();

            // Left vein
            const leftGradient = ctx.createLinearGradient(0, i * size, -size * 0.5, i * size * 0.8);
            leftGradient.addColorStop(0, this.darkenColor(color, 0.3));
            leftGradient.addColorStop(1, this.darkenColor(color, 0.5));
            ctx.strokeStyle = leftGradient;
            ctx.beginPath();
            ctx.moveTo(0, i * size);
            ctx.quadraticCurveTo(-size * 0.2, i * size * 0.5, -size * 0.5, i * size * 0.8);
            ctx.stroke();
        }

        // Enhanced highlight with radial gradient
        const highlightGradient = ctx.createRadialGradient(-size * 0.3, -size * 0.4, 0, -size * 0.3, -size * 0.4, size * 0.3);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.ellipse(-size * 0.3, -size * 0.4, size * 0.3, size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Subtle leaf edge glow for sway animation
        if (animation === 'sway') {
            const glowAlpha = 0.2 + Math.sin(progress * Math.PI * 2) * 0.1;
            ctx.strokeStyle = `rgba(76, 175, 80, ${glowAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.bezierCurveTo(size * 0.6, -size * 0.8, size * 0.8, -size * 0.3, size, 0);
            ctx.bezierCurveTo(size * 0.8, size * 0.3, size * 0.6, size * 0.8, 0, size);
            ctx.bezierCurveTo(-size * 0.6, size * 0.8, -size * 0.8, size * 0.3, -size, 0);
            ctx.bezierCurveTo(-size * 0.8, -size * 0.3, -size * 0.6, -size * 0.8, 0, -size);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    }

    // Helper methods for color manipulation
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
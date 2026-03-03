/**
 * Line Actor
 * Draws connecting lines between points
 */
import { applyEasing } from '../../utils/easing';

export class Line {
    static draw(ctx, actor, progress, animation) {
        const x1 = actor.x1 || actor.x;
        const y1 = actor.y1 || actor.y;
        const x2 = actor.x2 || actor.x + 100;
        const y2 = actor.y2 || actor.y;
        const color = actor.color || '#000';
        const thickness = actor.thickness || 2;
        const style = actor.style || 'solid'; // solid, dashed, dotted

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = this.darkenColor(color, 0.6);
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Set line style
        if (style === 'dashed') {
            ctx.setLineDash([10, 5]);
        } else if (style === 'dotted') {
            ctx.setLineDash([2, 3]);
        }

        // Draw animation with progressive length
        let drawX2 = x2;
        let drawY2 = y2;
        if (animation === 'draw') {
            const drawProgress = applyEasing(progress, 'easeOut');
            drawX2 = x1 + (x2 - x1) * drawProgress;
            drawY2 = y1 + (y2 - y1) * drawProgress;
        }

        // Line gradient
        const lineGradient = ctx.createLinearGradient(x1, y1, drawX2, drawY2);
        lineGradient.addColorStop(0, this.lightenColor(color, 0.3));
        lineGradient.addColorStop(0.7, color);
        lineGradient.addColorStop(1, this.darkenColor(color, 0.2));
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(drawX2, drawY2);
        ctx.stroke();

        // Reset shadow for highlight
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Line highlight (top edge)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = thickness * 0.4;
        ctx.beginPath();
        ctx.moveTo(x1, y1 - thickness / 4);
        ctx.lineTo(drawX2, drawY2 - thickness / 4);
        ctx.stroke();

        // Pulse animation with glow and alpha
        if (animation === 'pulse') {
            const pulseAlpha = 0.5 + Math.sin(progress * Math.PI * 4) * 0.5;
            const pulseGlow = ctx.createLinearGradient(x1, y1, drawX2, drawY2);
            pulseGlow.addColorStop(0, `rgba(${this.hexToRgb(color)}, ${pulseAlpha})`);
            pulseGlow.addColorStop(1, `rgba(${this.hexToRgb(color)}, 0)`);
            ctx.globalAlpha = pulseAlpha;
            ctx.strokeStyle = pulseGlow;
            ctx.lineWidth = thickness * 1.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(drawX2, drawY2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        ctx.setLineDash([]);
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

    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    }
}
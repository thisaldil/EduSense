/**
 * Label Actor
 * Draws text labels with various styles
 */
import { applyEasing } from '../../utils/easing';

export class Label {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x;
        const y = actor.y;
        const text = actor.text || 'Label';
        const fontSize = actor.fontSize || 16;
        const color = actor.color || '#000';
        const backgroundColor = actor.backgroundColor;
        const bold = actor.bold !== false;
        const align = actor.align || 'center';
        const style = actor.style || 'simple'; // simple, box, callout, badge

        ctx.save();

        // Global shadow for depth
        ctx.shadowColor = this.darkenColor(color, 0.5);
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Appear animation
        if (animation === 'appear') {
            ctx.save();
            const scale = applyEasing(progress, 'easeOut');
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
            ctx.restore();
        }

        // Fade animation
        if (animation === 'fade') {
            ctx.globalAlpha = progress;
        }

        // Slide animation
        if (animation === 'slide') {
            const slideX = (1 - progress) * -50;
            ctx.translate(slideX, 0);
        }

        // Set font
        ctx.font = `${bold ? 'bold ' : ''}${fontSize}px Arial`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        // Measure text
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        // Draw based on style
        switch (style) {
            case 'box':
                this.drawBoxLabel(ctx, x, y, text, textWidth, textHeight, color, backgroundColor);
                break;
            case 'callout':
                this.drawCalloutLabel(ctx, x, y, text, textWidth, textHeight, color, backgroundColor);
                break;
            case 'badge':
                this.drawBadgeLabel(ctx, x, y, text, textWidth, textHeight, color, backgroundColor);
                break;
            default:
                this.drawSimpleLabel(ctx, x, y, text, textWidth, textHeight, color, backgroundColor);
        }

        // Reset shadow for text to avoid blurring
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Pulse animation
        if (animation === 'pulse') {
            ctx.save();
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
            const pulseAlpha = 0.8 + Math.sin(progress * Math.PI * 4) * 0.2;
            ctx.globalAlpha = pulseAlpha;
            ctx.translate(x, y);
            ctx.scale(pulseScale, pulseScale);
            ctx.translate(-x, -y);

            // Pulse glow
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, fontSize * 2);
            glowGradient.addColorStop(0, `rgba(0, 0, 0, ${pulseAlpha * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.shadowColor = glowGradient;
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.restore();
        }

        ctx.restore();
    }

    static drawSimpleLabel(ctx, x, y, text, textWidth, textHeight, color, backgroundColor) {
        if (backgroundColor) {
            const padding = 8;
            const bgGradient = ctx.createLinearGradient(x - textWidth / 2 - padding, y - textHeight / 2 - 4, x + textWidth / 2 + padding, y + textHeight / 2 + 4);
            bgGradient.addColorStop(0, this.lightenColor(backgroundColor, 0.2));
            bgGradient.addColorStop(1, this.darkenColor(backgroundColor, 0.1));
            ctx.fillStyle = bgGradient;

            // Rounded rectangle
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x - textWidth / 2 - padding + radius, y - textHeight / 2 - 4);
            ctx.lineTo(x + textWidth / 2 + padding - radius, y - textHeight / 2 - 4);
            ctx.arcTo(x + textWidth / 2 + padding, y - textHeight / 2 - 4, x + textWidth / 2 + padding, y - textHeight / 2, radius);
            ctx.lineTo(x + textWidth / 2 + padding, y + textHeight / 2 + 4 - radius);
            ctx.arcTo(x + textWidth / 2 + padding, y + textHeight / 2 + 4, x + textWidth / 2 + padding - radius, y + textHeight / 2 + 4, radius);
            ctx.lineTo(x - textWidth / 2 - padding + radius, y + textHeight / 2 + 4);
            ctx.arcTo(x - textWidth / 2 - padding, y + textHeight / 2 + 4, x - textWidth / 2 - padding, y + textHeight / 2 + 4 - radius, radius);
            ctx.lineTo(x - textWidth / 2 - padding, y - textHeight / 2 - 4 + radius);
            ctx.arcTo(x - textWidth / 2 - padding, y - textHeight / 2 - 4, x - textWidth / 2 - padding + radius, y - textHeight / 2 - 4, radius);
            ctx.closePath();
            ctx.fill();

            // Background highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.beginPath();
            ctx.rect(x - textWidth / 2 - padding + 2, y - textHeight / 2 - 4 + 2, textWidth + padding * 2 - 4, (textHeight + 8) * 0.5);
            ctx.fill();
        }

        // Text with gradient
        const textGradient = ctx.createLinearGradient(x - textWidth / 2, y, x + textWidth / 2, y);
        textGradient.addColorStop(0, this.lightenColor(color, 0.2));
        textGradient.addColorStop(1, color);
        ctx.fillStyle = textGradient;
        ctx.fillText(text, x, y);

        // Text shadow for depth
        ctx.shadowColor = this.darkenColor(color, 0.7);
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    static drawBoxLabel(ctx, x, y, text, textWidth, textHeight, color, backgroundColor) {
        const padding = 10;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = textHeight + padding * 2;

        // Box background gradient
        const boxGradient = ctx.createLinearGradient(x - boxWidth / 2, y - boxHeight / 2, x + boxWidth / 2, y + boxHeight / 2);
        boxGradient.addColorStop(0, this.lightenColor(backgroundColor || '#FFFFFF', 0.3));
        boxGradient.addColorStop(1, this.darkenColor(backgroundColor || '#FFFFFF', 0.1));
        ctx.fillStyle = boxGradient;
        ctx.strokeStyle = this.darkenColor(color, 0.3);
        ctx.lineWidth = 2;

        const boxX = x - boxWidth / 2;
        const boxY = y - boxHeight / 2;

        // Rounded box
        const radius = 6;
        ctx.beginPath();
        ctx.moveTo(boxX + radius, boxY);
        ctx.lineTo(boxX + boxWidth - radius, boxY);
        ctx.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius, radius);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
        ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight, radius);
        ctx.lineTo(boxX + radius, boxY + boxHeight);
        ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius, radius);
        ctx.lineTo(boxX, boxY + radius);
        ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Box highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.rect(boxX + 2, boxY + 2, boxWidth * 0.5, boxHeight * 0.5);
        ctx.fill();

        // Draw text
        const textGradient = ctx.createLinearGradient(x - textWidth / 2, y, x + textWidth / 2, y);
        textGradient.addColorStop(0, this.lightenColor(color, 0.2));
        textGradient.addColorStop(1, color);
        ctx.fillStyle = textGradient;
        ctx.fillText(text, x, y);
    }

    static drawCalloutLabel(ctx, x, y, text, textWidth, textHeight, color, backgroundColor) {
        const padding = 10;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = textHeight + padding * 2;
        const pointerHeight = 15;
        const pointerWidth = 20;

        // Callout background gradient
        const calloutGradient = ctx.createLinearGradient(x - boxWidth / 2, y - boxHeight / 2 - pointerHeight, x + boxWidth / 2, y + boxHeight / 2);
        calloutGradient.addColorStop(0, this.lightenColor(backgroundColor || '#FFFFFF', 0.3));
        calloutGradient.addColorStop(1, this.darkenColor(backgroundColor || '#FFFFFF', 0.1));
        ctx.fillStyle = calloutGradient;
        ctx.strokeStyle = this.darkenColor(color, 0.3);
        ctx.lineWidth = 2;

        // Draw callout bubble
        ctx.beginPath();
        const boxX = x - boxWidth / 2;
        const boxY = y - boxHeight / 2 - pointerHeight;

        // Top-left corner
        ctx.moveTo(boxX + 5, boxY);
        ctx.lineTo(boxX + boxWidth - 5, boxY);

        // Top-right corner
        ctx.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + 5, 5);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - 5);

        // Bottom-right corner
        ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - 5, boxY + boxHeight, 5);

        // Pointer base right
        ctx.lineTo(x + pointerWidth / 2, boxY + boxHeight);

        // Pointer tip
        ctx.lineTo(x, y);

        // Pointer base left
        ctx.lineTo(x - pointerWidth / 2, boxY + boxHeight);

        // Bottom-left corner
        ctx.lineTo(boxX + 5, boxY + boxHeight);
        ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - 5, 5);

        // Top-left corner
        ctx.lineTo(boxX, boxY + 5);
        ctx.arcTo(boxX, boxY, boxX + 5, boxY, 5);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Callout highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.rect(boxX + 2, boxY + 2, boxWidth * 0.6, (boxHeight - pointerHeight) * 0.5);
        ctx.fill();

        // Draw text
        const textGradient = ctx.createLinearGradient(x - textWidth / 2, boxY + padding, x + textWidth / 2, boxY + padding);
        textGradient.addColorStop(0, this.lightenColor(color, 0.2));
        textGradient.addColorStop(1, color);
        ctx.fillStyle = textGradient;
        ctx.fillText(text, x, boxY + padding);
    }

    static drawBadgeLabel(ctx, x, y, text, textWidth, textHeight, color, backgroundColor) {
        const padding = 8;
        const badgeWidth = textWidth + padding * 2;
        const badgeHeight = textHeight + padding * 1.5;
        const radius = badgeHeight / 2;

        // Badge background gradient
        const badgeGradient = ctx.createRadialGradient(x, y, 0, x, y, badgeWidth / 2);
        badgeGradient.addColorStop(0, this.lightenColor(backgroundColor || '#FF5722', 0.4));
        badgeGradient.addColorStop(0.7, backgroundColor || '#FF5722');
        badgeGradient.addColorStop(1, this.darkenColor(backgroundColor || '#FF5722', 0.2));
        ctx.fillStyle = badgeGradient;

        // Draw badge (rounded rectangle)
        ctx.beginPath();
        ctx.moveTo(x - badgeWidth / 2 + radius, y - badgeHeight / 2);
        ctx.lineTo(x + badgeWidth / 2 - radius, y - badgeHeight / 2);
        ctx.arcTo(
            x + badgeWidth / 2,
            y - badgeHeight / 2,
            x + badgeWidth / 2,
            y - badgeHeight / 2 + radius,
            radius
        );
        ctx.lineTo(x + badgeWidth / 2, y + badgeHeight / 2 - radius);
        ctx.arcTo(
            x + badgeWidth / 2,
            y + badgeHeight / 2,
            x + badgeWidth / 2 - radius,
            y + badgeHeight / 2,
            radius
        );
        ctx.lineTo(x - badgeWidth / 2 + radius, y + badgeHeight / 2);
        ctx.arcTo(
            x - badgeWidth / 2,
            y + badgeHeight / 2,
            x - badgeWidth / 2,
            y + badgeHeight / 2 - radius,
            radius
        );
        ctx.lineTo(x - badgeWidth / 2, y - badgeHeight / 2 + radius);
        ctx.arcTo(
            x - badgeWidth / 2,
            y - badgeHeight / 2,
            x - badgeWidth / 2 + radius,
            y - badgeHeight / 2,
            radius
        );
        ctx.closePath();
        ctx.fill();

        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Badge highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.ellipse(x - badgeWidth * 0.3, y - badgeHeight * 0.3, badgeWidth * 0.3, badgeHeight * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw text with gradient
        const textGradient = ctx.createLinearGradient(x - textWidth / 2, y, x + textWidth / 2, y);
        textGradient.addColorStop(0, '#FFFFFF');
        textGradient.addColorStop(1, this.lightenColor('#FFFFFF', 0.2));
        ctx.fillStyle = textGradient;
        ctx.fillText(text, x, y);
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
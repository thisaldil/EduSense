/**
 * Arrow Actor
 * Draws directional arrows for indicating flow/direction
 */
import { applyEasing } from '../../utils/easing';

export class Arrow {
  static draw(ctx, actor, progress, animation) {
    const x = actor.x;
    const y = actor.y;
    const length = actor.length || 100;
    const angle = actor.angle || 0; // in radians
    const color = actor.color || '#FF0000';
    const thickness = actor.thickness || 5;

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

    // Global shadow for depth
    ctx.shadowColor = this.darkenColor(color, 0.6);
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw arrow shaft with linear gradient
    const shaftGradient = ctx.createLinearGradient(0, -thickness / 2, length - 15, -thickness / 2);
    shaftGradient.addColorStop(0, this.lightenColor(color, 0.3)); // Lighter start
    shaftGradient.addColorStop(0.7, color);
    shaftGradient.addColorStop(1, this.darkenColor(color, 0.2)); // Darker end
    ctx.strokeStyle = shaftGradient;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length - 15, 0);
    ctx.stroke();

    // Shaft highlight (top edge)
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = thickness * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, -thickness / 4);
    ctx.lineTo(length - 15, -thickness / 4);
    ctx.stroke();

    // Draw arrowhead with gradient fill
    const headGradient = ctx.createLinearGradient(length - 15, -8, length - 15 - 10, 0);
    headGradient.addColorStop(0, this.darkenColor(color, 0.3));
    headGradient.addColorStop(1, color);
    ctx.fillStyle = headGradient;
    ctx.shadowColor = this.darkenColor(color, 0.6);
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.beginPath();
    ctx.moveTo(length - 15, 0);
    ctx.lineTo(length - 15 - 10, -8);
    ctx.lineTo(length - 15 - 10, 8);
    ctx.closePath();
    ctx.fill();

    // Arrowhead highlight
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(length - 15, 0);
    ctx.lineTo(length - 15 - 5, -4);
    ctx.lineTo(length - 15 - 5, 4);
    ctx.closePath();
    ctx.fill();

    // Pulse animation with glow and scale
    if (animation === 'pulse') {
      const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
      const pulseAlpha = 0.7 + Math.sin(progress * Math.PI * 4) * 0.3;
      ctx.save();
      ctx.translate((length - 15) / 2, 0);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-(length - 15) / 2, 0);

      // Pulse glow
      const glowGradient = ctx.createRadialGradient((length - 15) / 2, 0, 0, (length - 15) / 2, 0, length / 2);
      glowGradient.addColorStop(0, `rgba(255, 0, 0, ${pulseAlpha})`);
      glowGradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
      ctx.strokeStyle = glowGradient;
      ctx.lineWidth = thickness * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(length - 15, 0);
      ctx.stroke();
      ctx.restore();
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
/**
 * Cloud Actor
 * Draws fluffy clouds
 */
import { applyEasing } from '../../utils/easing';

export class Cloud {
  static draw(ctx, actor, progress, animation) {
    const x = actor.x;
    const y = actor.y;
    const size = actor.size || 60;
    const color = actor.color || '#FFFFFF';

    ctx.save();

    // Global shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Appear animation
    if (animation === 'appear') {
      ctx.save();
      const scale = applyEasing(progress, 'easeOut');
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
      ctx.restore();
    }

    // Float animation (gentle movement)
    if (animation === 'float' || animation === 'idle') {
      const floatX = Math.sin(progress * Math.PI * 2) * 10;
      const floatY = Math.cos(progress * Math.PI * 2) * 5;
      ctx.translate(floatX, floatY);
    }

    // Outer glow for fluffiness
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow for individual puffs to control blur
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw cloud using multiple circles with gradients
    // Main cloud body
    const mainGradient = ctx.createRadialGradient(x, y - size * 0.2, 0, x, y + size * 0.2, size * 0.6);
    mainGradient.addColorStop(0, this.lightenColor(color, 0.2)); // Brighter top
    mainGradient.addColorStop(0.7, color);
    mainGradient.addColorStop(1, this.darkenColor(color, 0.1)); // Subtle darker edge
    ctx.fillStyle = mainGradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Left puff
    const leftGradient = ctx.createRadialGradient(x - size * 0.4, y - size * 0.1, 0, x - size * 0.4, y + size * 0.1, size * 0.5);
    leftGradient.addColorStop(0, this.lightenColor(color, 0.3));
    leftGradient.addColorStop(0.7, color);
    leftGradient.addColorStop(1, this.darkenColor(color, 0.1));
    ctx.fillStyle = leftGradient;
    ctx.beginPath();
    ctx.arc(x - size * 0.4, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Right puff
    const rightGradient = ctx.createRadialGradient(x + size * 0.4, y - size * 0.1, 0, x + size * 0.4, y + size * 0.1, size * 0.5);
    rightGradient.addColorStop(0, this.lightenColor(color, 0.3));
    rightGradient.addColorStop(0.7, color);
    rightGradient.addColorStop(1, this.darkenColor(color, 0.1));
    ctx.fillStyle = rightGradient;
    ctx.beginPath();
    ctx.arc(x + size * 0.4, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Top puff
    const topGradient = ctx.createRadialGradient(x, y - size * 0.3 - size * 0.1, 0, x, y - size * 0.3 + size * 0.1, size * 0.4);
    topGradient.addColorStop(0, this.lightenColor(color, 0.4)); // Extra bright top
    topGradient.addColorStop(0.7, color);
    topGradient.addColorStop(1, this.darkenColor(color, 0.1));
    ctx.fillStyle = topGradient;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Bottom puff
    const bottomGradient = ctx.createRadialGradient(x, y + size * 0.3 - size * 0.1, 0, x, y + size * 0.3 + size * 0.1, size * 0.35);
    bottomGradient.addColorStop(0, this.lightenColor(color, 0.1));
    bottomGradient.addColorStop(0.7, color);
    bottomGradient.addColorStop(1, this.darkenColor(color, 0.2)); // Slightly darker bottom
    ctx.fillStyle = bottomGradient;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.3, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow for highlights
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Enhanced subtle highlights (multiple for 3D effect)
    const highlightGradient = ctx.createRadialGradient(x - size * 0.2, y - size * 0.2, 0, x - size * 0.2, y - size * 0.2, size * 0.3);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Additional side highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x + size * 0.1, y + size * 0.1, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Float glow enhancement
    if (animation === 'float' || animation === 'idle') {
      const glowAlpha = 0.2 + Math.sin(progress * Math.PI * 4) * 0.1;
      const floatGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 1.2);
      floatGlow.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha})`);
      floatGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = floatGlow;
      ctx.beginPath();
      ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
      ctx.fill();
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
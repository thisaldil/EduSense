/**
 * Animal Actor
 * Generic animal representation (can be customized)
 */
import { applyEasing } from '../../utils/easing';

export class Animal {
  static draw(ctx, actor, progress, animation) {
    const x = actor.x;
    const y = actor.y;
    const size = actor.size || 50;
    const color = actor.color || '#8B4513';
    const animalType = actor.animalType || 'generic'; // generic, bird, fish, etc.

    ctx.save();

    // Appear animation
    if (animation === 'appear') {
      const scale = applyEasing(progress, 'easeOut');
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }

    // Idle animation (breathing/swaying)
    if (animation === 'idle') {
      const breathe = 1 + Math.sin(progress * Math.PI * 2) * 0.05;
      ctx.translate(x, y);
      ctx.scale(breathe, breathe);
      ctx.translate(-x, -y);
    }

    // Move animation
    if (animation === 'move' || animation === 'moveUp' || animation === 'moveDown') {
      const moveProgress = applyEasing(progress, 'easeInOut');
      const moveY = animation === 'moveUp' ? -100 : animation === 'moveDown' ? 100 : 0;
      ctx.translate(0, moveY * moveProgress);
    }

    // Global shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw based on animal type
    switch (animalType) {
      case 'bird':
        this.drawBird(ctx, x, y, size, color);
        break;
      case 'fish':
        this.drawFish(ctx, x, y, size, color);
        break;
      default:
        this.drawGeneric(ctx, x, y, size, color);
    }

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.restore();
  }

  static drawGeneric(ctx, x, y, size, color) {
    // Body (ellipse) with linear gradient for depth
    const bodyGradient = ctx.createLinearGradient(x - size * 0.4, y - size * 0.3, x + size * 0.4, y + size * 0.3);
    bodyGradient.addColorStop(0, this.lightenColor(color, 0.3)); // Lighter top
    bodyGradient.addColorStop(1, this.darkenColor(color, 0.2)); // Darker bottom
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body highlight (3D effect)
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.ellipse(x - size * 0.1, y - size * 0.1, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head (circle) with radial gradient
    const headGradient = ctx.createRadialGradient(x - size * 0.3, y, 0, x - size * 0.3, y, size * 0.25);
    headGradient.addColorStop(0, this.lightenColor(color, 0.2));
    headGradient.addColorStop(1, color);
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Head highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(x - size * 0.35, y - size * 0.05, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eyes with shine
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.35, y - size * 0.05, 3, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(x - size * 0.37, y - size * 0.07, 1, 0, Math.PI * 2);
    ctx.fill();

    // Tail with gradient stroke
    const tailGradient = ctx.createLinearGradient(x + size * 0.4, y, x + size * 0.6, y - size * 0.2);
    tailGradient.addColorStop(0, color);
    tailGradient.addColorStop(1, this.darkenColor(color, 0.3));
    ctx.strokeStyle = tailGradient;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + size * 0.4, y);
    ctx.lineTo(x + size * 0.6, y - size * 0.2);
    ctx.stroke();
  }

  static drawBird(ctx, x, y, size, color) {
    // Body with gradient
    const bodyGradient = ctx.createLinearGradient(x - size * 0.3, y - size * 0.2, x + size * 0.3, y + size * 0.2);
    bodyGradient.addColorStop(0, this.lightenColor(color, 0.4)); // Lighter top for sky effect
    bodyGradient.addColorStop(1, color);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.ellipse(x - size * 0.05, y - size * 0.1, size * 0.2, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings with radial gradient for feather depth
    const wingGradient = ctx.createRadialGradient(x, y - size * 0.1, 0, x, y - size * 0.1, size * 0.4);
    wingGradient.addColorStop(0, this.lightenColor(color, 0.2));
    wingGradient.addColorStop(1, this.darkenColor(color, 0.1));
    ctx.fillStyle = wingGradient;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.1, size * 0.4, size * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Wing details (simple feather lines)
    ctx.strokeStyle = this.darkenColor(color, 0.4);
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const offsetY = (i - 1) * size * 0.03;
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.1 + offsetY, size * 0.4, size * 0.15, -0.3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Head with gradient
    const headGradient = ctx.createRadialGradient(x - size * 0.25, y, 0, x - size * 0.25, y, size * 0.15);
    headGradient.addColorStop(0, this.lightenColor(color, 0.3));
    headGradient.addColorStop(1, color);
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Head highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(x - size * 0.28, y - size * 0.03, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Beak with gradient
    const beakGradient = ctx.createLinearGradient(x - size * 0.35, y, x - size * 0.45, y);
    beakGradient.addColorStop(0, '#FFA500');
    beakGradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = beakGradient;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y);
    ctx.lineTo(x - size * 0.45, y - 3);
    ctx.lineTo(x - size * 0.45, y + 3);
    ctx.closePath();
    ctx.fill();

    // Beak highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y);
    ctx.lineTo(x - size * 0.42, y - 1.5);
    ctx.lineTo(x - size * 0.42, y + 1.5);
    ctx.closePath();
    ctx.fill();
  }

  static drawFish(ctx, x, y, size, color) {
    // Body with radial gradient for rounded depth
    const bodyGradient = ctx.createRadialGradient(x - size * 0.4, y, 0, x, y, size * 0.4);
    bodyGradient.addColorStop(0, this.lightenColor(color, 0.3)); // Brighter front
    bodyGradient.addColorStop(1, this.darkenColor(color, 0.2)); // Darker back
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.4, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.ellipse(x - size * 0.15, y - size * 0.1, size * 0.25, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail with gradient
    const tailGradient = ctx.createLinearGradient(x + size * 0.4, y, x + size * 0.6, y);
    tailGradient.addColorStop(0, this.darkenColor(color, 0.3));
    tailGradient.addColorStop(1, color);
    ctx.fillStyle = tailGradient;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.4, y);
    ctx.lineTo(x + size * 0.6, y - size * 0.2);
    ctx.lineTo(x + size * 0.6, y + size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Tail highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(x + size * 0.4, y);
    ctx.lineTo(x + size * 0.55, y - size * 0.1);
    ctx.lineTo(x + size * 0.55, y + size * 0.1);
    ctx.closePath();
    ctx.fill();

    // Eye with shine
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.1, 3, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(x - size * 0.22, y - size * 0.12, 1.5, 0, Math.PI * 2);
    ctx.fill();
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
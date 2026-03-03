/**
 * Graph Actor
 * Draws bar or line graphs with animation support
 */
import { applyEasing } from '../../utils/easing';

export class Graph {
    static draw(ctx, actor, progress, animation) {
        const x = actor.x || 0;
        const y = actor.y || 0;
        const width = actor.width || 200;
        const height = actor.height || 150;
        const type = actor.type || 'line'; // 'bar' or 'line'
        const data = actor.data || [{ x: 0, y: 0 }, { x: 1, y: 50 }, { x: 2, y: 30 }, { x: 3, y: 80 }];
        const labels = actor.labels || ['Jan', 'Feb', 'Mar', 'Apr'];
        const color = actor.color || '#4A90E2';
        const backgroundColor = actor.backgroundColor || 'rgba(255, 255, 255, 0.1)';

        ctx.save();

        // Translate to position
        ctx.translate(x, y);

        // Global shadow for depth
        ctx.shadowColor = this.darkenColor(color, 0.5);
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Appear animation
        if (animation === 'appear') {
            const scale = applyEasing(progress, 'easeOut');
            ctx.scale(scale, scale);
        }

        // Draw background with subtle gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, backgroundColor);
        bgGradient.addColorStop(1, this.darkenColor(backgroundColor.replace('rgba', 'rgb').replace(/,\s*[^)]+\)/, ')'), 0.2));
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Reset shadow for grid
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw grid lines (simple horizontal/vertical) with subtle gradient
        const gridGradient = ctx.createLinearGradient(0, 0, 0, height);
        gridGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gridGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.strokeStyle = gridGradient;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i <= 5; i++) {
            const gridY = (height / 5) * i;
            ctx.moveTo(0, gridY);
            ctx.lineTo(width, gridY);
        }
        for (let i = 0; i <= 5; i++) {
            const gridX = (width / 5) * i;
            ctx.moveTo(gridX, 0);
            ctx.lineTo(gridX, height);
        }
        ctx.stroke();

        // Normalize data
        const minY = Math.min(...data.map(d => d.y));
        const maxY = Math.max(...data.map(d => d.y));
        const yRange = maxY - minY || 1;
        const numPoints = data.length;

        // Draw axis with gradient stroke
        const axisGradient = ctx.createLinearGradient(0, height, width, height);
        axisGradient.addColorStop(0, '#FFFFFF');
        axisGradient.addColorStop(1, this.darkenColor('#FFFFFF', 0.3));
        ctx.strokeStyle = axisGradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, height); // x-axis
        ctx.lineTo(width, 0); // y-axis
        ctx.stroke();

        // Axis highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, height - 0.5);
        ctx.lineTo(width, height - 0.5);
        ctx.stroke();

        // Draw labels (bottom x-axis) with background for visibility
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < numPoints; i++) {
            const labelX = (width / (numPoints - 1)) * i;
            const labelY = height + 20;
            const metrics = ctx.measureText(labels[i] || `P${i}`);
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(labelX - metrics.width / 2 - 2, labelY - 14, metrics.width + 4, 14);
            ctx.fillStyle = '#000';
            ctx.fillText(labels[i] || `P${i}`, labelX, labelY - 2);
            ctx.restore();
        }

        // Draw graph data
        const dataXSpacing = numPoints > 1 ? width / (numPoints - 1) : 0;

        if (type === 'line') {
            // Line graph
            ctx.shadowColor = this.darkenColor(color, 0.6);
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
            lineGradient.addColorStop(0, this.lightenColor(color, 0.2));
            lineGradient.addColorStop(0.5, color);
            lineGradient.addColorStop(1, this.darkenColor(color, 0.2));
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            for (let i = 0; i < numPoints; i++) {
                const dataX = dataXSpacing * i;
                const normalizedY = height - ((data[i].y - minY) / yRange) * height;
                const animProgress = animation === 'grow' ? Math.min(progress * (i + 1) / numPoints, 1) : 1;
                const drawY = height - (normalizedY * animProgress);

                if (i === 0) {
                    ctx.moveTo(dataX, drawY);
                } else {
                    ctx.lineTo(dataX, drawY);
                }
            }
            ctx.stroke();

            // Fill under line with gradient
            ctx.shadowBlur = 0;
            const fillGradient = ctx.createLinearGradient(0, height, 0, 0);
            fillGradient.addColorStop(0, 'rgba(74, 144, 226, 0.1)');
            fillGradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
            ctx.fillStyle = fillGradient;
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'bar') {
            // Bar graph
            ctx.shadowColor = this.darkenColor(color, 0.6);
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            for (let i = 0; i < numPoints; i++) {
                const dataX = dataXSpacing * i;
                const normalizedY = height - ((data[i].y - minY) / yRange) * height;
                const animProgress = animation === 'grow' ? Math.min(progress * (i + 1) / numPoints, 1) : 1;
                const drawY = height - (normalizedY * animProgress);
                const barWidth = Math.max(10, width / numPoints * 0.8);

                // Bar gradient
                const barGradient = ctx.createLinearGradient(dataX - barWidth / 2, height, dataX - barWidth / 2, drawY);
                barGradient.addColorStop(0, this.darkenColor(color, 0.2));
                barGradient.addColorStop(1, this.lightenColor(color, 0.3));
                ctx.fillStyle = barGradient;
                ctx.fillRect(dataX - barWidth / 2, drawY, barWidth, height - drawY);

                // Bar highlight
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                ctx.fillRect(dataX - barWidth / 2, drawY, barWidth, (height - drawY) * 0.3);
            }
        }

        // Draw data points with glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        for (let i = 0; i < numPoints; i++) {
            const dataX = dataXSpacing * i;
            const normalizedY = height - ((data[i].y - minY) / yRange) * height;
            const animProgress = animation === 'grow' ? Math.min(progress * (i + 1) / numPoints, 1) : 1;
            const drawY = height - (normalizedY * animProgress);

            if (animProgress >= 1) {
                const pointGradient = ctx.createRadialGradient(dataX, drawY, 0, dataX, drawY, 6);
                pointGradient.addColorStop(0, this.lightenColor(color, 0.4));
                pointGradient.addColorStop(1, color);
                ctx.fillStyle = pointGradient;
                ctx.beginPath();
                ctx.arc(dataX, drawY, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.shadowBlur = 0;

        // Pulse animation on whole graph with glow
        if (animation === 'pulse') {
            const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.05;
            const pulseAlpha = 0.2 + Math.sin(progress * Math.PI * 4) * 0.1;
            ctx.save();
            ctx.scale(pulseScale, pulseScale);

            // Pulse glow
            const pulseGlow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
            pulseGlow.addColorStop(0, `rgba(74, 144, 226, ${pulseAlpha})`);
            pulseGlow.addColorStop(1, 'rgba(74, 144, 226, 0)');
            ctx.fillStyle = pulseGlow;
            ctx.fillRect(0, 0, width, height);
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
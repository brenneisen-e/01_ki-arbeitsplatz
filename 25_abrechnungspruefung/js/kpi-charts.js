/**
 * KPI Mini-Charts
 * Lightweight Canvas-based charts for KPI dashboard
 */

class KPIChart {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas ${canvasId} nicht gefunden`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.options = {
      type: options.type || 'line', // line, bar, area, donut
      color: options.color || '#003366',
      gradient: options.gradient || false,
      animate: options.animate !== false,
      height: options.height || 80,
      ...options
    };

    this.data = [];
    this.labels = [];
    this.tooltip = null;
    this.animationProgress = 0;

    this.setupCanvas();
    this.setupTooltip();
    this.bindEvents();
  }

  setupCanvas() {
    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = this.options.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = this.options.height + 'px';

    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = this.options.height;
  }

  setupTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'kpi-chart-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
  }

  setData(data, labels = []) {
    this.data = data;
    this.labels = labels;
    if (this.options.animate) {
      this.animate();
    } else {
      this.animationProgress = 1;
      this.draw();
    }
  }

  animate() {
    this.animationProgress = 0;
    const duration = 800; // ms
    const startTime = Date.now();

    const step = () => {
      const elapsed = Date.now() - startTime;
      this.animationProgress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - this.animationProgress, 3);

      this.clear();
      this.draw(eased);

      if (this.animationProgress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  draw(progress = 1) {
    if (this.data.length === 0) return;

    switch (this.options.type) {
      case 'line':
        this.drawLine(progress);
        break;
      case 'bar':
        this.drawBar(progress);
        break;
      case 'area':
        this.drawArea(progress);
        break;
      case 'donut':
        this.drawDonut(progress);
        break;
    }

    // Draw X-axis labels (only for line, bar, area charts)
    if (progress === 1 && this.options.type !== 'donut' && this.labels.length > 0) {
      this.drawXAxisLabels();
    }
  }

  drawXAxisLabels() {
    const padding = 10;
    const width = this.width - padding * 2;
    const height = this.height - padding * 2;

    this.ctx.font = '9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.fillStyle = '#999';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';

    // Show labels with proper spacing
    const maxLabels = 6;
    const step = Math.ceil(this.labels.length / maxLabels);

    this.labels.forEach((label, i) => {
      if (i % step === 0 || i === this.labels.length - 1) {
        const x = padding + (i / (this.labels.length - 1)) * width;
        const y = height + padding + 3;
        this.ctx.fillText(label, x, y);
      }
    });
  }

  drawLine(progress) {
    const padding = 10;
    const width = this.width - padding * 2;
    const height = this.height - padding * 2;
    const max = Math.max(...this.data);
    const min = Math.min(...this.data);
    const range = max - min || 1;

    const points = this.data.map((value, i) => ({
      x: padding + (i / (this.data.length - 1)) * width,
      y: padding + height - ((value - min) / range) * height
    }));

    // Draw line
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.options.color;
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    const drawPoints = Math.floor(points.length * progress);
    points.slice(0, drawPoints).forEach((point, i) => {
      if (i === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });

    this.ctx.stroke();

    // Draw points
    if (progress === 1) {
      points.forEach(point => {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.options.color;
        this.ctx.fill();
      });
    }
  }

  drawBar(progress) {
    const padding = 10;
    const width = this.width - padding * 2;
    const height = this.height - padding * 2;
    const max = Math.max(...this.data);
    const barWidth = width / this.data.length;
    const gap = 4;

    this.data.forEach((value, i) => {
      const barHeight = (value / max) * height * progress;
      const x = padding + i * barWidth + gap / 2;
      const y = padding + height - barHeight;

      // Gradient fill
      if (this.options.gradient) {
        const gradient = this.ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, this.options.color);
        gradient.addColorStop(1, this.options.color + '88');
        this.ctx.fillStyle = gradient;
      } else {
        this.ctx.fillStyle = this.options.color;
      }

      this.ctx.fillRect(x, y, barWidth - gap, barHeight);
    });
  }

  drawArea(progress) {
    const padding = 10;
    const width = this.width - padding * 2;
    const height = this.height - padding * 2;
    const max = Math.max(...this.data);
    const min = Math.min(...this.data);
    const range = max - min || 1;

    const points = this.data.map((value, i) => ({
      x: padding + (i / (this.data.length - 1)) * width,
      y: padding + height - ((value - min) / range) * height
    }));

    // Draw area with gradient
    const gradient = this.ctx.createLinearGradient(0, padding, 0, padding + height);
    gradient.addColorStop(0, this.options.color + '40');
    gradient.addColorStop(1, this.options.color + '00');

    this.ctx.beginPath();
    const drawPoints = Math.floor(points.length * progress);

    points.slice(0, drawPoints).forEach((point, i) => {
      if (i === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });

    // Close the area
    if (drawPoints > 0) {
      this.ctx.lineTo(points[drawPoints - 1].x, padding + height);
      this.ctx.lineTo(points[0].x, padding + height);
      this.ctx.closePath();
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }

    // Draw line on top
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.options.color;
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    points.slice(0, drawPoints).forEach((point, i) => {
      if (i === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });

    this.ctx.stroke();
  }

  drawDonut(progress) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(this.width, this.height) / 2 - 10;
    const innerRadius = radius * 0.6;

    let currentAngle = -Math.PI / 2;
    const total = this.data.reduce((sum, val) => sum + val, 0);

    this.data.forEach((value, i) => {
      const sliceAngle = (value / total) * Math.PI * 2 * progress;
      const color = this.options.colors ? this.options.colors[i] : this.options.color;

      // Draw slice
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      this.ctx.closePath();
      this.ctx.fillStyle = color;
      this.ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.options.type === 'line' || this.options.type === 'area' || this.options.type === 'bar') {
      const padding = 10;
      const width = this.width - padding * 2;
      const dataIndex = Math.round(((x - padding) / width) * (this.data.length - 1));

      if (dataIndex >= 0 && dataIndex < this.data.length) {
        this.showTooltip(
          e.clientX,
          e.clientY,
          this.labels[dataIndex] || `#${dataIndex + 1}`,
          this.data[dataIndex]
        );
      }
    }
  }

  showTooltip(x, y, label, value) {
    this.tooltip.innerHTML = `
      <div style="font-size: 0.75rem; color: #999; margin-bottom: 0.25rem;">${label}</div>
      <div style="font-size: 1rem; font-weight: 600; color: #003366;">${this.formatValue(value)}</div>
    `;
    this.tooltip.style.left = (x + 10) + 'px';
    this.tooltip.style.top = (y - 40) + 'px';
    this.tooltip.style.display = 'block';
  }

  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  formatValue(value) {
    if (this.options.format === 'currency') {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    } else if (this.options.format === 'percent') {
      return value.toFixed(1) + '%';
    }
    return value.toLocaleString('de-DE');
  }

  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }
}

// Global chart manager
window.kpiCharts = {
  charts: {},

  create(id, options) {
    if (this.charts[id]) {
      this.charts[id].destroy();
    }
    this.charts[id] = new KPIChart(id, options);
    return this.charts[id];
  },

  update(id, data, labels) {
    if (this.charts[id]) {
      this.charts[id].setData(data, labels);
    }
  },

  destroyAll() {
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};
  }
};

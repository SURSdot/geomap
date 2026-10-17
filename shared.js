/**
 * GEO-ECO LAB Core Engine
 * Esri Canvas Map Tile Source (Zero API key needed)
 * Pure SVG Icons, Mobile Touch Support & LocalStorage State
 */

const TOTAL_TASKS = 12;

const TASK_REGISTRY = {
  p18_t1: { id: 'p18_t1', paragraph: 18, num: 1, title: 'Экологическая напряжённость регионов' },
  p18_t2: { id: 'p18_t2', paragraph: 18, num: 2, title: 'Специфика регионального природопользования' },
  p18_t3: { id: 'p18_t3', paragraph: 18, num: 3, title: 'Полномочия местного самоуправления' },

  p19_t1: { id: 'p19_t1', paragraph: 19, num: 1, title: 'Страны с высоким экоследом (>4 планет)' },
  p19_t2: { id: 'p19_t2', paragraph: 19, num: 2, title: 'Критические зоны «выхода за пределы»' },
  p19_t3: { id: 'p19_t3', paragraph: 19, num: 3, title: 'Калькулятор 6 слагаемых Wackernagel & Rees' },

  p20_t1: { id: 'p20_t1', paragraph: 20, num: 1, title: 'Мировой водный стресс по шкале ООН' },
  p20_t2: { id: 'p20_t2', paragraph: 20, num: 2, title: 'Водные бассейны Казахстана и нормы' },
  p20_t3: { id: 'p20_t3', paragraph: 20, num: 3, title: 'Аридные пояса и спад потребления воды' },

  p21_t1: { id: 'p21_t1', paragraph: 21, num: 1, title: 'Технологии водосбережения в отраслях' },
  p21_t2: { id: 'p21_t2', paragraph: 21, num: 2, title: 'Ремонт водоводов: металлополимерный бандаж' },
  p21_t3: { id: 'p21_t3', paragraph: 21, num: 3, title: 'Климатическая адаптация: ледники и насаждения' }
};

const StateManager = {
  STORAGE_KEY: 'geoeco_lab_progress_v2',

  getState() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Storage access error:', e);
      return {};
    }
  },

  isCompleted(taskId) {
    const state = this.getState();
    return !!(state[taskId] && state[taskId].completed);
  },

  setCompleted(taskId, score = 100, metadata = {}) {
    const state = this.getState();
    state[taskId] = {
      completed: true,
      score: score,
      timestamp: Date.now(),
      meta: metadata
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('geoeco_storage_update'));
  },

  resetAll() {
    if (confirm('Сбросить весь сохранённый прогресс практикума (12 заданий)?')) {
      localStorage.removeItem(this.STORAGE_KEY);
      window.dispatchEvent(new Event('geoeco_storage_update'));
      window.location.reload();
    }
  },

  getStats() {
    const state = this.getState();
    const completedCount = Object.keys(state).filter(k => state[k].completed).length;
    const byParagraph = { 18: 0, 19: 0, 20: 0, 21: 0 };

    Object.keys(state).forEach(k => {
      if (state[k].completed && TASK_REGISTRY[k]) {
        byParagraph[TASK_REGISTRY[k].paragraph]++;
      }
    });

    return {
      completedCount,
      totalCount: TOTAL_TASKS,
      percent: Math.round((completedCount / TOTAL_TASKS) * 100),
      byParagraph
    };
  }
};

// SVG Toast Notification (No emojis)
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast-notice');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  
  const iconSvg = type === 'success'
    ? '<svg class="ui-icon" viewBox="0 0 24 24" style="color:#10b981"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    : '<svg class="ui-icon" viewBox="0 0 24 24" style="color:#38bdf8"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

  toast.innerHTML = `
    ${iconSvg}
    <span style="font-weight: 500;">${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// 100% надёжная подложка Esri World Light Gray Base + Reference (без ключей API)
function createStandardMap(elementId, center = [48.0196, 66.9237], zoom = 5) {
  const map = L.map(elementId, {
    zoomControl: false,
    attributionControl: false
  }).setView(center, zoom);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Esri Base Canvas
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    subdomains: ['server', 'services']
  }).addTo(map);

  // Esri Reference Labels
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    subdomains: ['server', 'services']
  }).addTo(map);

  return map;
}
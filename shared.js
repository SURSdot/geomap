/**
 * GEO-ECO LAB Core Engine
 * Manages 12-task progress, LocalStorage caching, validation feedback & UI helpers
 */

const TOTAL_TASKS = 12;

const TASK_REGISTRY = {
  // § 18: Local Environmental Governance (3 tasks)
  p18_t1: { id: 'p18_t1', paragraph: 18, num: 1, title: 'Экологическая напряжённость регионов' },
  p18_t2: { id: 'p18_t2', paragraph: 18, num: 2, title: 'Специфика регионального природопользования' },
  p18_t3: { id: 'p18_t3', paragraph: 18, num: 3, title: 'Полномочия местного самоуправления' },

  // § 19: Ecological Footprint (3 tasks)
  p19_t1: { id: 'p19_t1', paragraph: 19, num: 1, title: 'Страны с высоким экоследом (>4 планет)' },
  p19_t2: { id: 'p19_t2', paragraph: 19, num: 2, title: 'Критические зоны «выхода за пределы»' },
  p19_t3: { id: 'p19_t3', paragraph: 19, num: 3, title: 'Калькулятор 6 слагаемых Wackernagel & Rees' },

  // § 20: Water Resources & Stress (3 tasks)
  p20_t1: { id: 'p20_t1', paragraph: 20, num: 1, title: 'Мировой водный стресс по шкале ООН' },
  p20_t2: { id: 'p20_t2', paragraph: 20, num: 2, title: 'Водные бассейны Казахстана и нормы' },
  p20_t3: { id: 'p20_t3', paragraph: 20, num: 3, title: 'Аридные пояса и спад потребления воды' },

  // § 21: Sustainable Water Management (3 tasks)
  p21_t1: { id: 'p21_t1', paragraph: 21, num: 1, title: 'Технологии водосбережения в отраслях' },
  p21_t2: { id: 'p21_t2', paragraph: 21, num: 2, title: 'Ремонт водоводов: металлополимерный бандаж' },
  p21_t3: { id: 'p21_t3', paragraph: 21, num: 3, title: 'Климатическая адаптация: ледники и насаждения' }
};

const StateManager = {
  STORAGE_KEY: 'geoeco_lab_progress_v1',

  getState() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('LocalStorage unavailable:', e);
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

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast-notice');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  toast.style.borderColor = type === 'success' ? '#059669' : '#0f172a';
  toast.innerHTML = `
    <span style="font-weight:600">${type === 'success' ? '✓' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// 100% бесплатная подложка без API-ключей (OpenStreetMap с кастомным фильтром)
function createStandardMap(elementId, center = [48.0196, 66.9237], zoom = 5) {
  const map = L.map(elementId, {
    zoomControl: false,
    attributionControl: false
  }).setView(center, zoom);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Используем официальный бесплатный CDN OpenStreetMap
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 16
  }).addTo(map);

  return map;
}
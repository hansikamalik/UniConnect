/**
 * UniConnect Multi-Theme Dynamic Switcher
 * Supports instantaneous theme switching across all 4 designer themes
 * Persists user choice in localStorage across page reloads.
 */

(function () {
  // Theme registry
  const THEMES = {
    'sau-official': {
      name: 'SAU Official Blue',
      icon: '🏛️',
      color: '#00408d'
    },
    'sau-dark': {
      name: 'SAU Midnight Dark',
      icon: '🌙',
      color: '#080E1A'
    },
    'collegiate-crimson': {
      name: 'Heritage Collegiate Crimson',
      icon: '🎓',
      color: '#7A0019'
    },
    'neo-emerald': {
      name: 'Futuristic Neo Emerald',
      icon: '⚡',
      color: '#059669'
    }
  };

  // 1. Immediately apply saved theme on load to prevent flash
  const savedTheme = localStorage.getItem('uniconnect_theme') || 'sau-official';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 2. Global switcher function
  window.setTheme = function (themeKey) {
    if (!THEMES[themeKey]) themeKey = 'sau-official';

    document.documentElement.setAttribute('data-theme', themeKey);
    localStorage.setItem('uniconnect_theme', themeKey);
    updateThemeSelectorUI(themeKey);
  };

  // 3. UI Update for dropdown
  function updateThemeSelectorUI(activeThemeKey) {
    const labelEl = document.getElementById('currentThemeLabel');
    const dotEl = document.getElementById('currentThemeDot');

    const theme = THEMES[activeThemeKey] || THEMES['sau-official'];

    if (labelEl) {
      labelEl.innerText = `${theme.icon} ${theme.name}`;
    }
    if (dotEl) {
      dotEl.style.backgroundColor = theme.color;
    }

    // Update active checkmarks in menu
    document.querySelectorAll('[data-theme-choice]').forEach((item) => {
      const choice = item.getAttribute('data-theme-choice');
      if (choice === activeThemeKey) {
        item.classList.add('active', 'fw-bold');
      } else {
        item.classList.remove('active', 'fw-bold');
      }
    });
  }

  // 4. Initialize UI once DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const current = localStorage.getItem('uniconnect_theme') || 'sau-official';
    updateThemeSelectorUI(current);
  });
})();

// Language switcher for public pages (landing/login/register/pricing).
// After login the app is English-only — this module is inert for in-app pages.
const Lang = {
  KEY: 'cia_lang',

  current() {
    let v = localStorage.getItem(this.KEY);
    if (v === 'en' || v === 'vn') return v;
    // Auto-detect: Vietnamese browser → VN; else EN
    const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return nav.startsWith('vi') ? 'vn' : 'en';
  },

  set(lang) {
    if (lang !== 'en' && lang !== 'vn') return;
    localStorage.setItem(this.KEY, lang);
    this.apply();
  },

  // Apply current lang to <body data-lang="..."> so CSS toggles visibility
  apply() {
    document.body.setAttribute('data-lang', this.current());
    // Refresh any rendered switcher UI
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      const isCur = btn.dataset.langSwitch === this.current();
      btn.classList.toggle('active', isCur);
    });
  },

  // Build a switcher widget — returns an Element.
  // style: 'pill' (default) or 'compact' (just 2 letters)
  renderSwitcher(style = 'pill') {
    const wrap = document.createElement('div');
    wrap.className = 'lang-switcher ' + (style === 'compact' ? 'lang-switcher-compact' : '');
    wrap.innerHTML = `
      <button class="lang-switcher-btn" data-lang-switch="en" aria-label="English">EN</button>
      <button class="lang-switcher-btn" data-lang-switch="vn" aria-label="Vietnamese">VN</button>
    `;
    wrap.querySelectorAll('[data-lang-switch]').forEach(btn => {
      btn.addEventListener('click', () => this.set(btn.dataset.langSwitch));
    });
    // Reflect current state after insert
    setTimeout(() => this.apply(), 0);
    return wrap;
  },
};

// Apply ASAP so first paint matches preference
document.addEventListener('DOMContentLoaded', () => Lang.apply());

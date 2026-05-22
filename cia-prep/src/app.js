// Main App Controller
const App = {
  route: 'dashboard',
  routeData: null,

  init() {
    Toast.init();
    this.buildShell();
    this.navigate('dashboard');
    window.addEventListener('popstate', () => this.navigate(this.route));
  },

  buildShell() {
    const data = window.CIA_DATA;
    const appEl = document.querySelector('#app');
    appEl.innerHTML = `
      <!-- Topbar -->
      <div class="topbar">
        <div class="topbar-brand" id="brand-home">
          <div class="topbar-logo">CIA</div>
          <div>
            <div class="topbar-title">CIA Part 1</div>
            <div class="topbar-subtitle">Study Prep</div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-stats" id="topbar-stats"></div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar" id="sidebar"></div>

      <!-- Main -->
      <div class="main-content" id="main-content"></div>
    `;

    document.querySelector('#brand-home').addEventListener('click', () => this.navigate('dashboard'));
    this.updateTopbarStats();
  },

  updateTopbarStats() {
    const stats = Storage.getStats();
    const el = document.querySelector('#topbar-stats');
    if (!el) return;
    el.innerHTML = `
      <div class="topbar-stat"><div class="topbar-stat-val">${stats.attempted}</div><div class="topbar-stat-lbl">Attempted</div></div>
      <div class="topbar-stat"><div class="topbar-stat-val">${stats.accuracy}%</div><div class="topbar-stat-lbl">Accuracy</div></div>
      <div class="topbar-stat"><div class="topbar-stat-val">${stats.bookmarks}</div><div class="topbar-stat-lbl">Saved</div></div>
    `;
  },

  navigate(route, data = null) {
    this.route = route;
    this.routeData = data;

    // Update sidebar
    const sidebar = document.querySelector('#sidebar');
    if (sidebar) Sidebar.mount(sidebar, route, (r, d) => this.navigate(r, d));

    // Render page
    const main = document.querySelector('#main-content');
    if (!main) return;
    main.innerHTML = '';

    const nav = (r, d) => this.navigate(r, d);

    if (route === 'dashboard') {
      main.appendChild(DashboardPage.render(nav));
    } else if (route.startsWith('study-')) {
      const suId = route.split('-')[1];
      StudyUnitPage.activeTab = 'learn';
      main.appendChild(StudyUnitPage.render(suId, nav));
    } else if (route.startsWith('lesson-')) {
      // Direct lesson from sidebar
      const subId = route.split('lesson-')[1];
      const suId = subId.split('.')[0];
      StudyUnitPage.activeSubunit = null;
      const su = window.CIA_DATA.studyUnits.find(s => s.id === suId);
      const sub = su?.subunits.find(s => s.id === subId);
      if (su && sub) {
        StudyUnitPage.activeSubunit = sub;
        main.appendChild(StudyUnitPage.render(suId, nav));
      }
    } else if (route === 'practice') {
      const opts = this.routeData || {};
      main.appendChild(PracticePage.render(nav, opts));
    } else if (route === 'exam') {
      main.appendChild(ExamPage.render(nav));
    } else if (route === 'analytics') {
      main.appendChild(AnalyticsPage.render(nav));
    }

    this.updateTopbarStats();
    main.scrollTop = 0;
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());

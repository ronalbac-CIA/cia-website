// Main App Controller
const App = {
  route: 'dashboard',
  routeData: null,

  // Protected routes — yêu cầu trial_active hoặc subscriber_active.
  // Trial expired sẽ bị redirect sang 'pricing'.
  isProtectedRoute(r) {
    if (!r) return false;
    return r === 'dashboard' || r === 'practice' || r === 'exam' || r === 'analytics'
        || r.startsWith('study-') || r.startsWith('lesson-');
  },

  init() {
    Toast.init();
    if (typeof Lang !== 'undefined') Lang.apply();  // set body[data-lang] before first render
    if (!Auth.isLoggedIn()) {
      this.renderAuthShell('landing');
    } else {
      // If user just opened the app and is logged in, show part-select first.
      // The flag is set in sessionStorage after they pick a part for this session.
      if (sessionStorage.getItem('cia_part_picked') === '1') {
        this.buildShell();
        this.navigate('dashboard');
      } else {
        this.renderAuthShell('part-select');
      }
    }
    window.addEventListener('popstate', () => this.navigate(this.route));
  },

  // Sau khi register/login thành công — vào part-select
  afterAuth() {
    this.renderAuthShell('part-select');
  },

  // Sau khi pick part → mark session và vào app
  afterPartPicked() {
    sessionStorage.setItem('cia_part_picked', '1');
    this.buildShell();
    this.navigate('dashboard');
  },

  // Render khi chưa login HOẶC chưa pick part (landing/login/register/part-select)
  renderAuthShell(initialRoute) {
    const appEl = document.querySelector('#app');
    appEl.classList.add('app-auth-mode');
    appEl.innerHTML = '<div id="auth-root"></div>';

    const renderAuth = (route) => {
      const root = document.querySelector('#auth-root');
      if (!root) return;
      root.innerHTML = '';
      root.scrollTop = 0;
      window.scrollTo(0, 0);

      if (route === 'register') {
        root.appendChild(RegisterPage.render(renderAuth));
      } else if (route === 'login') {
        root.appendChild(LoginPage.render(renderAuth));
      } else if (route === 'part-select') {
        // Auth guard: must be logged in
        if (!Auth.isLoggedIn()) { renderAuth('login'); return; }
        root.appendChild(PartSelectPage.render((next) => {
          if (next === 'dashboard') this.afterPartPicked();
          else renderAuth(next);
        }));
      } else if (route === 'dashboard') {
        // Internal request from auth screens → go fully into app
        this.afterPartPicked();
      } else {
        // 'landing' or anything else
        root.appendChild(LandingPage.render(renderAuth));
      }
    };
    renderAuth(initialRoute || 'landing');
  },

  logout() {
    if (!confirm('Sign out?')) return;
    Auth.logout();
    sessionStorage.removeItem('cia_part_picked');
    document.querySelector('#app').classList.remove('app-auth-mode');
    document.querySelector('#app').innerHTML = '';
    this.renderAuthShell('landing');
    Toast.success('Đã đăng xuất.');
  },

  // Allow jumping back to part-select from inside the app (account menu)
  goToPartSelect() {
    sessionStorage.removeItem('cia_part_picked');
    document.querySelector('#app').classList.remove('app-auth-mode');
    document.querySelector('#app').innerHTML = '';
    this.renderAuthShell('part-select');
  },

  buildShell() {
    const appEl = document.querySelector('#app');
    appEl.classList.remove('app-auth-mode');
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
          <div class="topbar-account" id="topbar-account"></div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar" id="sidebar"></div>

      <!-- Main -->
      <div class="main-content" id="main-content"></div>
    `;

    document.querySelector('#brand-home').addEventListener('click', () => this.navigate('dashboard'));
    this.updateTopbarStats();
    this.updateTopbarAccount();
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

  updateTopbarAccount() {
    const el = document.querySelector('#topbar-account');
    if (!el) return;
    const user = Auth.currentUser();
    if (!user) { el.innerHTML = ''; return; }
    const status = Auth.getStatus(user);
    const rem = Auth.timeRemaining(user);

    let badgeText = '', badgeClass = 'badge-gray';
    if (status === 'trial_active') {
      badgeText = `Trial · ${rem.days}d ${rem.hours}h`;
      badgeClass = rem.days <= 2 ? 'badge-amber' : 'badge-blue';
    } else if (status === 'trial_expired') {
      badgeText = 'Trial expired';
      badgeClass = 'badge-red';
    } else if (status === 'subscriber_active') {
      badgeText = `Subscriber · ${rem.days}d`;
      badgeClass = 'badge-green';
    }

    el.innerHTML = `
      <div class="topbar-account-badge ${badgeClass}" id="acc-badge">${badgeText}</div>
      <div class="topbar-account-menu">
        <button class="topbar-account-btn" id="acc-btn">
          <span class="topbar-account-avatar">${user.username.charAt(0).toUpperCase()}</span>
          <span class="topbar-account-name">${user.username}</span>
          <span class="topbar-account-caret">▾</span>
        </button>
        <div class="topbar-account-dropdown hidden" id="acc-dropdown">
          <div class="topbar-account-dropdown-header">
            <div style="font-weight:700;color:var(--navy)">${user.username}</div>
            <div style="font-size:12px;color:var(--navy-600);margin-top:2px">
              ${status === 'subscriber_active' ? '⭐ Subscriber' : status === 'trial_active' ? '🎁 Free trial' : '⏰ Expired'}
            </div>
          </div>
          <div class="topbar-account-dropdown-item" data-action="part-select">📚 Switch CIA Part</div>
          <div class="topbar-account-dropdown-item" data-action="pricing">💳 Subscription &amp; Pricing</div>
          <div class="topbar-account-dropdown-item" data-action="analytics">📊 My Progress</div>
          <div class="topbar-account-dropdown-divider"></div>
          <div class="topbar-account-dropdown-item topbar-account-logout" data-action="logout">↪ Đăng xuất</div>
        </div>
      </div>
    `;

    const dropdown = el.querySelector('#acc-dropdown');
    el.querySelector('#acc-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => dropdown.classList.add('hidden'));
    el.querySelectorAll('[data-action]').forEach(item => {
      item.addEventListener('click', () => {
        const a = item.dataset.action;
        dropdown.classList.add('hidden');
        if (a === 'logout') this.logout();
        else if (a === 'part-select') this.goToPartSelect();
        else this.navigate(a);
      });
    });

    // Click trial badge → pricing
    el.querySelector('#acc-badge')?.addEventListener('click', () => this.navigate('pricing'));
  },

  navigate(route, data = null) {
    // ----- Access guard -----
    if (!Auth.isLoggedIn()) { this.renderAuthShell('login'); return; }
    if (this.isProtectedRoute(route) && !Auth.hasAccess()) {
      // Trial expired → redirect to pricing
      route = 'pricing';
      data = { reason: 'trial_expired' };
      if (Auth.getStatus() === 'trial_expired') {
        Toast.error('Your 7-day free trial has expired. Please subscribe to continue learning.');
      }
    }

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
    } else if (route === 'pricing') {
      main.appendChild(PricingPage.render(nav, data || {}));
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
    this.updateTopbarAccount();
    main.scrollTop = 0;
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());

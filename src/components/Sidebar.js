// Sidebar component
const Sidebar = {
  render(activeRoute) {
    const stats = Storage.getStats();
    const data = window.CIA_DATA;

    const navItems = [
      { id: 'dashboard', icon: '⊞', label: 'Dashboard', badge: null },
      { id: 'practice', icon: '✏️', label: 'Practice Mode', badge: null },
      { id: 'exam', icon: '📝', label: 'Exam Mode', badge: null },
      { id: 'analytics', icon: '📊', label: 'Analytics', badge: null },
      { id: 'pricing', icon: '💳', label: 'Subscription', badge: null },
    ];

    // Account block (status + logout)
    const user = window.Auth?.currentUser?.();
    const status = window.Auth?.getStatus?.(user);
    const rem = window.Auth?.timeRemaining?.(user);
    let accountBlock = '';
    if (user) {
      let statusLabel = '', statusClass = 'badge-gray';
      if (status === 'trial_active') { statusLabel = `Trial · còn ${rem.days}d`; statusClass = rem.days <= 2 ? 'badge-amber' : 'badge-blue'; }
      else if (status === 'subscriber_active') { statusLabel = `Subscriber · ${rem.days}d`; statusClass = 'badge-green'; }
      else if (status === 'trial_expired') { statusLabel = 'Trial expired'; statusClass = 'badge-red'; }
      accountBlock = `
        <div class="sidebar-account">
          <div class="sidebar-account-row">
            <div class="sidebar-account-avatar">${user.username.charAt(0).toUpperCase()}</div>
            <div style="flex:1;min-width:0">
              <div class="sidebar-account-name" title="${user.username}">${user.username}</div>
              <div class="badge ${statusClass}" style="margin-top:3px;font-size:10px">${statusLabel}</div>
            </div>
          </div>
          <button class="sidebar-account-logout" data-action="logout">↪ Đăng xuất</button>
        </div>`;
    }

    const isStudyRoute = activeRoute && activeRoute.startsWith('study-');
    const activeSuId = isStudyRoute ? activeRoute.split('-')[1] : null;

    let html = `<nav class="sidebar-nav">
      <div class="sidebar-section-label">Navigation</div>
      ${navItems.map(item => `
        <div class="sidebar-item ${activeRoute === item.id ? 'active' : ''}" data-route="${item.id}">
          <span class="sidebar-item-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.badge !== null ? `<span class="sidebar-item-badge">${item.badge}</span>` : ''}
        </div>
      `).join('')}

      <div class="sidebar-section-label" style="margin-top:8px">Study Units</div>
      ${data.studyUnits.map(su => {
        const isActiveSU = activeSuId === su.id;
        const suStats = Storage.getStudyUnitStats(su.id);
        const pct = su.totalQuestions > 0 ? Math.round(suStats.attempted / su.totalQuestions * 100) : 0;
        return `
          <div class="sidebar-item ${isActiveSU ? 'active' : ''}" data-route="study-${su.id}" style="padding-bottom:6px">
            <span class="sidebar-item-icon" style="font-size:14px">${su.icon}</span>
            <span style="font-size:12.5px; line-height:1.3">SU ${su.id}: ${su.title.split(' ').slice(0,3).join(' ')}</span>
            <span class="sidebar-item-badge">${pct}%</span>
          </div>
          ${isActiveSU ? su.subunits.map(sub => {
            const seen = Storage.get().lessonsSeen[sub.id];
            return `<div class="sidebar-su-item ${activeRoute === `lesson-${sub.id}` ? 'active' : ''}" data-route="lesson-${sub.id}">
              <span class="sidebar-su-dot"></span>
              <span>${sub.id} ${sub.title.substring(0,28)}${sub.title.length>28?'…':''}</span>
              ${seen ? '<span style="margin-left:auto;font-size:12px;color:var(--emerald)">✓</span>' : ''}
            </div>`;
          }).join('') : ''}
        `;
      }).join('')}
    </nav>
    ${accountBlock}`;

    return html;
  },

  mount(container, activeRoute, onNavigate) {
    container.innerHTML = this.render(activeRoute);
    container.querySelectorAll('[data-route]').forEach(el => {
      el.addEventListener('click', () => onNavigate(el.dataset.route));
    });
    container.querySelector('[data-action="logout"]')?.addEventListener('click', () => {
      App.logout();
    });
  }
};

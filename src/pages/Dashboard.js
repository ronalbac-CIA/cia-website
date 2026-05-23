// Dashboard page
const DashboardPage = {
  render(onNavigate) {
    const data = window.CIA_DATA;
    const stats = Storage.getStats();
    const globalStats = [
      { icon: '📚', value: data.meta.totalQuestions.toLocaleString(), label: 'Total Questions' },
      { icon: '✅', value: stats.attempted, label: 'Attempted' },
      { icon: '🎯', value: stats.accuracy + '%', label: 'Accuracy' },
      { icon: '🔖', value: stats.bookmarks, label: 'Bookmarked' },
    ];

    const container = document.createElement('div');
    container.className = 'page';

    // Account / trial status banner
    const user = Auth.currentUser();
    const status = Auth.getStatus(user);
    const rem = Auth.timeRemaining(user);

    // "Continue where you left off" card
    const progress = Storage.get();
    let continueCard = '';
    const lastId = progress.lastAccessedLesson;
    if (lastId) {
      const suId = lastId.split('.')[0];
      const su = data.studyUnits.find(s => s.id === suId);
      const sub = su?.subunits.find(s => s.id === lastId);
      if (sub) {
        const subStats = Storage.getSubunitStats(sub.id);
        const isDone = Storage.isLessonComplete(sub.id);
        continueCard = `
          <div class="continue-card" data-continue="${sub.id}">
            <div class="continue-card-meta">
              <span class="continue-card-eyebrow">${isDone ? '✓ Recently completed' : '📖 Continue where you left off'}</span>
              <span class="continue-card-suname" style="background:${su.lightColor};color:${su.color}">${su.icon} Study Unit ${su.id}</span>
            </div>
            <div class="continue-card-title">${sub.id} · ${sub.title}</div>
            <div class="continue-card-sub">${subStats.attempted} of ${(data.questions.filter(q=>q.subunit===sub.id)).length} questions attempted${subStats.attempted ? ` · ${subStats.accuracy}% accuracy` : ''}</div>
            <button class="btn btn-primary btn-sm">${isDone ? 'Review lesson' : 'Resume lesson'} →</button>
          </div>`;
      }
    }
    let banner = '';
    if (status === 'trial_active') {
      const lowDays = rem.days <= 2;
      const totalMs = Auth.TRIAL_DAYS * 24 * 60 * 60 * 1000;
      const usedPct = Math.min(100, Math.round((totalMs - rem.ms) / totalMs * 100));
      banner = `
        <div class="account-banner ${lowDays ? 'account-banner-warn' : ''}">
          <div class="account-banner-icon">${lowDays ? '⏳' : '🎁'}</div>
          <div class="account-banner-body">
            <div class="account-banner-title">
              ${lowDays ? 'Trial sắp hết hạn' : '7-day free trial đang hoạt động'}
            </div>
            <div class="account-banner-desc">
              Còn <strong>${rem.days} ngày ${rem.hours} giờ</strong> truy cập đầy đủ.
              Sau khi trial hết, bạn cần subscribe (50.000đ/tháng) để tiếp tục.
            </div>
            <div class="account-banner-progress">
              <div class="account-banner-progress-fill" style="width:${usedPct}%"></div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="banner-upgrade">Subscribe ngay</button>
        </div>`;
    } else if (status === 'subscriber_active') {
      banner = `
        <div class="account-banner account-banner-active">
          <div class="account-banner-icon">⭐</div>
          <div class="account-banner-body">
            <div class="account-banner-title">Subscriber Active</div>
            <div class="account-banner-desc">
              Plan: <strong>CIA Part 1 Monthly</strong> · Hết hạn sau ${rem.days} ngày ${rem.hours} giờ.
            </div>
          </div>
          <button class="btn btn-outline btn-sm" id="banner-manage">Quản lý</button>
        </div>`;
    }

    container.innerHTML = `
      ${banner}
      ${continueCard}
      <div class="dashboard-header">
        <div class="dashboard-greeting">Hi ${user?.username || ''}, ready to study?</div>
        <div class="dashboard-subtitle">Track your progress across all 10 Study Units · ${data.meta.totalQuestions} practice questions</div>
      </div>

      <div class="stats-row">
        ${globalStats.map(s => `
          <div class="stat-card">
            <div class="stat-card-icon">${s.icon}</div>
            <div class="stat-card-value">${s.value}</div>
            <div class="stat-card-label">${s.label}</div>
          </div>
        `).join('')}
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-size:18px;font-weight:700;color:var(--navy)">Study Units</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" id="btn-practice-all">Practice All</button>
          <button class="btn btn-primary btn-sm" id="btn-exam-now">Start Exam</button>
        </div>
      </div>

      <div class="su-grid" id="su-grid">
        ${data.studyUnits.map(su => {
          const suStats = Storage.getStudyUnitStats(su.id);
          const pct = su.totalQuestions > 0 ? Math.round(suStats.attempted / su.totalQuestions * 100) : 0;
          const status = Helpers.getUnitStatus(su.id, su.totalQuestions);
          return `
            <div class="su-card" data-su="${su.id}" style="padding-left:24px">
              <div class="su-card-stripe" style="background:${su.color}"></div>
              <div class="su-card-header">
                <div class="su-card-icon">${su.icon}</div>
                <div class="su-card-info">
                  <div class="su-card-num">Study Unit ${su.id} · ${su.examSection} · ${su.weight}</div>
                  <div class="su-card-title">${su.title}</div>
                </div>
                <span class="badge ${Helpers.statusClass(status)}">${Helpers.statusLabel(status)}</span>
              </div>
              <div class="su-card-meta">
                <div class="su-card-meta-item"><span class="su-card-meta-val">${su.subunits.length}</span> subunits</div>
                <div class="su-card-meta-item"><span class="su-card-meta-val">${su.totalQuestions}</span> questions</div>
                <div class="su-card-meta-item"><span class="su-card-meta-val">${suStats.attempted}</span> attempted</div>
                ${suStats.attempted > 0 ? `<div class="su-card-meta-item"><span class="su-card-meta-val" style="color:${Helpers.accuracyColor(suStats.accuracy)}">${suStats.accuracy}%</span> accuracy</div>` : ''}
              </div>
              <div class="su-card-progress-row">
                <div class="progress-bar" style="flex:1">
                  <div class="progress-fill progress-fill-blue" style="width:${pct}%;background:${su.color}"></div>
                </div>
                <div class="su-card-progress-pct">${pct}%</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Attach events
    container.querySelectorAll('.su-card').forEach(card => {
      card.addEventListener('click', () => onNavigate('study-' + card.dataset.su));
    });
    container.querySelector('#btn-practice-all')?.addEventListener('click', () => onNavigate('practice'));
    container.querySelector('#btn-exam-now')?.addEventListener('click', () => onNavigate('exam'));
    container.querySelector('#banner-upgrade')?.addEventListener('click', () => onNavigate('pricing'));
    container.querySelector('#banner-manage')?.addEventListener('click', () => onNavigate('pricing'));
    container.querySelector('[data-continue]')?.addEventListener('click', (e) => {
      const subId = container.querySelector('[data-continue]').dataset.continue;
      onNavigate('lesson-' + subId);
    });

    return container;
  }
};

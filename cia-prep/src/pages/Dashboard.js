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

    container.innerHTML = `
      <div class="dashboard-header">
        <div class="dashboard-greeting">CIA Part 1 Study Dashboard</div>
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

    return container;
  }
};

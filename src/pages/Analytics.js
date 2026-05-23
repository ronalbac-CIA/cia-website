// Analytics page
const AnalyticsPage = {
  render(onNavigate) {
    const data = window.CIA_DATA;
    const globalStats = Storage.getStats();
    const progress = Storage.get();

    const container = document.createElement('div');
    container.className = 'page';

    // Build per-unit stats
    const unitData = data.studyUnits.map(su => {
      const stats = Storage.getStudyUnitStats(su.id);
      return { ...su, stats };
    });

    // Recent exam history
    const exams = (progress.examHistory || []).slice(-5).reverse();

    // Weak areas: subunits with lowest accuracy
    const subStats = [];
    for (const su of data.studyUnits) {
      for (const sub of su.subunits) {
        const stats = Storage.getSubunitStats(sub.id);
        if (stats.attempted >= 3) {
          subStats.push({ id: sub.id, title: sub.title, suTitle: su.title, ...stats });
        }
      }
    }
    const weakAreas = subStats.filter(s => s.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
    const strongAreas = subStats.filter(s => s.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);

    container.innerHTML = `
      <div style="margin-bottom:28px">
        <div style="font-family:var(--font-serif);font-size:28px;color:var(--navy);margin-bottom:6px">Analytics & Progress</div>
        <div style="font-size:14px;color:var(--navy-600)">Track your performance across all study units</div>
      </div>

      <!-- Overall stats -->
      <div class="stats-row" style="margin-bottom:28px">
        <div class="stat-card">
          <div class="stat-card-icon">✅</div>
          <div class="stat-card-value">${globalStats.attempted}</div>
          <div class="stat-card-label">Questions Attempted</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">🎯</div>
          <div class="stat-card-value" style="color:${Helpers.accuracyColor(globalStats.accuracy)}">${globalStats.accuracy}%</div>
          <div class="stat-card-label">Overall Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">📖</div>
          <div class="stat-card-value">${globalStats.lessonsRead}</div>
          <div class="stat-card-label">Lessons Read</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">🔖</div>
          <div class="stat-card-value">${globalStats.bookmarks}</div>
          <div class="stat-card-label">Bookmarked</div>
        </div>
      </div>

      <div class="analytics-grid">

        <!-- Accuracy by Study Unit -->
        <div class="analytics-card" style="grid-column:1/-1">
          <div class="analytics-card-title">Accuracy by Study Unit</div>
          ${unitData.map(su => {
            const pct = su.stats.accuracy;
            const barColor = Helpers.accuracyColor(pct);
            const coverage = su.totalQuestions > 0 ? Math.round(su.stats.attempted / su.totalQuestions * 100) : 0;
            return `<div class="analytics-unit-row">
              <span style="font-size:14px;flex-shrink:0">${su.icon}</span>
              <span class="analytics-unit-name" title="${su.title}">SU${su.id}: ${su.title.substring(0,22)}</span>
              <div class="analytics-unit-bar">
                <div class="analytics-unit-fill" style="width:${pct}%;background:${barColor}"></div>
              </div>
              <span class="analytics-unit-pct" style="color:${barColor}">${su.stats.attempted > 0 ? pct + '%' : '—'}</span>
              <span style="font-size:11px;color:var(--slate-400);min-width:70px;text-align:right">${su.stats.attempted}/${su.totalQuestions} done</span>
            </div>`;
          }).join('')}
        </div>

        <!-- Weak Areas -->
        <div class="analytics-card">
          <div class="analytics-card-title">⚠️ Weak Areas (< 70%)</div>
          ${weakAreas.length === 0
            ? '<div class="empty-state" style="padding:24px 0"><div class="empty-state-icon">🎉</div><div class="empty-state-title">No weak areas yet!</div><div class="empty-state-text">Attempt more questions to see weak areas.</div></div>'
            : weakAreas.map(s => `
              <div class="analytics-unit-row" style="cursor:pointer" data-subunit="${s.id}">
                <span class="analytics-unit-name" title="${s.title}">${s.id}: ${s.title.substring(0,20)}</span>
                <div class="analytics-unit-bar">
                  <div class="analytics-unit-fill" style="width:${s.accuracy}%;background:${Helpers.accuracyColor(s.accuracy)}"></div>
                </div>
                <span class="analytics-unit-pct" style="color:${Helpers.accuracyColor(s.accuracy)}">${s.accuracy}%</span>
              </div>
            `).join('')
          }
        </div>

        <!-- Strong Areas -->
        <div class="analytics-card">
          <div class="analytics-card-title">⭐ Strong Areas (≥ 80%)</div>
          ${strongAreas.length === 0
            ? '<div class="empty-state" style="padding:24px 0"><div class="empty-state-icon">📚</div><div class="empty-state-title">Keep practicing!</div><div class="empty-state-text">Answer questions to identify your strengths.</div></div>'
            : strongAreas.map(s => `
              <div class="analytics-unit-row">
                <span class="analytics-unit-name" title="${s.title}">${s.id}: ${s.title.substring(0,20)}</span>
                <div class="analytics-unit-bar">
                  <div class="analytics-unit-fill" style="width:${s.accuracy}%;background:${Helpers.accuracyColor(s.accuracy)}"></div>
                </div>
                <span class="analytics-unit-pct" style="color:${Helpers.accuracyColor(s.accuracy)}">${s.accuracy}%</span>
              </div>
            `).join('')
          }
        </div>

        <!-- Exam History -->
        <div class="analytics-card" style="grid-column:1/-1">
          <div class="analytics-card-title">📝 Recent Exam History</div>
          ${exams.length === 0
            ? '<div class="text-muted" style="font-size:13px">No exams taken yet. <span style="color:var(--blue);cursor:pointer" data-nav="exam">Start an exam →</span></div>'
            : `<div style="overflow-x:auto">
              <table style="width:100%;border-collapse:collapse;font-size:13px">
                <thead>
                  <tr style="border-bottom:1px solid var(--slate-200)">
                    <th style="text-align:left;padding:8px 12px;color:var(--navy-600);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Date</th>
                    <th style="text-align:left;padding:8px 12px;color:var(--navy-600);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Score</th>
                    <th style="text-align:left;padding:8px 12px;color:var(--navy-600);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Questions</th>
                    <th style="text-align:left;padding:8px 12px;color:var(--navy-600);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Time</th>
                    <th style="text-align:left;padding:8px 12px;color:var(--navy-600);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Result</th>
                  </tr>
                </thead>
                <tbody>
                  ${exams.map(e => {
                    const date = new Date(e.timestamp).toLocaleDateString();
                    const color = e.score >= 75 ? '#059669' : e.score >= 60 ? '#d97706' : '#e11d48';
                    return `<tr style="border-bottom:1px solid var(--slate-100)">
                      <td style="padding:10px 12px">${date}</td>
                      <td style="padding:10px 12px;font-weight:800;color:${color}">${e.score}%</td>
                      <td style="padding:10px 12px">${e.correct}/${e.total}</td>
                      <td style="padding:10px 12px">${Helpers.formatTime(e.timeUsed || 0)}</td>
                      <td style="padding:10px 12px"><span class="badge ${e.score >= 75 ? 'badge-green' : 'badge-red'}">${e.score >= 75 ? 'PASS' : 'FAIL'}</span></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>`
          }
        </div>

      </div>

      <div style="margin-top:24px;display:flex;gap:10px">
        <button class="btn btn-outline btn-sm" id="reset-progress">Reset All Progress</button>
      </div>
    `;

    // Navigate to practice for weak areas
    container.querySelectorAll('[data-subunit]').forEach(el => {
      el.addEventListener('click', () => {
        PracticePage.filterSub = el.dataset.subunit;
        PracticePage.filterSU = el.dataset.subunit.split('.')[0];
        onNavigate('practice');
      });
    });

    container.querySelector('[data-nav="exam"]')?.addEventListener('click', () => onNavigate('exam'));

    container.querySelector('#reset-progress')?.addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) {
        Storage.reset();
        App.navigate('analytics');
        Toast.success('Progress reset');
      }
    });

    return container;
  }
};

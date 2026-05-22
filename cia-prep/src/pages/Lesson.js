// Lesson page
const LessonPage = {
  render(su, sub, onNavigate) {
    const data = window.CIA_DATA;
    const container = document.createElement('div');
    container.className = 'lesson-content';

    // Build learning objectives from content
    const contentLines = (sub.content || '').split('\n').filter(l => l.trim());
    const objectives = this.extractObjectives(contentLines, su.id, sub.id);
    const bodyHtml = Helpers.formatContent(sub.content);

    // Questions in this subunit
    const subQs = data.questions.filter(q => q.subunit === sub.id);
    const subStats = Storage.getSubunitStats(sub.id);

    container.innerHTML = `
      <div class="lesson-header">
        <div class="lesson-breadcrumb">
          <span style="cursor:pointer;color:var(--blue)" data-nav="dashboard">Dashboard</span>
          <span>›</span>
          <span>Study Unit ${su.id}</span>
          <span>›</span>
          <span>${sub.id}</span>
        </div>
        <div class="lesson-title">${sub.title}</div>
        <div class="lesson-meta">
          <span class="badge" style="background:${su.lightColor};color:${su.color}">${su.icon} SU ${su.id}</span>
          <span class="badge badge-gray">${subQs.length} practice questions</span>
          ${subStats.attempted > 0 ? `<span class="badge badge-green">${subStats.accuracy}% accuracy (${subStats.attempted} done)</span>` : ''}
        </div>
      </div>

      ${objectives.length > 0 ? `
      <div class="lesson-objectives">
        <div class="lesson-objectives-title">Learning Objectives</div>
        <ul>${objectives.map(o => `<li>${Helpers.escHtml(o)}</li>`).join('')}</ul>
      </div>` : ''}

      <div class="lesson-body">
        ${bodyHtml}
      </div>

      <div style="margin-top:32px;padding:20px;background:var(--slate-50);border-radius:var(--radius);border:1px solid var(--slate-200)">
        <div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:12px">📝 Practice Questions for ${sub.id}</div>
        <div style="font-size:13px;color:var(--navy-600);margin-bottom:14px">${subQs.length} questions available · ${subStats.attempted} attempted · ${subStats.accuracy}% accuracy</div>
        <button class="btn btn-primary btn-sm" data-nav="practice-${sub.id}">Start Practice →</button>
      </div>

      <div class="lesson-nav">
        <button class="lesson-nav-btn" data-nav-prev="${sub.id}">← Previous</button>
        <div style="font-size:12px;color:var(--navy-600)">${sub.id}: ${sub.title}</div>
        <button class="lesson-nav-btn primary" data-nav-next="${sub.id}">Next Subunit →</button>
      </div>
    `;

    // Wire navigation links
    container.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const nav = el.dataset.nav;
        if (nav.startsWith('practice-')) onNavigate('practice', { subunit: nav.split('-')[1] });
        else onNavigate(nav);
      });
    });

    // Prev/Next navigation
    container.querySelectorAll('[data-nav-prev]').forEach(el => {
      el.addEventListener('click', () => {
        const subunits = data.studyUnits.find(s => s.id === su.id)?.subunits || [];
        const idx = subunits.findIndex(s => s.id === sub.id);
        if (idx > 0) {
          const prev = subunits[idx - 1];
          // Update active in parent
          const items = document.querySelectorAll('.su-subunit-item');
          items.forEach(i => { i.classList.toggle('active', i.dataset.subunit === prev.id); });
          StudyUnitPage.activeSubunit = prev;
          const tabContent = document.querySelector('#su-tab-content');
          if (tabContent) { tabContent.innerHTML = ''; tabContent.appendChild(LessonPage.render(su, prev, onNavigate)); Storage.markLessonSeen(prev.id); }
        }
      });
    });

    container.querySelectorAll('[data-nav-next]').forEach(el => {
      el.addEventListener('click', () => {
        const subunits = data.studyUnits.find(s => s.id === su.id)?.subunits || [];
        const idx = subunits.findIndex(s => s.id === sub.id);
        if (idx < subunits.length - 1) {
          const next = subunits[idx + 1];
          const items = document.querySelectorAll('.su-subunit-item');
          items.forEach(i => { i.classList.toggle('active', i.dataset.subunit === next.id); });
          StudyUnitPage.activeSubunit = next;
          const tabContent = document.querySelector('#su-tab-content');
          if (tabContent) { tabContent.innerHTML = ''; tabContent.appendChild(LessonPage.render(su, next, onNavigate)); Storage.markLessonSeen(next.id); }
        } else {
          // Last subunit of this SU - go to next SU
          const allSUs = data.studyUnits;
          const suIdx = allSUs.findIndex(s => s.id === su.id);
          if (suIdx < allSUs.length - 1) {
            onNavigate('study-' + allSUs[suIdx + 1].id);
          }
        }
      });
    });

    return container;
  },

  extractObjectives(lines, suId, subId) {
    // Extract bullet objectives from the first part of content
    const objectives = [];
    let foundSection = false;
    for (const line of lines.slice(0, 30)) {
      if (line.includes('learning objective') || line.includes('objective')) foundSection = true;
      if (foundSection && (line.startsWith('●') || line.startsWith('■'))) {
        objectives.push(line.replace(/^[●■]\s*/, '').trim());
        if (objectives.length >= 5) break;
      }
    }
    // Default objectives if none found
    if (objectives.length === 0) {
      return [
        `Understand key concepts in ${subId}`,
        `Apply knowledge to CIA exam questions`,
        `Identify important definitions and frameworks`
      ];
    }
    return objectives;
  }
};

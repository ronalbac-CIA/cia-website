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
    const definitions = this.extractDefinitions(sub.content || '');
    const keyPoints = this.extractKeyPoints(sub.content || '', sub.title);
    const examTips = this.examTipsFor(su, sub);
    const wordCount = (sub.content || '').split(/\s+/).filter(Boolean).length;
    const readMin = Math.max(3, Math.round(wordCount / 200));

    // Questions in this subunit
    const subQs = data.questions.filter(q => q.subunit === sub.id);
    const subStats = Storage.getSubunitStats(sub.id);

    container.innerHTML = `
      <div class="lesson-reading-progress" id="lesson-prog-bar"><div class="lesson-reading-progress-fill" id="lesson-prog-fill"></div></div>

      <div class="lesson-header">
        <div class="lesson-breadcrumb">
          <span style="cursor:pointer;color:var(--blue)" data-nav="dashboard">Dashboard</span>
          <span>›</span>
          <span>Study Unit ${su.id}</span>
          <span>›</span>
          <span>${sub.id}</span>
        </div>
        <div class="lesson-title-row">
          <div class="lesson-title">${sub.title}</div>
          <div class="lesson-title-actions">
            <button class="lesson-action-btn ${Storage.isLessonBookmarked(sub.id) ? 'active' : ''}" id="lesson-bookmark" title="Bookmark this lesson">
              <span class="lesson-action-icon">${Storage.isLessonBookmarked(sub.id) ? '🔖' : '🏷️'}</span>
              <span class="lesson-action-label">${Storage.isLessonBookmarked(sub.id) ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
            <button class="lesson-action-btn ${Storage.isLessonComplete(sub.id) ? 'active complete' : ''}" id="lesson-complete" title="Mark this lesson as completed">
              <span class="lesson-action-icon">${Storage.isLessonComplete(sub.id) ? '✓' : '○'}</span>
              <span class="lesson-action-label">${Storage.isLessonComplete(sub.id) ? 'Completed' : 'Mark complete'}</span>
            </button>
          </div>
        </div>
        <div class="lesson-meta">
          <span class="badge" style="background:${su.lightColor};color:${su.color}">${su.icon} SU ${su.id}</span>
          <span class="badge badge-gray">${subQs.length} practice questions</span>
          <span class="badge badge-gray">⏱ ~${readMin} min read</span>
          ${subStats.attempted > 0 ? `<span class="badge badge-green">${subStats.accuracy}% accuracy (${subStats.attempted} done)</span>` : ''}
        </div>
      </div>

      ${objectives.length > 0 ? `
      <div class="lesson-objectives">
        <div class="lesson-objectives-title">Learning Objectives</div>
        <ul>${objectives.map(o => `<li>${Helpers.escHtml(o)}</li>`).join('')}</ul>
      </div>` : ''}

      ${definitions.length > 0 ? `
      <div class="lesson-definitions">
        <div class="lesson-section-eyebrow">📘 Key Definitions</div>
        <div class="lesson-definitions-grid">
          ${definitions.map(d => `
            <div class="lesson-def-card">
              <div class="lesson-def-term">${Helpers.escHtml(d.term)}</div>
              <div class="lesson-def-text">${Helpers.escHtml(d.text)}</div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <div class="lesson-body">
        ${bodyHtml}
      </div>

      ${keyPoints.length > 0 ? `
      <div class="lesson-recap">
        <div class="lesson-section-eyebrow">🎯 Recap — những điều cần nhớ</div>
        <ol class="lesson-recap-list">
          ${keyPoints.map(k => `<li>${Helpers.escHtml(k)}</li>`).join('')}
        </ol>
      </div>` : ''}

      <div class="lesson-exam-tips">
        <div class="lesson-section-eyebrow">⚠️ Common Exam Pitfalls</div>
        <ul class="lesson-exam-tips-list">
          ${examTips.map(t => `<li>${Helpers.escHtml(t)}</li>`).join('')}
        </ul>
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

    // Wire bookmark / mark-complete
    container.querySelector('#lesson-bookmark')?.addEventListener('click', () => {
      const isNow = Storage.toggleLessonBookmark(sub.id);
      const btn = container.querySelector('#lesson-bookmark');
      btn.classList.toggle('active', isNow);
      btn.querySelector('.lesson-action-icon').textContent = isNow ? '🔖' : '🏷️';
      btn.querySelector('.lesson-action-label').textContent = isNow ? 'Bookmarked' : 'Bookmark';
      Toast.success(isNow ? 'Lesson bookmarked' : 'Bookmark removed');
    });
    container.querySelector('#lesson-complete')?.addEventListener('click', () => {
      const cur = Storage.isLessonComplete(sub.id);
      Storage.markLessonComplete(sub.id, !cur);
      const btn = container.querySelector('#lesson-complete');
      btn.classList.toggle('active', !cur);
      btn.classList.toggle('complete', !cur);
      btn.querySelector('.lesson-action-icon').textContent = !cur ? '✓' : '○';
      btn.querySelector('.lesson-action-label').textContent = !cur ? 'Completed' : 'Mark complete';
      if (!cur) Toast.success('Lesson marked as completed! 🎉');
      // refresh sidebar checks
      const items = document.querySelectorAll('.su-subunit-item');
      items.forEach(i => {
        if (i.dataset.subunit === sub.id) {
          // toggle check mark
          let check = i.querySelector('.su-subunit-item-check');
          if (!cur) {
            if (!check) {
              check = document.createElement('span');
              check.className = 'su-subunit-item-check';
              check.textContent = '✓';
              i.appendChild(check);
            }
          } else if (check) check.remove();
        }
      });
    });

    // Reading progress bar tied to scroll within .su-right container
    setTimeout(() => {
      const scroller = document.querySelector('.su-right');
      const fill = document.querySelector('#lesson-prog-fill');
      if (!scroller || !fill) return;
      const update = () => {
        const max = scroller.scrollHeight - scroller.clientHeight;
        const pct = max > 0 ? Math.min(100, Math.max(0, (scroller.scrollTop / max) * 100)) : 0;
        fill.style.width = pct + '%';
        // Auto-mark seen when scrolled past 80%
        if (pct > 80 && !Storage.get().lessonsSeen[sub.id]) Storage.markLessonSeen(sub.id);
      };
      scroller.addEventListener('scroll', update);
      update();
    }, 50);

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
  },

  // Extract definitions: "Term is defined as ..." / "Term — definition" / "Term: definition"
  extractDefinitions(raw) {
    const defs = [];
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 20 && l.length < 320);
    const seen = new Set();

    // Pattern 1: "X is defined as ..."
    for (const line of lines) {
      let m = line.match(/^([A-Z][A-Za-z &/\-]{2,50})\s+is defined as\s+(.+)$/);
      if (m && !seen.has(m[1].toLowerCase())) {
        defs.push({ term: m[1].trim(), text: m[2].trim().replace(/^["“]|["”]\.?$/g, '') });
        seen.add(m[1].toLowerCase());
        if (defs.length >= 4) return defs;
      }
    }
    // Pattern 2: "Term — text" or "Term: text" at line start (Title Case term <= 6 words)
    for (const line of lines) {
      let m = line.match(/^([A-Z][A-Za-z][A-Za-z &/\-]{2,60})(?:\s+[—–:-])\s+(.{30,})$/);
      if (m) {
        const term = m[1].trim();
        if (term.split(' ').length > 6) continue;
        if (seen.has(term.toLowerCase())) continue;
        // skip if looks like a heading/numbered title
        if (/^\d/.test(term)) continue;
        defs.push({ term, text: m[2].trim() });
        seen.add(term.toLowerCase());
        if (defs.length >= 4) return defs;
      }
    }
    return defs;
  },

  // Extract concise recap bullets — pick first few impactful sentences.
  extractKeyPoints(raw, fallbackTitle) {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const candidates = [];
    for (const line of lines) {
      if (/^\d+$/.test(line)) continue;
      if (line.includes('Gleim') || line.includes('Copyright')) continue;
      if (line.length < 40 || line.length > 240) continue;
      if (line.startsWith('●') || line.startsWith('■') || line.startsWith('-')) {
        candidates.push(line.replace(/^[●■\-]\s*/, ''));
      } else if (/\b(must|should|key|important|always|never|primary|essential|requires?)\b/i.test(line)) {
        candidates.push(line);
      }
      if (candidates.length >= 12) break;
    }
    const picks = candidates.slice(0, 4);
    if (picks.length === 0) {
      return [
        `Nắm vững khái niệm cốt lõi của "${fallbackTitle}".`,
        `Liên hệ với IPPF Standards và Code of Ethics khi áp dụng.`,
        `Phân biệt rõ giữa assurance services và consulting services.`,
      ];
    }
    return picks;
  },

  // Generic exam pitfalls — phù hợp với phần lớn subunit của CIA Part 1.
  examTipsFor(su, sub) {
    const generic = [
      'Đọc kỹ stem 2 lần — CIA thường có 2 đáp án "đúng" nhưng chỉ 1 đáp án "tốt nhất".',
      'Cảnh giác với từ EXCEPT, NOT, LEAST — gạch chân ngay khi nhìn thấy.',
      'Phân biệt giữa Internal Audit Charter, Standards, và Code of Ethics — cả 3 là 3 tài liệu khác nhau.',
      'Khi câu hỏi liên quan đến independence/objectivity, ưu tiên đáp án liên quan đến reporting line đến Board / Audit Committee.',
    ];
    // Tailor a couple by SU
    const id = su?.id;
    if (id === '1' || id === '2') {
      return [
        'Không nhầm "Independence" (organizational) với "Objectivity" (individual mindset).',
        'Internal Audit Activity báo cáo functionally cho Board, administratively cho CEO.',
        ...generic.slice(0, 2),
      ];
    }
    if (id === '3') {
      return [
        'Sai lầm phổ biến: chọn đáp án có "ensure" — IA không bao giờ ensure, chỉ provide reasonable assurance.',
        'Phân biệt rõ inherent risk, control risk, detection risk trong audit risk model.',
        ...generic.slice(0, 2),
      ];
    }
    if (id === '4' || id === '5') {
      return [
        'Engagement Planning luôn bắt đầu bằng objective + scope, KHÔNG phải bằng resource allocation.',
        'Risk assessment phải đi TRƯỚC khi xây audit program.',
        ...generic.slice(0, 2),
      ];
    }
    return generic;
  }
};

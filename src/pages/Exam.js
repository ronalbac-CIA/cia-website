// Exam Mode page
const ExamPage = {
  questions: [],
  answers: {},
  flags: {},
  currentIdx: 0,
  timer: null,
  timeLeft: 0,
  totalTime: 0,
  examStarted: false,
  examFinished: false,

  render(onNavigate) {
    if (this.examStarted && !this.examFinished) {
      return this.renderExamActive(onNavigate);
    }
    if (this.examFinished) {
      return this.renderResults(onNavigate);
    }
    return this.renderSetup(onNavigate);
  },

  renderSetup(onNavigate) {
    const data = window.CIA_DATA;
    const container = document.createElement('div');
    container.className = 'setup-screen';

    container.innerHTML = `
      <div class="setup-card">
        <h2>🎓 Exam Mode</h2>
        <p>Simulate the CIA Part 1 exam experience. Questions are randomized; answers are revealed only after submission.</p>

        <div style="margin-bottom:20px">
          <div class="setup-option selected" data-mode="full">
            <span class="setup-option-icon">📋</span>
            <div>
              <div class="setup-option-title">Full Exam Simulation</div>
              <div class="setup-option-desc">100 questions · 150 minutes · Mixed from all units</div>
            </div>
          </div>
          <div class="setup-option" data-mode="mini">
            <span class="setup-option-icon">⚡</span>
            <div>
              <div class="setup-option-title">Mini Exam</div>
              <div class="setup-option-desc">25 questions · 40 minutes</div>
            </div>
          </div>
          <div class="setup-option" data-mode="unit">
            <span class="setup-option-icon">🎯</span>
            <div>
              <div class="setup-option-title">Study Unit Focus</div>
              <div class="setup-option-desc">20 questions from a specific unit · 30 minutes</div>
            </div>
          </div>
        </div>

        <div class="setup-row" id="unit-select-row" style="display:none">
          <div class="setup-field">
            <label>Study Unit</label>
            <select id="exam-su-select">
              ${data.studyUnits.map(su => `<option value="${su.id}">${su.id}. ${su.title}</option>`).join('')}
            </select>
          </div>
        </div>

        <button class="btn btn-primary w-full btn-lg" id="start-exam">Start Exam →</button>
      </div>
    `;

    let selectedMode = 'full';
    container.querySelectorAll('.setup-option').forEach(opt => {
      opt.addEventListener('click', () => {
        container.querySelectorAll('.setup-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedMode = opt.dataset.mode;
        const unitRow = container.querySelector('#unit-select-row');
        unitRow.style.display = selectedMode === 'unit' ? 'flex' : 'none';
      });
    });

    container.querySelector('#start-exam').addEventListener('click', () => {
      const allQs = data.questions;
      let pool, qCount, minutes;

      if (selectedMode === 'full') {
        pool = Helpers.shuffle(allQs).slice(0, 100);
        qCount = pool.length; minutes = 150;
      } else if (selectedMode === 'mini') {
        pool = Helpers.shuffle(allQs).slice(0, 25);
        qCount = pool.length; minutes = 40;
      } else {
        const suId = container.querySelector('#exam-su-select').value;
        const suQs = allQs.filter(q => q.studyUnit === suId);
        pool = Helpers.shuffle(suQs).slice(0, 20);
        qCount = pool.length; minutes = 30;
      }

      this.questions = pool;
      this.answers = {};
      this.flags = {};
      this.currentIdx = 0;
      this.timeLeft = minutes * 60;
      this.totalTime = minutes * 60;
      this.examStarted = true;
      this.examFinished = false;

      App.navigate('exam');
    });

    return container;
  },

  renderExamActive(onNavigate) {
    const container = document.createElement('div');
    container.className = 'exam-layout';
    container.id = 'exam-layout';

    const q = this.questions[this.currentIdx];

    container.innerHTML = `
      <div class="exam-sidebar">
        <div class="exam-sidebar-header">
          <div class="exam-timer" id="exam-timer">${Helpers.formatTime(this.timeLeft)}</div>
          <div class="exam-timer-label">Time Remaining</div>
        </div>
        <div class="exam-progress-info">
          <div class="exam-progress-text">${Object.keys(this.answers).length} / ${this.questions.length} answered</div>
          <div class="exam-progress-bar">
            <div class="exam-progress-fill" id="exam-prog" style="width:${Object.keys(this.answers).length/this.questions.length*100}%"></div>
          </div>
        </div>
        <div class="exam-q-grid" id="exam-q-grid">
          ${this.questions.map((q, i) => {
            const cls = i === this.currentIdx ? 'current' : this.flags[q.id] ? 'flagged' : this.answers[q.id] ? 'answered' : '';
            return `<div class="exam-q-btn ${cls}" data-idx="${i}">${i + 1}</div>`;
          }).join('')}
        </div>
        <div class="exam-sidebar-footer">
          <button class="btn btn-danger w-full" id="submit-exam">Submit Exam</button>
        </div>
      </div>

      <div class="exam-main">
        <div class="exam-q-counter">Question ${this.currentIdx + 1} of ${this.questions.length}</div>
        <div id="exam-q-content"></div>
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" id="exam-prev" ${this.currentIdx === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="btn btn-outline btn-sm" id="exam-flag">${this.flags[q?.id] ? '🔖 Unflag' : '🏷️ Flag for Review'}</button>
          <button class="btn btn-secondary btn-sm" id="exam-next">${this.currentIdx < this.questions.length - 1 ? 'Next →' : 'Review All'}</button>
        </div>
      </div>
    `;

    // Render question
    this.renderExamQuestion(container.querySelector('#exam-q-content'), q);

    // Wire Q grid navigation
    container.querySelectorAll('.exam-q-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentIdx = parseInt(btn.dataset.idx);
        App.navigate('exam');
      });
    });

    // Prev/Next
    container.querySelector('#exam-prev')?.addEventListener('click', () => { if (this.currentIdx > 0) { this.currentIdx--; App.navigate('exam'); } });
    container.querySelector('#exam-next')?.addEventListener('click', () => {
      if (this.currentIdx < this.questions.length - 1) { this.currentIdx++; App.navigate('exam'); }
    });

    // Flag
    container.querySelector('#exam-flag')?.addEventListener('click', () => {
      if (this.flags[q.id]) delete this.flags[q.id];
      else this.flags[q.id] = true;
      App.navigate('exam');
    });

    // Submit
    container.querySelector('#submit-exam')?.addEventListener('click', () => {
      if (!confirm(`Submit exam? You have answered ${Object.keys(this.answers).length} of ${this.questions.length} questions.`)) return;
      this.finishExam(onNavigate);
    });

    // Timer
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      const timerEl = document.querySelector('#exam-timer');
      if (timerEl) timerEl.textContent = Helpers.formatTime(this.timeLeft);
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.finishExam(onNavigate);
      }
    }, 1000);

    return container;
  },

  renderExamQuestion(container, q) {
    if (!q) return;
    const selectedLetter = this.answers[q.id];

    container.innerHTML = `
      <div class="question-card">
        <div class="question-stem">${Helpers.escHtml(q.stem)}</div>
        <div class="options-list">
          ${q.options.map(opt => `
            <button class="option-btn ${selectedLetter === opt.letter ? 'selected' : ''}" data-letter="${opt.letter}">
              <span class="option-letter">${opt.letter}</span>
              <span class="option-text">${Helpers.escHtml(opt.text)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.answers[q.id] = btn.dataset.letter;
        container.querySelectorAll('.option-btn').forEach(b => b.classList.toggle('selected', b.dataset.letter === btn.dataset.letter));
        // Update grid
        const gridBtn = document.querySelector(`.exam-q-btn[data-idx="${this.currentIdx}"]`);
        if (gridBtn && !this.flags[q.id]) { gridBtn.classList.remove('current'); gridBtn.classList.add('answered'); }
        // Update progress
        const prog = document.querySelector('#exam-prog');
        if (prog) prog.style.width = (Object.keys(this.answers).length / this.questions.length * 100) + '%';
        const info = document.querySelector('.exam-progress-text');
        if (info) info.textContent = `${Object.keys(this.answers).length} / ${this.questions.length} answered`;
      });
    });
  },

  finishExam(onNavigate) {
    clearInterval(this.timer);
    this.examFinished = true;

    // Calculate results
    let correct = 0;
    const byUnit = {};
    for (const q of this.questions) {
      const selected = this.answers[q.id];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correct++;
      Storage.recordAnswer(q.id, selected || '', isCorrect);

      if (!byUnit[q.studyUnit]) byUnit[q.studyUnit] = { correct: 0, total: 0 };
      byUnit[q.studyUnit].total++;
      if (isCorrect) byUnit[q.studyUnit].correct++;
    }

    const pct = Math.round(correct / this.questions.length * 100);
    const timeUsed = this.totalTime - this.timeLeft;

    Storage.saveExamResult({ score: pct, correct, total: this.questions.length, timeUsed, byUnit });

    this.examResult = { pct, correct, total: this.questions.length, timeUsed, byUnit };
    App.navigate('exam');
  },

  renderResults(onNavigate) {
    const { pct, correct, total, timeUsed, byUnit } = this.examResult;
    const data = window.CIA_DATA;
    const passed = pct >= 75;
    const color = passed ? '#059669' : pct >= 60 ? '#d97706' : '#e11d48';
    const borderColor = passed ? '#059669' : pct >= 60 ? '#d97706' : '#e11d48';

    const container = document.createElement('div');
    container.innerHTML = `
      <div class="results-page">
        <div class="results-header">
          <div class="results-score-ring" style="border-color:${borderColor}">
            <div class="results-score-pct" style="color:${color}">${pct}%</div>
            <div class="results-score-label" style="color:${color}">${passed ? 'PASS' : 'REVIEW'}</div>
          </div>
          <div class="results-title">${passed ? '🎉 Great Job!' : '📚 Keep Studying'}</div>
          <div style="color:var(--navy-600);font-size:14px">You scored ${correct} out of ${total} questions</div>
        </div>

        <div class="results-grid">
          <div class="results-stat">
            <div class="results-stat-val" style="color:${color}">${pct}%</div>
            <div class="results-stat-lbl">Score</div>
          </div>
          <div class="results-stat">
            <div class="results-stat-val">${correct}/${total}</div>
            <div class="results-stat-lbl">Correct</div>
          </div>
          <div class="results-stat">
            <div class="results-stat-val">${Helpers.formatTime(timeUsed)}</div>
            <div class="results-stat-lbl">Time Used</div>
          </div>
        </div>

        <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:12px">Performance by Study Unit</div>
        <div class="results-by-unit">
          ${Object.entries(byUnit).map(([suId, stats]) => {
            const su = data.studyUnits.find(s => s.id === suId);
            const upct = Math.round(stats.correct / stats.total * 100);
            const ucol = upct >= 75 ? '#059669' : upct >= 50 ? '#d97706' : '#e11d48';
            return `<div class="results-unit-row">
              <span style="font-size:16px">${su?.icon || ''}</span>
              <span class="results-unit-name">SU ${suId}: ${su?.title || suId}</span>
              <div style="flex:1;margin:0 12px">
                <div class="progress-bar"><div style="height:100%;width:${upct}%;background:${ucol};border-radius:3px;transition:width .6s ease"></div></div>
              </div>
              <span class="results-unit-score" style="color:${ucol}">${upct}% (${stats.correct}/${stats.total})</span>
            </div>`;
          }).join('')}
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-primary" id="review-wrong">Review Wrong Answers</button>
          <button class="btn btn-secondary" id="new-exam">New Exam</button>
          <button class="btn btn-outline" id="to-dash">Back to Dashboard</button>
        </div>
      </div>
    `;

    container.querySelector('#new-exam').addEventListener('click', () => {
      this.examStarted = false; this.examFinished = false;
      App.navigate('exam');
    });
    container.querySelector('#to-dash').addEventListener('click', () => onNavigate('dashboard'));
    container.querySelector('#review-wrong').addEventListener('click', () => {
      PracticePage.filterStatus = 'incorrect';
      PracticePage.filterSU = 'all';
      PracticePage.filterSub = 'all';
      onNavigate('practice');
    });

    return container;
  }
};

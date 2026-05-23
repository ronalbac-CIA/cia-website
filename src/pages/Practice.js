// Practice Mode page
const PracticePage = {
  currentQ: null,
  filteredQs: [],
  filterSU: 'all',
  filterSub: 'all',
  filterStatus: 'all',

  render(onNavigate, opts = {}) {
    const data = window.CIA_DATA;
    const container = document.createElement('div');
    container.className = 'practice-layout';

    if (opts && opts.subunit) {
      this.filterSub = opts.subunit;
      this.filterSU = opts.subunit.split('.')[0];
    }

    this.filteredQs = this.applyFilters(data.questions);
    this.currentQ = this.filteredQs[0] || null;

    container.innerHTML = `
      <div class="practice-left">
        <div style="padding:12px 16px;border-bottom:1px solid var(--slate-200);display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:13px;font-weight:700;color:var(--navy)">Practice Mode</span>
          <span id="pq-count" class="badge badge-blue">${this.filteredQs.length} Qs</span>
        </div>

        <div class="practice-filters">
          <div>
            <div class="filter-label">Study Unit</div>
            <select class="filter-select" id="filter-su">
              <option value="all">All Study Units</option>
              ${data.studyUnits.map(su => `<option value="${su.id}" ${this.filterSU===su.id?'selected':''}>${su.id}. ${su.title}</option>`).join('')}
            </select>
          </div>
          <div>
            <div class="filter-label">Subunit</div>
            <select class="filter-select" id="filter-sub">
              <option value="all">All Subunits</option>
              ${data.studyUnits.flatMap(su => su.subunits).map(sub => `<option value="${sub.id}" ${this.filterSub===sub.id?'selected':''}>${sub.id}: ${sub.title.substring(0,30)}</option>`).join('')}
            </select>
          </div>
          <div>
            <div class="filter-label">Status</div>
            <select class="filter-select" id="filter-status">
              <option value="all">All Questions</option>
              <option value="unattempted">Not Attempted</option>
              <option value="correct">Correct</option>
              <option value="incorrect">Incorrect</option>
              <option value="bookmarked">Bookmarked</option>
            </select>
          </div>
        </div>

        <div class="practice-question-list" id="pq-list">
          ${this.renderQList()}
        </div>
      </div>

      <div class="practice-right" id="practice-right">
        ${this.filteredQs.length > 0 ? '' : '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No questions match your filters</div><div class="empty-state-text">Try adjusting the filters on the left.</div></div>'}
      </div>
    `;

    // Render first question
    if (this.currentQ) {
      this.renderQuestion(container.querySelector('#practice-right'), this.currentQ);
    }

    // Filter events
    const wireFilters = () => {
      this.filterSU = container.querySelector('#filter-su').value;
      this.filterSub = container.querySelector('#filter-sub').value;
      this.filterStatus = container.querySelector('#filter-status').value;
      this.filteredQs = this.applyFilters(data.questions);
      this.currentQ = this.filteredQs[0] || null;
      container.querySelector('#pq-count').textContent = this.filteredQs.length + ' Qs';
      container.querySelector('#pq-list').innerHTML = this.renderQList();
      this.wireQList(container, onNavigate);
      const right = container.querySelector('#practice-right');
      right.innerHTML = '';
      if (this.currentQ) this.renderQuestion(right, this.currentQ);
      else right.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No questions match</div></div>';
    };

    ['#filter-su','#filter-sub','#filter-status'].forEach(id => {
      container.querySelector(id).addEventListener('change', wireFilters);
    });

    this.wireQList(container, onNavigate);

    return container;
  },

  renderEmbedded(subunitId, onNavigate) {
    // Embedded practice for a single subunit from Study Unit page
    const data = window.CIA_DATA;
    this.filterSub = subunitId;
    this.filterSU = subunitId.split('.')[0];
    this.filterStatus = 'all';
    this.filteredQs = data.questions.filter(q => q.subunit === subunitId);
    this.currentQ = this.filteredQs[0] || null;

    const container = document.createElement('div');
    container.style.cssText = 'padding:24px;max-width:820px';

    const subStats = Storage.getSubunitStats(subunitId);
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--navy)">Practice: ${subunitId}</div>
          <div style="font-size:13px;color:var(--navy-600);margin-top:4px">${this.filteredQs.length} questions · ${subStats.attempted} done · ${subStats.accuracy}% accuracy</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" id="embed-prev">←</button>
          <span id="embed-counter" style="font-size:13px;font-weight:700;color:var(--navy-600);align-self:center">1 / ${this.filteredQs.length}</span>
          <button class="btn btn-outline btn-sm" id="embed-next">→</button>
        </div>
      </div>
      <div id="embed-q-area"></div>
    `;

    let idx = 0;
    const showQ = () => {
      const q = this.filteredQs[idx];
      if (!q) return;
      container.querySelector('#embed-counter').textContent = `${idx+1} / ${this.filteredQs.length}`;
      const area = container.querySelector('#embed-q-area');
      area.innerHTML = '';
      area.appendChild(this.renderQuestionCard(q, false));
    };

    container.querySelector('#embed-prev').addEventListener('click', () => { if (idx > 0) { idx--; showQ(); } });
    container.querySelector('#embed-next').addEventListener('click', () => { if (idx < this.filteredQs.length - 1) { idx++; showQ(); } });

    if (this.filteredQs.length > 0) showQ();
    else container.querySelector('#embed-q-area').innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No questions for this subunit yet</div></div>';

    return container;
  },

  renderQList() {
    if (this.filteredQs.length === 0) return '<div class="empty-state" style="padding:32px 16px"><div class="empty-state-icon">🔍</div><div>No questions</div></div>';
    return this.filteredQs.slice(0, 200).map(q => {
      const ans = Storage.getAnswerForQ(q.id);
      const bookmarked = Storage.isBookmarked(q.id);
      let statusIcon = '';
      if (bookmarked) statusIcon = '🔖';
      else if (ans?.correct) statusIcon = '✅';
      else if (ans && !ans.correct) statusIcon = '❌';
      return `<div class="pq-item ${this.currentQ?.id === q.id ? 'active' : ''}" data-qid="${q.id}">
        <div>
          <div class="pq-item-id">${q.id}</div>
          <div class="pq-item-stem">${Helpers.escHtml(q.stem)}</div>
        </div>
        <div class="pq-item-status">${statusIcon}</div>
      </div>`;
    }).join('');
  },

  wireQList(container, onNavigate) {
    container.querySelectorAll('.pq-item').forEach(item => {
      item.addEventListener('click', () => {
        const q = this.filteredQs.find(q => q.id === item.dataset.qid);
        if (!q) return;
        this.currentQ = q;
        container.querySelectorAll('.pq-item').forEach(i => i.classList.toggle('active', i.dataset.qid === q.id));
        const right = container.querySelector('#practice-right');
        right.innerHTML = '';
        this.renderQuestion(right, q);
      });
    });
  },

  renderQuestion(container, q) {
    container.innerHTML = '';
    container.appendChild(this.renderQuestionCard(q, true));
  },

  renderQuestionCard(q, showList) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.questionCardHtml(q);

    const prevAns = Storage.getAnswerForQ(q.id);
    if (prevAns) {
      this.showResult(wrapper, q, prevAns.selected, true);
    }

    // Option clicks
    wrapper.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (wrapper.querySelector('.answer-revealed')) return; // already answered
        const selected = btn.dataset.letter;
        const isCorrect = selected === q.correctAnswer;
        Storage.recordAnswer(q.id, selected, isCorrect);
        this.showResult(wrapper, q, selected, false);
        // Update list item
        if (showList) {
          const listItem = document.querySelector(`.pq-item[data-qid="${q.id}"] .pq-item-status`);
          if (listItem) listItem.textContent = isCorrect ? '✅' : '❌';
        }
      });
    });

    // Bookmark
    wrapper.querySelector('.question-bookmark')?.addEventListener('click', (e) => {
      const isNow = Storage.toggleBookmark(q.id);
      e.target.textContent = isNow ? '🔖' : '🏷️';
      if (isNow) Toast.success('Bookmarked!');
    });

    return wrapper;
  },

  questionCardHtml(q) {
    const bookmarked = Storage.isBookmarked(q.id);
    return `<div class="question-card">
      <div class="question-header">
        <span class="question-id">${q.id}</span>
        <span class="question-bookmark" title="Bookmark">${bookmarked ? '🔖' : '🏷️'}</span>
      </div>
      <div class="question-stem">${Helpers.escHtml(q.stem)}</div>
      <div class="options-list">
        ${q.options.map(opt => `
          <button class="option-btn" data-letter="${opt.letter}">
            <span class="option-letter">${opt.letter}</span>
            <span class="option-text">${Helpers.escHtml(opt.text)}</span>
          </button>
        `).join('')}
      </div>
    </div>`;
  },

  showResult(wrapper, q, selected, fromStorage) {
    const card = wrapper.querySelector('.question-card');
    const isCorrect = selected === q.correctAnswer;

    // Style options
    card.querySelectorAll('.option-btn').forEach(btn => {
      btn.disabled = true;
      const letter = btn.dataset.letter;
      if (letter === selected && isCorrect) btn.classList.add('correct');
      else if (letter === selected && !isCorrect) btn.classList.add('incorrect');
      else if (letter === q.correctAnswer && !isCorrect) btn.classList.add('reveal-correct');
    });

    // Build structured explanation card
    const correctOpt = q.options.find(o => o.letter === q.correctAnswer);
    const wrongOpts = q.options.filter(o => o.letter !== q.correctAnswer && o.explanation);

    const revealed = document.createElement('div');
    revealed.className = 'answer-revealed';
    revealed.innerHTML = `
      <div class="answer-result-banner ${isCorrect ? 'correct' : 'incorrect'}">
        <span class="answer-result-icon">${isCorrect ? '✓' : '✗'}</span>
        <div class="answer-result-text-wrap">
          <div class="answer-result-text">${isCorrect ? 'Correct!' : 'Incorrect'}</div>
          <div class="answer-result-sub">${isCorrect ? `Nice — answer ${q.correctAnswer} is correct.` : `The correct answer is ${q.correctAnswer}.`}</div>
        </div>
      </div>

      ${correctOpt && correctOpt.explanation ? `
      <div class="exp-card exp-card-correct">
        <div class="exp-card-head">
          <span class="exp-card-tag exp-card-tag-correct">✓ Why ${correctOpt.letter} is correct</span>
        </div>
        <div class="exp-card-body">${Helpers.escHtml(correctOpt.explanation)}</div>
      </div>` : ''}

      ${wrongOpts.length > 0 ? `
      <details class="exp-accordion" ${!isCorrect ? 'open' : ''}>
        <summary>
          <span class="exp-accordion-icon">⊕</span>
          <span>Why the other options are incorrect (${wrongOpts.length})</span>
        </summary>
        <div class="exp-accordion-body">
          ${wrongOpts.map(o => `
            <div class="exp-card exp-card-incorrect ${selected === o.letter ? 'exp-card-yours' : ''}">
              <div class="exp-card-head">
                <span class="exp-card-tag exp-card-tag-incorrect">✗ Option ${o.letter}${selected === o.letter ? ' · your choice' : ''}</span>
              </div>
              <div class="exp-card-body">${Helpers.escHtml(o.explanation)}</div>
            </div>
          `).join('')}
        </div>
      </details>` : ''}
    `;

    card.appendChild(revealed);
  },

  applyFilters(questions) {
    const progress = Storage.get();
    return questions.filter(q => {
      if (this.filterSU !== 'all' && q.studyUnit !== this.filterSU) return false;
      if (this.filterSub !== 'all' && q.subunit !== this.filterSub) return false;
      const ans = progress.answers[q.id];
      if (this.filterStatus === 'unattempted' && ans) return false;
      if (this.filterStatus === 'correct' && (!ans || !ans.correct)) return false;
      if (this.filterStatus === 'incorrect' && (!ans || ans.correct)) return false;
      if (this.filterStatus === 'bookmarked' && !progress.bookmarks[q.id]) return false;
      return true;
    });
  }
};

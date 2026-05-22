// Study Unit page
const StudyUnitPage = {
  activeSubunit: null,
  activeTab: 'learn', // 'learn' | 'practice'

  render(suId, onNavigate) {
    const data = window.CIA_DATA;
    const su = data.studyUnits.find(s => s.id === suId);
    if (!su) return document.createTextNode('Study unit not found');

    const firstSub = this.activeSubunit || su.subunits[0];
    this.activeSubunit = firstSub;

    const container = document.createElement('div');
    container.className = 'su-page';
    container.id = 'su-page';

    container.innerHTML = `
      <div class="su-left">
        <div class="su-left-header">
          <div class="su-left-title" style="color:${su.color}">Study Unit ${su.id}</div>
          <div class="su-left-name">${su.title}</div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <span class="badge badge-gold">${su.examSection}</span>
            <span class="badge badge-blue">${su.weight} of exam</span>
          </div>
        </div>
        <div class="su-subunit-list">
          ${su.subunits.map(sub => {
            const seen = Storage.get().lessonsSeen[sub.id];
            const subStats = Storage.getSubunitStats(sub.id);
            return `<div class="su-subunit-item ${sub.id === firstSub.id ? 'active' : ''}" data-subunit="${sub.id}">
              <span class="su-subunit-item-num">${sub.id}</span>
              <span class="su-subunit-item-title">${sub.title}</span>
              ${seen ? '<span class="su-subunit-item-check">✓</span>' : ''}
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="su-right" id="su-right">
        <div class="su-tabs-bar">
          <div class="su-tab active" data-tab="learn">📖 Learn</div>
          <div class="su-tab" data-tab="practice">✏️ Practice</div>
          <div style="margin-left:auto;display:flex;align-items:center;gap:10px;padding:8px 0">
            <button class="btn btn-outline btn-sm" id="btn-back-dash">← Back</button>
          </div>
        </div>
        <div id="su-tab-content"></div>
      </div>
    `;

    // Wire subunit selection
    container.querySelectorAll('.su-subunit-item').forEach(item => {
      item.addEventListener('click', () => {
        container.querySelectorAll('.su-subunit-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const sub = su.subunits.find(s => s.id === item.dataset.subunit);
        this.activeSubunit = sub;
        this.renderTabContent(container.querySelector('#su-tab-content'), su, sub, onNavigate);
      });
    });

    // Wire tabs
    container.querySelectorAll('.su-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.su-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.dataset.tab;
        this.renderTabContent(container.querySelector('#su-tab-content'), su, this.activeSubunit, onNavigate);
      });
    });

    container.querySelector('#btn-back-dash').addEventListener('click', () => onNavigate('dashboard'));

    // Initial content
    this.renderTabContent(container.querySelector('#su-tab-content'), su, firstSub, onNavigate);

    return container;
  },

  renderTabContent(target, su, sub, onNavigate) {
    if (this.activeTab === 'learn') {
      target.innerHTML = '';
      target.appendChild(LessonPage.render(su, sub, onNavigate));
      Storage.markLessonSeen(sub.id);
    } else {
      target.innerHTML = '';
      target.appendChild(PracticePage.renderEmbedded(sub.id, onNavigate));
    }
  }
};

// Part Selection page — chọn CIA Part sau khi login.
// Hiện tại chỉ Part 1 active; Part 2/3 coming soon.
const PartSelectPage = {
  render(onNavigate) {
    const user = Auth.currentUser();
    const container = document.createElement('div');
    container.className = 'part-select';

    container.innerHTML = `
      <div class="part-select-inner">
        <div class="part-select-head">
          <div class="part-select-eyebrow">Welcome back</div>
          <h1 class="part-select-title">Hi ${user?.username || ''}, which CIA Part are you preparing for?</h1>
          <p class="part-select-sub">Choose a part to start studying. You can switch anytime from the top bar.</p>
        </div>

        <div class="part-grid">
          <!-- PART 1 -->
          <div class="part-card part-card-active" data-part="1">
            <div class="part-card-glow"></div>
            <div class="part-card-top">
              <div class="part-card-num">CIA Part 1</div>
              <div class="part-card-status part-status-available">● Available</div>
            </div>
            <div class="part-card-icon">🏛️</div>
            <h2 class="part-card-name">Essentials of Internal Auditing</h2>
            <p class="part-card-desc">Foundations, independence, governance, risk management, controls, fraud, and engagement planning.</p>
            <div class="part-card-meta">
              <div class="pcm-item"><div class="pcm-v">10</div><div class="pcm-l">Study Units</div></div>
              <div class="pcm-item"><div class="pcm-v">1,000+</div><div class="pcm-l">Questions</div></div>
              <div class="pcm-item"><div class="pcm-v">150 min</div><div class="pcm-l">Exam mode</div></div>
            </div>
            <div class="part-card-features">
              <div class="pcf-item"><span class="pcf-check">✓</span> Full access to all Study Units</div>
              <div class="pcf-item"><span class="pcf-check">✓</span> Practice question bank with explanations</div>
              <div class="pcf-item"><span class="pcf-check">✓</span> Realistic exam mode simulation</div>
              <div class="pcf-item"><span class="pcf-check">✓</span> Personal progress &amp; analytics</div>
            </div>
            <button class="btn btn-primary btn-lg w-full" id="enter-p1">
              Start Part 1 <span>→</span>
            </button>
          </div>

          <!-- PART 2 -->
          <div class="part-card part-card-locked" data-part="2">
            <div class="part-card-top">
              <div class="part-card-num">CIA Part 2</div>
              <div class="part-card-status part-status-soon">⏳ Coming Soon</div>
            </div>
            <div class="part-card-icon">🛡️</div>
            <h2 class="part-card-name">Practice of Internal Auditing</h2>
            <p class="part-card-desc">Engagement planning &amp; execution, communicating results, monitoring follow-up.</p>
            <div class="part-card-coming">
              <div class="pcc-title">Currently under development</div>
              <div class="pcc-bar"><div class="pcc-bar-fill" style="width:35%"></div></div>
              <div class="pcc-note">35% content ready · Expected Q3 2026</div>
            </div>
            <button class="btn btn-secondary w-full" disabled>Coming soon</button>
          </div>

          <!-- PART 3 -->
          <div class="part-card part-card-locked" data-part="3">
            <div class="part-card-top">
              <div class="part-card-num">CIA Part 3</div>
              <div class="part-card-status part-status-soon">⏳ Coming Soon</div>
            </div>
            <div class="part-card-icon">💼</div>
            <h2 class="part-card-name">Business Knowledge for Internal Auditing</h2>
            <p class="part-card-desc">Business acumen, IT, leadership, financial management, and global business environments.</p>
            <div class="part-card-coming">
              <div class="pcc-title">Currently under development</div>
              <div class="pcc-bar"><div class="pcc-bar-fill" style="width:15%"></div></div>
              <div class="pcc-note">15% content ready · Expected Q1 2027</div>
            </div>
            <button class="btn btn-secondary w-full" disabled>Coming soon</button>
          </div>
        </div>

        <div class="part-select-footer">
          <button class="part-select-logout" id="ps-logout">↪ Sign out</button>
        </div>
      </div>
    `;

    container.querySelector('#enter-p1').addEventListener('click', () => onNavigate('dashboard'));
    container.querySelector('.part-card-active').addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      onNavigate('dashboard');
    });
    container.querySelectorAll('.part-card-locked').forEach(card => {
      card.addEventListener('click', () => {
        Toast.show('That part is not available yet — focus on Part 1 for now! 🎯', 'info');
      });
    });
    container.querySelector('#ps-logout').addEventListener('click', () => App.logout());

    return container;
  }
};

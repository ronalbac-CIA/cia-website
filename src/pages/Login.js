// Login page
const LoginPage = {
  render(onNavigate) {
    const container = document.createElement('div');
    container.className = 'auth-screen';
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-back">
          <a href="#" id="back-home">← <span class="lang-en">Back to home</span><span class="lang-vn">Về trang chủ</span></a>
          <div id="login-lang-slot"></div>
        </div>

        <div class="auth-brand">
          <div class="auth-brand-logo">CIA</div>
          <div>
            <div class="auth-brand-title">CIA Part 1</div>
            <div class="auth-brand-sub">Study Prep · Học &amp; luyện đề</div>
          </div>
        </div>

        <h1 class="auth-title">
          <span class="lang-en">Welcome back</span>
          <span class="lang-vn">Chào mừng trở lại</span>
        </h1>
        <p class="auth-subtitle">
          <span class="lang-en">Log in to continue your CIA prep.</span>
          <span class="lang-vn">Đăng nhập để tiếp tục quá trình ôn luyện.</span>
        </p>

        <form class="auth-form" id="login-form" autocomplete="on">
          <div class="auth-field">
            <label for="login-username">Username</label>
            <input id="login-username" name="username" type="text" autocomplete="username" required />
          </div>
          <div class="auth-field">
            <label for="login-password">Password</label>
            <input id="login-password" name="password" type="password" autocomplete="current-password" required />
          </div>
          <div class="auth-error hidden" id="login-error"></div>
          <button type="submit" class="btn btn-primary btn-lg w-full">
            <span class="lang-en">Log in</span>
            <span class="lang-vn">Đăng nhập</span>
          </button>
        </form>

        <div class="auth-footer">
          <span class="lang-en">No account yet?</span>
          <span class="lang-vn">Chưa có tài khoản?</span>
          <a href="#" id="goto-register">
            <span class="lang-en">Start 7-day free trial →</span>
            <span class="lang-vn">Đăng ký miễn phí 7 ngày →</span>
          </a>
        </div>
      </div>

      <div class="auth-side">
        <div class="auth-side-quote">
          <div class="auth-side-eyebrow">
            <span class="lang-en">CIA Part 1 — Essentials of Internal Auditing</span>
            <span class="lang-vn">CIA Part 1 — Cơ bản về Kiểm toán nội bộ</span>
          </div>
          <h2 class="auth-side-title">
            <span class="lang-en">10 Study Units. Thousands of questions. One path.</span>
            <span class="lang-vn">10 Study Units. Hàng nghìn câu hỏi. Một lộ trình.</span>
          </h2>
          <ul class="auth-side-list">
            <li>📖 <span class="lang-en">Full theory for each subunit</span><span class="lang-vn">Đầy đủ lý thuyết từng subunit</span></li>
            <li>✏️ <span class="lang-en">Practice mode with explanations</span><span class="lang-vn">Practice mode kèm giải thích chi tiết</span></li>
            <li>📝 <span class="lang-en">Exam mode simulating the real test</span><span class="lang-vn">Exam mode mô phỏng đề thi thật</span></li>
            <li>📊 <span class="lang-en">Analytics tracking your weak/strong areas</span><span class="lang-vn">Analytics theo dõi điểm yếu / mạnh</span></li>
          </ul>
        </div>
      </div>
    `;

    const errorEl = container.querySelector('#login-error');
    container.querySelector('#login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      errorEl.classList.add('hidden');
      const username = container.querySelector('#login-username').value;
      const password = container.querySelector('#login-password').value;
      const res = Auth.login(username, password);
      if (!res.ok) {
        errorEl.textContent = res.error;
        errorEl.classList.remove('hidden');
        return;
      }
      Toast.success('Đăng nhập thành công · Chào ' + res.user.username + '!');
      App.afterAuth();
    });

    container.querySelector('#goto-register').addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate('register');
    });

    container.querySelector('#back-home').addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate('landing');
    });

    const slot = container.querySelector('#login-lang-slot');
    if (slot && typeof Lang !== 'undefined') slot.appendChild(Lang.renderSwitcher());

    return container;
  }
};

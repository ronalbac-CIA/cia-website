// Register page
const RegisterPage = {
  render(onNavigate) {
    const container = document.createElement('div');
    container.className = 'auth-screen';
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-back">
          <a href="#" id="back-home">← <span class="lang-en">Back to home</span><span class="lang-vn">Về trang chủ</span></a>
          <div id="reg-lang-slot"></div>
        </div>

        <div class="auth-brand">
          <div class="auth-brand-logo">CIA</div>
          <div>
            <div class="auth-brand-title">CIA Part 1</div>
            <div class="auth-brand-sub">Study Prep · Học &amp; luyện đề</div>
          </div>
        </div>

        <h1 class="auth-title">
          <span class="lang-en">Create your free account</span>
          <span class="lang-vn">Tạo tài khoản miễn phí</span>
        </h1>
        <p class="auth-subtitle">
          <span class="lang-en">Try it for <strong>7 days free</strong> — no credit card required.</span>
          <span class="lang-vn">Dùng thử <strong>7 ngày miễn phí</strong> — không cần thẻ tín dụng.</span>
        </p>

        <form class="auth-form" id="register-form" autocomplete="off">
          <div class="auth-field">
            <label for="reg-username">Username</label>
            <input id="reg-username" name="username" type="text" autocomplete="username" placeholder="e.g. tuan.nguyen" required />
            <div class="auth-hint">
              <span class="lang-en">3+ characters, letters / numbers / dot only.</span>
              <span class="lang-vn">3+ ký tự, chỉ chữ / số / dấu chấm.</span>
            </div>
          </div>
          <div class="auth-field">
            <label for="reg-password">Password</label>
            <input id="reg-password" name="password" type="password" autocomplete="new-password" placeholder="Minimum 6 characters" required />
            <div class="auth-hint" id="pw-strength">
              <span class="lang-en">Strength:</span><span class="lang-vn">Độ mạnh:</span>
              <span> —</span>
            </div>
          </div>
          <div class="auth-field">
            <label for="reg-password2">
              <span class="lang-en">Confirm password</span>
              <span class="lang-vn">Nhập lại password</span>
            </label>
            <input id="reg-password2" name="password2" type="password" autocomplete="new-password" required />
          </div>
          <div class="auth-error hidden" id="register-error"></div>

          <div class="auth-trial-card">
            <div class="auth-trial-icon">🎁</div>
            <div>
              <div class="auth-trial-title">
                <span class="lang-en">7-day free trial</span>
                <span class="lang-vn">7 ngày dùng thử miễn phí</span>
              </div>
              <div class="auth-trial-desc">
                <span class="lang-en">Full access to Study Units, Practice, Exam Mode &amp; Analytics. After 7 days only 50,000 VND / month.</span>
                <span class="lang-vn">Truy cập đầy đủ Study Units, Practice, Exam Mode &amp; Analytics. Sau 7 ngày chỉ 50.000đ / tháng.</span>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full">
            <span class="lang-en">Start 7-day free trial →</span>
            <span class="lang-vn">Bắt đầu 7 ngày dùng thử →</span>
          </button>
        </form>

        <div class="auth-footer">
          <span class="lang-en">Already have an account?</span>
          <span class="lang-vn">Đã có tài khoản?</span>
          <a href="#" id="goto-login">
            <span class="lang-en">Log in</span>
            <span class="lang-vn">Đăng nhập</span>
          </a>
        </div>
      </div>

      <div class="auth-side">
        <div class="auth-side-quote">
          <div class="auth-side-eyebrow">
            <span class="lang-en">Join other CIA candidates</span>
            <span class="lang-vn">Tham gia cùng các CIA candidate khác</span>
          </div>
          <h2 class="auth-side-title">
            <span class="lang-en">Study smart — pass on the first try.</span>
            <span class="lang-vn">Ôn đề bài bản — không thi lại.</span>
          </h2>
          <ul class="auth-side-list">
            <li>📖 <span class="lang-en">Systematic theory across 10 Study Units</span><span class="lang-vn">Lý thuyết hệ thống theo 10 Study Units</span></li>
            <li>🎯 <span class="lang-en">Question bank with detailed explanations</span><span class="lang-vn">Question bank với explanation chi tiết</span></li>
            <li>📝 <span class="lang-en">Exam mode · 100 questions / 150 minutes</span><span class="lang-vn">Exam mode 100 câu / 150 phút</span></li>
            <li>📊 <span class="lang-en">Analytics by subunit — find your weak spots</span><span class="lang-vn">Analytics theo subunit, phát hiện điểm yếu</span></li>
          </ul>
        </div>
      </div>
    `;

    const errorEl = container.querySelector('#register-error');
    const pwInput = container.querySelector('#reg-password');
    const pwStrength = container.querySelector('#pw-strength span:last-child');

    pwInput.addEventListener('input', () => {
      const v = pwInput.value;
      let label = ' —', color = 'var(--slate-400)';
      if (v.length === 0) {}
      else if (v.length < 6) { label = ' Weak'; color = 'var(--rose)'; }
      else if (v.length < 8 || !/\d/.test(v)) { label = ' Fair'; color = 'var(--amber)'; }
      else if (v.length >= 8 && /\d/.test(v) && /[a-zA-Z]/.test(v)) { label = ' Strong'; color = 'var(--emerald)'; }
      pwStrength.textContent = label;
      pwStrength.style.color = color;
    });

    container.querySelector('#register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      errorEl.classList.add('hidden');
      const username = container.querySelector('#reg-username').value;
      const password = container.querySelector('#reg-password').value;
      const password2 = container.querySelector('#reg-password2').value;

      if (password !== password2) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.classList.remove('hidden');
        return;
      }

      const res = Auth.register(username, password);
      if (!res.ok) {
        errorEl.textContent = res.error;
        errorEl.classList.remove('hidden');
        return;
      }
      Toast.success('Account created! Your 7-day trial is active.');
      App.afterAuth();
    });

    container.querySelector('#goto-login').addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate('login');
    });

    container.querySelector('#back-home').addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate('landing');
    });

    const slot = container.querySelector('#reg-lang-slot');
    if (slot && typeof Lang !== 'undefined') slot.appendChild(Lang.renderSwitcher());

    return container;
  }
};

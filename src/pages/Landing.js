// Landing page — bilingual EN + VN. Public, không cần login.
const LandingPage = {
  render(onNavigate) {
    const container = document.createElement('div');
    container.className = 'landing';
    container.innerHTML = `
      <!-- NAV -->
      <header class="landing-nav">
        <div class="landing-nav-inner">
          <div class="landing-brand">
            <div class="landing-brand-logo">CIA</div>
            <div>
              <div class="landing-brand-title">CIA Learning Platform</div>
              <div class="landing-brand-sub">Internal Auditing · Test Prep</div>
            </div>
          </div>
          <nav class="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <div id="landing-lang-slot"></div>
            <button class="btn btn-outline btn-sm" data-action="login">Log in</button>
            <button class="btn btn-primary btn-sm" data-action="register">Get started</button>
          </nav>
        </div>
      </header>

      <!-- HERO -->
      <section class="landing-hero">
        <div class="landing-hero-inner">
          <div class="landing-hero-text">
            <div class="landing-pill">
              <span>🎓</span> CIA Part 1 · 2024 syllabus
            </div>
            <h1 class="landing-hero-title">
              <span class="lang-en">Start Your CIA Journey</span>
              <span class="lang-vn">Bắt đầu hành trình chinh phục CIA</span>
            </h1>
            <p class="landing-hero-sub">
              <span class="lang-en">Master the Certified Internal Auditor exam with structured lessons, 1,000+ practice questions, and exam-mode simulation.</span>
              <span class="lang-vn">Chinh phục kỳ thi CIA với lộ trình học có cấu trúc, hơn 1.000 câu hỏi luyện tập và chế độ thi mô phỏng đề thật.</span>
            </p>
            <div class="landing-hero-cta">
              <button class="btn btn-primary btn-lg" data-action="register">
                <span class="lang-en">Start 7-day free trial</span>
                <span class="lang-vn">Dùng thử miễn phí 7 ngày</span>
                <span>→</span>
              </button>
              <button class="btn btn-outline btn-lg" data-action="login">
                <span class="lang-en">Log in</span>
                <span class="lang-vn">Đăng nhập</span>
              </button>
            </div>
            <div class="landing-hero-trust">
              <span>✓ <span class="lang-en">No credit card required</span><span class="lang-vn">Không cần thẻ tín dụng</span></span>
              <span>✓ <span class="lang-en">Cancel anytime</span><span class="lang-vn">Hủy bất kỳ lúc nào</span></span>
              <span>✓ 50,000 VND/month</span>
            </div>
          </div>
          <div class="landing-hero-visual">
            <div class="landing-mock">
              <div class="landing-mock-topbar">
                <div class="landing-mock-dot"></div>
                <div class="landing-mock-dot"></div>
                <div class="landing-mock-dot"></div>
                <div class="landing-mock-url">cia-learning.app/dashboard</div>
              </div>
              <div class="landing-mock-body">
                <div class="landing-mock-side">
                  <div class="landing-mock-side-item active">⊞ Dashboard</div>
                  <div class="landing-mock-side-item">✏️ Practice</div>
                  <div class="landing-mock-side-item">📝 Exam</div>
                  <div class="landing-mock-side-item">📊 Analytics</div>
                </div>
                <div class="landing-mock-main">
                  <div class="landing-mock-stat-row">
                    <div class="landing-mock-stat"><div class="lms-v">1,112</div><div class="lms-l">Questions</div></div>
                    <div class="landing-mock-stat"><div class="lms-v">78%</div><div class="lms-l">Accuracy</div></div>
                    <div class="landing-mock-stat"><div class="lms-v">12d</div><div class="lms-l">Streak</div></div>
                  </div>
                  <div class="landing-mock-card">
                    <div class="lmc-h">SU 1 · Foundations of Internal Auditing</div>
                    <div class="lmc-bar"><div class="lmc-bar-fill" style="width:72%"></div></div>
                    <div class="lmc-m">72% · 18 of 25 lessons</div>
                  </div>
                  <div class="landing-mock-card">
                    <div class="lmc-h">SU 2 · Assurance Services I</div>
                    <div class="lmc-bar"><div class="lmc-bar-fill" style="width:48%;background:var(--gold)"></div></div>
                    <div class="lmc-m">48% · 11 of 23 lessons</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- STATS -->
      <section class="landing-stats">
        <div class="landing-stats-inner">
          <div class="landing-stat"><div class="ls-v">1,000+</div><div class="ls-l"><span class="lang-en">Practice questions</span><span class="lang-vn">Câu hỏi luyện tập</span></div></div>
          <div class="landing-stat"><div class="ls-v">10</div><div class="ls-l"><span class="lang-en">Study Units</span><span class="lang-vn">Study Units</span></div></div>
          <div class="landing-stat"><div class="ls-v">150 min</div><div class="ls-l"><span class="lang-en">Exam mode</span><span class="lang-vn">Chế độ thi</span></div></div>
          <div class="landing-stat"><div class="ls-v">7 days</div><div class="ls-l"><span class="lang-en">Free trial</span><span class="lang-vn">Dùng thử</span></div></div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="landing-features" id="features">
        <div class="landing-section-head">
          <div class="landing-eyebrow">Features</div>
          <h2 class="landing-h2">
            <span class="lang-en">Everything you need to pass</span>
            <span class="lang-vn">Tất cả bạn cần để vượt qua kỳ thi</span>
          </h2>
        </div>
        <div class="landing-features-grid">
          ${this._feature('📖', 'Structured lessons', 'Bài học có cấu trúc',
            'Learn each Study Unit step-by-step with normalized, easy-to-read content — far cleaner than raw textbook PDFs.',
            'Học từng Study Unit theo từng bước. Nội dung đã được biên tập sạch — dễ đọc hơn PDF gốc rất nhiều.')}
          ${this._feature('✏️', 'Practice thousands of CIA questions', 'Luyện tập hàng ngàn câu hỏi CIA',
            'Filter by Study Unit, subunit, bookmarks, correct/incorrect. Every question comes with detailed explanations.',
            'Lọc theo Study Unit, subunit, bookmark, đúng/sai. Mỗi câu có giải thích chi tiết.')}
          ${this._feature('📝', 'Realistic exam simulator', 'Mô phỏng đề thi thật',
            '100 questions · 150 minutes. Timed, randomized, with full results by Study Unit when done.',
            '100 câu · 150 phút. Hẹn giờ, ngẫu nhiên hóa, có kết quả theo Study Unit khi hoàn thành.')}
          ${this._feature('📊', 'Smart analytics', 'Phân tích thông minh',
            'See your weak and strong subunits at a glance. Track exam history and accuracy over time.',
            'Nhìn ngay điểm yếu / điểm mạnh theo subunit. Theo dõi lịch sử thi và độ chính xác.')}
          ${this._feature('🔖', 'Bookmark & review', 'Đánh dấu & ôn lại',
            'Save tricky questions for later. Build your own review deck from your mistakes.',
            'Lưu lại câu khó để ôn sau. Tự xây dựng bộ ôn từ các câu sai.')}
          ${this._feature('🎯', 'Account-based progress', 'Lưu tiến độ theo tài khoản',
            'Your progress, bookmarks, and exam history are saved to your account — nothing gets mixed up.',
            'Tiến độ, bookmark, lịch sử thi đều lưu theo tài khoản riêng — không bị lẫn dữ liệu.')}
        </div>
      </section>

      <!-- PRICING -->
      <section class="landing-pricing" id="pricing">
        <div class="landing-section-head">
          <div class="landing-eyebrow">Pricing</div>
          <h2 class="landing-h2">
            <span class="lang-en">Simple, transparent pricing</span>
            <span class="lang-vn">Giá đơn giản, minh bạch</span>
          </h2>
          <p class="landing-section-sub">
            <span class="lang-en">One plan. Everything included. Cancel anytime.</span>
            <span class="lang-vn">Một gói duy nhất. Đầy đủ tính năng. Hủy bất kỳ lúc nào.</span>
          </p>
        </div>
        <div class="landing-pricing-grid">
          <!-- FREE TRIAL -->
          <div class="landing-price-card">
            <div class="landing-price-name">
              <span class="lang-en">Free Trial</span>
              <span class="lang-vn">Dùng thử</span>
            </div>
            <div class="landing-price-amount">0 <span>VND</span></div>
            <div class="landing-price-period">
              <span class="lang-en">for 7 days</span>
              <span class="lang-vn">trong 7 ngày</span>
            </div>
            <ul class="landing-price-list">
              <li>✓ <span class="lang-en">Full access for 7 days</span><span class="lang-vn">Full access trong 7 ngày</span></li>
              <li>✓ <span class="lang-en">All Study Units</span><span class="lang-vn">Toàn bộ Study Units</span></li>
              <li>✓ <span class="lang-en">Practice + Exam mode</span><span class="lang-vn">Practice + Exam mode</span></li>
              <li>✓ <span class="lang-en">No credit card</span><span class="lang-vn">Không cần thẻ</span></li>
            </ul>
            <button class="btn btn-outline w-full" data-action="register">
              <span class="lang-en">Start free trial</span>
              <span class="lang-vn">Bắt đầu dùng thử</span>
            </button>
          </div>

          <!-- PAID -->
          <div class="landing-price-card landing-price-card-featured">
            <div class="landing-price-badge">
              <span class="lang-en">Best value</span>
              <span class="lang-vn">Lựa chọn tốt nhất</span>
            </div>
            <div class="landing-price-name">CIA Part 1 · Monthly</div>
            <div class="landing-price-amount">50,000 <span>VND</span></div>
            <div class="landing-price-period">
              <span class="lang-en">/ month</span>
              <span class="lang-vn">/ tháng</span>
            </div>
            <ul class="landing-price-list">
              <li>✓ <span class="lang-en">Everything in Free Trial</span><span class="lang-vn">Tất cả trong Free Trial</span></li>
              <li>✓ <span class="lang-en">Unlimited practice &amp; exams</span><span class="lang-vn">Practice &amp; thi không giới hạn</span></li>
              <li>✓ <span class="lang-en">Advanced analytics</span><span class="lang-vn">Analytics nâng cao</span></li>
              <li>✓ <span class="lang-en">Bookmark &amp; review system</span><span class="lang-vn">Hệ thống bookmark &amp; ôn lại</span></li>
              <li>✓ <span class="lang-en">Email priority support</span><span class="lang-vn">Hỗ trợ ưu tiên qua email</span></li>
            </ul>
            <button class="btn btn-primary w-full" data-action="register">
              <span class="lang-en">Subscribe now</span>
              <span class="lang-vn">Đăng ký ngay</span>
            </button>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="landing-faq" id="faq">
        <div class="landing-section-head">
          <div class="landing-eyebrow">FAQ</div>
          <h2 class="landing-h2">
            <span class="lang-en">Frequently asked questions</span>
            <span class="lang-vn">Câu hỏi thường gặp</span>
          </h2>
        </div>
        <div class="landing-faq-list">
          ${this._faq('Do I need a credit card for the free trial?', 'Tôi có cần thẻ tín dụng để dùng thử không?',
            'No. Just sign up with a username and password — your 7-day trial starts immediately.',
            'Không. Chỉ cần username và password — 7 ngày dùng thử kích hoạt tức thì.')}
          ${this._faq('Will my progress be saved?', 'Tiến độ của tôi có được lưu không?',
            'Yes. All lessons, quiz attempts, bookmarks, and exam history are saved to your account.',
            'Có. Mọi bài học, câu trả lời, bookmark, lịch sử thi đều lưu theo tài khoản.')}
          ${this._faq('Can I cancel anytime?', 'Tôi có thể hủy bất cứ lúc nào không?',
            'Yes — subscription is monthly. If you do not renew, the account simply returns to expired state.',
            'Có. Subscription theo tháng. Không gia hạn thì account về trạng thái expired.')}
          ${this._faq('Are CIA Part 2 and Part 3 available?', 'CIA Part 2 và Part 3 đã có chưa?',
            'Part 2 and Part 3 are coming soon. Part 1 is fully available today.',
            'Part 2 và Part 3 sắp ra mắt. Part 1 đã đầy đủ và sẵn sàng.')}
        </div>
      </section>

      <!-- CTA -->
      <section class="landing-cta-section">
        <div class="landing-cta-inner">
          <h2 class="landing-cta-title">
            <span class="lang-en">Ready to pass the CIA exam?</span>
            <span class="lang-vn">Sẵn sàng vượt qua kỳ thi CIA?</span>
          </h2>
          <p class="landing-cta-sub">
            <span class="lang-en">Join candidates already preparing on our platform.</span>
            <span class="lang-vn">Tham gia cùng các thí sinh đang ôn luyện trên nền tảng của chúng tôi.</span>
          </p>
          <button class="btn btn-primary btn-lg" data-action="register">
            <span class="lang-en">Start 7-day free trial →</span>
            <span class="lang-vn">Bắt đầu 7 ngày miễn phí →</span>
          </button>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="landing-footer">
        <div class="landing-footer-inner">
          <div>
            <div class="landing-brand">
              <div class="landing-brand-logo">CIA</div>
              <div>
                <div class="landing-brand-title" style="color:white">CIA Learning Platform</div>
                <div class="landing-brand-sub" style="color:rgba(255,255,255,.5)">© ${new Date().getFullYear()} · Independent study platform</div>
              </div>
            </div>
          </div>
          <div class="landing-footer-note">
            <span class="lang-en">Not affiliated with The IIA. CIA® is a registered trademark of The Institute of Internal Auditors.</span>
            <span class="lang-vn">Không liên kết với The IIA. CIA® là thương hiệu đã đăng ký của The Institute of Internal Auditors.</span>
          </div>
        </div>
      </footer>
    `;

    container.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const a = el.dataset.action;
        onNavigate(a);
      });
    });
    // Mount language switcher
    const slot = container.querySelector('#landing-lang-slot');
    if (slot && typeof Lang !== 'undefined') slot.appendChild(Lang.renderSwitcher());
    // Smooth-scroll for anchor links
    container.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = container.querySelector('#' + id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
    return container;
  },

  _feature(icon, titleEn, titleVn, descEn, descVn) {
    return `<div class="landing-feature">
      <div class="landing-feature-icon">${icon}</div>
      <h3 class="landing-feature-title">
        <span class="lang-en">${titleEn}</span>
        <span class="lang-vn">${titleVn}</span>
      </h3>
      <p class="landing-feature-desc">
        <span class="lang-en">${descEn}</span>
        <span class="lang-vn">${descVn}</span>
      </p>
    </div>`;
  },

  _faq(qEn, qVn, aEn, aVn) {
    return `<details class="landing-faq-item">
      <summary>
        <span class="lang-en">${qEn}</span>
        <span class="lang-vn">${qVn}</span>
      </summary>
      <div class="landing-faq-answer">
        <p><span class="lang-en">${aEn}</span><span class="lang-vn">${aVn}</span></p>
      </div>
    </details>`;
  }
};

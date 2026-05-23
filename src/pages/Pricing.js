// Pricing / Payment page
// Also used to display the "Trial expired" alert.
// Reached only from inside the logged-in app, so English-only.
const PricingPage = {
  render(onNavigate, opts = {}) {
    const user = Auth.currentUser();
    const status = Auth.getStatus(user);
    const isExpired = status === 'trial_expired';
    const isSubscriber = status === 'subscriber_active';
    const remaining = Auth.timeRemaining(user);

    const container = document.createElement('div');
    container.className = 'page pricing-page';

    container.innerHTML = `
      ${isExpired ? `
        <div class="pricing-alert">
          <div class="pricing-alert-icon">⏰</div>
          <div>
            <div class="pricing-alert-title">Your 7-day free trial has expired.</div>
            <div class="pricing-alert-desc">Please subscribe to continue learning.</div>
          </div>
        </div>
      ` : ''}

      <div class="pricing-header">
        <div class="pricing-eyebrow">Pricing</div>
        <h1 class="pricing-title">Continue your CIA Part 1 prep</h1>
        <p class="pricing-subtitle">One simple price. Cancel anytime.</p>
      </div>

      <div class="pricing-grid">
        <!-- Featured pricing card -->
        <div class="pricing-card pricing-card-featured">
          <div class="pricing-card-badge">Most popular</div>
          <div class="pricing-card-name">CIA Part 1 Learning Access</div>
          <div class="pricing-card-price">
            <span class="pricing-card-amount">50,000</span>
            <span class="pricing-card-unit">VND<br/>/ month</span>
          </div>
          <ul class="pricing-card-list">
            <li>✓ All 10 Study Units &amp; lessons</li>
            <li>✓ Practice question bank with explanations</li>
            <li>✓ Realistic exam-mode simulation</li>
            <li>✓ Analytics by subunit &amp; exam history</li>
            <li>✓ Bookmark &amp; personal progress tracking</li>
            <li>✓ Cancel anytime</li>
          </ul>

          ${isSubscriber ? `
            <div class="pricing-active-state">
              <div class="pricing-active-icon">✓</div>
              <div>
                <div class="pricing-active-title">You're a subscriber</div>
                <div class="pricing-active-desc">Renews in ${remaining.days} days ${remaining.hours} hours.</div>
              </div>
            </div>
            <button class="btn btn-outline w-full" id="extend-sub">Extend by 30 days</button>
          ` : `
            <button class="btn btn-primary btn-lg w-full" id="activate-sub">Activate Subscription</button>
            <div class="pricing-card-note">
              ⚠️ Mock payment flow — MoMo / VNPay / Stripe integration coming later.
            </div>
          `}
        </div>

        <!-- Trial card -->
        <div class="pricing-card">
          <div class="pricing-card-name">7-day Free Trial</div>
          <div class="pricing-card-price">
            <span class="pricing-card-amount">0</span>
            <span class="pricing-card-unit">VND<br/>/ 7 days</span>
          </div>
          <ul class="pricing-card-list">
            <li>✓ Auto-activated on signup</li>
            <li>✓ Full access for 7 days</li>
            <li>✓ No credit card required</li>
            <li>✗ After 7 days, subscribe to continue</li>
          </ul>
          ${user ? (
            status === 'trial_active'
              ? `<div class="pricing-trial-state">
                  <strong>Trial active</strong>
                  <span>${remaining.days}d ${remaining.hours}h remaining</span>
                </div>`
              : `<div class="pricing-trial-state pricing-trial-state-expired">
                  <strong>Trial expired</strong>
                  <span>Subscribe to keep learning</span>
                </div>`
          ) : `<div class="pricing-trial-state"><strong>Sign up to start</strong></div>`}
        </div>
      </div>

      <!-- Payment methods preview -->
      <div class="pricing-methods">
        <div class="pricing-methods-title">Payment methods (coming soon)</div>
        <div class="pricing-methods-row">
          <span class="pm-tag">💳 MoMo</span>
          <span class="pm-tag">🏦 VNPay</span>
          <span class="pm-tag">💎 Stripe</span>
          <span class="pm-tag pm-tag-now">⚡ Now: Mock Activate</span>
        </div>
      </div>

      <!-- FAQ -->
      <div class="pricing-faq">
        <h3>Frequently asked questions</h3>
        <details>
          <summary>How does the 7-day trial work?</summary>
          <p>Your trial starts the moment you register. It expires exactly 7 × 24 hours (168 hours) later.</p>
        </details>
        <details>
          <summary>What do I get after subscribing?</summary>
          <p>Full access to every feature for 30 days: lessons, practice, exam mode, analytics. You can extend to stack additional days.</p>
        </details>
        <details>
          <summary>Can I cancel anytime?</summary>
          <p>Yes — the subscription is monthly. If you don't renew, the account returns to trial_expired state at the end of the period.</p>
        </details>
      </div>
    `;

    container.querySelector('#activate-sub')?.addEventListener('click', () => {
      const res = Auth.activateSubscriptionMock();
      if (!res.ok) {
        Toast.error(res.error || 'Activation failed.');
        return;
      }
      Toast.success('🎉 Subscription activated! Welcome back.');
      App.navigate('dashboard');
    });

    container.querySelector('#extend-sub')?.addEventListener('click', () => {
      const res = Auth.activateSubscriptionMock();
      if (res.ok) {
        Toast.success('Extended by 30 days.');
        App.navigate('pricing');
      }
    });

    return container;
  }
};

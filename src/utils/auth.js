// ===== Auth System =====
// Quản lý đăng ký, đăng nhập, session, account status.
// Dữ liệu user lưu trong localStorage dưới key "cia_users" và "cia_session".
// LƯU Ý: đây là client-side mock. Trong production cần API + server-side hash.

const Auth = {
  USERS_KEY: 'cia_users',      // map: username -> userRecord
  SESSION_KEY: 'cia_session',  // { username, loginAt }

  TRIAL_DAYS: 7,
  SUBSCRIPTION_PRICE: 50000, // VND/month
  SUBSCRIPTION_DURATION_DAYS: 30,

  // --- low-level storage ---
  _readUsers() {
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY)) || {}; }
    catch { return {}; }
  },
  _writeUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },
  _readSession() {
    try { return JSON.parse(localStorage.getItem(this.SESSION_KEY)) || null; }
    catch { return null; }
  },
  _writeSession(session) {
    if (session) localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(this.SESSION_KEY);
  },

  // --- password hashing (lightweight obfuscation only, NOT real security) ---
  _hash(password) {
    // FNV-1a 32-bit hash + length salt. Sufficient for demo.
    let h = 2166136261;
    const salt = 'cia-part1-salt-v1';
    const s = salt + password;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8) + ':' + password.length;
  },

  // ============ REGISTER ============
  // Returns { ok: true } or { ok: false, error: '...' }
  register(username, password) {
    const u = (username || '').trim();
    if (!u) return { ok: false, error: 'Username không được để trống.' };
    if (u.length < 3) return { ok: false, error: 'Username cần tối thiểu 3 ký tự.' };
    if (!/^[a-zA-Z0-9_.-]+$/.test(u)) return { ok: false, error: 'Username chỉ chứa chữ, số, dấu chấm/gạch/_ .' };
    if (!password) return { ok: false, error: 'Password không được để trống.' };
    if (password.length < 6) return { ok: false, error: 'Password cần tối thiểu 6 ký tự.' };

    const users = this._readUsers();
    if (users[u.toLowerCase()]) return { ok: false, error: 'Username đã tồn tại. Hãy chọn tên khác.' };

    const now = Date.now();
    const trialEnd = now + this.TRIAL_DAYS * 24 * 60 * 60 * 1000;

    const record = {
      username: u,
      passwordHash: this._hash(password),
      createdAt: now,
      trialStart: now,
      trialEnd: trialEnd,
      subscription: null,        // { startAt, expiresAt, plan }
      // user-scoped progress lives in Storage under key cia_progress_<username>
    };
    users[u.toLowerCase()] = record;
    this._writeUsers(users);

    // auto login
    this._writeSession({ username: u, loginAt: now });
    return { ok: true, user: this.publicUser(record) };
  },

  // ============ LOGIN ============
  login(username, password) {
    const u = (username || '').trim();
    if (!u || !password) return { ok: false, error: 'Vui lòng nhập username và password.' };
    const users = this._readUsers();
    const rec = users[u.toLowerCase()];
    if (!rec) return { ok: false, error: 'Tài khoản không tồn tại.' };
    if (rec.passwordHash !== this._hash(password)) {
      return { ok: false, error: 'Sai password. Vui lòng thử lại.' };
    }
    this._writeSession({ username: rec.username, loginAt: Date.now() });
    return { ok: true, user: this.publicUser(rec) };
  },

  logout() {
    this._writeSession(null);
  },

  // ============ CURRENT USER ============
  currentUser() {
    const sess = this._readSession();
    if (!sess) return null;
    const users = this._readUsers();
    const rec = users[sess.username.toLowerCase()];
    if (!rec) {
      this._writeSession(null);
      return null;
    }
    return this.publicUser(rec);
  },

  isLoggedIn() {
    return !!this.currentUser();
  },

  publicUser(rec) {
    return {
      username: rec.username,
      createdAt: rec.createdAt,
      trialStart: rec.trialStart,
      trialEnd: rec.trialEnd,
      subscription: rec.subscription || null,
    };
  },

  // ============ SUBSCRIPTION / ACCESS STATUS ============
  // Returns one of: 'trial_active' | 'trial_expired' | 'subscriber_active'
  getStatus(user = this.currentUser()) {
    if (!user) return 'guest';
    const now = Date.now();
    if (user.subscription && user.subscription.expiresAt > now) {
      return 'subscriber_active';
    }
    if (user.trialEnd > now) return 'trial_active';
    return 'trial_expired';
  },

  // Returns true if user can access protected content
  hasAccess(user = this.currentUser()) {
    const s = this.getStatus(user);
    return s === 'trial_active' || s === 'subscriber_active';
  },

  // Days/hours remaining for trial or subscription
  timeRemaining(user = this.currentUser()) {
    if (!user) return null;
    const now = Date.now();
    let endAt = null;
    let kind = null;
    if (user.subscription && user.subscription.expiresAt > now) {
      endAt = user.subscription.expiresAt; kind = 'subscription';
    } else if (user.trialEnd > now) {
      endAt = user.trialEnd; kind = 'trial';
    } else {
      return { kind: 'expired', days: 0, hours: 0, ms: 0 };
    }
    const ms = endAt - now;
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return { kind, days, hours, ms, endAt };
  },

  // ============ MOCK PAYMENT ============
  // Activates 30-day subscription for current user.
  // TODO: thay bằng API thực khi tích hợp MoMo / VNPay / Stripe.
  activateSubscriptionMock() {
    const sess = this._readSession();
    if (!sess) return { ok: false, error: 'Bạn cần đăng nhập trước.' };
    const users = this._readUsers();
    const rec = users[sess.username.toLowerCase()];
    if (!rec) return { ok: false, error: 'Không tìm thấy tài khoản.' };

    const now = Date.now();
    const baseStart = (rec.subscription && rec.subscription.expiresAt > now)
      ? rec.subscription.expiresAt   // gia hạn cộng dồn
      : now;
    rec.subscription = {
      plan: 'CIA Part 1 Monthly',
      startAt: now,
      expiresAt: baseStart + this.SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000,
      paymentMethod: 'MOCK',     // sau này: 'MOMO' | 'VNPAY' | 'STRIPE'
      amountVnd: this.SUBSCRIPTION_PRICE,
      transactionId: 'MOCK-' + now,
    };
    users[sess.username.toLowerCase()] = rec;
    this._writeUsers(users);
    return { ok: true, user: this.publicUser(rec) };
  },

  // ============ DEV HELPERS ============
  // Quick way to force-expire a trial (for QA). Call from console:
  //   Auth.devExpireTrial()
  devExpireTrial() {
    const sess = this._readSession();
    if (!sess) return;
    const users = this._readUsers();
    const rec = users[sess.username.toLowerCase()];
    if (!rec) return;
    rec.trialEnd = Date.now() - 1000;
    rec.subscription = null;
    users[sess.username.toLowerCase()] = rec;
    this._writeUsers(users);
    console.log('Trial force-expired for', rec.username);
  },
};

// Storage utility - persists user progress in localStorage
// CHANGED: progress is now namespaced per user. Key = "cia_progress_<username>".
// Falls back to a "guest" namespace if no user logged in (used only briefly,
// data is discarded on register/login).
const Storage = {
  BASE_KEY: 'cia_progress',
  LEGACY_KEY: 'cia_part1_progress', // single-user key from v1

  _scope() {
    if (window.Auth) {
      const u = Auth.currentUser();
      if (u) return u.username.toLowerCase();
    }
    return '__guest__';
  },
  _key() { return this.BASE_KEY + '_' + this._scope(); },

  get() {
    try {
      const raw = localStorage.getItem(this._key());
      if (raw) return JSON.parse(raw);

      // First-time access for this user: migrate legacy single-user data if present
      // and only if this is the first registered user (avoids cross-user leak).
      const legacy = localStorage.getItem(this.LEGACY_KEY);
      if (legacy && window.Auth) {
        const users = Auth._readUsers();
        if (Object.keys(users).length === 1) {
          try {
            const data = JSON.parse(legacy);
            this.save(data);
            localStorage.removeItem(this.LEGACY_KEY);
            return data;
          } catch {}
        }
      }
      return this.defaultState();
    } catch {
      return this.defaultState();
    }
  },

  save(state) {
    try {
      localStorage.setItem(this._key(), JSON.stringify(state));
    } catch (e) {
      console.warn('Storage full:', e);
    }
  },

  // Mark a lesson as bookmarked
  toggleLessonBookmark(subunitId) {
    const s = this.get();
    s.lessonBookmarks = s.lessonBookmarks || {};
    if (s.lessonBookmarks[subunitId]) delete s.lessonBookmarks[subunitId];
    else s.lessonBookmarks[subunitId] = Date.now();
    this.save(s);
    return !!s.lessonBookmarks[subunitId];
  },
  isLessonBookmarked(subunitId) {
    const s = this.get();
    return !!(s.lessonBookmarks && s.lessonBookmarks[subunitId]);
  },

  // Mark lesson complete (separate from "seen" — user explicitly clicked done)
  markLessonComplete(subunitId, value = true) {
    const s = this.get();
    s.lessonsCompleted = s.lessonsCompleted || {};
    if (value) s.lessonsCompleted[subunitId] = Date.now();
    else delete s.lessonsCompleted[subunitId];
    this.save(s);
  },
  isLessonComplete(subunitId) {
    const s = this.get();
    return !!(s.lessonsCompleted && s.lessonsCompleted[subunitId]);
  },

  defaultState() {
    return {
      answers: {},         // qId -> { selected, correct, timestamp }
      bookmarks: {},       // qId -> true
      lessonsSeen: {},     // subunitId -> true (auto-marked when opened)
      lessonsCompleted: {},// subunitId -> timestamp (explicit "mark complete")
      lessonBookmarks: {}, // subunitId -> timestamp
      examHistory: [],
      lastAccessedLesson: null, // subunitId
      lastAccessedAt: null,
    };
  },

  recordAnswer(qId, selected, correct) {
    const s = this.get();
    s.answers[qId] = { selected, correct, timestamp: Date.now() };
    this.save(s);
  },

  toggleBookmark(qId) {
    const s = this.get();
    if (s.bookmarks[qId]) {
      delete s.bookmarks[qId];
    } else {
      s.bookmarks[qId] = true;
    }
    this.save(s);
    return !!s.bookmarks[qId];
  },

  isBookmarked(qId) {
    return !!this.get().bookmarks[qId];
  },

  markLessonSeen(subunitId) {
    const s = this.get();
    s.lessonsSeen[subunitId] = true;
    s.lastAccessedLesson = subunitId;
    s.lastAccessedAt = Date.now();
    this.save(s);
  },

  saveExamResult(result) {
    const s = this.get();
    s.examHistory.push({ ...result, timestamp: Date.now() });
    if (s.examHistory.length > 20) s.examHistory = s.examHistory.slice(-20);
    this.save(s);
  },

  getStats() {
    const s = this.get();
    const answers = Object.values(s.answers);
    const attempted = answers.length;
    const correct = answers.filter(a => a.correct).length;
    const bookmarks = Object.keys(s.bookmarks).length;
    const lessonsRead = Object.keys(s.lessonsSeen).length;
    return { attempted, correct, bookmarks, lessonsRead, accuracy: attempted ? Math.round(correct / attempted * 100) : 0 };
  },

  getSubunitStats(subunitId) {
    const s = this.get();
    const suAnswers = Object.entries(s.answers)
      .filter(([id]) => id.startsWith(`P1.${subunitId}.`))
      .map(([, v]) => v);
    const attempted = suAnswers.length;
    const correct = suAnswers.filter(a => a.correct).length;
    return { attempted, correct, accuracy: attempted ? Math.round(correct / attempted * 100) : 0 };
  },

  getStudyUnitStats(suId) {
    const s = this.get();
    const suAnswers = Object.entries(s.answers)
      .filter(([id]) => id.match(new RegExp(`^P1\\.${suId}\\.`)))
      .map(([, v]) => v);
    const attempted = suAnswers.length;
    const correct = suAnswers.filter(a => a.correct).length;
    return { attempted, correct, accuracy: attempted ? Math.round(correct / attempted * 100) : 0 };
  },

  getAnswerForQ(qId) {
    return this.get().answers[qId] || null;
  },

  reset() {
    this.save(this.defaultState());
  }
};

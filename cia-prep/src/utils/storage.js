// Storage utility - persists user progress in localStorage
const Storage = {
  KEY: 'cia_part1_progress',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || this.defaultState();
    } catch {
      return this.defaultState();
    }
  },

  save(state) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Storage full:', e);
    }
  },

  defaultState() {
    return {
      answers: {},         // qId -> { selected, correct, timestamp }
      bookmarks: {},       // qId -> true
      lessonsSeen: {},     // subunitId -> true
      examHistory: [],     // array of exam results
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

// Helper utilities
const Helpers = {
  // Create DOM element with properties
  el(tag, props = {}, children = []) {
    const elem = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') elem.className = v;
      else if (k === 'html') elem.innerHTML = v;
      else if (k === 'text') elem.textContent = v;
      else if (k.startsWith('on')) elem.addEventListener(k.slice(2), v);
      else elem.setAttribute(k, v);
    }
    for (const child of children) {
      if (child) elem.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return elem;
  },

  // Shuffle array
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Format time seconds -> MM:SS
  formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  },

  // ============================================================
  // Content normalizer + formatter.
  // PDF-extracted text breaks at ~100 chars mid-sentence. We rebuild
  // proper paragraphs / bullets / headings before rendering.
  // ============================================================
  formatContent(rawText) {
    if (!rawText) return '<p class="text-muted">Content loading...</p>';

    // ---- STEP 1: clean lines, drop noise ----
    const rawLines = rawText.replace(/\r/g, '').split('\n');
    const cleaned = [];
    for (let line of rawLines) {
      const t = line.replace(/[ \t]+$/g, '');
      const trimmed = t.trim();
      if (/^\d{1,4}$/.test(trimmed)) continue;                          // page numbers
      if (/Gleim.*Copyright|Copyright.*Gleim/i.test(trimmed)) continue; // copyright
      if (/Duplication prohibited/i.test(trimmed)) continue;
      if (/contact copyright@gleim/i.test(trimmed)) continue;
      if (/^study\s+unit\s+\d/i.test(trimmed) && trimmed.length < 60) continue;
      // PDF page headers: "SU 3: Assurance Services II                3"  (lots of whitespace + page no.)
      if (/^SU\s+\d+:.*\s{4,}\d+\s*$/.test(trimmed)) continue;
      // Or just chapter title + trailing big whitespace
      if (/\s{6,}\d{1,3}\s*$/.test(line) && line.length < 160) continue;
      // Footer "essentials of internal auditing" type lines (figure refs etc.)
      if (/^figure\s+\d+[-.]?\d*\s*$/i.test(trimmed)) continue;
      cleaned.push(t); // keep original indent for bullet detection
    }

    // ---- STEP 2: classify each line ----
    // type: 'blank' | 'h1' | 'h2' | 'h3' | 'bullet' | 'subbullet' | 'note' | 'para'
    const items = cleaned.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return { type: 'blank' };

      // Bullet (●  -> top bullet; ■ -> sub bullet)
      if (/^●\s+/.test(trimmed)) return { type: 'bullet', text: trimmed.replace(/^●\s+/, ''), indent: 0, raw: line };
      if (/^■\s+/.test(trimmed)) return { type: 'subbullet', text: trimmed.replace(/^■\s+/, ''), indent: 1, raw: line };
      if (/^[•◦▪]\s+/.test(trimmed)) return { type: 'bullet', text: trimmed.replace(/^[•◦▪]\s+/, ''), indent: 0, raw: line };
      if (/^-\s+/.test(trimmed)) return { type: 'bullet', text: trimmed.replace(/^-\s+/, ''), indent: 0, raw: line };

      // Numbered list e.g. "1." or "1)"
      if (/^\d+[.)]\s+\S/.test(trimmed) && trimmed.length < 220) {
        const text = trimmed.replace(/^\d+[.)]\s+/, '');
        // distinguish numbered headings ("3.1 Operational Auditing") below
        if (!/^\d+\.\d+/.test(trimmed)) return { type: 'numbullet', text, raw: line };
      }

      // Numbered heading "3.1 Title" or "3.1.2 Title"
      if (/^\d+\.\d+(\.\d+)?\s+\S/.test(trimmed) && trimmed.length < 90) {
        return { type: 'h2', text: trimmed, raw: line };
      }

      // ALL CAPS short line → h3
      if (trimmed.length >= 4 && trimmed.length < 70 &&
          /^[A-Z0-9 \-&/(),.:]+$/.test(trimmed) &&
          /[A-Z]/.test(trimmed) &&
          !/[a-z]/.test(trimmed)) {
        return { type: 'h3', text: trimmed, raw: line };
      }

      // Note/tip lines
      if (/^(NOTE|REMEMBER|KEY POINT|IMPORTANT|TIP|EXAM ALERT|EXAM TIP)\b/i.test(trimmed)) {
        return { type: 'note', text: trimmed, raw: line };
      }

      // Title Case heading (short, not ending in punctuation, not a sentence)
      if (trimmed.length < 80 &&
          /^[A-Z]/.test(trimmed) &&
          !/[.!?:;,]$/.test(trimmed) &&
          trimmed.split(' ').length <= 10 &&
          trimmed.split(' ').filter(w => /^[A-Z]/.test(w)).length / trimmed.split(' ').length >= 0.6) {
        return { type: 'h3', text: trimmed, raw: line };
      }

      return { type: 'para', text: trimmed, raw: line };
    });

    // ---- STEP 3: merge wrapped continuation lines ----
    // A line continues the previous if:
    // - prev item is para/bullet/subbullet/numbullet/note
    // - current item is para
    // - prev's text does NOT end with sentence terminator (. ! ? : ;) OR ends mid-word
    // - OR current text starts with lowercase / continuation word
    const merged = [];
    const endsSentence = (s) => /[.!?:;]\s*$/.test(s.trim()) || /["”’)]$/.test(s.trim());
    const startsContinuation = (s) => /^[a-z(]/.test(s.trim()) || /^and |^or |^but |^the /i.test(s.trim());

    for (const item of items) {
      const last = merged[merged.length - 1];
      if (item.type === 'blank') {
        if (last && last.type !== 'blank') merged.push(item);
        continue;
      }
      const canContinue = last && item.type === 'para' &&
        (last.type === 'para' || last.type === 'bullet' || last.type === 'subbullet' || last.type === 'numbullet' || last.type === 'note');
      if (canContinue && (!endsSentence(last.text) || startsContinuation(item.text))) {
        // merge
        last.text = (last.text.replace(/\s+$/, '') + ' ' + item.text.replace(/^\s+/, '')).trim();
        continue;
      }
      merged.push({ ...item });
    }

    // ---- STEP 4: render to HTML ----
    let html = '';
    let listOpen = false;  // bullets list
    let subOpen = false;   // nested sub-bullet list
    let numListOpen = false;
    const closeLists = () => {
      if (subOpen) { html += '</ul></li>'; subOpen = false; }
      if (listOpen) { html += '</ul>'; listOpen = false; }
      if (numListOpen) { html += '</ol>'; numListOpen = false; }
    };

    // Highlight key terms inline (Internal Auditing, IIA Standards, etc.)
    const KEY_TERMS = [
      'Internal Audit Activity','Internal Audit Charter','Internal Auditing','Internal Auditor',
      'IIA Standards','International Professional Practices Framework','IPPF','Code of Ethics',
      'Audit Committee','Board of Directors','Senior Management',
      'Assurance Services','Consulting Services','Risk Management','Governance','Independence','Objectivity',
      'Inherent Risk','Control Risk','Detection Risk','Audit Risk',
      'Reasonable Assurance','Due Professional Care','Fraud Risk',
    ];
    const highlightTerms = (text) => {
      // Escape first, then re-inject markup
      let out = Helpers.escHtml(text);
      // Bold key terms (longest first to avoid partial overlap)
      const terms = [...KEY_TERMS].sort((a, b) => b.length - a.length);
      for (const term of terms) {
        const re = new RegExp('\\b(' + term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + ')\\b', 'g');
        out = out.replace(re, '<span class="kt">$1</span>');
      }
      return out;
    };

    for (const item of merged) {
      if (item.type === 'h2' || item.type === 'h3' || item.type === 'note' || item.type === 'para' || item.type === 'blank') {
        closeLists();
      }
      switch (item.type) {
        case 'blank':
          break;
        case 'h2':
          html += `<h2>${Helpers.escHtml(item.text)}</h2>`;
          break;
        case 'h3':
          html += `<h3>${Helpers.escHtml(item.text)}</h3>`;
          break;
        case 'note':
          html += `<div class="callout"><div class="callout-label">📌 Key Point</div><div class="callout-body">${highlightTerms(item.text.replace(/^(NOTE|REMEMBER|KEY POINT|IMPORTANT|TIP|EXAM ALERT|EXAM TIP)[:\.\s]*/i,''))}</div></div>`;
          break;
        case 'numbullet':
          if (!numListOpen) { html += '<ol class="ll">'; numListOpen = true; }
          html += `<li>${highlightTerms(item.text)}</li>`;
          break;
        case 'bullet':
          if (subOpen) { html += '</ul></li>'; subOpen = false; }
          if (!listOpen) { html += '<ul class="ll">'; listOpen = true; }
          html += `<li>${highlightTerms(item.text)}`;
          // peek next: if next is subbullet keep <li> open and start sub-ul
          break;
        case 'subbullet':
          if (listOpen) {
            if (!subOpen) { html += '<ul class="ll-sub">'; subOpen = true; }
            html += `<li>${highlightTerms(item.text)}</li>`;
          } else {
            // orphan sub-bullet → render as bullet
            html += `<ul class="ll"><li>${highlightTerms(item.text)}</li></ul>`;
          }
          break;
        case 'para':
        default:
          html += `<p>${highlightTerms(item.text)}</p>`;
          break;
      }
      // Auto-close <li> when needed: if current was bullet but next is NOT subbullet, close the li
      // We didn't close <li> above for bullets; close lazily before next non-subbullet
      if (item.type === 'bullet') {
        // find next non-blank
        // Simpler: post-process by tracking that bullet's li is "open"
      }
    }
    closeLists();

    // Post-process: ensure bullet <li> are properly closed.
    // We wrote `<li>text` without `</li>` for bullets; close those before any non-<li> tag.
    html = html.replace(/(<li>[\s\S]*?)(?=<li>|<\/ul>|<ul class="ll-sub">)/g, (m) => {
      // Only add </li> if not already present
      return /<\/li>\s*$/.test(m) ? m : m + '</li>';
    });

    return html || '<p class="text-muted">No content available for this subunit.</p>';
  },

  escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  // Get status for a study unit
  getUnitStatus(suId, totalQ) {
    const stats = Storage.getStudyUnitStats(suId);
    if (stats.attempted === 0) return 'not-started';
    if (stats.attempted >= totalQ) return 'completed';
    return 'in-progress';
  },

  statusLabel(status) {
    return { 'not-started': 'Not Started', 'in-progress': 'In Progress', 'completed': 'Completed' }[status] || status;
  },

  statusClass(status) {
    return { 'not-started': 'badge-gray', 'in-progress': 'badge-amber', 'completed': 'badge-green' }[status] || 'badge-gray';
  },

  // Get color classes for accuracy
  accuracyColor(pct) {
    if (pct >= 75) return '#059669';
    if (pct >= 50) return '#d97706';
    return '#e11d48';
  }
};

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

  // Format content text into HTML sections
  formatContent(rawText) {
    if (!rawText) return '<p class="text-muted">Content loading...</p>';
    
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
    let html = '';
    let inList = false;

    for (const line of lines) {
      // Skip page numbers
      if (/^\d+$/.test(line)) continue;
      // Skip copyright
      if (line.includes('Gleim') && line.includes('Copyright')) continue;
      if (line.includes('Duplication prohibited')) continue;
      if (line.includes('contact copyright@gleim')) continue;

      // Bullet points
      if (line.startsWith('●') || line.startsWith('■') || line.startsWith('-')) {
        if (!inList) { html += '<ul>'; inList = true; }
        const content = line.replace(/^[●■\-]\s*/, '').trim();
        html += `<li>${Helpers.escHtml(content)}</li>`;
        continue;
      }

      // Close list if needed
      if (inList) { html += '</ul>'; inList = false; }

      // Section headers (short lines that look like titles)
      if (line.match(/^\d+\.\d+\s+/) && line.length < 80) {
        html += `<h2>${Helpers.escHtml(line)}</h2>`;
        continue;
      }

      // Subsection headers (ALL CAPS or Title Case short lines)
      if (line.length < 70 && line === line.replace(/[a-z]/g,'') && line.length > 5) {
        // All-caps line - treat as subheader
        html += `<h3>${Helpers.escHtml(line)}</h3>`;
        continue;
      }

      // Bold note-style lines (start with Note, Remember, Key, etc.)
      if (/^(NOTE|REMEMBER|KEY POINT|IMPORTANT|TIP|GLEIM|EXAM ALERT)/i.test(line)) {
        html += `<div class="highlight-box"><strong>📌 Key Point</strong>${Helpers.escHtml(line)}</div>`;
        continue;
      }

      // Regular paragraph
      html += `<p>${Helpers.escHtml(line)}</p>`;
    }

    if (inList) html += '</ul>';
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

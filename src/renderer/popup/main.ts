type PopupType =
  | 'sticky'
  | 'claude-md'
  | 'todo'
  | 'dropped-file'
  | 'browser-tab';

const params = new URLSearchParams(window.location.search);
const type = (params.get('type') ?? 'sticky') as PopupType;
const root = document.getElementById('root')!;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function close(): void {
  window.popupAPI.close();
}

function renderSticky(): void {
  const text = params.get('text') ?? '';
  const author = params.get('author') ?? '— Claude, reviewing your code';
  root.innerHTML = `
    <div class="sticky">
      <div class="tape"></div>
      <div class="close" id="close">×</div>
      <div>${escapeHtml(text)}</div>
      <div class="author">${escapeHtml(author)}</div>
    </div>
  `;
  document.getElementById('close')?.addEventListener('click', close);
}

function renderClaudeMd(): void {
  const label = params.get('label') ?? 'CLAUDE.md';
  root.innerHTML = `
    <div class="claude-md" id="card">
      <div class="icon"><div class="fold"></div></div>
      <div class="label">${escapeHtml(label)}</div>
    </div>
  `;
  document.getElementById('card')?.addEventListener('click', close);
}

function renderTodo(): void {
  const title = params.get('title') ?? 'TodoWrite';
  // Up to 8 tasks passed as `t0`, `t1`, … each shaped "pending|content" or just "content".
  const items: Array<{ text: string }> = [];
  for (let i = 0; i < 8; i++) {
    const raw = params.get(`t${i}`);
    if (!raw) break;
    items.push({ text: raw });
  }

  root.innerHTML = `
    <div class="todo">
      <div class="close" id="close">×</div>
      <div class="header"><span class="dot"></span>${escapeHtml(title)}</div>
      <ul id="list"></ul>
    </div>
  `;
  document.getElementById('close')?.addEventListener('click', close);

  const list = document.getElementById('list')!;
  // Spawn each item with progressive timing — pending → done.
  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'pending';
    li.style.animationDelay = `${i * 250}ms`;
    li.innerHTML = `<span class="check">▢</span><span class="text">${escapeHtml(item.text)}</span>`;
    list.appendChild(li);
    setTimeout(() => {
      li.classList.remove('pending');
      li.classList.add('done');
      const check = li.querySelector('.check');
      if (check) check.textContent = '☑';
    }, 600 + i * 600);
  });
}

function renderDroppedFile(): void {
  const caption = params.get('caption') ?? 'snapshot.png';
  const snippet =
    params.get('snippet') ??
    'function foo() {\n  return 42;\n}';
  // Lightly syntax-color the snippet — keywords + strings only.
  const colored = snippet
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("[^"]*")/g, '<span class="str">$1</span>')
    .replace(
      /\b(function|const|let|var|return|if|else|for|while|import|export|from|class|new|await|async)\b/g,
      '<span class="kw">$1</span>',
    )
    .replace(/(\/\/[^\n]*)/g, '<span class="dim">$1</span>');

  root.innerHTML = `
    <div class="dropped-file" id="card">
      <div class="close" id="close">×</div>
      <div class="screen">${colored}</div>
      <div class="caption">${escapeHtml(caption)}</div>
    </div>
  `;
  document.getElementById('card')?.addEventListener('click', close);
  document.getElementById('close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
}

function renderBrowserTab(): void {
  const title = params.get('title') ?? 'Untitled';
  const url = params.get('url') ?? 'about:blank';
  const heading = params.get('heading') ?? title;
  const body = params.get('body') ?? '';
  root.innerHTML = `
    <div class="browser-tab" id="tab">
      <div class="chrome">
        <div class="favicon"></div>
        <div class="title">${escapeHtml(title)}</div>
        <div class="close" id="close">×</div>
      </div>
      <div class="addressbar">${escapeHtml(url)}</div>
      <div class="content">
        <h2>${escapeHtml(heading)}</h2>
        <div>${escapeHtml(body)}</div>
      </div>
    </div>
  `;
  document.getElementById('close')?.addEventListener('click', close);
}

const renderers: Record<PopupType, () => void> = {
  sticky: renderSticky,
  'claude-md': renderClaudeMd,
  todo: renderTodo,
  'dropped-file': renderDroppedFile,
  'browser-tab': renderBrowserTab,
};

renderers[type]();

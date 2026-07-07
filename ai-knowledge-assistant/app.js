import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── STATE ───────────────────────────────────────────────────
let knowledgeBase = [];
let currentModel  = localStorage.getItem('agentModel') || 'gemini-2.5-flash';
let currentPersona = localStorage.getItem('agentPersona') || 'professional';
let agentProvider = localStorage.getItem('agentProvider') || 'gemini';
let customBaseUrl = localStorage.getItem('customBaseUrl') || '';
let customModelName = localStorage.getItem('customModelName') || '';
let customApiKey = localStorage.getItem('customApiKey') || '';
let attachedFiles = []; // array of { name, content }
let chatHistory = [];
let sessions = [];
let isTtsEnabled = false; // OFF by default — user can enable via the speaker icon

// ─── DOM REFS ────────────────────────────────────────────────
const $  = id => document.getElementById(id);

const screenOnboarding = $('screen-onboarding');
const screenWorkspace  = $('screen-workspace');

const inpApiKey     = $('inp-apikey');
const btnConnect    = $('btn-connect');
const obError       = $('ob-error');

const btnNewChat    = $('btn-new-chat');
const ulHistory     = $('ul-history');
const historyEmpty  = $('history-empty');
const btnSettings   = $('btn-settings');
const btnLogout     = $('btn-logout');

const mcMessages    = $('mc-messages');
const emptyState    = $('empty-state');
const taChat        = $('ta-chat');
const btnSend       = $('btn-send');
const uiCurrentModel = $('ui-current-model');

const btnExport     = $('btn-export');
const btnClearChat  = $('btn-clear-chat');
const btnMic        = $('btn-mic');
const btnTts        = $('btn-tts');
const btnAttach     = $('btn-attach');
const inpFile       = $('inp-file');
const attachmentPreview = $('attachment-preview');

const srContent     = $('sr-content');
const btnClearCtx   = $('btn-clear-ctx');
const ctxEmpty      = $('ctx-empty');
const modalSettings = $('modal-settings');
const btnCloseSettings = $('btn-close-settings');
const selProvider      = $('sel-provider');
const wrapGemini       = $('settings-gemini-wrap');
const wrapCustom       = $('settings-custom-wrap');
const inpSettingsKey   = $('inp-settings-key');
const selModel         = $('sel-model');
const inpCustomUrl     = $('inp-custom-url');
const inpCustomModel   = $('inp-custom-model');
const inpCustomKey     = $('inp-custom-key');
const selPersona       = $('sel-persona');
const btnSaveSettings  = $('btn-save-settings');

const btnWebSearch     = $('btn-web-search');
let webSearchEnabled   = false;

const modalPreview     = $('modal-preview');
const btnClosePreview  = $('btn-close-preview');
const previewIframe    = $('preview-iframe');

// ─── INIT ────────────────────────────────────────────────────
(async function init() {
  try {
    const res = await fetch('data.json');
    knowledgeBase = await res.json();
  } catch(e) { console.error('KB load fail', e); }

  // ── Read URL params FIRST, before routeScreen() ──────────────
  const urlParams = new URLSearchParams(window.location.search);
  const providedKey      = urlParams.get('apiKey');
  const providedProvider = urlParams.get('provider');
  const providedBaseUrl  = urlParams.get('baseUrl');
  const providedModel    = urlParams.get('model');
  const pageMode         = urlParams.get('mode'); // 'widget' | 'demo' | null

  // Check if user explicitly chose demo mode previously – respect that choice
  const existingProvider = localStorage.getItem('agentProvider');

  if (pageMode === 'demo' || existingProvider === 'demo') {
    // Demo mode — skip all API key checks, don't overwrite with URL params
    agentProvider = 'demo';
    localStorage.setItem('agentProvider', 'demo');
  } else if (providedKey) {
    // API key supplied via URL (widget integration) — only apply if not in demo mode
    if (providedProvider === 'custom') {
      localStorage.setItem('agentProvider', 'custom');
      localStorage.setItem('customApiKey', providedKey);
      agentProvider  = 'custom';
      customApiKey   = providedKey;
      if (providedBaseUrl) {
        localStorage.setItem('customBaseUrl', providedBaseUrl);
        customBaseUrl = providedBaseUrl;
      }
      if (providedModel) {
        localStorage.setItem('customModelName', providedModel);
        customModelName = providedModel;
      }
    } else {
      localStorage.setItem('agentProvider', 'gemini');
      localStorage.setItem('geminiApiKey', providedKey);
      agentProvider = 'gemini';
    }
  }

  // ── Widget UI setup ──────────────────────────────────────────
  const isWidgetMode = pageMode === 'widget' || pageMode === 'demo' || existingProvider === 'demo';
  if (isWidgetMode) {
    document.body.classList.add('widget-mode');
    const normalHeader = document.getElementById('normal-header');
    const widgetHeader = document.getElementById('widget-header');
    if (normalHeader) normalHeader.style.display = 'none';
    if (widgetHeader) widgetHeader.style.display = 'flex';
    currentPersona = 'health';
    const btnClose = document.getElementById('btn-widget-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        window.parent.postMessage('CLOSE_WIDGET', '*');
      });
    }
  }

  const renderer = new marked.Renderer();
  renderer.code = function(code, language) {
    language = language || '';
    let validLang = hljs.getLanguage(language) ? language : 'plaintext';
    let highlighted = code;
    try {
      highlighted = hljs.highlight(code || '', { language: validLang }).value;
    } catch(e) {}
    
    let previewBtn = '';
    if (validLang === 'html' || validLang === 'xml' || language === 'html') {
      previewBtn = `<button class="code-copy-btn" style="margin-right: 8px;" onclick="previewCode(decodeURIComponent('${encodeURIComponent(code)}'))">👁️ Preview</button>`;
    }
    
    return `<pre><div class="code-header"><span>${validLang}</span><div style="display:flex; align-items:center;">${previewBtn}<button class="code-copy-btn" onclick="copyText(this, decodeURIComponent('${encodeURIComponent(code)}'))"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy</button></div></div><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
  };
  
  window.previewCode = function(code) {
    if (previewIframe) previewIframe.srcdoc = code;
    if (modalPreview) modalPreview.classList.remove('hidden');
  };
  
  if (btnClosePreview) {
    btnClosePreview.addEventListener('click', () => {
      if (modalPreview) modalPreview.classList.add('hidden');
      if (previewIframe) previewIframe.srcdoc = '';
    });
  }

  marked.setOptions({ renderer, breaks: true });

  if (selProvider) selProvider.value = agentProvider;
  if (selModel)    selModel.value    = currentModel;
  if (selPersona)  selPersona.value  = currentPersona;
  
  if (agentProvider === 'custom') {
    if (uiCurrentModel) uiCurrentModel.textContent = customModelName || 'Custom Agent';
  } else {
    if (uiCurrentModel) uiCurrentModel.textContent = currentModel;
  }

  routeScreen();
})();

// ─── ROUTING ────────────────────────────────────────────────────
function routeScreen() {
  const geminiKey = localStorage.getItem('geminiApiKey');
  const customKey = localStorage.getItem('customApiKey');
  const provider  = localStorage.getItem('agentProvider');

  const hasKey =
    (provider === 'demo') ||
    (provider === 'custom' && customKey) ||
    ((provider === 'gemini' || !provider) && geminiKey);

  if (hasKey) {
    if (screenOnboarding) screenOnboarding.classList.add('hidden');
    if (screenWorkspace)  screenWorkspace.classList.remove('hidden');
    if (taChat) taChat.focus();
  } else {
    if (screenWorkspace)  screenWorkspace.classList.add('hidden');
    if (screenOnboarding) screenOnboarding.classList.remove('hidden');
    const subtitle = document.querySelector('.ob-subtitle');
    if (subtitle) {
      subtitle.textContent = provider === 'custom'
        ? `Initialize your workspace by connecting ${customModelName || 'Custom Model'}.`
        : 'Initialize your workspace by connecting Gemini.';
    }
    if (inpApiKey) inpApiKey.focus();
  }
}

// ─── ONBOARDING ──────────────────────────────────────────────────
if (btnConnect) {
  btnConnect.addEventListener('click', () => {
    if (!inpApiKey) return;
    const key = inpApiKey.value.trim();
    if (!key || key.length < 10) {
      if (obError) obError.textContent = 'Please enter a valid API key.';
      return;
    }
    if (agentProvider === 'custom') {
      localStorage.setItem('customApiKey', key);
      customApiKey = key;
    } else {
      localStorage.setItem('geminiApiKey', key);
      localStorage.setItem('agentProvider', 'gemini');
      agentProvider = 'gemini';
    }
    if (obError) obError.textContent = '';
    routeScreen();
  });
}

if (inpApiKey) {
  inpApiKey.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); if (btnConnect) btnConnect.click(); }
  });
}

const btnDemo = $('btn-demo');
if (btnDemo) {
  btnDemo.addEventListener('click', () => {
    localStorage.setItem('agentProvider', 'demo');
    agentProvider = 'demo';
    if (uiCurrentModel) uiCurrentModel.textContent = 'Aegis Mock Doctor';
    routeScreen();
  });
}

// ─── LOGOUT ────────────────────────────────
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('geminiApiKey');
    localStorage.removeItem('agentProvider');
    localStorage.removeItem('customApiKey');
    routeScreen();
  });
}

// ─── NEW CHAT ──────────────────────────────────────────────
if (btnNewChat) {
  btnNewChat.addEventListener('click', () => {
    if (chatHistory.length > 0) {
      const title = chatHistory[0]?.text?.substring(0, 30) + '...' || 'Session';
      sessions.push({ id: Date.now(), title, messages: [...chatHistory] });
      renderHistory();
    }
    clearChat();
  });
}

function clearChat() {
  chatHistory = [];
  mcMessages.innerHTML = '';
  mcMessages.appendChild(emptyState);
  emptyState.style.display = '';
  clearContext();
}

// ─── HISTORY ─────────────────────────────────────────────────
function renderHistory() {
  ulHistory.innerHTML = '';
  historyEmpty.style.display = sessions.length ? 'none' : '';
  sessions.slice().reverse().forEach(s => {
    const li = document.createElement('li');
    li.textContent = s.title;
    li.title = s.title;
    li.addEventListener('click', () => loadSession(s));
    ulHistory.appendChild(li);
  });
}

function loadSession(session) {
  clearChat();
  emptyState.style.display = 'none';
  session.messages.forEach(m => {
    if (m.role === 'user') addMsgUI(m.text, 'user');
    else addMsgUI(m.text, 'ai', true);
  });
  chatHistory = [...session.messages];
}

// ─── SETTINGS MODAL ──────────────────────────────────────────
if (selProvider) {
  selProvider.addEventListener('change', (e) => {
    if (wrapGemini) wrapGemini.classList.toggle('hidden', e.target.value !== 'gemini');
    if (wrapCustom)  wrapCustom.classList.toggle('hidden',  e.target.value === 'gemini');
  });
}

if (btnSettings) {
  btnSettings.addEventListener('click', () => {
    if (selProvider)    selProvider.value     = agentProvider;
    if (selProvider)    selProvider.dispatchEvent(new Event('change'));
    if (inpSettingsKey) inpSettingsKey.value  = localStorage.getItem('geminiApiKey') || '';
    if (selModel)       selModel.value        = currentModel;
    if (inpCustomUrl)   inpCustomUrl.value    = customBaseUrl;
    if (inpCustomModel) inpCustomModel.value  = customModelName;
    if (inpCustomKey)   inpCustomKey.value    = customApiKey;
    if (selPersona)     selPersona.value      = currentPersona;
    if (modalSettings)  modalSettings.classList.remove('hidden');
  });
}

if (btnCloseSettings) {
  btnCloseSettings.addEventListener('click', () => { if (modalSettings) modalSettings.classList.add('hidden'); });
}
if (modalSettings) {
  modalSettings.addEventListener('click', e => { if (e.target === modalSettings) modalSettings.classList.add('hidden'); });
}

if (btnSaveSettings) {
  btnSaveSettings.addEventListener('click', () => {
    agentProvider = selProvider ? selProvider.value : agentProvider;
    localStorage.setItem('agentProvider', agentProvider);

    const gKey = inpSettingsKey ? inpSettingsKey.value.trim() : '';
    if (gKey) localStorage.setItem('geminiApiKey', gKey);

    currentModel = selModel ? selModel.value : currentModel;
    localStorage.setItem('agentModel', currentModel);

    customBaseUrl   = inpCustomUrl   ? inpCustomUrl.value.trim()   : customBaseUrl;
    customModelName = inpCustomModel ? inpCustomModel.value.trim() : customModelName;
    customApiKey    = inpCustomKey   ? inpCustomKey.value.trim()   : customApiKey;
    localStorage.setItem('customBaseUrl',   customBaseUrl);
    localStorage.setItem('customModelName', customModelName);
    localStorage.setItem('customApiKey',    customApiKey);

    currentPersona = selPersona ? selPersona.value : currentPersona;
    localStorage.setItem('agentPersona', currentPersona);

    if (uiCurrentModel) {
      uiCurrentModel.textContent = agentProvider === 'custom'
        ? (customModelName || 'Custom Agent')
        : currentModel;
    }
    if (modalSettings) modalSettings.classList.add('hidden');
  });
}

// ─── CLEAR CONTEXT ───────────────────────────────────────────
if (btnClearCtx) btnClearCtx.addEventListener('click', clearContext);
function clearContext() {
  if (!srContent) return;
  Array.from(srContent.children).forEach(ch => { if (ch !== ctxEmpty) ch.remove(); });
  if (ctxEmpty) ctxEmpty.style.display = '';
}

// ─── SUGGESTIONS ──────────────────────────────────────
document.querySelectorAll('.suggest-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    if (taChat) { taChat.value = btn.dataset.q; taChat.dispatchEvent(new Event('input')); }
    submitMessage();
  });
});

// ─── HANDY FEATURES (EXPORT & CLEAR) ──────────────────────────
if (btnClearChat) {
  btnClearChat.addEventListener('click', () => {
    if (confirm('Clear current chat? This cannot be undone.')) clearChat();
  });
}

if (btnExport) {
  btnExport.addEventListener('click', () => {
    if (chatHistory.length === 0) return alert('No chat to export.');
    let md = `# AgentOS Chat Export\nDate: ${new Date().toLocaleString()}\n\n`;
    chatHistory.forEach(msg => {
      md += `### ${msg.role === 'user' ? 'User' : 'AgentOS'}\n${msg.text}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `AgentOS_Chat_${Date.now()}.md`;
    a.click();
  });
}

// ─── VOICE INPUT ───────────────────────────────────────
let recognition;
if ('webkitSpeechRecognition' in window && btnMic) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous    = false;
  recognition.interimResults = true;
  recognition.onstart  = () => { btnMic.classList.add('recording');    if (taChat) taChat.placeholder = "Listening..."; };
  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) transcript += event.results[i][0].transcript;
    if (taChat) { taChat.value = transcript; taChat.dispatchEvent(new Event('input')); }
  };
  recognition.onend   = () => { btnMic.classList.remove('recording'); if (taChat) taChat.placeholder = "Send a message to AgentOS..."; };
  recognition.onerror = (e) => { console.error('Speech recognition error', e); btnMic.classList.remove('recording'); };
  btnMic.addEventListener('click', () => {
    if (btnMic.classList.contains('recording')) recognition.stop();
    else recognition.start();
  });
} else if (btnMic) {
  btnMic.style.display = 'none';
}

// ─── VOICE OUTPUT (TTS) ───────────────────────────────
if (btnTts) {
  // TTS is OFF by default — no green color on init
  btnTts.addEventListener('click', () => {
    isTtsEnabled = !isTtsEnabled;
    btnTts.style.color = isTtsEnabled ? '#10b981' : '';
    btnTts.style.borderColor = isTtsEnabled ? '#10b981' : '';
    if (!isTtsEnabled) window.speechSynthesis.cancel();
  });
}

function speakText(text) {
  if (!isTtsEnabled) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted for audio.').replace(/[#*`_]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'en-US';
  utterance.rate = 1.05;
  window.speechSynthesis.speak(utterance);
}

// ─── FILE ATTACHMENTS ─────────────────────────────────
if (btnAttach && inpFile) {
  btnAttach.addEventListener('click', () => inpFile.click());
  inpFile.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) { alert(`File ${file.name} is too large (>5MB).`); continue; }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => { attachedFiles.push({ name: file.name, type: file.type, isImage: true, content: e.target.result }); renderAttachments(); };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        attachedFiles.push({ name: file.name, type: file.type || 'text/plain', isImage: false, content: text });
        renderAttachments();
      }
    }
    inpFile.value = '';
  });
}

function renderAttachments() {
  if (!attachmentPreview) return;
  attachmentPreview.innerHTML = '';
  if (attachedFiles.length === 0) { attachmentPreview.classList.add('hidden'); return; }
  attachmentPreview.classList.remove('hidden');
  attachedFiles.forEach((file, index) => {
    const chip = document.createElement('div');
    chip.className = 'file-chip';
    chip.textContent = (file.isImage ? '🖼️ ' : '📄 ') + file.name + ' ';
    const x = document.createElement('button');
    x.textContent = '✕';
    x.onclick = () => removeAttachment(index);
    chip.appendChild(x);
    attachmentPreview.appendChild(chip);
  });
}

window.removeAttachment = function(index) {
  attachedFiles.splice(index, 1);
  renderAttachments();
};

// ─── TEXTAREA AUTO-RESIZE ─────────────────────────────
if (taChat) {
  taChat.addEventListener('input', () => {
    taChat.style.height = 'auto';
    taChat.style.height = taChat.scrollHeight + 'px';
    if (btnSend) btnSend.disabled = taChat.value.trim() === '';
    scrollBottom();
  });
  taChat.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (btnSend && !btnSend.disabled) submitMessage();
    }
  });
}

if (btnSend) btnSend.addEventListener('click', submitMessage);

if (btnWebSearch) {
  btnWebSearch.addEventListener('click', () => {
    webSearchEnabled = !webSearchEnabled;
    btnWebSearch.style.color = webSearchEnabled ? '#34d399' : '';
  });
}

// ─── SUBMIT MESSAGE ────────────────────────────────────
async function submitMessage() {
  const text = taChat.value.trim();
  if (!text) return;

  emptyState.style.display = 'none';

  // Reset input
  taChat.value = '';
  taChat.style.height = 'auto';
  btnSend.disabled = true;

  addMsgUI(text, 'user');
  chatHistory.push({ role: 'user', text });

  const sources = findSources(text);
  renderSources(sources);

  await callAgent(text, sources);
}

// ─── UI HELPERS ──────────────────────────────────────────────
function addMsgUI(content, role, isHtml = false) {
  const row = document.createElement('div');
  row.className = `msg-row ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (isHtml) bubble.innerHTML = content;
  else bubble.textContent = content;
  
  if (role === 'ai') {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'msg-copy-btn';
    copyBtn.title = 'Copy message';
    copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyBtn.onclick = () => {
      // Create a temporary div to strip HTML tags if needed, or use the raw text from chatHistory
      // Better approach: extract text directly from the bubble to skip UI elements like the button itself
      const rawText = bubble.innerText.replace('Copy', '').trim();
      navigator.clipboard.writeText(rawText);
      const originalSvg = copyBtn.innerHTML;
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => copyBtn.innerHTML = originalSvg, 2000);
    };
    bubble.appendChild(copyBtn);
  }
  
  row.appendChild(bubble);
  mcMessages.appendChild(row);
  
  scrollBottom();
  return row;
}

// Global copy helper for code blocks
window.copyText = function(btn, text) {
  navigator.clipboard.writeText(text);
  const original = btn.innerHTML;
  btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
  setTimeout(() => btn.innerHTML = original, 2000);
};

function addTypingUI() {
  const row = document.createElement('div');
  row.className = 'msg-row ai typing-row';
  row.innerHTML = '<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  mcMessages.appendChild(row);
  scrollBottom();
  return row;
}

function scrollBottom() {
  // Use requestAnimationFrame to ensure DOM is updated before scrolling
  requestAnimationFrame(() => {
    mcMessages.scrollTop = mcMessages.scrollHeight;
  });
}

// ─── TF-IDF RAG SEARCH ─────────────────────────────────────────
function findSources(query) {
  if (!knowledgeBase.length) return [];
  
  // Basic tokenizer
  const tokenize = text => text.toLowerCase().match(/\b(\w+)\b/g) || [];
  const queryTokens = tokenize(query).filter(w => w.length > 3);
  if (!queryTokens.length) return [];

  // 1. Calculate Document Frequencies (DF)
  const df = {};
  knowledgeBase.forEach(doc => {
    const docTokens = new Set(tokenize(doc.title + ' ' + doc.content));
    docTokens.forEach(t => { df[t] = (df[t] || 0) + 1; });
  });

  const N = knowledgeBase.length;

  // 2. Calculate TF-IDF for each doc against query
  return knowledgeBase
    .map(doc => {
      const docTokens = tokenize(doc.title + ' ' + doc.content);
      const tf = {};
      docTokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });

      let score = 0;
      queryTokens.forEach(qt => {
        if (tf[qt]) {
          const idf = Math.log(N / (df[qt] || 1)) + 1;
          score += (tf[qt] / docTokens.length) * idf;
          // Bonus for title matches
          if (doc.title.toLowerCase().includes(qt)) score += idf * 2;
        }
      });
      return { ...doc, score };
    })
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function renderSources(sources) {
  clearContext();
  if (!sources.length) return;
  ctxEmpty.style.display = 'none';
  sources.forEach(s => {
    const card = document.createElement('div');
    card.className = 'ctx-card';
    card.innerHTML = `
      <div class="ctx-cat">${s.category}</div>
      <div class="ctx-title">${s.title}</div>
      <div class="ctx-excerpt">${s.content.substring(0, 150)}...</div>
    `;
    srContent.appendChild(card);
  });
}

// ─── API ROUTER (GEMINI OR CUSTOM OPEN-SOURCE) ───────────────
async function callAgent(userText, sources) {
  taChat.disabled = true;

  let contextBlock = sources.length
    ? sources.map(s => `## ${s.title}\n${s.content}`).join('\n\n')
    : 'No matching internal articles found.';

  if (attachedFiles.length > 0) {
    contextBlock += '\n\n## User Attached Files\n';
    attachedFiles.forEach(f => {
      if (f.isImage) {
        contextBlock += `### Image: ${f.name} (Attached as vision input)\n\n`;
      } else {
        contextBlock += `### File: ${f.name}\n${f.content}\n\n`;
      }
    });
  }
  
  if (webSearchEnabled) {
    try {
      const row = document.createElement('div');
      row.className = 'msg-row ai';
      row.innerHTML = `<div class="msg-bubble" style="color: #94a3b8; font-size: 13px;">🌍 Fetching web context for "${userText}"...</div>`;
      mcMessages.appendChild(row);
      scrollBottom();
      
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(userText)}&utf8=&format=json&origin=*`);
      const searchJson = await searchRes.json();
      if (searchJson.query && searchJson.query.search.length > 0) {
        const title = searchJson.query.search[0].title;
        const detailRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(title)}&format=json&origin=*`);
        const detailJson = await detailRes.json();
        const pages = detailJson.query.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId].extract;
        
        contextBlock += `\n\n## Web Context (Wikipedia: ${title})\n${extract}\n`;
        row.innerHTML = `<div class="msg-bubble" style="color: #34d399; font-size: 13px;">✅ Web context injected.</div>`;
      } else {
         row.innerHTML = `<div class="msg-bubble" style="color: #fb7185; font-size: 13px;">❌ No web results found.</div>`;
      }
      setTimeout(() => row.remove(), 2500);
    } catch(e) {
      console.error('Web search failed', e);
    }
  }

  let personaInstructions = '';
  if (currentPersona === 'professional') {
    personaInstructions = 'You are a strict, factual Knowledge Worker. Base your answers strictly on the knowledge base and attached files. Be highly professional.';
  } else if (currentPersona === 'coder') {
    personaInstructions = 'You are a Code Expert. Provide code-heavy answers, focusing on implementation details, syntax, and architectural patterns. Always format responses in Markdown code blocks where applicable.';
  } else if (currentPersona === 'health') {
    personaInstructions = 'HONcode Principles: Established by the Health On the Net Foundation, this is the oldest and most widely used ethical standard. It requires sites to adhere to Authoritative (give credentials), Attribution (cite scientific sources), Justifiability (support claims), and Financial Disclosure. National Academy of Medicine (NAM) Standards: The NAM dictates that credible health information must be Science-Based, transparently peer-reviewed, and completely free from commercial or financial conflicts of interest. WHO Global Principles: The World Health Organization promotes global guidelines specifically for digital and social media to ensure health information is evidence-based, objective, and distinct from personal anecdotes. You must adhere to all these strict health and medical guidelines.';
  } else if (currentPersona === 'engineer') {
    personaInstructions = 'You are a strict Engineering Expert. You must adhere to IEEE and ISO standards where applicable. Your answers must be evidence-based, deterministic, highly analytical, mathematically sound, and prioritize safety, efficiency, and robustness over theoretical musings. Cite standard practices and avoid making unsupported claims.';
  } else if (currentPersona === 'finance') {
    personaInstructions = 'You are a strict Financial Expert and Fiduciary. You must adhere to GAAP, SEC, and international financial reporting standards. Your answers must be highly objective, strictly analytical, and focus on risk management, regulatory compliance, and evidence-based economic principles. Provide the necessary financial disclosures and avoid guaranteeing returns or giving personalized investment advice.';
  } else {
    personaInstructions = 'You are a Creative Brainstormer. Be talkative, explore ideas outside the strict knowledge base, and suggest innovative approaches while remaining helpful.';
  }

  const systemPrompt = `You are AgentOS, a highly advanced corporate AI assistant.

<knowledge_base>
${contextBlock}
</knowledge_base>

Rules:
1. ${personaInstructions}
2. Format responses in clean Markdown. Use bold, lists, and code blocks where helpful.
3. Be concise and extremely helpful.`;

  // Initialize an empty AI bubble for streaming
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  row.appendChild(bubble);
  mcMessages.appendChild(row);
  scrollBottom();

  let fullText = '';

  try {
    if (agentProvider === 'demo') {
      fullText = await runDemoStream(systemPrompt, userText, bubble);
    } else if (agentProvider === 'custom') {
      fullText = await runCustomProviderStream(systemPrompt, userText, bubble);
    } else {
      fullText = await runGeminiStream(systemPrompt, userText, bubble);
    }

    // Once finished, attach the copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'msg-copy-btn';
    copyBtn.title = 'Copy message';
    copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyBtn.onclick = () => {
      const rawText = bubble.innerText.replace('Copy', '').trim();
      navigator.clipboard.writeText(rawText);
      const originalSvg = copyBtn.innerHTML;
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => copyBtn.innerHTML = originalSvg, 2000);
    };
    bubble.appendChild(copyBtn);

    chatHistory.push({ role: 'ai', text: fullText });

    // Clear attachments after successful send
    attachedFiles = [];
    renderAttachments();

  } catch (err) {
    console.error(err);
    let errMsg;
    const msg = err.message || '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
      errMsg = `⚠️ **Rate limit / quota exceeded**.\n\nThis means the API key is restricted or the limit is hit. Go to **Settings** and update your configuration.`;
      addMsgUI(marked.parse(errMsg), 'ai', true);
    } else if (msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('400')) {
      addMsgUI('🔑 Invalid or restricted API key. Please check your settings.', 'ai');
    } else if (msg.includes('Failed to fetch')) {
      errMsg = `⚠️ **Connection Error**.\n\nCould not reach the Custom Base URL (\`${customBaseUrl}\`). Make sure your local server (e.g. Ollama/LM Studio) is running and CORS is enabled.`;
      addMsgUI(marked.parse(errMsg), 'ai', true);
    } else {
      addMsgUI(`Error: ${msg || 'Failed to reach Agent endpoint. Check your configuration.'}`, 'ai');
    }
    // Remove the typing bubble if it failed before streaming started
    if (fullText === '') {
      row.remove();
    }
  } finally {
    taChat.disabled = false;
    taChat.focus();
  }
}

// ─── GEMINI SPECIFIC STREAMING ────────────────────────────────
async function runGeminiStream(systemPrompt, userText, bubble) {
  const apiKey = localStorage.getItem('geminiApiKey');
  if (!apiKey) throw new Error('API_KEY_INVALID');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: currentModel });

  const parts = [{ text: systemPrompt + '\n\nUser: ' + userText }];
  
  attachedFiles.forEach(f => {
    if (f.isImage && f.content.includes('base64,')) {
      const mimeType = f.type;
      const base64Data = f.content.split('base64,')[1];
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }
  });

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: parts }]
  });

  let fullText = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    bubble.innerHTML = marked.parse(fullText);
    scrollBottom();
  }
  speakText(fullText);
  return fullText;
}

// ─── CUSTOM OPENAI-COMPATIBLE STREAMING (OLLAMA / GLM) ────────
async function runCustomProviderStream(systemPrompt, userText, bubble) {
  if (!customBaseUrl) throw new Error('Custom Base URL is not set in Settings.');

  const messageContent = [{ type: 'text', text: userText }];
  attachedFiles.forEach(f => {
    if (f.isImage) {
      messageContent.push({
        type: 'image_url',
        image_url: { url: f.content }
      });
    }
  });

  // Construct standard OpenAI chat payload
  const payload = {
    model: customModelName || 'glm-4',
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: messageContent }
    ],
    stream: true
  };

  const headers = { 'Content-Type': 'application/json' };
  if (customApiKey) headers['Authorization'] = `Bearer ${customApiKey}`;

  // Use base URL and ensure it ends cleanly before appending endpoint
  const cleanUrl = customBaseUrl.endsWith('/') ? customBaseUrl.slice(0, -1) : customBaseUrl;
  const endpoint = `${cleanUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error && errorJson.error.message) {
        errorMsg = errorJson.error.message;
      }
    } catch(e) {}
    throw new Error(errorMsg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = '';
  let buffer = '';

  // Manual SSE Parsing
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep the last incomplete line in buffer

    for (const line of lines) {
      if (line.trim() === '') continue;
      if (line.startsWith('data: ')) {
        const dataStr = line.replace('data: ', '').trim();
        if (dataStr === '[DONE]') break;
        
        try {
          const data = JSON.parse(dataStr);
          if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
            fullText += data.choices[0].delta.content;
            // Fix missing newlines before codeblocks (common with some LLMs)
            const mdText = fullText.replace(/([^\n])```/g, '$1\n```');
            bubble.innerHTML = marked.parse(mdText);
            scrollBottom();
          }
        } catch (e) {
          console.warn("Failed to parse SSE data chunk", dataStr);
        }
      }
    }
  }
  speakText(fullText);
  return fullText;
}

// ─── DEMO OFFLINE STREAMING RESPONSE SIMULATOR ───────────────
async function runDemoStream(systemPrompt, userText, bubble) {
  const text = userText.toLowerCase();
  let reply = "";
  
  if (text.includes("symptom") || text.includes("pain") || text.includes("ache") || text.includes("hurt") || text.includes("cough")) {
    reply = "**AI Clinical Assessment:**\n* **Urgency:** Moderate\n* **First-Aid Guidance**: Take plenty of rest, hydrate with water/electrolytes, and monitor parameters. For high fever, consult a general physician.\n\n⚠️ **Red Flag Warnings**: If symptoms worsen, chest tightness or high fever exceeds 103°F, consult immediately or dispatch emergency care.";
  } else if (text.includes("chest") || text.includes("heart") || text.includes("palpitation")) {
    reply = "**AI Clinical Assessment (Urgency: High):**\n\n* **Matching Specialist**: **Dr. Robert Vance** (Cardiology Department, Main Building Floor 2).\n\n⚠️ **Cardiovascular Warning**: If you feel crushing chest pain, tightness spreading to the arm/jaw, or difficulty breathing, please seek immediate emergency care (Call 911).";
  } else if (text.includes("skin") || text.includes("rash") || text.includes("itch")) {
    reply = "**Dermatology Recommendations:**\n\n* **Specialist**: **Dr. Clara Thorne** (East Wing Clinic).\n\n* **Advice**: Avoid scratching, apply a cool compress, and monitor for changes. Would you like to schedule a dermatological audit?";
  } else if (text.includes("prescription") || text.includes("medicine") || text.includes("pill") || text.includes("refill")) {
    reply = "Active medication guidelines:\n\n* **Amoxicillin 500mg**: 1 capsule 3x daily. Full course (7 days) must be completed.\n* **Cetirizine 10mg**: 1 tablet nightly as needed. Avoid alcohol to prevent severe drowsiness.";
  } else if (text.includes("report") || text.includes("cholesterol") || text.includes("lab") || text.includes("lipid")) {
    reply = "**Lipid Panel Interpretation (June 15)**:\n\n* **LDL-C**: 134 mg/dL (Borderline High).\n\n* **Dietary Recommendations**: Add 10g of soluble fiber (oats, psyllium husk) to your morning routine. Limit saturated fats to <7% of daily intake.";
  } else if (text.includes("hospital") || text.includes("clinic") || text.includes("nearby")) {
    reply = "AegisHealth Care Facilities include:\n\n* **Main Diagnostic Center** (Floor 1-3) - Primary & Cardiology\n* **East Wing Clinic** - Pediatrics & Dermatology\n* **West Wing Care** - Mental Health & Therapy\n* **Crisis Care Emergency Room** - Ground Floor (Open 24/7)";
  } else if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    reply = "Hello Shivam! I am your Aegis AI Diagnostic Assistant. I can assess symptoms, detail active medications, or check clinic locations. How can I assist you today?";
  } else if (text.includes("agent") && text.includes("os")) {
    reply = "Yes! I am **AgentOS**, the advanced clinical AI agent integrated directly into the AegisHealth portal. I retrieve records locally from your patient console (using RAG) and provide secure clinical guidance.";
  } else {
    reply = "I've processed your query. I can assess active symptoms, explain prescription interaction risks, or translate recent lab panels based on your internal medical files.";
  }

  // Simulate streaming output word-by-word
  const words = reply.split(" ");
  let currentText = "";
  
  for (let i = 0; i < words.length; i++) {
    currentText += words[i] + " ";
    // Use marked (which is loaded on parent/child) to render markdown
    bubble.innerHTML = marked.parse(currentText);
    scrollBottom();
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
  }
  
  speakText(reply);
  return reply;
}


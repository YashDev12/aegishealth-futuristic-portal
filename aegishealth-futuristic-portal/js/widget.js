(function () {
  // Configuration (Site Admin inputs their API key here)
  const WIDGET_CONFIG = {
    apiKey: "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", // <-- Put your Groq API Key here
    provider: "custom",               // "gemini" or "custom"
    baseUrl: "https://api.groq.com/openai/v1", // Leave empty if using Gemini
    model: "llama-3.3-70b-versatile"  // The active Groq model you want to use
  };

  const WIDGET_URL = `./ai-knowledge-assistant/chatbot.html?mode=widget&apiKey=${WIDGET_CONFIG.apiKey}&provider=${WIDGET_CONFIG.provider}&baseUrl=${encodeURIComponent(WIDGET_CONFIG.baseUrl)}&model=${encodeURIComponent(WIDGET_CONFIG.model)}`;

  // Inject CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .aegis-widget-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #3b82f6);
      box-shadow: 0 8px 24px rgba(14, 165, 233, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .aegis-widget-fab:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 32px rgba(14, 165, 233, 0.6);
    }
    .aegis-widget-fab svg {
      width: 32px;
      height: 32px;
      fill: white;
    }
    .aegis-widget-iframe-container {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 400px;
      height: 650px;
      max-height: calc(100vh - 120px);
      max-width: calc(100vw - 48px);
      background: transparent;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      z-index: 999998;
      overflow: hidden;
      display: none;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .aegis-widget-iframe-container.open {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }
    .aegis-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `;
  document.head.appendChild(style);

  // Create Iframe Container
  const container = document.createElement('div');
  container.className = 'aegis-widget-iframe-container';
  const iframe = document.createElement('iframe');
  iframe.src = WIDGET_URL;
  iframe.className = 'aegis-widget-iframe';
  iframe.setAttribute('allow', 'microphone; clipboard-write; clipboard-read');
  container.appendChild(iframe);
  document.body.appendChild(container);

  // Create FAB
  const fab = document.createElement('div');
  fab.className = 'aegis-widget-fab';
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C10.8954 2 10 2.89543 10 4V4.5H8.5C6.01472 4.5 4 6.51472 4 9V17C4 19.4853 6.01472 21.5 8.5 21.5H15.5C17.9853 21.5 20 19.4853 20 17V9C20 6.51472 17.9853 4.5 15.5 4.5H14V4C14 2.89543 13.1046 2 12 2ZM11 5.5H13V4.5C13 3.94772 12.5523 3.5 12 3.5C11.4477 3.5 11 3.94772 11 4.5V5.5ZM7 11C7 10.4477 7.44772 10 8 10H9C9.55228 10 10 10.4477 10 11C10 11.5523 9.55228 12 9 12H8C7.44772 12 7 11.5523 7 11ZM15 10C14.4477 10 14 10.4477 14 11C14 11.5523 14.4477 12 15 12H16C16.5523 12 17 11.5523 17 11C17 10.4477 16.5523 10 16 10H15ZM8.5 16.5C8.08579 16.5 7.75 16.1642 7.75 15.75C7.75 15.3358 8.08579 15 8.5 15H15.5C15.9142 15 16.25 15.3358 16.25 15.75C16.25 16.1642 15.9142 16.5 15.5 16.5H8.5Z"/>
    </svg>
  `;

  let isOpen = false;
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      container.style.display = 'block';
      setTimeout(() => container.classList.add('open'), 10);
      fab.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    } else {
      container.classList.remove('open');
      setTimeout(() => container.style.display = 'none', 300);
      fab.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
          <path d="M12 2C10.8954 2 10 2.89543 10 4V4.5H8.5C6.01472 4.5 4 6.51472 4 9V17C4 19.4853 6.01472 21.5 8.5 21.5H15.5C17.9853 21.5 20 19.4853 20 17V9C20 6.51472 17.9853 4.5 15.5 4.5H14V4C14 2.89543 13.1046 2 12 2ZM11 5.5H13V4.5C13 3.94772 12.5523 3.5 12 3.5C11.4477 3.5 11 3.94772 11 4.5V5.5ZM7 11C7 10.4477 7.44772 10 8 10H9C9.55228 10 10 10.4477 10 11C10 11.5523 9.55228 12 9 12H8C7.44772 12 7 11.5523 7 11ZM15 10C14.4477 10 14 10.4477 14 11C14 11.5523 14.4477 12 15 12H16C16.5523 12 17 11.5523 17 11C17 10.4477 16.5523 10 16 10H15ZM8.5 16.5C8.08579 16.5 7.75 16.1642 7.75 15.75C7.75 15.3358 8.08579 15 8.5 15H15.5C15.9142 15 16.25 15.3358 16.25 15.75C16.25 16.1642 15.9142 16.5 15.5 16.5H8.5Z"/>
        </svg>
      `;
    }
  });

  document.body.appendChild(fab);

  window.addEventListener('message', (e) => {
    if (e.data === 'CLOSE_WIDGET') {
      isOpen = false;
      container.classList.remove('open');
      setTimeout(() => container.style.display = 'none', 300);
      fab.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
          <path d="M12 2C10.8954 2 10 2.89543 10 4V4.5H8.5C6.01472 4.5 4 6.51472 4 9V17C4 19.4853 6.01472 21.5 8.5 21.5H15.5C17.9853 21.5 20 19.4853 20 17V9C20 6.51472 17.9853 4.5 15.5 4.5H14V4C14 2.89543 13.1046 2 12 2ZM11 5.5H13V4.5C13 3.94772 12.5523 3.5 12 3.5C11.4477 3.5 11 3.94772 11 4.5V5.5ZM7 11C7 10.4477 7.44772 10 8 10H9C9.55228 10 10 10.4477 10 11C10 11.5523 9.55228 12 9 12H8C7.44772 12 7 11.5523 7 11ZM15 10C14.4477 10 14 10.4477 14 11C14 11.5523 14.4477 12 15 12H16C16.5523 12 17 11.5523 17 11C17 10.4477 16.5523 10 16 10H15ZM8.5 16.5C8.08579 16.5 7.75 16.1642 7.75 15.75C7.75 15.3358 8.08579 15 8.5 15H15.5C15.9142 15 16.25 15.3358 16.25 15.75C16.25 16.1642 15.9142 16.5 15.5 16.5H8.5Z"/>
        </svg>
      `;
    }
  });

})();

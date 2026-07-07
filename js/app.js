// AegisHealth Futuristic Portal - Core JavaScript Controller

// Application State
let appState = {
  currentTestimonialIdx: 0,
  theme: 'dark',
  waterIntake: 1000,
  waterTarget: 2500,
  aiVoiceOutput: true,
  aiListening: false,
  chatDrawerOpen: false,
  recognition: null
};

// DOM Init
document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initBackgroundParticles();
  initTheme();
  initMouseGlowTracking();
  
  // Render static data
  renderServices();
  renderDoctors();
  renderTestimonial();
  renderBlog();
  renderFaq();
  
  // Set initial patient metadata
  loadPatientInfo();
  
  // Load initial speech API
  initSpeechRecognition();
  
  // Trigger initial chat greeting
  initAiDoctorGreeting();
});

// Fades out ECG loader
function initLoader() {
  const loader = document.getElementById("ecg-loader-overlay");
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      // Trigger GSAP entrance animations on load
      triggerEntranceAnimations();
    }, 600);
  }, 1600);
}

// GSAP Entrance fanning animations
function triggerEntranceAnimations() {
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    
    // Fade in nav & hero elements
    gsap.from("#main-nav", { opacity: 0, y: -20, duration: 0.8, ease: "power2.out" });
    gsap.from("#hero-headline", { opacity: 0, x: -50, duration: 1, delay: 0.2, ease: "power3.out" });
    gsap.from("#hero p, #hero button, #hero .glass-panel", { opacity: 0, y: 30, duration: 0.8, delay: 0.4, stagger: 0.1, ease: "power2.out" });
    gsap.from("#hero-image-container", { opacity: 0, scale: 0.9, duration: 1.2, delay: 0.3, ease: "elastic.out(1, 0.75)" });
    
    // Scroll triggered card fannings
    gsap.from("#insights .glass-panel, #insights .vital-widget-card", {
      scrollTrigger: {
        trigger: "#insights",
        start: "top 85%"
      },
      opacity: 0,
      y: 40,
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.out"
    });
  }
}

// Generate animated floating particles in background
function initBackgroundParticles() {
  const container = document.getElementById("particles-container");
  const particleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    
    // Random position, sizes, and delays
    p.style.left = `${Math.random() * 100}vw`;
    p.style.width = `${Math.random() * 6 + 4}px`;
    p.style.height = p.style.width;
    p.style.animationDuration = `${Math.random() * 15 + 15}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    
    container.appendChild(p);
  }
}

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem("aegis-theme") || "dark";
  appState.theme = savedTheme;
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeUI();
}

function togglePortalTheme() {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute("data-theme", appState.theme);
  localStorage.setItem("aegis-theme", appState.theme);
  updateThemeUI();
}

function updateThemeUI() {
  const icon = document.getElementById("theme-icon");
  const body = document.body;
  
  if (appState.theme === 'light') {
    icon.className = "fa-solid fa-sun text-yellow-500";
    body.classList.remove("bg-voidDark", "text-gray-100");
    body.classList.add("bg-softGray", "text-gray-900");
  } else {
    icon.className = "fa-solid fa-moon text-cyanAccent";
    body.classList.remove("bg-softGray", "text-gray-900");
    body.classList.add("bg-voidDark", "text-gray-100");
  }
}

// Map coordinates to glow cards `--mouse-x` and `--mouse-y`
function initMouseGlowTracking() {
  document.addEventListener("mousemove", (e) => {
    document.querySelectorAll(".glow-card").forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
}

// Bind patient metadata
function loadPatientInfo() {
  const patient = window.mockData.patient;
  document.getElementById("nav-user-name").innerText = patient.name;
  document.getElementById("nav-user-meta").innerText = `19 Yrs • ${patient.gender}`;
  document.getElementById("welcome-title").innerText = `Good Day, ${patient.name}`;
}

// Renders diagnostic services
function renderServices() {
  const services = window.mockData.services;
  const grid = document.getElementById("services-grid-container");
  grid.innerHTML = "";
  
  services.forEach(serv => {
    grid.innerHTML += `
      <div class="glass-panel glass-panel-hover glow-card overflow-hidden flex flex-col justify-between h-[280px]">
        <div class="relative w-full h-24 overflow-hidden">
          <img src="${serv.img}" alt="${serv.name}" class="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-deepNavy via-deepNavy/60 to-transparent"></div>
          <div class="absolute bottom-2 left-4 flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-medBlue/20 border border-medBlue/30 flex items-center justify-center text-cyanAccent">
              <i class="fa-solid ${serv.icon}"></i>
            </div>
            <h4 class="font-display font-bold text-sm text-white">${serv.name}</h4>
          </div>
        </div>
        <div class="px-4 pb-4 flex-grow flex flex-col justify-between text-left">
          <p class="text-xs text-gray-400 leading-relaxed mt-2">${serv.desc}</p>
          <button onclick="alert('Navigating to full details of ${serv.name} department...')" class="w-full mt-4 py-2 bg-white/5 hover:bg-medBlue/20 border border-gray-800 hover:border-medBlue rounded-xl text-[10px] font-semibold tracking-wider text-cyanAccent uppercase transition-all duration-300">
            Learn More <i class="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </div>
    `;
  });
}

// Render medical doctors cards
function renderDoctors(filterCategory = "All") {
  const doctors = window.mockData.doctors;
  const grid = document.getElementById("doctors-grid-container");
  grid.innerHTML = "";
  
  const filtered = filterCategory === "All" ? doctors : doctors.filter(d => d.specialty === filterCategory);
  
  filtered.forEach(doc => {
    let statusClass = doc.status === 'Online' ? 'bg-emeraldGreen shadow-emeraldGreen/50' : 'bg-gray-500';
    let badge = doc.aiRecommended ? `
      <div class="absolute top-4 left-4 z-10 px-2 py-0.5 rounded-md bg-cyanAccent/20 border border-cyanAccent/30 text-[9px] font-bold text-cyanAccent uppercase tracking-wider flex items-center gap-1">
        <i class="fa-solid fa-sparkles"></i> AI Recommended
      </div>
    ` : '';
    
    grid.innerHTML += `
      <div class="glass-panel glass-panel-hover glow-card overflow-hidden flex flex-col relative text-left">
        ${badge}
        <div class="absolute top-4 right-4 z-10 w-2.5 h-2.5 rounded-full ${statusClass} shadow-md" title="${doc.status}"></div>
        
        <div class="w-full h-48 overflow-hidden bg-voidDark/60">
          <img src="${doc.img}" alt="${doc.name}" class="w-full h-full object-cover object-top opacity-85 hover:scale-105 duration-500">
        </div>
        
        <div class="p-6 flex-grow flex flex-col justify-between">
          <div>
            <h4 class="font-display font-bold text-base text-white">${doc.name}</h4>
            <span class="text-xs text-cyanAccent">${doc.specialty} • ${doc.experience} Exp</span>
            
            <div class="flex items-center gap-1.5 mt-3 text-xs text-yellow-500">
              <i class="fa-solid fa-star"></i>
              <span class="font-bold text-white">${doc.rating}</span>
              <span class="text-gray-400">(${doc.languages})</span>
            </div>
            
            <div class="mt-4 flex flex-col gap-1.5">
              <span class="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Available Slots Today</span>
              <div class="flex gap-1.5">
                ${doc.slots.map(sl => `<button onclick="openBookingModal('Clinic', '${doc.name}', '${doc.specialty}')" class="px-2 py-1 rounded bg-gray-900 border border-gray-800 hover:border-medBlue text-[9px] text-gray-300 hover:text-white transition-all">${sl}</button>`).join('')}
              </div>
            </div>
          </div>
          
          <button onclick="openBookingModal('Clinic', '${doc.name}', '${doc.specialty}')" class="w-full mt-6 py-2.5 bg-gradient-to-r from-medBlue to-cyanAccent hover:opacity-90 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-calendar-check"></i> Book Consultation
          </button>
        </div>
      </div>
    `;
  });
}

function filterDoctors(category) {
  // Update buttons state
  document.querySelectorAll(".doc-filter-btn").forEach(btn => {
    btn.className = "px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-gray-300 hover:text-white transition-all doc-filter-btn";
  });
  
  event.target.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-medBlue text-white shadow-lg shadow-medBlue/20 transition-all doc-filter-btn";
  renderDoctors(category);
}

// Render test reviews slider
function renderTestimonial() {
  const testimonials = window.mockData.testimonials;
  const current = testimonials[appState.currentTestimonialIdx];
  
  // Stars builder
  let starsHtml = "";
  for (let i = 0; i < current.rating; i++) {
    starsHtml += `<i class="fa-solid fa-star"></i>`;
  }
  
  document.getElementById("testimonial-stars").innerHTML = starsHtml;
  document.getElementById("testimonial-comment").innerText = `"${current.comment}"`;
  document.getElementById("testimonial-name").innerText = current.name;
  document.getElementById("testimonial-avatar").src = current.img;
}

function slideTestimonial(direction) {
  const testimonials = window.mockData.testimonials;
  appState.currentTestimonialIdx += direction;
  
  if (appState.currentTestimonialIdx < 0) {
    appState.currentTestimonialIdx = testimonials.length - 1;
  } else if (appState.currentTestimonialIdx >= testimonials.length) {
    appState.currentTestimonialIdx = 0;
  }
  
  // Trigger card fade out/in effect
  const card = document.getElementById("testimonial-card");
  card.style.opacity = "0.5";
  setTimeout(() => {
    renderTestimonial();
    card.style.opacity = "1";
  }, 200);
}

// Render health articles
function renderBlog() {
  const articles = window.mockData.blogArticles;
  const grid = document.getElementById("blog-grid-container");
  grid.innerHTML = "";
  
  articles.forEach(art => {
    grid.innerHTML += `
      <div class="glass-panel glass-panel-hover glow-card overflow-hidden flex flex-col text-left">
        <div class="w-full h-44 overflow-hidden relative">
          <img src="${art.img}" alt="${art.title}" class="w-full h-full object-cover">
          <span class="absolute top-3 left-3 bg-medBlue/80 border border-medBlue/20 text-white text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md uppercase">${art.category}</span>
        </div>
        <div class="p-5 flex-grow flex flex-col justify-between">
          <div>
            <h4 class="font-display font-bold text-sm text-white">${art.title}</h4>
            <p class="text-xs text-gray-400 mt-2 leading-relaxed">${art.summary}</p>
          </div>
          <div class="flex justify-between items-center mt-4 border-t border-gray-800/60 pt-3 text-[10px] text-gray-400">
            <span>${art.readTime}</span>
            <button onclick="alert('AI Summarizer triggered: This article details essential physiological metrics, guidelines, and actions for patients.')" class="text-cyanAccent hover:underline flex items-center gap-1 font-bold">
              <i class="fa-solid fa-sparkles text-[9px]"></i> AI Summary
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

// Render FAQs accordion lists
function renderFaq() {
  const faqs = window.mockData.faqs;
  const container = document.getElementById("faq-accordion-container");
  container.innerHTML = "";
  
  faqs.forEach((faq, idx) => {
    container.innerHTML += `
      <div class="faq-item glass-panel border-opacity-30 group overflow-hidden" id="faq-node-${idx}">
        <button onclick="toggleFaqAccordion(${idx})" class="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-white/5 duration-300">
          <h4 class="font-display font-semibold text-sm md:text-base text-white">${faq.q}</h4>
          <i class="fa-solid fa-chevron-down text-gray-400 group-hover:text-white transition-transform duration-300 faq-arrow"></i>
        </button>
        <div class="faq-answer-container transition-all">
          <p class="px-6 pb-4 text-xs md:text-sm text-gray-400 leading-relaxed border-t border-gray-900/60 pt-3">${faq.a}</p>
        </div>
      </div>
    `;
  });
}

function toggleFaqAccordion(idx) {
  const item = document.getElementById(`faq-node-${idx}`);
  const isActive = item.classList.contains("active");
  
  // Reset all
  document.querySelectorAll(".faq-item").forEach(node => node.classList.remove("active"));
  
  if (!isActive) {
    item.classList.add("active");
  }
}

// Hero Search logic
function handleHeroSearch() {
  const input = document.getElementById("hero-search-input").value.trim().toLowerCase();
  if (!input) return;
  
  // If symptom, navigate
  if (input.includes("chest") || input.includes("heart") || input.includes("rash") || input.includes("pain") || input.includes("fever")) {
    document.getElementById("insights").scrollIntoView();
    toggleAiDrawer(true);
    sendQuickPrompt(`Check symptoms for: ${input}`);
  } else if (input.includes("doctor") || input.includes("vance") || input.includes("thorne") || input.includes("appointment")) {
    document.getElementById("doctors").scrollIntoView();
  } else {
    alert(`Searching database for: "${input}". AI concierge routing is analyzing...`);
  }
}

// --- VITALS INTERACTIVE CALCULATORS ---

// Logs water intake and adjusts SVG progress level
function logWaterIntake(amount) {
  appState.waterIntake += amount;
  if (appState.waterIntake > appState.waterTarget) {
    appState.waterIntake = appState.waterTarget;
    alert("Daily hydration goal fully achieved! Great job.");
  }
  
  document.getElementById("water-intake-val").innerText = appState.waterIntake;
  const percent = (appState.waterIntake / appState.waterTarget) * 100;
  document.getElementById("water-fill-level").style.height = `${percent}%`;
}

// Computes BMI and sets indicators
function calculateBmi() {
  const height = parseFloat(document.getElementById("bmi-height").value) / 100;
  const weight = parseFloat(document.getElementById("bmi-weight").value);
  
  if (!height || !weight) return;
  
  const bmi = (weight / (height * height)).toFixed(1);
  document.getElementById("bmi-score-val").innerText = bmi;
  
  const label = document.getElementById("bmi-status-label");
  if (bmi < 18.5) {
    label.innerText = "Underweight";
    label.className = "px-3 py-1 rounded-full bg-yellow-500/20 text-[10px] font-bold text-yellow-500 uppercase tracking-wider";
  } else if (bmi >= 18.5 && bmi < 25) {
    label.innerText = "Normal";
    label.className = "px-3 py-1 rounded-full bg-emeraldGreen/20 text-[10px] font-bold text-emeraldGreen uppercase tracking-wider";
  } else {
    label.innerText = "Overweight";
    label.className = "px-3 py-1 rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-500 uppercase tracking-wider";
  }
}

// --- APPOINTMENT BOOKING MODAL HANDLERS ---

function openBookingModal(format = "Clinic", docName = "", dept = "") {
  const overlay = document.getElementById("appointment-modal-overlay");
  overlay.classList.add("active");
  
  // Set video Consultation mode toggle
  document.getElementById("modal-video-toggle").checked = format === "Video";
  
  if (dept) {
    document.getElementById("modal-dept-select").value = dept;
  }
  
  loadDoctorOptions(docName);
}

function closeBookingModal() {
  document.getElementById("appointment-modal-overlay").classList.remove("active");
}

function loadDoctorOptions(selectedDocName = "") {
  const dept = document.getElementById("modal-dept-select").value;
  const docSelect = document.getElementById("modal-doc-select");
  const timeSelect = document.getElementById("modal-time-select");
  
  docSelect.innerHTML = "";
  timeSelect.innerHTML = "";
  
  // Load doctors filtered by specialty
  const filtered = window.mockData.doctors.filter(d => d.specialty === dept);
  if (filtered.length === 0) {
    docSelect.innerHTML = `<option value="">No specialists in this clinic</option>`;
    return;
  }
  
  filtered.forEach(doc => {
    let isSel = doc.name === selectedDocName ? "selected" : "";
    docSelect.innerHTML += `<option value="${doc.name}" ${isSel}>${doc.name}</option>`;
  });
  
  // Load slots for first doctor
  const slots = filtered[0].slots;
  slots.forEach(sl => {
    timeSelect.innerHTML += `<option value="${sl}">${sl}</option>`;
  });
}

function confirmAppointment(event) {
  event.preventDefault();
  const doc = document.getElementById("modal-doc-select").value;
  const dept = document.getElementById("modal-dept-select").value;
  const date = document.getElementById("modal-date-picker").value;
  const time = document.getElementById("modal-time-select").value;
  const isVideo = document.getElementById("modal-video-toggle").checked;
  
  closeBookingModal();
  
  alert(`Consultation booked successfully! \n\nPhysician: ${doc} \nSpecialty: ${dept} \nFormat: ${isVideo ? "HD Video Call" : "In-Person Clinic Visit"} \nDate: ${date} at ${time}`);
  
  // Update timeline dynamically
  const newApt = {
    id: "APT-" + Math.floor(Math.random() * 9000 + 1000),
    doctor: doc,
    specialty: dept,
    date: date,
    time: time,
    location: isVideo ? "Virtual Video Session link" : "Main Clinic Building, Floor 1",
    status: "Confirmed"
  };
  
  window.mockData.appointments.unshift(newApt);
  loadPatientInfo();
  navigateTo('home');
}

// --- VOICE & Conversational AI Doctor Chat Agent ---

function toggleAiDrawer(forceOpen = null) {
  const drawer = document.getElementById("ai-chat-drawer");
  const trigger = document.getElementById("ai-agent-trigger");
  
  if (forceOpen !== null) {
    appState.chatDrawerOpen = forceOpen;
  } else {
    appState.chatDrawerOpen = !appState.chatDrawerOpen;
  }
  
  if (appState.chatDrawerOpen) {
    drawer.classList.remove("translate-y-10", "opacity-0", "pointer-events-none");
    drawer.classList.add("translate-y-0", "opacity-100", "pointer-events-all");
    trigger.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
  } else {
    drawer.classList.remove("translate-y-0", "opacity-100", "pointer-events-all");
    drawer.classList.add("translate-y-10", "opacity-0", "pointer-events-none");
    trigger.innerHTML = `<i class="fa-solid fa-robot"></i>`;
  }
}

function initAiDoctorGreeting() {
  addAiMessage("bot", window.mockData.aiDoctorRules.greet);
}

function handleAiInputKeydown(event) {
  if (event.key === 'Enter') {
    sendAiTextMessage();
  }
}

function sendAiTextMessage() {
  const input = document.getElementById("ai-agent-input");
  const text = input.value.trim();
  if (!text) return;
  
  input.value = "";
  addAiMessage("user", text);
  
  // Simulate AI response
  showAiTyping();
  setTimeout(() => {
    hideAiTyping();
    processAiAgentResponse(text);
  }, 1200);
}

function sendQuickPrompt(promptText) {
  addAiMessage("user", promptText);
  showAiTyping();
  setTimeout(() => {
    hideAiTyping();
    processAiAgentResponse(promptText);
  }, 1200);
}

function showAiTyping() {
  const log = document.getElementById("ai-chat-log");
  const typing = document.createElement("div");
  typing.className = "flex gap-3 justify-start text-left"
  typing.id = "ai-typing-indicator-node";
  typing.innerHTML = `
    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-medBlue to-cyanAccent flex items-center justify-center text-white text-sm shrink-0">
      <i class="fa-solid fa-user-doctor"></i>
    </div>
    <div class="px-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center gap-1.5">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  log.appendChild(typing);
  log.scrollTop = log.scrollHeight;
}

function hideAiTyping() {
  const node = document.getElementById("ai-typing-indicator-node");
  if (node) node.remove();
}

function addAiMessage(sender, text) {
  const log = document.getElementById("ai-chat-log");
  const msg = document.createElement("div");
  
  let layout = "";
  if (sender === 'bot') {
    layout = `
      <div class="flex gap-3 justify-start text-left">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-medBlue to-cyanAccent flex items-center justify-center text-white text-sm shrink-0">
          <i class="fa-solid fa-user-doctor"></i>
        </div>
        <div class="px-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs md:text-sm text-gray-200 leading-relaxed max-w-[85%]">
          <p>${markdownToHtml(text)}</p>
        </div>
      </div>
    `;
    
    // Speak out response if option is active
    if (appState.aiVoiceOutput) {
      speakResponse(text);
    }
  } else {
    layout = `
      <div class="flex gap-3 justify-end text-right">
        <div class="px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-medBlue to-cyanAccent text-xs md:text-sm text-white leading-relaxed max-w-[85%]">
          <p>${text}</p>
        </div>
      </div>
    `;
  }
  
  msg.innerHTML = layout;
  log.appendChild(msg);
  log.scrollTop = log.scrollHeight;
}

// Web Speech Synthesis (Text to Speech)
function speakResponse(text) {
  if ('speechSynthesis' in window) {
    // Clear existing voice speaking queues
    window.speechSynthesis.cancel();
    
    // Clean markdown styling tags from read string
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/<[^>]*>/g, "");
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    
    // Select premium-like English female voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Microsoft Zira"));
    if (targetVoice) utterance.voice = targetVoice;
    
    window.speechSynthesis.speak(utterance);
  }
}

// Web Speech Recognition (Speech to Text)
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    
    rec.onstart = () => {
      appState.aiListening = true;
      document.getElementById("voice-speaking-indicator").classList.remove("hidden");
      document.getElementById("voice-dictation-btn").className = "w-9 h-9 rounded-xl bg-cyanAccent/20 border border-cyanAccent flex items-center justify-center text-cyanAccent";
      
      // Stop speech synthesizer output when recording
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
    
    rec.onend = () => {
      appState.aiListening = false;
      document.getElementById("voice-speaking-indicator").classList.add("hidden");
      document.getElementById("voice-dictation-btn").className = "w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-gray-300 hover:text-cyanAccent hover:border-cyanAccent transition-all";
    };
    
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById("ai-agent-input").value = transcript;
      sendAiTextMessage();
    };
    
    appState.recognition = rec;
  }
}

function toggleVoiceDictation() {
  if (!appState.recognition) {
    alert("Speech recognition API is not supported in this browser window. Please check permissions or use Chrome/Edge.");
    return;
  }
  
  if (appState.aiListening) {
    appState.recognition.stop();
  } else {
    appState.recognition.start();
  }
}

function toggleVoiceOutput() {
  appState.aiVoiceOutput = !appState.aiVoiceOutput;
  const btn = document.getElementById("voice-output-btn");
  
  if (appState.aiVoiceOutput) {
    btn.className = "w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-emeraldGreen hover:border-emeraldGreen transition-all";
    btn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
  } else {
    btn.className = "w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-gray-400 hover:border-gray-400 transition-all";
    btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

// Contextual AI Dialog responses logic
function processAiAgentResponse(inputText) {
  const text = inputText.toLowerCase();
  const rules = window.mockData.aiDoctorRules;
  
  // Custom symptom checker triggers
  if (text.includes("symptom") || text.includes("pain") || text.includes("ache") || text.includes("hurt") || text.includes("cough")) {
    addAiMessage("bot", rules.symptomsCheck);
    return;
  }
  
  if (text.includes("chest") || text.includes("heart") || text.includes("palpitation")) {
    addAiMessage("bot", "**Cardiology special recommendation details (Urgency: High):** \nI've routed matching specialist **Dr. Robert Vance** in Main Building Floor 2. \n\n*Emergency disclaimer: If you feel crushing pain, left arm tightness, or difficulty breathing, please seek immediate emergency care (Call 911).* Would you like to schedule an appointment with Dr. Vance?");
    return;
  }

  if (text.includes("skin") || text.includes("rash") || text.includes("itch")) {
    addAiMessage("bot", "**Dermatology route details:** \nI recommend **Dr. Clara Thorne** in East Wing Clinic. Would you like to book a slots today?");
    return;
  }
  
  if (text.includes("prescription") || text.includes("medicine") || text.includes("pills")) {
    addAiMessage("bot", rules.prescription + "\n\n" + rules.medication);
    return;
  }
  
  if (text.includes("report") || text.includes("cholesterol") || text.includes("lab") || text.includes("lipid")) {
    addAiMessage("bot", rules.lab + "\n\n" + window.mockData.labReports[0].interpretation.summary);
    return;
  }
  
  if (text.includes("hospital") || text.includes("clinic") || text.includes("nearby")) {
    addAiMessage("bot", rules.hospitals);
    return;
  }
  
  if (text.includes("schedule") || text.includes("appointment") || text.includes("book")) {
    addAiMessage("bot", "I've triggered the booking modal on your main console screen. You can select departments and dates. Would you like to select Dr. Robert Vance?");
    openBookingModal();
    return;
  }
  
  if (text.includes("follow") || text.includes("vance")) {
    addAiMessage("bot", rules.followUp);
    return;
  }

  // General fallback
  addAiMessage("bot", "I've processed your message. I can check symptoms, explain active medications, schedule follow-ups, or search nearby clinics. What diagnostic details do you need?");
}

// Markdown formatting helper
function markdownToHtml(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

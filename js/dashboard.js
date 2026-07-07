// AegisHealth Patient Dashboard Console Controller (Upgraded Premium Animations)

// Dashboard State
let dashState = {
  activeTab: 'overview',
  activeProfileId: 'PAT-00719', // Default Shivam
  sidebarCollapsed: false,
  voiceOutput: false, // OFF by default — user must click speaker icon to enable
  voiceListening: false,
  recognition: null,
  activeInvoiceId: null,
  charts: {},
  sosTimer: null,
  sosCountdown: 5,
  loading: false
};

// DOM ready initialization
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initCustomCursor();
  initMagneticButtons();

  switchDashboardTab('overview'); // Load default
  switchFamilyProfile('PAT-00719'); // Load default patient details

  initDashboardSpeech();
  initDragAndDropUpload();

  // Dynamic page adjustments on hash change
  window.addEventListener("hashchange", handleHashRouting);
  handleHashRouting();
});

// Server clock tick formatting
function initClock() {
  setInterval(() => {
    const timeSpan = document.getElementById("topbar-live-clock");
    if (timeSpan) {
      const now = new Date();
      timeSpan.innerText = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
  }, 1000);
}

// Collapsible sidebar navigator
function toggleSidebarCollapse() {
  const sidebar = document.getElementById("dashboard-sidebar");
  dashState.sidebarCollapsed = !dashState.sidebarCollapsed;

  if (dashState.sidebarCollapsed) {
    sidebar.className = "w-16 h-full border-r border-gray-900 bg-voidDark/90 flex flex-col justify-between shrink-0 transition-all duration-300 z-50";
    document.querySelectorAll(".sidebar-label").forEach(lbl => lbl.classList.add("hidden"));
    document.querySelectorAll(".logo-box").forEach(box => box.classList.add("justify-center"));
    document.querySelector(".sidebar-user-card").classList.add("justify-center");
    document.querySelector(".sidebar-user-card img").className = "w-8 h-8 rounded-full border border-cyanAccent object-cover";
  } else {
    sidebar.className = "w-64 h-full border-r border-gray-900 bg-voidDark/90 flex flex-col justify-between shrink-0 transition-all duration-300 z-50";
    document.querySelectorAll(".sidebar-label").forEach(lbl => lbl.classList.remove("hidden"));
    document.querySelectorAll(".logo-box").forEach(box => box.classList.remove("justify-center"));
    document.querySelector(".sidebar-user-card").classList.remove("justify-center");
    document.querySelector(".sidebar-user-card img").className = "w-10 h-10 rounded-full border border-cyanAccent object-cover";
  }
}

// Dynamic tab routing switcher (with Skeleton loaders on transitions)
function switchDashboardTab(tabId) {
  dashState.activeTab = tabId;

  // Hide all sections
  document.querySelectorAll(".tab-view").forEach(tab => {
    tab.classList.add("hidden");
    tab.classList.remove("block");
  });

  // Show target section
  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("block");

    // Trigger GSAP entry animation on the tab container
    if (typeof gsap !== "undefined" && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.from(target, { opacity: 0, y: 15, duration: 0.45, ease: "power2.out" });
    }
  }

  // Update sidebar active classes
  document.querySelectorAll("#dashboard-sidebar nav button").forEach(btn => {
    btn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white transition-all";
  });
  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add("sidebar-active");
  }

  // Update Breadcrumb name
  const breadcrumb = document.getElementById("breadcrumb-current-tab");
  if (breadcrumb) {
    breadcrumb.innerText = activeBtn ? activeBtn.querySelector("span").innerText : tabId.toUpperCase();
  }

  // Re-draw graphs if analytics tab is selected
  if (tabId === 'analytics') {
    setTimeout(loadAnalyticsGraphs, 200);
  }

  // Render sub-contents dynamically
  renderTabContents(tabId);
}

// Route based on URL hashes (#assistant, #appointments, etc.)
function handleHashRouting() {
  const hash = window.location.hash.substring(1);
  if (hash === 'appointments') switchDashboardTab('appointments');
  else if (hash === 'ai-assistant') switchDashboardTab('ai-assistant');
  else if (hash === 'analytics') switchDashboardTab('analytics');
}

// --- CONFLICT & STATE MANAGEMENT SWITCHER (with pulsing skeleton loads) ---

function switchFamilyProfile(patId) {
  dashState.activeProfileId = patId;

  const member = window.mockData.familyMembers.find(f => f.id === patId);
  if (!member) return;

  // Apply skeleton loading pulse placeholder class on stats fields for 800ms
  const statsFields = ["stat-val-score", "stat-val-rx", "val-hr", "val-bp", "val-ox", "val-temp", "val-sugar"];
  statsFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("skeleton-pulse", "text-transparent");
    }
  });

  setTimeout(() => {
    // Remove skeleton class and reveal populated values
    statsFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove("skeleton-pulse", "text-transparent");
      }
    });

    // Set sidebar avatar info
    document.getElementById("sidebar-patient-name").innerText = member.name;
    document.getElementById("sidebar-patient-id").innerText = member.id;
    document.getElementById("topbar-active-profile").innerText = member.name;

    // Welcome title
    const welcome = document.getElementById("welcome-title");
    if (welcome) welcome.innerText = `Good Day, ${member.name}`;

    // Bind Stats metrics
    document.getElementById("overview-health-score").innerText = member.healthScore;
    document.getElementById("stat-val-score").innerText = `${member.healthScore}%`;
    document.getElementById("stat-val-rx").innerText = `${member.prescriptions.length} Active`;

    // Bind Mapped Appointments & Mapped Reports count
    const apptVal = document.getElementById("stat-val-appt");
    if (apptVal) {
      if (patId === 'PAT-00719') {
        apptVal.innerText = "July 8 @ 10:30 AM";
      } else if (patId === 'PAT-00720') {
        apptVal.innerText = "None Scheduled";
      } else {
        apptVal.innerText = "July 22 @ 02:15 PM";
      }
    }

    const reportsVal = document.getElementById("stat-val-reports");
    if (reportsVal) {
      if (patId === 'PAT-00719') {
        reportsVal.innerText = "1 Translated";
      } else {
        reportsVal.innerText = "0 Pending";
      }
    }

    // Mapped Vitals rows
    document.getElementById("val-hr").innerHTML = `${member.vitals.heartRate.value} <span class="text-[10px] font-normal text-gray-400">${member.vitals.heartRate.unit}</span>`;
    document.getElementById("val-bp").innerHTML = `${member.vitals.bloodPressure.value} <span class="text-[10px] font-normal text-gray-400">${member.vitals.bloodPressure.unit}</span>`;
    document.getElementById("val-ox").innerHTML = `${member.vitals.oxygen.value} <span class="text-[10px] font-normal text-gray-400">${member.vitals.oxygen.unit}</span>`;
    document.getElementById("val-temp").innerHTML = `${member.vitals.temperature.value} <span class="text-[10px] font-normal text-gray-400">${member.vitals.temperature.unit}</span>`;
    document.getElementById("val-sugar").innerHTML = `${member.vitals.bloodSugar.value} <span class="text-[10px] font-normal text-gray-400">${member.vitals.bloodSugar.unit}</span>`;

    // Update EHR details tab
    document.getElementById("ehr-card-name").innerText = member.name;
    document.getElementById("ehr-card-blood").innerText = member.bloodGroup;
    document.getElementById("ehr-card-allergies").innerText = member.allergies;
    document.getElementById("ehr-card-chronic").innerText = member.chronic;
    document.getElementById("ehr-card-surgeries").innerText = member.surgeries;

    // SOS ID panel
    document.getElementById("sos-card-name").innerText = member.name;
    document.getElementById("sos-card-blood").innerText = member.bloodGroup;
    document.getElementById("sos-card-allergies").innerText = member.allergies;
    document.getElementById("sos-card-chronic").innerText = member.chronic;

    // Trigger animations
    animateTargetRings();
    loadPatientInfo();

    // Re-render tab content
    renderTabContents(dashState.activeTab);
  }, 800);

  // Show toast feedback
  showToastNotification(`Context Switched`, `Displaying records for ${member.name}`);
}

// Global Tab Rendering Router
function renderTabContents(tabId) {
  const member = window.mockData.familyMembers.find(f => f.id === dashState.activeProfileId);
  if (!member) return;

  switch (tabId) {
    case 'overview':
      renderOverviewMeds(member);
      break;
    case 'appointments':
      renderAppointmentsTab();
      break;
    case 'doctors':
      renderDoctorsTab();
      break;
    case 'records':
      renderEhrVaccinations();
      break;
    case 'reports':
      renderLabReports();
      break;
    case 'prescriptions':
      renderPrescriptionsList();
      break;
    case 'medications':
      renderMedicationPlanner(member);
      break;
    case 'insurance':
      renderInsuranceClaims();
      break;
    case 'billing':
      renderBillingInvoices();
      break;
    case 'notifications':
      renderNotifications();
      break;
    case 'family':
      renderFamilyGrid();
      break;
  }
}

// Toast indicator manager
function showToastNotification(title, text) {
  const box = document.getElementById("toast-notif-box");
  if (!box) return;
  document.getElementById("toast-title").innerText = title;
  document.getElementById("toast-text").innerText = text;

  box.style.opacity = "1";
  box.style.transform = "translateY(0)";

  setTimeout(() => {
    box.style.opacity = "0";
    box.style.transform = "translateY(-100px)";
  }, 3500);
}

// --- TAB RENDERING UTILITIES ---

function renderOverviewMeds(member) {
  const container = document.getElementById("overview-meds-list");
  if (!container) return;

  container.innerHTML = "";
  if (member.prescriptions.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-500 py-4 text-center">No medications scheduled for today.</p>`;
    return;
  }

  member.prescriptions.forEach(rx => {
    container.innerHTML += `
      <div class="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-850">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-10 rounded-full bg-indigo-500"></div>
          <div>
            <h6 class="text-xs font-bold text-white">${rx.name}</h6>
            <span class="text-[10px] text-gray-400 font-mono">${rx.dosage} • ${rx.purpose}</span>
          </div>
        </div>
        <button onclick="toggleDoseLogged(this)" class="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white text-[10px] font-bold uppercase transition-all tracking-wider magnetic-btn">Log Taken</button>
      </div>
    `;
  });
  initMagneticButtons();
  refreshHoverCursorTriggers();
}

function toggleDoseLogged(btn) {
  btn.className = "px-3 py-1.5 rounded-lg bg-emeraldGreen/10 text-emeraldGreen text-[10px] font-bold uppercase tracking-wider cursor-default";
  btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Logged`;
  showToastNotification("Medication Logged", "Adherence metrics updated in database.");
}

function renderAppointmentsTab() {
  const container = document.getElementById("appointments-upcoming-timeline");
  if (!container) return;

  container.innerHTML = "";
  const list = window.mockData.appointments;

  if (list.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-500 py-8 text-center">No upcoming consultations booked.</p>`;
    return;
  }

  list.forEach((apt, idx) => {
    const isVideo = apt.type === 'Video Call' || apt.location.includes("Link");
    const actionBtn = isVideo ? `
      <button onclick="launchMockVideoConsultation()" class="px-4 py-2 bg-emeraldGreen text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 magnetic-btn"><i class="fa-solid fa-video"></i> Join HD Consultation</button>
    ` : `
      <span class="text-[10px] text-gray-500 font-mono"><i class="fa-solid fa-location-dot"></i> In-Person Visit</span>
    `;

    container.innerHTML += `
      <div class="glass-panel p-5 bg-opacity-40 border-opacity-30 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-gray-900 border border-gray-855 flex items-center justify-center text-cyanAccent shrink-0">
            <i class="fa-solid ${isVideo ? 'fa-video' : 'fa-hospital'}"></i>
          </div>
          <div>
            <h5 class="font-bold text-white text-sm">${apt.doctor}</h5>
            <span class="text-xs text-cyanAccent block">${apt.specialty} Specialist</span>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400 mt-2 font-mono">
              <span>Date: ${apt.date}</span>
              <span>Time: ${apt.time}</span>
              <span>Location: ${apt.location}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end md:self-center">
          ${actionBtn}
          <button onclick="cancelAppointment(${idx})" class="p-2 rounded-lg bg-white/5 border border-gray-800 hover:border-red-500 text-red-500 hover:bg-red-500/10 text-xs transition-all" title="Cancel Consultation"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    `;
  });
  initMagneticButtons();
  refreshHoverCursorTriggers();
}

function cancelAppointment(idx) {
  if (confirm("Are you sure you want to cancel this scheduled consultation?")) {
    window.mockData.appointments.splice(idx, 1);
    renderAppointmentsTab();
    showToastNotification("Booking Cancelled", "Appointment slot has been released back to clinic inventory.");
  }
}

function renderDoctorsTab() {
  const container = document.getElementById("dashboard-doctors-grid");
  if (!container) return;

  container.innerHTML = "";
  window.mockData.doctors.forEach(doc => {
    let statusClass = doc.status === 'Online' ? 'bg-emeraldGreen shadow-emeraldGreen/50' : 'bg-gray-500';
    container.innerHTML += `
      <div class="glass-panel overflow-hidden relative flex flex-col justify-between text-left font-sans tilt-card">
        <div class="tilt-card-inner flex flex-col justify-between h-full w-full">
          <div class="absolute top-4 right-4 z-10 w-2.5 h-2.5 rounded-full ${statusClass} shadow-md"></div>
          <div class="w-full h-36 bg-voidDark/60 overflow-hidden">
            <img src="${doc.img}" class="w-full h-full object-cover object-top opacity-80">
          </div>
          <div class="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h5 class="font-display font-bold text-sm text-white">${doc.name}</h5>
              <span class="text-xs text-cyanAccent">${doc.specialty} Department</span>
              <p class="text-[10px] text-gray-400 mt-1">Exp: ${doc.experience} • Rating: ${doc.rating} ★</p>
            </div>
            <button onclick="openDashboardBookingModal('${doc.name}', '${doc.specialty}')" class="w-full mt-4 py-2 bg-medBlue text-white text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all magnetic-btn">Book Consult</button>
          </div>
        </div>
      </div>
    `;
  });
  init3DTilt();
  initMagneticButtons();
  refreshHoverCursorTriggers();
}

function renderEhrVaccinations() {
  const container = document.getElementById("ehr-vaccination-list");
  if (!container) return;

  container.innerHTML = "";
  window.mockData.vaccinationSchedule.forEach(v => {
    let isComp = v.status === 'Completed';
    container.innerHTML += `
      <div class="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-805">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-gray-900 border border-gray-850 flex items-center justify-center text-xs ${isComp ? 'text-emeraldGreen' : 'text-cyanAccent'}">
            <i class="fa-solid ${isComp ? 'fa-syringe' : 'fa-hourglass-half'}"></i>
          </div>
          <div>
            <h6 class="font-bold text-white text-xs">${v.name}</h6>
            <span class="text-[9px] text-gray-400 font-mono">${v.facility}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-[10px] font-bold uppercase tracking-wider block ${isComp ? 'text-emeraldGreen' : 'text-cyanAccent'}">${v.status}</span>
          <span class="text-[9px] text-gray-500 font-mono">${v.date}</span>
        </div>
      </div>
    `;
  });
}

function renderLabReports() {
  const container = document.getElementById("lab-reports-list-container");
  if (!container) return;

  container.innerHTML = "";
  window.mockData.labReports.forEach(rep => {
    container.innerHTML += `
      <div class="glass-panel p-4 bg-opacity-30 border-opacity-40 hover:border-cyanAccent cursor-pointer text-left transition-all" onclick="openLabInterpretation('${rep.id}')">
        <h6 class="font-bold text-white text-xs font-display">${rep.name}</h6>
        <span class="text-[9px] text-cyanAccent font-mono mt-1 block">Date: ${rep.date}</span>
        <span class="text-[9px] text-gray-500 block">Facility: ${rep.facility}</span>
      </div>
    `;
  });
  refreshHoverCursorTriggers();
}

function openLabInterpretation(repId) {
  const rep = window.mockData.labReports.find(r => r.id === repId);
  const container = document.getElementById("lab-interpretation-container");
  if (!rep || !container) return;

  container.innerHTML = `
    <div class="flex justify-between items-start border-b border-gray-900 pb-4">
      <div>
        <h4 class="font-display font-extrabold text-sm text-white">${rep.name}</h4>
        <span class="text-[10px] text-gray-500 font-mono">${rep.facility} • June 15</span>
      </div>
      <button onclick="alert('Exporting PDF raw chemistry report...')" class="px-3 py-1.5 rounded-lg border border-gray-800 hover:border-cyanAccent text-[10px] text-cyanAccent font-bold transition-all magnetic-btn"><i class="fa-solid fa-download"></i> Save PDF</button>
    </div>

    <!-- AI summary translation panel -->
    <div class="glass-panel p-5 bg-cyanAccent/5 border-cyanAccent/10 text-xs text-left space-y-4">
      <h5 class="font-display font-bold text-cyanAccent uppercase tracking-widest text-[9px] flex items-center gap-1.5">
        <i class="fa-solid fa-sparkles"></i> ${rep.interpretation.title}
      </h5>
      <p class="text-gray-300 leading-relaxed">${rep.interpretation.summary}</p>
      <ul class="space-y-2 leading-relaxed text-gray-300">
        ${rep.interpretation.points.map(pt => `<li class="flex items-start gap-2"><i class="fa-solid fa-circle-check text-cyanAccent mt-0.5 shrink-0"></i><span>${pt}</span></li>`).join('')}
      </ul>
    </div>
  `;
  initMagneticButtons();
  refreshHoverCursorTriggers();
}

function renderPrescriptionsList() {
  const container = document.getElementById("prescriptions-list-container");
  if (!container) return;

  container.innerHTML = "";
  window.mockData.prescriptions.forEach(rx => {
    container.innerHTML += `
      <div class="glass-panel p-4 bg-opacity-30 border-opacity-40 hover:border-indigo-500 cursor-pointer text-left transition-all" onclick="openPrescriptionDetail('${rx.id}')">
        <h6 class="font-bold text-white text-xs font-display flex items-center gap-1.5">
          <i class="fa-solid fa-prescription-bottle text-indigo-400 text-sm"></i> ${rx.name}
        </h6>
        <span class="text-[9px] text-indigo-400 font-mono mt-1 block">Dosage: ${rx.dosage}</span>
      </div>
    `;
  });
  refreshHoverCursorTriggers();
}

function openPrescriptionDetail(rxId) {
  const rx = window.mockData.prescriptions.find(r => r.id === rxId);
  const container = document.getElementById("prescription-detail-container");
  if (!rx || !container) return;

  container.innerHTML = `
    <div class="flex justify-between items-start border-b border-gray-900 pb-4">
      <div>
        <h4 class="font-display font-extrabold text-sm text-white">${rx.name}</h4>
        <span class="text-[10px] text-gray-500 font-mono">Digital Signature ID: ${rx.id}</span>
      </div>
      <button onclick="alert('Refill requested successfully! Pharmacy will confirm via SMS.');" class="px-4 py-2 rounded-xl bg-medBlue text-white text-[10px] font-bold uppercase transition-all magnetic-btn">Request Refill</button>
    </div>

    <div class="grid grid-cols-2 gap-4 text-xs text-left">
      <div class="glass-panel p-4 bg-opacity-30">
        <span class="text-gray-500 font-bold block">Directions</span>
        <span class="text-white font-bold mt-1 block">${rx.dosage}</span>
      </div>
      <div class="glass-panel p-4 bg-opacity-30">
        <span class="text-gray-500 font-bold block">Duration</span>
        <span class="text-white font-bold mt-1 block">${rx.duration}</span>
      </div>
    </div>
  `;
  initMagneticButtons();
  refreshHoverCursorTriggers();
}

function renderMedicationPlanner(member) {
  const container = document.getElementById("planner-today-checkboxes");
  if (!container) return;

  container.innerHTML = "";
  if (member.prescriptions.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-500 py-4 text-center">No medications logged in planner.</p>`;
    return;
  }

  member.prescriptions.forEach((rx, idx) => {
    container.innerHTML += `
      <div class="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-850 hover:border-indigo-500 duration-300">
        <div class="flex items-center gap-3">
          <label class="relative flex items-center justify-center cursor-pointer">
            <input type="checkbox" onchange="togglePlannerCompliance(this)" class="w-5 h-5 bg-gray-900 border border-gray-800 rounded-md checked:bg-indigo-500 checked:border-indigo-500 text-white focus:ring-0 appearance-none">
            <i class="fa-solid fa-check text-xs text-white absolute hidden checked-icon pointer-events-none"></i>
          </label>
          <div>
            <h6 class="text-xs font-bold text-white">${rx.name}</h6>
            <span class="text-[10px] text-gray-400 font-mono">${rx.dosage} • ${rx.purpose}</span>
          </div>
        </div>
        <span class="text-[9px] text-gray-500 font-mono">Dose: ${idx === 0 ? '13:00 PM' : '21:00 PM'}</span>
      </div>
    `;
  });
  refreshHoverCursorTriggers();
}

function togglePlannerCompliance(checkbox) {
  const icon = checkbox.parentElement.querySelector(".checked-icon");
  if (checkbox.checked) {
    icon.classList.remove("hidden");
    checkbox.style.backgroundColor = "#8B5CF6";
    showToastNotification("Dose Logged", "Planner compliance metrics recalculated.");
  } else {
    icon.classList.add("hidden");
    checkbox.style.backgroundColor = "transparent";
  }
}

function renderInsuranceClaims() {
  const container = document.getElementById("claims-log-table-body");
  if (!container) return;

  container.innerHTML = "";
  window.mockData.claims.forEach(cl => {
    container.innerHTML += `
      <tr class="border-b border-gray-900/60 text-gray-300 hover:bg-white/5 transition-all">
        <td class="py-3 font-mono font-bold">${cl.id}</td>
        <td class="py-3 font-mono">${cl.date}</td>
        <td class="py-3">${cl.service}</td>
        <td class="py-3 font-mono font-bold text-emeraldGreen">${cl.amount}</td>
        <td class="py-3"><span class="px-2 py-0.5 rounded bg-emeraldGreen/10 text-emeraldGreen text-[9px] font-bold uppercase tracking-wider">${cl.status}</span></td>
      </tr>
    `;
  });
}

function renderBillingInvoices() {
  const container = document.getElementById("invoices-table-body");
  if (!container) return;

  container.innerHTML = "";
  window.mockData.billingInvoices.forEach(inv => {
    let isPaid = inv.status === 'Paid';
    let actionBtn = isPaid ? `
      <button onclick="alert('Downloading Statement Receipt ${inv.receipt}...')" class="px-2.5 py-1 rounded bg-white/5 border border-gray-800 text-[9px] text-gray-300 font-semibold hover:border-cyanAccent transition-all magnetic-btn"><i class="fa-solid fa-file-arrow-down"></i> Receipt</button>
    ` : `
      <button onclick="openCheckoutModal('${inv.id}', '${inv.copay}', '${inv.service}')" class="px-2.5 py-1 rounded bg-red-650 hover:bg-red-500 text-[9px] text-white font-bold transition-all magnetic-btn"><i class="fa-solid fa-credit-card"></i> Pay Copay</button>
    `;

    container.innerHTML += `
      <tr class="border-b border-gray-900/60 text-gray-300 hover:bg-white/5 transition-all">
        <td class="py-3 font-mono font-bold">${inv.id}</td>
        <td class="py-3 font-mono">${inv.date}</td>
        <td class="py-3">${inv.doc}</td>
        <td class="py-3 font-mono">${inv.fee}</td>
        <td class="py-3 font-mono">${inv.coverage}</td>
        <td class="py-3 font-mono font-bold text-white">${inv.copay}</td>
        <td class="py-3"><span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${isPaid ? 'bg-emeraldGreen/10 text-emeraldGreen' : 'bg-red-500/10 text-red-500'}">${inv.status}</span></td>
        <td class="py-3 text-right">${actionBtn}</td>
      </tr>
    `;
  });
  initMagneticButtons();
  refreshHoverCursorTriggers();
}

function renderNotifications() {
  const container = document.getElementById("notifications-list-container");
  if (!container) return;

  container.innerHTML = "";
  window.mockData.notifications.forEach(n => {
    container.innerHTML += `
      <div class="glass-panel p-4 flex justify-between items-start gap-4 hover:border-cyanAccent duration-300 text-left ${n.read ? 'opacity-60' : 'border-l-4 border-l-cyanAccent'}">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-gray-900 border border-gray-850 flex items-center justify-center text-cyanAccent shrink-0">
            <i class="fa-solid ${n.type === 'Medication' ? 'fa-pills' : (n.type === 'Billing' ? 'fa-credit-card' : 'fa-flask')}"></i>
          </div>
          <div>
            <h6 class="font-bold text-white text-xs">${n.title}</h6>
            <p class="text-[11px] text-gray-400 mt-1 leading-relaxed">${n.text}</p>
          </div>
        </div>
        <span class="text-[9px] text-gray-500 font-mono shrink-0">${n.time}</span>
      </div>
    `;
  });
}

function markAllNotificationsRead() {
  window.mockData.notifications.forEach(n => n.read = true);
  renderNotifications();
  const badge = document.getElementById("notif-badge-dot");
  if (badge) badge.className = "hidden";
  showToastNotification("Alerts Read", "All notifications updated as read.");
}

function renderFamilyGrid() {
  const container = document.getElementById("family-profiles-grid");
  if (!container) return;

  container.innerHTML = "";
  window.mockData.familyMembers.forEach(f => {
    container.innerHTML += `
      <div class="glass-panel p-5 text-left border-opacity-35 hover:border-cyanAccent cursor-pointer transition-all flex flex-col justify-between" onclick="switchFamilyProfile('${f.id}')">
        <div class="flex items-center gap-3 mb-4">
          <img src="${f.id === 'PAT-00719' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' : (f.id === 'PAT-00720' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80')}" class="w-10 h-10 rounded-full border border-cyanAccent object-cover">
          <div>
            <h5 class="font-bold text-white text-xs">${f.name}</h5>
            <span class="text-[9px] text-gray-500 uppercase tracking-widest">${f.relationship}</span>
          </div>
        </div>
        <div class="text-[10px] space-y-1.5 border-t border-gray-900/60 pt-3">
          <div class="flex justify-between"><span class="text-gray-400">Blood Type:</span><span class="font-bold text-rose-500 font-mono">${f.bloodGroup}</span></div>
          <div class="flex justify-between"><span class="text-gray-400">Allergies:</span><span class="font-bold text-yellow-500 font-mono">${f.allergies}</span></div>
        </div>
      </div>
    `;
  });
}

// --- APPOINTMENT BOOKING MODALS ---

function openDashboardBookingModal(docName = "", dept = "") {
  const overlay = document.getElementById("booking-modal-overlay");
  overlay.classList.add("active");

  if (dept) {
    document.getElementById("dash-modal-dept-select").value = dept;
  }
  loadDashboardDoctorOptions(docName);
}

function closeDashboardBookingModal() {
  document.getElementById("booking-modal-overlay").classList.remove("active");
}

function loadDashboardDoctorOptions(selectedDocName = "") {
  const dept = document.getElementById("dash-modal-dept-select").value;
  const docSelect = document.getElementById("dash-modal-doc-select");
  const timeSelect = document.getElementById("dash-modal-time-select");

  docSelect.innerHTML = "";
  timeSelect.innerHTML = "";

  const filtered = window.mockData.doctors.filter(d => d.specialty === dept);
  if (filtered.length === 0) {
    docSelect.innerHTML = `<option value="">No specialists in department</option>`;
    return;
  }

  filtered.forEach(doc => {
    let isSel = doc.name === selectedDocName ? "selected" : "";
    docSelect.innerHTML += `<option value="${doc.name}" ${isSel}>${doc.name}</option>`;
  });

  const slots = filtered[0].slots;
  slots.forEach(sl => {
    timeSelect.innerHTML += `<option value="${sl}">${sl}</option>`;
  });
}

function confirmDashboardAppointment(event) {
  event.preventDefault();
  const doc = document.getElementById("dash-modal-doc-select").value;
  const dept = document.getElementById("dash-modal-dept-select").value;
  const date = document.getElementById("dash-modal-date-picker").value;
  const time = document.getElementById("dash-modal-time-select").value;
  const isVideo = document.getElementById("dash-modal-video-toggle").checked;

  closeDashboardBookingModal();

  const newApt = {
    id: "APT-" + Math.floor(Math.random() * 9000 + 1000),
    doctor: doc,
    specialty: dept,
    date: date,
    time: time,
    location: isVideo ? "Virtual Video Session link" : "Main Clinic Building, Floor 1",
    status: "Confirmed",
    type: isVideo ? "Video Call" : "In-Person"
  };

  window.mockData.appointments.unshift(newApt);

  loadPatientInfo();
  renderAppointmentsTab();

  showToastNotification("Consultation Booked", `Confirmed with ${doc} on ${date}`);
}

// --- BILLING checkout ---

function openCheckoutModal(invoiceId, copay, serviceName) {
  dashState.activeInvoiceId = invoiceId;
  const overlay = document.getElementById("checkout-modal-overlay");

  document.getElementById("checkout-balance-title").innerText = copay;
  document.getElementById("checkout-details-text").innerText = `Invoice ${invoiceId} for ${serviceName}`;

  overlay.classList.add("active");
}

function closeCheckoutModal() {
  document.getElementById("checkout-modal-overlay").classList.remove("active");
}

function simulateStripeCheckoutPay(event) {
  event.preventDefault();
  closeCheckoutModal();

  const inv = window.mockData.billingInvoices.find(i => i.id === dashState.activeInvoiceId);
  if (inv) {
    inv.status = 'Paid';
    inv.receipt = `aegis_receipt_${inv.id.substring(4)}.pdf`;
  }

  document.getElementById("billing-outstanding-val").innerText = "$0.00";

  renderBillingInvoices();
  showToastNotification("Payment Success", "Stripe payment cleared. Copay balanced to zero.");
}

// --- EMERGENCY SOS ---

function triggerEmergencySOS() {
  const overlay = document.getElementById("emergency-sos-overlay");
  overlay.classList.remove("hidden");

  dashState.sosCountdown = 5;
  document.getElementById("sos-timer-count").innerText = `Calling Emergency Dispatch in ${dashState.sosCountdown}s...`;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance("Emergency alert initiated. Calling paramedics."));
  }

  dashState.sosTimer = setInterval(() => {
    dashState.sosCountdown--;
    document.getElementById("sos-timer-count").innerText = `Calling Emergency Dispatch in ${dashState.sosCountdown}s...`;

    if (dashState.sosCountdown <= 0) {
      clearInterval(dashState.sosTimer);
      simulateSOSDispatch();
    }
  }, 1000);
}

function cancelEmergencySOS() {
  clearInterval(dashState.sosTimer);
  const overlay = document.getElementById("emergency-sos-overlay");
  overlay.classList.add("hidden");

  showToastNotification("SOS Aborted", "Paromedics emergency call cancelled.");
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function simulateSOSDispatch() {
  const overlay = document.getElementById("emergency-sos-overlay");
  overlay.classList.add("hidden");
  alert("DISPATCH SENT! Paramedics are routing to your current server GPS coordinates. Medical ID profile (Shivam, B+, Sulfonamides allergy) shared.");
}

// --- CHART.JS RENDERING ---

function loadAnalyticsGraphs() {
  const history = window.mockData.analyticsHistory;
  const filter = document.getElementById("analytics-filter-range").value;

  Object.keys(dashState.charts).forEach(key => {
    if (dashState.charts[key]) dashState.charts[key].destroy();
  });

  const isLight = document.documentElement.getAttribute("data-theme") === 'light';
  const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)';
  const labelColor = isLight ? '#4B5563' : '#9CA3AF';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 9 } } },
      y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 9 } } }
    }
  };

  const ctxHr = document.getElementById("chart-heartrate").getContext("2d");
  dashState.charts.hr = new Chart(ctxHr, {
    type: 'line',
    data: {
      labels: history.weeks,
      datasets: [{
        label: 'Heart Rate',
        data: history.heartRate,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244,63,94,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2
      }]
    },
    options: chartOptions
  });

  const ctxBp = document.getElementById("chart-bp").getContext("2d");
  dashState.charts.bp = new Chart(ctxBp, {
    type: 'line',
    data: {
      labels: history.weeks,
      datasets: [
        { label: 'Systolic', data: history.bloodPressureSys, borderColor: '#22D3EE', borderWidth: 2, fill: false, tension: 0.3 },
        { label: 'Diastolic', data: history.bloodPressureDia, borderColor: '#0F6FFF', borderWidth: 2, fill: false, tension: 0.3 }
      ]
    },
    options: chartOptions
  });

  const ctxGl = document.getElementById("chart-glucose").getContext("2d");
  dashState.charts.glucose = new Chart(ctxGl, {
    type: 'line',
    data: {
      labels: history.weeks,
      datasets: [{
        label: 'Blood Glucose',
        data: history.bloodSugar,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2
      }]
    },
    options: chartOptions
  });

  const ctxSl = document.getElementById("chart-sleep").getContext("2d");
  dashState.charts.sleep = new Chart(ctxSl, {
    type: 'bar',
    data: {
      labels: history.weeks,
      datasets: [{
        label: 'Sleep hours',
        data: history.sleep,
        backgroundColor: '#8B5CF6',
        borderRadius: 6
      }]
    },
    options: chartOptions
  });

  const ctxSt = document.getElementById("chart-steps").getContext("2d");
  dashState.charts.steps = new Chart(ctxSt, {
    type: 'bar',
    data: {
      labels: history.weeks,
      datasets: [{
        label: 'Steps',
        data: history.steps,
        backgroundColor: '#0F6FFF',
        borderRadius: 6
      }]
    },
    options: chartOptions
  });

  const ctxMd = document.getElementById("chart-mood").getContext("2d");
  dashState.charts.mood = new Chart(ctxMd, {
    type: 'line',
    data: {
      labels: history.weeks,
      datasets: [{
        label: 'Mood Score',
        data: history.mood,
        borderColor: '#F59E0B',
        fill: false,
        tension: 0.4,
        borderWidth: 2
      }]
    },
    options: chartOptions
  });
}

// --- CONVERSATIONAL AI & VOICE ---

function initDashboardSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      dashState.voiceListening = true;
      document.getElementById("dash-voice-active-indicator").classList.remove("hidden");
      document.getElementById("dash-mic-btn").className = "w-9 h-9 rounded-xl bg-cyanAccent/20 border border-cyanAccent flex items-center justify-center text-cyanAccent";
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };

    rec.onend = () => {
      dashState.voiceListening = false;
      document.getElementById("dash-voice-active-indicator").classList.add("hidden");
      document.getElementById("dash-mic-btn").className = "w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-gray-300 hover:text-cyanAccent hover:border-cyanAccent transition-all";
    };

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById("dashboard-chat-input").value = transcript;
      sendDashboardChatMessage();
    };

    dashState.recognition = rec;
  }
}

function toggleDashboardVoiceDictation() {
  if (!dashState.recognition) {
    alert("Speech recognition API not supported in browser.");
    return;
  }
  if (dashState.voiceListening) dashState.recognition.stop();
  else dashState.recognition.start();
}

function toggleDashboardVoiceOutput() {
  dashState.voiceOutput = !dashState.voiceOutput;
  const btn = document.getElementById("dash-speaker-btn");
  if (!btn) return;

  if (dashState.voiceOutput) {
    btn.className = "w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-emeraldGreen hover:border-emeraldGreen transition-all";
    btn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
  } else {
    btn.className = "w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-gray-400 hover:border-gray-400 transition-all";
    btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

function toggleSettingsVoiceOutput() {
  const checkbox = document.getElementById("settings-voice-toggle");
  dashState.voiceOutput = checkbox.checked;

  const btn = document.getElementById("dash-speaker-btn");
  if (btn) {
    if (dashState.voiceOutput) {
      btn.className = "w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-emeraldGreen hover:border-emeraldGreen transition-all";
      btn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
    } else {
      btn.className = "w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-gray-400 hover:border-gray-400 transition-all";
      btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
    }
  }
}

function handleDashboardChatKeydown(event) {
  if (event.key === 'Enter') sendDashboardChatMessage();
}

function sendDashboardChatMessage() {
  const input = document.getElementById("dashboard-chat-input");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  addDashboardMessage("user", text);

  showDashboardTyping();
  setTimeout(() => {
    hideDashboardTyping();
    processDashboardAiResponse(text);
  }, 1200);
}

function sendDashboardQuickPrompt(promptText) {
  addDashboardMessage("user", promptText);
  showDashboardTyping();
  setTimeout(() => {
    hideDashboardTyping();
    processDashboardAiResponse(promptText);
  }, 1200);
}

function addDashboardMessage(sender, text) {
  const log = document.getElementById("dashboard-chat-log");
  if (!log) return;

  const msg = document.createElement("div");
  if (sender === 'bot') {
    msg.className = "flex gap-3 justify-start text-left";
    msg.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-medBlue to-cyanAccent flex items-center justify-center text-white text-sm shrink-0">
        <i class="fa-solid fa-user-doctor"></i>
      </div>
      <div class="px-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs md:text-sm text-gray-200 leading-relaxed max-w-[85%]">
        <p>${markdownToHtml(text)}</p>
      </div>
    `;
    if (dashState.voiceOutput) {
      speakResponse(text);
    }
  } else {
    msg.className = "flex gap-3 justify-end text-right";
    msg.innerHTML = `
      <div class="px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-medBlue to-cyanAccent text-xs md:text-sm text-white leading-relaxed max-w-[85%]">
        <p>${text}</p>
      </div>
    `;
  }
  log.appendChild(msg);
  log.scrollTop = log.scrollHeight;
}

function speakResponse(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/<[^>]*>/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  }
}

// Stop all speech when user navigates away from dashboard
window.addEventListener('pagehide', () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && 'speechSynthesis' in window) window.speechSynthesis.cancel(); });

// Typing indicators
function showDashboardTyping() {
  const log = document.getElementById("dashboard-chat-log");
  const typing = document.createElement("div");
  typing.className = "flex gap-3 justify-start text-left";
  typing.id = "dash-typing-indicator";
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

function hideDashboardTyping() {
  const node = document.getElementById("dash-typing-indicator");
  if (node) node.remove();
}

function processDashboardAiResponse(inputText) {
  const text = inputText.toLowerCase();
  const db = window.mockData.medicalSymptomsDatabase;
  const rules = window.mockData.aiDoctorRules;

  let matchedSymptom = db.find(symptom => {
    return symptom.keywords.some(kw => text.includes(kw));
  });

  if (matchedSymptom) {
    let adviceHtml = `
**AI Clinical Assessment:**
Specialty detected: **${matchedSymptom.department}**

* **Urgency:** ${matchedSymptom.urgency}
* **First-Aid:** ${matchedSymptom.guidance}

⚠️ **Red Flag Warnings:**
${matchedSymptom.redFlags}

Would you like to schedule a consultation slot with ${matchedSymptom.doctor}?
    `;

    const log = document.getElementById("dashboard-chat-log");
    const msg = document.createElement("div");
    msg.className = "flex gap-3 justify-start text-left";
    msg.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-medBlue to-cyanAccent flex items-center justify-center text-white text-sm shrink-0">
        <i class="fa-solid fa-user-doctor"></i>
      </div>
      <div class="px-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs md:text-sm text-gray-200 leading-relaxed max-w-[85%]">
        <p>${markdownToHtml(adviceHtml)}</p>
        <button onclick="openDashboardBookingModal('${matchedSymptom.doctor}', '${matchedSymptom.department}')" class="w-full mt-3 py-2 bg-medBlue text-white font-bold text-[10px] rounded-lg uppercase tracking-wider"><i class="fa-solid fa-calendar-check"></i> Book Dr. ${matchedSymptom.doctor.split(' ').slice(1).join(' ')}</button>
      </div>
    `;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;

    if (dashState.voiceOutput) speakResponse(`Assessments complete for ${matchedSymptom.department}. ${matchedSymptom.guidance}`);
    return;
  }

  if (text.includes("cholesterol") || text.includes("lipid") || text.includes("report")) {
    addDashboardMessage("bot", rules.lab + "\n\n" + window.mockData.labReports[0].interpretation.summary);
    return;
  }

  if (text.includes("amoxicillin") || text.includes("cetirizine") || text.includes("medication") || text.includes("prescription")) {
    addDashboardMessage("bot", rules.medication + "\n\n" + rules.prescription);
    return;
  }

  addDashboardMessage("bot", "I am standing by. You can ask about active symptoms, explain prescription interaction risks, or decode lipid panels.");
}

// --- FILE UPLOADS MOCKING PARSERS ---

function triggerSimulatedUpload() {
  document.getElementById("dashboard-mock-file-input").click();
}

function processMockFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  showToastNotification("Uploading Record", `${file.name} processing...`);

  const list = document.getElementById("ai-uploaded-docs-list");
  const node = document.createElement("div");
  node.className = "flex items-center justify-between p-2 rounded-lg bg-gray-950/40 border border-gray-850";
  node.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="fa-solid fa-file-pdf text-[#f43f5e] text-sm animate-pulse"></i>
      <div class="text-[10px]">
        <span class="font-bold text-white block">${file.name}</span>
        <span class="text-gray-500">Processing...</span>
      </div>
    </div>
  `;
  list.prepend(node);

  setTimeout(() => {
    node.innerHTML = `
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-file-pdf text-[#f43f5e] text-sm"></i>
        <div class="text-[10px]">
          <span class="font-bold text-white block">${file.name}</span>
          <span class="text-emeraldGreen">AI Analysis Complete</span>
        </div>
      </div>
      <button onclick="sendDashboardQuickPrompt('Decode chemistry panel results')" class="text-[9px] text-cyanAccent hover:underline font-bold">Interpret Results</button>
    `;
    showToastNotification("Analysis complete", `${file.name} interpreted by AI Doctor.`);
  }, 2500);
}

function initDragAndDropUpload() {
  // Safe drag triggers
}

// --- INTERNAL DATA CONTROLLERS ---

function loadPatientInfo() {
  const member = window.mockData.familyMembers.find(f => f.id === dashState.activeProfileId);
  if (member) {
    const parentPatient = window.mockData.patient;
    const memberId = document.getElementById("ins-member-id");
    const groupId = document.getElementById("ins-group-id");
    const cov = document.getElementById("ins-coverage");
    if (memberId && groupId && cov) {
      memberId.innerText = parentPatient.insurance.memberId;
      groupId.innerText = parentPatient.insurance.groupId;
      cov.innerText = parentPatient.insurance.coveragePct;
    }
  }
}

function animateTargetRings() {
  const member = window.mockData.familyMembers.find(f => f.id === dashState.activeProfileId);
  if (!member) return;

  const act = window.mockData.vitals.activity;
  const stepsPct = act.steps / act.target;
  const sleepPct = act.sleep / act.targetSleep;
  const caloriesPct = act.calories / 1000;

  const ringSt = document.getElementById("ring-overview-steps");
  const ringSl = document.getElementById("ring-overview-sleep");
  const ringCl = document.getElementById("ring-overview-calories");

  if (ringSt) ringSt.style.strokeDashoffset = 314.16 * (1 - stepsPct);
  if (ringSl) ringSl.style.strokeDashoffset = 238.76 * (1 - Math.min(sleepPct, 1));
  if (ringCl) ringCl.style.strokeDashoffset = 163.36 * (1 - caloriesPct);

  const pctText = document.getElementById("ring-pct-steps-text");
  if (pctText) pctText.innerText = `${Math.floor(stepsPct * 100)}%`;
}

function launchMockVideoConsultation() {
  switchDashboardTab('telemedicine');
  alert("Launching Aegis Secure Video Room... Connecting to encrypted clinical line.");

  const screen = document.querySelector("#tab-telemedicine img");
  if (screen) {
    screen.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=400&q=80";
  }
}

// Custom cursor trailing using Lerping in dashboard
function initCustomCursor() {
  let mouse = { x: 0, y: 0 };
  let cursorDot = { x: 0, y: 0 };
  let cursorGlow = { x: 0, y: 0 };

  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function animateCursor() {
    cursorDot.x += (mouse.x - cursorDot.x) * 0.25;
    cursorDot.y += (mouse.y - cursorDot.y) * 0.25;

    cursorGlow.x += (mouse.x - cursorGlow.x) * 0.12;
    cursorGlow.y += (mouse.y - cursorGlow.y) * 0.12;

    const dotEl = document.getElementById("custom-cursor");
    const glowEl = document.getElementById("custom-cursor-glow");
    const followGlowEl = document.getElementById("mouse-follow-glow");

    if (dotEl) dotEl.style.transform = `translate3d(${cursorDot.x}px, ${cursorDot.y}px, 0) translate(-50%, -50%)`;
    if (glowEl) glowEl.style.transform = `translate3d(${cursorGlow.x}px, ${cursorGlow.y}px, 0) translate(-50%, -50%)`;
    if (followGlowEl) followGlowEl.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(animateCursor);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    requestAnimationFrame(animateCursor);
  }
}

function refreshHoverCursorTriggers() {
  document.querySelectorAll("a, button, input, select, textarea, .cursor-pointer").forEach(el => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });
}

// 3D Tilt perspective triggers inside dashboard
function init3DTilt() {
  if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  document.querySelectorAll(".tilt-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotX = ((y / rect.height) - 0.5) * -16;
      const rotY = ((x / rect.width) - 0.5) * 16;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// Magnetic pull button actions inside dashboard
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  document.querySelectorAll(".magnetic-btn").forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const pullX = (x - rect.width / 2) * 0.35;
      const pullY = (y - rect.height / 2) * 0.35;

      btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.04)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = `translate3d(0, 0, 0) scale(1)`;
    });
  });
}

// Markdown parser
function markdownToHtml(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

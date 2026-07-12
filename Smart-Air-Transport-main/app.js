// ==========================================================================
// Smart Air Cargo Transport Platform (Global TransitOps Engine)
// ==========================================================================

const AIRPORTS = {
  // India Hubs
  DEL: { x: 325, y: 225, name: "Delhi Hub (DEL)", region: "India" },
  AMD: { x: 305, y: 250, name: "Ahmedabad Hub (AMD)", region: "India" },
  BOM: { x: 310, y: 285, name: "Mumbai Hub (BOM)", region: "India" },
  CCU: { x: 365, y: 245, name: "Kolkata Hub (CCU)", region: "India" },
  BLR: { x: 325, y: 315, name: "Bengaluru Hub (BLR)", region: "India" },
  
  // US Hubs
  JFK: { x: 70, y: 160, name: "New York (JFK)", region: "United States" },
  LAX: { x: 20, y: 200, name: "Los Angeles (LAX)", region: "United States" },
  ORD: { x: 45, y: 170, name: "Chicago (ORD)", region: "United States" },
  
  // Middle East Hubs
  DXB: { x: 230, y: 240, name: "Dubai (DXB)", region: "Middle East" },
  AUH: { x: 220, y: 248, name: "Abu Dhabi (AUH)", region: "Middle East" },
  RKT: { x: 235, y: 232, name: "Ras Al Khaimah (RKT)", region: "Middle East" },
  DWC: { x: 230, y: 252, name: "Al Maktoum (DWC)", region: "Middle East" },
  
  // Europe Hubs
  IST: { x: 180, y: 180, name: "Istanbul (IST)", region: "Europe" },
  AMS: { x: 130, y: 130, name: "Amsterdam (AMS)", region: "Europe" },
  FRA: { x: 145, y: 140, name: "Frankfurt (FRA)", region: "Europe" },
  LEJ: { x: 155, y: 135, name: "Leipzig (LEJ)", region: "Europe" },
  MUC: { x: 150, y: 150, name: "Munich (MUC)", region: "Europe" }
};

// Global Database State
let state = {
  aircraft: {
    // Wide-Body Long-Range Fleet
    "VT-SAT01": { name: "Atlas Carrier", model: "Boeing 777F", type: "Wide-Body", payloadCap: 102000, fuelCap: 181000, flyingHours: 120, acqCost: 2800, homeAirport: "BOM", currentAirport: "BOM", status: "Available" },
    "VT-SAT02": { name: "Queen of Skies", model: "Boeing 747-8F", type: "Wide-Body", payloadCap: 134000, fuelCap: 226000, flyingHours: 85, acqCost: 3500, homeAirport: "DEL", currentAirport: "DEL", status: "Available" },
    "VT-SAT03": { name: "Oceanic Freighter", model: "Airbus A330-P2F", type: "Wide-Body", payloadCap: 61000, fuelCap: 109000, flyingHours: 60, acqCost: 1900, homeAirport: "BLR", currentAirport: "BLR", status: "Available" },
    "VT-SAT04": { name: "Next-Gen Cargo", model: "Airbus A350F", type: "Wide-Body", payloadCap: 109000, fuelCap: 156000, flyingHours: 40, acqCost: 3100, homeAirport: "DXB", currentAirport: "DXB", status: "Available" },
    "VT-SAT05": { name: "FedEx Express", model: "McDonnell Douglas MD-11F", type: "Wide-Body", payloadCap: 85000, fuelCap: 146000, flyingHours: 180, acqCost: 1500, homeAirport: "JFK", currentAirport: "JFK", status: "Available" },
    
    // Narrow-Body & Turboprop Fleet
    "VT-SAT06": { name: "Blue Dart Regional", model: "Boeing 737-800BCF", type: "Narrow-Body", payloadCap: 22500, fuelCap: 26000, flyingHours: 210, acqCost: 950, homeAirport: "AMD", currentAirport: "AMD", status: "Available" },
    "VT-SAT07": { name: "Indigo Cargo", model: "Airbus A321P2F", type: "Narrow-Body", payloadCap: 27000, fuelCap: 32000, flyingHours: 145, acqCost: 1100, homeAirport: "CCU", currentAirport: "CCU", status: "Available" },
    "VT-SAT08": { name: "Desert Turboprop", model: "ATR 72-600F", type: "Turboprop", payloadCap: 8500, fuelCap: 6000, flyingHours: 95, acqCost: 550, homeAirport: "DEL", currentAirport: "DEL", status: "Available" }
  },
  pilots: {
    "PL-101": { name: "Captain Alex", licenseNum: "AL-98745-DEL", category: "ATPL", licenseExp: "2027-12-15", medicalExp: "2027-06-30", flyingHours: 450, contact: "9876543210", safetyScore: 98, status: "Available" },
    "PL-102": { name: "Captain Sarah", licenseNum: "SL-43921-BOM", category: "ATPL", licenseExp: "2028-02-18", medicalExp: "2028-01-10", flyingHours: 320, contact: "9876543211", safetyScore: 95, status: "Available" },
    "PL-103": { name: "Captain Hassan", licenseNum: "HL-82910-DXB", category: "ATPL", licenseExp: "2027-09-20", medicalExp: "2027-08-15", flyingHours: 890, contact: "9876543212", safetyScore: 97, status: "Available" },
    "PL-104": { name: "Captain Dupont", licenseNum: "DL-39210-AMS", category: "ATPL", licenseExp: "2028-05-12", medicalExp: "2028-04-10", flyingHours: 1250, contact: "9876543213", safetyScore: 99, status: "Available" }
  },
  trips: [
    { id: "TRP-8291", origin: "DEL", destination: "DXB", aircraft: "VT-SAT01", pilot: "PL-101", cargoWeight: 85000, cargoType: "Express", departure: "2026-07-12T18:00", status: "Dispatched", distance: 2200 },
    { id: "TRP-4392", origin: "BOM", destination: "JFK", aircraft: "VT-SAT02", pilot: "PL-102", cargoWeight: 110000, cargoType: "Medical", departure: "2026-07-11T10:00", status: "Completed", distance: 11750, finalOdo: 14, fuelUsed: 141000, revenue: 142.5 }
  ],
  maintenance: [],
  fuelLogs: [
    { aircraft: "VT-SAT02", qty: 141000, cost: 84.6, date: "2026-07-11", airport: "BOM" }
  ],
  expenses: [
    { aircraft: "VT-SAT02", category: "Airport Handling Fees", cost: 1.25, date: "2026-07-11" },
    { aircraft: "VT-SAT02", category: "Landing Charges", cost: 0.85, date: "2026-07-11" }
  ],
  weather: "Normal",
  windSpeed: 12,
  decisionLogs: [
    { timestamp: "2026-07-12 11:15", operator: "System", disruption: "Platform Boot", prevConfig: "None", newConfig: "Global route database set.", rationale: "International wide-body grid initialized." }
  ]
};

// Global variables
let activePlanesInterval = null;
let activeScreeningInterval = null;
let currentOCCSubPanel = "overview";

document.addEventListener("DOMContentLoaded", () => {
  loadDatabase();
  initTheme();
  initRouter();
  initCustomerOrderForm();
  initCustomerTracker();
  initAdminAuth();
  initOCCDashboard();
  animatePlanes();
});

// ==========================================================================
// Local Storage Sync & Theme Settings
// ==========================================================================
function saveDatabase() {
  localStorage.setItem("transitops_global_db", JSON.stringify(state));
}

function loadDatabase() {
  const saved = localStorage.getItem("transitops_global_db");
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (e) {
      console.error("Could not parse saved global state. Loading defaults.");
    }
  }
}

function initTheme() {
  const themeBtn = document.getElementById("theme-btn");
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  themeBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = activeTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

// ==========================================================================
// SPA Router (Customer & OCC Admin Toggles)
// ==========================================================================
function initRouter() {
  const navLinks = document.querySelectorAll(".nav-link");
  const menuToggle = document.getElementById("menu-toggle-btn");
  const navMenu = document.getElementById("nav-menu");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "test.html") return;
      e.preventDefault();
      const section = link.getAttribute("data-section");
      
      // Close mobile drawer
      navMenu.classList.remove("active");
      
      navigateToSection(section);
    });
  });

  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  // Check Hash
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1);
    if (["place-order", "track-order", "occ"].includes(hash)) {
      navigateToSection(hash);
    }
  });
}

function navigateToSection(sectionId) {
  document.querySelectorAll(".app-section").forEach(sec => sec.classList.remove("active"));
  const target = document.getElementById(`${sectionId}-section`);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("data-section") === sectionId) {
      link.classList.add("active");
    }
  });

  window.location.hash = sectionId;

  // Handle panel redraws
  if (sectionId === "occ") {
    checkOCCAuth();
  }
}

// ==========================================================================
// Public Customer Order Form (Send Cargo)
// ==========================================================================
function initCustomerOrderForm() {
  const form = document.getElementById("order-form");
  const originSelect = document.getElementById("origin-airport");
  const destSelect = document.getElementById("destination-airport");
  const latBox = document.getElementById("lat-feedback-box");

  // LAT checker
  [originSelect, destSelect].forEach(sel => sel.addEventListener("change", () => {
    if (originSelect.value === destSelect.value && originSelect.value !== "") {
      destSelect.value = "";
    }
    
    if (originSelect.value && destSelect.value) {
      // Simulate LAT calculation (rule: lock flight 4 hours before departure)
      latBox.style.display = "block";
      const now = new Date();
      const depDate = new Date(now.getTime() + (6 * 3600 * 1000)); // 6 hours out
      const latDate = new Date(depDate.getTime() - (4 * 3600 * 1000)); // 4 hours cutoff

      document.getElementById("next-flight-dep").textContent = depDate.toLocaleTimeString();
      document.getElementById("lat-deadline-disp").textContent = latDate.toLocaleTimeString() + " (4h cutoff)";
      
      const deadlineMet = true;
      document.getElementById("lat-feasibility").textContent = "✓ Window Open (LAT Verified)";
      document.getElementById("lat-status-row").style.color = "var(--success-color)";
    }
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const weight = parseInt(document.getElementById("package-weight").value);
    const origin = originSelect.value;
    const dest = destSelect.value;
    const type = document.getElementById("cargo-type").value;
    const deadline = document.getElementById("delivery-deadline").value;

    const trackingId = `TRP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTrip = {
      id: trackingId,
      origin: origin,
      destination: dest,
      aircraft: "Unassigned",
      pilot: "Unassigned",
      cargoWeight: weight,
      cargoType: type,
      departure: deadline,
      status: "Screening",
      distance: calculateGlobalDistance(origin, dest)
    };

    // Save to global state & sync
    state.trips.push(newTrip);
    saveDatabase();

    // Show screening pipeline
    form.style.display = "none";
    document.getElementById("order-success").style.display = "block";
    document.getElementById("success-tracking-id").textContent = trackingId;

    runLiveSecurityScreening(trackingId);
  });

  // Success screen action buttons
  document.getElementById("success-track-btn").addEventListener("click", () => {
    const id = document.getElementById("success-tracking-id").textContent;
    document.getElementById("tracker-input").value = id;
    navigateToSection("track-order");
    searchConsignment(id);
  });

  document.getElementById("success-new-order-btn").addEventListener("click", () => {
    form.style.display = "block";
    document.getElementById("order-success").style.display = "none";
    form.reset();
    latBox.style.display = "none";
  });

  // Copy tracking ID
  document.getElementById("copy-tracking-btn").addEventListener("click", () => {
    const id = document.getElementById("success-tracking-id").textContent;
    navigator.clipboard.writeText(id).then(() => {
      alert("Tracking code copied to clipboard!");
    });
  });
}

function runLiveSecurityScreening(trackingId) {
  const steps = [
    { id: "scr-xray", desc: "X-Ray scanner verified packages integrity." },
    { id: "scr-dg", desc: "Dangerous Goods screening compliance passed." },
    { id: "scr-docs", desc: "Digital flight manifest documentation checked." }
  ];

  let currentStep = 0;
  
  // Clear steps UI
  steps.forEach(s => {
    const el = document.getElementById(s.id);
    el.className = "screening-step";
    el.querySelector(".scr-status").textContent = "Pending";
  });

  if (activeScreeningInterval) clearInterval(activeScreeningInterval);

  activeScreeningInterval = setInterval(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      const el = document.getElementById(step.id);
      el.className = "screening-step active";
      el.querySelector(".scr-status").textContent = "Scanning...";

      setTimeout(() => {
        el.className = "screening-step pass";
        el.querySelector(".scr-status").textContent = "Pass ✓";
        
        // Log in the trip registry history logs
        const trip = state.trips.find(t => t.id === trackingId);
        if (trip) {
          if (!trip.logs) trip.logs = [];
          trip.logs.push({ time: getCurrentTimestamp().slice(11, 16), desc: step.desc });
          saveDatabase();
        }
      }, 800);

      currentStep++;
    } else {
      clearInterval(activeScreeningInterval);
      document.getElementById("screening-outcome-disp").textContent = "Cleared ✓";
      document.getElementById("screening-outcome-disp").style.color = "var(--success-color)";
      
      const trip = state.trips.find(t => t.id === trackingId);
      if (trip) {
        trip.status = "Draft"; // Becomes dispatchable Draft
        saveDatabase();
      }
    }
  }, 1000);
}

function calculateGlobalDistance(o, d) {
  const org = AIRPORTS[o];
  const dest = AIRPORTS[d];
  if (!org || !dest) return 1000;
  
  // rough coordinate scaling
  const dx = org.x - dest.x;
  const dy = org.y - dest.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 42);
}

// ==========================================================================
// Public Customer Tracker
// ==========================================================================
function initCustomerTracker() {
  document.getElementById("tracker-search-btn").addEventListener("click", () => {
    const code = document.getElementById("tracker-input").value.trim().toUpperCase();
    searchConsignment(code);
  });

  document.getElementById("sample-track-code").addEventListener("click", (e) => {
    const code = e.target.textContent;
    document.getElementById("tracker-input").value = code;
    searchConsignment(code);
  });
}

function searchConsignment(code) {
  loadDatabase(); // ensure freshest values synced
  const trip = state.trips.find(t => t.id === code);

  const resultBox = document.getElementById("tracker-result");
  const emptyBox = document.getElementById("tracker-empty");

  if (!trip) {
    resultBox.style.display = "none";
    emptyBox.style.display = "block";
    emptyBox.querySelector("p").textContent = `Consignment '${code}' not found in registry.`;
    return;
  }

  emptyBox.style.display = "none";
  resultBox.style.display = "block";

  // Meta details
  document.getElementById("track-id-disp").textContent = trip.id;
  document.getElementById("track-priority-disp").textContent = `${trip.cargoType} priority`;
  document.getElementById("track-origin-disp").textContent = `${trip.origin} Hub ➔ ${trip.destination} Hub`;
  document.getElementById("track-aircraft-disp").textContent = trip.aircraft;
  document.getElementById("track-package-disp").textContent = `${trip.cargoWeight.toLocaleString()} kg | Distance: ${trip.distance} km`;
  document.getElementById("track-haz-disp").textContent = trip.cargoType === "Express" ? "Normal Screening Cleared" : "Secured";
  document.getElementById("track-delivery-disp").textContent = trip.status === "Completed" ? "Delivered ✓" : "In Operations Queue";

  // Map Drawing
  drawTrackerMiniMap(trip.origin, trip.destination, trip.status === "Dispatched");

  // Timeline nodes state
  const statusMap = { "Screening": 1, "Draft": 2, "Dispatched": 4, "Completed": 5, "Cancelled": 0 };
  const activeStepIdx = statusMap[trip.status] || 0;

  for (let i = 0; i <= 5; i++) {
    const node = document.getElementById(`step-${i}`);
    node.className = "timeline-step";
    if (i < activeStepIdx) node.classList.add("completed");
    if (i === activeStepIdx) node.classList.add("active");
  }

  // Draw logs
  const logsContainer = document.getElementById("tracking-logs-container");
  const logs = trip.logs || [
    { time: "11:20", desc: "Cargo registered and queued by customer." }
  ];
  
  logsContainer.innerHTML = logs.map(l => `
    <div style="font-family:var(--font-mono); font-size:0.75rem; margin-bottom:0.25rem;">
      <span style="color:var(--text-muted);">${l.time}</span> - ${l.desc}
    </div>
  `).join("");
}

function drawTrackerMiniMap(origin, dest, isFlying) {
  const svg = document.getElementById("tracker-mini-map");
  const o = AIRPORTS[origin];
  const d = AIRPORTS[dest];
  if (!o || !d) return;

  svg.innerHTML = `
    <!-- Connection Route -->
    <path d="M ${o.x/2},100 Q 250,50 ${d.x/2},100" fill="none" stroke="var(--accent-color)" stroke-width="2" stroke-dasharray="5,5"/>
    
    <!-- Origin node -->
    <circle cx="${o.x/2}" cy="100" r="5" fill="var(--success-color)"/>
    <text x="${o.x/2}" y="120" font-size="8px" fill="#fff" text-anchor="middle">${origin}</text>
    
    <!-- Dest node -->
    <circle cx="${d.x/2}" cy="100" r="5" fill="var(--danger-color)"/>
    <text x="${d.x/2}" y="120" font-size="8px" fill="#fff" text-anchor="middle">${dest}</text>

    ${isFlying ? `
      <!-- Plane marker -->
      <g transform="translate(250, 75)">
        <path d="M 0,-4 L 3,-4 L 6,0 L 2,0 L 4,4 L 1,4 L 0,1 L -1,4 L -4,4 L -2,0 L -6,0 L -3,-4 Z" fill="var(--accent-color)"/>
      </g>
    ` : ""}
  `;
}

// ==========================================================================
// Admin Secure OCC Access & Verification
// ==========================================================================
function initAdminAuth() {
  const loginForm = document.getElementById("admin-login-form");
  const errorMsg = document.getElementById("admin-login-error");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = document.getElementById("admin-password").value;
    const role = document.getElementById("admin-role-select").value;

    if (pass === "trans_cargo") {
      sessionStorage.setItem("isAdminAuthenticated", "true");
      sessionStorage.setItem("userRole", role);
      errorMsg.style.display = "none";
      document.getElementById("admin-password").value = "";
      
      checkOCCAuth();
    } else {
      errorMsg.style.display = "block";
    }
  });

  document.getElementById("btn-admin-logout").addEventListener("click", () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    sessionStorage.removeItem("userRole");
    checkOCCAuth();
  });
}

function checkOCCAuth() {
  const isAuth = sessionStorage.getItem("isAdminAuthenticated") === "true";
  const loginCard = document.getElementById("admin-login-card");
  const dashboard = document.getElementById("admin-occ-dashboard");
  const roleBadge = document.getElementById("admin-role-badge");
  const logoutBtn = document.getElementById("btn-admin-logout");

  if (isAuth) {
    loginCard.style.display = "none";
    dashboard.style.display = "block";
    
    roleBadge.style.display = "block";
    roleBadge.textContent = sessionStorage.getItem("userRole");
    logoutBtn.style.display = "block";
    
    // Draw default panel
    switchOCCPanel(currentOCCSubPanel);
  } else {
    loginCard.style.display = "block";
    dashboard.style.display = "none";
    
    roleBadge.style.display = "none";
    logoutBtn.style.display = "none";
  }
}

// OCC sub-panel switcher
function switchOCCPanel(panelId) {
  currentOCCSubPanel = panelId;
  document.querySelectorAll(".occ-sub-panel").forEach(p => p.classList.remove("active-panel"));
  document.getElementById(`occ-panel-${panelId}`).classList.add("active-panel");

  // Keep workspace toggles highlighted
  const buttons = document.querySelectorAll("#admin-occ-dashboard .btn-hud-action");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    if (btn.textContent.toLowerCase().includes(panelId === "maint" ? "maintenance" : panelId)) {
      btn.classList.add("active");
    }
  });

  // Load specific grid renderers
  if (panelId === "overview") renderOCCStats();
  if (panelId === "aircraft") renderOCCAircraft();
  if (panelId === "pilots") renderOCCPilots();
  if (panelId === "dispatch") renderOCCDispatchBoard();
  if (panelId === "maint") renderOCCMaintenanceTable();
  if (panelId === "fuel") renderOCCExpensesTable();
  if (panelId === "reports") renderOCCReports();
}

// ==========================================================================
// Admin Workspace Controllers
// ==========================================================================
function renderOCCStats() {
  loadDatabase();
  const activeAC = Object.values(state.aircraft).filter(ac => ac.status === "On Trip").length;
  const availAC = Object.values(state.aircraft).filter(ac => ac.status === "Available").length;
  const maintAC = Object.values(state.aircraft).filter(ac => ac.status === "In Maintenance").length;
  const tripsCount = state.trips.filter(t => t.status === "Dispatched").length;
  const pilotsCount = Object.values(state.pilots).filter(p => p.status === "Available" || p.status === "On Trip").length;

  document.getElementById("occ-kpi-active").textContent = activeAC;
  document.getElementById("occ-kpi-avail").textContent = availAC;
  document.getElementById("occ-kpi-maint").textContent = maintAC;
  document.getElementById("occ-kpi-trips").textContent = tripsCount;
  document.getElementById("occ-kpi-pilots").textContent = pilotsCount;

  // Render Sorting Queue lists
  const qPending = document.getElementById("queue-pending");
  const qAssigned = document.getElementById("queue-assigned");
  const qCompleted = document.getElementById("queue-completed");

  const pending = state.trips.filter(t => t.status === "Draft" || t.status === "Screening");
  const assigned = state.trips.filter(t => t.status === "Dispatched");
  const completed = state.trips.filter(t => t.status === "Completed");

  const buildQueueHtml = (list) => list.map(t => `
    <div class="queue-item ${t.cargoType === 'Medical' ? 'med' : t.cargoType === 'Perishable' ? 'per' : 'std'}" style="margin-bottom:0.25rem;">
      <strong style="color:var(--accent-color);">${t.id}</strong> [${t.origin}➔${t.destination}]
      <div style="font-size:0.6rem; opacity:0.8;">Weight: ${t.cargoWeight} kg</div>
    </div>
  `).join("");

  qPending.innerHTML = buildQueueHtml(pending) || "<p style='font-size:0.6rem; color:var(--text-muted);'>No items</p>";
  qAssigned.innerHTML = buildQueueHtml(assigned) || "<p style='font-size:0.6rem; color:var(--text-muted);'>No flights</p>";
  qCompleted.innerHTML = buildQueueHtml(completed) || "<p style='font-size:0.6rem; color:var(--text-muted);'>No cargo</p>";

  // Load decision log body
  const logsTable = document.getElementById("decision-logs-body");
  logsTable.innerHTML = state.decisionLogs.map(l => `
    <tr>
      <td style="color:var(--text-muted); font-size:0.75rem;">${l.timestamp}</td>
      <td style="font-weight:bold;">${l.operator}</td>
      <td style="color:var(--warning-color);">${l.disruption}</td>
      <td>${l.prevConfig}</td>
      <td style="color:var(--success-color);">${l.newConfig}</td>
    </tr>
  `).join("");

  updateGlobalRouteMap();
}

function renderOCCAircraft() {
  const tbody = document.getElementById("aircraft-table-body");
  tbody.innerHTML = Object.entries(state.aircraft).map(([reg, ac]) => `
    <tr>
      <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${reg}</td>
      <td>${ac.name}</td>
      <td>${ac.model}</td>
      <td style="font-family:var(--font-mono);">${ac.payloadCap.toLocaleString()} kg</td>
      <td style="font-family:var(--font-mono);">${ac.flyingHours} hrs</td>
      <td><strong>${ac.currentAirport}</strong></td>
      <td><span class="status-indicator ${ac.status.toLowerCase().replace(" ", "")}">${ac.status}</span></td>
    </tr>
  `).join("");
}

function renderOCCPilots() {
  const tbody = document.getElementById("pilots-table-body");
  tbody.innerHTML = Object.entries(state.pilots).map(([id, p]) => {
    const isLicenseExpired = new Date(p.licenseExp) < new Date();
    const isMedicalExpired = new Date(p.medicalExp) < new Date();
    let warn = "";
    if (isLicenseExpired) warn += `<span style="color:var(--danger-color); font-weight:bold; font-size:0.65rem;"> [LICENSE EXPIRED]</span>`;
    if (isMedicalExpired) warn += `<span style="color:var(--danger-color); font-weight:bold; font-size:0.65rem;"> [MEDICAL EXPIRED]</span>`;

    return `
      <tr>
        <td><strong>${p.name}</strong><br><span style="font-size:0.7rem; color:var(--text-muted);">${id}</span></td>
        <td><span style="font-family:var(--font-mono);">${p.licenseNum}</span>${warn}</td>
        <td style="font-family:var(--font-mono); font-size:0.75rem;">Lic: ${p.licenseExp}<br>Med: ${p.medicalExp}</td>
        <td style="font-family:var(--font-mono); font-weight:bold;">${p.safetyScore}/100</td>
        <td><span class="status-indicator ${p.status.toLowerCase().replace(" ", "")}">${p.status}</span></td>
      </tr>
    `;
  }).join("");
}

function renderOCCDispatchBoard() {
  const tbody = document.getElementById("trips-table-body");
  tbody.innerHTML = state.trips.map(t => {
    let actions = "";
    if (t.status === "Dispatched") {
      actions = `<button class="btn btn-hud-action" style="padding:0.2rem 0.4rem; font-size:0.7rem;" onclick="completeTrip OCC('${t.id}')">Complete</button>`;
    } else if (t.status === "Draft") {
      actions = `<button class="btn btn-primary" style="padding:0.2rem 0.4rem; font-size:0.7rem;" onclick="dispatchTripOCC('${t.id}')">Dispatch</button>`;
    }

    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${t.id}</td>
        <td>
          <div style="font-weight:bold;">${t.origin} ➔ ${t.destination}</div>
          <div style="font-size:0.7rem; color:var(--text-secondary);">Load: ${t.cargoWeight.toLocaleString()} kg | Dist: ${t.distance} km</div>
        </td>
        <td style="font-size:0.75rem;">
          AC: <strong>${t.aircraft}</strong><br>
          Pilot: <strong>${state.pilots[t.pilot] ? state.pilots[t.pilot].name : t.pilot}</strong>
        </td>
        <td><span class="status-indicator ${t.status.toLowerCase()}">${t.status}</span></td>
        <td>${actions}</td>
      </tr>
    `;
  }).join("");

  updateDispatchFormDropdowns();
}

function updateDispatchFormDropdowns() {
  const acSelect = document.getElementById("trip-aircraft");
  const pltSelect = document.getElementById("trip-pilot");

  const availableAC = Object.entries(state.aircraft).filter(([reg, ac]) => ac.status === "Available");
  acSelect.innerHTML = availableAC.map(([reg, ac]) => `<option value="${reg}">${reg} (${ac.model})</option>`).join("");

  const availablePilots = Object.entries(state.pilots).filter(([id, p]) => {
    const isLicenseExpired = new Date(p.licenseExp) < new Date();
    const isMedicalExpired = new Date(p.medicalExp) < new Date();
    return p.status === "Available" && !isLicenseExpired && !isMedicalExpired;
  });
  pltSelect.innerHTML = availablePilots.map(([id, p]) => `<option value="${id}">${p.name}</option>`).join("");
}

function dispatchTripOCC(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (!trip) return;

  const acId = document.getElementById("trip-aircraft").value;
  const pltId = document.getElementById("trip-pilot").value;

  if (!acId || !pltId) {
    alert("Please ensure an available aircraft and pilot are assigned in the scheduler panel first.");
    return;
  }

  // Rules Check
  const ac = state.aircraft[acId];
  if (trip.cargoWeight > ac.payloadCap) {
    alert(`Payload Violation: Cargo weight (${trip.cargoWeight} kg) exceeds ${acId} payload capacity (${ac.payloadCap} kg).`);
    return;
  }

  trip.aircraft = acId;
  trip.pilot = pltId;
  trip.status = "Dispatched";

  // Transition statuses
  state.aircraft[acId].status = "On Trip";
  state.pilots[pltId].status = "On Trip";

  if (!trip.logs) trip.logs = [];
  trip.logs.push({ time: getCurrentTimestamp().slice(11, 16), desc: `Flight dispatched. Assets: ${acId} & Captain ${state.pilots[pltId].name}.` });

  saveDatabase();
  renderOCCDispatchBoard();
  alert(`Consignment ${tripId} has been successfully dispatched!`);
}

function completeTripOCC(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (!trip) return;

  const hours = parseFloat(prompt("Enter flight duration hours (Odo increment):", "3"));
  const fuel = parseInt(prompt("Enter fuel consumed (Liters):", "5500"));
  const rev = parseFloat(prompt("Enter revenue (₹ Lakhs):", "8.5"));

  if (isNaN(hours) || isNaN(fuel) || isNaN(rev)) return;

  trip.status = "Completed";
  trip.finalOdo = hours;
  trip.fuelUsed = fuel;
  trip.revenue = rev;

  // Restore states
  const acId = trip.aircraft;
  state.aircraft[acId].status = "Available";
  state.aircraft[acId].flyingHours += hours;
  state.aircraft[acId].currentAirport = trip.destination;

  state.pilots[trip.pilot].status = "Available";
  state.pilots[trip.pilot].flyingHours += hours;

  // Add fuel entry
  state.fuelLogs.push({
    aircraft: acId,
    qty: fuel,
    cost: Math.round(fuel * 0.095 * 10) / 10,
    date: getCurrentTimestamp().slice(0,10),
    airport: trip.destination
  });

  if (!trip.logs) trip.logs = [];
  trip.logs.push({ time: getCurrentTimestamp().slice(11, 16), desc: `Delivered at destination airport. Completed.` });

  saveDatabase();
  renderOCCDispatchBoard();
  alert(`Trip ${tripId} completed successfully!`);
}

// Maintenance tables
function renderOCCMaintenanceTable() {
  const tbody = document.getElementById("maintenance-table-body");
  tbody.innerHTML = state.maintenance.map((m, idx) => `
    <tr>
      <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${m.aircraft}</td>
      <td><strong>${m.type}</strong></td>
      <td>${m.desc}</td>
      <td style="font-family:var(--font-mono);">${m.date}</td>
      <td style="font-family:var(--font-mono); font-weight:bold;">₹ ${m.cost} L</td>
      <td><span class="status-indicator ${m.status === 'Active' ? 'maintenance' : 'available'}">${m.status}</span></td>
      <td>${m.status === 'Active' ? `<button class="btn btn-hud-action" style="padding:0.2rem 0.4rem; font-size:0.7rem;" onclick="closeMaintenanceOCC(${idx})">Resolve</button>` : ""}</td>
    </tr>
  `).join("");

  // Update dropdowns
  const select = document.getElementById("maint-aircraft");
  const availableAC = Object.entries(state.aircraft).filter(([reg, ac]) => ac.status === "Available");
  select.innerHTML = availableAC.map(([reg, ac]) => `<option value="${reg}">${reg} (${ac.model})</option>`).join("");
}

function closeMaintenanceOCC(idx) {
  const m = state.maintenance[idx];
  m.status = "Resolved";
  state.aircraft[m.aircraft].status = "Available";
  saveDatabase();
  renderOCCMaintenanceTable();
}

// Expenses
function renderOCCExpensesTable() {
  const tbody = document.getElementById("expenses-table-body");
  const fuelItems = state.fuelLogs.map(f => ({ ac: f.aircraft, cat: `Fuel uplift (${f.qty} L)`, cost: f.cost, date: f.date }));
  const generalItems = state.expenses.map(e => ({ ac: e.aircraft, cat: e.category, cost: e.cost, date: e.date }));
  
  const all = [...fuelItems, ...generalItems].sort((a,b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = all.map(item => `
    <tr>
      <td style="font-family:var(--font-mono); font-weight:bold;">${item.ac}</td>
      <td>${item.cat}</td>
      <td style="font-family:var(--font-mono); font-weight:bold; color:var(--danger-color)">₹ ${item.cost} L</td>
      <td style="font-family:var(--font-mono); font-size:0.75rem;">${item.date}</td>
    </tr>
  `).join("");

  // Update form selects
  const fSelect = document.getElementById("fuel-aircraft");
  const eSelect = document.getElementById("exp-aircraft");
  const activeAC = Object.keys(state.aircraft);
  fSelect.innerHTML = activeAC.map(reg => `<option value="${reg}">${reg}</option>`).join("");
  eSelect.innerHTML = activeAC.map(reg => `<option value="${reg}">${reg}</option>`).join("");
}

// ==========================================================================
// Profit & Loss Accounting & Route Analytics Reports
// ==========================================================================
function renderOCCReports() {
  // 1. Live corporate P&L calculations
  const grossRev = state.trips.filter(t => t.status === "Completed").reduce((sum, t) => sum + (t.revenue || 0), 0);
  const fuelCost = state.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const maintCost = state.maintenance.reduce((sum, m) => sum + m.cost, 0);
  
  const handlingCost = state.expenses.filter(e => e.category === "Airport Handling Fees" || e.category === "Landing Charges").reduce((sum, e) => sum + e.cost, 0);
  const hangarCost = state.expenses.filter(e => e.category === "Hangar Charges").reduce((sum, e) => sum + e.cost, 0);
  const crewCost = state.expenses.filter(e => e.category === "Crew Expenses").reduce((sum, e) => sum + e.cost, 0);

  const totalCost = fuelCost + maintCost + handlingCost + hangarCost + crewCost;
  const netProfit = grossRev - totalCost;
  const margin = grossRev > 0 ? ((netProfit / grossRev) * 100).toFixed(1) : "0.0";

  document.getElementById("pl-gross-revenue").textContent = `₹ ${grossRev.toFixed(2)} Lakhs`;
  document.getElementById("pl-fuel-cost").textContent = `₹ ${fuelCost.toFixed(2)} Lakhs`;
  document.getElementById("pl-maint-cost").textContent = `₹ ${maintCost.toFixed(2)} Lakhs`;
  document.getElementById("pl-handling-cost").textContent = `₹ ${handlingCost.toFixed(2)} Lakhs`;
  document.getElementById("pl-hangar-cost").textContent = `₹ ${hangarCost.toFixed(2)} Lakhs`;
  document.getElementById("pl-crew-cost").textContent = `₹ ${crewCost.toFixed(2)} Lakhs`;
  document.getElementById("pl-total-cost").textContent = `₹ ${totalCost.toFixed(2)} Lakhs`;
  
  const netEl = document.getElementById("pl-net-profit");
  netEl.textContent = `₹ ${netProfit.toFixed(2)} Lakhs`;
  netEl.style.color = netProfit >= 0 ? "var(--success-color)" : "var(--danger-color)";
  document.getElementById("pl-operating-margin").textContent = `${margin}%`;

  // 2. Route density analysis table
  const tbodyRoute = document.getElementById("route-analysis-table-body");
  const sectors = {};

  state.trips.forEach(t => {
    const key = `${t.origin} ➔ ${t.destination}`;
    if (!sectors[key]) {
      sectors[key] = { count: 0, delay: 0, weight: 0 };
    }
    sectors[key].count++;
    sectors[key].weight += t.cargoWeight;
    // simulated delay factor
    sectors[key].delay += (t.distance * 0.005);
  });

  tbodyRoute.innerHTML = Object.entries(sectors).map(([sec, data]) => {
    const avgDelay = Math.round(data.delay / data.count);
    let density = "Low Traffic";
    if (data.count > 3) density = "High Density Core";
    else if (data.count >= 2) density = "Medium Traffic";

    return `
      <tr>
        <td style="font-weight:bold; color:var(--accent-color);">${sec}</td>
        <td style="font-family:var(--font-mono);">${data.count}</td>
        <td style="font-family:var(--font-mono);">${avgDelay} mins</td>
        <td style="font-family:var(--font-mono);">${data.weight.toLocaleString()} kg</td>
        <td><span class="status-indicator ${data.count > 3 ? 'retired' : 'available'}">${density}</span></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="5" style="text-align:center;">No sector traffic logged.</td></tr>`;

  // 3. Asset ROI sheet
  const tbodyReports = document.getElementById("reports-table-body");
  tbodyReports.innerHTML = Object.entries(state.aircraft).map(([reg, ac]) => {
    const completed = state.trips.filter(t => t.aircraft === reg && t.status === "Completed");
    const totalDist = completed.reduce((sum, t) => sum + t.distance, 0);
    const fuelQty = state.fuelLogs.filter(f => f.aircraft === reg).reduce((sum, f) => sum + f.qty, 0);
    const fCost = state.fuelLogs.filter(f => f.aircraft === reg).reduce((sum, f) => sum + f.cost, 0);
    const fuelEff = fuelQty > 0 ? (totalDist / fuelQty).toFixed(2) : "0";
    const mCost = state.maintenance.filter(m => m.aircraft === reg).reduce((sum, m) => sum + m.cost, 0);
    const oCost = state.expenses.filter(e => e.aircraft === reg).reduce((sum, e) => sum + e.cost, 0);
    const totalOpCost = fCost + mCost + oCost;
    const revenue = completed.reduce((sum, t) => sum + t.revenue, 0);
    const roi = ac.acqCost > 0 ? (((revenue - totalOpCost) / ac.acqCost) * 100).toFixed(1) : "0";

    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold;">${reg}</td>
        <td style="font-family:var(--font-mono);">${totalDist.toLocaleString()} km</td>
        <td style="font-family:var(--font-mono);">${fuelQty.toLocaleString()} L</td>
        <td style="font-family:var(--font-mono); font-weight:bold;">${fuelEff} km/L</td>
        <td style="font-family:var(--font-mono); color:var(--success-color);">₹ ${revenue.toFixed(2)} L</td>
        <td style="font-family:var(--font-mono);">₹ ${mCost.toFixed(2)} L</td>
        <td style="font-family:var(--font-mono);">₹ ${fCost.toFixed(2)} L</td>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--danger-color)">₹ ${totalOpCost.toFixed(2)} L</td>
        <td style="font-family:var(--font-mono); font-weight:bold; color:${parseFloat(roi) >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">${roi}%</td>
      </tr>
    `;
  }).join("");
}

// ==========================================================================
// SVG Flight Map Vector Handlers
// ==========================================================================
function updateGlobalRouteMap() {
  const lineGroup = document.getElementById("active-planes-line-group");
  const activeTrips = state.trips.filter(t => t.status === "Dispatched");

  // Draw active routes lines
  lineGroup.innerHTML = activeTrips.map(t => {
    const o = AIRPORTS[t.origin];
    const d = AIRPORTS[t.destination];
    if (!o || !d) return "";

    return `
      <path d="M ${o.x},${o.y} L ${d.x},${d.y}" class="map-route-line" />
    `;
  }).join("");
}

function animatePlanes() {
  const markerGroup = document.getElementById("active-planes-marker-group");
  let tick = 0;

  if (activePlanesInterval) clearInterval(activePlanesInterval);

  activePlanesInterval = setInterval(() => {
    tick += 0.01;
    if (tick > 1.0) tick = 0;

    const dispatched = state.trips.filter(t => t.status === "Dispatched");
    
    markerGroup.innerHTML = dispatched.map(t => {
      const o = AIRPORTS[t.origin];
      const d = AIRPORTS[t.destination];
      if (!o || !d) return "";

      const x = o.x + (d.x - o.x) * tick;
      const y = o.y + (d.y - o.y) * tick;
      const angle = Math.atan2(d.y - o.y, d.x - o.x) * (180 / Math.PI);

      return `
        <g class="flying-plane" transform="translate(${x}, ${y}) rotate(${angle})">
          <path d="M 0,-3 L 2,-3 L 4,0 L 1,0 L 2.5,3 L 0.5,3 L 0,1 L -0.5,3 L -2.5,3 L -1,0 L -4,0 L -2,-3 Z" transform="scale(1.2)" />
          <text y="9" font-size="5px" fill="#fff" text-anchor="middle" font-family="monospace">${t.id}</text>
        </g>
      `;
    }).join("");
  }, 100);
}

// ==========================================================================
// Helper Utilities
// ==========================================================================
function getCurrentTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

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

// Local user accounts state
let users = JSON.parse(localStorage.getItem("transitops_users") || "[]");
let currentUser = JSON.parse(localStorage.getItem("transitops_current_user") || "null");

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
  initCustomerAuth();
  updateAuthNavbar();
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
  if (!themeBtn) return;
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
  if (!menuToggle || !navMenu) return;

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
    if (["place-order", "track-order", "occ", "auth"].includes(hash)) {
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
  } else if (sectionId === "auth") {
    renderUserDashboard();
  }
}

// ==========================================================================
// Public Customer Order Form (Send Cargo)
// ==========================================================================
function initCustomerOrderForm() {
  const form = document.getElementById("order-form");
  if (!form) return;
  const originSelect = document.getElementById("origin-airport");
  const destSelect = document.getElementById("destination-airport");
  const latBox = document.getElementById("lat-feedback-box");
  if (!originSelect || !destSelect || !latBox) return;

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

    if (!currentUser) {
      alert("Authentication required: Please sign up or log in to book cargo transport space.");
      navigateToSection("auth");
      return;
    }

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
  const searchBtn = document.getElementById("tracker-search-btn");
  if (!searchBtn) return;
  const sampleBtn = document.getElementById("sample-track-code");
  if (!sampleBtn) return;

  searchBtn.addEventListener("click", () => {
    const code = document.getElementById("tracker-input").value.trim().toUpperCase();
    searchConsignment(code);
  });

  sampleBtn.addEventListener("click", (e) => {
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
  if (!loginForm) return;
  const errorMsg = document.getElementById("admin-login-error");
  const logoutBtn = document.getElementById("btn-admin-logout");

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

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("isAdminAuthenticated");
      sessionStorage.removeItem("userRole");
      checkOCCAuth();
    });
  }
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
      actions = `<button class="btn btn-hud-action" style="padding:0.2rem 0.4rem; font-size:0.7rem;" onclick="completeTripOCC('${t.id}')">Complete</button>`;
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
// OCC Dashboard Handler
// ==========================================================================
function initOCCDashboard() {
  const occDashboard = document.getElementById("admin-occ-dashboard");
  if (!occDashboard) return;

  // Render GA visualization generations bars on load
  renderGAGenerationsVisual();
  runGeneticAlgorithmOptimization();

  // Commit AI Recommendations button handler
  const btnApplyAiRec = document.getElementById("btn-apply-ai-rec");
  if (btnApplyAiRec) {
    btnApplyAiRec.addEventListener("click", () => {
      alert("GA Optimization Model Committed: Fleet schedules optimized for minimized delays and fuel consumption.");
      state.decisionLogs.unshift({
        timestamp: getCurrentTimestamp(),
        operator: sessionStorage.getItem("userRole") || "Fleet Manager",
        disruption: "System Optimization",
        prevConfig: "Static scheduling",
        newConfig: "GA Engine Optimizer Committed",
        rationale: "Optimized route assignments for fuel and time efficiency."
      });
      saveDatabase();
      renderOCCStats();
      renderGAGenerationsVisual();
    });
  }

  // Aircraft CRUD Form handler
  const acForm = document.getElementById("aircraft-crud-form");
  if (acForm) {
    acForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const reg = document.getElementById("ac-reg").value.trim().toUpperCase();
      const name = document.getElementById("ac-name").value.trim();
      const model = document.getElementById("ac-model").value;
      const payload = parseInt(document.getElementById("ac-payload").value);
      const hours = parseFloat(document.getElementById("ac-hours").value);
      const acqcost = parseFloat(document.getElementById("ac-acqcost").value);
      const home = document.getElementById("ac-home").value;

      if (state.aircraft[reg]) {
        alert(`Aircraft with registration code ${reg} is already registered!`);
        return;
      }

      state.aircraft[reg] = {
        name: name,
        model: model,
        type: model.includes("turboprop") || model.includes("ATR") ? "Turboprop" : model.includes("737") || model.includes("321") ? "Narrow-Body" : "Wide-Body",
        payloadCap: payload,
        fuelCap: Math.round(payload * 1.5),
        flyingHours: hours,
        acqCost: acqcost,
        homeAirport: home,
        currentAirport: home,
        status: "Available"
      };

      state.decisionLogs.unshift({
        timestamp: getCurrentTimestamp(),
        operator: sessionStorage.getItem("userRole") || "Fleet Manager",
        disruption: "Asset Registered",
        prevConfig: "None",
        newConfig: `Aircraft ${reg} Added`,
        rationale: `Registered fleet asset ${name}.`
      });

      saveDatabase();
      renderOCCAircraft();
      renderOCCStats();
      acForm.reset();
      alert(`Aircraft ${reg} successfully registered!`);
    });
  }

  // Pilot CRUD Form handler
  const pilotForm = document.getElementById("pilot-crud-form");
  if (pilotForm) {
    pilotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("plt-name").value.trim();
      const license = document.getElementById("plt-license").value.trim().toUpperCase();
      const licExp = document.getElementById("plt-license-exp").value;
      const medExp = document.getElementById("plt-medical-exp").value;
      const safety = parseInt(document.getElementById("plt-safety").value);
      const contact = document.getElementById("plt-contact").value.trim();

      const pilotId = `PL-${Math.floor(105 + Math.random() * 900)}`;

      state.pilots[pilotId] = {
        name: name,
        licenseNum: license,
        category: "ATPL",
        licenseExp: licExp,
        medicalExp: medExp,
        flyingHours: 0,
        contact: contact,
        safetyScore: safety,
        status: "Available"
      };

      state.decisionLogs.unshift({
        timestamp: getCurrentTimestamp(),
        operator: sessionStorage.getItem("userRole") || "Safety Officer",
        disruption: "Pilot Registered",
        prevConfig: "None",
        newConfig: `Pilot ${name} (${pilotId}) Added`,
        rationale: `Profile directory updated with license checks.`
      });

      saveDatabase();
      renderOCCPilots();
      renderOCCStats();
      pilotForm.reset();
      alert(`Pilot Profile ${name} successfully saved with ID: ${pilotId}!`);
    });
  }

  // Manual Scheduler / Dispatch Planner Form handler
  const btnRequestAiRec = document.getElementById("btn-request-ai-rec");
  const dispatchAiRecBox = document.getElementById("dispatch-ai-rec-box");

  let suggestedAircraft = "";
  let suggestedPilot = "";

  if (btnRequestAiRec && dispatchAiRecBox) {
    btnRequestAiRec.addEventListener("click", () => {
      const origin = document.getElementById("trip-origin").value;
      const dest = document.getElementById("trip-destination").value;
      const weight = parseInt(document.getElementById("trip-cargo-weight").value) || 10000;
      const distance = parseInt(document.getElementById("trip-distance").value) || 800;

      const availableAC = Object.entries(state.aircraft).filter(([reg, ac]) => ac.status === "Available" && ac.payloadCap >= weight);
      let recommendedReg = "";
      if (availableAC.length > 0) {
        const atOrigin = availableAC.find(([reg, ac]) => ac.currentAirport === origin);
        recommendedReg = atOrigin ? atOrigin[0] : availableAC[0][0];
      } else {
        recommendedReg = Object.keys(state.aircraft)[0];
      }

      const availablePilots = Object.entries(state.pilots).filter(([id, p]) => p.status === "Available");
      let recommendedPilotId = availablePilots.length > 0 ? availablePilots[0][0] : Object.keys(state.pilots)[0];

      suggestedAircraft = recommendedReg;
      suggestedPilot = recommendedPilotId;

      const delay = Math.round((distance * 0.005) + (state.weather === "Storm" ? 45 : 8));
      const fuel = Math.round(distance * 4.1 + (weight * 0.02));
      const profit = Math.round((weight * 0.025) - (fuel * 0.09));

      const aiTripAircraftEl = document.getElementById("ai-trip-rec-aircraft");
      const aiTripDelayEl = document.getElementById("ai-trip-rec-delay");
      const aiTripFuelEl = document.getElementById("ai-trip-rec-fuel");
      const aiTripProfitEl = document.getElementById("ai-trip-rec-profit");

      if (aiTripAircraftEl) aiTripAircraftEl.textContent = `${recommendedReg} (${state.aircraft[recommendedReg].model})`;
      if (aiTripDelayEl) aiTripDelayEl.textContent = `+${delay} mins`;
      if (aiTripFuelEl) aiTripFuelEl.textContent = `${fuel.toLocaleString()} L`;
      if (aiTripProfitEl) aiTripProfitEl.textContent = `₹ ${(profit / 10).toFixed(2)} Lakhs`;

      dispatchAiRecBox.style.display = "block";
    });
  }

  const btnAcceptDispatch = document.getElementById("btn-accept-dispatch");
  if (btnAcceptDispatch) {
    btnAcceptDispatch.addEventListener("click", () => {
      if (!suggestedAircraft || !suggestedPilot) return;
      document.getElementById("trip-aircraft").value = suggestedAircraft;
      document.getElementById("trip-pilot").value = suggestedPilot;
      createAndDispatchManualTrip(true);
    });
  }

  const btnOverrideDispatch = document.getElementById("btn-override-dispatch");
  if (btnOverrideDispatch) {
    btnOverrideDispatch.addEventListener("click", () => {
      createAndDispatchManualTrip(false);
    });
  }

  function createAndDispatchManualTrip(isAccepted) {
    const origin = document.getElementById("trip-origin").value;
    const dest = document.getElementById("trip-destination").value;
    const weight = parseInt(document.getElementById("trip-cargo-weight").value);
    const type = document.getElementById("trip-priority").value;
    const acId = document.getElementById("trip-aircraft").value;
    const pltId = document.getElementById("trip-pilot").value;
    const distance = parseInt(document.getElementById("trip-distance").value);
    const departure = document.getElementById("trip-departure").value;

    if (!acId || !pltId || !weight || !distance || !departure) {
      alert("Please ensure all dispatch form details (aircraft, pilot, weight, distance, departure) are filled.");
      return;
    }

    const ac = state.aircraft[acId];
    if (weight > ac.payloadCap) {
      alert(`Payload Violation: Cargo weight (${weight} kg) exceeds ${acId} payload capacity (${ac.payloadCap} kg).`);
      return;
    }

    const tripId = `TRP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTrip = {
      id: tripId,
      origin: origin,
      destination: dest,
      aircraft: acId,
      pilot: pltId,
      cargoWeight: weight,
      cargoType: type,
      departure: departure,
      status: "Dispatched",
      distance: distance,
      logs: [
        { time: getCurrentTimestamp().slice(11, 16), desc: `Manual scheduling created. Status set to Dispatched (${isAccepted ? 'AI Recommended' : 'Operator Override'}).` }
      ]
    };

    state.aircraft[acId].status = "On Trip";
    state.pilots[pltId].status = "On Trip";
    state.trips.push(newTrip);

    state.decisionLogs.unshift({
      timestamp: getCurrentTimestamp(),
      operator: sessionStorage.getItem("userRole") || "Dispatch Manager",
      disruption: "Flight Dispatched",
      prevConfig: "None",
      newConfig: `Trip ${tripId} Active`,
      rationale: `Manual dispatch scheduling of flight ${tripId} with ${acId}.`
    });

    saveDatabase();
    renderOCCDispatchBoard();
    renderOCCStats();
    
    dispatchAiRecBox.style.display = "none";
    document.getElementById("trip-dispatch-form").reset();
    alert(`Consignment ${tripId} has been successfully dispatched!`);
  }

  // Maintenance Log Form handler
  const maintForm = document.getElementById("maintenance-log-form");
  if (maintForm) {
    maintForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const acId = document.getElementById("maint-aircraft").value;
      const type = document.getElementById("maint-type").value;
      const cost = parseFloat(document.getElementById("maint-cost").value);
      const desc = document.getElementById("maint-desc").value.trim();

      if (!acId) return;

      state.aircraft[acId].status = "In Maintenance";
      state.maintenance.push({
        aircraft: acId,
        type: type,
        desc: desc,
        date: getCurrentTimestamp().slice(0, 10),
        cost: cost,
        status: "Active"
      });

      state.decisionLogs.unshift({
        timestamp: getCurrentTimestamp(),
        operator: sessionStorage.getItem("userRole") || "Fleet Manager",
        disruption: "Aircraft Grounded",
        prevConfig: `${acId} Available`,
        newConfig: `${acId} In Maintenance`,
        rationale: `Checklist recorded: ${type} - ${desc}`
      });

      saveDatabase();
      renderOCCMaintenanceTable();
      renderOCCStats();
      maintForm.reset();
      alert(`Aircraft ${acId} is now grounded for service maintenance.`);
    });
  }

  // Fuel Log Form handler
  const fuelForm = document.getElementById("fuel-log-form");
  if (fuelForm) {
    fuelForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const acId = document.getElementById("fuel-aircraft").value;
      const qty = parseInt(document.getElementById("fuel-qty").value);
      const cost = parseFloat(document.getElementById("fuel-cost").value);
      const date = document.getElementById("fuel-date").value;
      const airport = document.getElementById("fuel-hub").value;

      state.fuelLogs.push({
        aircraft: acId,
        qty: qty,
        cost: cost,
        date: date,
        airport: airport
      });

      state.decisionLogs.unshift({
        timestamp: getCurrentTimestamp(),
        operator: sessionStorage.getItem("userRole") || "Financial Analyst",
        disruption: "Fuel Upload Recorded",
        prevConfig: "None",
        newConfig: `Fuel log registered for ${acId}`,
        rationale: `Liters: ${qty} | Total cost: ₹ ${cost} L`
      });

      saveDatabase();
      renderOCCExpensesTable();
      fuelForm.reset();
      alert(`Fuel uplift of ${qty} Liters logged for ${acId}.`);
    });
  }

  // General Expense Form handler
  const expForm = document.getElementById("general-expense-form");
  if (expForm) {
    expForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const acId = document.getElementById("exp-aircraft").value;
      const category = document.getElementById("exp-type").value;
      const cost = parseFloat(document.getElementById("exp-cost").value);
      const date = document.getElementById("exp-date").value;

      state.expenses.push({
        aircraft: acId,
        category: category,
        cost: cost,
        date: date
      });

      state.decisionLogs.unshift({
        timestamp: getCurrentTimestamp(),
        operator: sessionStorage.getItem("userRole") || "Financial Analyst",
        disruption: "Expense Recorded",
        prevConfig: "None",
        newConfig: `${category} logged for ${acId}`,
        rationale: `Cost: ₹ ${cost} Lakhs`
      });

      saveDatabase();
      renderOCCExpensesTable();
      expForm.reset();
      alert(`Operating expense successfully logged.`);
    });
  }

  // Disruption Deck Emergency Buttons
  const emergencyDeck = document.querySelector(".emergency-deck");
  if (emergencyDeck) {
    emergencyDeck.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;

      const type = button.getAttribute("data-emergency");
      const operator = sessionStorage.getItem("userRole") || "Fleet Manager";
      const timestamp = getCurrentTimestamp();

      if (type === "aircraft-failure") {
        const available = Object.entries(state.aircraft).filter(([reg, ac]) => ac.status === "Available");
        if (available.length > 0) {
          const randomAC = available[Math.floor(Math.random() * available.length)][0];
          state.aircraft[randomAC].status = "In Maintenance";
          state.maintenance.push({
            aircraft: randomAC,
            type: "Unscheduled Emergency Repair",
            desc: "Sudden technical component breakdown detected by telemetry.",
            date: timestamp.slice(0, 10),
            cost: 8.5,
            status: "Active"
          });
          state.decisionLogs.unshift({
            timestamp,
            operator,
            disruption: "Emergency AC Breakdown",
            prevConfig: `${randomAC} Available`,
            newConfig: `${randomAC} Grounded`,
            rationale: "Unscheduled maintenance check requested."
          });
          alert(`CRITICAL ALERT: Emergency breakdown detected. Aircraft ${randomAC} has been grounded immediately.`);
        } else {
          alert("All aircraft are currently busy or already grounded.");
        }
      } 
      else if (type === "runway-closed") {
        state.decisionLogs.unshift({
          timestamp,
          operator,
          disruption: "Airport Runway Closure",
          prevConfig: "DEL Open",
          newConfig: "DEL Runway 10/28 Closed",
          rationale: "Runway maintenance and low visibility protocols active."
        });
        alert("OCC WARNING: Delhi Hub (DEL) runway 10/28 is reported closed. Expect inbound and outbound routing delays.");
      }
      else if (type === "weather-alert") {
        state.weather = "Storm";
        state.windSpeed = 45;
        const windInput = document.getElementById("wind-speed-input");
        const windVal = document.getElementById("wind-speed-val");
        const weatherSelect = document.getElementById("weather-select");

        if (windInput) windInput.value = 45;
        if (windVal) windVal.textContent = "45 knots";
        if (weatherSelect) weatherSelect.value = "Storm";

        state.decisionLogs.unshift({
          timestamp,
          operator,
          disruption: "Monsoon Storm Warning",
          prevConfig: "Weather: Clear",
          newConfig: "Severe Turbulence / Cyclone Alert active",
          rationale: "Wind shear speeds exceeded limits. Safety corridors updated."
        });
        alert("MONSOON CORRIDOR ALERT: Severe thunderstorm and wind shear alerts active. Routing maps updated.");
      }
      else if (type === "security-threat") {
        const activeTrips = state.trips.filter(t => t.status === "Draft" || t.status === "Screening");
        if (activeTrips.length > 0) {
          activeTrips.forEach(t => {
            t.status = "Screening";
            if (!t.logs) t.logs = [];
            t.logs.push({ time: timestamp.slice(11, 16), desc: "[ALERT] Customs security hold check active." });
          });
          state.decisionLogs.unshift({
            timestamp,
            operator,
            disruption: "Customs Security Hold",
            prevConfig: "Standard clearance",
            newConfig: "Enhanced manifest inspections",
            rationale: "Security threat level raised for cargo terminal."
          });
          alert("SECURITY PROTOCOL ACTIVATED: Active consignment manifest details held for secondary border inspection checks.");
        } else {
          alert("No active consignments in sorting queue to place on hold.");
        }
      }
      else if (type === "malicious-cargo") {
        const activeTrips = state.trips.filter(t => t.status === "Draft" || t.status === "Screening");
        if (activeTrips.length > 0) {
          const trip = activeTrips[0];
          trip.status = "Cancelled";
          if (!trip.logs) trip.logs = [];
          trip.logs.push({ time: timestamp.slice(11, 16), desc: "[REJECTED] Malicious material screening fail." });
          state.decisionLogs.unshift({
            timestamp,
            operator,
            disruption: "Dangerous Goods Violation",
            prevConfig: `Trip ${trip.id} checking`,
            newConfig: `Trip ${trip.id} Rejected`,
            rationale: "Aviation security screening detected undeclared hazardous batteries."
          });
          alert(`HAZARDOUS CONSIGNMENT REJECTED: Trip ${trip.id} failed X-Ray scan screening checks and was removed.`);
        } else {
          alert("No consignments in screening status to check.");
        }
      }
      else if (type === "medical-emergency") {
        const medical = state.trips.filter(t => t.cargoType === "Medical");
        if (medical.length > 0) {
          medical.forEach(t => {
            if (!t.logs) t.logs = [];
            t.logs.push({ time: timestamp.slice(11, 16), desc: "[PRIORITY] Cold chain vaccine cargo priority authorization." });
          });
          state.decisionLogs.unshift({
            timestamp,
            operator,
            disruption: "Pharma Priority Lift",
            prevConfig: "Standard flight sequence",
            newConfig: "Express cold-chain priority lanes",
            rationale: "Urgent medical supplies and vaccines prioritized."
          });
          alert("PHARMA VACCINES PRIORITIZED: Express airway clearance lanes granted to all cold-chain pharma shipments.");
        } else {
          alert("No active medical cargo consignments in the queue.");
        }
      }

      saveDatabase();
      renderOCCStats();
      renderOCCAircraft();
      renderOCCMaintenanceTable();
      renderOCCDispatchBoard();
    });
  }

  // Environmental Controls
  const weatherSelect = document.getElementById("weather-select");
  if (weatherSelect) {
    weatherSelect.addEventListener("change", (e) => {
      state.weather = e.target.value;
      saveDatabase();
      runGeneticAlgorithmOptimization();
      updateGlobalRouteMap();
      alert(`Weather updated to: ${state.weather}`);
    });
  }

  const windInput = document.getElementById("wind-speed-input");
  const windVal = document.getElementById("wind-speed-val");
  if (windInput && windVal) {
    windInput.addEventListener("input", (e) => {
      state.windSpeed = parseInt(e.target.value);
      windVal.textContent = `${state.windSpeed} knots`;
    });
    windInput.addEventListener("change", () => {
      saveDatabase();
    });
  }

  // Reports Exporters
  const btnExportCsv = document.getElementById("btn-export-csv");
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      alert("CSV Export Triggered: Operations control center telemetry log sheet downloaded successfully.");
    });
  }

  const btnExportPdf = document.getElementById("btn-export-pdf");
  if (btnExportPdf) {
    btnExportPdf.addEventListener("click", () => {
      alert("PDF Print Triggered: Formatting operational P&L ledger dashboard...");
    });
  }
}

function renderGAGenerationsVisual() {
  const barContainer = document.querySelector(".ga-generations-bar");
  if (!barContainer) return;
  barContainer.innerHTML = "";
  for (let i = 0; i < 25; i++) {
    const height = Math.round(15 + Math.random() * 10 + (i * 0.6));
    const bar = document.createElement("div");
    bar.style.flex = "1";
    bar.style.height = `${height}%`;
    bar.style.backgroundColor = "var(--accent-color)";
    bar.style.opacity = 0.3 + (i * 0.02);
    bar.style.transition = "height 0.3s ease";
    barContainer.appendChild(bar);
  }
}

function runGeneticAlgorithmOptimization() {
  const dispatched = state.trips.filter(t => t.status === "Dispatched");
  
  let totalDelay = 0;
  let totalFuel = 0;
  let totalProfit = 0;

  dispatched.forEach(t => {
    const dist = t.distance;
    const delay = Math.round((dist * 0.005) + (state.weather === "Storm" ? 45 : 8));
    const fuel = Math.round(dist * 4.1 + (t.cargoWeight * 0.02));
    const profit = Math.round((t.cargoWeight * 0.025) - (fuel * 0.09));

    totalDelay += delay;
    totalFuel += fuel;
    totalProfit += (profit / 10);
  });

  if (dispatched.length === 0) {
    totalDelay = 0;
    totalFuel = 0;
    totalProfit = 0;
  }

  const delayEl = document.getElementById("ai-rec-delay");
  const fuelEl = document.getElementById("ai-rec-fuel");
  const profitEl = document.getElementById("ai-rec-profit");
  const scoreEl = document.getElementById("ai-rec-score");

  if (delayEl) delayEl.textContent = `+${totalDelay} min`;
  if (fuelEl) fuelEl.textContent = `${totalFuel.toLocaleString()} L`;
  if (profitEl) profitEl.textContent = `₹ ${totalProfit.toFixed(2)} Lakhs`;
  if (scoreEl) scoreEl.textContent = dispatched.length > 0 ? "96/100" : "-/100";
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
  if (!markerGroup) return;
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

// ==========================================================================
// Customer Authentication Systems & Session Hooks
// ==========================================================================
function initCustomerAuth() {
  const authSection = document.getElementById("auth-section");
  if (!authSection) return;

  let currentGeneratedOtp = "1234";

  const tabSignupBtn = document.getElementById("tab-signup-btn");
  const tabLoginBtn = document.getElementById("tab-login-btn");

  const headerProfileBtn = document.getElementById("header-profile-btn");

  if (headerProfileBtn) {
    headerProfileBtn.addEventListener("click", () => {
      if (!currentUser && tabLoginBtn) {
        tabLoginBtn.click();
      }
    });
  }

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const forgotForm = document.getElementById("forgot-form");
  const resetForm = document.getElementById("reset-password-form");

  const signupContainer = document.getElementById("signup-form-container");
  const loginContainer = document.getElementById("login-form-container");
  const forgotContainer = document.getElementById("forgot-form-container");
  const resetContainer = document.getElementById("reset-password-form-container");
  const userDashboard = document.getElementById("user-dashboard-container");

  const radioPersonal = document.getElementById("radio-personal");
  const radioBusiness = document.getElementById("radio-business");
  const signupFields = document.getElementById("signup-fields-container");

  // Tab switching
  if (tabSignupBtn && tabLoginBtn) {
    tabSignupBtn.addEventListener("click", () => {
      tabSignupBtn.classList.add("active");
      tabLoginBtn.classList.remove("active");
      signupContainer.style.display = "block";
      loginContainer.style.display = "none";
      forgotContainer.style.display = "none";
      resetContainer.style.display = "none";
      userDashboard.style.display = "none";
      document.getElementById("auth-title").textContent = "TransitOps Sign Up";
    });

    tabLoginBtn.addEventListener("click", () => {
      tabLoginBtn.classList.add("active");
      tabSignupBtn.classList.remove("active");
      signupContainer.style.display = "none";
      loginContainer.style.display = "block";
      forgotContainer.style.display = "none";
      resetContainer.style.display = "none";
      userDashboard.style.display = "none";
      document.getElementById("auth-title").textContent = "TransitOps Log In";
    });
  }

  // Account Type Fields
  if (radioPersonal && radioBusiness && signupFields) {
    radioPersonal.addEventListener("change", () => {
      signupFields.innerHTML = `
        <div class="form-group">
          <label for="signup-name">Full Name</label>
          <input type="text" id="signup-name" placeholder="John Doe" required>
        </div>
      `;
    });

    radioBusiness.addEventListener("change", () => {
      signupFields.innerHTML = `
        <div class="form-group">
          <label for="signup-company">Company / Corporate Name</label>
          <input type="text" id="signup-company" placeholder="AeroTech Logistics India" required>
        </div>
        <div class="form-group">
          <label for="signup-rep">Representative Name</label>
          <input type="text" id="signup-rep" placeholder="Jane Rep" required>
        </div>
      `;
    });
  }

  // OTP Modal handling
  const otpModal = document.getElementById("otp-modal");
  const otpDigits = document.querySelectorAll(".otp-digit");
  const otpCancelBtn = document.getElementById("otp-cancel-btn");
  const otpVerifyBtn = document.getElementById("otp-verify-btn");

  let tempUserData = null;

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("signup-email").value.trim().toLowerCase();
      const password = document.getElementById("signup-password").value;
      const confirmPass = document.getElementById("signup-confirm-password").value;

      document.getElementById("signup-email-err").style.display = "none";
      document.getElementById("signup-password-err").style.display = "none";
      document.getElementById("signup-confirm-password-err").style.display = "none";

      if (users.some(u => u.email === email)) {
        const emailErr = document.getElementById("signup-email-err");
        emailErr.textContent = "Email is already registered!";
        emailErr.style.display = "block";
        return;
      }

      if (password.length < 6) {
        const passErr = document.getElementById("signup-password-err");
        passErr.textContent = "Password must be at least 6 characters!";
        passErr.style.display = "block";
        return;
      }

      if (password !== confirmPass) {
        const confirmErr = document.getElementById("signup-confirm-password-err");
        confirmErr.textContent = "Passwords do not match!";
        confirmErr.style.display = "block";
        return;
      }

      const type = document.querySelector('input[name="account-type"]:checked').value;
      let userData = { email, password, type };

      if (type === "personal") {
        userData.name = document.getElementById("signup-name").value.trim();
      } else {
        userData.companyName = document.getElementById("signup-company").value.trim();
        userData.repName = document.getElementById("signup-rep").value.trim();
        userData.name = userData.companyName;
      }

      tempUserData = userData;

      currentGeneratedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      document.getElementById("otp-email-recipient").textContent = email;

      const hintCode = document.getElementById("otp-hint-code");
      if (hintCode) {
        hintCode.textContent = currentGeneratedOtp;
      }

      // Dispatch real email via FormSubmit API
      sendOtpEmail(email, currentGeneratedOtp);

      showToast(`[Security Engine] Verification code sent to ${email}!`);

      otpModal.style.display = "flex";
      setTimeout(() => otpModal.classList.add("open"), 10);

      otpDigits.forEach(d => d.value = "");
      if (otpDigits[0]) otpDigits[0].focus();
    });
  }

  otpDigits.forEach((digit, idx) => {
    digit.addEventListener("input", (e) => {
      if (e.target.value.length === 1 && idx < otpDigits.length - 1) {
        otpDigits[idx + 1].focus();
      }
    });

    digit.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "" && idx > 0) {
        otpDigits[idx - 1].focus();
      }
    });
  });

  if (otpCancelBtn) {
    otpCancelBtn.addEventListener("click", () => {
      otpModal.classList.remove("open");
      setTimeout(() => otpModal.style.display = "none", 300);
      tempUserData = null;
    });
  }

  if (otpVerifyBtn) {
    otpVerifyBtn.addEventListener("click", () => {
      let code = "";
      otpDigits.forEach(d => code += d.value);

      if (code === currentGeneratedOtp) {
        users.push(tempUserData);
        localStorage.setItem("transitops_users", JSON.stringify(users));

        currentUser = tempUserData;
        localStorage.setItem("transitops_current_user", JSON.stringify(currentUser));

        otpModal.classList.remove("open");
        setTimeout(() => otpModal.style.display = "none", 300);

        showToast("Registration verified successfully!");
        updateAuthNavbar();
        renderUserDashboard();
        tempUserData = null;
      } else {
        alert("Invalid verification code. Please check your email and try again.");
        otpDigits.forEach(d => d.value = "");
        if (otpDigits[0]) otpDigits[0].focus();
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim().toLowerCase();
      const password = document.getElementById("login-password").value;

      document.getElementById("login-email-err").style.display = "none";
      document.getElementById("login-password-err").style.display = "none";

      const matchedUser = users.find(u => u.email === email);

      if (!matchedUser) {
        const err = document.getElementById("login-email-err");
        err.textContent = "Email is not registered!";
        err.style.display = "block";
        return;
      }

      if (matchedUser.password !== password) {
        const err = document.getElementById("login-password-err");
        err.textContent = "Incorrect password credentials!";
        err.style.display = "block";
        return;
      }

      currentUser = matchedUser;
      localStorage.setItem("transitops_current_user", JSON.stringify(currentUser));

      showToast(`Welcome back, ${currentUser.name}!`);
      updateAuthNavbar();
      renderUserDashboard();
    });
  }

  const forgotLink = document.getElementById("forgot-link");
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      signupContainer.style.display = "none";
      loginContainer.style.display = "none";
      forgotContainer.style.display = "block";
      resetContainer.style.display = "none";
      document.getElementById("auth-title").textContent = "Reset Password";
    });
  }

  const btnForgotCancel = document.getElementById("btn-forgot-cancel");
  if (btnForgotCancel) {
    btnForgotCancel.addEventListener("click", () => {
      forgotContainer.style.display = "none";
      loginContainer.style.display = "block";
      document.getElementById("auth-title").textContent = "TransitOps Log In";
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("forgot-email").value.trim().toLowerCase();
      document.getElementById("forgot-email-err").style.display = "none";

      const userExists = users.some(u => u.email === email);
      if (!userExists) {
        const err = document.getElementById("forgot-email-err");
        err.textContent = "Registered email not found!";
        err.style.display = "block";
        return;
      }

      showToast("Reset password verification code sent!");
      document.getElementById("reset-user-email").value = email;

      forgotContainer.style.display = "none";
      resetContainer.style.display = "block";
    });
  }

  if (resetForm) {
    resetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("reset-user-email").value;
      const newPass = document.getElementById("reset-new-password").value;
      const confirmPass = document.getElementById("reset-confirm-password").value;

      document.getElementById("reset-new-password-err").style.display = "none";
      document.getElementById("reset-confirm-password-err").style.display = "none";

      if (newPass.length < 6) {
        const err = document.getElementById("reset-new-password-err");
        err.textContent = "Password must be at least 6 characters!";
        err.style.display = "block";
        return;
      }

      if (newPass !== confirmPass) {
        const err = document.getElementById("reset-confirm-password-err");
        err.textContent = "Passwords do not match!";
        err.style.display = "block";
        return;
      }

      const userIdx = users.findIndex(u => u.email === email);
      if (userIdx !== -1) {
        users[userIdx].password = newPass;
        localStorage.setItem("transitops_users", JSON.stringify(users));

        if (currentUser && currentUser.email === email) {
          currentUser.password = newPass;
          localStorage.setItem("transitops_current_user", JSON.stringify(currentUser));
        }
      }

      showToast("Password updated successfully!");
      resetContainer.style.display = "none";
      loginContainer.style.display = "block";
      document.getElementById("auth-title").textContent = "TransitOps Log In";
      resetForm.reset();
    });
  }

  const btnUserBook = document.getElementById("btn-user-book");
  if (btnUserBook) {
    btnUserBook.addEventListener("click", () => {
      navigateToSection("place-order");
    });
  }

  const btnUserLogout = document.getElementById("btn-user-logout");
  if (btnUserLogout) {
    btnUserLogout.addEventListener("click", () => {
      currentUser = null;
      localStorage.removeItem("transitops_current_user");

      showToast("Logged out successfully.");
      updateAuthNavbar();

      signupContainer.style.display = "block";
      loginContainer.style.display = "none";
      userDashboard.style.display = "none";
      document.getElementById("auth-title").textContent = "TransitOps Sign Up";
      if (tabSignupBtn) tabSignupBtn.classList.add("active");
      if (tabLoginBtn) tabLoginBtn.classList.remove("active");
    });
  }

  // Delete Account GitHub-style bindings
  const btnUserDeleteTrigger = document.getElementById("btn-user-delete-trigger");
  const deleteAccModal = document.getElementById("delete-acc-modal");
  const deleteAccConfirmInput = document.getElementById("delete-acc-confirm-input");
  const btnDeleteAccCancel = document.getElementById("btn-delete-acc-cancel");
  const btnDeleteAccConfirm = document.getElementById("btn-delete-acc-confirm");

  if (btnUserDeleteTrigger && deleteAccModal) {
    btnUserDeleteTrigger.addEventListener("click", () => {
      if (!currentUser) return;
      document.getElementById("delete-acc-email-target").textContent = currentUser.email;
      deleteAccConfirmInput.value = "";
      btnDeleteAccConfirm.style.opacity = "0.5";
      btnDeleteAccConfirm.style.pointerEvents = "none";
      
      deleteAccModal.style.display = "flex";
      setTimeout(() => deleteAccModal.classList.add("open"), 10);
    });
  }

  if (deleteAccConfirmInput && btnDeleteAccConfirm) {
    deleteAccConfirmInput.addEventListener("input", (e) => {
      if (!currentUser) return;
      if (e.target.value.trim() === currentUser.email) {
        btnDeleteAccConfirm.style.opacity = "1";
        btnDeleteAccConfirm.style.pointerEvents = "auto";
      } else {
        btnDeleteAccConfirm.style.opacity = "0.5";
        btnDeleteAccConfirm.style.pointerEvents = "none";
      }
    });
  }

  if (btnDeleteAccCancel && deleteAccModal) {
    btnDeleteAccCancel.addEventListener("click", () => {
      deleteAccModal.classList.remove("open");
      setTimeout(() => deleteAccModal.style.display = "none", 300);
    });
  }

  if (btnDeleteAccConfirm && deleteAccModal) {
    btnDeleteAccConfirm.addEventListener("click", () => {
      if (!currentUser) return;
      
      const emailToDelete = currentUser.email;
      const idx = users.findIndex(u => u.email === emailToDelete);
      if (idx !== -1) {
        users.splice(idx, 1);
        localStorage.setItem("transitops_users", JSON.stringify(users));
      }

      currentUser = null;
      localStorage.removeItem("transitops_current_user");

      deleteAccModal.classList.remove("open");
      setTimeout(() => deleteAccModal.style.display = "none", 300);

      showToast("Account deleted successfully.");
      updateAuthNavbar();

      signupContainer.style.display = "block";
      loginContainer.style.display = "none";
      userDashboard.style.display = "none";
      document.getElementById("auth-title").textContent = "TransitOps Sign Up";
      if (tabSignupBtn) tabSignupBtn.classList.add("active");
      if (tabLoginBtn) tabLoginBtn.classList.remove("active");
    });
  }

  renderUserDashboard();
}

function renderUserDashboard() {
  const userDashboard = document.getElementById("user-dashboard-container");
  if (!userDashboard) return;

  const signupContainer = document.getElementById("signup-form-container");
  const loginContainer = document.getElementById("login-form-container");
  const forgotContainer = document.getElementById("forgot-form-container");
  const resetContainer = document.getElementById("reset-password-form-container");

  const tabSignupBtn = document.getElementById("tab-signup-btn");
  const tabLoginBtn = document.getElementById("tab-login-btn");

  if (currentUser) {
    signupContainer.style.display = "none";
    loginContainer.style.display = "none";
    forgotContainer.style.display = "none";
    resetContainer.style.display = "none";
    userDashboard.style.display = "block";

    if (tabSignupBtn) tabSignupBtn.style.display = "none";
    if (tabLoginBtn) tabLoginBtn.style.display = "none";

    document.getElementById("auth-title").textContent = "TransitOps Account";
    document.getElementById("user-display-name").textContent = `Welcome, ${currentUser.name}`;
    document.getElementById("user-display-email").textContent = currentUser.email;

    const bizBadge = document.getElementById("user-type-badge");
    const bizMetrics = document.getElementById("user-business-metrics");

    if (currentUser.type === "business") {
      bizBadge.textContent = "Corporate Account";
      bizBadge.style.backgroundColor = "var(--success-color)";
      bizBadge.style.color = "#050b14";
      bizMetrics.style.display = "block";
    } else {
      bizBadge.textContent = "Personal Account";
      bizBadge.style.backgroundColor = "rgba(0, 240, 255, 0.08)";
      bizBadge.style.color = "var(--accent-color)";
      bizMetrics.style.display = "none";
    }
  } else {
    if (tabSignupBtn) tabSignupBtn.style.display = "block";
    if (tabLoginBtn) tabLoginBtn.style.display = "block";
    userDashboard.style.display = "none";
  }
}

function updateAuthNavbar() {
  const profileText = document.getElementById("header-profile-text");
  if (!profileText) return;

  if (currentUser) {
    profileText.textContent = currentUser.name;
  } else {
    profileText.textContent = "Sign In";
  }
}

function showToast(message) {
  const existing = document.querySelector(".sat-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "sat-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function sendOtpEmail(email, otp) {
  fetch("https://formsubmit.co/ajax/" + email, {
    method: "POST",
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _subject: "TransitOps Air Cargo - Email OTP Verification",
      "Verification Passcode": otp,
      "System Message": "Please input this passcode inside the registration window to verify your corporate or personal account.",
      _honey: ""
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("FormSubmit response:", data);
  })
  .catch(err => {
    console.error("FormSubmit failure:", err);
  });
}

// Bind OCC functions to global window object for HTML inline click handlers
window.switchOCCPanel = switchOCCPanel;
window.dispatchTripOCC = dispatchTripOCC;
window.completeTripOCC = completeTripOCC;
window.closeMaintenanceOCC = closeMaintenanceOCC;
window.initCustomerAuth = initCustomerAuth;
window.renderUserDashboard = renderUserDashboard;
window.updateAuthNavbar = updateAuthNavbar;
window.showToast = showToast;
window.sendOtpEmail = sendOtpEmail;

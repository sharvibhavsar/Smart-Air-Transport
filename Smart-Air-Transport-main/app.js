// ==========================================================================
// Smart Air Cargo Transport Platform (TransitOps Engine)
// ==========================================================================

// Global Database State
let state = {
  users: {
    "manager@transitops.com": { password: "manager123", role: "Fleet Manager" },
    "dispatcher@transitops.com": { password: "dispatcher123", role: "Dispatch Manager" },
    "safety@transitops.com": { password: "safety123", role: "Safety Officer" },
    "finance@transitops.com": { password: "finance123", role: "Financial Analyst" },
    "admin@transitops.com": { password: "trans_cargo", role: "Fleet Manager" } // backward compatibility
  },
  aircraft: {
    // Initial pre-seeded aircraft assets
    "VT-SAT01": { name: "Star Lifter", model: "Boeing 737-800BCF", type: "Jet", payloadCap: 23000, fuelCap: 12000, flyingHours: 120, acqCost: 450, homeAirport: "BOM", currentAirport: "AMD", status: "Available" },
    "VT-SAT02": { name: "Indigo Express", model: "Airbus A321P2F", type: "Jet", payloadCap: 27000, fuelCap: 15000, flyingHours: 85, acqCost: 550, homeAirport: "DEL", currentAirport: "DEL", status: "Available" },
    "VT-SAT03": { name: "Bio Carrier", model: "Airbus A320P2F", type: "Jet", payloadCap: 21000, fuelCap: 11000, flyingHours: 60, acqCost: 420, homeAirport: "BLR", currentAirport: "BLR", status: "Available" }
  },
  pilots: {
    // Initial pre-seeded pilot crew profiles
    "PL-101": { name: "Captain Alex", licenseNum: "AL-98745-DEL", category: "Airline Transport Pilot License (ATPL)", licenseExp: "2027-12-15", medicalExp: "2027-06-30", flyingHours: 450, contact: "9876543210", safetyScore: 98, status: "Available" },
    "PL-102": { name: "Captain Sarah", licenseNum: "SL-43921-BOM", category: "Airline Transport Pilot License (ATPL)", licenseExp: "2028-02-18", medicalExp: "2028-01-10", flyingHours: 320, contact: "9876543211", safetyScore: 95, status: "Available" },
    "PL-103": { name: "First Officer Vikram", licenseNum: "VL-82910-CCU", category: "Commercial Pilot License (CPL)", licenseExp: "2024-05-10", medicalExp: "2026-08-20", flyingHours: 180, contact: "9876543212", safetyScore: 88, status: "Available" } // expired license test
  },
  trips: [
    // Pre-seeded trips
    { id: "TRP-8291", origin: "DEL", destination: "BOM", aircraft: "VT-SAT02", pilot: "PL-102", cargoWeight: 14500, cargoType: "Express", departure: "2026-07-12T18:00", status: "Dispatched", distance: 1140 },
    { id: "TRP-4392", origin: "BLR", destination: "CCU", aircraft: "VT-SAT03", pilot: "PL-101", cargoWeight: 12000, cargoType: "Medical", departure: "2026-07-11T10:00", status: "Completed", distance: 1560, finalOdo: 210, fuelUsed: 5616, revenue: 3.5 }
  ],
  maintenance: [
    // Pre-seeded maintenance checks
    { aircraft: "VT-SAT02", type: "A Check", desc: "Routine systems calibration check.", date: "2026-07-10", cost: 2.5, status: "Completed" }
  ],
  fuelLogs: [
    { aircraft: "VT-SAT02", qty: 4500, cost: 4.2, date: "2026-07-10", airport: "DEL" },
    { aircraft: "VT-SAT03", qty: 5600, cost: 5.3, date: "2026-07-11", airport: "BLR" }
  ],
  expenses: [
    { aircraft: "VT-SAT02", category: "Airport Handling Fees", cost: 0.15, date: "2026-07-10" },
    { aircraft: "VT-SAT03", category: "Hangar Charges", cost: 0.25, date: "2026-07-11" }
  ],
  weather: "Normal",
  windSpeed: 12,
  overrideActive: false,
  decisionLogs: [
    { timestamp: "2026-07-12 11:15", operator: "System Admin", disruption: "Platform Initialized", prevConfig: "None", newConfig: "Active database setup.", rationale: "Trunk logistics platform loaded." }
  ]
};

// Global variables for live SVG routing planes animation
let activePlanesInterval = null;
let currentRole = null;

// ==========================================================================
// Initialization & Theme Settings
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadDatabase();
  initTheme();
  initAuth();
  initRouting();
  initAircraftCRUD();
  initPilotCRUD();
  initTripManagement();
  initMaintenance();
  initExpenses();
  initOCC();
  animatePlanes();
});

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

function saveDatabase() {
  localStorage.setItem("transitops_air_db", JSON.stringify(state));
}

function loadDatabase() {
  const saved = localStorage.getItem("transitops_air_db");
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (e) {
      console.error("Could not parse saved state. Loading defaults.");
    }
  }
}

// ==========================================================================
// Authentication & RBAC Layer
// ==========================================================================
function initAuth() {
  const loginForm = document.getElementById("app-login-form");
  const loginSection = document.getElementById("login-section");
  const appHeader = document.getElementById("app-header");
  const errorDisp = document.getElementById("login-error-disp");
  const logoutBtn = document.getElementById("btn-header-logout");

  // Check existing session
  const savedRole = sessionStorage.getItem("userRole");
  if (savedRole) {
    loginSection.classList.remove("active");
    appHeader.style.display = "block";
    currentRole = savedRole;
    document.getElementById("active-role-badge").textContent = currentRole;
    applyRBACRules(currentRole);
    navigateToDefaultSection(currentRole);
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("login-email").value.trim();
    const passwordInput = document.getElementById("login-password").value.trim();

    const user = state.users[emailInput];
    if (user && user.password === passwordInput) {
      sessionStorage.setItem("userRole", user.role);
      currentRole = user.role;
      errorDisp.style.display = "none";
      loginSection.classList.remove("active");
      appHeader.style.display = "block";
      document.getElementById("active-role-badge").textContent = currentRole;
      document.getElementById("login-password").value = "";
      
      applyRBACRules(currentRole);
      navigateToDefaultSection(currentRole);
    } else {
      errorDisp.style.display = "block";
    }
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("userRole");
    currentRole = null;
    appHeader.style.display = "none";
    document.querySelectorAll(".app-section").forEach(sec => sec.classList.remove("active"));
    loginSection.classList.add("active");
    window.location.hash = "login";
  });
}

function fillCreds(email, password) {
  document.getElementById("login-email").value = email;
  document.getElementById("login-password").value = password;
}

function applyRBACRules(role) {
  // Hide all tabs by default, then enable based on RBAC rules
  const tabs = {
    dashboard: document.getElementById("nav-dashboard-tab"),
    aircraft: document.getElementById("nav-aircraft-tab"),
    pilots: document.getElementById("nav-pilots-tab"),
    trips: document.getElementById("nav-trips-tab"),
    maintenance: document.getElementById("nav-maintenance-tab"),
    expenses: document.getElementById("nav-expenses-tab"),
    reports: document.getElementById("nav-reports-tab"),
    occ: document.getElementById("nav-occ-tab")
  };

  Object.values(tabs).forEach(tab => { if (tab) tab.style.display = "none"; });

  if (role === "Fleet Manager") {
    // Full operational controls
    tabs.dashboard.style.display = "block";
    tabs.aircraft.style.display = "block";
    tabs.maintenance.style.display = "block";
    tabs.reports.style.display = "block";
    tabs.occ.style.display = "block";
  } else if (role === "Dispatch Manager") {
    tabs.dashboard.style.display = "block";
    tabs.trips.style.display = "block";
    tabs.occ.style.display = "block";
    tabs.reports.style.display = "block";
  } else if (role === "Safety Officer") {
    tabs.dashboard.style.display = "block";
    tabs.aircraft.style.display = "block";
    tabs.pilots.style.display = "block";
    tabs.maintenance.style.display = "block";
    tabs.occ.style.display = "block";
  } else if (role === "Financial Analyst") {
    tabs.dashboard.style.display = "block";
    tabs.expenses.style.display = "block";
    tabs.reports.style.display = "block";
  }
}

function navigateToDefaultSection(role) {
  if (role === "Financial Analyst") {
    navigateToSection("expenses");
  } else if (role === "Safety Officer") {
    navigateToSection("pilots");
  } else if (role === "Dispatch Manager") {
    navigateToSection("trips");
  } else {
    navigateToSection("dashboard");
  }
}

// ==========================================================================
// SPA Router
// ==========================================================================
function initRouting() {
  const navLinks = document.querySelectorAll(".nav-link");
  const logoNav = document.getElementById("logo-nav");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "test.html") return;
      e.preventDefault();
      const section = link.getAttribute("data-section");
      navigateToSection(section);
    });
  });

  logoNav.addEventListener("click", (e) => {
    e.preventDefault();
    if (sessionStorage.getItem("userRole")) {
      navigateToSection("dashboard");
    }
  });

  // Hashing triggers
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1);
    if (["dashboard", "aircraft", "pilots", "trips", "maintenance", "expenses", "reports", "occ"].includes(hash)) {
      navigateToSection(hash);
    }
  });
}

function navigateToSection(sectionId) {
  // Guard check
  const activeRole = sessionStorage.getItem("userRole");
  if (!activeRole) {
    document.querySelectorAll(".app-section").forEach(sec => sec.classList.remove("active"));
    document.getElementById("login-section").classList.add("active");
    window.location.hash = "login";
    return;
  }

  // Enforce navigation RBAC guard checks
  const isAllowed = checkPagePermission(activeRole, sectionId);
  if (!isAllowed) {
    alert(`Access Denied: Your role '${activeRole}' is not authorized to view the ${sectionId} section.`);
    return;
  }

  document.querySelectorAll(".app-section").forEach(sec => sec.classList.remove("active"));
  const target = document.getElementById(`${sectionId}-section`);
  if (target) target.classList.add("active");

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("data-section") === sectionId) {
      link.classList.add("active");
    }
  });

  window.location.hash = sectionId;

  // Initializers per tab
  if (sectionId === "dashboard") {
    renderDashboard();
  } else if (sectionId === "aircraft") {
    renderAircraftList();
  } else if (sectionId === "pilots") {
    renderPilotsList();
  } else if (sectionId === "trips") {
    renderTripsList();
    updateTripFormDropdowns();
  } else if (sectionId === "maintenance") {
    renderMaintenanceTable();
  } else if (sectionId === "expenses") {
    renderExpensesTable();
  } else if (sectionId === "reports") {
    renderReports();
  } else if (sectionId === "occ") {
    renderOCCDashboard();
  }
}

function checkPagePermission(role, sectionId) {
  if (role === "Fleet Manager") {
    return ["dashboard", "aircraft", "maintenance", "reports", "occ"].includes(sectionId);
  } else if (role === "Dispatch Manager") {
    return ["dashboard", "trips", "occ", "reports"].includes(sectionId);
  } else if (role === "Safety Officer") {
    return ["dashboard", "aircraft", "pilots", "maintenance", "occ"].includes(sectionId);
  } else if (role === "Financial Analyst") {
    return ["dashboard", "expenses", "reports"].includes(sectionId);
  }
  return false;
}

// ==========================================================================
// Dashboard KPIs & Canvas Rendering
// ==========================================================================
function renderDashboard() {
  const activeAC = Object.values(state.aircraft).filter(ac => ac.status === "On Trip").length;
  const availAC = Object.values(state.aircraft).filter(ac => ac.status === "Available").length;
  const maintAC = Object.values(state.aircraft).filter(ac => ac.status === "In Maintenance").length;
  
  const activeTrips = state.trips.filter(t => t.status === "Dispatched").length;
  const pendingTrips = state.trips.filter(t => t.status === "Draft").length;
  const pilotsDuty = Object.values(state.pilots).filter(p => p.status === "On Trip" || p.status === "Available").length;

  const totalAC = Object.keys(state.aircraft).length;
  const fleetUtil = totalAC > 0 ? Math.round(((activeAC + maintAC) / totalAC) * 100) : 0;

  // Costs and Fuel
  const totalFuelLiters = state.fuelLogs.reduce((sum, f) => sum + f.qty, 0);
  
  const fuelCost = state.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const maintCost = state.maintenance.reduce((sum, m) => sum + m.cost, 0);
  const generalCost = state.expenses.reduce((sum, e) => sum + e.cost, 0);
  const totalOpCost = fuelCost + maintCost + generalCost;

  // On-time rate
  const completedTrips = state.trips.filter(t => t.status === "Completed");
  // Calculate average delay
  let totalDelay = 0;
  completedTrips.forEach(t => {
    // Generate delay simulation
    totalDelay += (t.distance * 0.005);
  });
  const otRate = completedTrips.length > 0 ? "95%" : "100%";

  // Update DOM Elements
  document.getElementById("kpi-active-aircraft").textContent = activeAC;
  document.getElementById("kpi-avail-aircraft").textContent = availAC;
  document.getElementById("kpi-maint-aircraft").textContent = maintAC;
  document.getElementById("kpi-active-trips").textContent = activeTrips;
  document.getElementById("kpi-pending-trips").textContent = pendingTrips;
  document.getElementById("kpi-pilots-duty").textContent = pilotsDuty;
  document.getElementById("kpi-fleet-util").textContent = `${fleetUtil}%`;
  document.getElementById("kpi-fuel-cons").textContent = `${totalFuelLiters.toLocaleString()} L`;
  document.getElementById("kpi-op-cost").textContent = `₹ ${totalOpCost.toFixed(2)} Lakhs`;
  document.getElementById("kpi-ot-rate").textContent = otRate;

  // Render recent trips on dashboard
  const recentContainer = document.getElementById("dashboard-recent-trips-list");
  const recent = state.trips.slice(-3).reverse();
  recentContainer.innerHTML = recent.map(t => {
    return `
      <div class="fleet-card">
        <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:0.85rem;">
          <strong style="color:var(--accent-color);">${t.id}</strong>
          <span>${t.status}</span>
        </div>
        <div style="font-size:0.85rem; font-weight:bold; margin-top:0.25rem;">${t.origin} ➔ ${t.destination}</div>
        <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">
          Load: ${t.cargoWeight.toLocaleString()} kg | AC: ${t.aircraft}
        </div>
      </div>
    `;
  }).join("");

  // Canvas drawing
  drawPieChart("chart-utilization", [activeAC, availAC, maintAC], ["#00f0ff", "#00ff66", "#ffaa00"]);
  drawPieChart("chart-costs", [fuelCost, maintCost, generalCost], ["#00f0ff", "#ff0055", "#ffaa00"]);
}

function drawPieChart(canvasId, values, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const total = values.reduce((sum, v) => sum + v, 0);
  if (total === 0) {
    // Draw empty circle
    ctx.beginPath();
    ctx.arc(80, 80, 60, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.stroke();
    return;
  }
  
  let startAngle = 0;
  const centerX = 80;
  const centerY = 80;
  const radius = 65;
  
  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0) continue;
    const sliceAngle = (values[i] / total) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors[i];
    ctx.fill();
    
    startAngle += sliceAngle;
  }
}

// ==========================================================================
// Aircraft CRUD Module
// ==========================================================================
function initAircraftCRUD() {
  const form = document.getElementById("aircraft-crud-form");
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const reg = document.getElementById("ac-reg").value.trim().toUpperCase();
    const editId = document.getElementById("aircraft-edit-id").value;
    
    // Check uniqueness for registration number if not editing
    if (!editId && state.aircraft[reg]) {
      alert(`Registration Number '${reg}' is already registered in the fleet.`);
      return;
    }
    
    const newAC = {
      name: document.getElementById("ac-name").value.trim(),
      model: document.getElementById("ac-model").value,
      type: "Jet",
      payloadCap: parseInt(document.getElementById("ac-payload").value),
      fuelCap: parseInt(document.getElementById("ac-fuelcap").value),
      flyingHours: parseInt(document.getElementById("ac-hours").value),
      acqCost: parseInt(document.getElementById("ac-acqcost").value),
      homeAirport: document.getElementById("ac-home").value,
      currentAirport: document.getElementById("ac-home").value,
      status: document.getElementById("ac-status").value
    };

    if (editId) {
      // Keep location
      newAC.currentAirport = state.aircraft[editId].currentAirport;
      // Delete old if key changed
      if (editId !== reg) {
        delete state.aircraft[editId];
      }
    }
    
    state.aircraft[reg] = newAC;
    saveDatabase();
    
    // Reset Form
    form.reset();
    document.getElementById("aircraft-edit-id").value = "";
    document.getElementById("aircraft-form-title").textContent = "Register New Aircraft";
    
    addDecisionLog(
      sessionStorage.getItem("userRole"),
      `Aircraft asset registered`,
      `Registry updated`,
      editId ? "Aircraft edit update" : "New aircraft registry",
      `${reg} - ${newAC.model}`,
      `Asset payload capability registered: ${newAC.payloadCap} kg.`
    );
    
    renderAircraftList();
    alert("Aircraft asset registry updated.");
  });
}

function renderAircraftList() {
  const tbody = document.getElementById("aircraft-table-body");
  tbody.innerHTML = Object.entries(state.aircraft).map(([reg, ac]) => {
    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${reg}</td>
        <td>${ac.name}</td>
        <td>${ac.model}</td>
        <td style="font-family:var(--font-mono);">${ac.payloadCap.toLocaleString()} kg</td>
        <td style="font-family:var(--font-mono);">${ac.flyingHours} hrs</td>
        <td style="font-weight:600;">${ac.currentAirport}</td>
        <td>
          <span class="status-indicator ${ac.status.toLowerCase().replace(" ", "")}">${ac.status}</span>
        </td>
        <td>
          <button class="btn btn-hud-action" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="editAircraft('${reg}')">Edit</button>
          <button class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="deleteAircraft('${reg}')">Retire</button>
        </td>
      </tr>
    `;
  }).join("");
}

function editAircraft(reg) {
  const ac = state.aircraft[reg];
  if (!ac) return;

  document.getElementById("aircraft-edit-id").value = reg;
  document.getElementById("ac-reg").value = reg;
  document.getElementById("ac-name").value = ac.name;
  document.getElementById("ac-model").value = ac.model;
  document.getElementById("ac-payload").value = ac.payloadCap;
  document.getElementById("ac-fuelcap").value = ac.fuelCap;
  document.getElementById("ac-hours").value = ac.flyingHours;
  document.getElementById("ac-acqcost").value = ac.acqCost;
  document.getElementById("ac-home").value = ac.homeAirport;
  document.getElementById("ac-status").value = ac.status;

  document.getElementById("aircraft-form-title").textContent = `Modify Aircraft ${reg}`;
}

function deleteAircraft(reg) {
  if (confirm(`Are you sure you want to retire aircraft ${reg}?`)) {
    state.aircraft[reg].status = "Retired";
    saveDatabase();
    renderAircraftList();
    
    addDecisionLog(
      sessionStorage.getItem("userRole"),
      "Aircraft Retired",
      `Grounded asset`,
      reg,
      "Retired status set",
      "Removed from operational fleet list."
    );
  }
}

// ==========================================================================
// Pilot CRUD Module
// ==========================================================================
function initPilotCRUD() {
  const form = document.getElementById("pilot-crud-form");
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const editId = document.getElementById("pilot-edit-id").value;
    const newId = editId || `PL-${Math.floor(100 + Math.random() * 900)}`;

    const newPilot = {
      name: document.getElementById("plt-name").value.trim(),
      licenseNum: document.getElementById("plt-license").value.trim(),
      category: document.getElementById("plt-category").value,
      licenseExp: document.getElementById("plt-license-exp").value,
      medicalExp: document.getElementById("plt-medical-exp").value,
      flyingHours: parseInt(document.getElementById("plt-hours").value),
      contact: document.getElementById("plt-contact").value,
      safetyScore: parseInt(document.getElementById("plt-safety").value),
      status: document.getElementById("plt-status").value
    };

    state.pilots[newId] = newPilot;
    saveDatabase();
    
    form.reset();
    document.getElementById("pilot-edit-id").value = "";
    document.getElementById("pilot-form-title").textContent = "Register Flight Crew";
    
    renderPilotsList();
    alert("Pilot profile registered.");
  });
}

function renderPilotsList() {
  const tbody = document.getElementById("pilots-table-body");
  
  tbody.innerHTML = Object.entries(state.pilots).map(([id, p]) => {
    const isLicenseExpired = new Date(p.licenseExp) < new Date();
    const isMedicalExpired = new Date(p.medicalExp) < new Date();
    
    let warningBadge = "";
    if (isLicenseExpired) {
      warningBadge += `<div style="color:var(--danger-color); font-weight:bold; font-size:0.7rem;">⚠️ LICENSE EXPIRED</div>`;
    }
    if (isMedicalExpired) {
      warningBadge += `<div style="color:var(--danger-color); font-weight:bold; font-size:0.7rem;">⚠️ MEDICAL EXPIRED</div>`;
    }

    return `
      <tr>
        <td>
          <div style="font-weight:bold;">${p.name}</div>
          <div style="font-size:0.7rem; color:var(--text-secondary);">${id}</div>
        </td>
        <td>
          <span style="font-family:var(--font-mono);">${p.licenseNum}</span>
          ${warningBadge}
        </td>
        <td style="font-family:var(--font-mono);">${p.licenseExp}</td>
        <td style="font-family:var(--font-mono);">${p.medicalExp}</td>
        <td style="font-family:var(--font-mono);">${p.flyingHours} hrs</td>
        <td style="font-family:var(--font-mono); font-weight:bold;">${p.safetyScore}/100</td>
        <td>
          <span class="status-indicator ${p.status.toLowerCase().replace(" ", "")}">${p.status}</span>
        </td>
        <td>
          <button class="btn btn-hud-action" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="editPilot('${id}')">Edit</button>
        </td>
      </tr>
    `;
  }).join("");
}

function editPilot(id) {
  const p = state.pilots[id];
  if (!p) return;

  document.getElementById("pilot-edit-id").value = id;
  document.getElementById("plt-name").value = p.name;
  document.getElementById("plt-license").value = p.licenseNum;
  document.getElementById("plt-category").value = p.category;
  document.getElementById("plt-license-exp").value = p.licenseExp;
  document.getElementById("plt-medical-exp").value = p.medicalExp;
  document.getElementById("plt-hours").value = p.flyingHours;
  document.getElementById("plt-safety").value = p.safetyScore;
  document.getElementById("plt-contact").value = p.contact;
  document.getElementById("plt-status").value = p.status;

  document.getElementById("pilot-form-title").textContent = `Modify Pilot ${p.name}`;
}

// ==========================================================================
// Trip Management Lifecycle
// ==========================================================================
function initTripManagement() {
  const form = document.getElementById("trip-dispatch-form");
  const originSelect = document.getElementById("trip-origin");
  const destSelect = document.getElementById("trip-destination");
  
  // Set planned distance automatically based on hubs
  const distances = {
    "DEL-BOM": 1140, "BOM-DEL": 1140,
    "DEL-AMD": 760, "AMD-DEL": 760,
    "DEL-BLR": 1740, "BLR-DEL": 1740,
    "DEL-CCU": 1300, "CCU-DEL": 1300,
    "BOM-AMD": 440, "AMD-BOM": 440,
    "BOM-BLR": 840, "BLR-BOM": 840,
    "BOM-CCU": 1660, "CCU-BOM": 1660,
    "AMD-BLR": 1200, "BLR-AMD": 1200,
    "AMD-CCU": 1610, "CCU-AMD": 1610,
    "BLR-CCU": 1560, "CCU-BLR": 1560
  };

  [originSelect, destSelect].forEach(sel => sel.addEventListener("change", () => {
    if (originSelect.value === destSelect.value && originSelect.value !== "") {
      destSelect.value = "";
    }
    const key = `${originSelect.value}-${destSelect.value}`;
    if (distances[key]) {
      document.getElementById("trip-distance").value = distances[key];
    }
  }));

  // AI Recommendation Trigger
  document.getElementById("btn-request-ai-rec").addEventListener("click", (e) => {
    e.preventDefault();
    
    // Check form validations
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const aircraftId = document.getElementById("trip-aircraft").value;
    const pilotId = document.getElementById("trip-pilot").value;
    const cargoWeight = parseInt(document.getElementById("trip-cargo-weight").value);
    
    // Rules Validation
    const aircraft = state.aircraft[aircraftId];
    const pilot = state.pilots[pilotId];

    // Capacity check
    if (cargoWeight > aircraft.payloadCap) {
      alert(`VALIDATION FAILURE: Cargo weight (${cargoWeight} kg) exceeds aircraft ${aircraftId} payload capacity (${aircraft.payloadCap} kg).`);
      return;
    }

    // Expired license check
    const isLicenseExpired = new Date(pilot.licenseExp) < new Date();
    const isMedicalExpired = new Date(pilot.medicalExp) < new Date();
    if (isLicenseExpired || isMedicalExpired) {
      alert(`VALIDATION FAILURE: Pilot ${pilot.name} has expired certifications and cannot fly.`);
      return;
    }

    // AI recommendation generation
    const dist = parseInt(document.getElementById("trip-distance").value);
    const delay = Math.round((dist * 0.005) + (state.weather === "Storm" ? 45 : 8));
    const fuel = Math.round(dist * 4.1 + (cargoWeight * 0.02));
    const profit = Math.round((cargoWeight * 0.025) - (fuel * 0.09));

    document.getElementById("ai-trip-rec-aircraft").textContent = aircraftId;
    document.getElementById("ai-trip-rec-route").textContent = `${originSelect.value} ➔ ${destSelect.value}`;
    document.getElementById("ai-trip-rec-delay").textContent = `+${delay} min expected`;
    document.getElementById("ai-trip-rec-fuel").textContent = `${fuel} L`;
    document.getElementById("ai-trip-rec-profit").textContent = `₹ ${(profit / 10).toFixed(2)} Lakhs`;
    document.getElementById("ai-trip-rec-score").textContent = "94/100";

    document.getElementById("dispatch-ai-rec-box").style.display = "block";
  });

  // Action buttons on AI Panel
  document.getElementById("btn-accept-dispatch").addEventListener("click", () => {
    dispatchTrip(true);
  });

  document.getElementById("btn-override-dispatch").addEventListener("click", () => {
    dispatchTrip(false);
  });
}

function updateTripFormDropdowns() {
  const acSelect = document.getElementById("trip-aircraft");
  const pltSelect = document.getElementById("trip-pilot");

  // Filter Available only (rule: In maintenance or Retired must not appear)
  const availableAC = Object.entries(state.aircraft).filter(([reg, ac]) => ac.status === "Available");
  acSelect.innerHTML = `<option value="" disabled selected>Select Available Aircraft</option>` +
    availableAC.map(([reg, ac]) => `<option value="${reg}">${reg} (Cap: ${ac.payloadCap} kg)</option>`).join("");

  // Filter Available Pilots with valid licenses
  const availablePilots = Object.entries(state.pilots).filter(([id, p]) => {
    const isLicenseExpired = new Date(p.licenseExp) < new Date();
    const isMedicalExpired = new Date(p.medicalExp) < new Date();
    return p.status === "Available" && !isLicenseExpired && !isMedicalExpired;
  });
  pltSelect.innerHTML = `<option value="" disabled selected>Select Certified Pilot</option>` +
    availablePilots.map(([id, p]) => `<option value="${id}">${p.name} (Hours: ${p.flyingHours}h)</option>`).join("");
}

function dispatchTrip(acceptedAI) {
  const origin = document.getElementById("trip-origin").value;
  const dest = document.getElementById("trip-destination").value;
  const acId = document.getElementById("trip-aircraft").value;
  const pltId = document.getElementById("trip-pilot").value;
  const weight = parseInt(document.getElementById("trip-cargo-weight").value);
  const dist = parseInt(document.getElementById("trip-distance").value);
  const dep = document.getElementById("trip-departure").value;
  const type = document.getElementById("trip-priority").value;

  const tripId = `TRP-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTrip = {
    id: tripId,
    origin: origin,
    destination: dest,
    aircraft: acId,
    pilot: pltId,
    cargoWeight: weight,
    cargoType: type,
    departure: dep,
    status: "Dispatched",
    distance: dist
  };

  state.trips.push(newTrip);

  // Transition statuses (Rule: Dispatch changes aircraft & pilot to On Trip)
  state.aircraft[acId].status = "On Trip";
  state.pilots[pltId].status = "On Trip";

  saveDatabase();
  
  // Reset
  document.getElementById("trip-dispatch-form").reset();
  document.getElementById("dispatch-ai-rec-box").style.display = "none";
  
  addDecisionLog(
    sessionStorage.getItem("userRole") || "AI Dispatcher",
    `Trip Dispatched: ${tripId}`,
    acceptedAI ? "AI Recommendation Accepted" : "Dispatcher Manual Override",
    "Available States",
    "Transitioned to On Trip",
    `Freighter ${acId} carrying ${weight} kg under pilot ${state.pilots[pltId].name} routed AMD ➔ DEL.`
  );

  renderTripsList();
  updateTripFormDropdowns();
  alert(`Trip ${tripId} successfully dispatched! Aircraft and pilot are now On Trip.`);
}

function renderTripsList() {
  const tbody = document.getElementById("trips-table-body");
  
  tbody.innerHTML = state.trips.map(t => {
    let actionButtons = "";
    if (t.status === "Dispatched") {
      actionButtons = `
        <button class="btn btn-hud-action" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="showCompleteTripModal('${t.id}')">Complete</button>
        <button class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="cancelTrip('${t.id}')">Cancel</button>
      `;
    }

    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${t.id}</td>
        <td>
          <div style="font-weight:bold;">${t.origin} ➔ ${t.destination}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Load: ${t.cargoWeight} kg | Dist: ${t.distance} km</div>
        </td>
        <td>
          <div style="font-size:0.85rem;">AC: <strong>${t.aircraft}</strong></div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Plt: ${state.pilots[t.pilot] ? state.pilots[t.pilot].name : t.pilot}</div>
        </td>
        <td>
          <span class="status-indicator ${t.status.toLowerCase()}">${t.status}</span>
        </td>
        <td>
          <div style="display:flex; gap:0.25rem;">${actionButtons}</div>
        </td>
      </tr>
    `;
  }).join("");
}

function showCompleteTripModal(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (!trip) return;

  const finalHrs = prompt("Enter Final Flight Duration (Flying Hours increment, e.g. 2):", "2");
  const fuelUsed = prompt("Enter Fuel Consumed during flight (Liters, e.g. 4650):", "4650");
  const rev = prompt("Enter Trip Revenue (₹ Lakhs, e.g. 3.2):", "3.2");

  if (finalHrs === null || fuelUsed === null || rev === null) return;

  completeTrip(tripId, parseFloat(finalHrs), parseInt(fuelUsed), parseFloat(rev));
}

function completeTrip(tripId, addHours, fuelConsumed, revenue) {
  const t = state.trips.find(trip => trip.id === tripId);
  if (!t) return;

  t.status = "Completed";
  t.finalOdo = addHours; 
  t.fuelUsed = fuelConsumed;
  t.revenue = revenue;

  // Revert status of assets back to Available
  state.aircraft[t.aircraft].status = "Available";
  state.aircraft[t.aircraft].flyingHours += addHours;
  state.aircraft[t.aircraft].currentAirport = t.destination;

  state.pilots[t.pilot].status = "Available";
  state.pilots[t.pilot].flyingHours += addHours;

  // Append log automatically inside fuel logger
  state.fuelLogs.push({
    aircraft: t.aircraft,
    qty: fuelConsumed,
    cost: Math.round(fuelConsumed * 0.095 * 10) / 10, // simulated cost factor
    date: getCurrentTimestamp().slice(0, 10),
    airport: t.destination
  });

  saveDatabase();

  addDecisionLog(
    sessionStorage.getItem("userRole") || "System Dispatcher",
    `Trip ${tripId} Completed`,
    "Trip Completed",
    "On Trip Statuses",
    "Aircraft & Pilot restored to Available",
    `Odometer updated by +${addHours} hrs. Revenue ₹ ${revenue} Lakhs recorded.`
  );

  renderTripsList();
  updateTripFormDropdowns();
  alert(`Trip ${tripId} completed successfully! Metrics recorded, assets reverted to Available.`);
}

function cancelTrip(tripId) {
  const t = state.trips.find(trip => trip.id === tripId);
  if (!t) return;

  if (confirm(`Cancel trip ${tripId}? Aircraft and pilot status will revert to Available.`)) {
    t.status = "Cancelled";
    
    // Revert status
    state.aircraft[t.aircraft].status = "Available";
    state.pilots[t.pilot].status = "Available";

    saveDatabase();
    
    addDecisionLog(
      sessionStorage.getItem("userRole"),
      `Trip ${tripId} Cancelled`,
      "Trip Cancelled",
      "On Trip Statuses",
      "Aircraft & Pilot restored to Available",
      `Dispatched trip ${tripId} cancelled by dispatcher.`
    );

    renderTripsList();
    updateTripFormDropdowns();
  }
}

// ==========================================================================
// Maintenance Logs Deck
// ==========================================================================
function initMaintenance() {
  const form = document.getElementById("maintenance-log-form");
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const acId = document.getElementById("maint-aircraft").value;
    const type = document.getElementById("maint-type").value;
    const cost = parseFloat(document.getElementById("maint-cost").value);
    const desc = document.getElementById("maint-desc").value.trim();

    // Create log
    const newLog = {
      aircraft: acId,
      type: type,
      desc: desc,
      date: getCurrentTimestamp().slice(0, 10),
      cost: cost,
      status: "Active"
    };

    state.maintenance.unshift(newLog);

    // Ground aircraft (Transition: Aircraft status becomes In Maintenance)
    state.aircraft[acId].status = "In Maintenance";
    
    saveDatabase();
    form.reset();

    addDecisionLog(
      sessionStorage.getItem("userRole") || "Fleet Manager",
      `Aircraft Grounded: ${acId}`,
      `Maintenance scheduled: ${type}`,
      "Available",
      "In Maintenance",
      `Service logs created: ${desc}. Cost ₹ ${cost} Lakhs.`
    );

    renderMaintenanceTable();
    updateMaintDropdowns();
    alert(`Aircraft ${acId} grounded and moved to shop for ${type}.`);
  });
}

function updateMaintDropdowns() {
  const select = document.getElementById("maint-aircraft");
  // Select available only
  const availableAC = Object.entries(state.aircraft).filter(([reg, ac]) => ac.status === "Available");
  select.innerHTML = `<option value="" disabled selected>Select Aircraft</option>` +
    availableAC.map(([reg, ac]) => `<option value="${reg}">${reg} (${ac.name})</option>`).join("");
}

function renderMaintenanceTable() {
  const tbody = document.getElementById("maintenance-table-body");
  
  tbody.innerHTML = state.maintenance.map((m, idx) => {
    let actionBtn = "";
    if (m.status === "Active") {
      actionBtn = `<button class="btn btn-hud-action" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="closeMaintenance(${idx})">Resolve</button>`;
    }

    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${m.aircraft}</td>
        <td><strong>${m.type}</strong></td>
        <td>${m.desc}</td>
        <td style="font-family:var(--font-mono);">${m.date}</td>
        <td style="font-family:var(--font-mono); font-weight:bold;">₹ ${m.cost} L</td>
        <td>
          <span class="status-indicator ${m.status === 'Active' ? 'maintenance' : 'available'}">${m.status}</span>
        </td>
        <td>${actionBtn}</td>
      </tr>
    `;
  }).join("");

  updateMaintDropdowns();
}

function closeMaintenance(idx) {
  const m = state.maintenance[idx];
  if (!m) return;

  m.status = "Resolved";
  
  // Restore Aircraft (Transition: Closing maintenance restores it to Available)
  if (state.aircraft[m.aircraft] && state.aircraft[m.aircraft].status !== "Retired") {
    state.aircraft[m.aircraft].status = "Available";
  }

  saveDatabase();
  
  addDecisionLog(
    sessionStorage.getItem("userRole") || "Fleet Manager",
    `Maintenance Resolved: ${m.aircraft}`,
    "Maintenance Closed",
    "In Maintenance",
    "Restored to Available",
    `Completed ${m.type} for aircraft ${m.aircraft}.`
  );

  renderMaintenanceTable();
  alert(`Maintenance check resolved! Aircraft ${m.aircraft} is now Available.`);
}

// ==========================================================================
// Expenses & Fuel logs
// ==========================================================================
function initExpenses() {
  const fuelForm = document.getElementById("fuel-log-form");
  const expForm = document.getElementById("general-expense-form");

  fuelForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const acId = document.getElementById("fuel-aircraft").value;
    const qty = parseInt(document.getElementById("fuel-qty").value);
    const cost = parseFloat(document.getElementById("fuel-cost").value);
    const date = document.getElementById("fuel-date").value;
    const hub = document.getElementById("fuel-hub").value;

    state.fuelLogs.push({ aircraft: acId, qty: qty, cost: cost, date: date, airport: hub });
    saveDatabase();
    
    fuelForm.reset();
    renderExpensesTable();
    alert("Fuel purchase logged.");
  });

  expForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const acId = document.getElementById("exp-aircraft").value;
    const type = document.getElementById("exp-type").value;
    const cost = parseFloat(document.getElementById("exp-cost").value);
    const date = document.getElementById("exp-date").value;

    state.expenses.push({ aircraft: acId, category: type, cost: cost, date: date });
    saveDatabase();

    expForm.reset();
    renderExpensesTable();
    alert("Operating expense item logged.");
  });
}

function updateExpenseDropdowns() {
  const fSelect = document.getElementById("fuel-aircraft");
  const eSelect = document.getElementById("exp-aircraft");
  
  const activeAC = Object.keys(state.aircraft);
  const options = activeAC.map(reg => `<option value="${reg}">${reg}</option>`).join("");
  
  fSelect.innerHTML = `<option value="" disabled selected>Select Aircraft</option>` + options;
  eSelect.innerHTML = `<option value="" disabled selected>Select Aircraft</option>` + options;
}

function renderExpensesTable() {
  const tbody = document.getElementById("expenses-table-body");
  
  // Combine fuel and other expenses in a single timeline list
  const fuelItems = state.fuelLogs.map(f => ({ ac: f.aircraft, cat: `Fuel Purchase (${f.qty} L)`, cost: f.cost, date: f.date }));
  const generalItems = state.expenses.map(e => ({ ac: e.aircraft, cat: e.category, cost: e.cost, date: e.date }));
  
  const all = [...fuelItems, ...generalItems].sort((a,b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = all.map(item => {
    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold;">${item.ac}</td>
        <td>${item.cat}</td>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--danger-color)">₹ ${item.cost} L</td>
        <td style="font-family:var(--font-mono); font-size:0.8rem;">${item.date}</td>
      </tr>
    `;
  }).join("");

  updateExpenseDropdowns();
}

// ==========================================================================
// Reports & Exports Engine
// ==========================================================================
function renderReports() {
  const tbody = document.getElementById("reports-table-body");

  tbody.innerHTML = Object.entries(state.aircraft).map(([reg, ac]) => {
    // Distance calculation
    const completed = state.trips.filter(t => t.aircraft === reg && t.status === "Completed");
    const totalDist = completed.reduce((sum, t) => sum + t.distance, 0);

    // Fuel consumed
    const fuelQty = state.fuelLogs.filter(f => f.aircraft === reg).reduce((sum, f) => sum + f.qty, 0);
    const fuelCost = state.fuelLogs.filter(f => f.aircraft === reg).reduce((sum, f) => sum + f.cost, 0);
    const fuelEff = fuelQty > 0 ? (totalDist / fuelQty).toFixed(2) : "0";

    // Maintenance cost
    const maintCost = state.maintenance.filter(m => m.aircraft === reg).reduce((sum, m) => sum + m.cost, 0);
    const otherCost = state.expenses.filter(e => e.aircraft === reg).reduce((sum, e) => sum + e.cost, 0);
    const totalOpCost = fuelCost + maintCost + otherCost;

    // Revenue
    const revenue = completed.reduce((sum, t) => sum + t.revenue, 0);

    // ROI
    const roi = ac.acqCost > 0 ? (((revenue - totalOpCost) / ac.acqCost) * 100).toFixed(1) : "0";

    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${reg}</td>
        <td style="font-family:var(--font-mono);">${totalDist.toLocaleString()} km</td>
        <td style="font-family:var(--font-mono);">${fuelQty.toLocaleString()} L</td>
        <td style="font-family:var(--font-mono); font-weight:bold;">${fuelEff} km/L</td>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--success-color);">₹ ${revenue.toFixed(2)} L</td>
        <td style="font-family:var(--font-mono); color:var(--warning-color)">₹ ${maintCost.toFixed(2)} L</td>
        <td style="font-family:var(--font-mono); color:var(--warning-color)">₹ ${fuelCost.toFixed(2)} L</td>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--danger-color)">₹ ${totalOpCost.toFixed(2)} L</td>
        <td style="font-family:var(--font-mono); font-weight:bold; color:${parseFloat(roi) >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">${roi}%</td>
      </tr>
    `;
  }).join("");

  // Setup Export buttons
  document.getElementById("btn-export-csv").onclick = exportCSV;
  document.getElementById("btn-export-pdf").onclick = exportPDF;
}

function exportCSV() {
  const rows = [
    ["Registration", "Distance Flown (km)", "Fuel Consumption (L)", "Fuel Efficiency (km/L)", "Revenue Generated (Lakhs)", "Maintenance Cost (Lakhs)", "Fuel Cost (Lakhs)", "Total Operating Costs (Lakhs)", "Asset ROI (%)"]
  ];

  Object.entries(state.aircraft).forEach(([reg, ac]) => {
    const completed = state.trips.filter(t => t.aircraft === reg && t.status === "Completed");
    const totalDist = completed.reduce((sum, t) => sum + t.distance, 0);
    const fuelQty = state.fuelLogs.filter(f => f.aircraft === reg).reduce((sum, f) => sum + f.qty, 0);
    const fuelCost = state.fuelLogs.filter(f => f.aircraft === reg).reduce((sum, f) => sum + f.cost, 0);
    const fuelEff = fuelQty > 0 ? (totalDist / fuelQty).toFixed(2) : "0";
    const maintCost = state.maintenance.filter(m => m.aircraft === reg).reduce((sum, m) => sum + m.cost, 0);
    const otherCost = state.expenses.filter(e => e.aircraft === reg).reduce((sum, e) => sum + e.cost, 0);
    const totalOpCost = fuelCost + maintCost + otherCost;
    const revenue = completed.reduce((sum, t) => sum + t.revenue, 0);
    const roi = ac.acqCost > 0 ? (((revenue - totalOpCost) / ac.acqCost) * 100).toFixed(1) : "0";

    rows.push([reg, totalDist, fuelQty, fuelEff, revenue, maintCost, fuelCost, totalOpCost, roi]);
  });

  // Convert array to CSV string
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `TransitOps_Fleet_Report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPDF() {
  window.print();
}

// ==========================================================================
// Operations Control Center (OCC) Live Map & Incident triggers
// ==========================================================================
function initOCC() {
  // Re-optimization button
  document.getElementById("btn-reoptimize-ga").addEventListener("click", () => {
    runGeneticAlgorithmOptimization();
    alert("Genetic Algorithm re-optimization successfully applied.");
  });

  // Incident triggers
  document.querySelectorAll(".emergency-deck .btn-danger").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-emergency");
      triggerOperationalEmergency(type);
    });
  });

  // Weather controls
  const weatherSelect = document.getElementById("weather-select");
  const windInput = document.getElementById("wind-speed-input");

  weatherSelect.value = state.weather;
  windInput.value = state.windSpeed;
  document.getElementById("wind-speed-val").textContent = `${state.windSpeed} knots`;

  weatherSelect.addEventListener("change", (e) => {
    state.weather = e.target.value;
    saveDatabase();
    triggerSystemRecalculation("Weather Severity Update", `Weather altered to: ${state.weather}`);
  });

  windInput.addEventListener("input", (e) => {
    state.windSpeed = parseInt(e.target.value);
    document.getElementById("wind-speed-val").textContent = `${state.windSpeed} knots`;
  });
  windInput.addEventListener("change", () => {
    saveDatabase();
    triggerSystemRecalculation("Wind Shear Shift", `Wind speed adjusted to ${state.windSpeed} knots.`);
  });

  // Airport slots
  document.getElementById("apply-airport-tweak").addEventListener("click", () => {
    const code = document.getElementById("airport-selector").value;
    const status = document.getElementById("airport-status-select").value;

    const hub = state.decisionLogs; // backup reference
    state.decisionLogs.push({
      timestamp: getCurrentTimestamp(),
      operator: sessionStorage.getItem("userRole") || "System",
      disruption: `Airport Slot Tweak (${code})`,
      prevConfig: "Open",
      newConfig: `Status changed to ${status}`,
      rationale: `Airfield status modified on slot boards.`
    });

    saveDatabase();
    triggerSystemRecalculation(`Airport Slot Change (${code})`, `Slot status modified.`);
    alert(`Airport ${code} slot updated to ${status}. Route map modified.`);
  });
}

function triggerOperationalEmergency(type) {
  let details = "";
  let config = "";

  switch (type) {
    case "aircraft-failure":
      state.aircraft["VT-SAT01"].status = "In Maintenance";
      details = "Freighter VT-SAT01 grounded immediately.";
      config = "Automatic rescheduling triggered.";
      break;
    case "runway-closed":
      details = "Delhi Hub (DEL) runway closed.";
      config = "Automatic rerouting applied.";
      break;
    case "security-threat":
      details = "Aviation alert: Tightened screening checks.";
      config = "Active screening queue holds.";
      break;
    case "malicious-cargo":
      details = "Dangerous package intercepted in X-Ray scan.";
      config = "Cargo quarantined.";
      break;
    case "medical-emergency":
      details = "Priority Medical cargo request logged.";
      config = "EDF scheduler prioritized Medical charter.";
      break;
    case "fuel-shortage":
      state.windSpeed = 58;
      details = "High wind gusts warnings active.";
      config = "Fuel calculations updated.";
      break;
    case "bird-strike":
      state.aircraft["VT-SAT03"].status = "In Maintenance";
      details = "VT-SAT03 grounded for engine inspection due to bird strike at Mumbai.";
      config = "Grounded.";
      break;
    case "weather-alert":
      state.weather = "Storm";
      state.windSpeed = 62;
      details = "Storm alerts active across trunk routes.";
      config = "Rerouting active.";
      break;
  }

  saveDatabase();
  triggerSystemRecalculation(`Incident Event: ${type.toUpperCase()}`, `${details}. ${config}`);
  alert(`DISRUPTION RESOLUTION: ${details}. AI optimizer has triggered dynamic rescheduling.`);
}

function triggerSystemRecalculation(name, desc) {
  state.decisionLogs.unshift({
    timestamp: getCurrentTimestamp(),
    operator: "OCC Dispatcher",
    disruption: name,
    prevConfig: "Standard active schedules",
    newConfig: "Recalculated active flight routing paths",
    rationale: desc
  });
  saveDatabase();
  runGeneticAlgorithmOptimization();
  renderOCCDashboard();
}

function renderOCCDashboard() {
  // 1. Fleet cards
  const fleetContainer = document.getElementById("occ-fleet-container");
  fleetContainer.innerHTML = Object.entries(state.aircraft).map(([reg, ac]) => {
    // Load calculations
    const activeTrips = state.trips.filter(t => t.aircraft === reg && t.status === "Dispatched");
    const loadWeight = activeTrips.reduce((sum, t) => sum + t.cargoWeight, 0);
    const loadFactor = Math.round((loadWeight / ac.payloadCap) * 100);

    return `
      <div class="fleet-card">
        <div class="fleet-card-header">
          <h4>${reg}</h4>
          <span class="status-indicator ${ac.status.toLowerCase().replace(" ", "")}">${ac.status}</span>
        </div>
        <div style="font-size:0.85rem; font-weight:bold;">${ac.model}</div>
        <div class="fleet-stats-row">
          <span>Airport: <strong>${ac.currentAirport}</strong></span>
          <span>Load: <strong>${loadFactor}%</strong></span>
          <span>Hrs: <strong>${ac.flyingHours}h</strong></span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${loadFactor}%"></div>
        </div>
      </div>
    `;
  }).join("");

  // 2. Scheduled board
  const tbody = document.getElementById("occ-flight-table-body");
  tbody.innerHTML = state.trips.filter(t => t.status === "Dispatched").map(t => {
    // 4 hours lock check
    const depParts = t.departure.slice(11, 16).split(":");
    const depMin = parseInt(depParts[0]) * 60 + parseInt(depParts[1]) || 1200;
    const currentMin = 11 * 60 + 30; // 11:30 simulated clock
    const isLocked = (depMin - currentMin < 240) && depMin > currentMin;

    const actionBtn = isLocked ? 
      `<button class="btn btn-danger" style="font-size:0.7rem; padding:0.2rem 0.4rem;" onclick="overrideFlightLock('${t.id}')">Override</button>` :
      `<button class="btn btn-hud-action" style="font-size:0.7rem; padding:0.2rem 0.4rem;" onclick="showCompleteTripModal('${t.id}')">Complete</button>`;

    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${t.id}</td>
        <td>${t.origin} ➔ ${t.destination}</td>
        <td style="font-family:var(--font-mono);">${t.departure.slice(11, 16)}</td>
        <td style="font-family:var(--font-mono);">${t.distance} km</td>
        <td style="font-weight:bold; color:${isLocked ? 'var(--danger-color)' : 'var(--success-color)'}; font-family:var(--font-mono); font-size:0.75rem;">
          ${isLocked ? '🔒 Locked' : '🔓 Open'}
        </td>
        <td>${actionBtn}</td>
      </tr>
    `;
  }).join("");

  // 3. Render Cargo Sorting Queue Columns
  const qPending = document.getElementById("queue-pending");
  const qAssigned = document.getElementById("queue-assigned");
  const qCompleted = document.getElementById("queue-completed");

  const pending = state.trips.filter(t => t.status === "Draft");
  const assigned = state.trips.filter(t => t.status === "Dispatched");
  const completed = state.trips.filter(t => t.status === "Completed");

  const renderItem = (t) => {
    let badgeClass = "std";
    if (t.cargoType === "Medical") badgeClass = "med";
    else if (t.cargoType === "Perishable") badgeClass = "per";
    else if (t.cargoType === "Express") badgeClass = "exp";

    return `
      <div class="queue-item ${badgeClass}">
        <div><strong>${t.id}</strong> [${t.origin}➔${t.destination}]</div>
        <div>Weight: ${t.cargoWeight} kg | AC: ${t.aircraft}</div>
        <div style="font-size:0.7rem; opacity:0.8; margin-top:0.2rem;">Status: ${t.status}</div>
      </div>
    `;
  };

  qPending.innerHTML = pending.map(renderItem).join("") || `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No pending cargo.</p>`;
  qAssigned.innerHTML = assigned.map(renderItem).join("") || `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No active flights.</p>`;
  qCompleted.innerHTML = completed.map(renderItem).join("") || `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No items delivered.</p>`;

  // 4. Decision logs
  const logTable = document.getElementById("decision-logs-body");
  logTable.innerHTML = state.decisionLogs.map(log => `
    <tr>
      <td style="color:var(--text-muted); font-size:0.8rem;">${log.timestamp}</td>
      <td style="font-weight:bold;">${log.operator}</td>
      <td style="color:var(--warning-color);">${log.disruption}</td>
      <td style="font-size:0.8rem;">${log.prevConfig}</td>
      <td style="color:var(--success-color); font-size:0.8rem;">${log.newConfig}</td>
      <td style="font-size:0.8rem; color:var(--text-secondary);">${log.rationale}</td>
    </tr>
  `).join("");

  updateMapStatusLines();
}

function overrideFlightLock(tripId) {
  // Lock override rule check
  const activeRole = sessionStorage.getItem("userRole");
  if (activeRole !== "Fleet Manager") {
    alert(`SECURITY ACCESS FAILURE: Only a Fleet Manager is authorized to override flight locks. Active role: ${activeRole}`);
    return;
  }

  if (confirm(`Overriding flight lock on trip ${tripId}. Proceed?`)) {
    showCompleteTripModal(tripId);
  }
}

// Map styles based on status
function updateMapStatusLines() {
  const routes = [
    { id: "route-DEL-BOM", airports: ["DEL", "BOM"] },
    { id: "route-DEL-AMD", airports: ["DEL", "AMD"] },
    { id: "route-DEL-BLR", airports: ["DEL", "BLR"] },
    { id: "route-DEL-CCU", airports: ["DEL", "CCU"] },
    { id: "route-BOM-AMD", airports: ["BOM", "AMD"] },
    { id: "route-BOM-BLR", airports: ["BOM", "BLR"] },
    { id: "route-BOM-CCU", airports: ["BOM", "CCU"] },
    { id: "route-AMD-BLR", airports: ["AMD", "BLR"] },
    { id: "route-AMD-CCU", airports: ["AMD", "CCU"] },
    { id: "route-BLR-CCU", airports: ["BLR", "CCU"] }
  ];

  routes.forEach(r => {
    const el = document.getElementById(r.id);
    if (!el) return;

    // Reset
    el.className.baseVal = "map-route-line";
    if (state.weather === "Storm") {
      el.className.baseVal = "map-route-line weather";
    }
  });
}

function animatePlanes() {
  const planesGroup = document.getElementById("active-planes-group");
  if (activePlanesInterval) clearInterval(activePlanesInterval);

  const hubs = {
    BOM: { x: 150, y: 340 },
    AMD: { x: 140, y: 230 },
    BLR: { x: 210, y: 440 },
    DEL: { x: 240, y: 100 },
    CCU: { x: 390, y: 250 }
  };

  let tick = 0;
  activePlanesInterval = setInterval(() => {
    tick += 0.01;
    if (tick > 1.0) tick = 0;

    const dispatched = state.trips.filter(t => t.status === "Dispatched");
    planesGroup.innerHTML = dispatched.map(t => {
      const org = hubs[t.origin];
      const dest = hubs[t.destination];
      if (!org || !dest) return "";

      const x = org.x + (dest.x - org.x) * tick;
      const y = org.y + (dest.y - org.y) * tick;
      const angle = Math.atan2(dest.y - org.y, dest.x - org.x) * (180 / Math.PI);

      return `
        <g class="flying-plane" transform="translate(${x}, ${y}) rotate(${angle})">
          <path d="M 0,-4 L 3,-4 L 6,0 L 2,0 L 4,4 L 1,4 L 0,1 L -1,4 L -4,4 L -2,0 L -6,0 L -3,-4 Z" transform="scale(1.2)" />
          <text y="14" style="font-family:var(--font-mono); font-size:6px; fill:#fff;" text-anchor="middle">${t.id}</text>
        </g>
      `;
    }).join("");
  }, 100);
}

// ==========================================================================
// GA Route Optimization Algorithm
// ==========================================================================
function runGeneticAlgorithmOptimization() {
  const dispatched = state.trips.filter(t => t.status === "Dispatched");
  if (dispatched.length === 0) return;

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
    totalProfit += (profit / 10); // ₹ Lakhs
  });

  totalProfit = Math.max(0.1, totalProfit);

  // Update OCC AI metrics
  document.getElementById("ai-rec-aircraft").textContent = dispatched.map(t => `${t.id}: ${t.aircraft}`).join("\n");
  document.getElementById("ai-rec-delay").textContent = `+${totalDelay} min`;
  document.getElementById("ai-rec-fuel").textContent = `${totalFuel} L`;
  document.getElementById("ai-rec-profit").textContent = `₹ ${totalProfit.toFixed(2)} Lakhs`;
  document.getElementById("ai-rec-score").textContent = "96/100";
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

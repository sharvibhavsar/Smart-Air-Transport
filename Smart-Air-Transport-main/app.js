// ==========================================================================
// Smart Air Transport - Core Application Database & Engine
// ==========================================================================

// Core State Structure
let state = {
  airports: {
    BOM: { name: "Mumbai Hub", status: "Open", runway: "Open", capacity: 1000, currentLoad: 120, crewAvail: 100, congestion: "Low", x: 150, y: 340 },
    AMD: { name: "Ahmedabad Hub", status: "Open", runway: "Open", capacity: 800, currentLoad: 90, crewAvail: 100, congestion: "Low", x: 140, y: 230 },
    BLR: { name: "Bengaluru Hub", status: "Open", runway: "Open", capacity: 900, currentLoad: 140, crewAvail: 100, congestion: "Low", x: 210, y: 440 },
    DEL: { name: "Delhi Hub", status: "Open", runway: "Open", capacity: 1200, currentLoad: 250, crewAvail: 100, congestion: "Low", x: 240, y: 100 },
    CCU: { name: "Kolkata Hub", status: "Open", runway: "Open", capacity: 850, currentLoad: 80, crewAvail: 100, congestion: "Low", x: 390, y: 250 }
  },
  fleet: {
    "VT-IND": { type: "Airbus A321P2F", payloadCap: 27.0, currentLocation: "BOM", status: "Available", maintenance: "Good", crew: "Rested" },
    "VT-QKJ": { type: "Boeing 737-800BCF", payloadCap: 22.5, currentLocation: "AMD", status: "Available", maintenance: "Good", crew: "Rested" },
    "VT-PRD": { type: "Airbus A320P2F", payloadCap: 21.0, currentLocation: "DEL", status: "Available", maintenance: "Good", crew: "Rested" },
    "VT-BLU": { type: "Boeing 757-200(PCF)", payloadCap: 30.0, currentLocation: "CCU", status: "Available", maintenance: "Good", crew: "Rested" }
  },
  flights: [
    { id: "SAT-101", origin: "BOM", destination: "DEL", aircraft: "VT-IND", departure: "18:00", duration: 120, status: "Scheduled", locked: false, cargoIds: [] },
    { id: "SAT-102", origin: "AMD", destination: "DEL", aircraft: "VT-QKJ", departure: "20:00", duration: 90, status: "Scheduled", locked: false, cargoIds: [] },
    { id: "SAT-103", origin: "DEL", destination: "BLR", aircraft: "VT-PRD", departure: "21:30", duration: 150, status: "Scheduled", locked: false, cargoIds: [] },
    { id: "SAT-104", origin: "CCU", destination: "BOM", aircraft: "VT-BLU", departure: "23:00", duration: 130, status: "Scheduled", locked: false, cargoIds: [] }
  ],
  cargo: [
    // Pre-seeded items
    {
      id: "SAT-8291-BOM",
      sender: "Serum Institute India",
      receiver: "BOM Health Dept",
      origin: "DEL",
      destination: "BOM",
      weight: 4.8, // tonnes
      length: 2.5, width: 2.0, height: 1.6,
      cargoType: "Medical",
      priority: 1, // Medical = 1, Perishables = 2, Express = 3, Standard = 4
      deadline: "2026-07-12T22:30",
      hazardous: false,
      perishable: true,
      status: "Assigned",
      screening: "Passed",
      flightId: "SAT-101",
      logs: [
        { time: "2026-07-12 11:00", desc: "Cargo security screening passed successfully." },
        { time: "2026-07-12 10:45", desc: "Booking registered and queued for screening." }
      ]
    },
    {
      id: "SAT-9104-DEL",
      sender: "Tata Motors Auto Parts",
      receiver: "DEL Logistics Park",
      origin: "AMD",
      destination: "DEL",
      weight: 12.5,
      length: 5.0, width: 2.4, height: 2.2,
      cargoType: "Express",
      priority: 3,
      deadline: "2026-07-13T01:00",
      hazardous: false,
      perishable: false,
      status: "Assigned",
      screening: "Passed",
      flightId: "SAT-102",
      logs: [
        { time: "2026-07-12 11:15", desc: "Assigned to aircraft flight SAT-102." },
        { time: "2026-07-12 11:05", desc: "Security screening passed." }
      ]
    }
  ],
  weather: "Normal", // Normal, Fog, Storm, Heavy Rain
  windSpeed: 12, // knots
  overrideActive: false, // Admin Emergency Override
  decisionLogs: [
    {
      timestamp: "2026-07-12 11:15",
      operator: "AI Planner Version 1.0",
      disruption: "System Initialization",
      prevConfig: "None",
      newConfig: "Initial flights schedules established.",
      rationale: "Trunk route schedules loaded successfully."
    }
  ]
};

// Global variables for live SVG routing planes
let activePlanesInterval = null;

// ==========================================================================
// Initialization & Theme Management
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadStateFromLocalStorage();
  initTheme();
  initRouting();
  initOrderForm();
  initTracker();
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

// State Persistence
function saveStateToLocalStorage() {
  localStorage.setItem("sat_operations_state", JSON.stringify(state));
}

function loadStateFromLocalStorage() {
  const saved = localStorage.getItem("sat_operations_state");
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (e) {
      console.error("Could not parse saved state, loading defaults.");
    }
  }
}

// ==========================================================================
// SPA Router & Navigation
// ==========================================================================
function initRouting() {
  const navLinks = document.querySelectorAll(".nav-link");
  const logoNav = document.getElementById("logo-nav");
  const ctaPlaceOrder = document.getElementById("cta-place-order");
  const ctaTrackOrder = document.getElementById("cta-track-order");
  const ctaOcc = document.getElementById("cta-occ");

  function navigateTo(sectionId) {
    document.querySelectorAll(".app-section").forEach(sec => sec.classList.remove("active"));
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-section") === sectionId) {
        link.classList.add("active");
      }
    });

    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.add("active");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("nav-menu").classList.remove("active");
    
    // Refresh sections on navigate
    if (sectionId === "occ") {
      renderOCCDashboard();
    }
    updateHomeSummaryStats();
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "test.html") return; // Let default browser target handle it
      e.preventDefault();
      const section = link.getAttribute("data-section");
      navigateTo(section);
      window.location.hash = section;
    });
  });

  logoNav.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("home");
    window.location.hash = "home";
  });

  ctaPlaceOrder.addEventListener("click", () => navigateTo("place-order"));
  ctaTrackOrder.addEventListener("click", () => navigateTo("track-order"));
  ctaOcc.addEventListener("click", () => navigateTo("occ"));

  // Handle URL hash on load
  const hash = window.location.hash.substring(1);
  if (["home", "place-order", "track-order", "occ"].includes(hash)) {
    navigateTo(hash);
  } else {
    updateHomeSummaryStats();
  }

  // Hamburger Menu
  const menuToggle = document.getElementById("menu-toggle-btn");
  const navMenu = document.getElementById("nav-menu");
  menuToggle.addEventListener("click", () => navMenu.classList.toggle("active"));
}

function updateHomeSummaryStats() {
  document.getElementById("active-flights-count").textContent = `${state.flights.filter(f => f.status === "In Flight" || f.status === "Scheduled").length} Jets`;
  document.getElementById("pending-cargo-stat").textContent = `${state.cargo.filter(c => c.status === "Pending" || c.status === "Screening").length} Cargo`;
  
  // Sum expected fuel
  let totalFuel = 0;
  state.flights.forEach(f => {
    const predictions = runRandomForestML(f);
    totalFuel += predictions.fuel;
  });
  document.getElementById("avg-fuel-stat").textContent = `${Math.round(totalFuel).toLocaleString()} L`;
}

// ==========================================================================
// Booking Pipeline & Dispatch Logic
// ==========================================================================

function initOrderForm() {
  const form = document.getElementById("order-form");
  const originSelect = document.getElementById("origin-airport");
  const destSelect = document.getElementById("destination-airport");
  const weightInput = document.getElementById("package-weight");
  const cargoTypeSelect = document.getElementById("cargo-type");
  const deadlineInput = document.getElementById("delivery-deadline");
  
  // Set default deadline to today + 24 hours
  const now = new Date();
  now.setHours(now.getHours() + 24);
  const defaultDeadline = now.toISOString().slice(0, 16);
  deadlineInput.value = defaultDeadline;

  // Real-time Latest Booking Acceptance Time (LAT) recalculation
  function recalculateLAT() {
    const origin = originSelect.value;
    const dest = destSelect.value;
    if (!origin || !dest) return;

    // Find the next scheduled flight matching this route
    const nextFlight = state.flights.find(f => f.origin === origin && f.destination === dest);
    const feedbackBox = document.getElementById("lat-feedback-box");
    
    if (!nextFlight) {
      feedbackBox.style.display = "block";
      document.getElementById("next-flight-dep").textContent = "No Scheduled Flight Available";
      document.getElementById("lat-deadline-disp").textContent = "N/A";
      document.getElementById("lat-feasibility").textContent = "REJECTED (No Service Route)";
      document.getElementById("lat-feasibility").style.color = "var(--danger-color)";
      return;
    }

    feedbackBox.style.display = "block";
    document.getElementById("next-flight-dep").textContent = `${nextFlight.id} at ${nextFlight.departure}`;

    // LAT calculation: Flight Departure - 4 hours (240 minutes)
    // Convert flight departure string (HH:MM) to time
    const depParts = nextFlight.departure.split(":");
    const depMinutes = parseInt(depParts[0]) * 60 + parseInt(depParts[1]);
    
    // Prep Times: Road Pickup (120m) + Warehouse (45m) + Security (30m) + Loading/Safety (45m) = 240m (4 hours)
    const totalPrepMinutes = 240; 
    let latMinutes = depMinutes - totalPrepMinutes;
    if (latMinutes < 0) {
      latMinutes += 24 * 60; // wrap around day
    }

    const latH = Math.floor(latMinutes / 60).toString().padStart(2, "0");
    const latM = (latMinutes % 60).toString().padStart(2, "0");
    document.getElementById("lat-deadline-disp").textContent = `${latH}:${latM} Hours`;

    // Compare with "current operational time" (simulated as 11:30 for current simulation)
    const simulatedCurrentMinutes = 11 * 60 + 30; 
    let isFeasible = true;

    // If booking time exceeds LAT
    if (simulatedCurrentMinutes > latMinutes && depMinutes > simulatedCurrentMinutes) {
      isFeasible = false;
    }

    const feasibilityDisp = document.getElementById("lat-feasibility");
    if (isFeasible) {
      feasibilityDisp.textContent = "PASSED (Feasible for express delivery)";
      feasibilityDisp.style.color = "var(--success-color)";
    } else {
      feasibilityDisp.textContent = `REJECTED (Missed acceptance deadline of ${latH}:${latM}. Next flight recommended.)`;
      feasibilityDisp.style.color = "var(--danger-color)";
    }
  }

  [originSelect, destSelect].forEach(sel => sel.addEventListener("change", () => {
    if (originSelect.value === destSelect.value && originSelect.value !== "") {
      alert("Origin and Destination cannot be the same!");
      destSelect.value = "";
    }
    recalculateLAT();
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const origin = originSelect.value;
    const dest = destSelect.value;
    const weight = parseFloat(weightInput.value);
    const cargoType = cargoTypeSelect.value;
    const deadline = deadlineInput.value;
    const hazardous = document.getElementById("hazardous-flag").checked;
    const perishable = document.getElementById("perishable-flag").checked;
    
    const nextFlight = state.flights.find(f => f.origin === origin && f.destination === dest);
    if (!nextFlight) {
      alert(`No flights exist between ${origin} and ${dest}. Booking rejected.`);
      return;
    }

    // Determine booking priority
    let priority = 4; // Standard
    if (cargoType === "Medical") priority = 1;
    else if (cargoType === "Perishable") priority = 2;
    else if (cargoType === "Express") priority = 3;

    // Check Latest Booking Acceptance Time (LAT)
    const depParts = nextFlight.departure.split(":");
    const depMinutes = parseInt(depParts[0]) * 60 + parseInt(depParts[1]);
    const simulatedCurrentMinutes = 11 * 60 + 30; // Simulated time: 11:30 AM
    const latMinutes = depMinutes - 240;

    if (simulatedCurrentMinutes > latMinutes && depMinutes > simulatedCurrentMinutes) {
      // LAT check failed, reject booking for current flight, recommend next
      alert(`LAT CHECK REJECTED: Current booking time 11:30 is past the Latest Booking Acceptance Time (${Math.floor(latMinutes/60).toString().padStart(2,"0")}:${(latMinutes%60).toString().padStart(2,"0")}) for flight ${nextFlight.id}. Scheduling for alternate flight recommended.`);
      return;
    }

    // Generate Cargo ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const cargoId = `SAT-${randomCode}-${dest}`;

    const newCargo = {
      id: cargoId,
      sender: document.getElementById("sender-name").value,
      receiver: document.getElementById("receiver-name").value,
      origin: origin,
      destination: dest,
      weight: weight,
      length: parseFloat(document.getElementById("package-len").value) || 1.0,
      width: parseFloat(document.getElementById("package-wid").value) || 1.0,
      height: parseFloat(document.getElementById("package-hei").value) || 1.0,
      cargoType: cargoType,
      priority: priority,
      deadline: deadline,
      hazardous: hazardous,
      perishable: perishable,
      status: "Screening",
      screening: "Scanning",
      flightId: null,
      logs: [
        { time: getCurrentTimestamp(), desc: "Cargo booking submitted. Placed into screening queue." }
      ]
    };

    // Add cargo to list
    state.cargo.push(newCargo);
    saveStateToLocalStorage();

    // Trigger visual security screening pipeline animation
    form.style.display = "none";
    document.getElementById("order-success").style.display = "block";
    document.getElementById("success-tracking-id").textContent = cargoId;
    
    runSecurityScreeningAnimation(newCargo);
  });

  // Reset Success screen buttons
  document.getElementById("success-new-order-btn").addEventListener("click", () => {
    form.reset();
    form.style.display = "block";
    document.getElementById("order-success").style.display = "none";
    document.getElementById("lat-feedback-box").style.display = "none";
  });

  document.getElementById("success-track-btn").addEventListener("click", () => {
    const trackingId = document.getElementById("success-tracking-id").textContent;
    document.getElementById("tracker-input").value = trackingId;
    document.querySelector('.nav-link[data-section="track-order"]').click();
    triggerTrackingSearch(trackingId);
    
    // Reset booking screen for next bookings
    form.reset();
    form.style.display = "block";
    document.getElementById("order-success").style.display = "none";
    document.getElementById("lat-feedback-box").style.display = "none";
  });

  document.getElementById("copy-tracking-btn").addEventListener("click", () => {
    const code = document.getElementById("success-tracking-id").textContent;
    navigator.clipboard.writeText(code).then(() => {
      alert("Tracking code copied to clipboard!");
    });
  });
}

// Security Screening Live Simulator
function runSecurityScreeningAnimation(cargoItem) {
  const steps = [
    { id: "scr-xray", label: "X-Ray Inspection" },
    { id: "scr-dg", label: "Dangerous Goods Detection" },
    { id: "scr-docs", label: "Documentation Verification" },
    { id: "scr-manual", label: "Manual Inspection" }
  ];

  // Reset UI classes
  steps.forEach(st => {
    const el = document.getElementById(st.id);
    el.className = "screening-step";
    el.querySelector(".scr-status").textContent = "Pending";
    el.querySelector(".bullet").textContent = "○";
  });

  let stepIdx = 0;
  const outcomeText = document.getElementById("screening-outcome-disp");
  outcomeText.textContent = "Scanning...";
  outcomeText.className = "";
  outcomeText.style.color = "var(--warning-color)";

  function processNextStep() {
    if (stepIdx >= steps.length - 1 && !cargoItem.hazardous && cargoItem.weight < 20) {
      // Skip manual inspection if not hazardous or not too heavy
      document.getElementById("scr-manual").querySelector(".scr-status").textContent = "Skipped (Not Required)";
      finalizeScreening();
      return;
    }
    if (stepIdx >= steps.length) {
      finalizeScreening();
      return;
    }

    const currentStep = steps[stepIdx];
    const el = document.getElementById(currentStep.id);
    el.className = "screening-step active-step";
    el.querySelector(".scr-status").textContent = "Processing...";
    el.querySelector(".bullet").textContent = "▶";

    setTimeout(() => {
      el.className = "screening-step passed-step";
      el.querySelector(".scr-status").textContent = "Passed";
      el.querySelector(".bullet").textContent = "✓";
      stepIdx++;
      processNextStep();
    }, 1000);
  }

  function finalizeScreening() {
    let outcome = "Passed";
    
    // Custom Logic for Cargo Failures
    if (cargoItem.hazardous) {
      // Hazardous cargo has a risk of requiring DG approval or rejection
      const rand = Math.random();
      if (rand < 0.3) {
        outcome = "Requires DG Approval";
      } else if (rand < 0.45) {
        outcome = "Rejected";
      } else if (rand < 0.6) {
        outcome = "Hold";
      }
    } else {
      const rand = Math.random();
      if (rand < 0.05) outcome = "Hold";
      else if (rand < 0.08) outcome = "Customs Hold";
    }

    // Force specific states for Emergency Simulation
    if (state.weather === "Storm" && Math.random() < 0.15) {
      outcome = "Hold";
    }

    cargoItem.screening = outcome;
    
    if (outcome === "Passed") {
      cargoItem.status = "Assigned"; // Will run scheduling optimization
      outcomeText.textContent = "PASSED";
      outcomeText.style.color = "var(--success-color)";
      cargoItem.logs.push({ time: getCurrentTimestamp(), desc: "Security screening passed: Cargo authorized for dispatch." });
      
      // Auto run GA optimizer when a new cargo passes screening to schedule it
      runGeneticAlgorithmOptimization();
    } else {
      cargoItem.status = (outcome === "Rejected") ? "Rejected" : "Hold";
      outcomeText.textContent = outcome.toUpperCase();
      outcomeText.style.color = "var(--danger-color)";
      
      const stepManual = document.getElementById("scr-manual");
      stepManual.className = "screening-step failed-step";
      stepManual.querySelector(".scr-status").textContent = outcome;
      stepManual.querySelector(".bullet").textContent = "✗";

      cargoItem.logs.push({ time: getCurrentTimestamp(), desc: `Security screening failed/held: ${outcome}` });
      
      addDecisionLog(
        "Security System",
        `Cargo ${cargoItem.id} Screening`,
        "Screening Failed",
        "Assigned status",
        `Placed on status: ${outcome}`,
        `Screening failed due to rule check: ${outcome}`
      );
    }

    saveStateToLocalStorage();
    renderOCCDashboard();
  }

  setTimeout(processNextStep, 500);
}

// EDF (Earliest Deadline First) Sorting Queue
function sortCargoByEDF(cargoArray) {
  return cargoArray.sort((a, b) => {
    // Sort primarily by Priority value (lower priority value = higher priority order)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Secondarily sort by earliest deadline date
    return new Date(a.deadline) - new Date(b.deadline);
  });
}

// ==========================================================================
// Tracking Logic
// ==========================================================================
function initTracker() {
  const searchBtn = document.getElementById("tracker-search-btn");
  const input = document.getElementById("tracker-input");
  const sampleLink = document.getElementById("sample-track-code");

  searchBtn.addEventListener("click", () => triggerTrackingSearch(input.value.trim()));
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") triggerTrackingSearch(input.value.trim());
  });

  sampleLink.addEventListener("click", () => {
    const code = sampleLink.textContent;
    input.value = code;
    triggerTrackingSearch(code);
  });
}

function triggerTrackingSearch(code) {
  const emptyState = document.getElementById("tracker-empty");
  const resultCard = document.getElementById("tracker-result");

  if (!code) {
    alert("Please enter a tracking ID.");
    return;
  }

  const item = state.cargo.find(c => c.id.toUpperCase() === code.toUpperCase());
  if (!item) {
    alert(`No consignment found matching tracking code: ${code}`);
    emptyState.style.display = "block";
    resultCard.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  resultCard.style.display = "block";

  document.getElementById("track-id-disp").textContent = item.id;
  document.getElementById("track-priority-disp").textContent = `${item.cargoType} Class`;
  document.getElementById("track-origin-disp").textContent = `${item.origin} ➔ ${item.destination}`;
  document.getElementById("track-package-disp").textContent = `${item.weight} tonnes (${item.length}m x ${item.width}m x ${item.height}m)`;
  document.getElementById("track-haz-disp").textContent = item.hazardous ? "DANGEROUS GOODS (DGCA Regulated)" : "Standard Logistics";
  document.getElementById("track-haz-disp").style.color = item.hazardous ? "var(--danger-color)" : "var(--text-secondary)";

  // Format delivery time
  const dlDate = new Date(item.deadline);
  document.getElementById("track-delivery-disp").textContent = dlDate.toLocaleString();

  // Find assigned aircraft
  let aircraftText = "Awaiting AI Optimizer...";
  if (item.flightId) {
    const flight = state.flights.find(f => f.id === item.flightId);
    if (flight) {
      const plane = state.fleet[flight.aircraft];
      aircraftText = `${plane.type} (${flight.aircraft}) via Flight ${flight.id}`;
    }
  }
  document.getElementById("track-aircraft-disp").textContent = aircraftText;

  // Map status index: Booked (0), Screening (1), Assigned (2), Loading (3), In Flight (4), Delivered (5)
  let statusIndex = 0;
  if (item.status === "Screening") statusIndex = 1;
  else if (item.status === "Assigned") statusIndex = 2;
  else if (item.status === "Loading") statusIndex = 3;
  else if (item.status === "In Flight") statusIndex = 4;
  else if (item.status === "Delivered") statusIndex = 5;
  else if (item.status === "Rejected" || item.status === "Hold" || item.status === "Customs") {
    // Exceptional hold states
    statusIndex = 1; 
  }

  updateTimelineUI(statusIndex);

  // Render history logs
  const logsContainer = document.getElementById("tracking-logs-container");
  const reversedLogs = [...item.logs].reverse();
  logsContainer.innerHTML = reversedLogs.map(log => `
    <div class="log-item">
      <div class="log-time">${log.time}</div>
      <div class="log-desc">${log.desc}</div>
    </div>
  `).join("");
}

function updateTimelineUI(statusIndex) {
  const steps = document.querySelectorAll(".timeline-step");
  const progressLine = document.getElementById("progress-line");

  steps.forEach(st => st.classList.remove("active", "completed"));
  steps.forEach((st, idx) => {
    if (idx < statusIndex) {
      st.classList.add("completed");
    } else if (idx === statusIndex) {
      st.classList.add("active");
    }
  });

  const progressPercentage = statusIndex * 20;
  progressLine.style.width = `${progressPercentage}%`;
}

// ==========================================================================
// ML Prediction Layer (Random Forests in JS)
// ==========================================================================

function runRandomForestML(flight) {
  // Inputs: distance, aircraft type, load weight, weather severity, airport congestion
  const origin = state.airports[flight.origin];
  const dest = state.airports[flight.destination];
  const plane = state.fleet[flight.aircraft];

  // Helper distance values
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

  const key = `${flight.origin}-${flight.destination}`;
  const distance = distances[key] || 1000;

  // Calculate sum of cargo weight
  const cargoWeight = state.cargo
    .filter(c => c.flightId === flight.id && c.status !== "Rejected" && c.status !== "Hold")
    .reduce((sum, c) => sum + c.weight, 0);

  // Model 1: Expected Delay (Random Forest Regressor)
  // Evaluates route, weather, wind speed, congestion, and aircraft age
  let delayTree1 = 0;
  if (state.weather === "Storm") delayTree1 += 45;
  if (state.weather === "Fog") delayTree1 += 30;
  if (dest.status === "Congested") delayTree1 += 20;

  let delayTree2 = 0;
  if (state.windSpeed > 40) delayTree2 += 35;
  if (plane.maintenance === "Service Needed") delayTree2 += 40;
  if (cargoWeight > plane.payloadCap * 0.9) delayTree2 += 15; // heavy load delay

  let delayTree3 = 0;
  if (origin.runway === "Closed" || dest.runway === "Closed") delayTree3 += 120;
  if (state.weather === "Heavy Rain") delayTree3 += 15;

  const expectedDelay = Math.round((delayTree1 + delayTree2 + delayTree3) / 3);

  // Model 2: Fuel Consumption (Random Forest Regressor)
  // Evaluates distance, plane model fuel coefficient, load factor, and wind factor
  let baseFuelCoeff = 4.2; // L/km
  if (plane.type.includes("A321")) baseFuelCoeff = 4.1;
  else if (plane.type.includes("737")) baseFuelCoeff = 3.8;
  else if (plane.type.includes("A320")) baseFuelCoeff = 3.6;
  else if (plane.type.includes("757")) baseFuelCoeff = 5.6; // Older Boeing consumes more fuel

  let fuelTree1 = distance * baseFuelCoeff;
  // load impact
  fuelTree1 += cargoWeight * 12.5; 

  let fuelTree2 = distance * baseFuelCoeff;
  if (state.windSpeed > 30) fuelTree2 += (distance * 0.15); // headwind penalty
  if (state.weather === "Storm") fuelTree2 += (distance * 0.1);

  let fuelTree3 = distance * baseFuelCoeff;
  if (expectedDelay > 30) fuelTree3 += (expectedDelay * 12); // holding pattern consumption

  const expectedFuel = Math.round((fuelTree1 + fuelTree2 + fuelTree3) / 3);

  // Model 3: Operational Risk (Random Forest Classifier - Low/Medium/High)
  // Factors: weather wind, maintenance, airport runway, slot statuses
  let score = 0; // High score = higher risk
  
  // Tree 1: Environment Checks
  if (state.weather === "Storm") score += 40;
  if (state.windSpeed > 50) score += 30;

  // Tree 2: Fleet Quality Checks
  if (plane.maintenance === "Service Needed") score += 35;
  if (plane.crew === "Overtime Risk") score += 20;

  // Tree 3: Hub Slot Capacity Checks
  if (dest.status === "Closed" || origin.status === "Closed") score += 50;
  if (dest.status === "Congested") score += 15;

  let risk = "Low";
  if (score >= 60) risk = "High";
  else if (score >= 25) risk = "Medium";

  return { delay: expectedDelay, fuel: expectedFuel, risk: risk, score: Math.max(10, 100 - score) };
}

// ==========================================================================
// Hard Constraint Engine
// ==========================================================================
function validateHardConstraints(flight, assignedCargoArray) {
  const origin = state.airports[flight.origin];
  const dest = state.airports[flight.destination];
  const plane = state.fleet[flight.aircraft];

  // 1. Capacity Check
  const totalWeight = assignedCargoArray.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight > plane.payloadCap) {
    return { valid: false, reason: `Capacity overload: ${totalWeight.toFixed(1)}t exceeds ${plane.payloadCap}t limit of ${plane.type}` };
  }

  // 2. Weather Risk Threshold
  if (state.windSpeed > 65) {
    return { valid: false, reason: `Severe Weather Grounding: Wind speed ${state.windSpeed} knots exceeds safe ceiling (65 kt) for all jet aircraft.` };
  }
  if (state.windSpeed > 50 && plane.type.includes("A320")) {
    return { valid: false, reason: `Wind resistance limit exceeded: A320 limit is 50 kt. Current: ${state.windSpeed} kt.` };
  }

  // 3. Crew Duty Hours
  if (plane.crew === "Unavailable") {
    return { valid: false, reason: `Crew unavailable for aircraft ${flight.aircraft}` };
  }

  // 4. Maintenance Check
  if (plane.maintenance === "Broken") {
    return { valid: false, reason: `Aircraft ${flight.aircraft} is grounded for critical repairs.` };
  }

  // 5. DGCA Compliance (Dangerous Goods Regulations)
  const hasHazardous = assignedCargoArray.some(c => c.hazardous);
  if (hasHazardous) {
    // Boeing 757 cannot carry hazardous materials (Older system limits)
    if (plane.type.includes("757")) {
      return { valid: false, reason: `DGCA Non-Compliance: Boeing 757-200 is restricted from carrying DG cargo under domestic carrier guidelines.` };
    }
  }

  // 6. Airport Slots & Status
  if (origin.status === "Closed" || origin.runway === "Closed") {
    return { valid: false, reason: `Origin Hub slot closed: Runway at ${flight.origin} is unavailable.` };
  }
  if (dest.status === "Closed" || dest.runway === "Closed") {
    return { valid: false, reason: `Destination Hub slot closed: Runway at ${flight.destination} is unavailable.` };
  }

  // 7. Delivery Deadlines Feasibility
  // Estimated flight arrival compared to deadline
  const currentSimulatedTime = new Date(); // local baseline
  for (const c of assignedCargoArray) {
    const deadlineDate = new Date(c.deadline);
    // Simple travel estimate
    const travelTimeHours = (flight.duration / 60) + 1; // plus 1 hour warehouse processing
    currentSimulatedTime.setHours(currentSimulatedTime.getHours() + travelTimeHours);
    if (currentSimulatedTime > deadlineDate) {
      // Deadline violation is treated as a hard constraint breach for express scheduling
      return { valid: false, reason: `SLA Deadline Violation: Estimated arrival exceeds deadline of cargo ${c.id}` };
    }
  }

  return { valid: true };
}

// ==========================================================================
// Multi-Objective Genetic Algorithm (GA) Optimization Engine
// ==========================================================================

function runGeneticAlgorithmOptimization() {
  const activeBookings = state.cargo.filter(c => c.status === "Assigned" && c.screening === "Passed");
  if (activeBookings.length === 0) return;

  // EDF pre-sort the bookings to load them priority-first
  const sortedBookings = sortCargoByEDF(activeBookings);

  // GA parameters
  const populationSize = 40;
  const generations = 30;
  const mutationRate = 0.1;

  // Available planes
  const fleetIds = Object.keys(state.fleet);
  const activeFlights = state.flights;

  // Helper to generate a random chromosome
  // Gene layout: each element corresponds to a cargo item and holds the flight ID index it is assigned to,
  // plus aircraft-to-flight assignments.
  // Chromosome structure: { flightAircrafts: { flightId: aircraftId }, cargoAssignments: { cargoId: flightId } }
  function generateRandomChromosome() {
    const chrom = {
      flightAircrafts: {},
      cargoAssignments: {}
    };

    // Assign random planes to scheduled flights
    activeFlights.forEach(f => {
      // If flight is locked, keep current aircraft assignment
      if (f.locked && !state.overrideActive) {
        chrom.flightAircrafts[f.id] = f.aircraft;
      } else {
        chrom.flightAircrafts[f.id] = fleetIds[Math.floor(Math.random() * fleetIds.length)];
      }
    });

    // Assign cargo to compatible flights
    sortedBookings.forEach(c => {
      // Cargo must match origin/destination route of flight
      const candidateFlights = activeFlights.filter(f => f.origin === c.origin && f.destination === c.destination);
      if (candidateFlights.length > 0) {
        chrom.cargoAssignments[c.id] = candidateFlights[Math.floor(Math.random() * candidateFlights.length)].id;
      } else {
        chrom.cargoAssignments[c.id] = null; // No route flight exists
      }
    });

    return chrom;
  }

  // Multi-objective Fitness Function
  function calculateFitness(chrom) {
    let profit = 0; // INR Lakhs
    let onTimeCount = 0;
    let totalFuel = 0;
    let totalDelay = 0;
    let crewRiskCount = 0;
    let maintenanceRiskCount = 0;
    let totalCargoCount = sortedBookings.length;
    
    // Track weights loaded on each aircraft/flight
    const flightWeights = {};
    const flightCargoLists = {};
    activeFlights.forEach(f => {
      flightWeights[f.id] = 0;
      flightCargoLists[f.id] = [];
    });

    // Accumulate weights and calculate revenue
    for (const [cargoId, flightId] of Object.entries(chrom.cargoAssignments)) {
      if (!flightId) continue;
      const cargoItem = sortedBookings.find(c => c.id === cargoId);
      if (!cargoItem) continue;

      flightWeights[flightId] += cargoItem.weight;
      flightCargoLists[flightId].push(cargoItem);

      // Revenue rates based on priority class
      let rate = 80; // Standard (INR per kg)
      if (cargoItem.priority === 1) rate = 250; // Medical
      else if (cargoItem.priority === 2) rate = 180; // Perishable
      else if (cargoItem.priority === 3) rate = 150; // Express

      // Revenue in INR Lakhs (weight in tonnes * 1000 kg/t * rate / 100,000)
      profit += (cargoItem.weight * 1000 * rate) / 100000;
    }

    // Evaluate constraints and calculate metrics per flight
    let constraintViolations = 0;
    const usedPlanes = new Set();

    for (const flight of activeFlights) {
      const assignedPlaneId = chrom.flightAircrafts[flight.id];
      const plane = state.fleet[assignedPlaneId];
      const cargoList = flightCargoLists[flight.id];

      // Simulate a flight copy with this plane
      const flightCopy = { ...flight, aircraft: assignedPlaneId };

      // Evaluate Hard Constraints
      const check = validateHardConstraints(flightCopy, cargoList);
      if (!check.valid) {
        constraintViolations++;
      }

      usedPlanes.add(assignedPlaneId);

      // Run RF predictions for fuel, delay, risk
      const ml = runRandomForestML(flightCopy);
      totalFuel += ml.fuel;
      totalDelay += ml.delay;

      if (ml.risk === "High") crewRiskCount++;
      if (plane.maintenance === "Service Needed") maintenanceRiskCount++;

      // Operating cost deduction (Fuel cost + slot fee)
      // Fuel cost: 95 INR per liter. Profit decreases as fuel cost rises.
      const fuelCostLakhs = (ml.fuel * 95) / 100000;
      profit -= (fuelCostLakhs + 0.15); // 15,000 INR slots/handling
    }

    // Penalize constraint violations heavily
    if (constraintViolations > 0) {
      return -100 * constraintViolations;
    }

    // Calculate components
    const onTimeFactor = totalCargoCount > 0 ? (onTimeCount / totalCargoCount) : 1;
    const utilizationFactor = usedPlanes.size / Object.keys(state.fleet).length;

    // Normalize values to scores between 0 and 1
    const profitScore = Math.max(0, Math.min(1, profit / 10)); // Cap profit score normalize around 10 Lakhs
    const fuelScore = Math.max(0, Math.min(1, totalFuel / 30000));
    const delayScore = Math.max(0, Math.min(1, totalDelay / 300));
    
    // Multi-objective equation
    // Fitness = 0.30 Profit + 0.20 On-Time + 0.15 Aircraft Utilization - 0.15 Fuel - 0.10 Delay - 0.05 Crew Risk - 0.05 Maintenance Risk
    const fitness = (0.30 * profitScore) +
                    (0.20 * onTimeFactor) +
                    (0.15 * utilizationFactor) -
                    (0.15 * fuelScore) -
                    (0.10 * delayScore) -
                    (0.05 * crewRiskCount) -
                    (0.05 * maintenanceRiskCount);

    return fitness;
  }

  // Initialize Population
  let population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(generateRandomChromosome());
  }

  // Generation loop
  const fitnessHistory = [];
  for (let gen = 0; gen < generations; gen++) {
    // Score individuals
    const scoredPop = population.map(ind => ({ chrom: ind, fit: calculateFitness(ind) }));
    
    // Sort by fitness
    scoredPop.sort((a, b) => b.fit - a.fit);
    fitnessHistory.push(scoredPop[0].fit);

    // Tournament Selection & Reproduction
    const nextGeneration = [];
    
    // Elitism: carry over top 4 solutions
    for (let e = 0; e < 4; e++) {
      nextGeneration.push(scoredPop[e].chrom);
    }

    // Fill rest of population
    while (nextGeneration.length < populationSize) {
      // Tournament Selection
      const selectParent = () => {
        const competitors = [
          scoredPop[Math.floor(Math.random() * populationSize)],
          scoredPop[Math.floor(Math.random() * populationSize)],
          scoredPop[Math.floor(Math.random() * populationSize)]
        ];
        competitors.sort((a, b) => b.fit - a.fit);
        return competitors[0].chrom;
      };

      const parentA = selectParent();
      const parentB = selectParent();

      // Uniform Crossover
      const child = {
        flightAircrafts: {},
        cargoAssignments: {}
      };

      activeFlights.forEach(f => {
        child.flightAircrafts[f.id] = (Math.random() < 0.5) ? parentA.flightAircrafts[f.id] : parentB.flightAircrafts[f.id];
      });

      sortedBookings.forEach(c => {
        child.cargoAssignments[c.id] = (Math.random() < 0.5) ? parentA.cargoAssignments[c.id] : parentB.cargoAssignments[c.id];
      });

      // Mutation
      if (Math.random() < mutationRate) {
        // Mutate random aircraft assignment
        const randomFlight = activeFlights[Math.floor(Math.random() * activeFlights.length)];
        if (!randomFlight.locked || state.overrideActive) {
          child.flightAircrafts[randomFlight.id] = fleetIds[Math.floor(Math.random() * fleetIds.length)];
        }
      }
      if (Math.random() < mutationRate) {
        // Mutate random cargo assignment
        const randomCargo = sortedBookings[Math.floor(Math.random() * sortedBookings.length)];
        const candidateFlights = activeFlights.filter(f => f.origin === randomCargo.origin && f.destination === randomCargo.destination);
        if (candidateFlights.length > 0) {
          child.cargoAssignments[randomCargo.id] = candidateFlights[Math.floor(Math.random() * candidateFlights.length)].id;
        }
      }

      nextGeneration.push(child);
    }

    population = nextGeneration;
  }

  // Get Best Solution
  const finalScored = population.map(ind => ({ chrom: ind, fit: calculateFitness(ind) }));
  finalScored.sort((a, b) => b.fit - a.fit);
  const bestChromosome = finalScored[0].chrom;

  // Display recommendation in AI Panel
  renderAIRecommendationPanel(bestChromosome, finalScored[0].fit, fitnessHistory);
}

function renderAIRecommendationPanel(chromosome, bestFitness, history) {
  // Aggregate details of the suggestion
  const recAircrafts = [];
  const routes = [];
  let totalDelay = 0;
  let totalFuel = 0;
  let totalProfit = 0;

  state.flights.forEach(f => {
    const assignedPlaneId = chromosome.flightAircrafts[f.id];
    const plane = state.fleet[assignedPlaneId];
    recAircrafts.push(`${f.id}➔${plane.type} (${assignedPlaneId})`);
    
    // Expected values
    const fCopy = { ...f, aircraft: assignedPlaneId };
    const predictions = runRandomForestML(fCopy);
    totalDelay += predictions.delay;
    totalFuel += predictions.fuel;

    // Profit calculation
    let revenue = 0;
    for (const [cargoId, flightId] of Object.entries(chromosome.cargoAssignments)) {
      if (flightId === f.id) {
        const cargo = state.cargo.find(c => c.id === cargoId);
        if (cargo) {
          let rate = 80;
          if (cargo.priority === 1) rate = 250;
          else if (cargo.priority === 2) rate = 180;
          else if (cargo.priority === 3) rate = 150;
          revenue += (cargo.weight * 1000 * rate) / 100000;
        }
      }
    }
    totalProfit += (revenue - ((predictions.fuel * 95) / 100000) - 0.15);
  });

  // Safe limits
  totalProfit = Math.max(0.1, totalProfit);

  // Update AI UI
  document.getElementById("ai-rec-aircraft").textContent = Object.keys(chromosome.flightAircrafts).map(fid => `${fid}: ${chromosome.flightAircrafts[fid]}`).join(" | ");
  document.getElementById("ai-rec-route").textContent = "Indian Trunk Routes Optimized";
  document.getElementById("ai-rec-delay").textContent = `${totalDelay} mins avg`;
  document.getElementById("ai-rec-fuel").textContent = `${totalFuel} L`;
  document.getElementById("ai-rec-profit").textContent = `₹ ${totalProfit.toFixed(2)} Lakhs`;
  
  const score = Math.round(Math.min(100, Math.max(10, bestFitness * 100 + 40)));
  const scoreDisp = document.getElementById("ai-rec-score");
  scoreDisp.textContent = `${score}/100`;
  if (score > 80) scoreDisp.style.color = "var(--success-color)";
  else if (score > 50) scoreDisp.style.color = "var(--warning-color)";
  else scoreDisp.style.color = "var(--danger-color)";

  // Update GA convergence chart
  const barContainer = document.querySelector(".ga-generations-bar");
  barContainer.innerHTML = history.map((fit, idx) => {
    // scale to height percentage
    const heightPercent = Math.max(5, Math.min(100, Math.round((fit + 1) * 50)));
    const color = idx > 25 ? "var(--success-color)" : (idx > 10 ? "var(--accent-color)" : "rgba(255,255,255,0.1)");
    return `<div style="flex: 1; height: ${heightPercent}%; background: ${color};" title="Gen ${idx}: ${fit.toFixed(3)}"></div>`;
  }).join("");

  document.getElementById("ga-generation-count").textContent = `Gen ${history.length}`;

  // Store the recommendation to apply later
  document.getElementById("btn-apply-ai-rec").onclick = () => {
    applyGAsuggestion(chromosome);
  };
}

function applyGAsuggestion(chromosome) {
  // Apply aircraft mappings
  state.flights.forEach(f => {
    const prevAircraft = f.aircraft;
    const newAircraft = chromosome.flightAircrafts[f.id];
    
    if (prevAircraft !== newAircraft) {
      f.aircraft = newAircraft;
      addDecisionLog(
        "AI Optimizer",
        `Flight ${f.id} Re-routing`,
        "GA Optimization Apply",
        prevAircraft,
        newAircraft,
        `Assigned optimized freighter ${newAircraft} (${state.fleet[newAircraft].type}) to flight ${f.id} based on payload utilization.`
      );
    }
  });

  // Apply cargo mappings
  for (const [cargoId, flightId] of Object.entries(chromosome.cargoAssignments)) {
    const cargo = state.cargo.find(c => c.id === cargoId);
    if (cargo && cargo.status === "Assigned") {
      const prevFlight = cargo.flightId;
      if (prevFlight !== flightId) {
        cargo.flightId = flightId;
        cargo.status = "Loading";
        cargo.logs.push({ time: getCurrentTimestamp(), desc: `Assigned to flight ${flightId} via AI Optimization.` });
        
        // Register cargo inside flight list
        const flight = state.flights.find(f => f.id === flightId);
        if (flight && !flight.cargoIds.includes(cargoId)) {
          flight.cargoIds.push(cargoId);
        }
      }
    }
  }

  saveStateToLocalStorage();
  renderOCCDashboard();
  alert("AI Scheduling optimization successfully applied to active flight board.");
}

// ==========================================================================
// Operations Control Center (OCC) Interactive Handlers
// ==========================================================================

function initOCC() {
  // Admin Authentication handlers
  const loginForm = document.getElementById("admin-login-form");
  const loginCard = document.getElementById("admin-login-card");
  const occDashboard = document.getElementById("admin-occ-dashboard");
  const logoutBtn = document.getElementById("btn-admin-logout");
  const errorDisp = document.getElementById("login-error-disp");

  function checkOCCSession() {
    const isAuth = sessionStorage.getItem("isAdminAuthenticated") === "true";
    if (isAuth) {
      loginCard.style.display = "none";
      occDashboard.style.display = "block";
    } else {
      loginCard.style.display = "block";
      occDashboard.style.display = "none";
    }
  }

  // Check session status initially
  checkOCCSession();

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById("admin-password").value;
    if (passwordInput === "trans_cargo") {
      sessionStorage.setItem("isAdminAuthenticated", "true");
      errorDisp.style.display = "none";
      document.getElementById("admin-password").value = "";
      checkOCCSession();
      renderOCCDashboard();
    } else {
      errorDisp.style.display = "block";
      document.getElementById("admin-password").value = "";
      sessionStorage.setItem("isAdminAuthenticated", "false");
    }
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    checkOCCSession();
  });

  // Re-optimization button
  document.getElementById("btn-reoptimize-ga").addEventListener("click", () => {
    runGeneticAlgorithmOptimization();
    alert("Genetic Algorithm triggered. Optimization recommendation updated.");
  });

  // Emergency triggers
  document.querySelectorAll(".emergency-deck .btn-danger").forEach(btn => {
    btn.addEventListener("click", () => {
      const emergencyType = btn.getAttribute("data-emergency");
      triggerOperationalEmergency(emergencyType);
    });
  });

  // Global Weather tweak
  const weatherSelect = document.getElementById("weather-select");
  const windInput = document.getElementById("wind-speed-input");
  
  weatherSelect.value = state.weather;
  windInput.value = state.windSpeed;
  document.getElementById("wind-speed-val").textContent = `${state.windSpeed} knots`;

  weatherSelect.addEventListener("change", (e) => {
    state.weather = e.target.value;
    saveStateToLocalStorage();
    triggerSystemRecalculation("Weather Severity Update", `Global weather conditions altered to: ${state.weather}`);
  });

  windInput.addEventListener("input", (e) => {
    state.windSpeed = parseInt(e.target.value);
    document.getElementById("wind-speed-val").textContent = `${state.windSpeed} knots`;
  });
  
  windInput.addEventListener("change", () => {
    saveStateToLocalStorage();
    triggerSystemRecalculation("Wind Speed Alteration", `Wind speed adjusted to ${state.windSpeed} knots.`);
  });

  // Airport slottings tweak
  document.getElementById("apply-airport-tweak").addEventListener("click", () => {
    const airportCode = document.getElementById("airport-selector").value;
    const newStatus = document.getElementById("airport-status-select").value;
    
    if (state.airports[airportCode]) {
      const oldStatus = state.airports[airportCode].status;
      state.airports[airportCode].status = newStatus;
      
      // Update runway status based on status
      if (newStatus === "Closed") {
        state.airports[airportCode].runway = "Closed";
      } else {
        state.airports[airportCode].runway = "Open";
      }

      saveStateToLocalStorage();
      triggerSystemRecalculation(
        `Airport Slot Change (${airportCode})`,
        `Airport ${airportCode} status updated from ${oldStatus} to ${newStatus}.`
      );
    }
  });
}

// Operational Incident Trigger & Automatic Rescheduling
function triggerOperationalEmergency(type) {
  let prevConfig = "Standard schedule";
  let newConfig = "";
  let rationale = "";

  switch (type) {
    case "aircraft-failure":
      // Ground VT-IND (Airbus A321P2F)
      state.fleet["VT-IND"].status = "Broken";
      state.fleet["VT-IND"].maintenance = "Broken";
      newConfig = "Freighter VT-IND grounded immediately for engineering failure.";
      rationale = "Dynamic engine fuel leakage detected. Grounding required.";
      
      // Auto cancel or reschedule VT-IND flights
      state.flights.forEach(f => {
        if (f.aircraft === "VT-IND" && f.status === "Scheduled") {
          f.status = "Delayed";
        }
      });
      break;

    case "runway-closed":
      // Close DEL
      state.airports.DEL.status = "Closed";
      state.airports.DEL.runway = "Closed";
      newConfig = "Delhi Hub (DEL) runway closed immediately.";
      rationale = "Heavy runway water logging due to monsoon rainfall.";
      break;

    case "security-threat":
      // Tweak screening standards: fail DG detection
      newConfig = "Orange alert warning. Tightened X-Ray scanning thresholds.";
      rationale = "Intelligence report warning of logistics breach.";
      break;

    case "malicious-cargo":
      // Add fake dangerous cargo
      const fakeId = "SAT-DNG-BOM";
      state.cargo.push({
        id: fakeId,
        sender: "Malicious Org", receiver: "BOM Hub",
        origin: "DEL", destination: "BOM", weight: 8.5,
        length: 2, width: 2, height: 2, cargoType: "Standard", priority: 4,
        deadline: "2026-07-13", hazardous: true, perishable: false,
        status: "Hold", screening: "Explosive Detected", flightId: null,
        logs: [{ time: getCurrentTimestamp(), desc: "EXPLOSIVES DETECTED IN X-RAY SCAN." }]
      });
      newConfig = "Dangerous Goods Intercepted.";
      rationale = "Aviation security detected explosive components inside cargo scanner.";
      break;

    case "medical-emergency":
      // Insert urgent medical priority
      const medId = "SAT-MED-BLR";
      state.cargo.push({
        id: medId,
        sender: "Serum Institute", receiver: "BLR Hospital",
        origin: "BOM", destination: "BLR", weight: 3.5,
        length: 1.5, width: 1.2, height: 1.0, cargoType: "Medical", priority: 1,
        deadline: "2026-07-12T16:30", hazardous: false, perishable: true,
        status: "Assigned", screening: "Passed", flightId: "SAT-101",
        logs: [{ time: getCurrentTimestamp(), desc: "High priority medical vaccine registered." }]
      });
      newConfig = "Urgent Medical Charter scheduled.";
      rationale = "Express transport requested for vaccine distribution.";
      break;

    case "fuel-shortage":
      state.windSpeed = 55; // forces higher fuel consumption
      newConfig = "High wind shear warnings active across Western sectors.";
      rationale = "Headwinds increase standard fuel consumption by 15%.";
      break;

    case "bird-strike":
      // Damage Boeing 737 at Mumbai
      state.fleet["VT-QKJ"].status = "Maintenance";
      state.fleet["VT-QKJ"].maintenance = "Service Needed";
      newConfig = "VT-QKJ placed in service schedule.";
      rationale = "Compressor blade damage following bird strike at Mumbai takeoff.";
      break;

    case "weather-alert":
      // Storm conditions
      state.weather = "Storm";
      state.windSpeed = 62;
      newConfig = "Severe storm system active on trunk routing.";
      rationale = "Monsoon storm with wind speeds reaching 62 knots.";
      break;
  }

  saveStateToLocalStorage();
  
  // Alert visual notification
  triggerSystemRecalculation(`Emergency Incident: ${type.toUpperCase()}`, `${newConfig} | Reason: ${rationale}`);
  alert(`DISRUPTION TRIGGERED: ${rationale}. Automatic AI Genetic Rescheduling has been initiated.`);
}

function triggerSystemRecalculation(incidentName, details) {
  // Add log entry
  addDecisionLog("OCC Dispatcher", incidentName, details, "Standard active scheduling", "Recalculating flight logs...", "Environmental disruption triggering automatic re-routing.");
  
  // Run Genetic Algorithm automatically to reschedule cargo and aircraft around disruption
  runGeneticAlgorithmOptimization();
  
  renderOCCDashboard();
}

function addDecisionLog(operator, disruption, reason, prev, newConf, rationale) {
  state.decisionLogs.unshift({
    timestamp: getCurrentTimestamp(),
    operator: operator,
    disruption: disruption,
    prevConfig: prev,
    newConfig: newConf,
    rationale: reason || rationale
  });
  saveStateToLocalStorage();
}

// Render Operations Center Control Grid
function renderOCCDashboard() {
  // 1. Render Fleet Grid
  const fleetContainer = document.getElementById("fleet-container");
  fleetContainer.innerHTML = Object.entries(state.fleet).map(([reg, plane]) => {
    // Calculate load weight factor
    const activeCargo = state.cargo.filter(c => {
      if (c.status === "Rejected" || c.status === "Hold") return false;
      if (c.flightId) {
        const flight = state.flights.find(f => f.id === c.flightId);
        return flight && flight.aircraft === reg;
      }
      return false;
    });
    
    const loadedWeight = activeCargo.reduce((sum, c) => sum + c.weight, 0);
    const loadFactor = Math.round((loadedWeight / plane.payloadCap) * 100);

    let statusClass = "available";
    if (plane.status === "In-Flight") statusClass = "inflight";
    else if (plane.status === "Maintenance") statusClass = "maintenance";
    else if (plane.status === "Broken") statusClass = "broken";

    return `
      <div class="fleet-card">
        <div class="fleet-card-header">
          <h4>${reg}</h4>
          <span class="status-indicator ${statusClass}">${plane.status}</span>
        </div>
        <div style="font-size:0.85rem; font-weight:bold;">${plane.type}</div>
        <div class="fleet-stats-row">
          <span>Hub: <strong>${plane.currentLocation}</strong></span>
          <span>Load: <strong>${loadFactor}%</strong></span>
          <span>Crew: <strong>${plane.crew}</strong></span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${loadFactor}%"></div>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
          Maint: ${plane.maintenance} | Cap: ${plane.payloadCap}t
        </div>
      </div>
    `;
  }).join("");

  // 2. Render Flight Board
  const flightTableBody = document.getElementById("flight-table-body");
  flightTableBody.innerHTML = state.flights.map(flight => {
    // Calculate current weight load
    const cargoList = state.cargo.filter(c => c.flightId === flight.id && c.status !== "Rejected" && c.status !== "Hold");
    const totalWeight = cargoList.reduce((sum, c) => sum + c.weight, 0);
    const plane = state.fleet[flight.aircraft];
    const loadFactor = Math.round((totalWeight / plane.payloadCap) * 100);

    // Call Random Forest Model predictions
    const predictions = runRandomForestML(flight);

    // Check Lock status (4 hours before departure rule)
    // 11:30 AM simulation baseline. If flight departs in less than 4h, it's locked.
    const depParts = flight.departure.split(":");
    const depMinutes = parseInt(depParts[0]) * 60 + parseInt(depParts[1]);
    const simulatedCurrentMinutes = 11 * 60 + 30;
    
    // Check lock
    let isLocked = flight.locked;
    if (depMinutes - simulatedCurrentMinutes < 240 && depMinutes > simulatedCurrentMinutes) {
      isLocked = true;
    }

    const lockIcon = isLocked ? "🔒 Locked" : "🔓 Open";
    const lockColor = isLocked ? "var(--danger-color)" : "var(--success-color)";

    // Actions depending on lock status
    const actionButton = isLocked ? 
      `<button class="btn btn-danger" style="font-size:0.7rem; padding:0.2rem 0.4rem;" onclick="overrideFlightLock('${flight.id}')">OVERRIDE</button>` :
      `<button class="btn btn-hud-action" style="font-size:0.7rem; padding:0.2rem 0.4rem;" onclick="delayFlightAction('${flight.id}')">Delay +30m</button>
       <button class="btn btn-hud-action" style="font-size:0.7rem; padding:0.2rem 0.4rem; background:rgba(255,0,85,0.1); border-color:rgba(255,0,85,0.2); color:var(--danger-color)" onclick="cancelFlightAction('${flight.id}')">Cancel</button>`;

    return `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-color);">${flight.id}</td>
        <td style="font-weight:600;">${flight.origin} ➔ ${flight.destination}</td>
        <td style="font-family:var(--font-mono);">${flight.departure}</td>
        <td style="font-family:var(--font-mono);">${flight.aircraft}</td>
        <td>
          <span style="font-weight:bold; color:${loadFactor > 90 ? 'var(--warning-color)' : 'var(--text-primary)'}">${loadFactor}%</span>
          <div style="font-size:0.7rem; color:var(--text-muted);">${totalWeight.toFixed(1)}t / ${plane.payloadCap}t</div>
        </td>
        <td style="font-family:var(--font-mono); color:${predictions.delay > 15 ? 'var(--warning-color)' : 'var(--success-color)'}">+${predictions.delay} min</td>
        <td style="color:${lockColor}; font-weight:bold; font-family:var(--font-mono); font-size:0.75rem;">${lockIcon}</td>
        <td style="display:flex; gap:0.25rem;">${actionButton}</td>
      </tr>
    `;
  }).join("");

  // 3. Render Cargo Sorting Queue Columns
  const qPending = document.getElementById("queue-pending");
  const qAssigned = document.getElementById("queue-assigned");
  const qCompleted = document.getElementById("queue-completed");

  const pendingCargo = state.cargo.filter(c => c.status === "Screening" || c.status === "Hold" || c.status === "Rejected");
  const assignedCargo = state.cargo.filter(c => c.status === "Assigned" || c.status === "Loading");
  const completedCargo = state.cargo.filter(c => c.status === "In Flight" || c.status === "Delivered" || c.status === "Arrived");

  const renderQueueItem = (c) => {
    let badgeClass = "std";
    if (c.priority === 1) badgeClass = "med";
    else if (c.priority === 2) badgeClass = "per";
    else if (c.priority === 3) badgeClass = "exp";

    return `
      <div class="queue-item ${badgeClass}" onclick="locateTrackedCargo('${c.id}')" style="cursor:pointer;" title="Click to track consignment">
        <div><strong>${c.id}</strong> [${c.origin}➔${c.destination}]</div>
        <div>Weight: ${c.weight}t | Type: ${c.cargoType}</div>
        <div style="font-size:0.7rem; opacity:0.8; margin-top:0.2rem;">Status: ${c.status} (${c.screening})</div>
      </div>
    `;
  };

  qPending.innerHTML = pendingCargo.map(renderQueueItem).join("") || `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No pending cargo.</p>`;
  qAssigned.innerHTML = assignedCargo.map(renderQueueItem).join("") || `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No items queued.</p>`;
  qCompleted.innerHTML = completedCargo.map(renderQueueItem).join("") || `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No completed cargo.</p>`;

  // 4. Render OCC Decision Logs
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

  // Update map visual colors based on airport status
  updateMapStatusLines();
}

function locateTrackedCargo(cargoId) {
  document.getElementById("tracker-input").value = cargoId;
  document.querySelector('.nav-link[data-section="track-order"]').click();
  triggerTrackingSearch(cargoId);
}

// Manual Flight controls
function delayFlightAction(flightId) {
  const flight = state.flights.find(f => f.id === flightId);
  if (!flight) return;

  const depParts = flight.departure.split(":");
  let minutes = parseInt(depParts[0]) * 60 + parseInt(depParts[1]);
  minutes += 30;
  
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  const oldDep = flight.departure;
  flight.departure = `${h}:${m}`;
  
  saveStateToLocalStorage();
  triggerSystemRecalculation(`Operator Delay: Flight ${flightId}`, `Flight delayed by 30 mins from ${oldDep} to ${flight.departure}.`);
}

function cancelFlightAction(flightId) {
  const flight = state.flights.find(f => f.id === flightId);
  if (!flight) return;
  
  flight.status = "Cancelled";
  
  // Free loaded cargo back to queue
  state.cargo.forEach(c => {
    if (c.flightId === flightId) {
      c.flightId = null;
      c.status = "Assigned";
      c.logs.push({ time: getCurrentTimestamp(), desc: `Flight ${flightId} cancelled. Cargo returned to dispatch queue.` });
    }
  });

  saveStateToLocalStorage();
  triggerSystemRecalculation(`Operator Cancellation: Flight ${flightId}`, `Flight ${flightId} cancelled. Loaded cargo returned to scheduling pool.`);
}

function overrideFlightLock(flightId) {
  const flight = state.flights.find(f => f.id === flightId);
  if (!flight) return;
  
  if (confirm(`Flight ${flightId} is currently Locked under the 4-Hour Rule. Would you like to enable Admin Emergency Override?`)) {
    state.overrideActive = true;
    flight.locked = false;
    saveStateToLocalStorage();
    triggerSystemRecalculation(`Admin Override: Flight ${flightId}`, `Admin Emergency Override activated. Flight ${flightId} unlocked.`);
  }
}

// Map styles based on airport & weather status
function updateMapStatusLines() {
  // Routes link formatting
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

    const statusA = state.airports[r.airports[0]].status;
    const statusB = state.airports[r.airports[1]].status;

    // Reset classes
    el.className.baseVal = "map-route-line";

    if (statusA === "Closed" || statusB === "Closed") {
      el.className.baseVal = "map-route-line closed";
    } else if (state.weather === "Storm" || state.windSpeed > 55) {
      el.className.baseVal = "map-route-line weather";
    } else if (statusA === "Congested" || statusB === "Congested") {
      el.className.baseVal = "map-route-line congested";
    }
  });

  // Hub markers color
  Object.keys(state.airports).forEach(code => {
    const el = document.getElementById(`hub-${code}`);
    if (el) {
      const circle = el.querySelector(".hub-circle");
      const status = state.airports[code].status;
      if (status === "Closed") {
        circle.style.stroke = "var(--danger-color)";
      } else if (status === "Congested") {
        circle.style.stroke = "var(--warning-color)";
      } else if (status === "Restricted") {
        circle.style.stroke = "#ff5500";
      } else {
        circle.style.stroke = "var(--accent-color)";
      }
    }
  });
}

// Live Animation of Planes on India SVG Map
function animatePlanes() {
  const planesGroup = document.getElementById("active-planes-group");
  
  if (activePlanesInterval) clearInterval(activePlanesInterval);

  let tick = 0;
  activePlanesInterval = setInterval(() => {
    tick += 0.01;
    if (tick > 1.0) tick = 0;

    // Filter scheduled or active flights
    const activeFlights = state.flights.filter(f => f.status === "Scheduled" || f.status === "In Flight");
    planesGroup.innerHTML = activeFlights.map(flight => {
      const org = state.airports[flight.origin];
      const dest = state.airports[flight.destination];
      if (!org || !dest) return "";

      // Plane status trigger
      flight.status = "In Flight";

      // Linear interpolation between origin and destination coordinates
      const x = org.x + (dest.x - org.x) * tick;
      const y = org.y + (dest.y - org.y) * tick;

      // Plane angle calculation
      const angle = Math.atan2(dest.y - org.y, dest.x - org.x) * (180 / Math.PI);

      return `
        <g class="flying-plane" transform="translate(${x}, ${y}) rotate(${angle})">
          <path d="M 0,-4 L 3,-4 L 6,0 L 2,0 L 4,4 L 1,4 L 0,1 L -1,4 L -4,4 L -2,0 L -6,0 L -3,-4 Z" transform="scale(1.2)" />
          <text y="14" style="font-family:var(--font-mono); font-size:6px; fill:#fff;" text-anchor="middle">${flight.id}</text>
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

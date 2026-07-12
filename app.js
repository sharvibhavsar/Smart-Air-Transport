// In-memory data store for shipments
let shipments = [
  {
    id: "SAT-8291-NY",
    sender: "AeroTech Labs",
    receiver: "Global Comm Corp",
    origin: "New York (JFK)",
    destination: "London (LHR)",
    weight: 5.2,
    priority: "Express",
    contents: "Critical server prototypes & optical network cards",
    status: 2, // 0: Booked, 1: Received, 2: In Flight, 3: Arrived, 4: Delivered
    price: 185.00,
    eta: "Today, 18:30 GMT",
    logs: [
      { time: "2026-07-12 08:15", desc: "Cargo flight departure from JFK Terminal 4, airspace transit initiated." },
      { time: "2026-07-12 05:40", desc: "Security screening passed and palletized for high-speed jet transit." },
      { time: "2026-07-12 04:10", desc: "Cargo received and registered at JFK Smart Air Hub." },
      { time: "2026-07-11 23:50", desc: "Takeoff booking confirmed by AeroTech Labs." }
    ]
  },
  {
    id: "SAT-4902-TO",
    sender: "BioMed Tokyo",
    receiver: "Mumbai Medical",
    origin: "Tokyo (HND)",
    destination: "Mumbai (BOM)",
    weight: 1.8,
    priority: "Hyper",
    contents: "Temperature-sensitive medical enzymes",
    status: 4, // Delivered
    price: 245.50,
    eta: "Completed",
    logs: [
      { time: "2026-07-11 14:20", desc: "Handed over to consignee. Delivery receipt signed digitally." },
      { time: "2026-07-11 13:05", desc: "Customs clearance completed at BOM Air Cargo terminal." },
      { time: "2026-07-11 11:30", desc: "Touchdown at Mumbai Airport. Cargo offloaded and sorted." },
      { time: "2026-07-11 06:15", desc: "Drone flight departure from Tokyo Haneda Hub." },
      { time: "2026-07-11 05:00", desc: "Air booking confirmed. Bio-protective container sealed." }
    ]
  }
];

// Active user session state
let currentManager = null;

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initRouting();
  initOrderForm();
  initTracker();
  initLogin();
  setupMobileMenu();
});

/* ==========================================================================
   Theme Management
   ========================================================================== */
function initTheme() {
  const themeBtn = document.getElementById("theme-btn");
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
  
  document.documentElement.setAttribute("data-theme", currentTheme);
  
  themeBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = activeTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

/* ==========================================================================
   SPA Router & Navigation
   ========================================================================== */
function initRouting() {
  const navLinks = document.querySelectorAll(".nav-link");
  const logoNav = document.getElementById("logo-nav");
  const ctaPlaceOrder = document.getElementById("cta-place-order");
  const ctaTrackOrder = document.getElementById("cta-track-order");
  
  // Handle tab active switching
  function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll(".app-section").forEach(sec => {
      sec.classList.remove("active");
    });
    
    // Deactivate all nav links
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-section") === sectionId) {
        link.classList.add("active");
      }
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.add("active");
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Close mobile nav menu
    document.getElementById("nav-menu").classList.remove("active");
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      navigateTo(section);
      window.location.hash = section;
    });
  });

  // Home logo click
  logoNav.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("home");
    window.location.hash = "home";
  });

  // Home CTAs
  ctaPlaceOrder.addEventListener("click", () => {
    navigateTo("place-order");
    window.location.hash = "place-order";
  });
  
  ctaTrackOrder.addEventListener("click", () => {
    navigateTo("track-order");
    window.location.hash = "track-order";
  });

  // Handle URL hash on load
  const hash = window.location.hash.substring(1);
  if (["home", "place-order", "track-order", "login"].includes(hash)) {
    navigateTo(hash);
  }
}

/* ==========================================================================
   Mobile Navigation Drawer
   ========================================================================== */
function setupMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle-btn");
  const navMenu = document.getElementById("nav-menu");
  
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

/* ==========================================================================
   Booking / Order Form Logic
   ========================================================================== */
function initOrderForm() {
  const form = document.getElementById("order-form");
  const formFields = document.querySelectorAll("#order-form input, #order-form select");
  const estDuration = document.getElementById("est-duration");
  const estPrice = document.getElementById("est-price");
  
  const originSelect = document.getElementById("origin-airport");
  const destSelect = document.getElementById("destination-airport");
  const weightInput = document.getElementById("package-weight");
  const prioritySelect = document.getElementById("shipping-speed");
  
  // Calculate dynamic price estimation
  function calculateEstimates() {
    const origin = originSelect.value;
    const dest = destSelect.value;
    const weight = parseFloat(weightInput.value) || 0;
    const priority = prioritySelect.value;
    
    if (!origin || !dest || origin === dest || weight <= 0) {
      estDuration.textContent = "Select valid airports";
      estPrice.textContent = "$0.00";
      return;
    }
    
    // Simulate flight calculations
    let baseTimeHours = 3;
    let basePricePerKg = 15;
    
    if (origin.includes("Tokyo") && dest.includes("London") || dest.includes("Tokyo") && origin.includes("London")) {
      baseTimeHours = 12;
      basePricePerKg = 25;
    } else if (origin.includes("New York") && dest.includes("Tokyo") || dest.includes("New York") && origin.includes("Tokyo")) {
      baseTimeHours = 14;
      basePricePerKg = 30;
    } else if (origin.includes("Mumbai") && dest.includes("Tokyo") || dest.includes("Mumbai") && origin.includes("Tokyo")) {
      baseTimeHours = 8;
      basePricePerKg = 20;
    } else if (origin.includes("New York") && dest.includes("Mumbai") || dest.includes("New York") && origin.includes("Mumbai")) {
      baseTimeHours = 15;
      basePricePerKg = 32;
    } else if (origin.includes("London") && dest.includes("Mumbai") || dest.includes("London") && origin.includes("Mumbai")) {
      baseTimeHours = 9;
      basePricePerKg = 22;
    }
    
    // Modifier according to priority speed
    let timeModifier = 1.0;
    let priceModifier = 1.0;
    
    if (priority === "Express") {
      timeModifier = 0.6; // 40% faster
      priceModifier = 1.6; // 60% pricier
    } else if (priority === "Hyper") {
      timeModifier = 0.25; // 75% faster
      priceModifier = 2.5; // 150% pricier
    }
    
    const finalHours = Math.max(1, Math.round(baseTimeHours * timeModifier * 10) / 10);
    const totalPrice = Math.round((weight * basePricePerKg * priceModifier) * 100) / 100;
    
    estDuration.textContent = `~ ${finalHours} Hours Transit`;
    estPrice.textContent = `$${totalPrice.toFixed(2)}`;
    
    return { hours: finalHours, price: totalPrice };
  }
  
  // Re-estimate on field change
  formFields.forEach(field => {
    field.addEventListener("change", calculateEstimates);
    field.addEventListener("input", calculateEstimates);
  });
  
  // Submit Order Form
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const origin = originSelect.value;
    const dest = destSelect.value;
    
    if (origin === dest) {
      alert("Origin and Destination hub cannot be the same!");
      return;
    }
    
    const estimates = calculateEstimates();
    const trackingId = generateTrackingId(dest);
    
    // Create new shipment object
    const newShipment = {
      id: trackingId,
      sender: document.getElementById("sender-name").value,
      receiver: document.getElementById("receiver-name").value,
      origin: origin,
      destination: dest,
      weight: parseFloat(weightInput.value),
      priority: prioritySelect.value,
      contents: document.getElementById("package-contents").value,
      status: 0, // Booked
      price: estimates.price,
      eta: `In ~ ${estimates.hours} hours`,
      logs: [
        { time: getCurrentTimestamp(), desc: `Cargo booking logged. Smart Air courier dispatched to pick up package.` }
      ]
    };
    
    // Add to collection
    shipments.unshift(newShipment);
    
    // Update Success screen UI
    document.getElementById("success-tracking-id").textContent = trackingId;
    form.style.display = "none";
    document.getElementById("order-success").style.display = "block";
    
    // Re-render dashboard if manager logged in
    if (currentManager) {
      renderManagerDashboard();
    }
  });

  // Success Screen actions
  document.getElementById("copy-tracking-btn").addEventListener("click", () => {
    const code = document.getElementById("success-tracking-id").textContent;
    navigator.clipboard.writeText(code).then(() => {
      alert("Tracking code copied to clipboard!");
    });
  });

  document.getElementById("success-track-btn").addEventListener("click", () => {
    const code = document.getElementById("success-tracking-id").textContent;
    document.getElementById("tracker-input").value = code;
    
    // Switch to tracking tab
    document.querySelector('.nav-link[data-section="track-order"]').click();
    
    // Run search
    triggerTrackingSearch(code);
    
    // Reset place order screen
    resetPlaceOrderForm();
  });

  document.getElementById("success-new-order-btn").addEventListener("click", () => {
    resetPlaceOrderForm();
  });
  
  function resetPlaceOrderForm() {
    form.reset();
    form.style.display = "block";
    document.getElementById("order-success").style.display = "none";
    estDuration.textContent = "Select route & priority";
    estPrice.textContent = "$0.00";
  }
}

// Generate random code like: SAT-4392-LHR
function generateTrackingId(destinationStr) {
  const num = Math.floor(1000 + Math.random() * 9000);
  let code = "XX";
  if (destinationStr.includes("(")) {
    code = destinationStr.split("(")[1].replace(")", "");
  }
  return `SAT-${num}-${code}`;
}

/* ==========================================================================
   Cargo Tracker Logic
   ========================================================================== */
function initTracker() {
  const searchBtn = document.getElementById("tracker-search-btn");
  const input = document.getElementById("tracker-input");
  const sampleLink = document.getElementById("sample-track-code");
  
  searchBtn.addEventListener("click", () => {
    triggerTrackingSearch(input.value.trim());
  });
  
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      triggerTrackingSearch(input.value.trim());
    }
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
  
  const shipment = shipments.find(s => s.id.toUpperCase() === code.toUpperCase());
  
  if (!shipment) {
    alert(`No shipment found with tracking code: ${code}`);
    emptyState.style.display = "block";
    resultCard.style.display = "none";
    return;
  }
  
  // Hide empty state and show visual tracker card
  emptyState.style.display = "none";
  resultCard.style.display = "block";
  
  // Populate meta details
  document.getElementById("track-id-disp").textContent = shipment.id;
  document.getElementById("track-priority-disp").textContent = `${shipment.priority} Priority`;
  document.getElementById("track-delivery-disp").textContent = shipment.eta;
  document.getElementById("track-origin-disp").textContent = shipment.origin;
  document.getElementById("track-destination-disp").textContent = shipment.destination;
  document.getElementById("track-package-disp").textContent = `${shipment.weight} kg (${shipment.contents})`;
  
  // Update timeline visual nodes
  updateTrackingTimeline(shipment.status);
  
  // Render logs
  const logsContainer = document.getElementById("tracking-logs-container");
  logsContainer.innerHTML = shipment.logs.map(log => `
    <div class="log-item">
      <div class="log-time">${log.time}</div>
      <div class="log-desc">${log.desc}</div>
    </div>
  `).join("");
}

function updateTrackingTimeline(statusIndex) {
  const steps = document.querySelectorAll(".timeline-step");
  const progressLine = document.getElementById("progress-line");
  
  // Clean all classes first
  steps.forEach(step => {
    step.classList.remove("active", "completed");
  });
  
  // Apply visual styling
  steps.forEach((step, idx) => {
    if (idx < statusIndex) {
      step.classList.add("completed");
    } else if (idx === statusIndex) {
      step.classList.add("active");
    }
  });
  
  // Line width calculation (4 intervals total for 5 steps)
  const isMobile = window.innerWidth <= 768;
  const progressPercentage = statusIndex * 25;
  
  if (isMobile) {
    progressLine.style.width = "4px";
    progressLine.style.height = `${progressPercentage}%`;
  } else {
    progressLine.style.height = "4px";
    progressLine.style.width = `${progressPercentage}%`;
  }
}

/* ==========================================================================
   Operator Security & Login
   ========================================================================== */
function initLogin() {
  const form = document.getElementById("login-form");
  const loginFormContainer = document.getElementById("login-form-container");
  const managerDashboard = document.getElementById("manager-dashboard");
  const logoutBtn = document.getElementById("logout-btn");
  const loginNavLink = document.getElementById("login-nav-link");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value;
    
    // Mock login credentials
    currentManager = {
      username: "Operations Coordinator",
      email: email
    };
    
    // Update navigation menu label to indicate active session
    loginNavLink.textContent = "Dashboard";
    
    // Switch views
    loginFormContainer.style.display = "none";
    managerDashboard.style.display = "block";
    document.getElementById("manager-username").textContent = currentManager.username;
    document.getElementById("manager-email-disp").textContent = currentManager.email;
    
    renderManagerDashboard();
  });

  logoutBtn.addEventListener("click", () => {
    currentManager = null;
    loginNavLink.textContent = "Log in";
    
    loginFormContainer.style.display = "block";
    managerDashboard.style.display = "none";
    
    // Reset login form fields
    form.reset();
  });
}

function renderManagerDashboard() {
  const container = document.getElementById("manager-orders-container");
  
  if (shipments.length === 0) {
    container.innerHTML = `<p style="padding: 1.5rem 0; color: var(--text-muted);">No active shipments recorded.</p>`;
    return;
  }

  container.innerHTML = shipments.map(ship => {
    return `
      <div class="order-item-row">
        <div>
          <strong style="font-family: monospace; font-size: 1.1rem; color: var(--text-primary);">${ship.id}</strong>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
            Route: ${ship.origin} ➔ ${ship.destination} | ${ship.weight} kg
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <select class="status-modifier-dropdown" data-id="${ship.id}" style="width: auto; padding: 0.5rem 1rem; font-size: 0.85rem;">
            <option value="0" ${ship.status === 0 ? "selected" : ""}>Booked</option>
            <option value="1" ${ship.status === 1 ? "selected" : ""}>Received Hub</option>
            <option value="2" ${ship.status === 2 ? "selected" : ""}>In Flight</option>
            <option value="3" ${ship.status === 3 ? "selected" : ""}>Arrived Hub</option>
            <option value="4" ${ship.status === 4 ? "selected" : ""}>Delivered</option>
          </select>
        </div>
      </div>
    `;
  }).join("");

  // Handle status changes in manager panel
  document.querySelectorAll(".status-modifier-dropdown").forEach(dropdown => {
    dropdown.addEventListener("change", (e) => {
      const orderId = dropdown.getAttribute("data-id");
      const newStatus = parseInt(e.target.value);
      
      updateShipmentStatus(orderId, newStatus);
    });
  });
}

function updateShipmentStatus(orderId, newStatusIndex) {
  const shipment = shipments.find(s => s.id === orderId);
  if (!shipment) return;
  
  // Status descriptions
  const statuses = [
    "Cargo booking logged. Smart Air courier dispatched to pick up package.",
    "Package scanned and checked-in at origin hub.",
    "Air cargo loaded. High-speed transport aircraft departure.",
    "Cargo arrived at destination gateway hub. Unpacking and customs sorting.",
    "Cargo delivered successfully. Receipt signed digitally by consignee."
  ];

  // If status is decreasing, we can truncate logs, if increasing we push log
  shipment.status = newStatusIndex;
  shipment.eta = newStatusIndex === 4 ? "Completed" : "In Transit";
  
  // Add new history entry
  const newLog = {
    time: getCurrentTimestamp(),
    desc: `[Operator Status Change] ${statuses[newStatusIndex]}`
  };
  
  shipment.logs.unshift(newLog);
  
  // Alert visual success
  const alertToast = document.createElement("div");
  alertToast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background-color: var(--accent-color);
    color: var(--bg-color);
    padding: 1rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    z-index: 999;
    animation: fadeIn 0.3s ease;
  `;
  // Readability for alert box text in light mode
  const activeTheme = document.documentElement.getAttribute("data-theme");
  if (activeTheme === "light") {
    alertToast.style.color = "#F3F3F7";
  }
  
  alertToast.textContent = `Shipment ${orderId} updated to: ${["Booked", "Received", "In Flight", "Arrived", "Delivered"][newStatusIndex]}`;
  document.body.appendChild(alertToast);
  
  setTimeout(() => {
    alertToast.style.animation = "fadeIn 0.3s ease reverse";
    setTimeout(() => alertToast.remove(), 300);
  }, 2500);

  // If we are currently tracking this code on the track page, trigger refresh
  const currentTrackingVal = document.getElementById("tracker-input").value.trim();
  if (currentTrackingVal.toUpperCase() === orderId.toUpperCase()) {
    triggerTrackingSearch(currentTrackingVal);
  }
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */
function getCurrentTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

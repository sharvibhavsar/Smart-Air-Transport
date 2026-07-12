# ✈️ SkyFleet Nexus — Global Cargo Operations Platform

Welcome to **SkyFleet Nexus**, a state-of-the-art, interactive web application designed for real-time aviation dispatch, fleet resource scheduling, dangerous goods compliance auditing, and route financial analysis. 

The platform supports global operations connecting Indian domestic trunk routes with international transport hubs using a modern, dark-mode cockpit dashboard interface.

---

## 🚀 Key Features

### 1. Interactive SVG Flight Map
*   **Curved Bezier Routes**: Replaced basic straight flight lines with elegant quadratic Bezier arcs representing actual high-altitude navigation paths.
*   **Live Plane Animations**: Aircraft fly smoothly along the Bezier paths, calculating heading angles dynamically.
*   **Rotating Radar Sweep**: Features a continuous radar scan line overlay.
*   **Operational Tooltips**: Hovering over hubs reveals operational metrics, local weather data, and active flight queues.

### 2. Smart Booking Wizard
*   **Route Verification**: Connects 13 domestic and international airports (`DEL`, `BOM`, `CCU`, `AMD`, `BLR`, `LAX`, `JFK`, `AMS`, `DXB`, `IST`, `AUH`, `SIN`, and `FRA`).
*   **Chronological Verification**: Enforces date constraints from today's current Indian Standard Time (IST) up to 6 months in the future.
*   **4-Hour Express Cut-off**: Blocks high-priority *Express* cargo bookings if the departure time is less than 4 hours away.

### 3. Dangerous Goods (DG) Audit workflow
*   **Hazmat Declaration Sub-form**: Prompts users checking the "Dangerous Goods" box to upload compliance sheets and input specific UN numbers, packing groups, and DG classes (Class 1-9).
*   **Safety Approvals Board**: Consignments containing DG are flagged as `"Yet to clear"`. Safety Officers review the uploaded certificates in the OCC Command Deck and manually approve them to mark them as `"Cleared"`.

### 4. Role-Based Authentication
Access the Command Deck using specialized role passwords:
*   🔑 **Fleet Manager**: `fleet123`
*   🔑 **Dispatch Manager**: `dispatch123`
*   🔑 **Safety Officer**: `safety123`
*   🔑 **Financial Analyst**: `finance123`

*Note: The Live P&L sheets and the Flight Consolidation Feasibility Analyzer are restricted to financial roles to protect corporate margins.*

### 5. Consolidated Financial Analytics
*   **Normal Rupee Formatting**: Displays all financial values using standard Indian local formatting (e.g. `₹ 8,50,000` instead of Lakh decimals).
*   **Consolidation Feasibility Analyzer**: Inputs cargo weights and calculates routing profitability based on fuel burn curves and distance-based fees.
*   **Operating Expense Log**: Tracks operating parameters such as hangar parking fees, ground handling charges, and crew salaries.

---

## 🛠️ Tech Stack
*   **Core Logic**: Vanilla JavaScript (ES6+)
*   **User Interface**: Semantic HTML5 with custom dark theme CSS variables
*   **Vector Rendering**: Custom SVG maps with dynamic Javascript path interpolation

---

## 💻 Local Setup and Run

To run the application locally, you can serve the project using any local HTTP server.

1.  **Using Python (Recommended)**:
    ```bash
    python -m http.server 8000
    ```
    Then visit [http://localhost:8000/index.html](http://localhost:8000/index.html) in your browser.

2.  **Direct Launch**:
    You can also double-click `index.html` to run it directly from your file system.

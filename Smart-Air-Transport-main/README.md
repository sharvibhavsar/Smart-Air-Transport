# ✈️ SkyFleet Nexus
## AI-Powered Global Air Cargo Operations Control Center (OCC)

> **Smart, Predictive and Intelligent Cargo Fleet Management Platform**
>
> SkyFleet Nexus is an AI-driven Operations Control Center (OCC) designed for modern cargo airlines. The platform combines aircraft fleet management, cargo dispatch, intelligent route optimization, predictive analytics, operational monitoring, financial analysis, and role-based decision making into one integrated system.

---

# 📌 Problem Statement

Modern logistics companies often depend on disconnected spreadsheets and manual scheduling systems to manage aircraft, cargo operations, maintenance, dispatch, expenses, and operational planning.

This frequently causes:

- Aircraft underutilization
- Delayed cargo deliveries
- High operational costs
- Missed maintenance schedules
- Inefficient route planning
- Increased fuel consumption
- Poor fleet visibility
- Revenue leakage

SkyFleet Nexus solves these problems by providing an intelligent AI-assisted Operations Control Center capable of making data-driven operational recommendations.

---

# 🌍 Project Vision

Instead of simply managing cargo,

SkyFleet Nexus continuously evaluates:

- Aircraft availability
- Weather risk
- Cargo demand
- Aircraft maintenance
- Pilot availability
- Airport operational status
- Fuel consumption
- Airport handling charges
- Expected profitability

and recommends the most profitable and operationally safe flight plan.

---

# 🚀 Core Features

## ✈ Fleet Management

- Aircraft Registry
- Aircraft Status Tracking
- Aircraft Utilization
- Aircraft Maintenance Logs
- Fuel Monitoring
- Flying Hours Tracking
- Aircraft Retirement

---

## 👨‍✈ Pilot Management

- Pilot Registry
- License Validation
- Medical Certificate Validation
- Flying Hours
- Safety Score
- Pilot Availability

---

## 📦 Cargo Operations

- Cargo Booking
- Dangerous Goods Handling
- Cold Chain Shipments
- Cargo Priority
- Shipment Validation
- Capacity Validation
- Cargo Consolidation

---

## 🌎 Interactive Flight Network

- Curved SVG Flight Paths
- Live Aircraft Animation
- Interactive Airport Nodes
- Radar Sweep Animation
- Domestic + International Network

Supported Airports

Domestic

- Ahmedabad (AMD)
- Delhi (DEL)
- Mumbai (BOM)
- Bengaluru (BLR)
- Kolkata (CCU)

International

- Dubai (DXB)
- Abu Dhabi (AUH)
- Frankfurt (FRA)
- Amsterdam (AMS)
- Istanbul (IST)
- Leipzig (LEJ)
- JFK
- LAX
- ORD

---

## ⚠ Dangerous Goods Compliance

Supports

- UN Number
- Packing Group
- DG Classes
- Compliance Certificates
- Manual Safety Approval

Only Safety Officers can approve Dangerous Goods shipments.

---

## 🔐 Role-Based Authentication

The platform implements enterprise RBAC.

### Fleet Manager

Responsible for

- Fleet
- Aircraft
- Maintenance
- Emergency Override

Password

```
fleet123
```

---

### Dispatch Manager

Responsible for

- Cargo Trips
- Dispatch
- Aircraft Assignment
- Pilot Assignment

Password

```
dispatch123
```

---

### Safety Officer

Responsible for

- Dangerous Goods
- Pilot Compliance
- Weather Alerts
- Safety Approvals

Password

```
safety123
```

---

### Financial Analyst

Responsible for

- Revenue
- Expenses
- Profitability
- ROI
- Reports

Password

```
finance123
```

---

# 🧠 Artificial Intelligence

SkyFleet Nexus uses AI as a **Decision Support System** rather than an autonomous controller.

The AI continuously recommends the best operational decision while keeping the final approval with human operators.

---

# AI Architecture

```
Customer Booking
        │
Validation
        │
Pricing Engine
        │
Security Screening
        │
Constraint Engine
        │
Random Forest Prediction
        │
Genetic Algorithm Optimization
        │
Best Aircraft Recommendation
        │
Dispatcher Approval
        │
Database Update
        │
Live OCC Dashboard
```

---

# Machine Learning Algorithms

## 1. Random Forest Regressor

Predicts

- Flight Delay
- Fuel Consumption
- Operational Risk

Input Features

- Aircraft
- Route
- Weather Risk
- Cargo Weight
- Historical Delay
- Airport
- Season

Outputs

- Expected Delay
- Expected Fuel Burn
- Operational Risk Score

---

## 2. Multi-Objective Genetic Algorithm

Used for intelligent route optimization.

Instead of minimizing only distance,

the algorithm simultaneously optimizes

- Profit
- Fuel Consumption
- Aircraft Utilization
- Airport Charges
- Maintenance Risk
- Weather Risk
- Delay Probability
- Cargo Utilization
- Crew Cost

### Fitness Function

```
Fitness

=

+ Profit

+ Delivery Success

+ Aircraft Utilization

-

Fuel Cost

-

Delay

-

Maintenance Cost

-

Airport Charges

-

Crew Cost

-

Weather Risk
```

The solution with the highest fitness score is recommended.

---

## 3. Constraint Validation Engine

Business Rules

- Aircraft Capacity
- Aircraft Availability
- Maintenance Status
- Pilot Availability
- License Validity
- Medical Validity
- Airport Status
- Weather Threshold
- Dangerous Goods Compliance
- Flight Lock Rule

Only feasible solutions are sent to the optimization engine.

---

# Route Optimization

The flight network is represented as a weighted graph.

Each airport is treated as a node.

Each connection stores

- Distance
- Fuel Cost
- Handling Charges
- Weather Risk
- Historical Delay
- Profitability
- Congestion

The Genetic Algorithm evaluates multiple candidate routes and recommends the most profitable operational path.

---

# Operational Decision Score (ODS)

Every recommendation is assigned an Operational Decision Score.

ODS evaluates

- Weather
- Fuel
- Maintenance
- Delay Probability
- Airport Congestion
- Aircraft Health
- Profitability

Example

```
Aircraft

B737-800BCF

Route

AMD → DEL → FRA

Profit

₹3,42,000

Operational Score

94 / 100

Recommendation

Highly Recommended
```

---

# Pricing Engine

Shipment Price

```
Base Freight

+

Weight Charges

+

Volumetric Charges

+

Express Charges

+

Cold Chain Charges

+

Dangerous Goods Fee

+

Insurance

+

Airport Handling

+

Security Fee

=

Customer Price
```

Operational Cost

```
Fuel

+

Crew Cost

+

Ground Handling

+

Landing Charges

+

Hangar Cost

+

Maintenance Allocation

+

Labour

+

Airport Charges

+

Navigation Charges

=

Flight Cost
```

Profit

```
Revenue

-

Operational Cost
```

---

# Operations Control Center (OCC)

The OCC Dashboard provides

- Fleet Status
- Live Flight Monitoring
- Route Analytics
- Weather Alerts
- Financial Analytics
- AI Recommendation Center
- Maintenance Dashboard
- Airport Operations
- Cargo Monitoring

---

# Technology Stack

Frontend

- HTML5
- CSS3
- Vanilla JavaScript

Graphics

- SVG
- Dynamic Path Interpolation

AI

- Random Forest
- Genetic Algorithm
- Rule-Based Constraint Engine

Visualization

- Interactive Dashboards
- SVG Maps
- Analytical Charts

---

# Project Structure

```
SkyFleet-Nexus/

│

├── index.html

├── style.css

├── app.js

├── assets/

├── datasets/

├── README.md

└── docs/
```

---

# Requirements

- Modern Web Browser
  - Chrome
  - Edge
  - Firefox

Optional

- VS Code
- Git
- Python 3.10+

---

# Running the Project

## Method 1 (Recommended)

Using Python

```bash
python -m http.server 8000
```

Visit

```
http://localhost:8000
```

---

## Method 2

Using VS Code Live Server

1. Install **Live Server**
2. Right-click `index.html`
3. Select **Open with Live Server**

---

## Method 3

Using Node.js

Install

```bash
npm install -g serve
```

Run

```bash
serve .
```

Open

```
http://localhost:3000
```

---

# Future Scope

- Real-time Weather API Integration
- Live Flight Tracking
- Digital Twin Simulation
- Reinforcement Learning for Dispatch
- Multi-Airline Collaboration
- Carbon Emission Optimization
- IoT-enabled Aircraft Health Monitoring
- Real-time Cargo Tracking
- Blockchain Shipment Validation

---

# Developed For

**Odoo Hackathon 2026**

Smart Transport Operations Platform

**Team SkyFleet Nexus**

Building the future of intelligent air cargo operations through AI-assisted decision making.

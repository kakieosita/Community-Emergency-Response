# Intelligent Community Emergency Response & GIS Incident Reporting System

An elite, full-stack government-grade command-deck and emergency dispatch portal with GIS-based geospatial tracking, predictive telemetry triage, and full-stack JWT routing.

## 🌟 Core Architecture & Technology Stack

- **Frontend**: SPA engineered with **React 19**, **Tailwind CSS v4** (including fluid responsive margins and custom typography), **Lucide Icons**, and **motion** layout transitions.
- **GIS Mapping Engine**: **Leaflet.js** and **OpenStreetMap (mapped via CartoDB Dark Matter)**, featuring custom responsive HTML DivIcon markers with pulsing radial indicator halos color-coded by incident severity.
- **Backend Service**: Standalone **Node.js + Express** server.
- **AI Core Intelligence**: **Google GenAI SDK** (`@google/genai` utilizing `'gemini-3.5-flash'`) running a high-accuracy, server-secured **Intelligent Severity Prediction Engine**.
- **Local Persistence & Data Engine**: Interactive file-backed JSON database store (`server-db.json`) featuring automated structural migrations, password hashing via **Bcrypt**, and authentic municipal seed datasets.
- **Authentication System**: **MERN-compliant JSON Web Token (JWT)** session authority tokens.

---

## 🚀 Key Functional Modules

### 1. Citizen Incident Reporting Portal
- **Interactive GPS capture**: Instantly coordinates current browser GPS pins, falling back elegantly to map selection vectors when iframe sandboxes restrict browser location telemetry.
- **Dynamic Local Prediction Triage Preview**: Scans incident types and active keywords (e.g. *armed, fire, unresponsive*) in real-time, providing immediate visual severity feedback before submission.
- **Field Snapshot Capture**: Supports rapid drag-and-drop or file-explorer upload of visual evidence, serialized into local persistent datastores.
- **Personal Dispatch Tracking**: View past filed incident history logs with current deployment progress.

### 2. Responder Marshal Field Dashboard
- **Urgency Alert Queues**: View dispatched incident cards prioritized by critical status indexes.
- **GIS Location Mapping**: Inspect reported pin details on CartoDB Tactical charts.
- **Secure Log Entries**: Append field observation notes and update response state parameters (`Dispatching` ➡️ `Active` ➡️ `Resolved`).

### 3. Command Deck Administrative Portal
- **System Executive Overview**: Control municipal emergencies, assign available marshals and paramedics, and monitor active response columns.
- **Interactive Directory**: Browse listed citizens and authorized EMT/Marshal rosters.
- **Advanced SVG/Recharts Analytics**: High-fidelity line areas charting historical multi-month trends, sector hotspot indexes, and resolution rate percentages.

---

## 🔒 Security Configuration

1. **Server-Proxied AI Keys**: The `GEMINI_API_KEY` is fully contained server-side, preventing client-side interception in browser developer consoles.
2. **Double Triage Shield**: If the cloud API is offline, a modular, highly descriptive rule-based keyword compiler acts as a protective fallback, ensuring zero service interruptions.
3. **Password Salting**: Secure cryptographic salting guards accounts registered within the system.

---

## 🛠️ Local Execution & Operations

### Deployment Environment Setup
1. **Initialize Environment Configuration**:
   Secure keys are managed inside `.env` configurations:
   ```env
   # .env
   GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_KEY"
   JWT_SECRET="YOUR_TACTICAL_SECRET_PHRASE"
   ```

2. **Boot Developer Server**:
   ```bash
   npm run dev
   ```
   The application mounts a dynamic Express pipeline proxies assets directly to Vite compilation modes.

3. **Verify Build Compilation**:
   ```bash
   npm run build
   ```
   This compiles static scripts via Vite while bundling the Node.js server into a highly optimized, cold-start resistant `dist/server.cjs` module.

# ExceptionOS

> **Voice-native operational exception management for physical-world operations.**

ExceptionOS coordinates the entire incident lifecycle when real-world equipment fails:
**Detect → Investigate → Plan → Authorize → Act → Verify → Close the Loop.**

Built for the **AssemblyAI Voice Agent Hackathon**.

---

## 1. What is ExceptionOS?

When something goes wrong in an industrial facility, the worker closest to the problem should not have to log into three enterprise systems, check inventory databases, search PDF manuals, make phone calls, or create manual work orders.

**They should simply say what happened.**

ExceptionOS converts that spoken report into a structured incident, investigates live telemetry and maintenance records, checks cross-facility inventory, recommends a recovery plan, halts for human authorization before executing consequential actions, dispatches technicians and parts, and **independently verifies the physical outcome before closing the incident.**

---

## 2. Platform Architecture

```text
                           TECHNICIAN / OPERATOR
                                     │
                                     ▼ (24 kHz PCM16 Audio)
                         ASSEMBLYAI VOICE AGENT
                     (wss://agents.assemblyai.com/v1/ws)
                                     │
                             JSON Tool Calls
                                     │
                                     ▼
                    EXCEPTIONOS ORCHESTRATION LAYER
               ┌─────────────────────┼─────────────────────┐
               ▼                     ▼                     ▼
        INCIDENT AGENT         DIAGNOSTIC AGENT     INVENTORY AGENT
      (Create Exception)    (Telemetry & History)  (Multi-warehouse)
               │                     │                     │
               └─────────────────────┼─────────────────────┘
                                     │
                                     ▼
                           RECOVERY ACTION PLAN
                                     │
                                     ▼
                        MANDATORY HUMAN AUTHORIZATION
                                     │
                    ┌────────────────┴────────────────┐
                    │ Approved                        │ Rejected
                    ▼                                 ▼
            EXECUTE DISPATCH                  ESCALATE INCIDENT
          (Work Order + Courier)
                    │
                    ▼
          INDEPENDENT SENSOR VERIFICATION
          (Temp <= 75°C, Vib <= 0.15g)
                    │
                    ▼
          RESOLVED STATE + COMPLIANCE AUDIT TRAIL
```

---

## 3. AssemblyAI Voice Agent Integration

ExceptionOS connects directly to the new **AssemblyAI Voice Agent API** over WebSocket:

1. **Short-lived Token Generation (`GET /api/voice-token`):**
   * Server requests a 300-second ephemeral token from `https://agents.assemblyai.com/v1/token?expires_in_seconds=300` using `Authorization: Bearer ${ASSEMBLYAI_API_KEY}`.
   * The master `ASSEMBLYAI_API_KEY` remains strictly server-side and is never sent to the browser.
2. **WebSocket Connection (`wss://agents.assemblyai.com/v1/ws?token=TOKEN`):**
   * Browser connects to AssemblyAI's managed real-time agent.
   * Sends `session.update` with an industrial operational system prompt and 10 registered operational tool schemas.
3. **Audio Streaming:**
   * Browser captures microphone audio via Web Audio API.
   * Converted to 24 kHz mono 16-bit signed PCM (base64-encoded `input.audio` JSON frames).
4. **Agent Speech & Turn Detection:**
   * Receives `reply.audio` streaming chunks, queued and played through Web Audio `AudioContext`.
   * Real-time transcripts emitted as `transcript.user` and `transcript.agent`.
5. **Tool Calling (`tool.call` & `tool.result`):**
   * When the agent needs data or actions, AssemblyAI emits a `tool.call` event.
   * ExceptionOS executes the tool against the local domain database and returns `tool.result`.

---

## 4. Registered Operational Tools

| Tool Name | Purpose | Consequential? |
|---|---|---|
| `get_asset` | Look up asset details, status, and plant site location | No |
| `get_telemetry` | Query real-time sensors (temperature, vibration, pressure) | No |
| `get_maintenance_history` | Retrieve previous repairs and operating hours since last service | No |
| `search_sop` | Retrieve standard operating procedures and diagnostic guidelines | No |
| `check_inventory` | Check replacement component availability at local plant warehouse | No |
| `find_nearby_part` | Query remote distribution centers for compatible replacement parts | No |
| `create_work_order` | Generate and assign maintenance work order to certified technician | No |
| `authorize_dispatch` | Record explicit supervisor authorization to approve expenditures | No |
| `dispatch_part` | Physical dispatch from remote warehouse ($420 cost) | **YES (Blocked until authorized)** |
| `verify_resolution` | Query hardware sensors to verify temperature and vibration limits | No |

---

## 5. Local Setup

### Prerequisites
* Node.js 18.17+ or Node.js 20+
* npm or pnpm

### Installation

```bash
# 1. Clone repository
git clone https://github.com/wearefjon/exceptionos.git
cd exceptionos

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

Edit `.env.local` and add your AssemblyAI API Key:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ASSEMBLYAI_API_KEY` | **Yes** (for live voice) | AssemblyAI API Key used to mint short-lived Voice Agent tokens |
| `PORT` | No | Server port (default: `3000`) |
| `NODE_ENV` | No | Environment (`development` or `production`) |

---

## 7. Deployment Instructions

### Vercel / Render / Node Server

1. Push your repository to GitHub.
2. In your deployment dashboard (e.g. Vercel):
   * Framework Preset: **Next.js**
   * Build Command: `npm run build`
   * Output Directory: `.next`
3. Add Environment Variable:
   * `ASSEMBLYAI_API_KEY` = your AssemblyAI API key
4. Deploy!

---

## 8. Primary Demo Sequence (Under 3 Minutes)

1. **Load Landing Page:** Open `http://localhost:3000`. Click **"Launch Operations Console"**.
2. **Open Voice Console:** Click **"Talk to ExceptionOS"** in the sidebar.
3. **Start Voice Session:** Click **"Start Voice Session"** (connects to AssemblyAI via WebSocket).
4. **Report the Incident:**
   * Speak: *"Machine 7 is overheating and vibrating more than usual."*
5. **Watch Autonomous Investigation:**
   * Agent identifies Machine 7 (`M-007`).
   * Agent queries telemetry (finds 94°C and 0.38g vibration — Critical!).
   * Agent checks SOP `SOP-M007-BRG` (recommends bearing replacement).
   * Agent checks Plant A inventory (0 units of Bearing B-204).
   * Agent finds 4 compatible units at Warehouse B (14 km away, $420).
   * Agent explains the recovery plan and requests authorization.
6. **Authorize the Action:**
   * Speak: *"Yes, authorize the dispatch."* (or click the Authorize button in the drawer).
   * Agent calls `authorize_dispatch`, `dispatch_part`, and `create_work_order`.
   * Work order `WO-2031` is issued to technician **James Okoro**.
7. **Complete Repair & Verify:**
   * In the incident detail screen, click **"Run Telemetry Verification"** (or say *"Verify telemetry resolution"*).
   * ExceptionOS queries sensors: Temperature drops to **71°C** (threshold <= 75°C) and vibration drops to **0.12g** (threshold <= 0.15g).
   * Incident transitions to **`RESOLVED`** and Machine 7 returns to **`Online`**.
8. **Inspect Audit Trail:**
   * Navigate to the **Activity** tab to inspect the immutable chronological record.

---

## 9. Known Demo Limitations

* **Deterministic Persistence:** For the hackathon demo, state is stored in `data/exceptionos-db.json` with an automatic in-memory fallback for read-only serverless platforms. In production, this would be backed by PostgreSQL / Supabase.
* **Simulated Telemetry:** Sensor readings simulate industrial SCADA/IoT telemetry streams rather than direct hardware connections.
* **Deterministic Demo Fallback:** If the microphone is muted or browser permissions are unavailable during a live presentation, the UI includes one-click preset prompt chips and a **"Load Machine 7"** button in the top bar to guarantee a flawless walkthrough.

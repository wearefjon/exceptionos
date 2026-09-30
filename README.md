# ExceptionOS

**Voice-native exception management for real-world operations.**

ExceptionOS turns a messy physical-world incident into a coordinated, verified outcome:

**Detect → Investigate → Orchestrate → Recover → Authorize → Act → Verify → Close**

## Hackathon demo

The prototype models an industrial incident: a technician reports that Machine 7 is overheating and vibrating. ExceptionOS investigates telemetry, maintenance history and SOP guidance, discovers that the required bearing is unavailable, finds a compatible part at another warehouse, requests explicit authorization, dispatches it, and independently verifies the machine returned to normal.

The key product idea is **exception management**, not a generic chatbot: consequential actions require authorization, and resolution is not declared until the physical outcome is independently verified.

## Run locally

```bash
npm install
cp .env.example .env.local
# add your AssemblyAI API key to .env.local
npm run dev
```

Open `http://localhost:3000`.

For a production deployment, set `ASSEMBLYAI_API_KEY` as a server-side environment variable. Never expose the key to the browser or commit `.env.local`.

## Live voice flow

The UI uses AssemblyAI's Voice Agent API over WebSocket:

1. The browser requests a short-lived token from `/api/voice-token`.
2. The browser opens the AssemblyAI agent WebSocket with that temporary token.
3. Microphone audio is captured as mono PCM16 at 24 kHz through an AudioWorklet.
4. The agent performs turn detection, speech recognition, voice output and JSON-schema tool calling.
5. ExceptionOS executes deterministic operational tools in the browser for the hackathon demo.
6. Tool results are returned to the agent, which continues the workflow.

For production, the mock tools should move behind authenticated server-side APIs connected to CMMS/EAM, telemetry, inventory, dispatch and ERP systems.

## Demo flow

### Voice path

Say:

> “Machine 7 is overheating and vibrating more than usual.”

Then let the agent investigate. When it reports that the bearing is unavailable at Plant A and asks for authorization, say an explicit confirmation such as:

> “Yes, approve the dispatch.”

After dispatch, say that the repair is complete. The agent calls the verification tool and closes the incident only after telemetry returns to normal.

### UI fallback

1. Start incident.
2. Show investigation timeline.
3. Highlight the deliberately injected inventory exception.
4. Approve dispatch.
5. Verify resolution.
6. Show the resolved state and normalized telemetry.

## Architecture

```text
Technician
    ↓ voice
AssemblyAI Voice Agent API
    ↓ tool calls
ExceptionOS orchestration state
    ├── telemetry
    ├── maintenance history
    ├── SOP
    ├── inventory
    └── dispatch
    ↓
physical action
    ↓
independent verification
    ↓
closed incident + audit trail
```

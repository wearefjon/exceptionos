'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Mic, ShieldCheck } from 'lucide-react';

type Event = { id: string; name: string; desc: string; time: string; state: string };

const VOICE_TOOLS = [
  { name: 'get_asset', description: 'Get the current asset identity and context.', parameters: { type: 'object', properties: { asset: { type: 'string' } } } },
  { name: 'get_telemetry', description: 'Read live telemetry for Machine 7.', parameters: { type: 'object', properties: { asset: { type: 'string' } } } },
  { name: 'get_maintenance_history', description: 'Read recent maintenance history for Machine 7.', parameters: { type: 'object', properties: { asset: { type: 'string' } } } },
  { name: 'search_sop', description: 'Retrieve the relevant machine safety and maintenance procedure.', parameters: { type: 'object', properties: { issue: { type: 'string' } } } },
  { name: 'check_inventory', description: 'Check whether the required bearing is available at Plant A.', parameters: { type: 'object', properties: { part: { type: 'string' } } } },
  { name: 'find_nearby_part', description: 'Find a compatible replacement part at another warehouse.', parameters: { type: 'object', properties: { part: { type: 'string' } } } },
  { name: 'authorize_dispatch', description: 'Record explicit technician authorization to dispatch the replacement bearing. Call ONLY after the user clearly confirms.', parameters: { type: 'object', properties: { confirmation: { type: 'string' } }, required: ['confirmation'] } },
  { name: 'dispatch_part', description: 'Dispatch the authorized replacement bearing and create the work order.', parameters: { type: 'object', properties: { part: { type: 'string' }, warehouse: { type: 'string' } }, required: ['part', 'warehouse'] } },
  { name: 'verify_resolution', description: 'Independently verify telemetry after repair.', parameters: { type: 'object', properties: { asset: { type: 'string' } } } },
].map(tool => ({ type: 'function', ...tool }));

const SYSTEM_PROMPT = `You are ExceptionOS, a concise industrial incident-response voice agent. Resolve Machine 7 incident 10482.
Start by understanding the technician's report. Use tools in this order when appropriate: get_asset, get_telemetry, get_maintenance_history, search_sop, check_inventory, find_nearby_part.
If the required part is unavailable, explain the exception and ask for explicit approval. Only after the user clearly says yes, approve, dispatch it, or an equivalent explicit confirmation may you call authorize_dispatch, then dispatch_part. Never dispatch without authorization.
After the technician says the repair is complete, call verify_resolution and only then say the incident is resolved.
Keep spoken replies brief. Do not invent tool results. If the user has not authorized a consequential action, stop and ask.`;

function pcmToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  return btoa(binary);
}

function base64ToPcm16(base64: string) {
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState('INVESTIGATING');
  const [approved, setApproved] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('Say: “Machine 7 is overheating and vibrating.”');
  const [authorized, setAuthorized] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const pendingToolsRef = useRef<any[]>([]);
  const authorizedRef = useRef(false);
  const sessionReadyRef = useRef(false);
  const playbackTimeRef = useRef(0);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  async function run(action: string) {
    const r = await fetch('/api/incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const d = await r.json();
    setEvents(d.events);
    setStatus(d.status);
    if (action === 'approve') {
      setApproved(true);
      authorizedRef.current = true;
      setAuthorized(true);
    }
  }

  useEffect(() => {
    run('start');
    return () => { void stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addVoiceEvent(name: string, desc: string, state = 'done') {
    setEvents(current => {
      if (current.some(e => e.name === name)) return current;
      return [...current, { id: `voice-${Date.now()}`, name, desc, time: 'LIVE', state }];
    });
  }

  function flushPlayback() {
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch {}
    }
    sourcesRef.current = [];
    if (audioRef.current) playbackTimeRef.current = audioRef.current.currentTime;
  }

  function playReply(base64: string) {
    const ctx = audioRef.current;
    if (!ctx) return;
    const pcm = base64ToPcm16(base64);
    const floats = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) floats[i] = pcm[i] / 0x8000;
    const buffer = ctx.createBuffer(1, floats.length, 24000);
    buffer.getChannelData(0).set(floats);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const now = ctx.currentTime;
    if (playbackTimeRef.current < now) playbackTimeRef.current = now;
    source.start(playbackTimeRef.current);
    playbackTimeRef.current += buffer.duration;
    sourcesRef.current.push(source);
  }

  async function executeTool(name: string, args: any) {
    if (name === 'get_asset') {
      addVoiceEvent('Asset context confirmed', 'Machine 7 → Line 2 → Plant A.');
      return { asset: 'Machine 7', line: 'Line 2', site: 'Plant A', status: 'running' };
    }
    if (name === 'get_telemetry') {
      addVoiceEvent('Telemetry checked', 'Temperature 94°C and vibration 0.38g are outside baseline.');
      return { temperature_c: 94, vibration_g: 0.38, normal_temperature_c: 80, status: 'abnormal' };
    }
    if (name === 'get_maintenance_history') {
      addVoiceEvent('Maintenance history checked', 'Last bearing service was 17 days ago; bearing wear is a known issue.');
      return { last_service_days_ago: 17, issue_history: ['bearing wear'] };
    }
    if (name === 'search_sop') {
      addVoiceEvent('SOP retrieved', 'Reduce load and inspect bearing; replace bearing if vibration persists.');
      return { procedure: 'Reduce load and inspect bearing; replace bearing if vibration persists.' };
    }
    if (name === 'check_inventory') {
      addVoiceEvent('Inventory exception', 'Required bearing is unavailable at Plant A.', 'exception');
      return { available: false, part: 'bearing-X', site: 'Plant A' };
    }
    if (name === 'find_nearby_part') {
      addVoiceEvent('Recovery plan found', 'Compatible bearing available at Warehouse B, 14 km away.');
      return { available: true, part: 'bearing-X', warehouse: 'Warehouse B', distance_km: 14, eta_minutes: 32 };
    }
    if (name === 'authorize_dispatch') {
      authorizedRef.current = true;
      setAuthorized(true);
      setApproved(true);
      setStatus('EXECUTING');
      addVoiceEvent('Authorization recorded', 'Explicit technician approval received.');
      return { authorized: true, authorized_by: 'technician', reason: 'explicit spoken confirmation' };
    }
    if (name === 'dispatch_part') {
      if (!authorizedRef.current) return { error: 'Dispatch blocked: explicit authorization is required.' };
      setStatus('EXECUTING');
      addVoiceEvent('Part dispatched', 'Bearing dispatched from Warehouse B; work order WO-10482 created.');
      return { dispatched: true, warehouse: 'Warehouse B', work_order: 'WO-10482' };
    }
    if (name === 'verify_resolution') {
      setStatus('RESOLVED');
      addVoiceEvent('Resolution verified', 'Independent telemetry check: 71°C and 0.12g, back within normal range.');
      return { verified: true, temperature_c: 71, vibration_g: 0.12, status: 'normal' };
    }
    return { error: `Unknown tool: ${name}` };
  }

  async function stopVoice() {
    sessionReadyRef.current = false;
    pendingToolsRef.current = [];
    if (socketRef.current) {
      try { socketRef.current.close(); } catch {}
      socketRef.current = null;
    }
    if (workletRef.current) {
      try { workletRef.current.disconnect(); } catch {}
      workletRef.current = null;
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (audioRef.current) {
      try { await audioRef.current.close(); } catch {}
      audioRef.current = null;
    }
    setListening(false);
  }

  async function voice() {
    if (socketRef.current) {
      await stopVoice();
      return;
    }

    try {
      const response = await fetch('/api/voice-token');
      if (!response.ok) throw new Error('Voice token request failed');
      const { token } = await response.json();
      if (!token) throw new Error('No voice token');

      const ctx = new AudioContext({ sampleRate: 24000 });
      audioRef.current = ctx;
      await ctx.audioWorklet.addModule('/pcm-processor.js');
      await ctx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
      streamRef.current = stream;

      const socket = new WebSocket(`wss://agents.assemblyai.com/v1/ws?token=${token}`);
      socketRef.current = socket;
      playbackTimeRef.current = ctx.currentTime;

      const source = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, 'pcm-processor');
      const silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      source.connect(worklet);
      worklet.connect(silentGain);
      silentGain.connect(ctx.destination);
      workletRef.current = worklet;

      worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        if (socket.readyState === WebSocket.OPEN && sessionReadyRef.current) {
          socket.send(JSON.stringify({ type: 'input.audio', audio: pcmToBase64(event.data) }));
        }
      };

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'session.update',
          session: {
            system_prompt: SYSTEM_PROMPT,
            greeting: 'ExceptionOS online. Tell me what happened.',
            output: { voice: 'ivy' },
            tools: VOICE_TOOLS,
          },
        }));
      };

      socket.onmessage = async event => {
        const message = JSON.parse(event.data);
        if (message.type === 'session.ready') {
          sessionReadyRef.current = true;
          setListening(true);
          setTranscript('Listening. Tell me what happened to Machine 7.');
          return;
        }
        if (message.type === 'transcript.user.delta' || message.type === 'transcript.user' || message.type === 'transcript.agent') {
          if (message.text) setTranscript(message.text);
          return;
        }
        if (message.type === 'reply.audio') {
          playReply(message.data);
          return;
        }
        if (message.type === 'input.speech.started') {
          flushPlayback();
          return;
        }
        if (message.type === 'tool.call') {
          const result = await executeTool(message.name, message.arguments || {});
          pendingToolsRef.current.push({ call_id: message.call_id, result });
          return;
        }
        if (message.type === 'reply.done' && message.status === 'interrupted') {
          pendingToolsRef.current = [];
          flushPlayback();
          return;
        }
        if (message.type === 'reply.done' && pendingToolsRef.current.length) {
          for (const toolResult of pendingToolsRef.current.splice(0)) {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({
                type: 'tool.result',
                call_id: toolResult.call_id,
                result: JSON.stringify(toolResult.result),
              }));
            }
          }
          return;
        }
        if (message.type === 'session.error') {
          setTranscript(`Voice error: ${message.message || message.code || 'unknown error'}`);
        }
      };

      socket.onerror = () => setTranscript('Voice connection error. Check ASSEMBLYAI_API_KEY and browser microphone permission.');
      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
          void stopVoice();
        }
      };
    } catch (error) {
      console.error(error);
      await stopVoice();
      setTranscript('Voice setup failed. Check ASSEMBLYAI_API_KEY and browser microphone permission.');
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="mark">E</span>ExceptionOS</div>
        <div className="live"><span className="dot" /> OPERATIONS CONTROL PLANE</div>
      </header>
      <section className="content">
        <div className="hero">
          <div><div className="eyebrow">Industrial incident response</div><h1 className="title">Machine 7 · Incident #10482</h1><p className="subtitle">Voice-native exception management for physical operations.</p></div>
          <div className="status">STATUS · <strong>{status}</strong></div>
        </div>
        <div className="grid">
          <section className="card">
            <div className="cardhead"><span className="cardtitle">Orchestration timeline</span><span className="muted">LIVE EVENT STREAM</span></div>
            <div className="timeline">{events.map(event => <div className="event" key={event.id}><div className="icon">{event.state === 'exception' ? <AlertTriangle size={13} /> : <Check size={13} />}</div><div className="eventbody"><div className="eventtop"><span className="eventname">{event.name}</span><span className="time">{event.time}</span></div><div className="eventdesc">{event.desc}</div></div></div>)}</div>
            {!approved && status === 'AUTHORIZATION_REQUIRED' && <div className="exception"><div className="warning"><AlertTriangle size={13} style={{ verticalAlign: '-2px' }} /> Exception requires authorization</div><p>The required bearing is unavailable at Plant A. A compatible bearing is available at <b>Warehouse B · 14 km</b>. Dispatching it will create a work order and notify the supervisor.</p><button className="approve" onClick={() => run('approve')}>Approve & dispatch</button></div>}
            {(approved || authorized) && status === 'EXECUTING' && <div className="exception" style={{ borderColor: '#294b31', background: '#0d1711' }}><div className="warning" style={{ color: '#9ee65b' }}><ShieldCheck size={13} style={{ verticalAlign: '-2px' }} /> Action authorized</div><p>Replacement bearing dispatched. Technician assigned. <b>Now verify the physical outcome.</b></p><button className="approve" onClick={() => run('verify')}>Verify resolution</button></div>}
            {status === 'RESOLVED' && <div className="exception" style={{ borderColor: '#294b31', background: '#0d1711' }}><div className="warning" style={{ color: '#9ee65b' }}><ShieldCheck size={13} style={{ verticalAlign: '-2px' }} /> Incident closed</div><p>Independent telemetry verification confirms Machine 7 returned to normal operating range.</p></div>}
          </section>
          <aside className="card">
            <div className="cardhead"><span className="cardtitle">Incident context</span><span className="muted">TRUST LAYER</span></div>
            <div className="side">
              <div className="kv"><div className="k">Asset</div><div className="v">Machine 7 · Line 2</div></div>
              <div className="kv"><div className="k">Signal</div><div className="v">Overheating + abnormal vibration</div></div>
              <div className="kv"><div className="k">Severity</div><div className="v">High · production risk</div></div>
              <div className="kv"><div className="k">Agents / tools</div><div className="v">Telemetry · Maintenance · SOP · Inventory · Dispatch</div></div>
              <div className="metrics"><div className="metric"><div className="k">Temperature</div><b>{status === 'RESOLVED' ? '71' : '94'}°C</b></div><div className="metric"><div className="k">Vibration</div><b>{status === 'RESOLVED' ? '0.12' : '0.38'} g</b></div></div>
              <div className="voice"><div className="k">VOICE CONSOLE</div><p className="muted">Talk to the operations agent.</p><button className={'voicebtn ' + (listening ? 'active' : '')} onClick={voice}><Mic size={16} style={{ verticalAlign: '-3px', marginRight: 7 }} />{listening ? 'Stop listening' : 'Push to talk'}</button><div className="transcript">{transcript}</div></div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Volume2,
  VolumeX,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Activity,
  Cpu,
  Terminal,
} from 'lucide-react';
import { Incident } from '@/lib/types';
import { EXCEPTIONOS_TOOLS } from '@/lib/tool-definitions';

interface VoiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated?: (incidentId: string) => void;
}

interface TranscriptTurn {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface ToolExecutionLog {
  id: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  status: 'invoking' | 'completed' | 'blocked' | 'error';
  timestamp: string;
}

export default function VoiceDrawer({ isOpen, onClose, onIncidentCreated }: VoiceDrawerProps) {
  // Connection and Session State
  const [connectionMode, setConnectionMode] = useState<'assemblyai' | 'native' | 'disconnected'>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Conversation & Tool Tracing
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);
  const [activeUserSpeech, setActiveUserSpeech] = useState('');
  const [toolLogs, setToolLogs] = useState<ToolExecutionLog[]>([]);
  const [awaitingAuthorization, setAwaitingAuthorization] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('INC-10482');

  // Audio & WebSocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const speechRecognitionRef = useRef<any>(null);

  // Helper: Format Time
  const getTimeString = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Web Audio Helpers: Float32 to 16-bit Little Endian PCM
  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return output.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Play Agent Audio PCM (24kHz Mono 16-bit)
  const playAgentAudio = useCallback((base64Data: string) => {
    if (audioMuted || typeof window === 'undefined') return;

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Decode base64 to binary
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit PCM to Float32
      const samples = new Float32Array(bytes.length / 2);
      const dataView = new DataView(bytes.buffer);
      for (let i = 0; i < samples.length; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        samples[i] = int16 / 32768;
      }

      // Create Audio Buffer
      const audioBuffer = audioCtx.createBuffer(1, samples.length, 24000);
      audioBuffer.copyToChannel(samples, 0);

      // Play buffer sequentially
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      setIsAgentSpeaking(true);
      source.onended = () => {
        if (audioCtx.currentTime >= nextPlayTimeRef.current - 0.05) {
          setIsAgentSpeaking(false);
        }
      };
    } catch (err) {
      console.warn('Error playing audio chunk:', err);
    }
  }, [audioMuted]);

  // Execute Tool on ExceptionOS Backend
  const handleExecuteTool = useCallback(async (toolName: string, callId: string, args: Record<string, any>) => {
    const timestamp = getTimeString();
    const newLog: ToolExecutionLog = {
      id: callId,
      toolName,
      args,
      status: 'invoking',
      timestamp,
    };

    setToolLogs((prev) => [newLog, ...prev]);

    try {
      const res = await fetch('/api/voice-agent/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, args }),
      });

      const responseData = await res.json();

      // Check if authorization is required
      if (responseData.requiresAuthorization) {
        setAwaitingAuthorization(true);
        setToolLogs((prev) =>
          prev.map((l) => (l.id === callId ? { ...l, status: 'blocked', result: responseData } : l))
        );
      } else {
        setToolLogs((prev) =>
          prev.map((l) => (l.id === callId ? { ...l, status: 'completed', result: responseData.data } : l))
        );
      }

      // Trigger UI refreshes if incident status or state changed
      if (toolName === 'create_work_order' || toolName === 'authorize_dispatch' || toolName === 'verify_resolution') {
        if (toolName === 'authorize_dispatch') {
          setAwaitingAuthorization(false);
        }
        onIncidentCreated?.(activeIncidentId);
      }

      // Send tool.result back to AssemblyAI WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'tool.result',
            call_id: callId,
            result: JSON.stringify(responseData.data || responseData),
          })
        );
      }

      return responseData;
    } catch (err: any) {
      console.error(`Tool execution failed for ${toolName}:`, err);
      setToolLogs((prev) =>
        prev.map((l) => (l.id === callId ? { ...l, status: 'error', result: { error: err.message } } : l))
      );
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'tool.result',
            call_id: callId,
            result: JSON.stringify({ error: err.message || 'Tool execution failed' }),
          })
        );
      }
    }
  }, [activeIncidentId, onIncidentCreated]);

  // Connect to AssemblyAI Voice Agent WebSocket
  const connectToAssemblyAI = async () => {
    setIsConnecting(true);
    setErrorMessage('');

    try {
      // 1. Request short-lived token from backend
      const tokenRes = await fetch('/api/voice-token');
      const tokenData = await tokenRes.json();

      if (!tokenData.available || !tokenData.token) {
        console.warn('AssemblyAI token unavailable. Falling back to native browser engine:', tokenData.message || tokenData.error);
        setupNativeFallback();
        return;
      }

      const wsUrl = tokenData.wsUrl || `wss://agents.assemblyai.com/v1/ws?token=${tokenData.token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('Connected to AssemblyAI Voice Agent WebSocket');
        setConnectionMode('assemblyai');
        setIsConnecting(false);

        // Send session.update configuration
        const systemPrompt = `You are ExceptionOS, a voice-native operations agent for industrial incidents.
Your job is to help operations teams resolve real-world equipment exceptions.
When a worker reports an incident:
- identify the relevant asset
- investigate available operational data (telemetry, maintenance history, SOPs, inventory)
- explain what you found
- identify the recommended recovery plan
- never execute consequential actions without explicit user authorization
- after authorization, execute the permitted operational actions (dispatch_part, create_work_order)
- after work completion, independently verify the result with verify_resolution
- clearly communicate uncertainty
- never claim an action happened unless the corresponding tool succeeded.

Be concise, operational, and professional.
Do not behave like a general-purpose assistant.`;

        const sessionConfig = {
          type: 'session.update',
          session: {
            system_prompt: systemPrompt,
            greeting: 'ExceptionOS online. Ready to coordinate plant equipment exceptions.',
            tools: EXCEPTIONOS_TOOLS,
          },
        };

        ws.send(JSON.stringify(sessionConfig));

        // Start microphone capture
        await startMicrophoneStream();
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'session.ready':
              console.log('AssemblyAI Voice Agent session ready');
              break;

            case 'transcript.user':
              if (msg.text) {
                setActiveUserSpeech(msg.text);
                if (msg.is_final) {
                  setTranscripts((prev) => [
                    ...prev,
                    {
                      id: `usr-${Date.now()}`,
                      sender: 'user',
                      text: msg.text,
                      timestamp: getTimeString(),
                    },
                  ]);
                  setActiveUserSpeech('');
                }
              }
              break;

            case 'transcript.agent':
              if (msg.text) {
                setTranscripts((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.sender === 'agent' && last.isStreaming) {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, text: last.text + msg.text, isStreaming: !msg.is_final },
                    ];
                  }
                  return [
                    ...prev,
                    {
                      id: `agt-${Date.now()}`,
                      sender: 'agent',
                      text: msg.text,
                      timestamp: getTimeString(),
                      isStreaming: !msg.is_final,
                    },
                  ];
                });
              }
              break;

            case 'reply.audio':
              if (msg.audio) {
                playAgentAudio(msg.audio);
              }
              break;

            case 'tool.call':
              console.log('AssemblyAI tool call received:', msg.name, msg.arguments);
              await handleExecuteTool(msg.name, msg.call_id, msg.arguments || {});
              break;

            case 'error':
              console.error('AssemblyAI WebSocket error:', msg);
              setErrorMessage(`AssemblyAI Error: ${msg.message || 'Operational communication error'}`);
              break;

            default:
              break;
          }
        } catch (e) {
          console.warn('Error parsing WebSocket message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setErrorMessage('WebSocket connection to AssemblyAI failed. Activating native speech engine.');
        setupNativeFallback();
      };

      ws.onclose = () => {
        console.log('AssemblyAI WebSocket closed');
        setConnectionMode('disconnected');
        setIsListening(false);
      };
    } catch (err: any) {
      console.error('Failed to initialize AssemblyAI session:', err);
      setupNativeFallback();
    }
  };

  // Start 24kHz Mono Microphone Streaming to WebSocket
  const startMicrophoneStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      audioWorkletNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(inputData);
        const base64Audio = arrayBufferToBase64(pcm16);

        wsRef.current.send(
          JSON.stringify({
            type: 'input.audio',
            audio: base64Audio,
          })
        );
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      setIsListening(true);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setErrorMessage(`Microphone access error: ${err.message || 'Permission denied'}`);
    }
  };

  // Disconnect AssemblyAI & Release Audio Resources
  const disconnectSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setConnectionMode('disconnected');
    setIsListening(false);
    setIsAgentSpeaking(false);
  };

  // Native Browser Speech Fallback (Ensures zero downtime in offline/demo situations)
  const setupNativeFallback = () => {
    setIsConnecting(false);
    setConnectionMode('native');
    setErrorMessage('AssemblyAI key not set or unavailable. Operating with local engine.');

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript;
              setTranscripts((prev) => [
                ...prev,
                { id: `usr-${Date.now()}`, sender: 'user', text, timestamp: getTimeString() },
              ]);
              handleNativeAgentResponse(text);
              setActiveUserSpeech('');
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }
          setActiveUserSpeech(currentInterim);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        speechRecognitionRef.current = recognition;
        try {
          recognition.start();
          setIsListening(true);
        } catch {
          // ignore
        }
      }
    }
  };

  // Native Agent Fallback Handler (Executes full ExceptionOS loop)
  const handleNativeAgentResponse = async (userPrompt: string) => {
    const text = userPrompt.toLowerCase();
    const time = getTimeString();

    // Check for authorization command
    if (text.includes('authorize') || text.includes('approve') || text.includes('yes')) {
      await handleExecuteTool('authorize_dispatch', `call_${Date.now()}`, {
        action_name: 'Dispatch Bearing B-204 from Warehouse B to Plant A',
        authorized_by: 'Sarah Williams (Supervisor)',
      });
      await handleExecuteTool('dispatch_part', `call_${Date.now() + 1}`, {
        part_sku: 'B-204',
        from_location: 'Warehouse B',
        to_location: 'Plant A',
      });
      await handleExecuteTool('create_work_order', `call_${Date.now() + 2}`, {
        asset_code: 'M-007',
        title: 'Replace drive bearing B-204 and calibrate spindle',
        technician_name: 'James Okoro',
      });

      const responseText =
        'Authorization confirmed. Emergency dispatch initiated for Bearing B-204 from Warehouse B. Work order WO-2031 assigned to James Okoro. Work in progress.';
      setTranscripts((prev) => [
        ...prev,
        { id: `agt-${Date.now()}`, sender: 'agent', text: responseText, timestamp: time },
      ]);
      speakTextNative(responseText);
      return;
    }

    // Check for verification command
    if (text.includes('verify') || text.includes('resolution') || text.includes('sensor')) {
      const res = await handleExecuteTool('verify_resolution', `call_${Date.now()}`, {
        asset_code: 'M-007',
      });

      const responseText =
        'Independent sensor telemetry verification completed: Temperature dropped to 71°C and vibration normalized to 0.12g. Machine 7 is healthy and online. Incident marked RESOLVED.';
      setTranscripts((prev) => [
        ...prev,
        { id: `agt-${Date.now()}`, sender: 'agent', text: responseText, timestamp: time },
      ]);
      speakTextNative(responseText);
      return;
    }

    // Standard incident report (Machine 7)
    await handleExecuteTool('get_asset', `call_${Date.now()}`, { asset_identifier: 'Machine 7' });
    await handleExecuteTool('get_telemetry', `call_${Date.now() + 1}`, { asset_code: 'M-007' });
    await handleExecuteTool('get_maintenance_history', `call_${Date.now() + 2}`, { asset_code: 'M-007' });
    await handleExecuteTool('search_sop', `call_${Date.now() + 3}`, { query: 'overheating and vibration' });
    await handleExecuteTool('check_inventory', `call_${Date.now() + 4}`, { part_name: 'bearing', site_id: 'Plant A' });
    await handleExecuteTool('find_nearby_part', `call_${Date.now() + 5}`, { part_name: 'bearing' });

    setAwaitingAuthorization(true);
    const spoken =
      'I investigated Machine 7. Sensors confirm critical temperature of 94°C and 0.38g vibration. SOP SOP-M007-BRG indicates drive bearing replacement is required. Local inventory at Plant A is exhausted, but 4 compatible units of Bearing B-204 are located at Warehouse B, 14 kilometres away for $420. Consequential action requires explicit authorization. Do you authorize me to dispatch the bearing and create the repair work order?';

    setTranscripts((prev) => [
      ...prev,
      { id: `agt-${Date.now()}`, sender: 'agent', text: spoken, timestamp: time },
    ]);
    speakTextNative(spoken);
  };

  const speakTextNative = (text: string) => {
    if (audioMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    utterance.onstart = () => setIsAgentSpeaking(true);
    utterance.onend = () => setIsAgentSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Clean up when drawer closes
  useEffect(() => {
    if (!isOpen) {
      disconnectSession();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full z-10 text-slate-900 font-sans">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
              EX
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">ExceptionOS Voice Console</h2>
                {connectionMode === 'assemblyai' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>AssemblyAI Live</span>
                  </span>
                )}
                {connectionMode === 'native' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                    <span>Native Agent</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">AssemblyAI Universal-3.5 Pro · 24kHz PCM16</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAudioMuted(!audioMuted)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {audioMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* System & Incident Status Banner */}
        <div className="px-6 py-2.5 bg-slate-900 text-slate-200 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-300">Target Asset:</span>
            <span className="font-bold text-white">Machine 7 (M-007) · Plant A</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-slate-400">OPERATOR:</span>
            <span className="text-[10px] font-mono text-emerald-300 font-semibold">James Okoro</span>
          </div>
        </div>

        {/* Awaiting Authorization Callout Banner */}
        {awaitingAuthorization && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-900">CONSEQUENTIAL ACTION REQUIRES AUTHORIZATION</div>
                <div className="text-[11px] text-amber-700">Dispatch Bearing B-204 from Warehouse B ($420)</div>
              </div>
            </div>
            <button
              onClick={() =>
                handleNativeAgentResponse('Yes, authorize the dispatch and create the work order')
              }
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-xs transition-colors shrink-0"
            >
              Authorize
            </button>
          </div>
        )}

        {/* Scrollable Conversation & Tool Activity Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Connection Trigger when Disconnected */}
          {connectionMode === 'disconnected' && (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3 bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
                <Mic className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Connect to AssemblyAI Voice Agent</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Stream 24kHz mono PCM16 audio directly to AssemblyAI with real-time operational tool calling.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={connectToAssemblyAI}
                  disabled={isConnecting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-70"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Start Voice Session</span>
                    </>
                  )}
                </button>

                <button
                  onClick={setupNativeFallback}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Use Native Engine
                </button>
              </div>
            </div>
          )}

          {/* Quick Preset Operational Prompts */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Operational Commands:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() =>
                  handleNativeAgentResponse('Machine 7 is overheating and vibrating more than usual.')
                }
                className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors"
              >
                📢 &ldquo;Machine 7 is overheating and vibrating...&rdquo;
              </button>
              <button
                onClick={() =>
                  handleNativeAgentResponse('Yes, authorize the dispatch and create the work order')
                }
                className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors"
              >
                🛡️ &ldquo;Yes, authorize the dispatch.&rdquo;
              </button>
              <button
                onClick={() => handleNativeAgentResponse('Verify sensor telemetry resolution')}
                className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors"
              >
                🔍 &ldquo;Verify telemetry resolution.&rdquo;
              </button>
            </div>
          </div>

          {/* Conversation Transcript Stream */}
          <div className="space-y-3 pt-2">
            {transcripts.length === 0 && connectionMode !== 'disconnected' && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Microphone listening. Speak an operational report or tap a command above.
              </div>
            )}

            {transcripts.map((turn) => {
              const isUser = turn.sender === 'user';
              return (
                <div key={turn.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center space-x-1.5 pb-1 px-1">
                    <span className="text-[10px] font-mono text-slate-400">{turn.timestamp}</span>
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      {isUser ? 'Technician (James Okoro)' : 'ExceptionOS Agent'}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {turn.text}
                    {turn.isStreaming && <span className="inline-block w-1.5 h-3 ml-1 bg-slate-600 animate-pulse" />}
                  </div>
                </div>
              );
            })}

            {/* Interim active user speech */}
            {activeUserSpeech && (
              <div className="flex flex-col items-end opacity-70">
                <span className="text-[10px] font-mono text-slate-400 pb-0.5">Listening...</span>
                <div className="max-w-[85%] rounded-lg p-2.5 text-xs bg-slate-800 text-slate-200 italic border border-slate-700">
                  {activeUserSpeech}...
                </div>
              </div>
            )}
          </div>

          {/* Real-time Tool Activity Feed */}
          {toolLogs.length > 0 && (
            <div className="mt-4 border-t border-slate-200 pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Autonomous Operational Tool Trace</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{toolLogs.length} tools invoked</span>
              </div>

              <div className="space-y-1.5">
                {toolLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Cpu className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-slate-900">{log.toolName}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          log.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'blocked'
                            ? 'bg-amber-100 text-amber-800'
                            : log.status === 'error'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </div>

                    {log.result && (
                      <div className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-150 overflow-x-auto">
                        {typeof log.result === 'string' ? log.result : JSON.stringify(log.result, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Drawer Bottom Controls */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isListening ? (
              <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Microphone Active</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">Microphone Paused</span>
            )}
            {isAgentSpeaking && (
              <span className="inline-flex items-center space-x-1 text-xs text-blue-700 font-medium ml-2">
                <Activity className="w-3.5 h-3.5 animate-pulse text-blue-600" />
                <span>Agent Speaking...</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {connectionMode !== 'disconnected' ? (
              <button
                onClick={disconnectSession}
                className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectToAssemblyAI}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                Connect Voice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

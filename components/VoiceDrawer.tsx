'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, ArrowRight, CheckCircle2, AlertTriangle, Loader2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Incident } from '@/lib/types';

interface VoiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated?: (incidentId: string) => void;
}

interface StepLog {
  label: string;
  detail: string;
}

export default function VoiceDrawer({ isOpen, onClose, onIncidentCreated }: VoiceDrawerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<StepLog[]>([]);
  const [createdIncident, setCreatedIncident] = useState<Incident | null>(null);
  const [spokenResponse, setSpokenResponse] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Speech recognition instance
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentFinal += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => (prev ? `${prev} ${currentFinal}` : currentFinal));
          }
          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = () => {
    setErrorMessage('');
    setExecutionSteps([]);
    setCreatedIncident(null);
    setTranscript('');
    setInterimTranscript('');
    setSpokenResponse('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    } else {
      setErrorMessage('Browser speech recognition not available. Please type your operational report below.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleProcessReport = async (textToProcess?: string) => {
    const speech = textToProcess || transcript || interimTranscript;
    if (!speech.trim()) return;

    stopListening();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/voice-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speechText: speech }),
      });

      const data = await res.json();
      if (data.success && data.incident) {
        setCreatedIncident(data.incident);
        setExecutionSteps(data.steps || []);
        setSpokenResponse(data.spokenResponse || '');
        if (data.spokenResponse) {
          speakText(data.spokenResponse);
        }
        if (onIncidentCreated) {
          onIncidentCreated(data.incident.id);
        }
      } else {
        setErrorMessage(data.error || 'Failed to process voice report');
      }
    } catch (err) {
      console.error('Error processing speech:', err);
      setErrorMessage('Network error while processing operational exception');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setTranscript(promptText);
    handleProcessReport(promptText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">Talk to ExceptionOS</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-1.5 rounded-md text-xs border ${
                  ttsEnabled ? 'text-slate-700 bg-white border-slate-200' : 'text-slate-400 bg-slate-100 border-transparent'
                }`}
                title={ttsEnabled ? 'Voice feedback ON' : 'Voice feedback OFF'}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Live Listening State */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-center relative overflow-hidden">
              <div className="flex justify-center mb-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                    isListening
                      ? 'bg-rose-500 text-white ring-4 ring-rose-100 animate-pulse'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>

              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {isListening ? "Listening... Speak naturally" : "Click to speak"}
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                State what happened (e.g. &ldquo;Machine 7 is overheating and vibrating more than usual&rdquo;)
              </p>

              {/* Transcript Display */}
              <div className="mt-4 pt-4 border-t border-slate-200 text-left min-h-[70px]">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Captured speech:</div>
                <div className="text-xs text-slate-800 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-slate-200 min-h-[46px]">
                  {transcript || interimTranscript ? (
                    <span>
                      {transcript} <span className="text-slate-400 italic">{interimTranscript}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No audio recorded yet...</span>
                  )}
                </div>
              </div>

              {/* Action button */}
              {(transcript || interimTranscript) && !isProcessing && (
                <button
                  onClick={() => handleProcessReport()}
                  className="mt-3 w-full py-2 px-3 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Execute Exception Workflow</span>
                </button>
              )}
            </div>

            {/* Quick Test Prompts */}
            {!isProcessing && executionSteps.length === 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Try operational scenarios:
                </div>
                <div className="space-y-1.5">
                  {[
                    'Machine 7 is overheating and vibrating more than usual',
                    'Conveyor 3 high vibration and belt slipping under load',
                    'Hydraulic Press 2 pressure dropped below operating range',
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="w-full text-left text-xs p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-colors flex items-center justify-between group"
                    >
                      <span className="line-clamp-1">&ldquo;{prompt}&rdquo;</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Spinner */}
            {isProcessing && (
              <div className="p-6 rounded-xl border border-slate-200 bg-white text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-slate-700 mx-auto" />
                <div className="text-xs font-medium text-slate-900">Executing ExceptionOS Orchestration...</div>
                <p className="text-[11px] text-slate-500">
                  Querying telemetry, historical logs, SOPs, and cross-warehouse inventory.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Structured Operational Result */}
            {createdIncident && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Incident {createdIncident.id} Created
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                    {createdIncident.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-800 font-medium bg-white p-3 rounded-lg border border-emerald-200">
                  {createdIncident.title}
                </div>

                {/* Spoken Explanation */}
                {spokenResponse && (
                  <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    <span className="font-semibold text-slate-800">Operational assessment:</span> {spokenResponse}
                  </div>
                )}

                {/* 6-step checklist */}
                <div className="space-y-2 pt-2 border-t border-emerald-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Orchestration Trace:</div>
                  {executionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{step.label}</div>
                        <div className="text-[11px] text-slate-500">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct Action link */}
                <button
                  onClick={() => {
                    onClose();
                    if (onIncidentCreated) {
                      onIncidentCreated(createdIncident.id);
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm transition-colors"
                >
                  <span>Open Incident {createdIncident.id}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-center">
            <p className="text-[11px] text-slate-400">
              Consequential actions remain subject to human supervisor authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

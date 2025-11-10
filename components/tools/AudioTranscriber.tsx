
import React, { useState, useRef, useCallback, useEffect } from 'react';
// FIX: Removed non-exported `LiveSession` type.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Button } from '../common/Button';
import { encode } from '../../utils/audioUtils';

// Define a type for the window object to include webkitAudioContext
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}


const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('Ready to transcribe');
    const [error, setError] = useState<string | null>(null);
    const [transcription, setTranscription] = useState('');
    
    // FIX: Using `Promise<any>` as the `LiveSession` type is not exported from the SDK.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const stopTranscription = useCallback(() => {
        setIsRecording(false);
        setStatus('Stopping...');

        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if(mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        setStatus('Ready to transcribe');
    }, []);

    const startTranscription = useCallback(async () => {
        setIsRecording(true);
        setStatus('Initializing...');
        setError(null);
        setTranscription('');
        
        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                // This model is for audio tasks, but we are using gemini-2.5-flash as per the prompt for transcription. The Live API is better suited.
                config: {
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setStatus('Listening...');
                        if (!inputAudioContextRef.current || !mediaStreamRef.current) return;
                        
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then(session => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setTranscription(prev => prev + message.serverContent.inputTranscription.text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`Connection Error: ${e.message}`);
                        stopTranscription();
                    },
                    onclose: () => {
                        setStatus('Finished.');
                    },
                }
            });

        } catch (e: any) {
            setError(`Failed to start transcription: ${e.message}`);
            setIsRecording(false);
            setStatus('Error');
        }

    }, [stopTranscription]);

    useEffect(() => {
        return () => {
            stopTranscription();
        };
    }, [stopTranscription]);
    

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
                <Button onClick={isRecording ? stopTranscription : startTranscription} className={`w-48 ${isRecording ? 'bg-red-600 hover:bg-red-500' : ''}`}>
                    {isRecording ? 'Stop Transcribing' : 'Start Transcribing'}
                </Button>
                <p className="text-sm text-gray-400">Status: {status}</p>
            </div>
            
            {error && <div className="p-2 text-center text-red-400 bg-red-900/50 rounded">{error}</div>}

            <div className="h-[40vh] overflow-y-auto p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-semibold text-indigo-300 mb-2">Transcription:</h3>
                <p>{transcription || "..."}</p>
            </div>
        </div>
    );
};

export default AudioTranscriber;

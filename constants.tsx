
import React from 'react';
import type { Tool } from './types';

// Tool Components
import Chatbot from './components/tools/Chatbot';
import QuickChat from './components/tools/QuickChat';
import ImageAnalyzer from './components/tools/ImageAnalyzer';
import ImageEditor from './components/tools/ImageEditor';
import ImageGenerator from './components/tools/ImageGenerator';
import VideoGenerator from './components/tools/VideoGenerator';
import LiveConversation from './components/tools/LiveConversation';
import WebSearch from './components/tools/WebSearch';
import LocalExplorer from './components/tools/LocalExplorer';
import DeepThinker from './components/tools/DeepThinker';
import TextToSpeech from './components/tools/TextToSpeech';
import AudioTranscriber from './components/tools/AudioTranscriber';
import VideoAnalyzer from './components/tools/VideoAnalyzer';


// Icons
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const LightningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10v-5m6 5V7" /></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const SoundIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const WandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v.01V15m0 0A2.25 2.25 0 119.75 15 2.25 2.25 0 0112 15zm0 0V10.5m0 4.5v.01m0 0A2.25 2.25 0 1114.25 15 2.25 2.25 0 0112 15zm0 0V10.5m0 4.5v.01M12 3v.01m0 18V21m-4.5-4.5a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM12 10.5a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM16.5 16.5a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM12 15a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" /></svg>;


export const TOOLS: Tool[] = [
  { id: 'chatbot', name: 'Chat Bot', description: 'Ask questions and get responses from Gemini.', icon: <ChatIcon />, component: Chatbot, model: 'gemini-2.5-flash' },
  { id: 'quick-chat', name: 'Quick Chat', description: 'Get low-latency responses for fast queries.', icon: <LightningIcon />, component: QuickChat, model: 'gemini-2.5-flash-lite' },
  { id: 'image-analyzer', name: 'Image Understanding', description: 'Upload a photo and analyze it with Gemini.', icon: <ImageIcon />, component: ImageAnalyzer, model: 'gemini-2.5-flash' },
  { id: 'image-editor', name: 'Image Editor', description: 'Use text prompts to edit images.', icon: <EditIcon />, component: ImageEditor, model: 'gemini-2.5-flash-image' },
  { id: 'image-generator', name: 'Image Generator', description: 'Create high-quality images from text prompts.', icon: <WandIcon />, component: ImageGenerator, model: 'imagen-4.0-generate-001' },
  { id: 'video-generator', name: 'Video Generator (Veo)', description: 'Generate videos from text or an image.', icon: <VideoIcon />, component: VideoGenerator, model: 'veo-3.1-fast-generate-preview' },
  { id: 'video-analyzer', name: 'Video Analyzer', description: 'Analyze videos for key information.', icon: <VideoIcon />, component: VideoAnalyzer, model: 'gemini-2.5-pro' },
  { id: 'live-conversation', name: 'Live Conversation', description: 'Have a real-time voice chat with Gemini.', icon: <MicIcon />, component: LiveConversation, model: 'gemini-2.5-flash-native-audio-preview-09-2025' },
  { id: 'audio-transcriber', name: 'Audio Transcriber', description: 'Record your voice and get a transcription.', icon: <MicIcon />, component: AudioTranscriber, model: 'gemini-2.5-flash' },
  { id: 'web-search', name: 'Web Search (Grounded)', description: 'Get up-to-date answers from Google Search.', icon: <SearchIcon />, component: WebSearch, model: 'gemini-2.5-flash' },
  { id: 'local-explorer', name: 'Local Explorer (Grounded)', description: 'Find places and get info from Google Maps.', icon: <MapIcon />, component: LocalExplorer, model: 'gemini-2.5-flash' },
  { id: 'deep-thinker', name: 'Deep Thinker', description: 'Tackle complex queries with Thinking Mode.', icon: <BrainIcon />, component: DeepThinker, model: 'gemini-2.5-pro' },
  { id: 'text-to-speech', name: 'Text to Speech', description: 'Convert text into natural-sounding speech.', icon: <SoundIcon />, component: TextToSpeech, model: 'gemini-2.5-flash-preview-tts' },
];

export const DEFAULT_TOOL = TOOLS[0];

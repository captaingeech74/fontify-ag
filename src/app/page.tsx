"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Download, ArrowRight, Smartphone } from 'lucide-react';
import { Session } from '@/lib/session';
import { generateFontFromImage } from '@/lib/engine';

export default function Home() {
  const [name, setName] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [workerStatus, setWorkerStatus] = useState<string>('');
  const [fontUrl, setFontUrl] = useState<string | null>(null);

  const startSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/session', { method: 'POST' });
      const data = await res.json();
      setSession(data);
      generateTemplate(data.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTemplate = async (sessionId: string) => {
    setPdfGenerating(true);
    // TODO: Import jsPDF and generate the complex ArUco template
    // For now we mock it
    setTimeout(() => {
      setPdfGenerating(false);
    }, 1500);
  };

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      if (session.status === 'completed') return;

      const res = await fetch(`/api/session/${session.id}`);
      const data = await res.json();
      
      if (data.status === 'uploaded' && session.status !== 'uploaded') {
        setSession(data);
        runDesktopPipeline(data.imageUrl);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [session]);

  const runDesktopPipeline = async (imageUrl: string) => {
    try {
      const blob = await generateFontFromImage(imageUrl, name, setWorkerStatus);
      const url = URL.createObjectURL(blob);
      setFontUrl(url);
      setSession(prev => prev ? { ...prev, status: 'completed' } : null);
    } catch (error) {
      console.error(error);
      setWorkerStatus('Error generating font.');
    }
  };

  if (session) {
    if (session.status === 'completed') {
      return (
        <main className="container flex flex-col items-center justify-center text-center animate-fade-in" style={{ flex: 1 }}>
          <div className="glass-card flex flex-col items-center max-w-md w-full">
            <Sparkles size={48} className="mb-6" color="var(--primary)" />
            <h2>Your Font is Ready!</h2>
            <p>We've successfully transformed your handwriting.</p>
            {fontUrl && (
              <a href={fontUrl} download={`${name || 'MyFont'}.otf`} className="btn btn-primary mt-4 flex items-center gap-2" style={{ textDecoration: 'none' }}>
                <Download size={20} /> Download .OTF
              </a>
            )}
          </div>
        </main>
      );
    }

    if (session.status === 'uploaded' || workerStatus) {
      return (
        <main className="container flex flex-col items-center justify-center text-center animate-fade-in" style={{ flex: 1 }}>
          <div className="glass-card flex flex-col items-center max-w-md w-full">
            <Sparkles size={48} className="mb-6 animate-pulse-subtle" color="var(--primary)" />
            <h2>Building Your Font</h2>
            <p className="mb-0">{workerStatus || 'Initializing engine...'}</p>
          </div>
        </main>
      );
    }

    return (
      <main className="container flex flex-col items-center justify-center text-center animate-fade-in" style={{ flex: 1 }}>
        <div className="glass-card flex flex-col items-center max-w-lg w-full">
          <h2>Step 2: Print & Scan</h2>
          <p>
            {pdfGenerating 
              ? "Generating your personalized template..." 
              : "1. Download and print the template.\n2. Write your characters.\n3. Scan the QR code below."}
          </p>
          
          <div className="flex gap-4 mt-4 mb-8">
            <button className="btn btn-secondary" disabled={pdfGenerating}>
              <Download size={20} className="mr-2" />
              Download PDF Template
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
            <QRCodeSVG 
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/capture/${session.id}`}
              size={200}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
            <Smartphone size={16} /> Scan to capture with phone
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container flex flex-col items-center justify-center text-center animate-fade-in" style={{ flex: 1 }}>
      <div className="max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="glass p-3 rounded-2xl animate-pulse-subtle">
            <Sparkles size={32} color="var(--primary)" />
          </div>
        </div>
        <h1>Your Handwriting,<br/>Digitalized.</h1>
        <p className="mt-6 mb-8 text-lg">
          Turn your penmanship into a high-quality, installable font in minutes. No complex tools, just write, scan, and download.
        </p>
        
        <form onSubmit={startSession} className="glass-card max-w-md mx-auto flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="What should we call your font?" 
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Starting...' : 'Let\'s Go'} <ArrowRight size={20} className="ml-2" />
          </button>
        </form>
      </div>
    </main>
  );
}

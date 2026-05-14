"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, Loader2 } from 'lucide-react';

export default function CapturePage(props: { params: Promise<{ sessionId: string }> }) {
  const params = React.use(props.params);
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState('Align template within frame and capture');
  const [previewState, setPreviewState] = useState<'initial' | 'uploading' | 'magic' | 'done'>('initial');
  
  // For the magic reveal
  const [revealedGlyphs, setRevealedGlyphs] = useState<string[]>([]);
  const dummyGlyphs = ['A', 'b', 'c', 'e', 'T', 'h', 'm', 'i'];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setStatusText('Looks good! Processing...');
      uploadPhoto(e.target.files[0]);
    }
  };

  const uploadPhoto = async (file: File) => {
    setPreviewState('uploading');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/session/${params.sessionId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        runMagicReveal();
      } else {
        setStatusText('Upload failed. Try again.');
        setPreviewState('initial');
      }
    } catch (error) {
      console.error(error);
      setStatusText('Network error.');
      setPreviewState('initial');
    } finally {
      setUploading(false);
    }
  };

  const runMagicReveal = () => {
    setPreviewState('magic');
    setStatusText('Extracting glyphs...');
    
    // Animate fake glyph extraction
    dummyGlyphs.forEach((g, i) => {
      setTimeout(() => {
        setRevealedGlyphs(prev => [...prev, g]);
      }, i * 300);
    });

    setTimeout(() => {
      setPreviewState('done');
      setStatusText('Magic complete! Check your desktop.');
    }, dummyGlyphs.length * 300 + 1000);
  };

  if (previewState === 'done') {
    return (
      <main className="container flex flex-col items-center justify-center text-center animate-fade-in" style={{ flex: 1, padding: '1rem' }}>
        <div className="glass-card flex flex-col items-center w-full relative overflow-hidden p-8">
          <CheckCircle size={64} className="mb-4 text-green-400 animate-pulse-subtle" />
          <h2 style={{ fontFamily: 'var(--handwriting-font, cursive)', fontSize: '2.5rem', lineHeight: '1.2' }} className="mb-6 text-primary">
            Hi! It's nice to meet you.
          </h2>
          <p style={{ fontFamily: 'var(--handwriting-font, cursive)', fontSize: '1.5rem', color: '#fff' }}>
            This is your very own handwriting turned into a digital tool just for you, and there is no other like it on the planet. How cool is that?
          </p>
          <p className="mt-8 text-sm text-gray-400">Head back to your desktop to download the final .OTF file.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container flex flex-col items-center justify-center text-center" style={{ flex: 1, padding: '1rem' }}>
      <div className="glass-card flex flex-col items-center w-full min-h-[400px] justify-center relative">
        
        {previewState === 'initial' && (
          <>
            <Camera size={48} className="mb-6 opacity-50" />
            <h2>Capture Template</h2>
            <p className="text-sm px-4">{statusText}</p>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleCapture}
            />
            <button 
              className="btn btn-primary mt-4 w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Open Camera
            </button>
          </>
        )}

        {previewState === 'uploading' && (
          <div className="flex flex-col items-center animate-fade-in">
            <Loader2 size={48} className="mb-6 animate-spin text-primary" />
            <h2>Uploading...</h2>
            <p>Sending your handwriting to the engine.</p>
          </div>
        )}

        {previewState === 'magic' && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            <h2 className="mb-4">Extracting Magic...</h2>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {revealedGlyphs.map((g, i) => (
                <div key={i} className="w-12 h-12 bg-white text-black flex items-center justify-center rounded text-2xl font-bold animate-fade-in" style={{ fontFamily: 'cursive' }}>
                  {g}
                </div>
              ))}
            </div>
            {/* Fake progress bar */}
            <div className="w-full bg-gray-800 h-2 mt-8 rounded overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                style={{ width: `${(revealedGlyphs.length / dummyGlyphs.length) * 100}%` }}
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

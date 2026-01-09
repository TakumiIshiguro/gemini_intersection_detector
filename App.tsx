
import React, { useState, useRef, useEffect } from 'react';
import { HallwayShape } from './types';
import { SHAPE_LABELS } from './constants';
import AnalysisCard from './components/AnalysisCard';
import { GoogleGenAI } from "@google/genai";

// Fix: Augment Window with the correct AIStudio type and readonly modifier to resolve TypeScript errors.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [selectedShape, setSelectedShape] = useState<HallwayShape | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<number | null>(null);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capture current frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setIsAnalyzing(true);
    try {
      // Create a new instance right before the call to ensure the latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                text: `この画像に映っている通路の形状を、次の選択肢から一つ選んでJSONで回答してください。
                選択肢: [0] straight_road, [1] dead_end, [2] corner_right, [3] corner_left, [4] cross_road, [5] 3_way_right, [6] 3_way_center, [7] 3_way_left
                回答形式: {"shape": number, "reason": "簡潔な理由(日本語)"}
                数字は選択肢の番号(0-7)を入れてください。`
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      // Extract text content directly from the .text property as per guidelines
      let jsonStr = response.text?.trim() || "{}";
      // Handle potential markdown block wrapper even with application/json
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      }
      
      const result = JSON.parse(jsonStr);
      const shapeKeys = Object.values(HallwayShape);
      if (result.shape !== undefined && shapeKeys[result.shape]) {
        setSelectedShape(shapeKeys[result.shape]);
        setReason(result.reason || "AIによる自動判定");
        setShowResult(true);
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      
      // Handle 404 "Requested entity was not found" by prompting for API key selection
      if (error?.message?.includes("Requested entity was not found") || 
          error?.status === "NOT_FOUND" || 
          (typeof error?.error === 'object' && error.error?.code === 404)) {
        console.warn("Model or key error detected. Opening API key selection...");
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleLiveAnalysis = async () => {
    if (isLive) {
      stopAnalysis();
    } else {
      // Check for API key if entering live mode
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
      startAnalysis();
    }
  };

  const startAnalysis = () => {
    setIsLive(true);
    // Analyze every 3 seconds while playing
    analysisIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        captureAndAnalyze();
      }
    }, 3000);
  };

  const stopAnalysis = () => {
    setIsLive(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setShowResult(false);
      setSelectedShape(null);
    }
  };

  useEffect(() => {
    return () => stopAnalysis();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Real-time Hallway AI
            </h1>
          </div>
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              <span className="text-xs font-bold uppercase tracking-widest">Live Analyzing</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl aspect-video relative group border border-slate-800">
            {videoFile ? (
              <video 
                ref={videoRef}
                src={videoFile}
                className="w-full h-full object-contain"
                controls
                onPlay={() => isLive && startAnalysis()}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <label className="cursor-pointer bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg">
                  動画をアップロード
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>
                <p className="mt-4 text-slate-400 text-sm">解析を開始するには動画を選択してください</p>
              </div>
            )}
            
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleLiveAnalysis}
                disabled={!videoFile}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${
                  isLive 
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLive ? "リアルタイム解析を停止" : "リアルタイム解析を開始"}
              </button>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                   <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   AIが判定中...
                </div>
              )}
            </div>
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
              Classification Mode: Dynamic
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">形状ラベル</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(SHAPE_LABELS).map(([key, label]) => (
                <div 
                  key={key} 
                  className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                    selectedShape === key 
                    ? "bg-indigo-50 border-indigo-400 text-indigo-700 ring-4 ring-indigo-50 scale-105" 
                    : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {showResult && selectedShape ? (
            <AnalysisCard 
              shape={selectedShape} 
              reason={reason}
              onReset={() => {
                setSelectedShape(null);
                setShowResult(false);
              }}
            />
          ) : (
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 className="text-slate-900 font-bold mb-1">解析スタンバイ</h4>
              <p className="text-slate-500 text-sm">解析を開始すると、ここにリアルタイムで結果が表示されます。</p>
            </div>
          )}

          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="font-bold flex items-center gap-2 mb-4 relative z-10">
              <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
              </svg>
              AI解析プロセス
            </h3>
            <div className="space-y-4 text-xs text-slate-400 relative z-10">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-indigo-400 font-mono">01</div>
                <p>再生中の映像から3秒おきにキーフレームを抽出します。</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-indigo-400 font-mono">02</div>
                <p>Gemini Vision APIが通路のトポロジー（壁、分岐、終端）を認識。</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-indigo-400 font-mono">03</div>
                <p>定義された8つのクラスから最適なものを確信度と共に返却。</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

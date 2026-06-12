import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileUp, Type, Loader2, Sparkles, AlertCircle, FileText, X, Wand2 } from 'lucide-react';
import { analyzeJD, generateJD } from '../../lib/recruiterGemini';
import { JDAnalysis } from '../../types';
import { extractTextFromFile } from '../../lib/parser';

interface JDUploadComponentProps {
  onAnalysisComplete: (analysis: JDAnalysis, content: string) => void;
}

export function JDUploadComponent({ onAnalysisComplete }: JDUploadComponentProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'ai'>('text');
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const generated = await generateJD(aiPrompt);
      setContent(generated);
      setActiveTab('text');
    } catch (err: any) {
      setError(err.message || "Failed to generate JD");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsAnalyzing(true);
    setError(null);

    try {
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 50) {
        throw new Error("Job description content too small. Check your file.");
      }
      setContent(text);
    } catch (err: any) {
      setError(err.message || "Failed to read file");
      setSelectedFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeJD(content);
      onAnalysisComplete(analysis, content);
    } catch (err: any) {
      setError(err.message || "Failed to analyze JD");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => {
            setActiveTab('text');
            setSelectedFile(null);
          }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'text' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Type className="w-4 h-4" />
          Paste Text
        </button>
        <button 
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'file' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FileUp className="w-4 h-4" />
          Upload Document
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'ai' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Wand2 className="w-4 h-4" />
          AI Drafter
        </button>
      </div>

      <div className="p-8 space-y-6">
        {activeTab === 'ai' ? (
          <div className="space-y-6">
            <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">What role are you hiring for?</h4>
              <input 
                type="text"
                placeholder="e.g. Senior Frontend Engineer with 5 years React experience..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-tighter font-bold">
                Enter a title or basic requirements, and TalentLens AI will draft a complete professional JD.
              </p>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? "Drafting..." : "Generate Professional JD"}
            </button>
          </div>
        ) : activeTab === 'text' ? (
          <textarea 
            placeholder="Paste your full Job Description here... AI will extract requirements automatically."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[300px] bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          />
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-slate-50 p-8 text-center group hover:border-blue-400 transition-all cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-4 w-full">
                <div className="p-4 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div className="text-left">
                      <p className="font-bold text-slate-900 truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setContent('');
                    }}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-left bg-white p-4 rounded-xl border border-slate-100 max-h-[160px] overflow-hidden relative">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Extracted Preview</p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">{content}</p>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                  <FileUp className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Drop JD Document</p>
                  <p className="text-xs text-slate-400">PDF, DOCX supported (via parser)</p>
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button 
          disabled={isAnalyzing || !content.trim()}
          onClick={handleAnalyze}
          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {selectedFile && !content ? "Extracting Text..." : "AI Analyzing JD..."}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Extract Hiring Intelligence
            </>
          )}
        </button>
      </div>
    </div>
  );
}

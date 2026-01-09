
import React from 'react';
import { HallwayShape } from '../types';
import { SHAPE_LABELS } from '../constants';

interface AnalysisCardProps {
  shape: HallwayShape;
  reason: string;
  onReset: () => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ shape, reason, onReset }) => {
  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
        <h3 className="font-bold">現在の判定</h3>
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono uppercase">AI Result</span>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">分類クラス</label>
          <div className="text-xl font-black text-indigo-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
            {SHAPE_LABELS[shape]}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">判定理由 (AI考察)</label>
          <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
            "{reason}"
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            onClick={onReset}
            className="w-full py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
          >
            Clear Result
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;

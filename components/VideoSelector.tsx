
import React from 'react';

const VideoSelector: React.FC = () => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {[1, 2, 3].map((i) => (
        <button 
          key={i}
          className={`flex-shrink-0 w-24 aspect-video rounded-lg border-2 transition-all ${
            i === 1 ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 grayscale opacity-60"
          } overflow-hidden`}
        >
          <img src={`https://picsum.photos/seed/h${i}/200/120`} alt={`Sample ${i}`} className="w-full h-full object-cover" />
        </button>
      ))}
      <button className="flex-shrink-0 w-24 aspect-video rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        <span className="text-[10px] mt-1 font-bold">UPLOAD</span>
      </button>
    </div>
  );
};

export default VideoSelector;

import React, { useState } from 'react';

export default function SummarySection({ movies, selectedYear }) {
  const [hoveredReview, setHoveredReview] = useState(null);

  if (!movies || movies.length === 0) {
    return (
      <div className="py-12 text-center text-gray-300 text-[10px] tracking-[0.2em] uppercase">
        No records for this selection
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400 mb-8">
        {selectedYear} My Best Records (★★★★★)
      </h2>
      
      <div className="flex gap-4 mb-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((m, i) => (
          <div key={i} className="flex flex-col shrink-0 relative">
            <button 
              onMouseEnter={() => setHoveredReview(m.review)}
              onMouseLeave={() => setHoveredReview(null)}
              className="w-16 h-24 bg-gray-50 border border-gray-100 overflow-hidden hover:opacity-70 transition-opacity relative"
            >
              <img src={m.poster_url} className="w-full h-full object-cover" alt={m.title} />
              
              <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5">
                {!!m.isHeart && <span className="text-[10px] text-red-500 drop-shadow-sm">♥</span>}
                {(m.repeatCount || 1) > 1 && (
                  <span className="bg-black/60 text-white text-[7px] font-bold px-0.5 rounded-[2px]">
                    x{m.repeatCount}
                  </span>
                )}
              </div>
            </button>
            <span className="text-[8px] mt-1 text-gray-300 uppercase tracking-[0.1em] truncate w-16">
              {m.category || 'Movie'}
            </span>
          </div>
        ))}
      </div>
      
      {/* 리뷰가 있을 때만 동적으로 나타나며 공간을 차지함 */}
      {hoveredReview && (
        <div className="animate-in fade-in zoom-in-95 duration-200 mb-4">
          <blockquote className="text-[11px] italic text-gray-400 text-center line-clamp-2 max-w-sm mx-auto">
            "{hoveredReview}"
          </blockquote>
        </div>
      )}
    </>
  );
}
import React, { useState } from 'react';

export default function RatingChart({ distribution }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: 0 });
  const maxVal = Math.max(...Object.values(distribution), 1);

  const handleMouseMove = (e, val) => {
    // e.clientX, clientY를 통해 마우스 위치 파악
    setTooltip({ visible: true, x: e.clientX + 10, y: e.clientY - 30, value: val });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <div className="relative flex items-end justify-between h-20 gap-4 mt-6">
      {/* 커서 따라다니는 툴팁 요소 */}
      {tooltip.visible && (
        <div 
          className="fixed bg-gray-900 text-white text-[8px] px-2 py-1 pointer-events-none z-50 rounded-sm shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.value} 편
        </div>
      )}

      {[1, 2, 3, 4, 5].map(s => (
        <div key={s} className="flex flex-col items-center flex-1 gap-3">
          <div 
            className="w-full bg-gray-50 h-20 relative flex items-end cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, distribution[s])}
            onMouseLeave={handleMouseLeave}
          >
            <div 
              className="w-full bg-gray-900 transition-all duration-500" 
              style={{ height: `${(distribution[s] / maxVal) * 100}%` }}
            ></div>
          </div>
          <span className="text-[9px] text-gray-300 uppercase tracking-widest">{s}</span>
        </div>
      ))}
    </div>
  );
}
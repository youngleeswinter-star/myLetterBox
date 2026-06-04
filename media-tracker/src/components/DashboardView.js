import React from 'react';

export default function DashboardView({ logs }) {
  const stats = (logs || []).reduce((acc, log) => {
    const parts = log.date.split('.'); 
    if (parts.length < 2) return acc;
    
    const y = parts[0];
    const m = parts[1];
    const key = `${y}.${m.padStart(2, '0')}`; // 정렬을 위해 01월 형태로 통일
    const count = log.items?.length || 0;
    
    acc[key] = (acc[key] || 0) + count;
    return acc;
  }, {});

  const sortedStats = Object.entries(stats).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="p-6">
      {/* 타이틀 영역 */}
      <div className="mb-10">
        <h2 className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400">Monthly Archive</h2>
      </div>

      {sortedStats.length === 0 ? (
        <p className="text-[11px] text-gray-300 tracking-[0.2em] uppercase text-center py-20 italic">No records found.</p>
      ) : (
        <div className="space-y-8">
          {sortedStats.map(([month, count]) => (
            <div key={month} className="flex justify-between items-baseline border-b border-gray-50 pb-4">
              <span className="text-[13px] font-light tracking-[0.1em] text-gray-900">{month}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-light">{count}</span>
                <span className="text-[9px] text-gray-300 uppercase tracking-[0.2em]">Movies</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
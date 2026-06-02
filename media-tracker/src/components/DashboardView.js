import React from 'react';

export default function DashboardView({ logs }) {
  // 데이터 집계 로직
  const stats = (logs || []).reduce((acc, log) => {
    const parts = log.date.split('.'); 
    if (parts.length < 2) return acc;
    
    const y = parts[0];
    const m = parts[1];
    const key = `${y}년 ${m}월`;
    const count = log.items?.length || 0;
    
    acc[key] = (acc[key] || 0) + count;
    return acc;
  }, {});

  const sortedStats = Object.entries(stats).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="font-black text-lg">시청 통계</h2>
      </div>

      {sortedStats.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">기록된 데이터가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {sortedStats.map(([month, count]) => (
            <div key={month} className="flex justify-between items-center p-4 border rounded-2xl bg-white shadow-sm">
              <span className="font-black text-sm">{month}</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black">{count}</span>
                <span className="text-xs text-gray-400 font-bold">편 시청</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React from 'react';

export default function MonthlyHeatmap({ allLogs, selectedYear }) {
  // 고정된 현재 연도 대신, 전달받은 selectedYear를 사용
  const targetYear = selectedYear.toString();
  
  const dataMap = Array.from({ length: 12 }, (_, i) => i + 1).reduce((acc, m) => {
    acc[m] = { watched: 0, wish: 0 };
    return acc;
  }, {});

  (allLogs || []).forEach(log => {
    if (log?.date) {
      const [y, m] = log.date.split('.');
      // targetYear와 비교
      if (y === targetYear && dataMap[parseInt(m)]) {
        (log.items || []).forEach(item => {
          if (item.status === 'watched') dataMap[parseInt(m)].watched += 1;
          if (item.status === 'wish') dataMap[parseInt(m)].wish += 1;
        });
      }
    }
  });

  return (
    <div className="mt-20">
      <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-8 ml-1">Activity Record</h2>
      
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(dataMap).map(([m, data]) => (
          <div key={m} className="flex items-center group">
            <span className="text-[9px] text-gray-300 w-6 font-mono">{m.padStart(2, '0')}</span>
            
            <div className="flex gap-1 items-center h-4">
              {/* Watched: 차분한 다크 그레이 */}
              {Array.from({ length: Math.min(data.watched, 12) }).map((_, i) => (
                <div key={`w-${i}`} className="w-2.5 h-2.5 rounded-[3px] bg-gray-900 transition-all hover:scale-125" />
              ))}
              
              {/* Wish: 산뜻한 핑크 테두리 */}
              {Array.from({ length: Math.min(data.wish, 12) }).map((_, i) => (
                <div key={`s-${i}`} className="w-2.5 h-2.5 rounded-[3px] border border-pink-300 transition-all hover:border-pink-500 hover:scale-125" />
              ))}

              {/* 아무 기록이 없을 때의 은은한 점 */}
              {data.watched === 0 && data.wish === 0 && (
                <div className="w-1 h-1 rounded-full bg-gray-100 ml-1" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
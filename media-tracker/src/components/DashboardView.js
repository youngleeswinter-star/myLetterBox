import React, { useMemo } from 'react';

export default function DashboardView({ logs }) {
  const { monthlyStats, ratingDistribution, bestMovies, latestReview } = useMemo(() => {
  const currentYear = new Date().getFullYear().toString(); // "2026"
  const mStats = {};
  const rDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  // 현재 연도인 영화만 따로 수집
  let currentYearBestMovies = [];

  (logs || []).forEach(log => {
    // 날짜 포맷 (yyyy.mm.dd)에서 연도 추출
    const year = log.date.split('.')[0]; 
    
    // 월별 통계 (전체 기간용)
    const [y, m] = log.date.split('.');
    const key = `${y}.${m.padStart(2, '0')}`;
    mStats[key] = (mStats[key] || 0) + (log.items?.length || 0);
    
    // 별점 분포 (전체 기간용)
    log.items?.forEach(item => {
      if (item.rating && item.rating >= 1 && item.rating <= 5) {
        rDist[item.rating] += 1;
      }
      
      // 현재 연도이고 5점인 영화만 수집
      if (year === currentYear && item.rating === 5) {
        currentYearBestMovies.push(item);
      }
    });
  });

  return { 
  monthlyStats: Object.entries(mStats).sort((a, b) => b[0].localeCompare(a[0])), 
  ratingDistribution: rDist,
  // .slice(-3)을 제거하여 전체 목록을 반환합니다
  bestMovies: [...currentYearBestMovies].reverse(),
  latestReview: currentYearBestMovies.find(m => m.review)?.review 
};
}, [logs]);

  const maxVal = Math.max(...Object.values(ratingDistribution), 1);

  return (
    <div className="p-6">
      {/* 1. Archive Summary 영역 */}
      {bestMovies.length > 0 && (
  <div className="mb-16">
    <h2 className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400 mb-8">
      {new Date().getFullYear()} Summary
    </h2>
    
    {/* 수평 스크롤 컨테이너 */}
    <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
      {bestMovies.map((m, i) => (
        <div key={i} className="w-16 h-24 bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
          <img src={m.poster_url} className="w-full h-full object-cover" alt="" />
        </div>
      ))}
    </div>
    
    {latestReview && (
      <blockquote className="text-[12px] italic text-gray-500 border-l-2 border-gray-200 pl-4 py-1">
        "{latestReview}"
      </blockquote>
    )}
  </div>
)}

      {/* 2. Rating Spectrum 영역 */}
      <div className="mb-16">
        <h2 className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400 mb-8">Rating Spectrum</h2>
        <div className="flex items-end justify-between h-20 gap-4">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex flex-col items-center flex-1 gap-3">
              <div className="w-full bg-gray-50 h-20 relative flex items-end">
                <div className="w-full bg-gray-900 transition-all duration-500" style={{ height: `${(ratingDistribution[s] / maxVal) * 100}%` }}></div>
              </div>
              <span className="text-[9px] text-gray-300 uppercase tracking-widest">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Monthly Archive 영역 */}
      <div>
        <h2 className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400 mb-8">Monthly Archive</h2>
        {/* ...기존 Monthly Archive 코드 동일... */}
        {monthlyStats.map(([month, count]) => (
  <div key={month} className="flex justify-between items-center border-b border-gray-50 pb-4">
    <span className="text-[13px] font-light tracking-[0.1em] text-gray-900">{month}</span>
    
    {/* 정렬을 위한 래퍼: flex-row와 items-baseline 조합 */}
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl font-light leading-none">{count}</span>
      <span className="text-[9px] text-gray-300 uppercase tracking-[0.2em] translate-y-[-1px]">Movies</span>
    </div>
  </div>
))}
      </div>
    </div>
  );
}
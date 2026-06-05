import React, { useMemo, useState, useEffect } from 'react';

export default function DashboardView({ logs }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeReview, setActiveReview] = useState(null);

  const { monthlyStats, ratingDistribution, bestMovies, availableYears, categories } = useMemo(() => {
    const mStats = {};
    const rDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const foundYears = new Set();
    const catSet = new Set(['All']);
    let yearBestMovies = [];

    (logs || []).forEach(log => {
      const year = log.date.split('.')[0];
      foundYears.add(year);
      
      if (year === selectedYear) {
        const [y, m] = log.date.split('.');
        const key = `${y}.${m.padStart(2, '0')}`;
        
        log.items?.forEach(item => {
          if (item.category) catSet.add(item.category);
          
          // 카테고리 필터링이 적용된 상태에서만 통계 계산
          if (selectedCategory === 'All' || item.category === selectedCategory) {
            mStats[key] = (mStats[key] || 0) + 1;
            
            if (item.rating && item.rating >= 1 && item.rating <= 5) {
              rDist[item.rating] += 1;
            }
            if (item.rating === 5) {
              yearBestMovies.push(item);
            }
          }
        });
      }
    });

    return {
      monthlyStats: Object.entries(mStats).sort((a, b) => b[0].localeCompare(a[0])),
      ratingDistribution: rDist,
      bestMovies: [...yearBestMovies].reverse(),
      availableYears: Array.from(foundYears).sort().reverse(),
      categories: Array.from(catSet)
    };
  }, [logs, selectedYear, selectedCategory]);

  useEffect(() => {
    setActiveReview(bestMovies.length > 0 ? (bestMovies[0].review || null) : null);
  }, [bestMovies]);

  const maxVal = Math.max(...Object.values(ratingDistribution), 1);
  const maxMonthly = Math.max(...monthlyStats.map(s => s[1]), 1);

  return (
    <div className="p-6">
      {/* 1. 연도 및 카테고리 필터 영역 */}
      <div className="mb-16">
        <div className="flex gap-6 mb-6">
          {availableYears.map(year => (
            <button key={year} onClick={() => setSelectedYear(year)}
              className={`text-[10px] uppercase tracking-[0.3em] pb-1 border-b-2 transition-colors ${selectedYear === year ? 'text-gray-900 border-gray-900' : 'text-gray-300 border-transparent'}`}
            >{year}</button>
          ))}
        </div>
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`text-[9px] uppercase tracking-[0.2em] px-3 py-1 border transition-colors ${selectedCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-transparent text-gray-400 border-gray-200'}`}
            >{cat}</button>
          ))}
        </div>

        {bestMovies.length > 0 && (
          <>
            <h2 className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400 mb-8">{selectedYear} Summary</h2>
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
              {bestMovies.map((m, i) => (
                <div key={i} className="flex flex-col shrink-0">
                  <button onClick={() => setActiveReview(m.review || null)}
                    className="w-16 h-24 bg-gray-50 border border-gray-100 overflow-hidden hover:opacity-70 transition-opacity"
                  >
                    <img src={m.poster_url} className="w-full h-full object-cover" alt={m.title} />
                  </button>
                  <span className="text-[8px] mt-2 text-gray-300 uppercase tracking-[0.1em] truncate w-16">{m.category || 'Movie'}</span>
                </div>
              ))}
            </div>
            {activeReview && (
              <div className="mt-2 animate-in fade-in duration-500 overflow-hidden">
                <blockquote className="text-[12px] italic text-gray-500 border-l-2 border-gray-200 pl-4 py-1 break-words leading-relaxed">
                  "{activeReview}"
                </blockquote>
              </div>
            )}
          </>
        )}
      </div>

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
        <div className="space-y-6">
          {monthlyStats.map(([month, count]) => (
            <div key={month} className="group">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-[12px] font-light text-gray-900">{month}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[15px] font-medium text-gray-900">{count}</span>
                  <span className="text-[9px] text-gray-300 uppercase tracking-[0.2em]">Records</span>
                </div>
              </div>
              <div className="w-full h-[2px] bg-gray-50">
                <div className="h-full bg-gray-900 transition-all duration-500" style={{ width: `${(count / maxMonthly) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
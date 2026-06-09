import React, { useState } from 'react';
import RatingChart from './Components/RatingChart';
import LibrarySection from './Components/LibrarySection';
import MonthlyHeatmap from './Components/MonthlyHeatmap';
import DashboardSummary from './Components/DashboardSummary';
import { useDashboardData } from '../../core/hooks/useDashboardData';
import { useLogs } from '../../core/context/LogContext';

export default function DashboardView() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const { logs } = useLogs();

  const { 
    ratingDistribution, 
    bestMovies, 
    watchedMovies, 
    availableYears, 
    categories 
  } = useDashboardData(selectedYear, selectedCategory);

  // 검색 필터링 로직
  const filteredWatched = (watchedMovies || []).filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

  return (
    <div className="p-6">
      {/* 1. 필터 영역 (연도 & 카테고리) */}
      <div className="mb-8 space-y-6">
        <div className="flex gap-6">
          {availableYears.map(year => (
            <button key={year} onClick={() => setSelectedYear(year)} 
              className={`text-[10px] uppercase tracking-[0.3em] pb-1 border-b-2 transition-colors ${selectedYear === year ? 'text-gray-900 border-gray-900' : 'text-gray-300 border-transparent'}`}>
              {year}
            </button>
          ))}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} 
              className={`text-[9px] uppercase tracking-[0.2em] px-3 py-1 border transition-colors ${selectedCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-transparent text-gray-400 border-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 조건부 검색 및 셔플 영역 (Summary 아닐 때만 노출) */}
      {viewMode !== 'summary' && (
        <div className="flex gap-2 mb-6 animate-in slide-in-from-top-2 duration-300">
          <input 
            type="text" placeholder="SEARCH RECORDS..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-[10px] tracking-[0.1em] p-2 border-b border-gray-900 outline-none"
          />
          
        </div>
      )}

      {/* 3. 모드 탭 */}
      <div className="flex gap-6 mb-8 border-b border-gray-50 pb-2">
        {['summary', 'watched', 'wishlist'].map((mode) => (
          <button 
            key={mode} 
            onClick={() => {
              setViewMode(mode);
              setSearchTerm(''); // 탭 이동 시 검색어 초기화
            }} 
            className={`text-[9px] uppercase tracking-[0.2em] transition-colors ${viewMode === mode ? 'font-bold text-gray-900' : 'text-gray-300'}`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* 4. 메인 콘텐츠 */}
      <div className="min-h-[200px]">
        {viewMode === 'summary' ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <DashboardSummary watchedMovies={watchedMovies} />
            <div>
              <h2 className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-6 text-center">{selectedYear} TOP RATED</h2>
              <LibrarySection movies={bestMovies.slice(0, 4)} type="watched" />
              <div className="flex justify-center mt-4">
                <button onClick={() => setViewMode('watched')} className="text-[8px] text-gray-400 underline underline-offset-4 hover:text-black">
                  VIEW ALL BEST MOVIES
                </button>
              </div>
            </div>
            <div className="border-t border-gray-50 pt-8">
              <h2 className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-8 text-center">Rating Spectrum</h2>
              <RatingChart distribution={ratingDistribution} />
              <MonthlyHeatmap allLogs={logs} selectedYear={selectedYear} />
            </div>
          </div>
        ) : viewMode === 'watched' ? (
          <LibrarySection movies={filteredWatched} type="watched" showDate={true} />
        ) : (
          <LibrarySection
            movies={logs.flatMap(l => (l.items || []).map(item => ({...item, wishDate: l.date, logYear: l.date?.split('.')[0]})))
                       .filter(i => i.status === 'wish' && i.logYear === selectedYear && (selectedCategory === 'All' || i.category === selectedCategory))
                       .filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()))} 
            type="wish" showDate={true} 
          />
        )}
      </div>
    </div>
  );
}
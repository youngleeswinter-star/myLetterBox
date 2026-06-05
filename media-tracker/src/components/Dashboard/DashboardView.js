import React, { useState, useEffect } from 'react';
import RatingChart from './Components/RatingChart';
import GallerySection from './Components/GallerySection';
import SummarySection from './Components/SummarySection';
import WishlistSection from './Components/WishlistSection';
import MonthlyHeatmap from './Components/MonthlyHeatmap';
import { useDashboardData } from '../../core/hooks/useDashboardData';
import { useLogs } from '../../core/context/LogContext';

export default function DashboardView() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeReview, setActiveReview] = useState(null);
  const [viewMode, setViewMode] = useState('summary');
  const { logs } = useLogs();

  const { 
    ratingDistribution, 
    bestMovies, 
    watchedMovies, 
    //wishlist,
    availableYears, 
    categories 
  } = useDashboardData(selectedYear, selectedCategory);

  useEffect(() => {
    setActiveReview(bestMovies.length > 0 ? (bestMovies[0].review || null) : null);
  }, [bestMovies]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex gap-6 mb-6">
          {availableYears.map(year => (
            <button key={year} onClick={() => setSelectedYear(year)} 
              className={`text-[10px] uppercase tracking-[0.3em] pb-1 border-b-2 transition-colors ${selectedYear === year ? 'text-gray-900 border-gray-900' : 'text-gray-300 border-transparent'}`}>
              {year}</button>
          ))}
        </div>
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} 
              className={`text-[9px] uppercase tracking-[0.2em] px-3 py-1 border transition-colors ${selectedCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-transparent text-gray-400 border-gray-200'}`}>
              {cat}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 mb-8 border-b border-gray-50 pb-2">
        {['summary', 'gallery', 'wishlist'].map((mode) => (
          <button key={mode} onClick={() => setViewMode(mode)} 
            className={`text-[9px] uppercase tracking-[0.2em] transition-colors ${viewMode === mode ? 'font-bold text-gray-900' : 'text-gray-300'}`}>
            {mode}</button>
        ))}
      </div>

      <div className="min-h-[200px]">
        {viewMode === 'summary' ? (
          <>
            {bestMovies.length > 0 ? (
              <div className="mb-16">
                <SummarySection movies={bestMovies} selectedYear={selectedYear} activeReview={activeReview} onSelectReview={setActiveReview} />
              </div>
            ) : (
              <div className="py-8 text-center text-gray-300 text-[10px] tracking-[0.2em] uppercase mb-16 italic">No best records</div>
            )}
            <div className="animate-in fade-in duration-700">
              <div className="mb-16">
                <h2 className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400 mb-8">Rating Spectrum</h2>
                <RatingChart distribution={ratingDistribution} />
              </div>
              <MonthlyHeatmap allLogs={logs} selectedYear={selectedYear} />
            </div>
          </>
        ) : viewMode === 'gallery' ? (
          <GallerySection movies={watchedMovies} />
        ) : (
          <WishlistSection 
  movies={logs} // wishlist가 아니라 logs 전체를 넘김
  selectedYear={selectedYear} 
/>
        )}
      </div>
    </div>
  );
}
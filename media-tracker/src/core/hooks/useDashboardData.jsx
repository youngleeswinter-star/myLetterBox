import { useMemo } from 'react';
import { useLogs } from '../context/LogContext';

export const useDashboardData = (selectedYear, selectedCategory) => {
  const { logs } = useLogs();

  return useMemo(() => {
    const mStats = {};
    const rDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const foundYears = new Set();
    const catSet = new Set(['All']);
    
    let yearBestMovies = [];
    let yearWatchedMovies = [];

    (logs || []).forEach(log => {
      const year = log.date.split('.')[0];
      foundYears.add(year);
      
      if (year === selectedYear) {
        const [y, m] = log.date.split('.');
        const key = `${y}.${m.padStart(2, '0')}`;
        
        log.items?.forEach(item => {
          if (item.category) catSet.add(item.category);
          
          if (selectedCategory === 'All' || item.category === selectedCategory) {
            // 통계용 계산
            mStats[key] = (mStats[key] || 0) + 1;
            if (item.rating >= 1 && item.rating <= 5) rDist[item.rating] += 1;
            
            // 데이터 분류
            if (item.status !== 'wish') {
              yearWatchedMovies.push(item);
              if (item.rating === 5) yearBestMovies.push(item);
            }
          }
        });
      }
    });

    return {
      monthlyStats: Object.entries(mStats).sort((a, b) => b[0].localeCompare(a[0])),
      ratingDistribution: rDist,
      bestMovies: [...yearBestMovies].reverse(),
      watchedMovies: [...yearWatchedMovies].reverse(),
      wishlist: (logs || []).flatMap(log => log.items?.filter(i => i.status === 'wish') || []),
      availableYears: Array.from(foundYears).sort().reverse(),
      categories: Array.from(catSet)
    };
  }, [logs, selectedYear, selectedCategory]);
};
export default function DashboardSummary({ watchedMovies }) {
  const totalWatched = watchedMovies.length;
  const avgRating = totalWatched > 0 
    ? (watchedMovies.reduce((acc, cur) => acc + (cur.rating || 0), 0) / totalWatched).toFixed(1) 
    : 0;
  
  // 가장 많이 본 카테고리 추출
  const genreCounts = watchedMovies.reduce((acc, cur) => {
    acc[cur.category] = (acc[cur.category] || 0) + 1;
    return acc;
  }, {});
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-3 gap-2 mb-8 bg-white border border-gray-100 p-4 rounded-sm shadow-sm">
      <div className="text-center">
        <p className="text-[8px] text-gray-400 uppercase tracking-widest">Watched</p>
        <p className="text-[14px] font-bold mt-1">{totalWatched}</p>
      </div>
      <div className="text-center border-l border-r border-gray-50">
        <p className="text-[8px] text-gray-400 uppercase tracking-widest">Avg Rating</p>
        <p className="text-[14px] font-bold mt-1 text-amber-500">{avgRating}</p>
      </div>
      <div className="text-center">
        <p className="text-[8px] text-gray-400 uppercase tracking-widest">Top Genre</p>
        <p className="text-[14px] font-bold mt-1 truncate px-1">{topGenre ? topGenre[0] : '-'}</p>
      </div>
    </div>
  );
};
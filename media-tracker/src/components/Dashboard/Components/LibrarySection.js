export default function LibrarySection({ movies, type = 'watched', showDate = false }) {
  // 날짜 안전 변환 함수
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    // 2026.06.05 형식 -> 2026-06-05로 변경하여 파싱
    return new Date(dateStr.replace(/\./g, '-'));
  };

  const sortedMovies = [...(movies || [])].sort((a, b) => {
    if (type === 'watched') {
      return parseDate(b.date) - parseDate(a.date); // 최신순
    } else {
      return parseDate(a.wishDate) - parseDate(b.wishDate); // 과거순
    }
  });

  if (!sortedMovies.length) return <p className="text-[10px] text-gray-300 italic p-6 text-center">No records found.</p>;

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {sortedMovies.map((m, i) => (
  <div key={i} className="group relative bg-gray-100 aspect-[2/3] overflow-hidden shadow-sm">
    <img
      src={m.poster_url}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      alt={m.title}
      onError={(e) => e.target.style.display = 'none'}
    />
    
    {/* [추가] 시청 횟수 뱃지: repeatCount가 1보다 클 때만 표시 */}
    {m.repeatCount > 1 && (
      <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold">
        x{m.repeatCount}
      </div>
    )}

    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center p-4 text-center">
      {/* 1. 날짜 표시 */}
      {(m.date || m.wishDate) && (
        <div className="text-[8px] text-gray-400 uppercase tracking-[0.2em] mb-2 border-b border-gray-700 pb-1 w-full">
          {type === 'watched' ? `Viewed: ${m.date}` : `Plan: ${m.wishDate}`}
        </div>
      )}

      {/* 2. 제목 */}
      <p className="text-white text-[12px] font-bold tracking-tight truncate w-full">
        {m.title}
      </p>

      {/* 3. 리뷰와 별점 */}
      {type === 'watched' && (
        <>
          {m.review ? (
            <p className="text-gray-300 text-[10px] italic mt-3 px-1 leading-relaxed line-clamp-4">
              "{m.review}"
            </p>
          ) : (
            <p className="text-gray-500 text-[10px] mt-3">No review.</p>
          )}
          <div className="text-[9px] text-amber-400 mt-4">
            {m.rating > 0 ? '★'.repeat(m.rating) : <span className="text-gray-400">☆☆☆☆☆</span>}
          </div>
        </>
      )}
    </div>
  </div>
))}
    </div>
  );
}
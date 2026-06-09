// components/MovieSearchResult.jsx
export default function MovieSearchResult({ results, onSelect }) {
  if (!results || results.length === 0) return null;

  // 선택 시 데이터를 통일된 포맷으로 변환하는 내부 함수
  const handleSelect = (m) => {
  onSelect({
    title: m.title || '',
    poster_path: m.poster_path || '', // poster_url 대신 원본 경로(poster_path) 전달
    year: m.year || '??',
    director: m.director || '정보없음'
  });
};

  return (
    <div className="absolute top-full left-0 w-full bg-white border border-stone-100 shadow-xl z-[200] max-h-60 overflow-y-auto rounded-b-md">
      {results.map((m) => (
        <button
          key={m.id}
          className="w-full p-3 text-left border-b border-stone-50 hover:bg-stone-50 flex items-center gap-3"
          onClick={() => handleSelect(m)}
        >
          {m.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} 
              className="w-10 h-14 object-cover rounded-sm flex-shrink-0" 
              alt={m.title} 
            />
          ) : (
            <div className="w-10 h-14 bg-stone-100 rounded-sm flex items-center justify-center text-[8px] text-stone-300">N/A</div>
          )}
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-stone-800 truncate">{m.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-stone-500 font-semibold">{m.year}</span>
              {m.director && (
                <>
                  <span className="text-[10px] text-stone-300">|</span>
                  <span className="text-[10px] text-stone-400 truncate">{m.director}</span>
                </>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
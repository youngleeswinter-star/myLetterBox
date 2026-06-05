export default function GallerySection({ movies }) {
  if (!(movies || []).length) return <p className="text-[10px] text-gray-300 italic p-6">No records found.</p>;
  
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {(movies || []).map((m, i) => (
        <div key={i} className="aspect-[2/3] bg-gray-50 overflow-hidden relative group">
          <img 
            src={m.poster_url} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
            alt={m.title} 
            onError={(e) => e.target.style.display = 'none'}
          />
          
          {/* 포스터 위에 Heart/Repeat 정보 표시 */}
          <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1">
          {/* 하트 크기 확대 및 그림자 추가 */}
          {!!m.isHeart && (
            <span className="text-[14px] text-red-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              ♥
            </span>
          )}
          
          {/* 재관람 횟수 배경색을 더 진하게 하고 폰트 강화 */}
          {(m.repeatCount || 1) > 1 && (
            <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              x{m.repeatCount}
            </span>
          )}
        </div>

          <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-[9px] font-bold truncate">{m.title}</div>
            <div className="text-[8px] text-amber-400 mt-0.5">
              {m.rating ? '★'.repeat(m.rating) : <span className="text-gray-400">☆☆☆☆☆</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default function WishlistSection({ movies, selectedYear }) {
  // movies가 logs 전체라고 가정하고 필터링
  const filtered = (movies || []).flatMap(log => 
    log.date.startsWith(selectedYear.toString()) 
      ? (log.items || []).filter(item => item.status === 'wish') 
      : []
  );
  
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {filtered.map((m, i) => (
        <div key={i} className="aspect-[2/3] bg-gray-50 overflow-hidden relative group">
          <img src={m.poster_url} className="w-full h-full object-cover" alt={m.title} />
          <div className="absolute bottom-0 w-full bg-black/50 text-white text-[8px] p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {m.title}
          </div>
        </div>
      ))}
    </div>
  );
}
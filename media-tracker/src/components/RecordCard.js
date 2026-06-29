import React from 'react';
import MovieSearchResult from './Common/MovieSearchResult';

const categoryTheme = {
  Movie: 'bg-indigo-500', Drama: 'bg-rose-500', 'TV Show': 'bg-sky-500',
  Concert: 'bg-amber-500', 'Play/Musical': 'bg-violet-500', Exhibition: 'bg-emerald-500'
};

export default function RecordCard({ item, index, updateItem, removeItem, onFocus, searchMovie, results, onSelectResult }) {

  return (
    // 🔥 overflow-hidden을 제거하여 검색 결과가 밖으로 나올 수 있게 함
    <div className="bg-white p-5 border border-stone-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] rounded-lg space-y-5 transition-all focus-within:ring-2 focus-within:ring-stone-200">

      {/* 헤더 */}
      <div className="flex justify-between items-center pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-stone-500 font-bold tracking-wider">#{String(index + 1).padStart(2, '0')}</span>
          <input
            type="date"
            className="text-[10px] text-stone-700 font-medium bg-stone-100 px-2 py-1 rounded outline-none cursor-pointer hover:bg-stone-200"
            // 1. 보여줄 때는 0을 채워서 YYYY-MM-DD로 표시 (입력창용)
            value={
              item.date
                ? item.date.split('.').map(v => v.padStart(2, '0')).join('-')
                : new Date().toISOString().split('T')[0]
            }
            onChange={(e) => {
              // 2. 입력받은 날짜(YYYY-MM-DD)를 파싱하여 YYYY.M.D 형식으로 저장
              const [y, m, d] = e.target.value.split('-');
              // parseInt를 통해 앞의 0을 제거 (2026.06.28 -> 2026.6.28)
              const formattedDate = `${parseInt(y)}.${parseInt(m)}.${parseInt(d)}`;
              updateItem({ ...item, date: formattedDate });
            }}
          /></div>
        <button className="text-[9px] text-stone-400 font-medium hover:text-red-500 transition active:scale-95" onClick={removeItem}>REMOVE</button>
      </div>

      {/* 포스터 */}
      <div className="w-full aspect-[2/3] relative bg-stone-100 overflow-hidden rounded-md flex items-center justify-center">
        {item.poster_url && <img src={item.poster_url} className="w-full h-full object-cover" alt="poster" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />}
        <div className="hidden text-[10px] text-stone-400 font-medium">NO IMAGE</div>
        <input className="absolute bottom-0 left-0 w-full p-2 text-[8px] bg-white/90 backdrop-blur-sm text-stone-700 outline-none placeholder:text-stone-400 focus:bg-white" placeholder="URL" value={item.poster_url || ''} onChange={(e) => updateItem({ ...item, poster_url: e.target.value })} />
      </div>

      {/* 제목 및 검색 결과 */}
      <div className="relative z-[100]">
        <input
          className="w-full text-lg font-light text-stone-900 border-b border-stone-200 outline-none pb-1 placeholder:text-stone-300 focus:border-stone-500 transition-colors"
          placeholder="Title"
          value={item.title || ''}
          onFocus={onFocus}
          onChange={(e) => {
            updateItem({ ...item, title: e.target.value });
            searchMovie(e.target.value);
          }}
        />

        {/* 검색 결과창 - z-index를 높게 설정 */}
        {results && results.length > 0 && (
          <div className="absolute top-[100%] left-0 w-full z-[999] mt-1 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.2)] rounded-lg border border-stone-100">
            <MovieSearchResult results={results} onSelect={onSelectResult} />
          </div>
        )}
      </div>

      {/* 상태 및 시간 */}
      <div className="flex justify-between items-center text-[10px]">
        <div className="flex border border-stone-200 rounded overflow-hidden">
          <button onClick={() => updateItem({ ...item, status: 'watched' })} className={`px-3 py-1 font-medium transition ${item.status === 'watched' ? 'bg-stone-800 text-white' : 'text-stone-500 bg-stone-50 hover:bg-stone-100'}`}>봤어요</button>
          <button onClick={() => updateItem({ ...item, status: 'wish' })} className={`px-3 py-1 font-medium transition ${item.status === 'wish' ? 'bg-stone-800 text-white' : 'text-stone-500 bg-stone-50 hover:bg-stone-100'}`}>보고싶어요</button>
        </div>
        <input type="time" className="outline-none text-stone-600 bg-transparent font-medium cursor-pointer" value={item.watchedTime || '14:00'} onChange={(e) => updateItem({ ...item, watchedTime: e.target.value })} />
      </div>

      {/* 카테고리 */}
      <div className="relative group">
        <select className={`w-full p-2 text-white text-[9px] font-bold rounded appearance-none cursor-pointer transition ${categoryTheme[item.category || 'Movie'] || 'bg-stone-400'}`} value={item.category || 'Movie'} onChange={(e) => updateItem({ ...item, category: e.target.value })}>
          {Object.keys(categoryTheme).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <span className="absolute right-2 top-2 text-[8px] text-white/70 pointer-events-none">▼</span>
      </div>

      <textarea className="w-full min-h-[60px] text-[12px] text-stone-700 border-b border-stone-200 outline-none resize-none leading-relaxed focus:border-stone-500 transition" placeholder="Write a note..." value={item.review || ''} onChange={(e) => updateItem({ ...item, review: e.target.value })} />

      {/* 별점 및 하트 */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(s => <button key={s} className="transition active:scale-90" onClick={() => updateItem({ ...item, rating: s })}><svg width="14" height="14" viewBox="0 0 24 24" fill={item.rating >= s ? '#292524' : '#E7E5E4'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg></button>)}
        </div>
        <div className="flex items-center gap-4">
          <button className="transition active:scale-90" onClick={() => updateItem({ ...item, isHeart: !item.isHeart })}><svg width="16" height="16" viewBox="0 0 24 24" fill={item.isHeart ? '#F87171' : '#E7E5E4'}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></button>
          <input type="number" min="1" className="w-8 text-center text-[10px] text-stone-700 border border-stone-300 rounded focus:border-stone-500 outline-none" value={item.repeatCount ?? 1} onChange={(e) => updateItem({ ...item, repeatCount: parseInt(e.target.value, 10) || 1 })} />
        </div>
      </div>
    </div>
  );
}
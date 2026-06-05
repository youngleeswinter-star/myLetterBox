import React, { useState } from 'react';
import { useLogs } from '../core/context/LogContext';

// 카테고리별 테마 컬러 매핑
const categoryTheme = {
  Movie: 'bg-indigo-500',
  Drama: 'bg-rose-500',
  'TV Show': 'bg-sky-500',
  Concert: 'bg-amber-500',
  'Play/Musical': 'bg-violet-500',
  Exhibition: 'bg-emerald-500'
};

export default function DetailModal({ date, onClose }) {
  const { logs, saveLog } = useLogs();
  const data = (logs || []).find(l => l.date === date) || { items: [] };
  
  const [items, setItems] = useState(data.items.length ? data.items : [{ 
    title: '', poster_url: '', category: 'Movie', review: '', rating: 0, status: 'watched', isHeart: false, repeatCount: 1 
  }]);
  
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const API_KEY = '4de847a38f096b28a48cd6872369435a';

  const searchMovie = async (q) => {
    if (q.length < 2) { setResults([]); return; }
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}&language=ko-KR`);
    const data = await res.json();
    setResults(data.results || []);
  };

  const selectMovie = (movie, index) => {
    const n = [...items];
    n[index] = { 
        ...n[index], 
        title: movie.title, 
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : n[index].poster_url 
    };
    setItems(n);
    setResults([]);
    setActiveIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* 2. 모달 본체가 살짝 줌인되면서 부드럽게 등장하는 애니메이션 적용 */}
      <div className="bg-white w-full max-w-sm border border-gray-100 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-900">
            ARCHIVE <span className="text-gray-400 font-normal">{date}</span>
          </h2>
          <button className="text-[9px] text-gray-400 hover:text-black uppercase" onClick={onClose}>Close</button>
        </div>
        
        {/* 리스트 영역 */}
<div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
  {items.map((item, i) => (
    <div key={i} className="relative bg-white border border-gray-100 shadow-sm overflow-hidden">
      
      {/* 포스터 카드 상단 */}
<div className="w-full h-80 relative group overflow-hidden bg-gray-100">
  {/* 블러 배경 */}
  {item.poster_url && (
    <div 
      className="absolute inset-0 bg-cover bg-center blur-md opacity-30" 
      style={{ backgroundImage: `url(${item.poster_url})` }} 
    />
  )}

  {/* 로딩 상태를 고려한 이미지 처리 */}
  {item.poster_url ? (
    <div className="w-full h-full relative z-10">
      {/* 1. 로딩 인디케이터 (이미지가 로딩되는 동안 회색으로 깜빡임) */}
      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      
      {/* 2. 실제 이미지 */}
      <img 
        src={item.poster_url} 
        className="w-full h-full object-contain relative z-20" 
        alt=""
        // 이미지 로딩이 완료되면 투명도를 조절할 수도 있습니다 (옵션)
        onLoad={(e) => e.target.classList.add('opacity-100')}
      />
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 relative z-10">NO IMAGE</div>
  )}

        {/* URL 직접 입력창 (마우스 호버 시 표시) */}
        <input 
          className="absolute bottom-0 w-full p-2 text-[9px] bg-white/90 outline-none z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          placeholder="Paste Poster URL..."
          value={item.poster_url || ''}
          onChange={(e) => { const n = [...items]; n[i].poster_url = e.target.value; setItems(n); }}
        />

        <button className="absolute top-2 right-2 p-1.5 bg-white/50 hover:bg-red-500 hover:text-white rounded-full transition-colors z-20"
          onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>

      {/* 상세 정보 */}
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => { const n = [...items]; n[i].status = 'watched'; setItems(n); }}
            className={`text-[8px] px-2 py-0.5 uppercase ${item.status !== 'wish' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>Watched</button>
          <button onClick={() => { const n = [...items]; n[i].status = 'wish'; setItems(n); }}
            className={`text-[8px] px-2 py-0.5 uppercase ${item.status === 'wish' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Wishlist</button>
        </div>

        <input className="w-full text-[14px] font-bold border-b border-gray-100 outline-none" placeholder="Title" value={item.title} onChange={(e) => {
          const val = e.target.value; const n = [...items]; n[i].title = val; setItems(n);
          setActiveIndex(i); searchMovie(val);
        }} />

        <select className={`w-full text-[9px] text-white px-2 py-1 ${categoryTheme[item.category] || 'bg-gray-400'}`} value={item.category || 'Movie'} onChange={(e) => { const n = [...items]; n[i].category = e.target.value; setItems(n); }}>
          {Object.keys(categoryTheme).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <textarea className="w-full text-[11px] border-b border-gray-100 outline-none italic text-gray-600 resize-none h-24" placeholder="Review..." value={item.review || ''} onChange={(e) => { const n = [...items]; n[i].review = e.target.value; setItems(n); }} />
        
        {/* 상세 정보 하단부 */}
<div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
  
  {/* 왼쪽: 별점 영역 */}
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        onClick={() => { const n = [...items]; n[i].rating = (n[i].rating === s) ? 0 : s; setItems(n); }}
        className={`relative group p-1 text-[12px] ${(item.rating || 0) >= s ? 'text-amber-400' : 'text-gray-200'} transition-transform hover:scale-110`}
      >
        ★
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {s} Stars
        </span>
      </button>
    ))}
  </div>

  {/* 오른쪽: 하트 & 재관람 횟수 (입력창을 더 작고 깔끔하게) */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => { const n = [...items]; n[i].isHeart = !n[i].isHeart; setItems(n); }}
      className={`relative group p-1 text-[12px] ${item.isHeart ? 'text-red-500' : 'text-gray-300'} transition-transform hover:scale-110`}
    >
      ♥
      <span className="absolute bottom-full right-0 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        Favorite
      </span>
    </button>
    
    <div className="relative group flex items-center border border-gray-200 rounded px-1">
      <span className="text-[8px] text-gray-400 mr-1">×</span>
      <input
        type="number"
        min="1"
        max="9"
        className="w-5 text-[10px] text-center outline-none"
        value={item.repeatCount || 1}
        onChange={(e) => { const n = [...items]; n[i].repeatCount = parseInt(e.target.value) || 1; setItems(n); }}
      />
      <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        Repeat Count
      </span>
    </div>
  </div>
</div>
      </div>
      
      {/* 검색 결과 */}
      {activeIndex === i && results.length > 0 && (
        <div className="absolute top-80 left-0 w-full bg-white border border-gray-100 shadow-xl z-50 max-h-32 overflow-y-auto">
          {results.map(m => (
            <button key={m.id} className="w-full p-2 text-left text-[10px] border-b hover:bg-gray-50" onClick={() => selectMovie(m, i)}>
              {m.title} <span className="text-gray-400">({m.release_date?.slice(0,4)})</span>
            </button>
          ))}
          <button className="w-full p-2 text-[10px] text-gray-400 italic bg-gray-50" onClick={() => setActiveIndex(null)}>직접 입력 유지</button>
        </div>
      )}
    </div>
  ))}
</div>
        
        {/* 저장 */}
        <button className="w-full py-4 text-[10px] uppercase tracking-[0.2em] text-white bg-gray-900 hover:bg-black transition-colors" onClick={() => {
          saveLog(date, date, items.filter(i => i.title));
          onClose();
        }}>Save Changes</button>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useLogs } from '../core/context/LogContext';

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
    title: '', poster_url: '', category: 'Movie', review: '', rating: 0, status: 'watched', isHeart: false, repeatCount: 1, watchedTime: '' 
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
    poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : n[index].poster_url,
    isVerified: true // 검색으로 선택 시 자동 인증
  };
  setItems(n);
  setResults([]);
  setActiveIndex(null);
};

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm border border-gray-100 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-900">
            ARCHIVE <span className="text-gray-400 font-normal">{date}</span>
          </h2>
          <button className="text-[9px] text-gray-400 hover:text-black uppercase" onClick={onClose}>Close</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
          {items.map((item, i) => (
            <div key={i} className="relative bg-white border border-gray-100 shadow-sm overflow-hidden">
              {/* 포스터 카드 상단 */}
<div className="w-full h-80 relative group overflow-hidden bg-gray-100">
  
  {/* 출처 배지 (좌측 상단 아이콘 결합) */}
  <div className={`absolute top-2 left-2 z-30 text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm ${item.isVerified ? 'bg-blue-500/80 text-white' : 'bg-black/50 text-white'}`}>
    <span>{item.isVerified ? '✓' : '✎'}</span>
    {item.isVerified ? 'Verified' : 'Manual'}
  </div>

  {/* 블러 배경 및 이미지 영역 */}
  {item.poster_url && <div className="absolute inset-0 bg-cover bg-center blur-md opacity-30" style={{ backgroundImage: `url(${item.poster_url})` }} />}
  {item.poster_url ? (
    <div className="w-full h-full relative z-10">
      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      <img src={item.poster_url} className="w-full h-full object-contain relative z-20" alt="" onLoad={(e) => e.target.classList.add('opacity-100')} />
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 relative z-10">NO IMAGE</div>
  )}
                <button className="absolute top-2 right-2 p-1.5 bg-white/50 hover:bg-red-500 hover:text-white rounded-full transition-colors z-20"
                  onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>

              <div className="p-5 space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
    <input className="w-full text-[16px] font-bold border-b border-gray-100 outline-none pb-1" placeholder="Title" value={item.title} 
      onFocus={() => setActiveIndex(i)}
      onChange={(e) => { const n = [...items]; n[i].title = e.target.value; n[i].isVerified = false; setItems(n); searchMovie(e.target.value); }} 
    />
 
  </div>
                    {activeIndex === i && results.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl z-[60] max-h-40 overflow-y-auto mt-1 rounded-b-lg">
                        {results.map(m => (
                          <button key={m.id} className="w-full p-3 text-left text-[10px] border-b hover:bg-gray-50 flex justify-between" onClick={() => selectMovie(m, i)}>
                            <span>{m.title}</span><span className="text-gray-300">{m.release_date?.slice(0,4)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-1">
                      <button onClick={() => { const n = [...items]; n[i].status = 'watched'; setItems(n); }} className={`text-[8px] px-2 py-0.5 uppercase ${item.status !== 'wish' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>Watched</button>
                      <button onClick={() => { const n = [...items]; n[i].status = 'wish'; setItems(n); }} className={`text-[8px] px-2 py-0.5 uppercase ${item.status === 'wish' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Wishlist</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-gray-400 uppercase">Time</span>
                      <input type="time" 
                      step="300" className="text-[10px] text-gray-600 outline-none w-16 text-right" value={item.watchedTime || ''} onChange={(e) => { const n = [...items]; n[i].watchedTime = e.target.value; setItems(n); }} />
                    </div>
                  </div>
                </div>

                <select className={`w-full text-[9px] text-white px-2 py-1 ${categoryTheme[item.category] || 'bg-gray-400'}`} value={item.category || 'Movie'} onChange={(e) => { const n = [...items]; n[i].category = e.target.value; setItems(n); }}>
                  {Object.keys(categoryTheme).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <textarea className="w-full text-[11px] border-b border-gray-100 outline-none italic text-gray-600 resize-none h-24" placeholder="Review..." value={item.review || ''} onChange={(e) => { const n = [...items]; n[i].review = e.target.value; setItems(n); }} />
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => { const n = [...items]; n[i].rating = (n[i].rating === s) ? 0 : s; setItems(n); }} className={`text-[14px] transition-transform hover:scale-110 ${(item.rating || 0) >= s ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-6">
                    <button onClick={() => { const n = [...items]; n[i].isHeart = !n[i].isHeart; setItems(n); }} className={`text-[14px] transition-transform hover:scale-110 ${item.isHeart ? 'text-red-500' : 'text-gray-300'}`}>♥</button>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-400 uppercase">Repeat</span>
                      <input type="number" min="1" max="20" className="w-8 h-6 text-[10px] text-center border border-gray-100 rounded outline-none" value={item.repeatCount || 1} onChange={(e) => { const n = [...items]; n[i].repeatCount = parseInt(e.target.value) || 1; setItems(n); }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-3 border border-dashed border-gray-300 text-[10px] text-gray-500 uppercase hover:border-gray-900 hover:text-gray-900 transition-all" 
            onClick={() => setItems([...items, { title: '', poster_url: '', category: 'Movie', review: '', rating: 0, status: 'watched', isHeart: false, repeatCount: 1 }])}>+ Add New Card</button>
        </div>
        
        <button className="w-full py-4 text-[10px] uppercase tracking-[0.2em] text-white bg-gray-900 hover:bg-black transition-colors" onClick={() => { saveLog(date, date, items.filter(i => i.title)); onClose(); }}>Save Changes</button>
      </div>
    </div>
  );
}
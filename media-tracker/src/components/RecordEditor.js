import React, { useState, useRef, useEffect } from 'react';
import { useLogs } from '../core/context/LogContext';
import { useMovieSearch } from '../core/hooks/useMovieSearch.jsx'; 

const categoryTheme = {
  Movie: 'bg-indigo-500', Drama: 'bg-rose-500', 'TV Show': 'bg-sky-500', 
  Concert: 'bg-amber-500', 'Play/Musical': 'bg-violet-500', Exhibition: 'bg-emerald-500'
};

export default function RecordEditor({ date, onClose, editData }) {
  const { logs, saveLog } = useLogs();
  const { results, searchMovie, setResults } = useMovieSearch();
  
  const existingLog = (logs || []).find(l => l.date === date);
  const [items, setItems] = useState(editData ? [editData] : (existingLog?.items?.length ? existingLog.items : [{ 
    title: '', poster_url: '', category: 'Movie', status: 'watched', platform: '', 
    watchedTime: '14:00', review: '', rating: 0, isHeart: false, repeatCount: 1, director: '', year: '' 
  }]));
  
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentDate, setCurrentDate] = useState(date);
  const dateInputRef = useRef(null);

  const selectMovie = (movie, index) => {
    const n = [...items];
    n[index] = { 
      ...n[index], 
      title: movie.title, 
      poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : n[index].poster_url, 
      director: movie.director, 
      year: movie.year 
    };
    setItems(n); 
    setResults([]); 
    setActiveIndex(null);
    document.activeElement.blur(); 
  };

  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // [추가] 에디터가 열리면 배경 스크롤 고정
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center">
      <div className="w-full max-w-sm flex flex-col h-full bg-white shadow-2xl">
        
        {/* 헤더 */}
        <div className="flex items-center p-6 border-b border-gray-100">
          <button className="flex items-center gap-1 text-[9px] text-gray-500 uppercase hover:text-black transition-colors" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <button onClick={() => dateInputRef.current?.showPicker()} className="flex items-center gap-1 text-gray-900 font-bold hover:text-indigo-600 transition-colors border-b border-gray-300 border-dashed">
                {currentDate} <span className="text-[8px] text-gray-400">✎</span>
              </button>
              <input type="date" ref={dateInputRef} className="absolute top-0 left-0 w-0 h-0 opacity-0" onChange={(e) => setCurrentDate(e.target.value.replace(/-/g, '.'))} />
            </div>
          </div>
        </div>
        
        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 p-4 shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">RECORD {i + 1}</span>
                <button className="text-[9px] text-red-500 border border-red-500 px-2 py-0.5 rounded hover:bg-red-50" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>DELETE</button>
              </div>

              <div className="w-full aspect-[2/3] relative bg-gray-100 overflow-hidden">
                {item.poster_url && <img src={item.poster_url} loading="lazy" className="w-full h-full object-cover" alt="poster" />}
                <input className="absolute bottom-0 left-0 w-full p-2 text-[9px] bg-black/60 text-white outline-none" placeholder="Paste Poster URL" value={item.poster_url || ''} onChange={(e) => { const n = [...items]; n[i].poster_url = e.target.value; setItems(n); }} />
              </div>

              <div className="relative">
                <input className="w-full text-[16px] font-bold border-b outline-none pb-1" placeholder="Title" value={item.title} onFocus={() => setActiveIndex(i)} onChange={(e) => { const n = [...items]; n[i].title = e.target.value; setItems(n); searchMovie(e.target.value); }} />
                {(item.director || item.year) && <p className="text-[9px] text-gray-400 mt-1">{item.year} · {item.director}</p>}
                
                {activeIndex === i && results.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border shadow-xl z-50 max-h-60 overflow-y-auto">
                    {results.map(m => (
                      <button key={m.id} className="w-full p-3 text-left border-b hover:bg-gray-50 flex items-center gap-3" onClick={() => selectMovie(m, i)}>
                        {m.poster_path && <img src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} className="w-8 h-12 object-cover" alt="" />}
                        <div><p className="text-[11px] font-bold">{m.title}</p><p className="text-[9px] text-gray-400">{m.year} · {m.director}</p></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <div className="flex border border-gray-200">
                  <button onClick={() => { const n = [...items]; n[i].status = 'watched'; setItems(n); }} className={`px-3 py-1 flex items-center gap-1 ${item.status === 'watched' ? 'bg-black text-white' : 'text-gray-400'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    본 작품
                  </button>
                  <button onClick={() => { const n = [...items]; n[i].status = 'wish'; setItems(n); }} className={`px-3 py-1 ${item.status === 'wish' ? 'bg-black text-white' : 'text-gray-400'}`}>♥보고싶어요</button>
                </div>
                <input type="time" className="outline-none text-gray-500" value={item.watchedTime || '14:00'} onChange={(e) => { const n = [...items]; n[i].watchedTime = e.target.value; setItems(n); }} />
              </div>

              <div className="flex gap-2">
                <div className={`relative flex-1 ${categoryTheme[item.category || 'Movie']}`}>
                  <select className="w-full h-full bg-transparent text-white text-[9px] px-2 py-1 appearance-none outline-none font-bold cursor-pointer" value={item.category || 'Movie'} onChange={(e) => { const n = [...items]; n[i].category = e.target.value; setItems(n); }}>
                    {Object.keys(categoryTheme).map(cat => <option key={cat} value={cat} className="text-black">{cat}</option>)}
                  </select>
                  <span className="absolute right-1 top-1 text-[8px] text-white pointer-events-none">▼</span>
                </div>
                <input className="flex-1 text-[11px] border-b outline-none pb-1" placeholder="Where?" value={item.platform || ''} onChange={(e) => { const n = [...items]; n[i].platform = e.target.value; setItems(n); }} />
              </div>

              <textarea className="w-full min-h-[80px] text-[11px] border-b outline-none resize-none overflow-hidden" placeholder="Review..." value={item.review || ''} onChange={(e) => { const n = [...items]; n[i].review = e.target.value; setItems(n); }} onInput={handleInput} />

              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1">{[1,2,3,4,5].map(s => <button key={s} onClick={() => { const n = [...items]; n[i].rating = s; setItems(n); }} className={`text-[14px] ${item.rating >= s ? 'text-black' : 'text-gray-300'}`}>★</button>)}</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => { const n = [...items]; n[i].isHeart = !n[i].isHeart; setItems(n); }} className={`${item.isHeart ? 'text-red-500' : 'text-gray-300'}`}>♥</button>
                  <input type="number" className="w-8 text-center text-[10px] border" value={item.repeatCount || 1} onChange={(e) => { const n = [...items]; n[i].repeatCount = parseInt(e.target.value); setItems(n); }} />
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-4 mt-2 border border-dashed text-[10px] uppercase hover:bg-gray-50 text-gray-500 font-bold" onClick={() => setItems([...items, { title: '', poster_url: '', category: 'Movie', status: 'watched', repeatCount: 1, platform: '', watchedTime: '14:00' }])}>+ Add New Card</button>
        </div>

        <button className="w-full py-4 text-[10px] uppercase bg-black text-white hover:bg-gray-800" onClick={() => { const finalDate = currentDate.replace(/-/g, '.'); saveLog(date, finalDate, items); onClose(); }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
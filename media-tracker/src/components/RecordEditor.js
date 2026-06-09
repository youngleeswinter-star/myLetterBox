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

  const formatDate = (dateStr) => {
    const parts = dateStr.replace(/-/g, '.').split('.');
    return `${parseInt(parts[0], 10)}.${parseInt(parts[1], 10)}.${parseInt(parts[2], 10)}`;
  };

  const existingLog = (logs || []).find(l => l.date === date);
  const [items, setItems] = useState(editData ? [editData] : (existingLog?.items?.length ? existingLog.items : [{
    title: '', poster_url: '', category: 'Movie', status: 'watched', platform: '',
    watchedTime: '14:00', review: '', rating: 0, isHeart: false, repeatCount: 1, director: '', year: ''
  }]));

  const [activeIndex, setActiveIndex] = useState(null);
  const [currentDate, setCurrentDate] = useState(date);
  const dateInputRef = useRef(null);
  const containerRef = useRef(null);

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // 2. 외부 클릭 감지 로직 추가
 useEffect(() => {
  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setActiveIndex(null); 
      setResults([]);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [setResults]); 

  return (
    <div className="fixed inset-0 bg-stone-100/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
      <div className="w-full max-w-sm flex flex-col h-[90vh] bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100 shrink-0">
          <button className="text-[10px] text-stone-400 uppercase tracking-[0.2em] hover:text-black transition" onClick={onClose}>
            Close
          </button>
          
          <div className="relative">
            <button 
              onClick={() => dateInputRef.current?.showPicker()} 
              className="text-stone-800 font-medium text-sm border-b border-stone-300 border-dashed"
            >
              {currentDate.replace(/\./g, '. ')} ✎
            </button>
            <input 
              type="date" 
              ref={dateInputRef} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={(e) => setCurrentDate(e.target.value.replace(/-/g, '.'))} 
            />
          </div>
          <div className="w-10"></div>
        </div>
        
        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10 bg-stone-50/50">
          {items.map((item, i) => (
            <div key={i} className="bg-white p-5 border border-stone-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] rounded-lg space-y-5" ref={containerRef}>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-stone-300 font-light uppercase tracking-[0.2em]">0{i + 1}</span>
                <button className="text-[9px] text-stone-300 hover:text-red-400 transition" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>REMOVE</button>
              </div>

              {/* 포스터 */}
              <div className="w-full aspect-[2/3] relative bg-stone-100 overflow-hidden rounded-md">
                {item.poster_url && <img src={item.poster_url} className="w-full h-full object-cover" alt="poster" />}
                <input 
                  className="absolute bottom-0 left-0 w-full p-2 text-[8px] bg-white/80 backdrop-blur-sm text-stone-600 outline-none placeholder:text-stone-400" 
                  placeholder="URL" 
                  value={item.poster_url || ''} 
                  onChange={(e) => { const n = [...items]; n[i].poster_url = e.target.value; setItems(n); }} 
                />
              </div>

              {/* 제목 검색 영역 */}
              <div className="relative">
                <input 
                  className="w-full text-lg font-light text-stone-800 border-b border-stone-200 outline-none pb-1 placeholder:text-stone-300" 
                  placeholder="Title" 
                  value={item.title} 
                  onFocus={() => setActiveIndex(i)} 
                  onChange={(e) => { 
                    const n = [...items]; 
                    n[i].title = e.target.value; 
                    setItems(n); 
                    searchMovie(e.target.value); 
                  }} 
                />
                {activeIndex === i && results.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-stone-100 shadow-xl z-50 max-h-48 overflow-y-auto rounded-b-md">
                    {results.map(m => (
                      <button key={m.id} className="w-full p-3 text-left border-b border-stone-50 hover:bg-stone-50 flex items-center gap-3" onClick={() => selectMovie(m, i)}>
                        {m.poster_path && <img src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} className="w-8 h-12 object-cover rounded-sm" alt="" />}
                        <div>
                          <p className="text-[11px] font-medium text-stone-800">{m.title}</p>
                          <p className="text-[9px] text-stone-400">{m.year}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 상태 및 시간 */}
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex border border-stone-200 rounded">
                  <button onClick={() => { const n = [...items]; n[i].status = 'watched'; setItems(n); }} className={`px-3 py-1 ${item.status === 'watched' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}>WATCHED</button>
                  <button onClick={() => { const n = [...items]; n[i].status = 'wish'; setItems(n); }} className={`px-3 py-1 ${item.status === 'wish' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}>WISH</button>
                </div>
                <input type="time" className="outline-none text-stone-400 bg-transparent" value={item.watchedTime || '14:00'} onChange={(e) => { const n = [...items]; n[i].watchedTime = e.target.value; setItems(n); }} />
              </div>

              

              {/* [복구] 카테고리 및 플랫폼 입력 영역 */}
              <div className="flex gap-2 items-center mt-2">
                <div className={`relative flex-1 ${categoryTheme[item.category || 'Movie'] || 'bg-stone-400'} rounded overflow-hidden`}>
                  <select 
                    className="w-full h-full bg-transparent text-white text-[9px] px-2 py-1.5 appearance-none outline-none font-bold cursor-pointer" 
                    value={item.category || 'Movie'} 
                    onChange={(e) => { const n = [...items]; n[i].category = e.target.value; setItems(n); }}
                  >
                    {Object.keys(categoryTheme).map(cat => <option key={cat} value={cat} className="text-stone-800">{cat}</option>)}
                  </select>
                </div>
                <input 
                  className="flex-[2] text-[11px] text-stone-600 border-b border-stone-200 outline-none pb-1 placeholder:text-stone-300" 
                  placeholder="Where did you watch it?" 
                  value={item.platform || ''} 
                  onChange={(e) => { const n = [...items]; n[i].platform = e.target.value; setItems(n); }} 
                />
              </div>

              <textarea 
                className="w-full min-h-[60px] text-[12px] text-stone-600 border-b border-stone-100 outline-none resize-none placeholder:text-stone-300" 
                placeholder="Write a note..." 
                value={item.review || ''} 
                onChange={(e) => { const n = [...items]; n[i].review = e.target.value; setItems(n); }} 
                onInput={handleInput} 
              />

              {/* 평점 및 하트 */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => { const n = [...items]; n[i].rating = s; setItems(n); }} className={`text-[12px] ${item.rating >= s ? 'text-stone-800' : 'text-stone-200'}`}>★</button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => { const n = [...items]; n[i].isHeart = !n[i].isHeart; setItems(n); }} className={`${item.isHeart ? 'text-red-400' : 'text-stone-200'}`}>♥</button>
                  <input type="number" min="1" className="w-8 text-center text-[10px] text-stone-500 border border-stone-100 rounded" value={item.repeatCount === undefined ? '' : item.repeatCount} onChange={(e) => { const n = [...items]; n[i].repeatCount = e.target.value === '' ? '' : parseInt(e.target.value, 10); setItems(n); }} />
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-4 border border-dashed border-stone-200 text-[9px] text-stone-400 uppercase tracking-[0.2em] hover:bg-white transition" onClick={() => setItems([...items, { title: '', poster_url: '', category: 'Movie', status: 'watched', repeatCount: 1, platform: '', watchedTime: '14:00' }])}>+ ADD NEW CARD</button>
        </div>

        {/* 저장 */}
        <button className="w-full py-5 text-[10px] uppercase tracking-[0.3em] bg-stone-900 text-white hover:bg-stone-700 transition" onClick={() => { saveLog(date, formatDate(currentDate), items); onClose(); }}>
          Save
        </button>
      </div>
    </div>
  );
}
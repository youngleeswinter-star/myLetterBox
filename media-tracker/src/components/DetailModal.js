import React, { useState } from 'react';

export default function DetailModal({ date, data, onSave, onClose }) {
  const [items, setItems] = useState(data?.items || [{ title: '', poster_url: '', category: 'Movie', review: '', rating: 0 }]);
  const [targetDate, setTargetDate] = useState(() => {
    const [y, m, d] = date.split('.');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  });

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
    n[index] = { ...n[index], title: movie.title, poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}` };
    setItems(n);
    setResults([]);
    setActiveIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm p-8 border border-gray-100 shadow-sm flex flex-col max-h-[85vh]">
        <h2 className="text-[11px] tracking-[0.3em] uppercase text-gray-400 mb-8">Edit Archive</h2>
        
        <input 
          type="date" 
          className="w-full p-4 mb-6 bg-transparent border-b border-gray-200 text-sm focus:outline-none" 
          value={targetDate} 
          onChange={(e) => setTargetDate(e.target.value)} 
        />
        
        <div className="flex-1 overflow-y-auto mb-8 space-y-6">
          {items.map((item, i) => (
            <div key={i} className="relative group space-y-4 border-b border-gray-50 pb-8 mb-8">
              <div className="flex gap-4 items-start">
                {/* 포스터 및 직접 URL 입력 영역 */}
                <div className="relative w-16 h-24 bg-gray-50 border border-gray-100 shrink-0 overflow-hidden group">
                  {item.poster_url ? <img src={item.poster_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 text-center">NO IMG</div>}
                  <input type="text" placeholder="URL" className="absolute bottom-0 w-full text-[8px] p-1 bg-white/90 border-t border-gray-200 outline-none" 
                    value={item.poster_url || ''} onChange={(e) => { const n = [...items]; n[i].poster_url = e.target.value; setItems(n); }} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <input className="w-full p-1 text-[13px] border-b border-gray-100 outline-none" placeholder="TITLE" value={item.title} onChange={(e) => {
                    const val = e.target.value; const n = [...items]; n[i].title = val; setItems(n);
                    if (['Movie', 'Drama', 'TV Show'].includes(n[i].category)) { setActiveIndex(i); searchMovie(val); }
                  }} />
                  
                  <select className="w-full text-[9px] uppercase tracking-[0.2em] text-gray-400 bg-transparent outline-none cursor-pointer border-b border-gray-50 pb-1" value={item.category || 'Movie'} onChange={(e) => { const n = [...items]; n[i].category = e.target.value; setItems(n); }}>
                    <option value="Movie">Movie</option><option value="Drama">Drama</option><option value="TV Show">TV Show</option>
                    <option value="Concert">Concert</option><option value="Play/Musical">Play/Musical</option><option value="Exhibition">Exhibition</option>
                  </select>

                  <textarea ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                    className="w-full p-1 text-[11px] border-b border-gray-100 outline-none italic text-gray-600 resize-none overflow-hidden" 
                    placeholder="Review..." value={item.review || ''} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = (e.target.scrollHeight) + 'px'; }}
                    onChange={(e) => { const n = [...items]; n[i].review = e.target.value; setItems(n); }} />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-300 uppercase">Rating</span>
                    <div className="flex gap-1">{[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => { const n = [...items]; n[i].rating = (n[i].rating === s) ? 0 : s; setItems(n); }}
                        className={`text-sm ${ (item.rating || 0) >= s ? 'text-amber-400 opacity-70' : 'text-gray-200'}`}>★</button>
                    ))}</div>
                  </div>
                </div>
              </div>
              
              {activeIndex === i && results.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-lg z-50 max-h-40 overflow-y-auto mt-2">
                  {results.map(m => (
                    <button key={m.id} className="w-full p-3 text-left text-[11px] border-b border-gray-50 hover:bg-gray-50 flex gap-3 items-center" onClick={() => selectMovie(m, i)}>
                      {m.poster_path && <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} className="w-6 h-9 object-cover" alt="" />}
                      <span>{m.title}</span>
                    </button>
                  ))}
                </div>
              )}
              <button className="mt-2 text-[9px] text-gray-300 hover:text-red-400 uppercase tracking-widest" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>Delete</button>
            </div>
          ))}
          <button className="w-full py-4 border border-dashed border-gray-200 text-[10px] text-gray-400 uppercase tracking-[0.2em] hover:border-gray-400 transition-all" 
            onClick={() => setItems([...items, { title: '', poster_url: '', category: 'Movie' }])}>+ Add Record</button>
        </div>
        
        <div className="flex gap-4">
          <button className="flex-1 py-3 text-[10px] uppercase tracking-[0.2em] text-gray-400 border border-gray-100" onClick={onClose}>Close</button>
          <button className="flex-1 py-3 text-[10px] uppercase tracking-[0.2em] text-white bg-gray-900" onClick={() => {
            const [y, m, d] = targetDate.split('-');
            const finalItems = items.filter(i => i.title).map(i => ({
              ...i,
              review: i.review || '',
              rating: i.rating || 0,
              category: i.category || 'Movie'
            }));
            onSave(date, `${y}.${parseInt(m)}.${parseInt(d)}`, finalItems);
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}
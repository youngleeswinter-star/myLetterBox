import React, { useState, useEffect, useRef } from 'react';
import { useBuckets } from '../core/context/BucketContext';
import { useMovieSearch } from '../core/hooks/useMovieSearch.jsx';

const categoryTheme = {
  Movie: 'bg-indigo-500', Drama: 'bg-rose-500', 'TV Show': 'bg-sky-500', 
  Concert: 'bg-amber-500', 'Play/Musical': 'bg-violet-500', Exhibition: 'bg-emerald-500'
};

export default function BucketEditor({ onClose, editData }) {
  const { results, searchMovie, setResults } = useMovieSearch();
  const { addToBucket, updateBucket } = useBuckets();
  
  const [movie, setMovie] = useState(editData || { 
    title: '', poster_url: '', category: 'Movie', note: '', platform: '', director: '', year: '' 
  });
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);

  // 외부 클릭 시 검색창 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!movie.title) return alert("제목을 입력해주세요!");
    if (editData) await updateBucket(editData.id, movie);
    else await addToBucket({ date: new Date().toISOString().split('T')[0], items: [{ ...movie }] });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-100/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
      <div className="w-full max-w-sm flex flex-col h-[90vh] bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100 shrink-0">
          <button className="text-[10px] text-stone-400 uppercase tracking-[0.2em] hover:text-black transition" onClick={onClose}>Close</button>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-800">
            {editData ? 'EDIT BUCKET' : 'ADD BUCKET'}
          </div>
          <div className="w-10"></div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/50">
          {/* 포스터 */}
          <div className="w-full aspect-[2/3] relative bg-stone-100 overflow-hidden rounded-md">
            {movie.poster_url && <img src={movie.poster_url} className="w-full h-full object-cover" alt="poster" />}
            <input 
              className="absolute bottom-0 left-0 w-full p-2 text-[8px] bg-white/80 backdrop-blur-sm text-stone-600 outline-none placeholder:text-stone-300" 
              placeholder="Paste Poster URL" 
              value={movie.poster_url || ''} 
              onChange={(e) => setMovie({...movie, poster_url: e.target.value})} 
            />
          </div>

          {/* 제목 검색 */}
          <div className="relative" ref={containerRef}>
            <input 
              className="w-full text-lg font-light text-stone-800 border-b border-stone-200 outline-none pb-1 placeholder:text-stone-300" 
              placeholder="Title" 
              value={movie.title} 
              onChange={(e) => { 
                setMovie({...movie, title: e.target.value}); 
                searchMovie(e.target.value);
                setShowResults(true);
              }} 
            />
            {showResults && results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-stone-100 shadow-xl z-50 max-h-48 overflow-y-auto rounded-b-md">
                {results.map(m => (
                  <button key={m.id} className="w-full p-3 text-left border-b border-stone-50 hover:bg-stone-50 flex items-center gap-3" onClick={() => { 
                    setMovie({ ...movie, title: m.title, poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '', year: m.year, director: m.director }); 
                    setShowResults(false);
                    setResults([]);
                  }}>
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

          {/* 카테고리 & 플랫폼 */}
          <div className="flex gap-2 items-center">
            <select 
              className={`flex-1 text-[9px] text-white px-2 py-1.5 rounded outline-none font-bold cursor-pointer ${categoryTheme[movie.category]}`} 
              value={movie.category} 
              onChange={(e) => setMovie({...movie, category: e.target.value})}
            >
              {Object.keys(categoryTheme).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input 
              className="flex-[2] text-[11px] text-stone-600 border-b border-stone-200 outline-none pb-1 placeholder:text-stone-300" 
              placeholder="Platform" 
              value={movie.platform} 
              onChange={(e) => setMovie({...movie, platform: e.target.value})} 
            />
          </div>

          <textarea 
            className="w-full min-h-[80px] text-[12px] text-stone-600 border-b border-stone-100 outline-none resize-none placeholder:text-stone-300" 
            placeholder="Note..." 
            value={movie.note} 
            onChange={(e) => setMovie({...movie, note: e.target.value})} 
          />
        </div>

        {/* 저장 */}
        <button onClick={handleSave} className="w-full py-5 text-[10px] uppercase tracking-[0.3em] bg-stone-900 text-white hover:bg-stone-700 transition">SAVE</button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useBuckets } from '../core/context/BucketContext';
import { useMovieSearch } from '../core/hooks/useMovieSearch.jsx'; // 훅 활용

const categoryTheme = {
  Movie: 'bg-indigo-500', Drama: 'bg-rose-500', 'TV Show': 'bg-sky-500', 
  Concert: 'bg-amber-500', 'Play/Musical': 'bg-violet-500', Exhibition: 'bg-emerald-500'
};

export default function BucketEditor({ onClose, editData }) {
  // 1. 커스텀 훅에서 검색 로직과 결과 가져오기
  const { results, searchMovie, setResults } = useMovieSearch();
  const { addToBucket, updateBucket } = useBuckets();
  
  const [movie, setMovie] = useState(editData || { 
    title: '', poster_url: '', category: 'Movie', note: '', platform: '', director: '', year: '' 
  });
  const [showResults, setShowResults] = useState(false);

  const handleSave = async () => {
    if (!movie.title) return alert("제목을 입력해주세요!");
    if (editData) await updateBucket(editData.id, movie);
    else await addToBucket({ date: new Date().toISOString().split('T')[0], items: [{ ...movie }] });
    onClose();
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
        
        {/* 헤더: RecordEditor와 통일 */}
        <div className="flex items-center p-6 border-b border-gray-100">
          <button className="flex items-center gap-1 text-[9px] text-gray-500 uppercase hover:text-black transition-colors" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <div className="flex-1 flex justify-center text-[10px] font-bold tracking-[0.2em] uppercase">
            {editData ? 'EDIT BUCKET' : 'ADD TO BUCKET'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 포스터 영역: 이미지 표시와 URL 입력창 분리 */}
<div className="w-full aspect-[2/3] relative bg-gray-100 overflow-hidden">
  {movie.poster_url && (
    <img src={movie.poster_url} className="w-full h-full object-cover" alt="poster" />
  )}
  {/* [추가] 포스터 URL 직접 입력창 */}
  <input 
    className="absolute bottom-0 left-0 w-full p-2 text-[9px] bg-black/60 text-white outline-none" 
    placeholder="Paste Poster URL" 
    value={movie.poster_url || ''} 
    onChange={(e) => setMovie({...movie, poster_url: e.target.value})} 
  />
</div>
          
          <div className="relative">
            <input 
              className="w-full text-[16px] font-bold border-b outline-none pb-1" 
              placeholder="Title" 
              value={movie.title} 
              onChange={(e) => { 
                setMovie({...movie, title: e.target.value}); 
                searchMovie(e.target.value); // 훅의 검색 기능 실행
                setShowResults(true);
              }} 
            />
            {showResults && results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border shadow-xl z-50 max-h-48 overflow-y-auto">
                {results.map(m => (
                  <button key={m.id} className="w-full p-3 text-left border-b hover:bg-gray-50 flex items-center gap-3" onClick={() => { 
                    setMovie({
                      ...movie, 
                      title: m.title, 
                      poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
                      year: m.year,
                      director: m.director
                    }); 
                    setShowResults(false); 
                    setResults([]);
                  }}>
                    {m.poster_path && <img src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} className="w-8 h-12 object-cover" alt="" />}
                    <div>
                      <p className="text-[11px] font-bold">{m.title}</p>
                      <p className="text-[9px] text-gray-400">{m.year} · {m.director}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <select 
            className={`w-full text-[9px] text-white px-2 py-1 font-bold ${categoryTheme[movie.category]}`} 
            value={movie.category} 
            onChange={(e) => setMovie({...movie, category: e.target.value})}
          >
            {Object.keys(categoryTheme).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
          <input className="w-full text-[11px] border-b pb-1" placeholder="Platform" value={movie.platform} onChange={(e) => setMovie({...movie, platform: e.target.value})} />
          <textarea className="w-full h-20 text-[11px] border-b outline-none resize-none" placeholder="Note..." value={movie.note} onChange={(e) => setMovie({...movie, note: e.target.value})} />
        </div>

        <button onClick={handleSave} className="w-full py-4 text-[10px] uppercase text-white bg-black hover:bg-gray-800">SAVE</button>
      </div>
    </div>
  );
}
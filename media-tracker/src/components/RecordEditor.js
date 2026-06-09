import React, { useState, useRef, useEffect } from 'react';
import { useLogs } from '../core/context/LogContext';
import { useMovieSearch } from '../core/hooks/useMovieSearch.jsx';
import MovieSearchResult from './Common/MovieSearchResult';

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

  // 0을 제거하고 YYYY.M.D 형식으로 만드는 함수
  const normalizeDate = (dateStr) => {
    const parts = dateStr.replace(/-/g, '.').split('.');
    return `${parseInt(parts[0], 10)}.${parseInt(parts[1], 10)}.${parseInt(parts[2], 10)}`;
  };

  const [activeIndex, setActiveIndex] = useState(null);
  const [currentDate, setCurrentDate] = useState(normalizeDate(date));
  const dateInputRef = useRef(null);
  const containerRef = useRef(null);

  const selectMovie = (movie, index) => {
    const n = [...items];
    n[index] = {
      ...n[index],
      title: movie.title || '',
      poster_url: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : (n[index].poster_url || ''),
      director: movie.director || '정보없음',
      year: movie.year || '??'
    };
    setItems(n);
    setResults([]); // 결과 초기화
    setActiveIndex(null);
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
              // e.target.value는 항상 YYYY-MM-DD 형태이므로 여기서 바로 처리합니다.
              onChange={(e) => setCurrentDate(normalizeDate(e.target.value))}
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

              {/* 제목 검색 영역 - 수정 */}
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

                {/* 교체된 부분: 공통 컴포넌트 사용 */}
                {activeIndex === i && (
                  <MovieSearchResult 
                    results={results} 
   onSelect={(selectedMovie) => {
    // 이제 여기서 selectMovie(selectedMovie, i)를 호출하면 
    // 기존 로직이 poster_path를 인식하여 URL을 생성합니다.
    selectMovie(selectedMovie, i);
      
      // 2. 검색창 닫기 (이 함수들은 RecordEditor에 이미 정의되어 있습니다)
      setActiveIndex(null);
      setResults([]);
    }}
                  />
                )}
              </div>

              {/* 상태 및 시간 */}
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex border border-stone-200 rounded">
                  <button
                    onClick={() => { const n = [...items]; n[i].status = 'watched'; setItems(n); }}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] ${item.status === 'watched' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    봤어요
                  </button>

                  <button
                    onClick={() => { const n = [...items]; n[i].status = 'wish'; setItems(n); }}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] ${item.status === 'wish' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                    </svg>
                    보고싶어요
                  </button>
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
                  {/* 별점 */}
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => { const n = [...items]; n[i].rating = s; setItems(n); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={item.rating >= s ? '#292524' : '#E7E5E4'} stroke="none">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  {/* 하트 */}
                  <button onClick={() => { const n = [...items]; n[i].isHeart = !n[i].isHeart; setItems(n); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={item.isHeart ? '#F87171' : '#E7E5E4'} stroke="none">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  {/* 반복 횟수 입력란 - 수정 */}
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
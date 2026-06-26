import React, { useState, useRef, useEffect } from 'react';
import { useLogs } from '../core/context/LogContext';
import { useMovieSearch } from '../core/hooks/useMovieSearch.jsx';
import MovieSearchResult from './Common/MovieSearchResult';

const categoryTheme = {
  Movie: 'bg-indigo-500', Drama: 'bg-rose-500', 'TV Show': 'bg-sky-500',
  Concert: 'bg-amber-500', 'Play/Musical': 'bg-violet-500', Exhibition: 'bg-emerald-500'
};

const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.replace(/-/g, '.').split('.');
  if (parts.length !== 3) return dateStr;
  return `${parseInt(parts[0], 10)}.${parseInt(parts[1], 10)}.${parseInt(parts[2], 10)}`;
};

const toInputDateValue = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length !== 3) return '';
  const y = parts[0];
  const m = parts[1].padStart(2, '0');
  const d = parts[2].padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function RecordEditor({ date, onClose, editData }) {
  const { logs, saveLog } = useLogs();
  const { results, searchMovie, setResults } = useMovieSearch();

  const existingLog = (logs || []).find(l => l.date === date);
  
  const [items, setItems] = useState(() => {
    if (editData) {
      return [{ ...editData, date: editData.date || normalizeDate(date) }];
    }
    if (existingLog?.items?.length) {
      return [...existingLog.items].sort((a, b) => {
        const timeA = a.watchedTime || '24:00'; 
        const timeB = b.watchedTime || '24:00';
        return timeA.localeCompare(timeB); 
      });
    }
    return [{
      title: '', poster_url: '', category: 'Movie', status: 'watched', platform: '',
      watchedTime: '14:00', review: '', rating: 0, isHeart: false, repeatCount: 1,
      director: '', year: '', date: normalizeDate(date)
    }];
  });

  const [activeIndex, setActiveIndex] = useState(null);
  const [currentDate] = useState(normalizeDate(date));
  
  // 🔥 추가된 상태값과 참조(Ref)들
  const [isSaving, setIsSaving] = useState(false); // 1. 저장 중 상태
  const [isDirty, setIsDirty] = useState(false); // 2. 내용 변경 여부 (닫기 경고용)
  const containerRef = useRef(null);
  const endOfListRef = useRef(null); // 3. 스크롤 위치용 Ref
  const searchTimerRef = useRef(null); // 4. 검색 디바운스(타이머)용 Ref

  // 데이터가 변경될 때마다 isDirty를 true로 바꾸는 헬퍼 함수
  const updateItems = (newItems) => {
    setItems(newItems);
    setIsDirty(true);
  };

  // 영화 선택 로직
  const selectMovie = (movie, index) => {
    const n = [...items];
    n[index] = {
      ...n[index],
      title: movie.title || '',
      poster_url: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : (n[index].poster_url || ''),
      director: movie.director || '정보없음',
      year: movie.year ? String(movie.year) : '??'
    };
    updateItems(n);
    setResults([]);
    setActiveIndex(null);
  };

  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // 🔥 닫기 버튼 오클릭 방지 로직
  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm("저장하지 않은 내용이 있습니다. 정말 닫으시겠습니까?");
      if (!confirmClose) return;
    }
    onClose();
  };

  // 🔥 카드 추가 및 자동 스크롤 로직
  const handleAddCard = () => {
    updateItems([...items, { title: '', poster_url: '', category: 'Movie', status: 'watched', repeatCount: 1, platform: '', watchedTime: '14:00', date: currentDate }]);
    
    // DOM이 업데이트될 시간을 아주 잠깐 준 뒤 스크롤을 내립니다.
    setTimeout(() => {
      endOfListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

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
          <button className="text-[10px] text-stone-500 uppercase tracking-[0.2em] hover:text-black font-medium transition" onClick={handleClose}>Close</button>
          <div className="text-stone-900 font-semibold text-sm border-b border-stone-400 border-dashed cursor-default">
            {currentDate.replace(/\./g, '. ')}
          </div>
          <div className="w-10"></div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10 bg-stone-50/50">
          {items.map((item, i) => (
            <div key={item.id || i} className="bg-white p-5 border border-stone-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] rounded-lg space-y-5" ref={containerRef}>
              
              {/* 상단 번호, 날짜 및 제거 버튼 */}
              <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] text-stone-500 font-bold tracking-wider">
                    #{String(i + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="date"
                    className="text-[10px] text-stone-700 font-medium bg-stone-100 px-2 py-1 rounded outline-none cursor-pointer hover:bg-stone-200 transition"
                    value={toInputDateValue(item.date)}
                    onChange={(e) => { 
                      const n = [...items]; 
                      n[i].date = normalizeDate(e.target.value); 
                      updateItems(n); 
                    }}
                  />
                </div>
                <button className="text-[9px] text-stone-400 font-medium hover:text-red-500 tracking-wider transition" onClick={() => updateItems(items.filter((_, idx) => idx !== i))}>REMOVE</button>
              </div>

              {/* 포스터 */}
              <div className="w-full aspect-[2/3] relative bg-stone-100 overflow-hidden rounded-md">
                {item.poster_url && <img src={item.poster_url} className="w-full h-full object-cover" alt="poster" />}
                <input className="absolute bottom-0 left-0 w-full p-2 text-[8px] bg-white/90 backdrop-blur-sm text-stone-700 outline-none placeholder:text-stone-400" placeholder="URL" value={item.poster_url || ''} onChange={(e) => { const n = [...items]; n[i].poster_url = e.target.value; updateItems(n); }} />
              </div>

              {/* 제목 검색 (디바운스 적용) */}
              <div className="relative">
                <input className="w-full text-lg font-light text-stone-900 border-b border-stone-200 outline-none pb-1 placeholder:text-stone-300" placeholder="Title" value={item.title || ''} onFocus={() => setActiveIndex(i)} 
                  onChange={(e) => { 
                    const n = [...items]; 
                    n[i].title = e.target.value; 
                    updateItems(n); 
                    
                    // 🔥 검색 API 최적화 (0.4초 동안 입력이 없으면 그때 검색)
                    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                    searchTimerRef.current = setTimeout(() => {
                      if (e.target.value.trim()) searchMovie(e.target.value);
                    }, 400);
                  }} 
                />
                {activeIndex === i && <MovieSearchResult results={results} onSelect={(selectedMovie) => { selectMovie(selectedMovie, i); }} />}
              </div>

              {/* 상태 및 시간 */}
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex border border-stone-200 rounded">
                  <button onClick={() => { const n = [...items]; n[i].status = 'watched'; updateItems(n); }} className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium ${item.status === 'watched' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> 봤어요
                  </button>
                  <button onClick={() => { const n = [...items]; n[i].status = 'wish'; updateItems(n); }} className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium ${item.status === 'wish' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg> 보고싶어요
                  </button>
                </div>
                <input type="time" className="outline-none text-stone-600 font-medium bg-transparent" value={item.watchedTime || '14:00'} onChange={(e) => { const n = [...items]; n[i].watchedTime = e.target.value; updateItems(n); }} />
              </div>

              {/* 카테고리 및 플랫폼 */}
              <div className="flex gap-2 items-center mt-2">
                <div className={`relative flex-1 ${categoryTheme[item.category || 'Movie'] || 'bg-stone-400'} rounded overflow-hidden`}>
                  <select className="w-full h-full bg-transparent text-white text-[9px] px-2 py-1.5 appearance-none outline-none font-bold cursor-pointer" value={item.category || 'Movie'} onChange={(e) => { const n = [...items]; n[i].category = e.target.value; updateItems(n); }}>
                    {Object.keys(categoryTheme).map(cat => <option key={cat} value={cat} className="text-stone-800">{cat}</option>)}
                  </select>
                </div>
                <input className="flex-[2] text-[11px] text-stone-700 font-medium border-b border-stone-200 outline-none pb-1 placeholder:text-stone-400" placeholder="Where did you watch it?" value={item.platform || ''} onChange={(e) => { const n = [...items]; n[i].platform = e.target.value; updateItems(n); }} />
              </div>

              <textarea className="w-full min-h-[60px] text-[12px] text-stone-700 border-b border-stone-200 outline-none resize-none placeholder:text-stone-400 leading-relaxed" placeholder="Write a note..." value={item.review || ''} onChange={(e) => { const n = [...items]; n[i].review = e.target.value; updateItems(n); }} onInput={handleInput} />

              {/* 평점, 하트, 반복 횟수 */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => { const n = [...items]; n[i].rating = s; updateItems(n); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={item.rating >= s ? '#292524' : '#E7E5E4'} stroke="none"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => { const n = [...items]; n[i].isHeart = !n[i].isHeart; updateItems(n); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={item.isHeart ? '#F87171' : '#E7E5E4'} stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </button>
                  <input type="number" min="1" className="w-8 text-center text-[10px] text-stone-700 font-medium border border-stone-300 rounded bg-stone-50" value={item.repeatCount ?? 1} onChange={(e) => { const n = [...items]; n[i].repeatCount = parseInt(e.target.value, 10) || 1; updateItems(n); }} />
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-4 border border-dashed border-stone-300 text-[9px] text-stone-600 font-semibold uppercase tracking-[0.2em] hover:bg-white hover:border-stone-500 transition" onClick={handleAddCard}>+ ADD NEW CARD</button>
          
          {/* 자동 스크롤을 위한 투명한 앵커 요소 */}
          <div ref={endOfListRef} className="h-1" />
        </div>

        {/* 🔥 로딩 상태가 추가된 Save 버튼 */}
        <button
          disabled={isSaving}
          className={`w-full py-5 text-[10px] uppercase tracking-[0.3em] text-white transition ${
            isSaving ? 'bg-stone-400 cursor-not-allowed' : 'bg-stone-900 hover:bg-stone-700'
          }`}
          onClick={async () => {
            if (items.length > 0) {
              const isValid = items.every(item => item.title && item.date);
              if (!isValid) {
                alert("제목과 날짜는 필수 입력 항목입니다.");
                return;
              }
            }

            setIsSaving(true); // 버튼 비활성화 & 텍스트 변경
            const success = await saveLog(items, currentDate);
            setIsSaving(false); // 처리 완료 후 버튼 원상복구

            if (success !== false) {
              // 저장 성공 시 경고창 띄우지 않고 닫기 위해 isDirty를 강제로 false로 변경 후 닫음
              setIsDirty(false); 
              setTimeout(() => {
                onClose();
              }, 0);
            }
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>

      </div>
    </div>
  );
}
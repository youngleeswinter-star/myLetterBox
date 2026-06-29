import React, { useState, useRef, useCallback } from 'react';
import { useLogs } from '../core/context/LogContext';
import { useMovieSearch } from '../core/hooks/useMovieSearch.jsx';
import RecordCard from './RecordCard';

export default function RecordEditor({ date, onClose, editData }) {
  const { logs, saveLog } = useLogs();
  const { searchMovie, results, setResults } = useMovieSearch();
  const existingLog = (logs || []).find(l => l.date === date);

  const [items, setItems] = useState(() => {
    if (editData) return [{ ...editData, date: editData.date || date.replace(/-/g, '.') }];
    if (existingLog?.items?.length) return [...existingLog.items].sort((a, b) => (a.watchedTime || '24:00').localeCompare(b.watchedTime || '24:00'));
    return [{ title: '', poster_url: '', category: 'Movie', status: 'watched', repeatCount: 1, platform: '', watchedTime: '14:00', date: date.replace(/-/g, '.'), rating: 0, isHeart: false, review: '', director: '', year: '' }];
  });

  const [activeIndex, setActiveIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const endOfListRef = useRef(null);
  const searchTimerRef = useRef(null); // 렉 방지 타이머

  const updateItems = (newItems) => { setItems(newItems); setIsDirty(true); };
  const updateItemAtIndex = (newItem, index) => { const n = [...items]; n[index] = newItem; updateItems(n); };

  const handleClose = () => { if (isDirty && !window.confirm("닫으시겠습니까?")) return; onClose(); };

  const handleAddCard = () => {
    updateItems([...items, { title: '', poster_url: '', category: 'Movie', status: 'watched', repeatCount: 1, platform: '', watchedTime: '14:00', date: date.replace(/-/g, '.'), rating: 0, isHeart: false, review: '', director: '', year: '' }]);
    setTimeout(() => endOfListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // 검색 최적화: 디바운스 적용으로 타이핑 시 멈춤 현상 방지
  const debouncedSearch = useCallback((val, index) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setActiveIndex(index);
      searchMovie(val);
    }, 400); // 0.4초 대기 후 검색 실행
  }, [searchMovie]);

  return (
    <div className="fixed inset-0 bg-stone-100/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
      <div className="w-full max-w-sm flex flex-col h-[90vh] bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <button className="text-[10px] uppercase tracking-[0.2em] font-medium hover:text-red-500 transition" onClick={handleClose}>Close</button>
          <div className="text-sm font-semibold border-b border-dashed">{date.replace(/-/g, '.')}</div>
          <div className="w-12"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map((item, i) => (
            <RecordCard
              key={item.id || i}
              item={item}
              index={i}
              updateItem={(n) => updateItemAtIndex(n, i)}
              removeItem={() => updateItems(items.filter((_, idx) => idx !== i))}
              onFocus={() => setActiveIndex(i)}
              searchMovie={(v) => debouncedSearch(v, i)} // 개선된 검색 함수 전달
              results={activeIndex === i ? results : []}
              onSelectResult={(m) => {
                const n = [...items];
                n[i] = { ...n[i], title: m.title, poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : n[i].poster_url };
                updateItems(n);
                setActiveIndex(null);
                setResults([]);
                if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              }}
            />
          ))}
          <button className="w-full py-4 border border-dashed border-stone-300 text-[9px] uppercase tracking-[0.2em] hover:bg-white transition" onClick={handleAddCard}>+ ADD NEW CARD</button>
          <div ref={endOfListRef} className="h-1" />
        </div>

        <button
          disabled={isSaving}
          className="w-full py-5 text-[10px] uppercase tracking-[0.3em] bg-stone-900 text-white disabled:bg-stone-400"
          onClick={async () => {
            // 1. 유효성 검사: 모든 항목에 타이틀이 있는지 확인
            const isTitleEmpty = items.some(item => !item.title || item.title.trim() === '');
            if (isTitleEmpty) {
              alert("타이틀을 입력해주세요!");
              return;
            }

            setIsSaving(true);
            // 2. 날짜 형식을 강제로 한 번 더 정리하여 저장
            const formattedItems = items.map(it => ({
              ...it,
              date: it.date.split('.').map(v => parseInt(v)).join('.')
            }));

            if (await saveLog(formattedItems, date.split('.').map(v => parseInt(v)).join('.'))) {
              setIsDirty(false);
              onClose();
            }
            setIsSaving(false);
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
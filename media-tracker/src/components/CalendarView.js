import React, { useMemo, useRef } from 'react';
import { useLogs } from '../core/context/LogContext';
import { useSwipeable } from 'react-swipeable';

export default function CalendarView({ currentDate, setCurrentDate, onDateClick }) {
  const { logs } = useLogs();
  // 이제 아래 변수들은 props로 받은 currentDate를 참조합니다.
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthInputRef = useRef(null); // 추가

  // 기존 로직 그대로 유지
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  // 스와이프 핸들러 설정
  const handlers = useSwipeable({
    onSwipedLeft: nextMonth,
    onSwipedRight: prevMonth,
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const isToday = (day) => {
    const today = new Date();
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  // logs가 변경될 때만 stats를 다시 계산
  const stats = useMemo(() => {
    return (logs || []).reduce((acc, l) => {
      const [y, m] = l.date.split('.');
      if (parseInt(y) === year && parseInt(m) === month + 1) {
        l.items.forEach(item => {
          if (item.status === 'watched') acc.watched += 1;
          else if (item.status === 'wish') acc.wish += 1;
        });
      }
      return acc;
    }, { watched: 0, wish: 0 });
  }, [logs, year, month]); // logs가 바뀔 때만 실행됨

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, () => null);

  return (
    <div {...handlers} className="w-full h-full flex flex-col bg-white">
      {/* 헤더 및 통계 영역 */}
      <div className="flex justify-between items-center px-6 py-2">
        <button onClick={prevMonth} className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition p-2">Prev</button>
        <div className="cursor-pointer group flex items-baseline gap-1.5" onClick={() => monthInputRef.current?.showPicker()}>
          <div className="text-[18px] font-bold text-stone-900 tracking-tight">
            {year}.{String(month + 1).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-stone-300 group-hover:text-stone-900 transition">▾</span>
          <input type="month" ref={monthInputRef} className="absolute opacity-0 w-0 h-0" value={`${year}-${String(month + 1).padStart(2, '0')}`}
            onChange={(e) => { const [y, m] = e.target.value.split('-'); setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1)); }}
          />
        </div>
        <button onClick={nextMonth} className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition p-2">Next</button>
      </div>

      <div className="flex justify-center gap-6 text-[8px] uppercase tracking-[0.2em] text-stone-400 pb-4">
        <span>{stats.watched} WATCHED</span>
        <span>{stats.wish} WISH</span>
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-[1px] bg-stone-100 flex-1">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => {
          const isWeekend = idx === 0 || idx === 6;
          const weekendColor = idx === 0 ? 'text-orange-400' : 'text-indigo-400';
          return (
            <div key={day} className={`bg-white py-2 text-[9px] font-bold text-center uppercase tracking-widest ${isWeekend ? weekendColor : 'text-stone-400'}`}>
              {day.slice(0, 1)}
            </div>
          );
        })}


        {[...blanks, ...days].map((day, i) => {
          if (!day) return <div key={`blank-${i}`} className="bg-white" />;

          const dateStr = `${year}.${month + 1}.${day}`;
          const log = (logs || []).find(l => l.date === dateStr);
          const sortedItems = log?.items ? [...log.items].sort((a, b) => {
            if (a.watchedTime && b.watchedTime) return a.watchedTime.localeCompare(b.watchedTime);
            return a.watchedTime ? -1 : 1;
          }) : [];

          const hasPoster = sortedItems.length > 0;

          return (
            <div key={dateStr} className="bg-white relative cursor-pointer group h-24" onClick={() => onDateClick(dateStr)}>
              <div className="w-full h-full relative overflow-hidden rounded-sm">

                {/* 1. 이미지 레이어: 포스터 개수만큼 균등하게 공간 분할 */}
                {hasPoster && (
                  <div className="w-full h-full flex flex-col">
                    {sortedItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex-1 w-full overflow-hidden relative">
                        <img src={item.poster_url} className="absolute inset-0 w-full h-full object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. 날짜 숫자 레이어: 오늘이거나 포스터가 없을 때만 표시 */}
                {(!hasPoster || isToday(day)) && (
                  <div className={`absolute top-1 left-1 z-30 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${isToday(day)
                    ? 'bg-stone-900 text-white'
                    : (i % 7 === 0 ? 'text-orange-500' : i % 7 === 6 ? 'text-indigo-500' : 'text-stone-900')
                    }`} style={hasPoster ? { textShadow: '0 0 4px rgba(0,0,0,0.8)' } : {}}>
                    {day}
                  </div>
                )}

                {/* 3. 뱃지 레이어 (SVG 눈 모양 & 하트 적용) */}
                {hasPoster && (
                  <div className="absolute bottom-1 right-1 z-20 flex flex-col gap-0.5 items-end">
                    {/* Watched: 눈 모양 SVG */}
                    {log.items.filter(i => i.status === 'watched').length > 0 && (
                      <div className="flex items-center gap-[2px] bg-black/70 backdrop-blur-sm text-white px-1 rounded text-[7px] font-bold">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        {log.items.filter(i => i.status === 'watched').length}
                      </div>
                    )}

                    {/* Wish: 하트 SVG */}
                    {log.items.filter(i => i.status === 'wish').length > 0 && (
                      <div className="flex items-center gap-[2px] bg-red-500/80 backdrop-blur-sm text-white px-1 rounded text-[7px] font-bold">
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                        </svg>
                        {log.items.filter(i => i.status === 'wish').length}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
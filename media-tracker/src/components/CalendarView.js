import React, { useMemo, useRef } from 'react';
import { useLogs } from '../core/context/LogContext';
import { useSwipeable } from 'react-swipeable';

export default function CalendarView({ currentDate, setCurrentDate, onDateClick, isLoading }) {
  const { logs } = useLogs();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthInputRef = useRef(null);

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

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
  }, [logs, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, () => null);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col bg-white animate-pulse">
        {/* 헤더 스켈레톤 */}
        <div className="h-12 flex justify-between items-center px-6">
          <div className="w-10 h-4 bg-stone-100 rounded" />
          <div className="w-20 h-6 bg-stone-100 rounded" />
          <div className="w-10 h-4 bg-stone-100 rounded" />
        </div>
        {/* 달력 그리드 스켈레톤 (실제와 동일한 7열) */}
        <div className="grid grid-cols-7 border-t border-l border-stone-100 flex-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="border-r border-b border-stone-100 h-24 bg-stone-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div {...handlers} className="w-full h-full flex flex-col bg-white">
      {/* 헤더 및 통계 */}
      <div className="flex justify-between items-center px-6 py-2">
        <button onClick={prevMonth} className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition p-2">Prev</button>
        <div className="cursor-pointer group flex items-baseline gap-1.5" onClick={() => monthInputRef.current?.showPicker()}>
          <div className="text-[18px] font-bold text-stone-900 tracking-tight">{year}.{String(month + 1).padStart(2, '0')}</div>
          <span className="text-[10px] text-stone-300 group-hover:text-stone-900 transition">▾</span>
          <input type="month" ref={monthInputRef} className="absolute opacity-0 w-0 h-0" value={`${year}-${String(month + 1).padStart(2, '0')}`}
            onChange={(e) => { const [y, m] = e.target.value.split('-'); setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1)); }}
          />
        </div>
        <button onClick={nextMonth} className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition p-2">Next</button>
      </div>

      <div className="flex justify-center gap-6 text-[8px] uppercase tracking-[0.2em] text-stone-400 pb-4">
        <span>{stats.watched} 봤어요</span>
        <span>{stats.wish} 보고싶어요</span>
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 border-t border-l border-stone-100 flex-1 bg-white">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
          <div key={day} className="border-r border-b border-stone-100 py-2 text-[9px] font-bold text-center text-stone-400 uppercase">
            {day.slice(0, 1)}
          </div>
        ))}

        {(() => {
          const allCells = [...blanks, ...days];
          const totalCells = allCells.length <= 35 ? 35 : 42;
          const remainingCells = totalCells - allCells.length;
          const filledCells = [...allCells, ...Array.from({ length: remainingCells }, () => null)];

          return filledCells.map((day, i) => {
            // --- [3번 수정] 빈 셀에 + 버튼 호버 효과 추가 ---
            if (!day) return (
              <div key={`empty-${i}`} className="border-r border-b border-stone-100 bg-white h-24 group relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-stone-300 font-light text-2xl">+</span>
                </div>
              </div>
            );

            const dateStr = `${year}.${month + 1}.${day}`;
            const log = (logs || []).find(l => l.date === dateStr);
            const sortedItems = log?.items ? [...log.items].sort((a, b) => a.watchedTime?.localeCompare(b.watchedTime)) : [];
            const hasPoster = sortedItems.length > 0;

            return (
              <div
                key={dateStr}
                // --- [1번, 2번 수정] 오늘 강조(bg-stone-50) 및 호버 인터랙션(scale, shadow) 추가 ---
                className={`border-r border-b border-stone-100 relative cursor-pointer group h-24 
                  transition-all duration-200 hover:bg-stone-50 hover:scale-[1.02] hover:z-10 hover:shadow-lg
                  ${isToday(day) ? 'bg-stone-50' : 'bg-white'}`}
                onClick={() => onDateClick(dateStr)}
              >
                <div className="w-full h-full relative overflow-hidden rounded-sm">

                  {/* --- [3번 수정] 포스터가 없을 때도 + 버튼 표시 --- */}
                  {!hasPoster && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="text-stone-300 font-light text-2xl">+</span>
                    </div>
                  )}

                  {hasPoster && (
                    <div className="w-full h-full flex flex-col">
                      {sortedItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex-1 w-full overflow-hidden relative">
                          <img src={item.poster_url} className="absolute inset-0 w-full h-full object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      ))}
                    </div>
                  )}

                  {(!hasPoster || isToday(day)) && (
                    <div className={`absolute top-1 left-1 z-30 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${isToday(day) ? 'bg-stone-900 text-white' : (i % 7 === 0 ? 'text-orange-500' : i % 7 === 6 ? 'text-indigo-500' : 'text-stone-900')}`}>
                      {day}
                    </div>
                  )}

                  {/* 뱃지 레이어 */}
                  {(log?.items?.length > 1 || (log?.items?.length === 1 && log.items[0].status === 'wish')) && (
                    <div className="absolute bottom-1 right-1 z-20 flex flex-row-reverse gap-1 items-center">
                      {log.items.length > 1 && log.items.filter(i => i.status === 'watched').length > 0 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-900 text-white text-[7px] font-bold shadow-sm">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          <span>{log.items.filter(i => i.status === 'watched').length}</span>
                        </div>
                      )}
                      {log.items.filter(i => i.status === 'wish').length > 0 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[7px] font-bold shadow-sm">
                          <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor">
                            {/* 찜(Wish) 모양 아이콘으로 변경 (예: 북마크 형태) */}
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                          <span>{log.items.filter(i => i.status === 'wish').length}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. 마음에 든 작품 - 하트 아이콘 레이어 (오른쪽 상단 - 포인트용) */}
                  {/* 뱃지와 겹치지 않게 위치를 아예 다르게 잡았습니다 */}
                  {log?.items?.some(i => i.isHeart) && (
                    <div className="absolute top-1 right-1 z-20">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#F87171">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  )}

                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
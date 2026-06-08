import React, { useState } from 'react';
import { useLogs } from '../core/context/LogContext';
import { useSwipeable } from 'react-swipeable';

export default function CalendarView({ onDateClick }) {
  const { logs } = useLogs();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 날짜 이동 로직 (스와이프 및 버튼 공용)
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

  const stats = (logs || []).reduce((acc, l) => {
    const [y, m] = l.date.split('.');
    if (parseInt(y) === year && parseInt(m) === month + 1) {
      l.items.forEach(item => {
        if (item.status === 'watched') acc.watched += 1;
        else if (item.status === 'wish') acc.wish += 1;
      });
    }
    return acc;
  }, { watched: 0, wish: 0 });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, () => null);

  return (
    <div {...handlers} className="w-full h-full flex flex-col bg-white">
      {/* 1. 헤더 영역 */}
      <div className="flex justify-between items-center px-2 py-3 border-b border-gray-100">
        <button className="p-2 text-sm hover:bg-gray-50 rounded" onClick={prevMonth}>◀</button>
        
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <div className="flex gap-1 font-black text-sm">
            {year}년 {month + 1}월
          </div>
          <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span className="text-black">{stats.watched}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-500 text-[12px] -mt-0.5">♥</span>
              <span className="text-red-500">{stats.wish}</span>
            </div>
          </div>
        </div>
        
        <button className="p-2 text-sm hover:bg-gray-50 rounded" onClick={nextMonth}>▶</button>
      </div>

      {/* 2. 요일 헤더 */}
      <div className="grid grid-cols-7 text-[9px] font-black text-center">
        {['일','월','화','수','목','금','토'].map((day, i) => (
          <div key={day} className={`py-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* 3. 달력 그리드 */}
      <div className="grid grid-cols-7 border-t border-l border-gray-100">
        {[...blanks, ...days].map((day, i) => {
          if (!day) return <div key={i} className="h-24 bg-white border-b border-r border-gray-100" />;
          
          const dateStr = `${year}.${month + 1}.${day}`;
          const log = (logs || []).find(l => l.date === dateStr);
          const count = log?.items?.length || 0;

          return (
            <div 
              key={i} 
              className="h-24 bg-white relative cursor-pointer border-b border-r border-gray-100 overflow-hidden group" 
              onClick={() => onDateClick(dateStr)}
            >
              <span className={`absolute top-0.5 left-0.5 text-[11px] font-black z-20 ${isToday(day) ? 'bg-red-500 text-white rounded-full px-1' : i % 7 === 0 ? 'text-red-500' : i % 7 === 6 ? 'text-blue-500' : 'text-black'}`}>
                {day}
              </span>

              {/* 작품 개수 표시 */}
              {count > 0 && (
                <div className="absolute bottom-1 right-1 z-30 flex gap-0.5">
                  {log.items.filter(i => i.status === 'watched').length > 0 && (
                    <span className="bg-black/70 text-white text-[8px] px-1 py-0.5 rounded shadow-sm">
                      {log.items.filter(i => i.status === 'watched').length}편
                    </span>
                  )}
                  {log.items.filter(i => i.status === 'wish').length > 0 && (
                    <span className="bg-red-500/90 text-white text-[8px] px-1 py-0.5 rounded shadow-sm">
                      {log.items.filter(i => i.status === 'wish').length}편
                    </span>
                  )}
                </div>
              )}

              {/* 포스터 표시 */}
              {log?.items?.length > 0 && (
                <div className="absolute inset-0 w-full h-full flex flex-col">
                  {log.items.length === 1 ? (
                    <img src={log.items[0].poster_url} className="w-full h-full object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <>
                      <img src={log.items[0].poster_url} className="w-full h-1/2 object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                      <img src={log.items[1].poster_url} className="w-full h-1/2 object-cover" alt="" onError={(e) => e.target.style.display = 'none'} />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
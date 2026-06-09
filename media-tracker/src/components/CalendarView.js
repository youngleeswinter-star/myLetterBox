import React, { useMemo,useRef } from 'react';
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
      {/* 깔끔한 상단 정보 */}
      {/* 1. 세련된 상단 헤더: 년/월 정보 및 이동 버튼 */}
      {/* 1. 개선된 헤더: 버튼을 양옆으로 배치하여 클릭 영역 확보 */}
      <div className="flex justify-between items-center px-6 py-2">
        {/* 왼쪽 버튼: 클릭 범위 확장 (p-2 추가) */}
        <button 
          onClick={prevMonth} 
          className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition p-2"
        >
          Prev
        </button>

        {/* 중앙: 년.월 한 줄 배치 (클릭 시 선택) */}
        <div 
          className="cursor-pointer group flex items-baseline gap-1.5" 
          onClick={() => monthInputRef.current?.showPicker()}
        >
          <div className="text-[18px] font-bold text-stone-900 tracking-tight">
            {year}.{String(month + 1).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-stone-300 group-hover:text-stone-900 transition">▾</span>
          
          <input 
            type="month" 
            ref={monthInputRef} 
            className="absolute opacity-0 w-0 h-0"
            value={`${year}-${String(month + 1).padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
            }}
          />
        </div>

        {/* 오른쪽 버튼: 클릭 범위 확장 (p-2 추가) */}
        <button 
          onClick={nextMonth} 
          className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition p-2"
        >
          Next
        </button>
      </div>

      {/* 통계는 헤더 아래 얇게 배치 (공간 효율화) */}
      <div className="flex justify-center gap-6 text-[8px] uppercase tracking-[0.2em] text-stone-400 pb-4">
        <span>{stats.watched} WATCHED</span>
        <span>{stats.wish} WISH</span>
      </div>

      {/* 달력 컨테이너 (여백 넉넉하게) */}
      <div className="grid grid-cols-7 gap-x-2 gap-y-6 px-4">
        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[9px] text-stone-300 text-center uppercase">{d}</div>)}
        
        {[...blanks, ...days].map((day, i) => {
          if (!day) return <div key={i} className="aspect-[3/4]" />;
          
          const dateStr = `${year}.${month + 1}.${day}`;
          const log = (logs || []).find(l => l.date === dateStr);
          const sortedItems = log?.items ? [...log.items].sort((a,b) => (a.watchedTime || '').localeCompare(b.watchedTime || '')) : [];

          return (
            <div key={i} className="aspect-[3/4] relative group cursor-pointer" onClick={() => onDateClick(dateStr)}>
              {/* 날짜 숫자 */}
              <div className={`text-[10px] mb-1.5 ${isToday(day) ? 'font-bold text-stone-900' : 'text-stone-300'}`}>{day}</div>
              
              {/* 포스터 영역 */}
              <div className="w-full h-full relative overflow-hidden bg-stone-50 rounded-sm">
                {sortedItems.length > 0 ? (
                  <img src={sortedItems[0].poster_url} className="w-full h-full object-cover transition-opacity group-hover:opacity-60" alt="" />
                ) : (
                  <div className="w-full h-full border border-stone-100 border-dashed" />
                )}
                
                {/* 뱃지: 포스터 위에 띄우기 */}
                {sortedItems.length > 0 && (
                  <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm text-[8px] font-bold px-1 rounded shadow-sm">
                    {sortedItems.length}
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
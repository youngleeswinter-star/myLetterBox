import React, { useState } from 'react';

export default function CalendarView({ logs, onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, () => null);

  return (
    <div className="w-full">
      {/* 헤더 부분 */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button className="p-2" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
        <h2 className="font-black text-sm">{year}년 {month + 1}월</h2>
        <button className="p-2" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
      </div>

      {/* 요일 표시 */}
      <div className="grid grid-cols-7 text-[9px] font-black text-center mb-1 text-gray-500">
        <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
      </div>

      {/* 달력 그리드 */}
     <div className="grid grid-cols-7 border-t border-l border-gray-100">
  {[...blanks, ...days].map((day, i) => {
    // 1. 날짜가 없는 빈 칸도 bg-white로 설정
    if (!day) return <div key={i} className="h-24 bg-white border-b border-r border-gray-100" />;
    
    const dateStr = `${year}.${month + 1}.${day}`;
    const log = logs.find(l => l.date === dateStr);
    
    return (
      <div 
        key={i} 
        // 2. 각 칸에 border-b, border-r을 주어 선을 만듭니다.
        className="h-24 bg-white relative cursor-pointer border-b border-r border-gray-100 overflow-hidden" 
        onClick={() => onDateClick(dateStr)}
      >
        <span className={`absolute top-0.5 left-0.5 text-[11px] font-black z-20 px-1 ${i % 7 === 0 ? 'text-red-500' : i % 7 === 6 ? 'text-blue-500' : 'text-black'}`}>
          {day}
        </span>

        {log?.items?.length > 0 && (
          <div className="absolute inset-0 w-full h-full flex flex-col">
            <div className="absolute z-30 bottom-0 right-0 bg-black/70 text-white text-[9px] px-1.5 py-0.5 font-black rounded-tl-lg">
              {log.items.length}편
            </div>
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
import React, { useState, useEffect, useRef } from 'react';

export default function CalendarView({ logs, onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setIsPickerOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, () => null);

  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      <div className="p-3 border-b flex justify-between items-center shrink-0">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
        <button className="font-black" onClick={() => setIsPickerOpen(!isPickerOpen)}>{year}년 {month + 1}월 ▾</button>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
        {isPickerOpen && (
          <div ref={pickerRef} className="absolute top-14 left-4 right-4 bg-white shadow-2xl p-4 z-50 rounded-xl grid grid-cols-3 gap-2">
            {[...Array(12)].map((_, i) => (
              <button key={i} className="p-2 bg-gray-100 rounded text-xs font-bold" onClick={() => { setCurrentDate(new Date(year, i, 1)); setIsPickerOpen(false); }}>{i + 1}월</button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-7 text-[10px] font-black text-center py-2">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className={d === '일' ? 'text-red-500' : d === '토' ? 'text-blue-500' : ''}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-1 border-t border-l">
        {[...blanks, ...days].map((day, i) => {
          const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
          const log = logs.find(l => l.date === dateStr);
          return (
            <div key={i} className="border-r border-b relative cursor-pointer hover:bg-gray-50" onClick={() => day && onDateClick(new Date(year, month, day))}>
              {day && <span className={`text-[10px] font-black p-1 z-10 relative ${i % 7 === 0 ? 'text-red-500' : i % 7 === 6 ? 'text-blue-500' : ''} ${log ? 'bg-white/70 rounded-full w-4 h-4 flex items-center justify-center' : ''}`}>{day}</span>}
              {log && <div className="absolute inset-0 z-0"><img src={log.img} className="w-full h-full object-cover" alt="" /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
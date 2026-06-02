import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import DashboardView from './components/DashboardView';
import DetailModal from './components/DetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('media-logs')) || []);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => { localStorage.setItem('media-logs', JSON.stringify(logs)); }, [logs]);

  const updateLog = (originalDate, newDate, updatedItems) => {
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== originalDate);
      if (updatedItems.length === 0) return filtered;
      return [...filtered, { date: newDate, items: updatedItems }];
    });
    setSelectedDate(null);
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 border-b bg-white shrink-0">
            <h1 className="text-lg font-black tracking-tighter">MEDIA TRACKER</h1>
            {activeTab === 'calendar' && (
              <button className="text-2xl font-bold p-2" onClick={() => {
                const d = new Date();
                setSelectedDate(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`);
              }}>+</button>
            )}
      </header>
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'calendar' ? (
            <CalendarView logs={logs} onDateClick={setSelectedDate} />
          ) : (
            <DashboardView logs={logs} onClear={() => { setLogs([]); localStorage.removeItem('media-logs'); }} />
          )}
        </div>
        <nav className="h-16 border-t bg-white flex items-center shrink-0">
          <button className={`flex-1 font-black text-xs ${activeTab === 'calendar' ? 'text-black' : 'text-gray-400'}`} onClick={() => setActiveTab('calendar')}>달력</button>
          <button className={`flex-1 font-black text-xs ${activeTab === 'dashboard' ? 'text-black' : 'text-gray-400'}`} onClick={() => setActiveTab('dashboard')}>통계</button>
        </nav>
      </div>
      {selectedDate && (
        <DetailModal 
          date={selectedDate} 
          data={logs.find(l => l.date === selectedDate) || { date: selectedDate, items: [] }} 
          onSave={updateLog} 
          onClose={() => setSelectedDate(null)} 
        />
      )}
    </div>
  );
}
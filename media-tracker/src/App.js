import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import DashboardView from './components/DashboardView';
import InputModal from './components/InputModal';

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('media-logs')) || []);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => { localStorage.setItem('media-logs', JSON.stringify(logs)); }, [logs]);

  const addLog = (title, img, targetDate) => {
    const originalDate = formatDate(selectedDate);
    setLogs(prev => [...prev.filter(l => l.date !== originalDate), { date: targetDate, title, img }]);
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        <header className="h-16 flex items-center px-6 border-b shrink-0"><h1 className="text-lg font-black">MEDIA TRACKER</h1></header>
        <main className="flex-1 overflow-hidden bg-gray-50">
          {activeTab === 'calendar' ? (
            <CalendarView logs={logs} onDateClick={(d) => { setSelectedDate(new Date(d.getFullYear(), d.getMonth(), d.getDate())); setShowModal(true); }} />
          ) : (
            <DashboardView logs={logs} />
          )}
        </main>
        <nav className="h-16 border-t flex items-center justify-around bg-white shrink-0">
          <button onClick={() => setActiveTab('calendar')} className="font-black">CALENDAR</button>
          <button onClick={() => setActiveTab('dashboard')} className="font-black">DASHBOARD</button>
        </nav>
      </div>
      {showModal && (
        <InputModal date={selectedDate} existingLog={logs.find(l => l.date === formatDate(selectedDate))} onSave={addLog} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
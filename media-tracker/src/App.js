import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import DashboardView from './components/DashboardView';
import DetailModal from './components/DetailModal';
import { supabase } from './supabaseClient';
import Login from './components/Common/Login';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('movie_logs')
        .select('*')
        .eq('user_id', session.user.id);
      if (data) setLogs(data);
    };
    fetchLogs();
  }, [session]);

  const updateLog = async (originalDate, newDate, updatedItems) => {
    await supabase.from('movie_logs').delete().eq('date', originalDate).eq('user_id', session.user.id);
    if (updatedItems?.length > 0) {
      await supabase.from('movie_logs').insert([{ date: newDate, items: updatedItems, user_id: session.user.id }]);
    }
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== originalDate);
      return updatedItems.length === 0 ? filtered : [...filtered, { date: newDate, items: updatedItems }];
    });
    setSelectedDate(null);
  };

  if (loading) return <div className="flex h-[100dvh] items-center justify-center font-light tracking-[0.2em] text-gray-400">LOADING</div>;
  if (!session) return <Login />;

  return (
    <div className="w-full min-h-[100dvh] bg-white flex justify-center text-gray-900 font-sans">
      <div className="w-full max-w-md h-[100dvh] bg-white flex flex-col border-x border-gray-50">
        
        {/* 헤더: 미니멀 & Uppercase */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-50 shrink-0">
          <h1 className="text-[11px] font-medium tracking-[0.2em] uppercase">My Letter Box</h1>
          {activeTab === 'calendar' ? (
            <button className="text-xl font-light hover:opacity-50 transition-opacity" onClick={() => {
              const d = new Date();
              setSelectedDate(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`);
            }}>+</button>
          ) : (
            <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} 
              className="text-[10px] tracking-[0.1em] uppercase text-gray-400 hover:text-gray-900 transition-colors">
              Logout
            </button>
          )}
        </header>
            
        {/* 본문 영역 */}
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'calendar' ? (
            <CalendarView logs={logs} onDateClick={setSelectedDate} />
          ) : (
            <DashboardView logs={logs} onClear={() => setLogs([])} />
          )}
          
        </div>

        {/* 내비게이션: 정갈한 하단 탭 */}
        <nav className="h-16 border-t border-gray-50 flex items-center shrink-0">
          <button className={`flex-1 text-[10px] tracking-[0.2em] uppercase ${activeTab === 'calendar' ? 'text-gray-900' : 'text-gray-300'}`} onClick={() => setActiveTab('calendar')}>Calendar</button>
          <button className={`flex-1 text-[10px] tracking-[0.2em] uppercase ${activeTab === 'calendar' ? 'text-gray-300' : 'text-gray-900'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        </nav>
      </div>

      {/* 모달 영역 */}
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
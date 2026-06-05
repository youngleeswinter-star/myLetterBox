import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import DashboardView from './components/Dashboard/DashboardView';
import DetailModal from './components/DetailModal';
import { supabase } from './supabaseClient';
import Login from './components/Common/Login';
import { LogProvider } from './core/context/LogContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="flex h-[100dvh] items-center justify-center font-light tracking-[0.2em] text-gray-400">LOADING</div>;
  if (!session) return <Login />;

  return (
    <LogProvider session={session}>
      <div className="w-full min-h-[100dvh] bg-white flex justify-center text-gray-900 font-sans">
        <div className="w-full max-w-md h-[100dvh] bg-white flex flex-col border-x border-gray-50">
          <header className="h-16 flex items-center justify-between px-6 border-b border-gray-50 shrink-0">
            <h1 className="text-[11px] font-medium tracking-[0.2em] uppercase">My Letter Box</h1>
            {activeTab === 'calendar' ? (
              <button className="text-xl font-light hover:opacity-50" onClick={() => {
                const d = new Date();
                setSelectedDate(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`);
              }}>+</button>
            ) : (
              <button onClick={() => supabase.auth.signOut()} className="text-[10px] uppercase text-gray-400">Logout</button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === 'calendar' ? (
              <CalendarView onDateClick={setSelectedDate} />
            ) : (
              <DashboardView />
            )}
          </div>

          <nav className="h-16 border-t border-gray-50 flex items-center shrink-0">
            <button className={`flex-1 text-[10px] uppercase ${activeTab === 'calendar' ? 'text-gray-900' : 'text-gray-300'}`} onClick={() => setActiveTab('calendar')}>Calendar</button>
            <button className={`flex-1 text-[10px] uppercase ${activeTab === 'calendar' ? 'text-gray-300' : 'text-gray-900'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          </nav>
        </div>

        {selectedDate && (
          <DetailModal date={selectedDate} onClose={() => setSelectedDate(null)} />
        )}
      </div>
    </LogProvider>
  );
}
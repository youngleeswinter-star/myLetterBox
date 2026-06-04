import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import DashboardView from './components/DashboardView';
import DetailModal from './components/DetailModal';
import SettingsModal from './components/SettingsModal';
import { supabase } from './supabaseClient';
import Login from './components/Common/Login';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [logs, setLogs] = useState([]); // 빈 배열로 시작
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 로그인 상태 확인 및 DB 데이터 불러오기
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

  // 세션이 있을 때 DB에서 데이터 불러오기
  useEffect(() => {
    if (!session) return;

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('movie_logs')
        .select('*')
        .eq('user_id', session.user.id);

      if (data) setLogs(data);
      if (error) console.error("데이터 로딩 실패:", error);
    };

    fetchLogs();
  }, [session]);

  // 2. 데이터 저장/수정 함수 (DB 연동)
  const updateLog = async (originalDate, newDate, updatedItems) => {
    // 기존 데이터 삭제
    await supabase
      .from('movie_logs')
      .delete()
      .eq('date', originalDate)
      .eq('user_id', session.user.id);

    // 새 데이터 저장
    const { error } = await supabase
      .from('movie_logs')
      .insert([{ date: newDate, items: updatedItems, user_id: session.user.id }]);

    if (!error) {
      setLogs(prev => {
        const filtered = prev.filter(l => l.date !== originalDate);
        return [...filtered, { date: newDate, items: updatedItems }];
      });
    }
    setSelectedDate(null);
  };

  if (loading) return <div>로딩중...</div>;
  if (!session) return <Login />;

  return (
    <div className="w-full h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 border-b bg-white shrink-0">
          <h1 className="text-lg font-black tracking-tighter">MEDIA TRACKER</h1>
          {activeTab === 'calendar' ? (
            <button className="text-2xl font-bold p-2" onClick={() => {
              const d = new Date();
              setSelectedDate(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`);
            }}>+</button>
          ) : (
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                // 로그아웃 후 상태가 변경되면 Login 컴포넌트가 자동으로 노출됩니다.
                window.location.reload(); 
              }} 
              className="px-3 py-1 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              로그아웃
            </button>
          )}
        </header>
            
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'calendar' ? (
            <CalendarView logs={logs} onDateClick={setSelectedDate} />
          ) : (
            <DashboardView logs={logs} onClear={() => setLogs([])} />
          )}
          {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
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
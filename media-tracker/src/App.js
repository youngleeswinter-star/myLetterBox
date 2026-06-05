import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import DashboardView from './components/Dashboard/DashboardView';
import BucketView from './components/BucketView';
import DetailModal from './components/DetailModal';
import Login from './components/Common/Login';
import { supabase } from './supabaseClient';

// 컨텍스트 import 추가 및 경로 확인
import { LogProvider } from './core/context/LogContext'; // useLogs 삭제
import { BucketProvider, useBuckets } from './core/context/BucketContext';

// 셔플 버튼 컴포넌트
function ShuffleButton() {
 const { buckets } = useBuckets(); // LogContext 대신 BucketContext 사용

  const handleShuffle = () => {
    // buckets는 배열 형태이므로 바로 랜덤 선택 가능
    if (buckets.length > 0) {
      const random = buckets[Math.floor(Math.random() * buckets.length)];
      // b.items[0]에 영화 정보가 들어있음
      const movieTitle = random.items[0]?.title || "알 수 없는 영화";
      alert(`오늘 뭐 보지?: ${movieTitle} ✨`);
    } else {
      alert("버킷 리스트가 비어있습니다!");
    }
  };

  return <button 
      onClick={handleShuffle} 
      className="text-[14px] hover:scale-110 transition-transform mr-4" 
      title="Shuffle Bucket"
    >
      🎲
    </button>;
}

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
      <BucketProvider session={session}>
        <div className="w-full min-h-[100dvh] bg-white flex justify-center text-gray-900 font-sans">
          <div className="w-full max-w-md h-[100dvh] bg-white flex flex-col border-x border-gray-50">
            <header className="h-16 flex items-center justify-between px-6 border-b border-gray-50 shrink-0">
              <h1 className="text-[11px] font-medium tracking-[0.2em] uppercase">My Letter Box</h1>
              
              <div className="flex items-center">
                <ShuffleButton />
                {activeTab === 'calendar' ? (
                  <button className="text-xl font-light hover:opacity-50" onClick={() => {
                    const d = new Date();
                    setSelectedDate(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`);
                  }}>+</button>
                ) : (
                  <button onClick={() => supabase.auth.signOut()} className="text-[10px] uppercase text-gray-400">Logout</button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-2">
              {activeTab === 'calendar' ? (
                <CalendarView onDateClick={setSelectedDate} />
              ) : activeTab === 'dashboard' ? (
                <DashboardView />
              ) : (
                <BucketView />
              )}
            </div>

            <nav className="h-16 border-t border-gray-50 flex items-center shrink-0">
              <button className={`flex-1 text-[10px] uppercase ${activeTab === 'calendar' ? 'text-gray-900 font-bold' : 'text-gray-300'}`} onClick={() => setActiveTab('calendar')}>Calendar</button>
              <button className={`flex-1 text-[10px] uppercase ${activeTab === 'dashboard' ? 'text-gray-900 font-bold' : 'text-gray-300'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
              <button className={`flex-1 text-[10px] uppercase ${activeTab === 'bucket' ? 'text-gray-900 font-bold' : 'text-gray-300'}`} onClick={() => setActiveTab('bucket')}>Bucket</button>
            </nav>
          </div>

          {selectedDate && (
            <DetailModal date={selectedDate} onClose={() => setSelectedDate(null)} />
          )}
        </div>
      </BucketProvider>
    </LogProvider>
  );
}
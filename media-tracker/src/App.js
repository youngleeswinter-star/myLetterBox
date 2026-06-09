import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import DashboardView from './components/Dashboard/DashboardView';
import BucketView from './components/BucketView';
import RecordEditor from './components/RecordEditor';
import Login from './components/Common/Login';
import { supabase } from './supabaseClient';
import { LogProvider } from './core/context/LogContext';
import { BucketProvider, useBuckets } from './core/context/BucketContext';

function ShuffleButton() {
  const { buckets } = useBuckets();
  const handleShuffle = () => {
    if (buckets.length > 0) {
      const random = buckets[Math.floor(Math.random() * buckets.length)];
      alert(`오늘 뭐 보지?: ${random.items[0]?.title || "Untitled"} ✨`);
    } else {
      alert("버킷 리스트가 비어있습니다!");
    }
  };
  return <button onClick={handleShuffle} className="text-[14px] hover:scale-110 transition-transform mr-4">🎲</button>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'edit-record' | 'edit-bucket'
  const [selectedDate, setSelectedDate] = useState(null);
  const [editData, setEditData] = useState(null); // 버킷 편집용
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // [추가] 달력이 보고 있는 달을 기억할 상태
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="flex h-[100dvh] items-center justify-center text-gray-400">LOADING</div>;
  if (!session) return <Login />;

  return (
    <LogProvider session={session}>
      <BucketProvider session={session}>
        <div className="w-full min-h-[100dvh] bg-white flex justify-center text-gray-900 font-sans">
          <div className="w-full max-w-md h-[100dvh] bg-white flex flex-col border-x border-gray-50">
            
            {/* 리스트 모드일 때만 헤더 노출 */}
            {viewMode === 'list' && (
              <header className="h-16 flex items-center justify-between px-6 border-b border-gray-50 shrink-0">
                <h1 className="text-[11px] font-medium tracking-[0.2em] uppercase">My Letter Box</h1>
                <div className="flex items-center">
                  <ShuffleButton />
                  {activeTab === 'calendar' ? (
                    <button className="text-xl font-light" onClick={() => {
                      const d = new Date();
                      setSelectedDate(`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`);
                      setViewMode('edit-record');
                    }}>+</button>
                  ) : (
                    <button onClick={() => supabase.auth.signOut()} className="text-[10px] uppercase text-gray-400">Logout</button>
                  )}
                </div>
              </header>
            )}

            {/* 메인 컨텐츠 영역 (페이지 전환) */}
            <div className="flex-1 overflow-y-auto">
              {viewMode === 'edit-record' ? (
                <RecordEditor 
                  mode="record" 
                  date={selectedDate} 
                  onClose={() => setViewMode('list')} 
                />
              ) : viewMode === 'edit-bucket' ? (
                <RecordEditor 
                  mode="bucket" 
                  editData={editData} 
                  onClose={() => setViewMode('list')} 
                />
              ) : (
                <div className="p-2">
                  {activeTab === 'calendar' ? (
                    <CalendarView 
      currentDate={calendarDate}        // 추가
      setCurrentDate={setCalendarDate}  // 추가
      onDateClick={(d) => { setSelectedDate(d); setViewMode('edit-record'); }} 
    />
                  ) : activeTab === 'dashboard' ? (
                    <DashboardView />
                  ) : (
                    <BucketView onEdit={(data) => { setEditData(data); setViewMode('edit-bucket'); }} />
                  )}
                </div>
              )}
            </div>

            {/* 리스트 모드일 때만 네비게이션 노출 */}
            {viewMode === 'list' && (
              <nav className="h-16 border-t border-gray-50 flex items-center shrink-0">
                <button className={`flex-1 text-[10px] uppercase ${activeTab === 'calendar' ? 'font-bold' : 'text-gray-300'}`} onClick={() => setActiveTab('calendar')}>Calendar</button>
                <button className={`flex-1 text-[10px] uppercase ${activeTab === 'dashboard' ? 'font-bold' : 'text-gray-300'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                <button className={`flex-1 text-[10px] uppercase ${activeTab === 'bucket' ? 'font-bold' : 'text-gray-300'}`} onClick={() => setActiveTab('bucket')}>Bucket</button>
              </nav>
            )}
          </div>
        </div>
      </BucketProvider>
    </LogProvider>
  );
}
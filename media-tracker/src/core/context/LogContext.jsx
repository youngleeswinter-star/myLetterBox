import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // 경로에 맞게 수정

const LogContext = createContext();

export const LogProvider = ({ session, children }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!session) return;
    const fetchLogs = async () => {
      const { data } = await supabase.from('movie_logs').select('*').eq('user_id', session.user.id);
      if (data) setLogs(data);
    };
    fetchLogs();
  }, [session]);

  const saveLog = async (originalDate, newDate, updatedItems) => {
  // 1. Supabase DB 업데이트 (기존 방식 유지)
  await supabase.from('movie_logs').delete().eq('date', originalDate).eq('user_id', session.user.id);
  if (updatedItems?.length > 0) {
    await supabase.from('movie_logs').insert([{ date: newDate, items: updatedItems, user_id: session.user.id }]);
  }

  // 2. 로컬 상태 업데이트 로직 수정 (순서 보존 및 교체)
  setLogs(prev => {
    // 먼저 기존 날짜 데이터 제거
    let nextLogs = prev.filter(l => l.date !== originalDate);
    
    // 데이터가 있으면 새로운 날짜로 추가
    if (updatedItems?.length > 0) {
      nextLogs = [...nextLogs, { date: newDate, items: updatedItems }];
    }
    
    // 날짜 순서대로 정렬 (YYYY.MM.DD 포맷이므로 문자열 정렬로 가능)
    return nextLogs.sort((a, b) => a.date.localeCompare(b.date));
  });
};
  return (
    <LogContext.Provider value={{ logs, saveLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => useContext(LogContext);
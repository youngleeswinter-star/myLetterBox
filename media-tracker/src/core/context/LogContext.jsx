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
    // 1. Supabase DB 업데이트
    await supabase.from('movie_logs').delete().eq('date', originalDate).eq('user_id', session.user.id);
    if (updatedItems?.length > 0) {
      await supabase.from('movie_logs').insert([{ date: newDate, items: updatedItems, user_id: session.user.id }]);
    }
    // 2. 로컬 상태 업데이트
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== originalDate);
      return updatedItems.length === 0 ? filtered : [...filtered, { date: newDate, items: updatedItems }];
    });
  };

  return (
    <LogContext.Provider value={{ logs, saveLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => useContext(LogContext);
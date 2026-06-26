import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const LogContext = createContext();

export const LogProvider = ({ session, children }) => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = useCallback(async () => {
    if (!session) return;
    
    const { data, error } = await supabase
      .from('movie_logs')
      .select('*')
      .eq('user_id', session.user.id);
      
    if (error) {
      console.error("데이터 로드 실패:", error);
      return;
    }

    if (data) {
      const normalizedData = data.map(item => ({
        ...item,
        watchedTime: item.watched_time,
        isHeart: item.is_heart,
        repeatCount: item.repeat_count
      }));

      const grouped = normalizedData.reduce((acc, movie) => {
        if (!acc[movie.date]) {
          acc[movie.date] = { date: movie.date, items: [] };
        }
        acc[movie.date].items.push(movie);
        return acc;
      }, {});
      
      setLogs(Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)));
    }
  }, [session]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const saveLog = async (updatedItems, targetDate) => {
    if (!session) {
      alert("세션이 없습니다! 다시 로그인해 주세요.");
      return false;
    }

    const dateToProcess = targetDate;
    if (!dateToProcess) {
      alert("저장할 날짜 정보를 찾을 수 없습니다.");
      return false;
    }

    try {
      // 1. 기존 데이터 조회 (창을 열었던 '원래 날짜' 기준)
      const { data: existingRecords, error: fetchErr } = await supabase
        .from('movie_logs')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('date', dateToProcess);

      if (fetchErr) {
        alert(`[조회 실패] ${fetchErr.message}`);
        return false;
      }

      // 2. 삭제 처리
      const incomingIds = updatedItems.filter(item => item.id).map(item => String(item.id)); 
      const dbIds = (existingRecords || []).map(row => String(row.id));
      const idsToDelete = dbIds.filter(id => !incomingIds.includes(id));

      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from('movie_logs')
          .delete()
          .eq('user_id', session.user.id)
          .in('id', idsToDelete);
        
        if (delErr) {
          alert(`[삭제 실패] ${delErr.message}`);
          return false;
        }
      }

      // 3. 남은 아이템 분리 (여기서 사용자가 수정한 item.date를 그대로 사용합니다!)
      const itemsToUpdate = [];
      const itemsToInsert = [];

      updatedItems.forEach(item => {
        const payload = {
          user_id: session.user.id,
          title: item.title,
          date: item.date, // 🔥 핵심 수정: 강제 고정 날짜가 아닌, 카드의 개별 날짜 사용!
          poster_url: item.poster_url,
          category: item.category || 'Movie',
          status: item.status || 'watched',
          platform: item.platform,
          watched_time: item.watchedTime || '14:00',
          review: item.review,
          rating: item.rating || 0,
          is_heart: !!item.isHeart,
          repeat_count: item.repeatCount || 1,
          director: item.director,
          year: item.year
        };

        if (item.id) {
          payload.id = item.id;
          itemsToUpdate.push(payload);
        } else {
          itemsToInsert.push(payload);
        }
      });

      // 4. DB 전송
      if (itemsToUpdate.length > 0) {
        const { error: updateErr } = await supabase.from('movie_logs').upsert(itemsToUpdate);
        if (updateErr) {
          alert(`[수정 실패] ${updateErr.message}`);
          return false;
        }
      }

      if (itemsToInsert.length > 0) {
        const { error: insertErr } = await supabase.from('movie_logs').insert(itemsToInsert);
        if (insertErr) {
          alert(`[추가 실패] ${insertErr.message}`);
          return false;
        }
      }

      await fetchLogs();
      return true;
    } catch (err) {
      alert(`[알 수 없는 에러] ${err.message}`);
      return false;
    }
  };

  return (
    <LogContext.Provider value={{ logs, saveLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogs = () => useContext(LogContext);
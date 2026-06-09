import { useState } from 'react';

export const useMovieSearch = () => {
  const [results, setResults] = useState([]);
  const API_KEY = '4de847a38f096b28a48cd6872369435a';

  const searchMovie = async (q) => {
    if (!q || q.length < 2) { 
      setResults([]); 
      return; 
    }
    
    try {
      // 1. 검색 API 호출
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=ko-KR`);
      const data = await res.json();
      
      if (!data.results || data.results.length === 0) {
        setResults([]);
        return;
      }

      // [핵심] 즉시 UI에 보여줄 기본 데이터 세팅
      const initialResults = data.results.slice(0, 5).map(m => ({
        ...m,
        year: m.release_date?.slice(0, 4) || '??',
        director: '...' // 로딩 중 표시
      }));
      setResults(initialResults);
      
      // 2. 상세 정보(감독 등)를 가져와서 나중에 업데이트
      const detailed = await Promise.all(initialResults.map(async (m) => {
        try {
          const dRes = await fetch(`https://api.themoviedb.org/3/movie/${m.id}?api_key=${API_KEY}&language=ko-KR&append_to_response=credits`);
          const detail = await dRes.json();
          return { 
            ...m, 
            director: detail.credits?.crew?.find(c => c.job === "Director")?.name || "정보없음" 
          };
        } catch (e) {
          return { ...m, director: "정보없음" };
        }
      }));
      
      // 상세 정보가 다 가져와지면 다시 업데이트
      setResults(detailed);
      
    } catch (err) {
      console.error("검색 실패:", err);
      setResults([]);
    }
  };

  return { results, searchMovie, setResults };
};
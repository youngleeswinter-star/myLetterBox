import { useState } from 'react'; 

export const useMovieSearch = () => {
  const [results, setResults] = useState([]);
  const API_KEY = '4de847a38f096b28a48cd6872369435a';

  const searchMovie = async (q) => {
    if (!q || q.length < 2) { setResults([]); return; }
    
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=ko-KR`);
      const data = await res.json();
      
      // 검색 결과가 아예 없는지 확인
      if (!data.results || data.results.length === 0) {
        setResults([]);
        return;
      }
      
      const detailed = await Promise.all(data.results.slice(0, 5).map(async (m) => {
        try {
          const dRes = await fetch(`https://api.themoviedb.org/3/movie/${m.id}?api_key=${API_KEY}&language=ko-KR&append_to_response=credits`);
          const detail = await dRes.json();
          return { 
            ...m, 
            year: m.release_date?.slice(0,4) || '??',
            director: detail.credits?.crew?.find(c => c.job === "Director")?.name || "정보없음" 
          };
        } catch (e) {
          return { ...m, year: '??', director: '정보없음' };
        }
      }));
      setResults(detailed);
    } catch (err) {
      console.error("검색 실패:", err);
      setResults([]);
    }
  };

  return { results, searchMovie, setResults };
};
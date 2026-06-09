import { useState } from 'react';

export const useUnifiedSearch = () => {
  const [results, setResults] = useState([]);
  const TMDB_KEY = '4de847a38f096b28a48cd6872369435a';

  const searchAll = async (q) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }

    try {
      // 병렬로 API 호출 (TMDB + KOPIS 등)
      const [tmdbData] = await Promise.all([
        fetchTMDB(q),
        // fetchKOPIS(q), // 향후 추가
        // fetchPublicData(q) // 향후 추가
      ]);

      const combined = [...tmdbData];
      setResults(combined);

      // 감독/상세정보 비동기 업데이트 (위에서 작성하신 방식과 동일)
      updateDetails(combined);

    } catch (err) {
      console.error("통합 검색 실패:", err);
    }
  };

  // TMDB 어댑터 함수
  const fetchTMDB = async (q) => {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&language=ko-KR`);
    const data = await res.json();
    return (data.results || []).slice(0, 3).map(m => ({
      id: `tmdb_${m.id}`,
      title: m.title,
      poster_path: m.poster_path,
      year: m.release_date?.slice(0, 4) || '??',
      director: '...',
      source: 'TMDB'
    }));
  };

  const fetchKOPIS = async (q) => {
  const KOPIS_KEY = '발급받은_키_입력';
  // KOPIS는 공연목록조회 API를 사용
  // shprfnm(공연명) 파라미터를 사용합니다.
  const url = `http://www.kopis.or.kr/openApi/restful/pblprfr?service=${KOPIS_KEY}&stdate=20260101&eddate=20261231&cpage=1&rows=5&shprfnm=${encodeURIComponent(q)}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    // KOPIS는 XML 응답이므로 파싱 필요
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const shows = Array.from(xml.querySelectorAll("db")).slice(0, 3);

    return shows.map(s => ({
      id: `kopis_${s.querySelector("mt20id")?.textContent}`,
      title: s.querySelector("prfnm")?.textContent,
      poster_path: s.querySelector("poster")?.textContent, // KOPIS는 전체 URL을 줌
      year: s.querySelector("prfpdfrom")?.textContent.slice(0, 4) || '??',
      director: s.querySelector("prfplcnm")?.textContent || '정보없음', // 공연장소
      source: 'KOPIS'
    }));
  } catch (e) {
    return [];
  }
};

  return { results, searchMovie: searchAll, setResults };
};
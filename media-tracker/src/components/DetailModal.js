import React, { useState } from 'react';

export default function DetailModal({ date, data, onSave, onClose }) {
  const [items, setItems] = useState(data?.items || [{ title: '', img: '' }]);
  const [targetDate, setTargetDate] = useState(() => {
    const [y, m, d] = date.split('.');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  });

  // 검색 관련 상태
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null); // 현재 검색 중인 아이템 인덱스
  const API_KEY = '4de847a38f096b28a48cd6872369435a';

  const searchMovie = async (q) => {
    setQuery(q);
    if (q.length < 2) return;
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}&language=ko-KR`);
    const data = await res.json();
    setResults(data.results || []);
  };

  const selectMovie = (movie, index) => {
    const n = [...items];
    n[index] = {
      title: movie.title,
      img: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    };
    setItems(n);
    setResults([]); // 검색창 닫기
    setActiveIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <h2 className="font-black mb-4">기록 관리</h2>
       <input 
  type="date" 
  className="w-full p-4 mb-4 bg-gray-100 rounded-xl font-bold border border-gray-200" 
  value={targetDate} 
  onChange={(e) => setTargetDate(e.target.value)} 
/>
        
        <div className="flex-1 overflow-y-auto mb-4">
          {items.map((item, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-xl mb-3 border relative">
              <div className="flex gap-3">
                <div className="w-16 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0 border">
                  {item.img ? <img src={item.img} className="w-full h-full object-cover" alt="" onError={(e) => e.target.style.display = 'none'} /> : <div className="text-[9px] p-1 text-center">No Img</div>}
                </div>
                <div className="flex-1">
                  <input className="w-full p-2 mb-1 rounded text-sm font-bold border" placeholder="영화 제목 검색" value={item.title} onChange={(e) => {
                    const n = [...items]; n[i].title = e.target.value; setItems(n);
                    setActiveIndex(i); searchMovie(e.target.value);
                  }} />
                  <input className="w-full p-2 rounded text-[10px] text-gray-600 border" placeholder="포스터 URL" value={item.img} onChange={(e) => { const n = [...items]; n[i].img = e.target.value; setItems(n); }} />
                </div>
              </div>
              
              {/* 검색 결과 레이어 */}
              {activeIndex === i && results.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border rounded-b-xl shadow-xl z-50 max-h-40 overflow-y-auto mt-1">
                  {results.map(m => (
                    <button key={m.id} className="w-full p-2 text-left text-xs border-b flex gap-2 items-center hover:bg-gray-100" onClick={() => selectMovie(m, i)}>
                      <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} className="w-8 h-12 object-cover" alt="" />
                      <span>{m.title} ({m.release_date?.split('-')[0]})</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-2"><button className="text-[10px] text-red-500 font-black px-2 py-1 bg-white border rounded" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>삭제</button></div>
            </div>
          ))}
          <button className="w-full py-4 bg-blue-500 text-white text-sm font-black rounded-xl" onClick={() => setItems([...items, { title: '', img: '' }])}>+ 영화 추가하기</button>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 py-3 bg-gray-200 rounded-xl font-black" onClick={onClose}>취소</button>
          <button className="flex-1 py-3 bg-black text-white rounded-xl font-black" onClick={() => {
            const [y, m, d] = targetDate.split('-');
            onSave(date, `${y}.${parseInt(m)}.${parseInt(d)}`, items.filter(i => i.title));
          }}>저장</button>
        </div>
      </div>
    </div>
  );
}
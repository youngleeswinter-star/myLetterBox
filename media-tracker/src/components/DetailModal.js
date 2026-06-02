import React, { useState } from 'react';

export default function DetailModal({ date, data, onSave, onClose }) {
  const [items, setItems] = useState(data?.items || [{ title: '', img: '' }]);
  const [targetDate, setTargetDate] = useState(() => {
    const [y, m, d] = date.split('.');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <h2 className="font-black mb-4">기록 관리</h2>
        
        <input type="date" className="w-full p-4 mb-4 bg-gray-100 rounded-xl font-bold border" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        
        <div className="flex-1 overflow-y-auto mb-4">
          {items.map((item, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-xl mb-3 border flex gap-3">
              {/* 포스터 미리보기 영역 */}
              <div className="w-16 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0 border">
                {item.img ? (
                  <img src={item.img} className="w-full h-full object-cover" alt="미리보기" onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <div className="flex items-center justify-center h-full text-[10px] text-gray-400">No Img</div>
                )}
              </div>

              {/* 입력 영역 */}
              <div className="flex-1">
                <input className="w-full p-2 mb-1 rounded text-sm font-bold border" placeholder="영화 제목" value={item.title} onChange={(e) => { const n = [...items]; n[i].title = e.target.value; setItems(n); }} />
                <input className="w-full p-2 rounded text-[10px] text-gray-600 border" placeholder="포스터 URL" value={item.img} onChange={(e) => { const n = [...items]; n[i].img = e.target.value; setItems(n); }} />
                <div className="flex justify-end mt-1">
                  <button className="text-[10px] text-red-500 font-black px-2 py-1 bg-white border rounded" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>삭제</button>
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-4 bg-blue-500 text-white text-sm font-black rounded-xl" onClick={() => setItems([...items, { title: '', img: '' }])}>+ 영화 추가하기</button>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 py-3 bg-gray-200 rounded-xl font-black" onClick={onClose}>취소</button>
          <button className="flex-1 py-3 bg-black text-white rounded-xl font-black" onClick={() => {
            const [y, m, d] = targetDate.split('-');
            onSave(date, `${y}.${parseInt(m)}.${parseInt(d)}`, items.filter(i => i.title || i.img));
          }}>저장</button>
        </div>
      </div>
    </div>
  );
}
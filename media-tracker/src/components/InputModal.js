import React, { useState } from 'react';

export default function InputModal({ date, existingLog, onSave, onClose }) {
  const [title, setTitle] = useState(existingLog?.title || '');
  const [img, setImg] = useState(existingLog?.img || '');
  const [targetDate, setTargetDate] = useState(existingLog?.date || `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl">
        <input type="date" className="w-full p-2 mb-2 bg-gray-100 rounded font-bold" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        <input className="w-full p-2 mb-2 bg-gray-100 rounded font-bold" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full p-2 mb-4 bg-gray-100 rounded text-xs" placeholder="이미지 URL" value={img} onChange={(e) => setImg(e.target.value)} />
        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-gray-200 rounded font-bold" onClick={onClose}>취소</button>
          <button className="flex-1 py-2 bg-black text-white rounded font-bold" onClick={() => onSave(title, img, targetDate)}>저장</button>
        </div>
      </div>
    </div>
  );
}
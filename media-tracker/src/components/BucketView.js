import React, { useState } from 'react';
import { useBuckets } from '../core/context/BucketContext';
import AddBucketModal from './AddBucketModal';

export default function BucketView() {
  const { buckets, removeFromBucket } = useBuckets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-6 py-6">
        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase">BUCKET LIST ({buckets.length})</h2>
        <button 
          onClick={() => { setEditingMovie(null); setIsModalOpen(true); }} 
          className="text-xl font-light hover:opacity-50 transition-opacity"
        >+</button>
      </div>

      {/* 리스트 그리드 */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {buckets.map((b) => {
          const item = b.items[0];
          return (
            <div key={b.id} className="group relative aspect-[2/3] bg-gray-100 overflow-hidden shadow-sm">
              <img 
                src={item.poster_url} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={item.title} 
              />
              
              {/* 호버 오버레이: 수직 중심 정렬 강화 */}
<div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6 text-center">
  
  {/* 상단 부분 (카테고리 & 제목) */}
  <div className="flex flex-col justify-center flex-grow">
    <span className="text-[7px] text-gray-400 uppercase tracking-[0.2em] mb-1">{item.category}</span>
    <p className="text-white text-[12px] font-bold truncate leading-tight">{item.title}</p>
    <p className="text-sky-400 text-[9px] uppercase tracking-widest mt-1">{item.platform}</p>
  </div>
  
  {/* 중앙 부분 (노트) - 너무 상단에 쏠리지 않게 별도 블록 처리 */}
  <div className="py-4">
    <p className="text-gray-300 text-[10px] italic line-clamp-3 leading-relaxed">
      "{item.note}"
    </p>
  </div>

  {/* 하단 부분 (버튼) - 확실하게 하단 고정 */}
  <div className="flex flex-col gap-2 pt-2">
    <button 
      onClick={() => { setEditingMovie({...item, id: b.id}); setIsModalOpen(true); }} 
      className="text-white text-[8px] uppercase py-1 border border-white hover:bg-white hover:text-black transition-colors"
    >
      Edit
    </button>
    <button 
      onClick={() => removeFromBucket(b.id)} 
      className="text-gray-500 text-[8px] uppercase hover:text-red-400 transition-colors"
    >
      Delete
    </button>
  </div>
</div>
            </div>
          );
        })}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <AddBucketModal 
          onClose={() => setIsModalOpen(false)} 
          editData={editingMovie} 
        />
      )}
    </div>
  );
}
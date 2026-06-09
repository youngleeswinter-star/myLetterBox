import React, { useState, useMemo } from 'react';
import { useBuckets } from '../core/context/BucketContext';
import BucketEditor from './BucketEditor';

export default function BucketView() {
  const { buckets, removeFromBucket } = useBuckets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuckets = useMemo(() => {
    let result = [...buckets].filter(b => 
      b.items[0]?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [buckets, searchTerm]);

  return (
    // 1. 컨테이너에 h-full을 주어 부모 영역을 꽉 채우게 함
    <div className="flex flex-col h-full bg-white"> 
      
      {/* 2. 상단 고정 영역: sticky 적용 */}
      <div className="sticky top-0 z-20 bg-white px-6 py-6 pb-4 border-b border-stone-50 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase">
            BUCKET LIST ({filteredBuckets.length})
          </h2>
          <button 
            onClick={() => { setEditingMovie(null); setIsModalOpen(true); }} 
            className="text-xl font-light hover:opacity-50 transition-colors"
          >
            +
          </button>
        </div>
        
        <input 
          type="text"
          placeholder="Search bucket..."
          className="w-full text-[10px] border-b pb-1 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. 스크롤 영역: 여기서만 스크롤바가 발생함 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 p-4">
          {filteredBuckets.length === 0 ? (
            <p className="col-span-2 text-[10px] text-gray-300 italic p-6 text-center">
              No records found.
            </p>
          ) : (
            filteredBuckets.map((b) => {
              const item = b.items[0];
              return (
                <div key={b.id} className="group relative aspect-[2/3] bg-gray-100 overflow-hidden shadow-sm">
                  <img 
                    src={item.poster_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={item.title} 
                  />
                  
                  {/* 호버 오버레이 (기존 기능 유지) */}
                  <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6 text-center">
                    <div className="flex flex-col justify-center flex-grow">
                      <span className="text-[7px] text-gray-400 uppercase tracking-[0.2em] mb-1">{item.category}</span>
                      <p className="text-white text-[12px] font-bold truncate leading-tight">{item.title}</p>
                      <p className="text-sky-400 text-[9px] uppercase tracking-widest mt-1">{item.platform}</p>
                    </div>
                    
                    <div className="py-4">
                      <p className="text-gray-300 text-[10px] italic line-clamp-3 leading-relaxed">
                        "{item.note}"
                      </p>
                    </div>

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
            })
          )}
          {/* 리스트 하단 여백 */}
          <div className="h-18"></div>
        </div>
      </div>

      {/* 4. 모달창 (기존 기능 유지) */}
      {isModalOpen && (
        <BucketEditor 
          onClose={() => setIsModalOpen(false)} 
          editData={editingMovie} 
        />
      )}
    </div>
  );
}
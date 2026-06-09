import React, { useState, useMemo } from 'react';
import { useBuckets } from '../core/context/BucketContext';
import BucketEditor from './BucketEditor';

export default function BucketView() {
  const { buckets, removeFromBucket } = useBuckets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // [수정] useMemo를 사용하여 순서를 완전히 고정
  const filteredBuckets = useMemo(() => {
    // 1. 먼저 검색 필터링을 수행 (제목 관련)
    let result = [...buckets].filter(b => 
      b.items[0]?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. 그 다음 정렬 수행 (제목 순서가 아닌 생성 시간 기준)
    return result.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [buckets, searchTerm]);

  return (
    <div className="pb-20">
      {/* 헤더 및 검색창 */}
      <div className="px-6 py-6 space-y-4">
        <div className="flex justify-between items-center">
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
        
        {/* 검색 입력창 */}
        <input 
          type="text"
          placeholder="Search bucket..."
          className="w-full text-[10px] border-b pb-1 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 리스트 그리드 */}
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
                
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6 text-center">
                  
                  {/* 상단: 카테고리 & 제목 */}
                  <div className="flex flex-col justify-center flex-grow">
                    <span className="text-[7px] text-gray-400 uppercase tracking-[0.2em] mb-1">{item.category}</span>
                    <p className="text-white text-[12px] font-bold truncate leading-tight">{item.title}</p>
                    <p className="text-sky-400 text-[9px] uppercase tracking-widest mt-1">{item.platform}</p>
                  </div>
                  
                  {/* 중앙: 노트 */}
                  <div className="py-4">
                    <p className="text-gray-300 text-[10px] italic line-clamp-3 leading-relaxed">
                      "{item.note}"
                    </p>
                  </div>

                  {/* 하단: 버튼 */}
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
      </div>

      {/* 전체 화면 전환 에디터 */}
      {isModalOpen && (
        <BucketEditor 
          onClose={() => setIsModalOpen(false)} 
          editData={editingMovie} 
        />
      )}
    </div>
  );
}
import React from 'react';

export default function SettingsModal({ onClose }) {
  
  // 데이터 내보내기 (다운로드)
  const exportData = () => {
    const data = localStorage.getItem('movieLogs') || '[]';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movie-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // 데이터 불러오기
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem('movieLogs', JSON.stringify(data));
        alert('데이터 복구 완료!');
        window.location.reload();
      } catch (err) {
        alert('파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xs p-6 rounded-2xl shadow-xl">
        <h2 className="font-black mb-6 text-lg">설정 및 데이터 관리</h2>
        
        <div className="flex flex-col gap-3">
          <button onClick={exportData} className="w-full py-4 bg-gray-100 rounded-xl font-bold text-sm">
            💾 기록 다운로드 (JSON)
          </button>
          
          <label className="w-full py-4 bg-black text-white text-center rounded-xl font-bold text-sm cursor-pointer">
            📂 데이터 불러오기
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>

        <button onClick={onClose} className="w-full mt-6 py-2 text-gray-400 font-bold text-xs">닫기</button>
      </div>
    </div>
  );
}
import React from 'react';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FDFCF8] px-8 font-sans">
      {/* 배경 분위기 */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-50"></div>

      {/* 로고 영역 */}
      <div className="z-10 text-center mb-16">
        <h1 className="text-[52px] font-black tracking-tighter text-gray-900 leading-none mb-4">
          My Letter<br/>Box
        </h1>
        <div className="bg-gray-900 text-white px-4 py-1 inline-block text-[10px] uppercase tracking-[0.2em] mb-8">
          Movie, TV Show Log!
        </div>
        
        {/* 살짝 킹받는 문구 */}
        <p className="text-gray-600 text-[15px] font-light italic leading-relaxed max-w-[220px] mx-auto">
          골랐다, 봤다, 까먹었다.<br />
          무한 루프를 끊어줄 당신의 데이터 저장소.
        </p>
      </div>

      {/* 로그인 버튼 박스 */}
      <div className="z-10 w-full max-w-[280px]">
        <button
          onClick={handleLogin}
          className="group w-full flex items-center justify-center gap-4 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-bold tracking-widest text-[13px] hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
        >
          <span>기록하러 가기</span>
          <span className="opacity-50">→</span>
        </button>
      </div>

      <footer className="absolute bottom-8 text-[9px] uppercase tracking-[0.3em] text-gray-300">
        Don't forget.
      </footer>
    </div>
  );
}
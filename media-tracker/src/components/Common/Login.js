import React from 'react';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    // 배경을 더 깔끔한 흰색(bg-white)으로 통일
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-8 font-sans">
      
      {/* 로고 영역: 폰트 두께를 줄이고 자간을 늘림 */}
      <div className="text-center mb-20">
        <h1 className="text-[32px] font-light tracking-[0.2em] text-gray-900 leading-none mb-6 uppercase">
          My Letter<br/>Box
        </h1>
        
        {/* 문구: italic 대신 깔끔한 normal 텍스트로 변경 */}
        <p className="text-gray-400 text-[13px] font-light tracking-[0.15em] leading-relaxed">
          COLLECTED, WATCHED, FORGOTTEN.<br />
          YOUR PRIVATE ARCHIVE.
        </p>
      </div>

      {/* 버튼: 입체 그림자 제거, 얇은 테두리로 정갈하게 */}
      <div className="w-full max-w-[240px]">
        <button
          onClick={handleLogin}
          className="w-full py-4 border border-emerald-700 text-emerald-800 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-emerald-50 transition-all active:scale-[0.98]"
        >
          Google Login
        </button>
      </div>

      <footer className="absolute bottom-8 text-[9px] uppercase tracking-[0.3em] text-gray-300">
        © 2026 YOUNGEUN Lee. 
      </footer>
    </div>
  );
}
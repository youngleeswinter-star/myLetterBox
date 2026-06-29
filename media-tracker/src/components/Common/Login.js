import React from 'react';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 이 옵션이 있으면 로그아웃 후 로그인 시 항상 계정 선택 창이 뜹니다.
        queryParams: {
          prompt: 'select_account'
        },
        // 리다이렉트 주소를 명시하여 로그인 후 앱으로 즉시 복귀합니다.
        redirectTo: window.location.origin 
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-8 font-sans">
      
      {/* 로고 영역 */}
      <div className="text-center mb-20">
        <h1 className="text-[32px] font-light tracking-[0.2em] text-gray-900 leading-none mb-6 uppercase">
          My Letter<br/>Box
        </h1>
        <p className="text-gray-400 text-[13px] font-light tracking-[0.15em] leading-relaxed">
          COLLECTED, WATCHED, FORGOTTEN.<br />
          YOUR PRIVATE ARCHIVE.
        </p>
      </div>

      {/* 로그인 버튼 */}
      <div className="w-full max-w-[240px]">
        <button
          onClick={handleLogin}
          className="w-full py-4 border border-emerald-700 text-emerald-800 text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-emerald-50 transition-all active:scale-[0.98]"
        >
          Google Login
        </button>
      </div>

      <footer className="absolute bottom-8 text-emerald-800 text-[11px] font-medium tracking-[0.2em] uppercase">
        © 2026 YOUNGEUN Lee. 
      </footer>
    </div>
  );
}
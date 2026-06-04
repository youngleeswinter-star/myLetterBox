import { supabase } from '../../supabaseClient';

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button 
        onClick={handleLogin}
        className="px-6 py-3 bg-black text-white rounded-xl font-bold"
      >
        구글로 로그인
      </button>
    </div>
  );
}
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../supabaseClient' // adjust path if needed
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect home if already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome to PrimeRent</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google']}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  )
}
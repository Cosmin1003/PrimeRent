import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate("/");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-white">
      <div className="max-w-md w-full bg-white border border-gray-100 p-8 rounded-3xl shadow-2xl shadow-gray-100">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">
            Prime<span className="text-emerald-600">Rent</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Sign in to access extraordinary homes.
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#10b981", // Emerald 500
                  brandAccent: "#059669", // Emerald 600
                  inputBackground: "transparent",
                  inputText: "black",
                  inputPlaceholder: "#9ca3af",
                },
                radii: {
                  buttonBorderRadius: "12px",
                  inputBorderRadius: "12px",
                },
              },
            },
          }}
          theme="light"
          providers={["google"]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
}

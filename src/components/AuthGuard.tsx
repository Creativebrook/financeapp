"use client";

import { useState, useEffect, ReactNode } from "react";
import { Wallet, Lock } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("finance_app_auth");
    // Use setTimeout to avoid synchronous state update in effect
    const timer = setTimeout(() => {
      setIsAuthorized(auth === "true");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password protection as requested by the user
    // The user can change this password later if they want
    if (password === "finance360") {
      localStorage.setItem("finance_app_auth", "true");
      setIsAuthorized(true);
      setError("");
      // Refresh the page to trigger data fetching in FinanceContext
      window.location.reload();
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1118]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6f6af8]"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1118] p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#1a1c24] border border-white/5 shadow-2xl text-center">
          <div className="w-20 h-20 bg-[#6f6af8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-[#6f6af8]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-slate-400 mb-8">Introduza a sua senha para aceder ao Finance 360º.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              className="w-full p-4 rounded-xl bg-[#0f1118] border border-white/10 text-white focus:outline-none focus:border-[#6f6af8] transition-all"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button 
              type="submit"
              className="w-full py-4 px-6 bg-[#6f6af8] text-white font-bold rounded-xl hover:bg-[#5b56e0] transition-all shadow-lg shadow-[#6f6af8]/20"
            >
              Entrar
            </button>
          </form>
          <p className="mt-8 text-xs text-slate-500 italic">
            Dica: A senha padrão é &quot;finance360&quot;
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

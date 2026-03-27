"use client";

import { useFinance } from "@/context/FinanceContext";
import { Wallet } from "lucide-react";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signInWithGoogle } = useFinance();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1118]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6f6af8]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1118] p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#1a1c24] border border-white/5 shadow-2xl text-center">
          <div className="w-20 h-20 bg-[#6f6af8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet size={40} className="text-[#6f6af8]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Finance</h1>
          <p className="text-slate-400 mb-8">Faça login para gerir as suas finanças de forma inteligente e segura.</p>
          <button 
            onClick={signInWithGoogle}
            className="w-full py-4 px-6 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useState, useEffect, ReactNode } from "react";
import { Wallet, Lock, Mail, Chrome, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";

interface AuthGuardProps {
  children: ReactNode;
}

type AuthMode = 'simple' | 'email_login' | 'email_signup';

export default function AuthGuard({ children }: AuthGuardProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, loading } = useFinance();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>('email_login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("finance_app_auth");
    // If user is logged in via Supabase, they are authorized
    if (user) {
      setIsAuthorized(true);
      return;
    }
    
    // Fallback to simple auth check
    if (auth === "true") {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [user]);

  const handleSimpleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "finance360") {
      localStorage.setItem("finance_app_auth", "true");
      setIsAuthorized(true);
      setError("");
      window.location.reload();
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (authMode === 'email_login') {
        const { error } = await signInWithEmail(email, emailPassword);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError("Credenciais inválidas. Verifique o seu email e senha.");
          } else {
            setError(error.message);
          }
        } else {
          setIsAuthorized(true);
        }
      } else {
        const { error } = await signUpWithEmail(email, emailPassword);
        if (error) {
          setError(error.message);
        } else {
          setError("Conta criada! Por favor, verifique o seu email (se necessário) e faça login.");
          setAuthMode('email_login');
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro durante a autenticação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f1118]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6f6af8]"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1118] p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#1a1c24] border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#6f6af8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet size={32} className="text-[#6f6af8]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Finance 360º</h1>
            <p className="text-slate-400 text-sm">Controle total das suas finanças</p>
          </div>

          {authMode === 'simple' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">Acesso Local</h2>
                <p className="text-slate-400 text-sm mb-6">Introduza a senha de acesso (não sincroniza dados).</p>
              </div>
              
              <form onSubmit={handleSimpleLogin} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha de acesso"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0f1118] border border-white/10 text-white focus:outline-none focus:border-[#6f6af8] transition-all"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                <button 
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#6f6af8] text-white font-bold rounded-xl hover:bg-[#5b56e0] transition-all shadow-lg shadow-[#6f6af8]/20 flex items-center justify-center gap-2"
                >
                  Entrar <ArrowRight size={18} />
                </button>
              </form>
              
              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => setAuthMode('email_login')}
                  className="w-full py-3 text-slate-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={16} /> Usar Email para Sincronizar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {authMode === 'email_login' ? 'Bem-vindo de volta' : 'Criar nova conta'}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {authMode === 'email_login' 
                    ? 'Faça login para sincronizar os seus dados.' 
                    : 'Registe-se para manter os seus dados seguros na nuvem.'}
                </p>
              </div>

              <button 
                onClick={() => signInWithGoogle()}
                className="w-full py-3.5 px-6 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 mb-4"
              >
                <Chrome size={20} /> Continuar com Google
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-slate-600 text-xs uppercase tracking-widest">ou</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0f1118] border border-white/10 text-white focus:outline-none focus:border-[#6f6af8] transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0f1118] border border-white/10 text-white focus:outline-none focus:border-[#6f6af8] transition-all"
                  />
                </div>
                {error && <p className={`text-xs font-medium ${error.includes('Conta criada') ? 'text-green-500' : 'text-red-500'}`}>{error}</p>}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#6f6af8] text-white font-bold rounded-xl hover:bg-[#5b56e0] transition-all shadow-lg shadow-[#6f6af8]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {authMode === 'email_login' ? 'Entrar' : 'Criar Conta'} 
                      {authMode === 'email_login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                    </>
                  )}
                </button>
              </form>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setAuthMode(authMode === 'email_login' ? 'email_signup' : 'email_login')}
                  className="w-full text-slate-400 hover:text-white text-sm transition-colors"
                >
                  {authMode === 'email_login' 
                    ? 'Não tem uma conta? Registe-se' 
                    : 'Já tem uma conta? Faça login'}
                </button>
                <button 
                  onClick={() => setAuthMode('simple')}
                  className="w-full text-slate-500 hover:text-slate-300 text-xs transition-colors"
                >
                  Acesso local apenas (finance360)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

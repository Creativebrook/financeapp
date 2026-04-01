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
  console.log('AuthGuard: Rendering. User:', user?.email, 'Loading:', loading);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>('email_login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [showForceContinue, setShowForceContinue] = useState(false);
  const { updatePassword } = useFinance();
  
  useEffect(() => {
    console.log('AuthGuard: Mounted');
    const timer = setTimeout(() => {
      if (loading || isAuthorized === null) {
        console.warn('AuthGuard: Stuck on loading for 5s, showing force continue button');
        setShowForceContinue(true);
      }
    }, 5000);
    return () => {
      console.log('AuthGuard: Unmounted');
      clearTimeout(timer);
    };
  }, [loading, isAuthorized]);

  useEffect(() => {
    const auth = localStorage.getItem("finance_app_auth");
    console.log('AuthGuard: Auth check effect. User:', user?.email, 'Loading:', loading, 'Auth stored:', auth);
    
    // If loading is finished, we can determine authorization
    if (!loading) {
      if (user) {
        console.log('AuthGuard: User found, authorizing');
        setIsAuthorized(true);
      } else if (auth === "true") {
        console.log('AuthGuard: Simple auth found, authorizing');
        setIsAuthorized(true);
      } else {
        console.log('AuthGuard: No auth found, deauthorizing');
        setIsAuthorized(false);
      }
    } else {
      // While loading, we can still check if we have a user or simple auth
      // to potentially show content earlier, but it's safer to wait for loading=false
      if (user || auth === "true") {
        console.log('AuthGuard: User or simple auth found while loading, setting isAuthorized to true');
        setIsAuthorized(true);
      }
    }
  }, [user, loading]); // Added loading to dependencies to ensure it runs when loading state changes

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
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro durante a autenticação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setError(error.message);
      } else {
        setPasswordChangeSuccess(true);
        setNewPassword("");
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordChangeSuccess(false);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao alterar a senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isAuthorized === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1118] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6f6af8] mb-6"></div>
        <p className="text-slate-400 text-sm animate-pulse mb-8">A carregar o seu perfil financeiro...</p>
        
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-sm hover:bg-white/10 transition-all"
          >
            Recarregar Página
          </button>
          
          <div className="text-[10px] text-slate-600 font-mono">
            Status: {loading ? 'Auth Loading' : 'Auth Ready'} | User: {user ? 'Found' : 'None'} | Auth: {isAuthorized === null ? 'Pending' : 'Done'}
          </div>

          {showForceContinue && (
            <button 
              onClick={() => setIsAuthorized(true)}
              className="mt-4 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs hover:bg-red-500/20 transition-all"
            >
              Forçar Entrada (Se estiver preso)
            </button>
          )}
        </div>
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

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Faça login para sincronizar os seus dados.
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
              {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-[#6f6af8] text-white font-bold rounded-xl hover:bg-[#5b56e0] transition-all shadow-lg shadow-[#6f6af8]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Entrar <LogIn size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

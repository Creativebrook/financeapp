'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1118] p-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} className="text-red-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Ocorreu um erro inesperado</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        Pedimos desculpa pelo incómodo. A aplicação encontrou um problema ao carregar esta página.
      </p>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 w-full max-w-2xl overflow-auto text-left">
        <p className="text-red-400 font-mono text-sm break-words">
          {error.name}: {error.message}
        </p>
        {error.stack && (
          <pre className="mt-4 text-slate-500 font-mono text-[10px] leading-relaxed overflow-x-auto">
            {error.stack}
          </pre>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-[#6f6af8] hover:bg-[#5b56e0] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#6f6af8]/20"
        >
          <RefreshCcw size={18} /> Tentar Novamente
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
        >
          <Home size={18} /> Voltar ao Início
        </button>
      </div>
      
      <p className="mt-12 text-slate-600 text-xs font-mono">
        Digest: {error.digest || 'N/A'}
      </p>
    </div>
  );
}

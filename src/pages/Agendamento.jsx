import React, { useState } from "react";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { User, ChevronDown, Calendar, Settings, LogOut, X, Activity, ClipboardList, PlusCircle } from "lucide-react";

const Agendamento = () => {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nomeUsuario = auth.currentUser?.displayName || "Usuário";

  const isAtivo = (rota) => location.pathname === rota;
  const horarios = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  return (
    <div className="h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">
      {menuAberto && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuAberto(false)} />}

      <header className="bg-[#059669] text-white p-4 flex justify-between items-center shadow-md z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { if(window.innerWidth < 1024) setMenuAberto(true) }} 
            className="bg-white text-[#059669] font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md shrink-0 lg:cursor-default"
          >
            MB
          </button>
          
          <div className="flex items-center gap-6">
            <div>
              <h1 className="font-bold text-sm leading-none uppercase tracking-tight">Manuela Bernardo</h1>
              <p className="text-[10px] uppercase opacity-90 tracking-tighter">Nutrição • Acupuntura • Farmácia</p>
            </div>

            <nav className="hidden lg:flex items-center gap-1 ml-4 border-l border-emerald-400/30 pl-6">
              <button onClick={() => navigate("/dashboard")} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${isAtivo('/dashboard') ? 'bg-emerald-700/50' : 'hover:bg-emerald-700/30'}`}>
                <Activity size={14} /> Serviços
              </button>
              <button onClick={() => navigate("/agendamento")} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${isAtivo('/agendamento') ? 'bg-emerald-700/50' : 'hover:bg-emerald-700/30'}`}>
                <PlusCircle size={14} /> Agendar Horário
              </button>
              <button onClick={() => navigate("/meus-dados")} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${isAtivo('/meus-dados') ? 'bg-emerald-700/50' : 'hover:bg-emerald-700/30'}`}>
                <ClipboardList size={14} /> Meus Dados
              </button>
            </nav>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setPerfilAberto(!perfilAberto)} className="flex items-center gap-2 bg-[#064e3b] px-3 py-2 rounded-full border border-emerald-400/30">
            <User size={16} />
            <span className="text-xs font-bold">{nomeUsuario.split(/[ @]/)[0]}</span>
            <ChevronDown size={14} className={perfilAberto ? 'rotate-180' : ''} />
          </button>
          {perfilAberto && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
              <button onClick={() => navigate("/perfil")} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2">
                <Settings size={16} className="text-emerald-600" /> Dados da Conta
              </button>
              <button onClick={() => auth.signOut()} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold border-t border-gray-50">
                <LogOut size={16} /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-10 flex flex-col items-center justify-center overflow-y-auto">
        <div className="w-full max-w-[500px] bg-white rounded-[30px] shadow-xl p-6 lg:p-10 border border-emerald-50">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-50 p-3 rounded-2xl"><Calendar className="text-emerald-600" size={24} /></div>
            <h2 className="text-[#064e3b] text-xl lg:text-2xl font-bold">Horários Disponíveis</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {horarios.map((h) => (
              <button key={h} className="py-4 border-2 border-emerald-100 rounded-2xl text-[#059669] font-bold text-lg hover:bg-[#059669] hover:text-white hover:border-[#059669] transition-all shadow-sm active:scale-95">
                {h}
              </button>
            ))}
          </div>
          <button onClick={() => navigate("/dashboard")} className="mt-8 block w-full text-center text-emerald-600 font-bold underline">Voltar para Serviços</button>
        </div>
      </main>

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b bg-[#059669] text-white flex justify-between items-center">
          <span className="font-bold uppercase text-xs tracking-widest">Menu Principal</span>
          <button onClick={() => setMenuAberto(false)}><X size={24} /></button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          <button onClick={() => {navigate("/dashboard"); setMenuAberto(false);}} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${isAtivo('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'}`}>
            <Activity size={18} /> Serviços
          </button>
          <button onClick={() => setMenuAberto(false)} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${isAtivo('/agendamento') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'}`}>
            <PlusCircle size={18} /> Agendar Horário
          </button>
          <button onClick={() => {navigate("/meus-dados"); setMenuAberto(false);}} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${isAtivo('/meus-dados') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'}`}>
            <ClipboardList size={18} /> Meus Dados
          </button>
        </nav>
      </aside>
    </div>
  );
};

export default Agendamento;
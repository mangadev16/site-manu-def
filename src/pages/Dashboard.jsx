import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  User, LogOut, Settings, ChevronDown, Apple, 
  Activity, Thermometer, X, ClipboardList, Milestone, PlusCircle 
} from "lucide-react";

const Dashboard = () => {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nomeUsuario = auth.currentUser?.displayName || "Usuário";

  const isAtivo = (rota) => location.pathname === rota;

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
    };
  }, []);

  const servicos = [
  { 
    id: 1, 
    nome: "Nutrição", 
    desc: "Planos alimentares personalizados.", 
    icon: <Apple className="text-emerald-600" size={24} />,
    path: "/Nutricao" // <--- ADICIONE AQUI
  },
  { 
    id: 2, 
    nome: "Acupuntura", 
    desc: "Equilíbrio e alívio de dores.", 
    icon: <Milestone className="text-emerald-600" size={24} />,
    path: "/Acupuntura" // <--- ADICIONE AQUI
  },
  { 
    id: 3, 
    nome: "Farmácia", 
    desc: "Orientação farmacêutica e fórmulas.", 
    icon: <Thermometer className="text-emerald-600" size={24} />,
    path: "/Farmacia" // <--- ADICIONE AQUI
  },
];

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden overscroll-behavior-none">
      
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

      <main className="flex-1 p-4 lg:p-10 flex flex-col items-center">
        {/* h-full no mobile para distribuir, h-auto no PC para não esticar */}
        <div className="w-full max-w-[1000px] h-full lg:h-auto flex flex-col lg:block">
          
          <h2 className="text-xl lg:text-3xl font-bold text-[#064e3b] mb-4 lg:mb-10 text-left lg:text-center w-full shrink-0">
            Nossos Serviços
          </h2>
          
          {/* GRID: Diferente para Mobile (Vertical/Flex) e PC (Horizontal/Grid) */}
          <div className="flex-1 lg:flex-none flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-8 w-full mb-6 lg:mb-12">
            {servicos.map((s) => (
              
              <div key={s.id} onClick={() => navigate(s.path)} className="flex-1 lg:flex-none bg-white p-5 lg:p-8 rounded-[25px] lg:rounded-[40px] border-2 border-emerald-100 shadow-sm flex flex-row lg:flex-col items-center lg:text-center gap-4 lg:gap-6 hover:shadow-md transition-all">
                
                <div className="bg-emerald-50 w-12 h-12 lg:w-20 lg:h-20 rounded-2xl lg:rounded-[25px] flex items-center justify-center shrink-0 lg:mx-auto">
                  {s.icon}
                </div>
                <div className="flex flex-col lg:items-center">
                  <h3 className="font-bold text-base lg:text-2xl text-gray-800 leading-tight">{s.nome}</h3>
                  <p className="text-gray-500 text-[11px] lg:text-sm leading-tight lg:mt-3 lg:px-2">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate("/agendamento")} 
            className="w-full lg:max-w-[320px] py-4 lg:py-5 bg-[#059669] text-white rounded-2xl lg:rounded-3xl font-bold text-lg shadow-lg active:scale-95 transition-all lg:mx-auto block shrink-0"
          >
            Agendar agora
          </button>
        </div>
      </main>

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b bg-[#059669] text-white flex justify-between items-center">
          <span className="font-bold uppercase text-xs tracking-widest">Menu Principal</span>
          <button onClick={() => setMenuAberto(false)}><X size={24} /></button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          <button onClick={() => setMenuAberto(false)} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${isAtivo('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'}`}>
            <Activity size={18} /> Serviços
          </button>
          <button onClick={() => {navigate("/agendamento"); setMenuAberto(false);}} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${isAtivo('/agendamento') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'}`}>
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

export default Dashboard;
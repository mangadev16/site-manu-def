import React, { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Calendar, Settings, ChevronDown, Apple, Activity, Thermometer, X, ClipboardList, LineChart } from "lucide-react";

const Dashboard = () => {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState('servicos'); 
  const navigate = useNavigate();
  const nomeUsuario = auth.currentUser?.displayName || "Usuário";

  const servicos = [
    { id: 1, nome: "Nutrição", desc: "Planos alimentares personalizados.", icon: <Apple className="text-emerald-600" /> },
    { id: 2, nome: "Acupuntura", desc: "Equilíbrio e alívio de dores.", icon: <ineChart className="text-emerald-600" /> },
    { id: 3, nome: "Farmácia", desc: "Orientação farmacêutica e fórmulas.", icon: <Thermometer className="text-emerald-600" /> },
  ];

  return (
    // h-screen e overflow-hidden para a tela não rolar inteira
    <div className="h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">
      
      {menuAberto && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMenuAberto(false)} />}

      {/* HEADER FIXO */}
      <header className="bg-[#059669] text-white p-4 flex justify-between items-center shadow-md z-50 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuAberto(true)} className="bg-white text-[#059669] font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md">
            MB
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none">MANUELA BERNARDO</h1>
            <p className="text-[10px] uppercase opacity-90 tracking-tighter">Nutrição • Acupuntura • Farmácia</p>
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

      {/* CONTEÚDO: Ajustado para não esticar na largura e altura */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1000px]"> {/* Limita a largura para não esticar no monitor todo */}
          {secaoAtiva === 'servicos' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#064e3b]">Nossos Serviços</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicos.map((s) => (
                  <div key={s.id} className="bg-white p-6 rounded-[25px] shadow-sm border border-emerald-50">
                    <div className="mb-4">{s.icon}</div>
                    <h3 className="font-bold text-lg text-gray-800">{s.nome}</h3>
                    <p className="text-gray-500 text-sm mt-2">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* Botão largo mas dentro do limite do container */}
              <button 
                onClick={() => setSecaoAtiva('agendar')} 
                className="w-full max-w-[400px] py-4 bg-[#059669] text-white rounded-2xl font-bold text-xl shadow-lg mt-4 active:scale-95 transition-all block"
              >
                Agendar agora
              </button>
            </div>
          ) : (
            <div className="max-w-[600px] bg-white rounded-[30px] shadow-xl p-8 border border-emerald-50">
               <h2 className="text-[#064e3b] text-2xl font-bold mb-8">Horários Disponíveis</h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map(h => (
                     <button key={h} className="py-4 border-2 border-emerald-50 rounded-2xl text-[#059669] font-bold hover:bg-[#059669] hover:text-white transition-all shadow-sm">
                      {h}
                     </button>
                  ))}
               </div>
               <button onClick={() => setSecaoAtiva('servicos')} className="mt-8 block text-emerald-600 font-bold underline">Voltar para Serviços</button>
            </div>
          )}
        </div>
      </main>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b bg-[#059669] text-white flex justify-between items-center">
          <span className="font-bold uppercase text-xs tracking-widest">Menu Principal</span>
          <button onClick={() => setMenuAberto(false)}><X size={24} /></button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          <button onClick={() => {setSecaoAtiva('servicos'); setMenuAberto(false);}} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${secaoAtiva === 'servicos' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'}`}>
            <Activity size={18} /> Serviços
          </button>
          <button onClick={() => {navigate("/meus-dados"); setMenuAberto(false);}} className="p-4 rounded-xl text-left font-bold flex items-center gap-3 text-gray-600 hover:bg-emerald-50">
            <ClipboardList size={18} className="text-emerald-600" /> Meus Dados
          </button>
        </nav>
      </aside>
    </div>
  );
};

export default Dashboard;
import React, { useState } from "react";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  User, LogOut, X, ClipboardList, PlusCircle, PhoneCall, 
  Apple, Sparkles, Activity, ShieldCheck, ChevronRight, Menu, HelpCircle
} from "lucide-react";

const Dashboard = () => {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nomeCompleto = auth.currentUser?.displayName || "Cliente";
  const nomeUsuario = nomeCompleto.includes("|") 
    ? nomeCompleto.split("|")[0] 
    : nomeCompleto;

  const isAtivo = (rota) => location.pathname === rota;

  // Definição Estrita da Paleta de Lilás/Roxos da Imagem
  const ROXO_DESTAQUE = "#a090c9";     // Lilás Principal / Místico
  const ROXO_PROFUNDO = "#4c3e70";     // Roxo Escuro / Ameixa Nobre
  const LILAS_SUAVE = "#f2effa";       // Fundo Lilás bem claro
  const TEXTO_LILAS = "#61528a";       // Lilás intermediário

  const servicos = [
    {
      id: 1,
      nome: "Nutrição Clínica Integrativa",
      descricao: "Planos alimentares personalizados com foco em longevidade, reequilíbrio metabólico e melhora da performance física e mental.",
      icone: <Apple size={28} style={{ color: ROXO_PROFUNDO }} />,
      duracao: "60 min",
      preco: "R$ 180,00",
      tag: "Mais Procurado"
    },
    {
      id: 2,
      nome: "Acupuntura Tradicional Chinesa",
      descricao: "Tratamento focado no alívio de dores crónicas, redução drástica de ansiedade, regulação do sono e equilíbrio energético do corpo.",
      icone: <Sparkles size={28} style={{ color: ROXO_PROFUNDO }} />,
      duracao: "50 min",
      preco: "R$ 150,00",
      tag: "Equilíbrio"
    },
    {
      id: 3,
      nome: "Farmácia Clínica & Fitoterapia",
      descricao: "Análise minuciosa de interações medicamentosas, prescrição personalizada de fitoterápicos e suplementos de alta performance.",
      icone: <Activity size={28} style={{ color: ROXO_PROFUNDO }} />,
      duracao: "45 min",
      preco: "R$ 160,00",
      tag: "Saúde Integral"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-100 px-4 lg:px-8 py-4 sticky top-0 z-40 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuAberto(true)} className="lg:hidden p-1 text-slate-600 hover:text-slate-900">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: LILAS_SUAVE }}>
              <Sparkles size={18} style={{ color: TEXTO_LILAS }} />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">
              Espaço <span style={{ color: ROXO_PROFUNDO }}>Vitalidade</span>
            </span>
          </div>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
          <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all" style={{ backgroundColor: ROXO_PROFUNDO, color: "white" }}>Serviços</button>
          <button onClick={() => navigate("/agendamento")} className="px-4 py-2 rounded-lg font-bold text-xs text-slate-600 uppercase tracking-wider transition-all hover:bg-white">Agendar</button>
          <button onClick={() => navigate("/meus-dados")} className="px-4 py-2 rounded-lg font-bold text-xs text-slate-600 uppercase tracking-wider transition-all hover:bg-white">Meus Dados</button>
        </nav>

        {/* Perfil do Usuário */}
        <div className="relative">
          <button onClick={() => setPerfilAberto(!perfilAberto)} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs uppercase" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}>
              {nomeUsuario.slice(0, 2)}
            </div>
            <span className="hidden sm:inline font-bold text-xs text-slate-700">Olá, {nomeUsuario}</span>
          </button>

          {perfilAberto && (
            <>
              <div onClick={() => setPerfilAberto(false)} className="fixed inset-0 z-40" />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-scale-up">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="font-black text-slate-900 text-xs truncate">{nomeCompleto}</p>
                  <p className="text-[10px] text-slate-400 truncate">{auth.currentUser?.email}</p>
                </div>
                <button onClick={() => { auth.signOut(); navigate("/login"); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition">
                  <LogOut size={14} /> Sair do Painel
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* SIDEBAR MOBILE */}
      {menuAberto && (
        <>
          <div onClick={() => setMenuAberto(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden" />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col justify-between shadow-2xl p-4 lg:hidden animate-fade-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="font-black text-xs uppercase tracking-wider text-slate-400">Menu Principal</span>
                <button onClick={() => setMenuAberto(false)} className="p-1 text-slate-400 hover:text-slate-700"><X size={22} /></button>
              </div>
              <nav className="space-y-1.5">
                <button onClick={() => { navigate("/dashboard"); setMenuAberto(false); }} className="w-full p-3.5 rounded-xl text-left font-black text-xs uppercase tracking-wider flex items-center gap-3 transition-all" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}><Sparkles size={16} /> Nossos Serviços</button>
                <button onClick={() => { navigate("/agendamento"); setMenuAberto(false); }} className="w-full p-3.5 rounded-xl text-left font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-all"><PlusCircle size={16} /> Agendar Consulta</button>
                <button onClick={() => { navigate("/meus-dados"); setMenuAberto(false); }} className="w-full p-3.5 rounded-xl text-left font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-all"><ClipboardList size={16} /> Meus Dados & Histórico</button>
              </nav>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <button onClick={() => { auth.signOut(); navigate("/login"); }} className="w-full p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"><LogOut size={15} /> Sair da Conta</button>
            </div>
          </aside>
        </>
      )}

      {/* CONTEÚDO PRINCIPAL (LANDING DE SERVIÇOS) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-8 lg:space-y-12">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl p-6 lg:p-12 border border-slate-100 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6" style={{ background: `linear-gradient(135deg, ${ROXO_PROFUNDO} 0%, #32254f 100%)` }}>
          <div className="space-y-3 lg:space-y-4 max-w-2xl text-white">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/90" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <ShieldCheck size={12} style={{ color: ROXO_DESTAQUE }} /> Atendimento Profissional Certificado
            </span>
            <h2 className="text-2xl lg:text-4xl font-black tracking-tight leading-tight">
              Cuidado integral e exclusivo para a sua saúde e bem-estar.
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm font-medium leading-relaxed">
              Selecione abaixo a especialidade desejada para explorar os tratamentos disponíveis e reservar o seu horário com total comodidade em nossa plataforma.
            </p>
          </div>
          <button onClick={() => navigate("/agendamento")} className="w-full lg:w-auto px-6 py-4 bg-white text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
            Agendar Agora <ChevronRight size={16} style={{ color: TEXTO_LILAS }} />
          </button>
        </section>

        {/* SECTION SELECTION (SERVIÇOS CHAMATIVOS) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200/60 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: TEXTO_LILAS }}>Especialidades Disponíveis</p>
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight mt-0.5">Explore Nossos Serviços</h3>
            </div>
            <p className="text-xs text-slate-400 font-medium">Todos os tratamentos incluem avaliação inicial completa.</p>
          </div>

          {/* GRID DE SERVIÇOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicos.map((serv) => (
              <div 
                key={serv.id} 
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 relative"
              >
                {/* Badge Superior */}
                <div className="absolute top-4 right-4">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}>
                    {serv.tag}
                  </span>
                </div>

                <div className="p-5 lg:p-6 space-y-4">
                  {/* Ícone */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: LILAS_SUAVE }}>
                    {serv.icone}
                  </div>

                  {/* Textos */}
                  <div className="space-y-1.5">
                    <h4 className="font-black text-base text-slate-900 tracking-tight leading-snug group-hover:text-slate-800 transition">
                      {serv.nome}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {serv.descricao}
                    </p>
                  </div>
                </div>

                {/* Detalhes de Rodapé e Ação */}
                <div className="px-5 lg:px-6 pb-5 pt-3 border-t border-slate-50 bg-slate-50/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold flex items-center gap-1">Dur.: <strong className="text-slate-600 font-extrabold">{serv.duracao}</strong></span>
                    <span className="font-black text-base" style={{ color: ROXO_PROFUNDO }}>{serv.preco}</span>
                  </div>
                  <button 
                    onClick={() => navigate("/agendamento")}
                    className="w-full py-3 bg-white hover:text-white border border-slate-200 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group-hover:border-transparent"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ROXO_PROFUNDO; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "inherit"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  >
                    Agendar Esta Especialidade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ OU INFO ADICIONAL */}
        <footer className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 rounded-lg mt-0.5 text-slate-500"><PhoneCall size={16} /></div>
            <div>
              <h5 className="font-black text-xs text-slate-900 tracking-tight">Precisa de suporte personalizado?</h5>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Entre em contacto direto pelo nosso WhatsApp para tirar dúvidas sobre indicações ou tratamentos.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 md:border-l md:border-slate-100 md:pl-6">
            <div className="p-2 bg-slate-100 rounded-lg mt-0.5 text-slate-500"><HelpCircle size={16} /></div>
            <div>
              <h5 className="font-black text-xs text-slate-900 tracking-tight">Como funcionam os retornos?</h5>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Poderá consultar a validade e a necessidade de agendamento de retornos na secção "Meus Dados" após a primeira consulta.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
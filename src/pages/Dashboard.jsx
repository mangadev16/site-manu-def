import React, { useState } from "react";
import { auth } from "../firebase";
import { User, LogOut, X, Apple, Activity, Thermometer, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  // Define qual seção exibir: 'servicos' ou 'agendar'
  const [secaoAtiva, setSecaoAtiva] = useState('servicos'); 
  const nomeUsuario = auth.currentUser?.displayName || auth.currentUser?.email;
  const navigate = useNavigate();

  const servicos = [
    { id: 1, nome: "Nutrição", desc: "Planos alimentares personalizados.", icon: <Apple className="text-emerald-600" /> },
    { id: 2, nome: "Acupuntura", desc: "Equilíbrio e alívio de dores.", icon: <Activity className="text-emerald-600" /> },
    { id: 3, nome: "Farmácia", desc: "Orientação farmacêutica e fórmulas.", icon: <Thermometer className="text-emerald-600" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden">
      {/* OVERLAY */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* ABA LATERAL ESQUERDA */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden ${menuAberto ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 border-b bg-[#059669] text-white flex justify-between items-center">
          <span className="font-bold">Menu</span>
          <button onClick={() => setMenuAberto(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          <button
            onClick={() => {
              setSecaoAtiva("servicos");
              setMenuAberto(false);
            }}
            className={`p-4 rounded-xl text-left font-semibold ${secaoAtiva === "servicos" ? "bg-emerald-50 text-emerald-700" : ""}`}
          >
            Serviços
          </button>
          <button
            onClick={() => {
              setSecaoAtiva("agendar");
              setMenuAberto(false);
            }}
            className={`p-4 rounded-xl text-left font-semibold ${secaoAtiva === "agendar" ? "bg-emerald-600 text-white" : ""}`}
          >
            Agendar Consulta
          </button>
          <button
            onClick={() => navigate("/meus-dados")}
            className="p-4 rounded-xl text-left font-semibold hover:bg-emerald-50"
          >
            Meus Dados
          </button>
          <div className="mt-8 pt-8 border-t">
            <button
              onClick={() => auth.signOut()}
              className="flex items-center gap-3 p-4 text-red-500 font-bold w-full"
            >
              <LogOut size={20} /> Sair
            </button>
          </div>
        </nav>
      </aside>

      {/* HEADER */}
      <header className="bg-[#059669] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuAberto(true)}
            className="bg-white text-[#059669] font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md lg:cursor-default"
          >
            MB
          </button>
          <div>
            <h1 className="font-bold text-sm md:text-base leading-none">
              MANUELA BERNARDO
            </h1>
            <p className="text-[10px] uppercase opacity-90">
              Nutrição • Acupuntura • Farmácia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex gap-4 text-sm font-medium">
            <button
              onClick={() => setSecaoAtiva("servicos")}
              className="hover:underline"
            >
              Serviços
            </button>
            <button
              onClick={() => setSecaoAtiva("agendar")}
              className="bg-[#064e3b] px-3 py-1 rounded-md"
            >
              Agendar
            </button>

            <button
              onClick={() => navigate("/meus-dados")}
              className="hover:underline"
            >
              Meus Dados
            </button>
          </nav>
          <div className="flex items-center gap-2 bg-[#064e3b] px-3 py-2 rounded-full">
            <User size={16} />
            <span className="text-xs font-bold">
              {nomeUsuario?.split(/[ @]/)[0]}
            </span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO DINÂMICO */}
      <main className="max-w-4xl mx-auto mt-8 p-6">
        {secaoAtiva === "servicos" ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#064e3b]">
              Nossos Serviços
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {servicos.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-6 rounded-[25px] shadow-sm border border-emerald-50 hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">{s.icon}</div>
                  <h3 className="font-bold text-lg text-gray-800">{s.nome}</h3>
                  <p className="text-gray-500 text-sm mt-2">{s.desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSecaoAtiva("agendar")}
              className="w-full py-4 bg-[#059669] text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              <Calendar size={20} /> Agendar agora
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[30px] shadow-xl p-8 text-center border border-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#059669]"></div>
            <h2 className="text-[#064e3b] text-2xl font-bold mb-2">
              Agendamento
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Olá, {nomeUsuario?.split(/[ @]/)[0]}! Escolha um horário:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["09:00", "10:00", "11:00", "14:00", "15:00"].map((hora) => (
                <button
                  key={hora}
                  className="py-4 border-2 border-emerald-50 rounded-2xl text-[#059669] font-bold hover:bg-[#059669] hover:text-white transition-all shadow-sm"
                >
                  {hora}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSecaoAtiva("servicos")}
              className="mt-8 text-sm text-emerald-600 font-bold underline"
            >
              Voltar para Serviços
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
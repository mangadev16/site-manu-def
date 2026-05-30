import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import {
  User, LogOut, Settings, ChevronDown, Activity,
  PlusCircle, ClipboardList, PhoneCall, X, UserCircle2
} from "lucide-react";

const Header = ({ nomeUsuario }) => {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAtivo = (rota) => location.pathname === rota;

  const navLinks = [
    { path: "/manuela", icon: <UserCircle2 size={14} />, label: "Manuela" },
    { path: "/dashboard", icon: <Activity size={14} />, label: "Serviços" },
    { path: "/agendamento", icon: <PlusCircle size={14} />, label: "Agendar Horário" },
    { path: "/meus-dados", icon: <ClipboardList size={14} />, label: "Meus Dados" },
    { path: "/contatos", icon: <PhoneCall size={14} />, label: "Contatos" },
  ];

  const navLinksMobile = [
    { path: "/manuela", icon: <UserCircle2 size={18} />, label: "Manuela" },
    { path: "/dashboard", icon: <Activity size={18} />, label: "Serviços" },
    { path: "/agendamento", icon: <PlusCircle size={18} />, label: "Agendar Horário" },
    { path: "/meus-dados", icon: <ClipboardList size={18} />, label: "Meus Dados" },
    { path: "/contatos", icon: <PhoneCall size={18} />, label: "Contatos" },
  ];

  return (
    <>
      {menuAberto && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuAberto(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ${menuAberto ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b bg-[#059669] text-white flex justify-between items-center">
          <span className="font-bold uppercase text-xs tracking-widest">Menu Principal</span>
          <button onClick={() => setMenuAberto(false)}><X size={24} /></button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          {navLinksMobile.map(({ path, icon, label }) => (
            <button key={path} onClick={() => { navigate(path); setMenuAberto(false); }}
              className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${isAtivo(path) ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}>
              {icon} {label}
            </button>
          ))}
        </nav>
      </aside>

      <header className="bg-[#059669] text-white shadow-md z-50 shrink-0" style={{ overflow: "visible", position: "relative" }}>
        <div className="flex items-center justify-between px-4 py-2 lg:px-6" style={{ overflow: "visible" }}>

          <div className="flex items-center gap-3" style={{ overflow: "visible" }}>

            <button
              onClick={() => { if (window.innerWidth < 1024) setMenuAberto(true); }}
              className="shrink-0 lg:cursor-default"
              aria-label="Abrir menu"
              style={{
                background: "none", border: "none", padding: 0,
                width: "56px", height: "40px",
                position: "relative", overflow: "visible",
              }}
            >
              <img
                src="/logotransparente1.png"
                alt="Manu"
                style={{
                  height: "38px",
                  width: "auto",
                  objectFit: "contain",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            </button>

            <div className="flex flex-col leading-tight">
              <span className="font-black text-sm lg:text-base uppercase tracking-tight text-white">
                Manuela Bernardo
              </span>
              <span className="text-[9px] lg:text-[10px] uppercase opacity-80 tracking-wider">
                Nutrição • Farmácia • Acupuntura
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-1 ml-6 border-l border-emerald-400/30 pl-6">
              {navLinks.map(({ path, icon, label }) => (
                <button key={path} onClick={() => navigate(path)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${isAtivo(path) ? "bg-emerald-700/50" : "hover:bg-emerald-700/30"}`}>
                  {icon} {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="relative">
            <button onClick={() => setPerfilAberto(!perfilAberto)}
              className="flex items-center gap-2 bg-emerald-700/40 border border-emerald-500/30 px-3 py-2 rounded-xl hover:bg-emerald-700/60 transition-all">
              <User size={15} />
              <span className="text-xs font-bold hidden sm:inline">{nomeUsuario}</span>
              <ChevronDown size={13} className={`transition-transform ${perfilAberto ? "rotate-180" : ""}`} />
            </button>
            {perfilAberto && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                <button onClick={() => { navigate("/perfil"); setPerfilAberto(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2">
                  <Settings size={16} className="text-emerald-600" /> Dados da Conta
                </button>
                <button onClick={() => auth.signOut()}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold border-t border-gray-50">
                  <LogOut size={16} /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
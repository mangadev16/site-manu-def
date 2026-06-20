import React, { useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Apple, Thermometer, PenLine } from "lucide-react";
import Header from "./Header";
import { useProtectedAction } from "../hooks/useProtectedAction";
import ModalLoginPrompt from "../components/ModalLoginPrompt";

const Dashboard = () => {
  const navigate = useNavigate();
  const nomeCompleto = auth.currentUser?.displayName || "Visitante";
  const nomeUsuario = nomeCompleto.includes("|") ? nomeCompleto.split("|")[0] : nomeCompleto;

  const { showModal, setShowModal, modalConfig, executeProtectedAction, confirmLogin } = useProtectedAction();

  const MSG_LOGIN = {
    title: "Login necessário",
    message: "Para agendar uma consulta você precisa estar logado. Leva menos de 1 minuto!",
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
    };
  }, []);

  const servicos = [
    { id: 1, nome: "Nutrição",   desc: "Planos alimentares personalizados.", icon: <Apple className="text-emerald-600" size={24} />,        path: "/nutricao" },
    { id: 2, nome: "Acupuntura", desc: "Equilíbrio e alívio de dores.",       icon: <PenLine className="text-emerald-600" size={24} />,      path: "/acupuntura" },
    { id: 3, nome: "Farmácia",   desc: "Orientação farmacêutica e fórmulas.", icon: <Thermometer className="text-emerald-600" size={24} />,  path: "/farmacia" },
  ];

  return (
    <>
      <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col">
        <Header nomeUsuario={nomeUsuario} />

        <main className="flex-1 overflow-hidden flex flex-col p-4 lg:p-10 items-center">
          <div className="w-full max-w-[1000px] flex flex-col h-full">
            <h2 className="text-xl lg:text-3xl font-bold text-[#064e3b] mb-4 lg:mb-10 text-left lg:text-center shrink-0">
              Nossos Serviços
            </h2>

            <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-8 w-full">
              {servicos.map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate(s.path)}
                  className="flex-1 min-h-0 bg-white rounded-[25px] lg:rounded-[40px] border-2 border-emerald-100 shadow-sm flex flex-row lg:flex-col items-center lg:justify-center lg:text-center gap-4 lg:gap-6 px-5 lg:p-8 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="bg-emerald-50 w-12 h-12 lg:w-20 lg:h-20 rounded-2xl lg:rounded-[25px] flex items-center justify-center shrink-0 lg:mx-auto">
                    {s.icon}
                  </div>
                  <div className="flex flex-col lg:items-center min-w-0">
                    <h3 className="font-bold text-base lg:text-2xl text-gray-800">{s.nome}</h3>
                    <p className="text-gray-500 text-[11px] lg:text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => executeProtectedAction(() => navigate("/agendamento"), MSG_LOGIN)}
              className="w-full lg:max-w-[320px] py-4 lg:py-5 bg-[#059669] text-white rounded-2xl lg:rounded-3xl font-bold text-lg shadow-lg active:scale-95 transition-all lg:mx-auto mt-4 shrink-0"
            >
              Agendar agora
            </button>
          </div>
        </main>
      </div>

      <ModalLoginPrompt
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmLogin}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </>
  );
};

export default Dashboard;
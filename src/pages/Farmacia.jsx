import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Thermometer, CheckCircle2, Calendar } from "lucide-react";

const Farmacia = () => {
  const navigate = useNavigate();

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
    "Orientação farmacêutica personalizada.",
    "Fórmulas magistrais e suplementação.",
    "Análise de interações medicamentosas.",
    "Acompanhamento de tratamentos."
  ];

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden overscroll-behavior-none">
      
      <header className="bg-[#059669] text-white p-4 flex items-center gap-4 shadow-md z-50 shrink-0">
        <button 
          onClick={() => navigate("/dashboard")}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="font-bold text-lg uppercase tracking-tight">Farmácia</h1>
          <p className="text-[10px] uppercase opacity-90 tracking-widest text-emerald-100">Cuidado Especializado</p>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-10 flex flex-col items-center overflow-hidden">
        <div className="w-full max-w-[800px] h-full flex flex-col">
          
          <div className="flex-1 min-h-0 bg-white rounded-[30px] lg:rounded-[40px] border-2 border-emerald-100 shadow-sm flex flex-col overflow-hidden">
            
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-6">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="bg-emerald-50 w-20 h-20 rounded-[25px] flex items-center justify-center mb-4">
                  <Thermometer className="text-emerald-600" size={40} />
                </div>
                <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 leading-tight">Farmácia Clínica</h2>
              </div>

              <p className="text-gray-500 text-sm lg:text-lg leading-relaxed">
                Garantimos o uso seguro e eficaz de medicamentos e suplementos, focando na otimização dos seus resultados terapêuticos.
              </p>
              
              <div className="space-y-3">
                {servicos.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                    <span className="text-sm lg:text-base text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate("/agendamento")} 
            className="w-full py-4 bg-[#059669] text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all mt-4 mb-2 shrink-0 flex items-center justify-center gap-3"
          >
            <Calendar size={20} /> Agendar Agora
          </button>
        </div>
      </main>
    </div>
  );
};

export default Farmacia;
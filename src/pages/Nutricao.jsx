import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Apple, CheckCircle2, Calendar, Target } from "lucide-react";

const Nutricao = () => {
  const navigate = useNavigate();

  // Trava de Scroll Mobile (consistente com o Dashboard)
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

  const beneficios = [
    "Planos alimentares 100% personalizados.",
    "Avaliação de composição corporal.",
    "Acompanhamento focado em resultados reais.",
    "Reeducação alimentar sem dietas restritivas."
  ];

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden overscroll-behavior-none">
      
      {/* HEADER COM BOTÃO VOLTAR */}
      <header className="bg-[#059669] text-white p-4 flex items-center gap-4 shadow-md z-50 shrink-0">
        <button 
          onClick={() => navigate("/dashboard")}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="font-bold text-lg uppercase tracking-tight">Nutrição</h1>
          <p className="text-[10px] uppercase opacity-90 tracking-widest text-emerald-100">Detalhes do Serviço</p>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-10 flex flex-col items-center">
        <div className="w-full max-w-[1000px] h-full lg:h-auto flex flex-col justify-between lg:justify-start">
          
          {/* CARD PRINCIPAL - No mobile cresce para ocupar o espaço */}
          <div className="flex-1 lg:flex-none bg-white rounded-[30px] lg:rounded-[40px] p-6 lg:p-12 border-2 border-emerald-100 shadow-sm flex flex-col lg:flex-row gap-6 lg:gap-12 items-center lg:items-start transition-all">
            
            {/* ÍCONE E TÍTULO */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
              <div className="bg-emerald-50 w-20 h-20 lg:w-32 lg:h-32 rounded-[25px] lg:rounded-[35px] flex items-center justify-center mb-4 shadow-inner">
                <Apple className="text-emerald-600" size={window.innerWidth < 1024 ? 40 : 64} />
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-800">Nutrição Clínica</h2>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase mt-2 tracking-wider">
                Saúde & Bem-Estar
              </span>
            </div>

            {/* DESCRIÇÃO E BENEFÍCIOS */}
            <div className="flex-1 flex flex-col justify-center lg:pt-4">
              <p className="text-gray-500 text-sm lg:text-lg leading-relaxed mb-6">
                Desenvolvemos estratégias nutricionais específicas para os seus objetivos, 
                seja emagrecimento, hipertrofia ou tratamento de patologias, respeitando a sua individualidade.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {beneficios.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                    <span className="text-xs lg:text-base text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTÃO DE AÇÃO NA BASE */}
          <button 
            onClick={() => navigate("/agendamento")} 
            className="w-full lg:max-w-[400px] py-4 lg:py-5 bg-[#059669] text-white rounded-2xl lg:rounded-3xl font-bold text-lg shadow-lg active:scale-95 transition-all lg:mx-auto mt-6 shrink-0 flex items-center justify-center gap-3"
          >
            <Calendar size={20} />
            Agendar Consulta
          </button>
          
        </div>
      </main>
    </div>
  );
};

export default Nutricao;
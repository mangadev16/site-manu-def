import React from "react";
import { useNavigate } from "react-router-dom";
import { X, ClipboardList, ArrowRight, Clock, ShieldCheck, ChevronRight } from "lucide-react";

/**
 * Props:
 *  isOpen   — boolean
 *  onClose  — fecha sem fazer nada
 */
const ModalPreConsulta = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const itens = [
    { icon: <Clock size={14} />, texto: "Leva cerca de 5 minutos" },
    { icon: <ShieldCheck size={14} />, texto: "Suas respostas são confidenciais" },
    { icon: <ClipboardList size={14} />, texto: "Só precisa responder uma vez" },
  ];

  return (
    <>
      <style>{`
        @keyframes pcFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pcSlideUp { from { opacity: 0; transform: translateY(20px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        .pc-backdrop { animation: pcFadeIn  .2s ease forwards }
        .pc-card     { animation: pcSlideUp .25s ease forwards }
      `}</style>

      {/* Backdrop */}
      <div
        className="pc-backdrop fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4"
        style={{ background: "rgba(4,24,16,.55)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        {/* Card */}
        <div
          className="pc-card w-full sm:max-w-[360px] bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Topo ── */}
          <div className="relative px-6 pt-7 pb-6">
            {/* Fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X size={15} className="text-gray-500" />
            </button>

            {/* Ícone */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
              <ClipboardList size={24} className="text-emerald-600" />
            </div>

            <h2 className="text-[17px] font-black text-gray-900 leading-snug mb-1">
              Antes de agendar,<br />precisamos te conhecer
            </h2>
            <p className="text-gray-400 text-[13px] leading-relaxed">
              Responda o questionário de pré-consulta para que a Manuela possa se preparar melhor para o seu atendimento.
            </p>
          </div>

          {/* ── Itens ── */}
          <div className="px-6 pb-2 space-y-2">
            {itens.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                <span className="text-emerald-500">{item.icon}</span>
                <span className="text-[13px] font-semibold text-gray-700">{item.texto}</span>
              </div>
            ))}
          </div>

          {/* ── Ações ── */}
          <div className="px-6 py-5 space-y-2">
            <button
              onClick={() => { onClose(); navigate("/pre-consulta"); }}
              className="w-full flex items-center justify-between bg-[#059669] hover:bg-emerald-700 text-white font-bold px-5 py-3.5 rounded-2xl text-[13px] transition-all active:scale-95 shadow-md shadow-emerald-200"
            >
              <span>Preencher agora</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-400 hover:text-gray-600 font-semibold py-2.5 text-[13px] transition-colors"
            >
              Fazer depois
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalPreConsulta;
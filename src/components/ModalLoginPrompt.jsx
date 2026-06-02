import React, { useEffect } from "react";
import { X, LogIn, Lock, ArrowRight } from "lucide-react";

/**
 * Props:
 *  isOpen    — boolean
 *  onClose   — fecha o modal
 *  onConfirm — vai para /login
 *  title     — título customizável (opcional)
 *  message   — mensagem customizável (opcional)
 */
const ModalLoginPrompt = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Acesso necessário",
  message = "Para continuar você precisa estar logado. Deseja ir para a tela de login?",
}) => {
  /* Bloqueia scroll do body enquanto o modal está aberto */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .modal-backdrop { animation: modalFadeIn 0.2s ease forwards; }
        .modal-card     { animation: modalSlideUp 0.25s ease forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4"
        style={{ background: "rgba(6, 40, 30, 0.65)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        {/* Card */}
        <div
          className="modal-card w-full sm:max-w-sm bg-white sm:rounded-[28px] rounded-t-[28px] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Topo verde com ícone */}
          <div
            className="relative flex flex-col items-center justify-center pt-8 pb-6 px-6"
            style={{ background: "linear-gradient(135deg, #3a6448 0%, #508461 100%)" }}
          >
            {/* Padrão Vector sutil */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url('/Vector.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "1878px 1080px",
                opacity: 0.15,
              }}
            />

            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full p-1.5 transition-all"
            >
              <X size={16} className="text-white" />
            </button>

            {/* Ícone central */}
            <div className="relative z-10 w-14 h-14 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Lock size={26} className="text-[#c8f564]" />
            </div>

            <h3 className="relative z-10 font-black text-xl text-white text-center leading-tight">
              {title}
            </h3>
          </div>

          {/* Corpo */}
          <div className="px-6 py-6">
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-6">
              {message}
            </p>

            <div className="flex flex-col gap-3">
              {/* CTA principal */}
              <button
                onClick={onConfirm}
                className="w-full flex items-center justify-center gap-2 bg-[#059669] hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 text-sm"
              >
                <LogIn size={16} />
                Fazer login
                <ArrowRight size={14} />
              </button>

              {/* Cancelar */}
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center text-gray-400 hover:text-gray-600 font-semibold py-2.5 rounded-2xl text-sm transition-all hover:bg-gray-50"
              >
                Agora não
              </button>
            </div>

            {/* Rodapé sutil */}
            <p className="text-center text-[10px] text-gray-300 mt-4 font-medium">
              Ainda não tem conta?{" "}
              <button
                onClick={onConfirm}
                className="text-emerald-500 font-bold hover:underline"
              >
                Cadastre-se grátis
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalLoginPrompt;
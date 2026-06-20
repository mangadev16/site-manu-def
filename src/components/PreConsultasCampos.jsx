import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import CamposPreConsulta, { SECOES, estadoInicialPreConsulta } from "../components/PreConsultaCampos";

/* ─── Componente principal ─────────────────────────────────────── */
const PreConsulta = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [secao, setSecao] = useState(0);
  const [form, setForm] = useState(estadoInicialPreConsulta);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [jaRespondeu, setJaRespondeu] = useState(false);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getDoc(doc(db, "preConsulta", user.uid)).then((snap) => {
      if (snap.exists()) setJaRespondeu(true);
    });
  }, [user]);

  const enviar = async () => {
    setEnviando(true);
    try {
      await setDoc(doc(db, "preConsulta", user.uid), {
        ...form,
        uid: user.uid,
        nome: user.displayName?.split("|")[0] || "",
        email: user.email,
        telefone: user.displayName?.split("|")[1] || "",
        enviadoEm: new Date(),
      });
      setEnviado(true);
    } catch (e) {
      console.error(e);
    } finally {
      setEnviando(false);
    }
  };

  /* ── Tela de conclusão ────────── */
  if (enviado || jaRespondeu) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-white rounded-[30px] p-10 max-w-sm w-full shadow-xl border border-emerald-100">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            {jaRespondeu && !enviado ? "Já respondido!" : "Enviado com sucesso!"}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {jaRespondeu && !enviado
              ? "Você já preencheu o questionário de pré-consulta. Pode prosseguir com o agendamento."
              : "Suas respostas foram salvas. A Manuela vai analisar antes da sua consulta."}
          </p>
          <button
            onClick={() => navigate("/agendamento")}
            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-emerald-700 transition-all"
          >
            Ir para o Agendamento →
          </button>
        </div>
      </div>
    );
  }

  const progresso = Math.round(((secao) / SECOES.length) * 100);

  return (
    <div className="fixed inset-0 bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#059669] text-white px-4 py-3 flex items-center gap-4 shadow-md shrink-0">
        <button
          onClick={() => (secao === 0 ? navigate(-1) : setSecao(secao - 1))}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={14} className="text-emerald-200" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
              Pré-consulta • {secao + 1}/{SECOES.length}
            </span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c8f564] rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </header>

      {/* Conteúdo com scroll */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <h2 className="text-xl font-black text-[#064e3b]">{SECOES[secao]}</h2>

          <CamposPreConsulta secao={secao} form={form} set={set} />
        </div>
      </main>

      {/* Botão de navegação fixo na base */}
      <div className="shrink-0 px-4 py-4 bg-white border-t border-gray-100 shadow-sm">
        {secao < SECOES.length - 1 ? (
          <button
            onClick={() => setSecao(secao + 1)}
            className="w-full flex items-center justify-center gap-2 bg-[#059669] text-white font-bold py-4 rounded-2xl text-sm shadow-lg active:scale-95 transition-all"
          >
            Próximo <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-[#059669] text-white font-bold py-4 rounded-2xl text-sm shadow-lg active:scale-95 transition-all disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar questionário ✓"}
          </button>
        )}
      </div>
    </div>
  );
};

export default PreConsulta;
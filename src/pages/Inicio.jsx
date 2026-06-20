import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Apple, Thermometer, PenLine, ArrowRight, Star, Heart, ShieldCheck, CalendarCheck } from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useProtectedAction } from "../hooks/useProtectedAction";
import ModalLoginPrompt from "../components/ModalLoginPrompt";
import ModalPreConsulta from "../components/ModalPreConsulta";

const MSG_LOGIN = {
  title: "Login necessário",
  message: "Para agendar uma consulta você precisa estar logado. Leva menos de 1 minuto!",
};

const Inicio = () => {
  const navigate = useNavigate();
  const { showModal, setShowModal, modalConfig, executeProtectedAction, confirmLogin } = useProtectedAction();
  const [showPreConsulta, setShowPreConsulta] = useState(false);

  const handleAgendar = () => {
    executeProtectedAction(async () => {
      const user = auth.currentUser;
      const snap = await getDoc(doc(db, "preConsulta", user.uid));
      if (!snap.exists()) {
        setShowPreConsulta(true);
      } else {
        navigate("/agendamento");
      }
    }, MSG_LOGIN);
  };

  const servicos = [
    {
      icon: <Apple size={22} />,
      titulo: "Nutrição",
      desc: "Planos alimentares 100% personalizados para emagrecimento, hipertrofia ou tratamento de patologias.",
      path: "/nutricao",
      cor: "from-emerald-400 to-teal-500",
      badge: "Mais procurado",
    },
    {
      icon: <Thermometer size={22} />,
      titulo: "Farmácia",
      desc: "Orientação farmacêutica e fórmulas magistrais desenvolvidas sob medida para sua saúde.",
      path: "/farmacia",
      cor: "from-green-400 to-emerald-500",
      badge: null,
    },
    {
      icon: <PenLine size={22} />,
      titulo: "Acupuntura",
      desc: "Técnica milenar para reequilíbrio energético, alívio de dores crônicas e redução do estresse.",
      path: "/acupuntura",
      cor: "from-teal-400 to-cyan-500",
      badge: null,
    },
  ];

  const numeros = [
    { valor: "10+", label: "Anos de experiência" },
    { valor: "500+", label: "Pacientes atendidos" },
    { valor: "3", label: "Especialidades" },
    { valor: "98%", label: "Satisfação" },
  ];

  const depoimentos = [
    {
      nome: "Ana Paula",
      texto: "Mudou completamente minha relação com a comida. Perdi 12kg sem passar fome e com saúde!",
      servico: "Nutrição",
      estrelas: 5,
    },
    {
      nome: "Carlos M.",
      texto: "As sessões de acupuntura eliminaram minhas dores lombares crônicas. Recomendo muito.",
      servico: "Acupuntura",
      estrelas: 5,
    },
    {
      nome: "Fernanda L.",
      texto: "Atendimento humanizado e personalizado. Sinto que ela realmente se importa com minha saúde.",
      servico: "Farmácia",
      estrelas: 5,
    },
  ];

  const diferenciais = [
    { icon: <Heart size={18} />, titulo: "Cuidado Humanizado", desc: "Cada paciente é tratado de forma única, com escuta ativa e atenção aos detalhes." },
    { icon: <ShieldCheck size={18} />, titulo: "Abordagem Integrativa", desc: "Combinamos ciência moderna com práticas milenares para resultados completos." },
    { icon: <CalendarCheck size={18} />, titulo: "Acompanhamento Contínuo", desc: "Monitoramento constante para garantir que você atinja seus objetivos com segurança." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .inicio-root { font-family: 'DM Sans', sans-serif; }
        .manu-hero-pattern {
          background-image: url('/Vector.png');
          background-repeat: repeat;
          background-size: 1878px 1080px;
        }
        .card-servico { transition: transform 0.2s, box-shadow 0.2s; }
        .card-servico:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(5,150,105,0.15); }
        .gallery-img { transition: transform 0.4s; }
        .gallery-item:hover .gallery-img { transform: scale(1.05); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.6s 0.15s ease forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s 0.3s ease forwards; opacity: 0; }
      `}</style>

      <div className="inicio-root bg-gray-50 min-h-screen">

        {/* ── HERO MOBILE: foto full-width em destaque ── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #3a6448 0%, #508461 50%, #064e3b 100%)" }}
        >
          <div
            className="manu-hero-pattern absolute inset-0 pointer-events-none"
            style={{ opacity: 0.18, zIndex: 0 }}
          />

          {/* LAYOUT DESKTOP: lado a lado */}
          <div className="relative z-10 hidden lg:flex max-w-4xl mx-auto px-6 py-24 flex-row items-center gap-10">
            <div className="flex-1 text-left">
              <span className="inline-block bg-[#c8f564]/20 border border-[#c8f564]/40 text-[#c8f564] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-5 fade-up">
                ✦ Saúde Integrativa em Natal, RN
              </span>
              <h1 className="text-5xl font-black text-white leading-tight mb-4 fade-up-2">
                Sua saúde,<br />
                <span className="text-[#c8f564]">cuidada com ciência</span><br />
                e coração.
              </h1>
              <p className="text-emerald-100/80 text-base leading-relaxed max-w-md mb-8 fade-up-3">
                Nutrição, Farmácia e Acupuntura em um único cuidado — personalizado, humanizado e com resultados reais.
              </p>
              <div className="flex flex-row gap-3 fade-up-3">
                <button
                  onClick={handleAgendar}
                  className="inline-flex items-center justify-center gap-2 bg-[#c8f564] text-[#064e3b] font-bold px-7 py-3.5 rounded-xl shadow-lg hover:bg-lime-300 transition-all active:scale-95 text-sm"
                >
                  Agendar consulta <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate("/manuela")}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/20 transition-all text-sm"
                >
                  Conhecer a Manuela
                </button>
              </div>
            </div>
            <div className="shrink-0">
              <div className="relative">
                <div className="w-64 h-64 rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl bg-emerald-800/40">
                  <img src="/manuela.png" alt="Manuela Bernardo" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-white rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold text-gray-700">Agendamentos abertos</span>
                </div>
              </div>
            </div>
          </div>

          {/* LAYOUT MOBILE: foto em destaque, texto sobreposto na base */}
          <div className="relative z-10 lg:hidden">
            {/* Foto full-width com altura generosa */}
            <div className="relative w-full" style={{ height: "95vw", maxHeight: "480px", minHeight: "320px" }}>
              <img
                src="/manuela.png"
                alt="Manuela Bernardo"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 20%" }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              {/* Gradiente que une a foto ao texto abaixo */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, transparent 30%, #3d6b4f 85%, #3d6b4f 100%)" }}
              />
              {/* Badge sobre a foto */}
              <div className="absolute top-4 left-4 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#c8f564] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Agendamentos abertos</span>
              </div>
              {/* Label no canto inferior direito */}
              <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">✦ Saúde Integrativa</span>
              </div>
            </div>

            {/* Texto e botões abaixo da foto, dentro do mesmo gradiente */}
            <div className="px-6 pb-10 pt-4" style={{ background: "#3d6b4f" }}>
              <span className="inline-block text-[#c8f564] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                Conheça a profissional
              </span>
              <h1 className="text-4xl font-black text-white leading-tight mb-3 fade-up-2">
                Manuela<br />
                <span className="text-[#c8f564]">Bernardo</span>
              </h1>
              <p className="text-emerald-100/80 text-sm leading-relaxed mb-6 fade-up-3">
                Nutrição, Farmácia e Acupuntura — cuidado completo para você.
              </p>
              <div className="flex flex-row gap-3 fade-up-3">
                <button
                  onClick={handleAgendar}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#c8f564] text-[#064e3b] font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-lime-300 transition-all active:scale-95 text-sm"
                >
                  Agendar consulta <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => navigate("/manuela")}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20 transition-all text-sm whitespace-nowrap"
                >
                  + Saúde Integrativa
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── NÚMEROS ── */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {numeros.map((n, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl lg:text-4xl font-black text-[#059669]">{n.valor}</p>
                <p className="text-gray-400 text-xs mt-1 font-medium">{n.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SERVIÇOS ── */}
        <section className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
          <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2 text-center">O que oferecemos</p>
          <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b] text-center mb-8">Nossos Serviços</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {servicos.map((s, i) => (
              <div
                key={i}
                onClick={() => navigate(s.path)}
                className="card-servico bg-white border border-emerald-100 rounded-2xl p-6 cursor-pointer relative overflow-hidden"
              >
                {s.badge && (
                  <span className="absolute top-4 right-4 bg-[#c8f564] text-[#064e3b] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    {s.badge}
                  </span>
                )}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.cor} flex items-center justify-center text-white mb-4 shadow`}>
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1.5">{s.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  Saiba mais <ArrowRight size={12} />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── DIFERENCIAIS ── */}
        <section className="bg-white border-y border-gray-100 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2 text-center">Por que escolher</p>
            <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b] text-center mb-8">Nossos Diferenciais</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {diferenciais.map((d, i) => (
                <div key={i} className="flex items-start gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                  <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    {d.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{d.titulo}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEPOIMENTOS ── */}
        <section className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
          <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2 text-center">O que dizem</p>
          <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b] text-center mb-8">Depoimentos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {depoimentos.map((d, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {Array(d.estrelas).fill(0).map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">"{d.texto}"</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="font-bold text-gray-800 text-sm">{d.nome}</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">{d.servico}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section
          className="relative overflow-hidden py-14 px-6"
          style={{ background: "linear-gradient(135deg, #3a6448 0%, #508461 100%)" }}
        >
          <div className="manu-hero-pattern absolute inset-0 pointer-events-none" style={{ opacity: 0.15, zIndex: 0 }} />
          <div className="relative z-10 max-w-lg mx-auto text-center">
            <p className="text-[#c8f564] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">Próximo passo</p>
            <h2 className="text-2xl lg:text-3xl font-black text-white mb-3">
              Pronta para cuidar de você
            </h2>
            <p className="text-emerald-100/80 text-sm mb-7 leading-relaxed">
              Agende sua consulta e comece uma jornada de saúde personalizada, integrativa e com resultados reais.
            </p>
            <button
              onClick={handleAgendar}
              className="inline-flex items-center gap-2 bg-[#c8f564] text-[#064e3b] font-bold px-9 py-3.5 rounded-xl shadow-lg hover:bg-lime-300 transition-all hover:-translate-y-0.5 active:scale-95 text-sm"
            >
              Agendar consulta <ArrowRight size={15} />
            </button>
          </div>
        </section>

      </div>

      <ModalLoginPrompt
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmLogin}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <ModalPreConsulta
        isOpen={showPreConsulta}
        onClose={() => setShowPreConsulta(false)}
      />
    </>
  );
};

export default Inicio;
import React from "react";
import { auth } from "../firebase";
import Header from "./Header";
import { Leaf, Award, Heart, BookOpen, Star, ArrowRight } from "lucide-react";

const Manuela = () => {
  const nomeCompleto = auth.currentUser?.displayName || "Usuário";
  const nomeUsuario = nomeCompleto.includes("|") ? nomeCompleto.split("|")[0] : nomeCompleto;

  const especialidades = [
    {
      icon: <Leaf size={22} />,
      titulo: "Nutrição",
      desc: "Planos alimentares personalizados que respeitam sua rotina, preferências e objetivos de saúde.",
      cor: "from-emerald-400 to-teal-500",
    },
    {
      icon: <Star size={22} />,
      titulo: "Acupuntura",
      desc: "Técnica milenar para reequilíbrio energético, alívio de dores e redução do estresse.",
      cor: "from-teal-400 to-cyan-500",
    },
    {
      icon: <Award size={22} />,
      titulo: "Farmácia",
      desc: "Orientação farmacêutica personalizada e manipulação de fórmulas sob medida para você.",
      cor: "from-green-400 to-emerald-500",
    },
  ];

  const numeros = [
    { valor: "10+", label: "Anos de experiência" },
    { valor: "500+", label: "Pacientes atendidos" },
    { valor: "3", label: "Especialidades" },
    { valor: "98%", label: "Satisfação" },
  ];

  const fotos = [
    { src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80", alt: "Consultório" },
    { src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80", alt: "Atendimento" },
    { src: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80", alt: "Nutrição" },
    { src: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80", alt: "Acupuntura" },
    { src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", alt: "Bem-estar" },
    { src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80", alt: "Saúde" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        .manuela-page { font-family: 'DM Sans', sans-serif; }
        .manuela-page h1, .manuela-page h2 { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.4s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.55s; opacity: 0; }
        .photo-grid-item:hover img { transform: scale(1.06); }
      `}</style>

      <div className="manuela-page fixed inset-0 h-screen w-full flex flex-col bg-[#f8faf8] overflow-hidden">
        <Header nomeUsuario={nomeUsuario} />

        <main className="flex-1 overflow-y-auto">

          {/* ── HERO ── */}
          <section className="relative bg-[#064e3b] text-white overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-500/10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-teal-400/10" />
              <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-emerald-300/5" />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-14 lg:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Foto */}
              <div className="fade-up fade-up-1 shrink-0">
                <div className="relative">
                  <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-[32px] overflow-hidden ring-4 ring-emerald-400/30 shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=700&q=80"
                      alt="Manuela Bernardo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Badge flutuante */}
                  <div className="absolute -bottom-3 -right-3 bg-emerald-400 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    ✦ Saúde Integrativa
                  </div>
                </div>
              </div>

              {/* Texto */}
              <div className="text-center lg:text-left">
                <p className="fade-up fade-up-1 text-emerald-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                  Conheça a profissional
                </p>
                <h1 className="fade-up fade-up-2 text-4xl lg:text-6xl font-black leading-tight mb-5">
                  Manuela<br />
                  <span className="text-emerald-400">Bernardo</span>
                </h1>
                <p className="fade-up fade-up-3 text-emerald-100/80 text-sm lg:text-base leading-relaxed max-w-lg mb-8">
                  Profissional de saúde com visão integrativa, unindo Nutrição, Acupuntura e Farmácia 
                  para cuidar de você de forma completa — corpo, mente e equilíbrio.
                </p>
                <a
                  href="/agendamento"
                  className="fade-up fade-up-4 inline-flex items-center gap-2 bg-emerald-400 text-emerald-900 font-bold px-7 py-3.5 rounded-2xl hover:bg-emerald-300 transition-all shadow-lg hover:shadow-emerald-400/30 hover:-translate-y-0.5"
                >
                  Agendar consulta <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </section>

          {/* ── NÚMEROS ── */}
          <section className="bg-white border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
              {numeros.map((n, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl lg:text-4xl font-black text-[#059669]">{n.valor}</p>
                  <p className="text-gray-500 text-xs mt-1 font-medium">{n.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SOBRE ── */}
          <section className="max-w-5xl mx-auto px-6 py-14 lg:py-16">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="lg:w-1/2">
                <p className="text-emerald-600 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Minha história</p>
                <h2 className="text-3xl lg:text-4xl font-black text-[#064e3b] leading-snug mb-6">
                  Cuidar de pessoas<br />é minha vocação
                </h2>
                <p className="text-gray-500 leading-relaxed text-sm mb-4">
                  Formada em Nutrição pela USP e especialista em Acupuntura Clínica, desenvolvi ao longo 
                  de mais de 10 anos uma abordagem única que combina o melhor da ciência moderna com 
                  práticas integrativas consagradas.
                </p>
                <p className="text-gray-500 leading-relaxed text-sm">
                  Acredito que cada paciente é único. Por isso, construo junto com você um plano 
                  personalizado que respeita sua história, seus limites e seus objetivos — sempre 
                  com base em evidências científicas e muita escuta ativa.
                </p>
              </div>

              {/* Credenciais */}
              <div className="lg:w-1/2 grid grid-cols-1 gap-3 w-full">
                {[
                  { icon: <BookOpen size={18} />, texto: "Graduada em Nutrição — USP" },
                  { icon: <Leaf size={18} />, texto: "Especialista em Acupuntura Clínica" },
                  { icon: <Award size={18} />, texto: "Farmacêutica — manipulação e clínica" },
                  { icon: <Heart size={18} />, texto: "+10 anos em saúde integrativa" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 px-5 py-4 rounded-2xl">
                    <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0">
                      {c.icon}
                    </div>
                    <p className="text-gray-700 font-medium text-sm">{c.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── ESPECIALIDADES ── */}
          <section className="bg-[#064e3b] py-14 lg:py-16">
            <div className="max-w-5xl mx-auto px-6">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">O que ofereço</p>
              <h2 className="text-3xl lg:text-4xl font-black text-white text-center mb-10">Especialidades</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {especialidades.map((e, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:bg-white/10 transition-all">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${e.cor} flex items-center justify-center text-white mb-5 shadow-lg`}>
                      {e.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{e.titulo}</h3>
                    <p className="text-emerald-100/60 text-sm leading-relaxed">{e.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── GALERIA ── */}
          <section className="max-w-5xl mx-auto px-6 py-14 lg:py-16">
            <p className="text-emerald-600 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Galeria</p>
            <h2 className="text-3xl lg:text-4xl font-black text-[#064e3b] mb-8">Nosso espaço</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {fotos.map((foto, i) => (
                <div key={i} className={`photo-grid-item overflow-hidden rounded-2xl lg:rounded-3xl shadow-sm ${i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}>
                  <img
                    src={foto.src}
                    alt={foto.alt}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{ minHeight: i === 0 ? "240px" : "160px" }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-t border-emerald-100 py-14 px-6">
            <div className="max-w-xl mx-auto text-center">
              <p className="text-emerald-600 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Próximo passo</p>
              <h2 className="text-3xl lg:text-4xl font-black text-[#064e3b] mb-4">
                Pronta para cuidar de você
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Agende sua consulta e comece uma jornada de saúde personalizada, integrativa e com resultados reais.
              </p>
              <a
                href="/agendamento"
                className="inline-flex items-center gap-2 bg-[#059669] text-white font-bold px-10 py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Agendar consulta <ArrowRight size={16} />
              </a>
            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default Manuela;
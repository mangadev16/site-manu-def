import React, { useState } from "react";
import { auth } from "../firebase";
import Header from "./Header";
import { Apple, Thermometer, PenLine, Heart, BookOpen, Star, ArrowRight, X } from "lucide-react";

const MANU_PHOTO = "public/manuela.png"

// Radar chart personalidade
const RadarChart = () => {
  const size = 220;
  const cx = 110, cy = 110, r = 80;
  const attrs = [
    { label: "Acolhedora", angle: -90 },
    { label: "Simples", angle: -18 },
    { label: "Sensível", angle: 54 },
    { label: "Jovial", angle: 126 },
    { label: "Dinâmica", angle: 198 },
  ];
  const scores = [0.95, 0.75, 0.65, 0.45, 0.88];

  const toXY = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = attrs.map((a, i) => toXY(a.angle, r * scores[i]));
  const polyPoints = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px]">
      {gridLevels.map((lvl, gi) => {
        const pts = attrs.map(a => toXY(a.angle, r * lvl));
        const poly = pts.map(p => `${p.x},${p.y}`).join(" ");
        return <polygon key={gi} points={poly} fill="none" stroke="#d1fae5" strokeWidth="1" />;
      })}
      {attrs.map((a, i) => {
        const end = toXY(a.angle, r);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#a7f3d0" strokeWidth="1" />;
      })}
      <polygon points={polyPoints} fill="#059669" fillOpacity="0.25" stroke="#059669" strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#059669" />
      ))}
      {attrs.map((a, i) => {
        const pos = toXY(a.angle, r + 18);
        return (
          <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontFamily="DM Sans, sans-serif" fill="#064e3b" fontWeight="600">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
};

// Sliders de personalidade
const PersonalitySliders = () => {
  const pairs = [
    { left: "Sensível", right: "Agressiva", val: -1 },
    { left: "Acolhedora", right: "Fria", val: -3 },
    { left: "Dinâmica", right: "Tranquila", val: -2.5 },
    { left: "Popular", right: "Premium", val: -0.5 },
    { left: "Tradicional", right: "Inovadora", val: 1.5 },
    { left: "Jovial", right: "Madura", val: -1.5 },
  ];

  return (
    <div className="space-y-3">
      {pairs.map((p, i) => {
        const pct = ((p.val + 3) / 6) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20 text-right font-medium">{p.left}</span>
            <div className="flex-1 relative h-1.5 bg-gray-200 rounded-full">
              <div
                className="absolute w-3 h-3 bg-emerald-600 rounded-full -top-[3px] shadow-sm"
                style={{ left: `calc(${pct}% - 6px)` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-20 font-medium">{p.right}</span>
          </div>
        );
      })}
    </div>
  );
};

// Lightbox
const Lightbox = ({ foto, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button
      className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
      onClick={onClose}
    >
      <X size={20} />
    </button>
    <img
      src={foto.src}
      alt={foto.alt}
      className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
      onClick={e => e.stopPropagation()}
    />
  </div>
);

const Manuela = () => {
  const [lightboxFoto, setLightboxFoto] = useState(null);

  const nomeCompleto = auth.currentUser?.displayName || "Usuário";
  const nomeUsuario = nomeCompleto.includes("|") ? nomeCompleto.split("|")[0] : nomeCompleto;

  // ── ORDEM: Nutrição → Farmácia → Acupuntura ──
  const especialidades = [
    {
      icon: <Apple size={20} />,
      titulo: "Nutrição",
      desc: "Planos alimentares personalizados que respeitam sua rotina, preferências e objetivos.",
      cor: "from-emerald-400 to-teal-500",
      badge: "Prioridade",
    },
    {
      icon: <Thermometer size={20} />,
      titulo: "Farmácia",
      desc: "Orientação farmacêutica personalizada e fórmulas manipuladas sob medida para sua saúde.",
      cor: "from-green-400 to-emerald-500",
      badge: "Destaque",
    },
    {
      icon: <PenLine size={20} />,
      titulo: "Acupuntura",
      desc: "Técnica milenar para reequilíbrio energético, alívio de dores e redução do estresse.",
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

  // ── GALERIA: fotos reais de espaços de saúde em Natal, RN
  // Usando fotos do Google Places via place_id ou Unsplash temático
  const fotos = [
    {
      // Nutrição — consultório em Natal (Tyrol Business Center)
      src: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=placeholder&key=AIzaSy`,
      // fallback com Unsplash temático real
      fallback: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
      alt: "Consultório de Nutrição — Natal, RN",
      label: "Nutrição",
    },
    {
      fallback: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      alt: "Farmácia de Manipulação — Natal, RN",
      label: "Farmácia",
    },
    {
      fallback: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80",
      alt: "Sessão de Acupuntura — Natal, RN",
      label: "Acupuntura",
    },
    {
      fallback: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80",
      alt: "Atendimento integrado — Natal, RN",
      label: "Atendimento",
    },
    {
      fallback: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
      alt: "Consulta nutricional — Natal, RN",
      label: "Consulta",
    },
    {
      fallback: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      alt: "Bem-estar e saúde — Natal, RN",
      label: "Bem-estar",
    },
  ];

  const getFotoSrc = (foto) => foto.src && !foto.src.includes("placeholder") ? foto.src : foto.fallback;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .manu-page { font-family: 'DM Sans', sans-serif; }
        .manu-page h1, .manu-page h2 { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fu1 { animation: fadeUp 0.6s ease 0.1s both; }
        .fu2 { animation: fadeUp 0.6s ease 0.25s both; }
        .fu3 { animation: fadeUp 0.6s ease 0.4s both; }
        .fu4 { animation: fadeUp 0.6s ease 0.55s both; }
        .gallery-img { transition: transform 0.4s ease; }
        .gallery-item:hover .gallery-img { transform: scale(1.05); }

      `}</style>

      <div className="manu-page fixed inset-0 h-screen w-full flex flex-col bg-[#f7f9f7] overflow-hidden">
        <Header nomeUsuario={nomeUsuario} />
        {lightboxFoto && <Lightbox foto={lightboxFoto} onClose={() => setLightboxFoto(null)} />}

        <main className="flex-1 overflow-y-auto">

          {/* ── HERO com background do Login ── */}
          <section className="relative text-white overflow-hidden" style={{ minHeight: "420px" }}>
            {/* Gradiente base igual ao Login */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(135deg, #508461 0%, #76AB7A 50%, #A9DC93 100%)"
            }} />

            {/* Vector.png animado, igual ao Login */}
            <style>{`
              @keyframes slideBgManu {
                from { background-position: 0 0; }
                to   { background-position: -1878px 0; }
              }
              .manu-hero-pattern { animation: slideBgManu 52s linear infinite; }
            `}</style>
            <div
              className="manu-hero-pattern absolute inset-0"
              style={{
                backgroundImage: "url('/Vector.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "1878px 1080px",
                opacity: 0.55,
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Foto da Manu — clipada à metade esquerda, sem texto da marca */}
            <div className="absolute inset-0 z-10" style={{ overflow: "hidden" }}>
              {/* Container da foto: só ocupa 58% da largura no desktop */}
              <div
                className="absolute inset-y-0 left-0"
                style={{ width: "58%", overflow: "hidden" }}
              >
                <img
                  src={MANU_PHOTO}
                  alt="Manuela Bernardo"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "30% 12%", objectFit: "cover", width: "60%", height: "100%" }}
                />
              </div>
              {/* Fundo sólido que cobre o restante (lado direito) */}
              <div
                className="absolute inset-y-0 right-0"
                style={{ left: "42%", background: "transparent" }}
              />
              {/* Gradiente de fusão suave sobre a foto */}
              <div className="absolute inset-0"
                style={{
                  background: "linear-gradient(to right, transparent 0%, transparent 35%, rgba(80,132,97,0.7) 50%, rgba(64,108,79,1) 62%, rgba(64,108,79,1) 100%)"
                }}
              />
              {/* Mobile: foto cobre tudo, gradiente de baixo cobre o texto da marca */}
              <div className="lg:hidden absolute inset-y-0 left-0" style={{ width: "100%", overflow: "hidden" }}>
                <img
                  src={MANU_PHOTO}
                  alt="Manuela Bernardo"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "30% 12%" }}
                />
              </div>
              <div className="lg:hidden absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(64,108,79,0.97) 0%, rgba(64,108,79,0.75) 38%, rgba(64,108,79,0.1) 65%, transparent 100%)"
                }}
              />
              {/* Mobile: cobre lado direito onde fica o texto da marca */}
              <div className="lg:hidden absolute inset-0"
                style={{
                  background: "linear-gradient(to right, transparent 0%, transparent 45%, rgba(64,108,79,0.85) 65%, rgba(64,108,79,1) 100%)"
                }}
              />
            </div>

            {/* Desktop: texto à direita */}
            <div className="relative z-20 hidden lg:flex max-w-5xl mx-auto px-8 py-16 items-center justify-end" style={{ minHeight: "420px" }}>
              <div className="flex flex-col items-start gap-4 max-w-xs">
                <p className="fu1 text-[#c8f564] text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Conheça a profissional
                </p>
                <h1 className="fu2 text-5xl font-black leading-tight">
                  Manuela<br />
                  <span className="text-[#c8f564]">Bernardo</span>
                </h1>
                <p className="fu3 text-white/80 text-sm leading-relaxed">
                  Profissional de saúde com visão integrativa, unindo Nutrição, Farmácia e Acupuntura
                  para cuidar de você de forma completa.
                </p>
                <div className="fu4 flex items-center gap-3 mt-1 flex-wrap">
                  <a
                    href="/agendamento"
                    className="inline-flex items-center gap-2 bg-[#c8f564] text-[#064e3b] font-bold px-6 py-3 rounded-xl hover:bg-lime-300 transition-all shadow-lg hover:-translate-y-0.5"
                  >
                    Agendar consulta <ArrowRight size={15} />
                  </a>
                  <span className="bg-white/10 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/20">
                    ✦ Saúde Integrativa
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile: texto embaixo */}
            <div className="relative z-20 lg:hidden flex flex-col justify-end px-5 pb-8" style={{ minHeight: "420px" }}>
              <div className="flex flex-col items-start gap-3">
                <p className="fu1 text-[#c8f564] text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Conheça a profissional
                </p>
                <h1 className="fu2 text-4xl font-black leading-tight">
                  Manuela<br />
                  <span className="text-[#c8f564]">Bernardo</span>
                </h1>
                <p className="fu3 text-white/80 text-[13px] leading-relaxed max-w-xs">
                  Nutrição, Farmácia e Acupuntura — cuidado completo para você.
                </p>
                <div className="fu4 flex items-center gap-2 flex-wrap mt-1">
                  <a
                    href="/agendamento"
                    className="inline-flex items-center gap-2 bg-[#c8f564] text-[#064e3b] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-lime-300 transition-all shadow-lg"
                  >
                    Agendar consulta <ArrowRight size={14} />
                  </a>
                  <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-full border border-white/20">
                    ✦ Saúde Integrativa
                  </span>
                </div>
              </div>
            </div>
          </section>

                    {/* NÚMEROS */}
          <section className="bg-white border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-6 py-7 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {numeros.map((n, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl lg:text-4xl font-black text-[#059669]">{n.valor}</p>
                  <p className="text-gray-400 text-xs mt-1 font-medium">{n.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SOBRE */}
          <section className="max-w-4xl mx-auto px-6 py-12 lg:py-14">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="lg:w-1/2">
                <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">Minha história</p>
                <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b] leading-snug mb-5">
                  Cuidar de pessoas<br />é minha vocação
                </h2>
                <p className="text-gray-500 leading-relaxed text-sm mb-3">
                  Formada em Nutrição e especialista em Acupuntura Clínica, desenvolvi ao longo
                  de mais de 10 anos uma abordagem única que combina ciência moderna com práticas integrativas.
                </p>
                <p className="text-gray-500 leading-relaxed text-sm">
                  Acredito que cada paciente é único. Por isso, construo junto com você um plano
                  personalizado que respeita sua história, seus limites e seus objetivos.
                </p>
              </div>
              <div className="lg:w-1/2 grid grid-cols-1 gap-2.5 w-full">
                {[
                  { icon: <Apple size={16} />, texto: "Graduada em Nutrição — USP" },
                  { icon: <PenLine size={16} />, texto: "Especialista em Acupuntura Clínica" },
                  { icon: <Thermometer size={16} />, texto: "Farmacêutica — manipulação e clínica" },
                  { icon: <Heart size={16} />, texto: "+10 anos em saúde integrativa" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-4 py-3.5 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center shrink-0">
                      {c.icon}
                    </div>
                    <p className="text-gray-700 font-medium text-sm">{c.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PERSONALIDADE - responsivo: gráfico centralizado no mobile */}
<section className="bg-white border-y border-gray-100 py-12 lg:py-14">
  <div className="max-w-4xl mx-auto px-6">
    <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2 text-center lg:text-left">
      Identidade da marca
    </p>
    <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b] mb-8 text-center lg:text-left">
      Personalidade
    </h2>
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
      <div className="flex flex-col items-center gap-3">
        <RadarChart />
        <p className="text-xs text-gray-400 font-medium">Perfil de personalidade</p>
      </div>
      <div className="flex-1 w-full">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-5 text-center lg:text-left">
          Posicionamento
        </p>
        <PersonalitySliders />
      </div>
    </div>
  </div>
</section>

          {/* ── ESPECIALIDADES: Nutrição → Farmácia → Acupuntura ── */}
          <section className="py-12 lg:py-14 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #3a6448 0%, #508461 100%)" }}>
            {/* Vector.png decorativo sutil */}
            <div
              className="manu-hero-pattern absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url('/Vector.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "1878px 1080px",
                opacity: 0.18,
                zIndex: 0,
              }}
            />
            <div className="relative z-10 max-w-4xl mx-auto px-6">
              <p className="text-[#c8f564] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2 text-center">O que ofereço</p>
              <h2 className="text-2xl lg:text-3xl font-black text-white text-center mb-8">Especialidades</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {especialidades.map((e, i) => (
                  <div key={i} className={`bg-white/5 border rounded-2xl p-6 hover:bg-white/10 transition-all relative ${i < 2 ? "border-[#c8f564]/30" : "border-white/10"}`}>
                    {e.badge && (
                      <span className="absolute top-4 right-4 bg-[#c8f564] text-[#064e3b] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                        {e.badge}
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${e.cor} flex items-center justify-center text-white mb-4 shadow`}>
                      {e.icon}
                    </div>
                    <h3 className="text-white font-bold text-base mb-1.5">{e.titulo}</h3>
                    <p className="text-emerald-100/55 text-sm leading-relaxed">{e.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── GALERIA: espaços reais de saúde em Natal, RN ── */}
          <section className="max-w-4xl mx-auto px-6 py-12 lg:py-14">
            <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">Galeria</p>
            <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b] mb-2">Nosso espaço</h2>
            <p className="text-gray-400 text-xs mb-6 font-medium">Referências de clínicas e espaços de saúde em Natal, RN</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 lg:gap-3">
              {fotos.map((foto, i) => (
                <div
                  key={i}
                  className={`gallery-item overflow-hidden rounded-xl lg:rounded-2xl shadow-sm cursor-pointer relative ${i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}
                  onClick={() => setLightboxFoto({ src: getFotoSrc(foto), alt: foto.alt })}
                >
                  <img
                    src={getFotoSrc(foto)}
                    alt={foto.alt}
                    className="gallery-img w-full h-full object-cover"
                    style={{ minHeight: i === 0 ? "220px" : "150px" }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 hover:opacity-100 transition-all">
                    <span className="text-white text-xs font-semibold">{foto.label}</span>
                    <p className="text-white/70 text-[10px]">{foto.alt}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-t border-emerald-100 py-12 px-6">
            <div className="max-w-lg mx-auto text-center">
              <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">Próximo passo</p>
              <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b] mb-3">
                Pronta para cuidar de você
              </h2>
              <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                Agende sua consulta e comece uma jornada de saúde personalizada, integrativa e com resultados reais.
              </p>
              <a
                href="/agendamento"
                className="inline-flex items-center gap-2 bg-[#059669] text-white font-bold px-9 py-3.5 rounded-xl shadow-lg hover:bg-emerald-700 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Agendar consulta <ArrowRight size={15} />
              </a>
            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default Manuela;
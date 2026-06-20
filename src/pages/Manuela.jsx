import React, { useState } from "react";
import { auth } from "../firebase";
import Header from "./Header";
import { Apple, Thermometer, PenLine, Heart, BookOpen, Star, ArrowRight, X, MapPin, Globe } from "lucide-react";

const MANU_PHOTO = "public/manuela2.png"

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
    { valor: "3", label: "Especialidades" },
    { valor: "98%", label: "Satisfação" },
  ];

  // ── GALERIA: fotos reais do IPICS GENOBIE ──
  const fotos = [
    { src: "/ipics1.webp", alt: "Consultório IPICS GENOBIE — sala principal com mesa e estantes", label: "Consultório" },
    { src: "/ipics2.webp", alt: "Sala de atendimento — maca e cadeiras azuis", label: "Atendimento" },
    { src: "/ipics3.png", alt: "Sala de espera — poltronas verdes e mesa de madeira", label: "Recepção" },
    { src: "/ipics4.png", alt: "Fachada — IPICS GENOBIE Natal, RN", label: "Clínica" },
    { src: "/ipics5.png", alt: "Sala de consulta — mesa e cadeira bege", label: "Sala de consulta" },
    { src: "/ipics6.png", alt: "Ambiente terapêutico — IPICS GENOBIE", label: "Terapia" },
  ];

  const getFotoSrc = (foto) => foto.src;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
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
        .fu5 { animation: fadeUp 0.6s ease 0.7s both; }
        .gallery-img { transition: transform 0.4s ease; }
        .gallery-item:hover .gallery-img { transform: scale(1.05); }
        @keyframes slideBgManu {
          from { background-position: 0 0; }
          to   { background-position: -1878px 0; }
        }
        .manu-hero-pattern { animation: slideBgManu 52s linear infinite; }
        .hero-photo-wrap {
          border-radius: 32px 120px 32px 120px;
          overflow: hidden;
        }
        @media (max-width: 1023px) {
          .hero-photo-wrap {
            border-radius: 24px 80px 24px 80px;
          }
        }
        .pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(200,245,100,0.15);
          border: 1px solid rgba(200,245,100,0.35);
          color: #c8f564;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 999px;
        }
        .pill-tag .dot {
          width: 6px; height: 6px;
          background: #c8f564;
          border-radius: 50%;
          display: inline-block;
        }
        .spec-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.85);
          font-size: 11px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 999px;
          backdrop-filter: blur(6px);
        }
      `}</style>

      <div className="manu-page fixed inset-0 h-screen w-full flex flex-col bg-[#f7f9f7] overflow-hidden">
        <Header nomeUsuario={nomeUsuario} />
        {lightboxFoto && <Lightbox foto={lightboxFoto} onClose={() => setLightboxFoto(null)} />}

        <main className="flex-1 overflow-y-auto">

          {/* ── HERO NOVO: split assimétrico, foto destacada, texto à esquerda ── */}
          <section
            className="relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #3a6448 0%, #4d7a5a 40%, #508461 100%)",
              minHeight: "520px",
            }}
          >
            {/* Pattern animado de fundo */}
            <div
              className="manu-hero-pattern absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url('/Vector.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "1878px 1080px",
                opacity: 0.13,
                zIndex: 0,
              }}
            />

            {/* ── DESKTOP ── */}
            <div className="relative z-10 hidden lg:grid max-w-6xl mx-auto px-10" style={{ gridTemplateColumns: "1fr 420px", minHeight: "520px", alignItems: "center", gap: "48px" }}>

              {/* Coluna esquerda: texto */}
              <div className="flex flex-col gap-5 py-16">
                {/* Eyebrow pill */}
                <div className="fu1">
                  <span className="pill-tag"><span className="dot" />Conheça a profissional</span>
                </div>

                {/* Headline */}
                <h1 className="fu2 text-white leading-[1.05]" style={{ fontSize: "clamp(2.6rem, 4vw, 3.8rem)", fontFamily: "'Playfair Display', serif", fontWeight: 900 }}>
                  Saúde que cuida<br />
                  <em style={{ fontStyle: "italic", color: "#c8f564" }}>de você por inteiro.</em>
                </h1>

                {/* Subtext */}
                <p className="fu3 text-white/70 leading-relaxed max-w-md" style={{ fontSize: "15px" }}>
                  Manuela Bernardo une Nutrição, Farmácia e Acupuntura numa abordagem integrativa única — personalizada para a sua história.
                </p>

                {/* Especialidades chips */}
                <div className="fu4 flex flex-wrap gap-2">
                  {["Nutrição", "Fármacia", "Acupuntura"].map(s => (
                    <span key={s} className="spec-chip">{s}</span>
                  ))}
                </div>

                {/* CTA */}
                <div className="fu5 flex flex-col gap-3 mt-2">
                  <a
                    href="/agendamento"
                    className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-2xl transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 self-start"
                    style={{ background: "#c8f564", color: "#1a3d28", fontSize: "14px" }}
                  >
                    Agendar consulta <ArrowRight size={15} />
                  </a>
                  <div className="flex flex-wrap gap-3">
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: "rgba(200,245,100,0.12)", border: "1px solid rgba(200,245,100,0.3)",
                      color: "#c8f564", fontSize: "11px", fontWeight: 600,
                      padding: "5px 12px", borderRadius: "999px"
                    }}>
                      <MapPin size={12} strokeWidth={2.5} /> Presencial — Natal, RN
                    </span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                      color: "rgba(255,255,255,0.75)", fontSize: "11px", fontWeight: 600,
                      padding: "5px 12px", borderRadius: "999px"
                    }}>
                      <Globe size={12} strokeWidth={2.5} /> Online — Todo o Brasil
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna direita: foto com shape arredondada + sombra */}
              <div className="fu2 relative flex items-end justify-center" style={{ height: "520px" }}>
                {/* Glow de fundo da foto */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{
                  width: "340px", height: "340px",
                  background: "radial-gradient(circle, rgba(200,245,100,0.18) 0%, transparent 70%)",
                  borderRadius: "50%",
                }} />
                {/* Container da foto */}
                <div
                  className="hero-photo-wrap relative"
                  style={{
                    width: "340px",
                    height: "490px",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
                    border: "3px solid rgba(200,245,100,0.25)",
                  }}
                >
                  <img
                    src={MANU_PHOTO}
                    alt="Manuela Bernardo"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 8%" }}
                  />
                  {/* Overlay sutil no rodapé da foto */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "120px",
                    background: "linear-gradient(to top, rgba(58,100,72,0.6) 0%, transparent 100%)"
                  }} />
                </div>
                {/* Badge flutuante: CRM */}
                <div className="absolute bottom-10 left-0" style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "16px",
                  padding: "10px 16px",
                }}>
                  <p style={{ color: "#c8f564", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Nutricionista</p>
                  <p style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>Manuela Bernardo</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>+10 anos · Saúde Integrativa</p>
                </div>
              </div>
            </div>

            {/* ── MOBILE ── */}
            <div className="relative z-10 lg:hidden flex flex-col">
              {/* Foto com texto sobreposto */}
              <div style={{ position: "relative" }}>
                <img
                  src={MANU_PHOTO}
                  alt="Manuela Bernardo"
                  style={{ width: "100%", height: "380px", objectFit: "cover", objectPosition: "50% 8%", display: "block" }}
                />
                {/* Gradiente mais alto e suave, começa no meio da foto */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "220px",
                  background: "linear-gradient(to top, #3a6448 0%, #3a6448 20%, rgba(58,100,72,0.85) 55%, transparent 100%)"
                }} />
                {/* Pill tag sobreposta na parte inferior da foto */}
                <div className="fu1 absolute px-5" style={{ bottom: "24px", left: 0 }}>
                  <span className="pill-tag"><span className="dot" />Conheça a profissional</span>
                </div>
              </div>

              {/* Texto embaixo, sem gap visual com a foto */}
              <div className="flex flex-col gap-4 px-5 pb-9 pt-4" style={{ background: "#3a6448" }}>
                <h1 className="fu2 text-white leading-tight" style={{ fontSize: "2.1rem", fontFamily: "'Playfair Display', serif", fontWeight: 900 }}>
                  Saúde que cuida<br />
                  <em style={{ fontStyle: "italic", color: "#c8f564" }}>de você por inteiro.</em>
                </h1>
                <p className="fu3 text-white/70 text-sm leading-relaxed">
                  Nutrição, Farmácia e Acupuntura — cuidado personalizado para você.
                </p>
                <div className="fu4 flex flex-wrap gap-2">
                  {["Nutrição", "Farmácia", "Acupuntura"].map(s => (
                    <span key={s} className="spec-chip" style={{ fontSize: "10px" }}>{s}</span>
                  ))}
                </div>
                <div className="fu5">
                  <a
                    href="/agendamento"
                    className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
                    style={{ background: "#c8f564", color: "#1a3d28", fontSize: "13px" }}
                  >
                    Agendar consulta <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>

                    {/* NÚMEROS */}
          <section className="bg-white border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-6 py-7 grid grid-cols-3 gap-4">
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
                <p className="text-emerald-600 text-[16px] font-semibold uppercase tracking-[0.2em] mb-3">Quem é Manuela?</p>
                <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b] leading-snug mb-5">
                  Cuidar de pessoas<br />é minha vocação
                </h2>
                <p className="text-gray-500 leading-relaxed text-sm mb-3">
                  Sou Manuela Bernardo, Nutricionista, Farmacêutica e Acupunturista com <span style={{ color: '#197a60', fontWeight: 'bold' }}>sólida
                  formação acadêmica e experiência prática dedicada ao cuidado da saúde.</span>
                </p>
                <p className="text-gray-500 leading-relaxed text-sm mb-3">
                  Atuo com uma abordagem integrativa que <span style={{ color: '#197a60', fontWeight: 'bold'}}>une nutrição clínica, farmacologia e
                  fitoterapia, oferecendo orientação terapêutica individualizada para promover
                  equilíbrio metabólico, saúde gastrointestinal e bem-estar geral.</span>
                </p>
                <p className="text-gray-500 leading-relaxed text-sm mb-3">
                Minha trajetória inclui <span style={{ color: '#197a60', fontWeight: 'bold' }}>mais de uma década no ensino superior, formando
                profissionais da saúde e orientando pesquisas, além de ampla experiência na
                indústria farmacêutica.</span> Atualmente, concentro minha atuação no <span style={{ color: '#197a60', fontWeight: 'bold' }}>atendimento
                clínico personalizado</span>, desenvolvendo planos alimentares baseados em
                evidências científicas e <span style={{ color: '#197a60', fontWeight: 'bold' }}>adaptados às necessidades de cada paciente.</span>
                </p>
                
              </div>
              <div className="lg:w-1/2 grid grid-cols-1 gap-2.5 w-full">
                {[
                  { icon: <Apple size={16} />, texto: "Graduada em Nutrição" },
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
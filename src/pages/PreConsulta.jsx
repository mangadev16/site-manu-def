import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, addDoc, collection } from "firebase/firestore";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Check, PlusCircle,
  Target, ClipboardList, Leaf, Salad, HeartPulse, Flower2, Sparkles, Venus, Mars,
} from "lucide-react";

/* ── Paleta e tipografia do site ─────────────────────────────────
   Roxo:  #6b5e8b (primário)  /  #a090c9 (secundário/realces)
   Lima:  #c8f564 (detalhe — selos de "selecionado")
   Base:  branco / cinza neutro
   Fonte: Nunito (mesma do Login)
─────────────────────────────────────────────────────────────────── */

/* ── Seções base e filtradas por sexo ───────────────────────── */
const SECOES_COMUNS = ["objetivos", "historico", "estilo", "habitos", "sintomas", "motivacao"];
const SECOES_FEMININAS = ["objetivos", "historico", "estilo", "habitos", "sintomas", "saudefeminina", "motivacao"];

const SECAO_META = {
  objetivos:      { titulo: "Seus objetivos",         Icon: Target },
  historico:      { titulo: "Histórico de saúde",     Icon: ClipboardList },
  estilo:         { titulo: "Estilo de vida",          Icon: Leaf },
  habitos:        { titulo: "Hábitos alimentares",     Icon: Salad },
  sintomas:       { titulo: "Como você se sente",      Icon: HeartPulse },
  saudefeminina:  { titulo: "Saúde feminina",          Icon: Flower2 },
  motivacao:      { titulo: "Sua motivação",           Icon: Sparkles },
};

const OBJETIVO_SAUDE_FEMININA = "Saúde feminina (SOP, TPM, Menopausa)";

const OBJETIVOS_OPCOES = [
  "Emagrecimento","Ganho de peso","Manutenção do peso","Reeducação alimentar",
  OBJETIVO_SAUDE_FEMININA,"Nutrição estética","Performance esportiva",
  "Tratar sintomas de doença","Saúde e qualidade de vida","Alergias alimentares",
  "Alimentação vegetariana ou vegana",
];

/* ── Componentes visuais ─────────────────────────────────────── */
const Pill = ({ label, ativo, onClick, multi }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all duration-150 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#6b5e8b]/40
      ${ativo
        ? "border-[#6b5e8b] bg-[#6b5e8b] text-white shadow-[0_8px_20px_rgba(107,94,139,0.25)]"
        : "border-gray-300 bg-white text-gray-700 shadow-sm hover:border-[#a090c9] hover:text-[#6b5e8b]"}
    `}
  >
    {multi && ativo && (
      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#c8f564] rounded-full flex items-center justify-center ring-2 ring-white">
        <Check size={10} className="text-[#3d3458]" strokeWidth={3.5} />
      </span>
    )}
    {label}
  </button>
);

const Campo = ({ label, hint, children }) => (
  <div className="space-y-2.5">
    <div className="flex items-start gap-2">
      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#a090c9] shrink-0" />
      <div>
        <p className="text-[13px] font-bold text-gray-800 leading-snug">{label}</p>
        {hint && <p className="text-[12px] text-gray-500 mt-0.5">{hint}</p>}
      </div>
    </div>
    {children}
  </div>
);

const RadioPills = ({ opcoes, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {opcoes.map(op => (
      <Pill key={op} label={op} ativo={value === op} onClick={() => onChange(op)} />
    ))}
  </div>
);

const CheckPills = ({ opcoes, values, onChange }) => {
  const toggle = op => onChange(values.includes(op) ? values.filter(v => v !== op) : [...values, op]);
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map(op => (
        <Pill key={op} label={op} ativo={values.includes(op)} onClick={() => toggle(op)} multi />
      ))}
    </div>
  );
};

const SimNao = ({ value, onChange }) => (
  <div className="inline-flex bg-gray-100 border border-gray-200 rounded-2xl p-1 gap-1">
    {["Sim", "Não"].map(op => (
      <button
        key={op} type="button" onClick={() => onChange(op)}
        className={`px-7 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#6b5e8b]/40
          ${value === op ? "bg-white text-[#6b5e8b] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
      >{op}</button>
    ))}
  </div>
);

const Escala = ({ value, onChange, min = "Baixo", max = "Alto" }) => (
  <div className="space-y-2">
    <div className="flex gap-2">
      {[1,2,3,4,5].map(n => (
        <button
          key={n} type="button" onClick={() => onChange(String(n))}
          className={`flex-1 h-12 rounded-2xl text-sm font-black border-2 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#6b5e8b]/40
            ${value === String(n) ? "border-[#6b5e8b] bg-[#6b5e8b] text-white shadow-[0_8px_20px_rgba(107,94,139,0.25)]" : "border-gray-300 bg-white text-gray-600 shadow-sm hover:border-[#a090c9]"}`}
        >{n}</button>
      ))}
    </div>
    <div className="flex justify-between px-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
      <span>{min}</span><span>{max}</span>
    </div>
  </div>
);

const InputText = ({ placeholder, value, onChange, type = "text" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#6b5e8b] focus:ring-4 focus:ring-[#6b5e8b]/10 transition-all font-semibold"
  />
);

const TextArea = ({ placeholder, value, onChange, rows = 4 }) => (
  <textarea
    rows={rows}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#6b5e8b] focus:ring-4 focus:ring-[#6b5e8b]/10 transition-all resize-none font-semibold"
  />
);

const SubSecao = ({ titulo }) => (
  <div className="flex items-center gap-2 pt-3">
    <span className="w-1.5 h-1.5 rounded-full bg-[#6b5e8b] shrink-0" />
    <span className="text-[12px] font-black uppercase tracking-widest text-[#6b5e8b]">{titulo}</span>
  </div>
);

/* ── Estado inicial ───────────────────────────────────────────── */
const estadoInicial = {
  sexo: "",
  objetivos: [], objetivoOutro: "",
  nutricionistaAntes: "", tentouMudarHabitos: "", dificuldadeMudanca: "",
  usouRecurso: "", qualRecurso: "", pesoAtual: "", altura: "",
  descricaoObjetivo: "",
  problemaSaude: "", historicoDencas: "", medicamentos: "",
  examesRecentes: "", pesaComFrequencia: "", familiaAcimaPeso: [],
  cargaHoraria: "", rotinaTrab: [], localTrabRecursos: [],
  quemPrepara: "", disposicao: "", sintomasCansaco: [],
  qualidadeSono: [], horarioSono: "", estressada: "", reacaoEstresse: [],
  nivelEstresse: "", memoria: "",
  praticaAtividade: "", qualAtividade: "", motivoNaoAtividade: [],
  frequenciaAtividade: "", horarioAtividade: "", desempenhoAtividade: "",
  alimentacao: "", horarioFome: [], alergiaAlimentar: "",
  consumoAgua: "", alcool: "", fumante: "", restauranteFreq: "",
  suplementacao: "", qualSuplemento: "",
  intestino: [], sintomasCorporais: [],
  cicloRegular: "", fluxo: "", colicasIntensas: "", endometriose: "",
  sop: "", sintomasTPM: "", contraceptivo: "",
  motivacao: "", importancia: "",
};

/* ── Tela de seleção de sexo ─────────────────────────────────── */
const TelaSexo = ({ onSelect }) => {
  const navigate = useNavigate();
  return (
  <div
    className="fixed inset-0 flex flex-col items-center justify-center px-6 relative overflow-hidden"
    style={{ background: "linear-gradient(160deg, #faf9fc 0%, #ffffff 60%)" }}
  >
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
    .pc-font * { font-family: 'Nunito', sans-serif; }`}</style>

    {/* Padrão de fundo sutilíssimo — eco do Login, sem competir com o conteúdo */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: "url('/Vector.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "640px 369px",
        opacity: 0.035,
      }}
    />

    {/* Botão de voltar */}
    <button
      type="button"
      onClick={() => navigate("/dashboard")}
      className="pc-font absolute top-4 left-4 z-20 w-12 h-12 rounded-2xl bg-gray-100 hover:bg-[#f4f2f8] active:bg-[#f4f2f8] flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#6b5e8b]/40 touch-manipulation"
    >
      <ArrowLeft size={22} className="text-gray-600" />
    </button>

    <div className="pc-font relative z-10 w-full max-w-sm space-y-9 text-center">
      <div className="space-y-4">
        <img src="/logotransparente.png" alt="Manu" className="h-9 w-auto mx-auto" />
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            Pré-consulta
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            Antes de começar, nos diga com quem estamos falando para personalizar as perguntas.
          </p>
        </div>
      </div>

      {/* Cartões de seleção */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Homem",  Icon: Mars,  value: "Masculino" },
          { label: "Mulher", Icon: Venus, value: "Feminino"  },
        ].map(op => (
          <button
            key={op.value}
            type="button"
            onClick={() => onSelect(op.value)}
            className="flex flex-col items-center gap-3 bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm hover:border-[#a090c9] hover:shadow-md hover:shadow-purple-100 transition-all duration-200 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#6b5e8b]/40 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f4f2f8] flex items-center justify-center transition-colors group-hover:bg-[#6b5e8b]">
              <op.Icon size={22} className="text-[#6b5e8b] transition-colors group-hover:text-white" strokeWidth={2.2} />
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-[#6b5e8b] transition-colors">
              {op.label}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-gray-400">
        Suas respostas são confidenciais e serão vistas apenas pela Manuela.
      </p>
    </div>
  </div>
  );
};

/* ── Componente principal ─────────────────────────────────────── */
const PreConsulta = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forcarNovo = searchParams.get("novo") === "1" || searchParams.get("novo") === "true";
  const user = auth.currentUser;
  const [sexo, setSexo] = useState("");           // "" | "Masculino" | "Feminino"
  const [secaoIdx, setSecaoIdx] = useState(0);
  const [form, setForm] = useState(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [jaRespondeu, setJaRespondeu] = useState(false);

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getDoc(doc(db, "preConsulta", user.uid)).then(snap => {
      if (snap.exists()) setJaRespondeu(true);
    });
  }, [user]);

  // Só exibe a tela de "já respondido" quando o usuário não pediu
  // explicitamente um formulário novo (ex: vindo de "Responder novo formulário")
  const mostrarGate = jaRespondeu && !forcarNovo && !enviado;

  // Reinicia o formulário do zero para uma nova resposta
  const iniciarNovoFormulario = () => {
    setForm(estadoInicial);
    setSexo("");
    setSecaoIdx(0);
    setJaRespondeu(false);
  };

  const secoes = sexo === "Feminino" ? SECOES_FEMININAS : SECOES_COMUNS;
  const secaoAtual = secoes[secaoIdx];
  const totalSecoes = secoes.length;
  const progresso = Math.round(((secaoIdx) / totalSecoes) * 100);

  const enviar = async () => {
    setEnviando(true);
    try {
      const payload = {
        ...form, sexo,
        uid: user.uid,
        nome: user.displayName?.split("|")[0] || "",
        email: user.email,
        telefone: user.displayName?.split("|")[1] || "",
        enviadoEm: new Date(),
      };
      // Guarda esta resposta no histórico (uma por formulário enviado)
      await addDoc(collection(db, "preConsulta", user.uid, "respostas"), payload);
      // Mantém também o documento principal com a resposta mais recente,
      // para compatibilidade com leituras já existentes
      await setDoc(doc(db, "preConsulta", user.uid), payload);
      setEnviado(true);
    } catch (e) { console.error(e); }
    finally { setEnviando(false); }
  };

  /* ── Tela de conclusão / já respondido ──────────────────────── */
  if (enviado || mostrarGate) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6 bg-gray-50">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');.pc-font*{font-family:'Nunito',sans-serif}`}</style>
        <div className="pc-font bg-white rounded-3xl p-8 max-w-sm w-full shadow-sm border border-gray-100 text-center space-y-5">
          <div className="w-14 h-14 bg-[#f4f2f8] rounded-2xl flex items-center justify-center mx-auto relative">
            <CheckCircle2 size={28} className="text-[#6b5e8b]" strokeWidth={2.2} />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#c8f564] rounded-full ring-2 ring-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">
              {mostrarGate ? "Já respondido!" : "Tudo certo!"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {mostrarGate
                ? "Você já preencheu o questionário. Se algo mudou desde a última vez, pode responder um novo antes da consulta."
                : "Suas respostas foram salvas. A Manuela vai analisá-las antes da consulta."}
            </p>
          </div>
          <div className="space-y-2.5">
            <button
              onClick={() => navigate("/agendamento")}
              className="w-full bg-[#6b5e8b] hover:bg-[#5b4f78] text-white font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Ir para o Agendamento <ChevronRight size={15} />
            </button>
            {mostrarGate && (
              <button
                onClick={iniciarNovoFormulario}
                className="w-full bg-white border-2 border-[#6b5e8b]/25 hover:border-[#6b5e8b] text-[#6b5e8b] font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <PlusCircle size={15} /> Responder novo formulário
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Tela de seleção de sexo ──────────────────────────────── */
  if (!sexo) return <TelaSexo onSelect={s => { setSexo(s); set("sexo", s); }} />;

  /* ── Formulário principal ────────────────────────────────── */
  const meta = SECAO_META[secaoAtual];

  return (
    <div className="fixed inset-0 bg-white font-sans flex flex-col overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .pc-font { font-family: 'Nunito', sans-serif; }
        .pc-font * { font-family: 'Nunito', sans-serif; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="pc-font shrink-0 bg-white px-5 pt-5 pb-4 space-y-4">
        {/* Linha superior */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => secaoIdx === 0 ? setSexo("") : setSecaoIdx(secaoIdx - 1)}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-[#f4f2f8] flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#6b5e8b]/40"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-[12px] font-bold text-gray-500">
            {secaoIdx + 1} de {totalSecoes}
          </span>
          <div className="w-9" /> {/* spacer */}
        </div>

        {/* Barra de progresso segmentada */}
        <div className="flex gap-1.5">
          {secoes.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-500"
              style={{ background: i <= secaoIdx ? "#6b5e8b" : "#e5e7eb" }}
            />
          ))}
        </div>
      </div>

      {/* ── Cabeçalho da seção ───────────────────────────────── */}
      <div className="pc-font shrink-0 px-5 pb-5 pt-1">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#f4f2f8] flex items-center justify-center shrink-0">
            <meta.Icon size={20} className="text-[#6b5e8b]" strokeWidth={2.2} />
          </div>
          <h2 className="text-xl font-black text-gray-900 leading-tight pt-1.5">{meta.titulo}</h2>
        </div>
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────── */}
      <main className="pc-font flex-1 overflow-y-auto px-5 pb-6 space-y-7">

        {/* OBJETIVOS */}
        {secaoAtual === "objetivos" && (<>
          <Campo label="O que você busca alcançar?" hint="Selecione quantos quiser">
            <CheckPills opcoes={sexo === "Feminino" ? OBJETIVOS_OPCOES : OBJETIVOS_OPCOES.filter(o => o !== OBJETIVO_SAUDE_FEMININA)} values={form.objetivos} onChange={v => set("objetivos", v)} />
            <InputText placeholder="Outro objetivo..." value={form.objetivoOutro} onChange={e => set("objetivoOutro", e.target.value)} />
          </Campo>
          <Campo label="Já consultou um nutricionista antes?">
            <SimNao value={form.nutricionistaAntes} onChange={v => set("nutricionistaAntes", v)} />
          </Campo>
          <Campo label="Já tentou mudar seus hábitos alimentares?">
            <SimNao value={form.tentouMudarHabitos} onChange={v => set("tentouMudarHabitos", v)} />
            {form.tentouMudarHabitos === "Sim" && (
              <TextArea placeholder="Qual foi sua maior dificuldade?" value={form.dificuldadeMudanca} onChange={e => set("dificuldadeMudanca", e.target.value)} />
            )}
          </Campo>
          <Campo label="Utilizou algum recurso para controle de peso?">
            <SimNao value={form.usouRecurso} onChange={v => set("usouRecurso", v)} />
            {form.usouRecurso === "Sim" && (
              <InputText placeholder="Qual?" value={form.qualRecurso} onChange={e => set("qualRecurso", e.target.value)} />
            )}
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Peso atual (kg)">
              <InputText type="number" placeholder="Ex: 70" value={form.pesoAtual} onChange={e => set("pesoAtual", e.target.value)} />
            </Campo>
            <Campo label="Altura (cm)">
              <InputText type="number" placeholder="Ex: 165" value={form.altura} onChange={e => set("altura", e.target.value)} />
            </Campo>
          </div>
          <Campo label="Descreva seu objetivo" hint="Conte suas expectativas e necessidades">
            <TextArea placeholder="Escreva livremente..." value={form.descricaoObjetivo} onChange={e => set("descricaoObjetivo", e.target.value)} rows={4} />
          </Campo>
        </>)}

        {/* HISTÓRICO */}
        {secaoAtual === "historico" && (<>
          <Campo label="Possui algum problema de saúde?">
            <TextArea placeholder="Descreva quais, ou deixe em branco..." value={form.problemaSaude} onChange={e => set("problemaSaude", e.target.value)} />
          </Campo>
          <Campo label="Histórico familiar de doenças crônicas?">
            <TextArea placeholder="Ex: Diabetes no pai, hipertensão na mãe..." value={form.historicoDencas} onChange={e => set("historicoDencas", e.target.value)} />
          </Campo>
          <Campo label="Faz uso de medicamentos?">
            <TextArea placeholder="Liste os medicamentos, ou deixe em branco..." value={form.medicamentos} onChange={e => set("medicamentos", e.target.value)} />
          </Campo>
          <Campo label="Realizou exames laboratoriais recentemente?">
            <SimNao value={form.examesRecentes} onChange={v => set("examesRecentes", v)} />
          </Campo>
          <Campo label="Com que frequência você se pesa?">
            <RadioPills opcoes={["Raramente", "Semanalmente", "Diariamente", "Não gosto de me pesar"]} value={form.pesaComFrequencia} onChange={v => set("pesaComFrequencia", v)} />
          </Campo>
          <Campo label="Na família, quem está acima do peso?">
            <CheckPills opcoes={["Ninguém", "Pai/Mãe", "Irmãos", "Avós", "Cônjuge"]} values={form.familiaAcimaPeso} onChange={v => set("familiaAcimaPeso", v)} />
          </Campo>
        </>)}

        {/* ESTILO DE VIDA */}
        {secaoAtual === "estilo" && (<>
          <Campo label="Carga horária de trabalho">
            <RadioPills opcoes={["4 horas", "6 horas", "8 horas", "12h ou mais"]} value={form.cargaHoraria} onChange={v => set("cargaHoraria", v)} />
          </Campo>
          <Campo label="Sua rotina de trabalho é">
            <CheckPills opcoes={["Sentado", "Em pé", "Caminhando", "Carregando peso"]} values={form.rotinaTrab} onChange={v => set("rotinaTrab", v)} />
          </Campo>
          <Campo label="No trabalho você tem acesso a">
            <CheckPills opcoes={["Geladeira", "Micro-ondas", "Fogão", "Nenhum"]} values={form.localTrabRecursos} onChange={v => set("localTrabRecursos", v)} />
          </Campo>
          <Campo label="Quem prepara suas refeições?">
            <RadioPills opcoes={["Eu mesmo(a)", "Outra pessoa"]} value={form.quemPrepara} onChange={v => set("quemPrepara", v)} />
          </Campo>
          <Campo label="Como está sua disposição diária?">
            <Escala value={form.disposicao} onChange={v => set("disposicao", v)} min="Muito baixa" max="Ótima" />
          </Campo>
          <Campo label="Costuma sentir" hint="Marque os que se aplicam">
            <CheckPills opcoes={["Sonolência", "Cansaço", "Irritabilidade", "Tontura", "Fraqueza", "Falta de concentração"]} values={form.sintomasCansaco} onChange={v => set("sintomasCansaco", v)} />
          </Campo>

          <SubSecao titulo="Sono e Estresse" />
          <Campo label="Qualidade do sono">
            <CheckPills opcoes={["Boa", "Insônia", "Sono agitado", "Despertares noturnos", "Acordo cansado"]} values={Array.isArray(form.qualidadeSono) ? form.qualidadeSono : form.qualidadeSono ? [form.qualidadeSono] : []} onChange={v => set("qualidadeSono", v)} />
          </Campo>
          <Campo label="Horário que dorme e acorda">
            <InputText placeholder="Ex: Durmo às 23h, acordo às 7h" value={form.horarioSono} onChange={e => set("horarioSono", e.target.value)} />
          </Campo>
          <Campo label="Sente-se frequentemente estressado(a)?">
            <SimNao value={form.estressada} onChange={v => set("estressada", v)} />
          </Campo>
          {form.estressada === "Sim" && (
            <Campo label="Quando estressado(a), você">
              <CheckPills opcoes={["Come mais", "Perde o apetite", "Fica indiferente", "Bebe álcool"]} values={form.reacaoEstresse} onChange={v => set("reacaoEstresse", v)} />
            </Campo>
          )}
          <Campo label="Nível de estresse atual">
            <Escala value={form.nivelEstresse} onChange={v => set("nivelEstresse", v)} min="Baixo" max="Muito alto" />
          </Campo>
          <Campo label="Como está sua memória?">
            <RadioPills opcoes={["Ruim", "Regular", "Boa", "Excelente"]} value={form.memoria} onChange={v => set("memoria", v)} />
          </Campo>

          <SubSecao titulo="Atividade Física" />
          <Campo label="Pratica atividade física?">
            <SimNao value={form.praticaAtividade} onChange={v => set("praticaAtividade", v)} />
          </Campo>
          {form.praticaAtividade === "Sim" && (<>
            <Campo label="Qual(is) atividade(s)?">
              <InputText placeholder="Ex: Musculação, caminhada, natação..." value={form.qualAtividade} onChange={e => set("qualAtividade", e.target.value)} />
            </Campo>
            <Campo label="Frequência">
              <RadioPills opcoes={["Diariamente", "5x/semana", "3x/semana", "2x ou menos"]} value={form.frequenciaAtividade} onChange={v => set("frequenciaAtividade", v)} />
            </Campo>
            <Campo label="Horário que pratica">
              <RadioPills opcoes={["Manhã", "Tarde", "Noite"]} value={form.horarioAtividade} onChange={v => set("horarioAtividade", v)} />
            </Campo>
            <Campo label="Como avalia seu desempenho?">
              <RadioPills opcoes={["Ruim", "Regular", "Bom", "Excelente"]} value={form.desempenhoAtividade} onChange={v => set("desempenhoAtividade", v)} />
            </Campo>
          </>)}
          {form.praticaAtividade === "Não" && (
            <Campo label="Por que não pratica?">
              <CheckPills opcoes={["Falta de tempo", "Não gosto", "Preguiça", "Me frustrei antes", "Não encontro um esporte que goste"]} values={Array.isArray(form.motivoNaoAtividade) ? form.motivoNaoAtividade : []} onChange={v => set("motivoNaoAtividade", v)} />
            </Campo>
          )}
        </>)}

        {/* HÁBITOS ALIMENTARES */}
        {secaoAtual === "habitos" && (<>
          <Campo label="Como você avalia sua alimentação hoje?">
            <RadioPills opcoes={["Pouco saudável", "Moderada", "Saudável"]} value={form.alimentacao} onChange={v => set("alimentacao", v)} />
          </Campo>
          <Campo label="Quando sente mais fome?">
            <CheckPills opcoes={["Manhã", "Almoço", "Tarde", "Noite", "Antes de dormir"]} values={form.horarioFome} onChange={v => set("horarioFome", v)} />
          </Campo>
          <Campo label="Tem alergia ou intolerância alimentar?">
            <InputText placeholder="Qual? Deixe em branco se não tiver" value={form.alergiaAlimentar} onChange={e => set("alergiaAlimentar", e.target.value)} />
          </Campo>
          <Campo label="Quantos litros de água bebe por dia?">
            <RadioPills opcoes={["< 1L", "1–2L", "2–3L", "3–4L", "> 4L"]} value={form.consumoAgua} onChange={v => set("consumoAgua", v)} />
          </Campo>
          <Campo label="Consome bebidas alcoólicas?">
            <RadioPills opcoes={["Não", "Fins de semana", "Socialmente", "Frequentemente"]} value={form.alcool} onChange={v => set("alcool", v)} />
          </Campo>
          <Campo label="Fuma?">
            <SimNao value={form.fumante} onChange={v => set("fumante", v)} />
          </Campo>
          <Campo label="Vezes por semana em restaurantes ou delivery">
            <InputText type="number" placeholder="Ex: 3" value={form.restauranteFreq} onChange={e => set("restauranteFreq", e.target.value)} />
          </Campo>
          <Campo label="Usa suplementação?">
            <SimNao value={form.suplementacao} onChange={v => set("suplementacao", v)} />
            {form.suplementacao === "Sim" && (
              <InputText placeholder="Qual(is)?" value={form.qualSuplemento} onChange={e => set("qualSuplemento", e.target.value)} />
            )}
          </Campo>
        </>)}

        {/* SINTOMAS */}
        {secaoAtual === "sintomas" && (<>
          <Campo label="Como está seu intestino?" hint="Marque os que se aplicam">
            <CheckPills opcoes={["Regular", "Constipação", "Diarreia", "Gases", "Azia", "Distensão abdominal"]} values={form.intestino} onChange={v => set("intestino", v)} />
          </Campo>
          <Campo label="Sintomas que percebe no corpo">
            <CheckPills opcoes={["Queda de cabelo", "Cabelo sem brilho", "Unhas fracas", "Pele ressecada", "Pele oleosa", "Acne", "Celulite", "Retenção de líquidos"]} values={form.sintomasCorporais} onChange={v => set("sintomasCorporais", v)} />
          </Campo>
        </>)}

        {/* SAÚDE FEMININA — só aparece se sexo === Feminino */}
        {secaoAtual === "saudefeminina" && (<>
          <Campo label="Seu ciclo menstrual é regular?">
            <RadioPills opcoes={["Sim", "Não", "Menopausa", "Uso medicamento que bloqueia"]} value={form.cicloRegular} onChange={v => set("cicloRegular", v)} />
          </Campo>
          <Campo label="Como é seu fluxo?">
            <RadioPills opcoes={["Intenso", "Regular", "Pouco"]} value={form.fluxo} onChange={v => set("fluxo", v)} />
          </Campo>
          <Campo label="Tem cólicas intensas?">
            <SimNao value={form.colicasIntensas} onChange={v => set("colicasIntensas", v)} />
          </Campo>
          <Campo label="Tem diagnóstico de Endometriose?">
            <SimNao value={form.endometriose} onChange={v => set("endometriose", v)} />
          </Campo>
          <Campo label="Tem diagnóstico de SOP?">
            <SimNao value={form.sop} onChange={v => set("sop", v)} />
          </Campo>
          <Campo label="Tem sintomas de TPM?">
            <InputText placeholder="Descreva se houver..." value={form.sintomasTPM} onChange={e => set("sintomasTPM", e.target.value)} />
          </Campo>
          <Campo label="Usa método contraceptivo?">
            <InputText placeholder="Qual? Deixe em branco se não usar" value={form.contraceptivo} onChange={e => set("contraceptivo", e.target.value)} />
          </Campo>
        </>)}

        {/* MOTIVAÇÃO */}
        {secaoAtual === "motivacao" && (<>
          <Campo label="O quanto você está motivado(a) para mudar?">
            <Escala value={form.motivacao} onChange={v => set("motivacao", v)} min="Pouco motivado" max="Muito motivado" />
          </Campo>
          <Campo label="Por que essa mudança é importante para você?" hint="Escreva com sinceridade — isso ajuda muito a Manuela">
            <TextArea placeholder="Conte sua história..." value={form.importancia} onChange={e => set("importancia", e.target.value)} rows={6} />
          </Campo>
        </>)}

      </main>

      {/* ── Botão fixo na base ───────────────────────────────── */}
      <div className="pc-font shrink-0 px-5 py-4 bg-white border-t border-gray-50">
        {secaoIdx < totalSecoes - 1 ? (
          <button
            onClick={() => setSecaoIdx(secaoIdx + 1)}
            className="w-full flex items-center justify-center gap-2 bg-[#6b5e8b] hover:bg-[#5b4f78] text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95"
          >
            Continuar <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-[#6b5e8b] hover:bg-[#5b4f78] text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {enviando ? "Enviando..." : <>Enviar questionário <CheckCircle2 size={15} /></>}
          </button>
        )}
      </div>
    </div>
  );
};

export default PreConsulta;
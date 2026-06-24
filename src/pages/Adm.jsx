import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, collectionGroup, onSnapshot, doc, updateDoc, arrayUnion, addDoc, getDoc, query, orderBy } from "firebase/firestore";
import { 
  LogOut, Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight, RotateCcw, 
  MessageCircle, ChevronRight as ChevronIcon, Users, BarChart3, CheckCircle2, 
  AlertCircle, LayoutDashboard, Menu, Search, Filter, ArrowUpDown, History, ChevronDown, Mail, ClipboardList,
  Target, Leaf, Salad, HeartPulse, Flower2, Sparkles, Repeat
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatarData = (data) => {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

/* ── Grade de horários — idêntica à usada em Agendamento.jsx ──────────────
   Segunda(1) e Quinta(4): só manhã. Terça(2), Quarta(3) e Sexta(5): manhã + tarde.
   Fins de semana: sem atendimento. ─────────────────────────────────────── */
const obterSlotsDoDia = (data) => {
  const diaDaSemana = data.getDay();
  const manha = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30"];
  const tarde  = ["14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
  switch (diaDaSemana) {
    case 1: case 4: return [...manha];
    case 2: case 3: case 5: return [...manha, ...tarde];
    default: return [];
  }
};

// Quantos slots de 30min cada tipo de consulta ocupa na grade
const chunksPorDuracao = (duracao) => duracao === "1h30" ? 3 : duracao === "30min" ? 1 : 2;

const formatarDuracaoLabel = (duracao) =>
  duracao === "1h30" ? "1h 30min" : duracao === "30min" ? "30 min" : "1 Hora";

/* ── Leitura do questionário de pré-consulta (tela "Formulários") ─────────── */
const CAMPOS_LEGIVEL = {
  sexo: "Sexo",
  objetivos: "Objetivos",
  objetivoOutro: "Outro objetivo",
  nutricionistaAntes: "Consultou nutricionista antes?",
  tentouMudarHabitos: "Tentou mudar hábitos?",
  dificuldadeMudanca: "Dificuldade para mudança",
  usouRecurso: "Usou recurso de controle de peso?",
  qualRecurso: "Qual recurso?",
  pesoAtual: "Peso atual (kg)",
  altura: "Altura (cm)",
  descricaoObjetivo: "Descrição do objetivo",
  problemaSaude: "Problema de saúde",
  historicoDencas: "Histórico familiar de doenças",
  medicamentos: "Medicamentos em uso",
  examesRecentes: "Exames laboratoriais recentes?",
  pesaComFrequencia: "Frequência que se pesa",
  familiaAcimaPeso: "Familiares acima do peso",
  cargaHoraria: "Carga horária de trabalho",
  rotinaTrab: "Rotina de trabalho",
  localTrabRecursos: "Recursos no trabalho",
  quemPrepara: "Quem prepara as refeições",
  disposicao: "Disposição diária (1–5)",
  sintomasCansaco: "Sintomas frequentes",
  qualidadeSono: "Qualidade do sono",
  horarioSono: "Horário de dormir/acordar",
  estressada: "Frequentemente estressado(a)?",
  reacaoEstresse: "Reação ao estresse",
  nivelEstresse: "Nível de estresse (1–5)",
  memoria: "Qualidade da memória",
  praticaAtividade: "Pratica atividade física?",
  qualAtividade: "Qual atividade?",
  motivoNaoAtividade: "Por que não pratica?",
  frequenciaAtividade: "Frequência de atividade",
  horarioAtividade: "Horário da atividade",
  desempenhoAtividade: "Desempenho na atividade",
  alimentacao: "Como avalia a alimentação",
  horarioFome: "Horário de maior fome",
  alergiaAlimentar: "Alergia ou intolerância",
  consumoAgua: "Consumo de água",
  alcool: "Consumo de álcool",
  fumante: "É fumante?",
  restauranteFreq: "Frequência em restaurantes/delivery",
  suplementacao: "Usa suplementação?",
  qualSuplemento: "Qual suplementação?",
  intestino: "Funcionamento intestinal",
  sintomasCorporais: "Sintomas corporais",
  cicloRegular: "Ciclo menstrual regular?",
  fluxo: "Fluxo menstrual",
  colicasIntensas: "Cólicas intensas?",
  endometriose: "Endometriose?",
  sop: "SOP?",
  sintomasTPM: "Sintomas de TPM",
  contraceptivo: "Método contraceptivo",
  motivacao: "Nível de motivação (1–5)",
  importancia: "Importância da mudança",
};

const SECOES_MAPA = {
  "Objetivos": { Icon: Target, campos: ["sexo","objetivos","objetivoOutro","nutricionistaAntes","tentouMudarHabitos","dificuldadeMudanca","usouRecurso","qualRecurso","pesoAtual","altura","descricaoObjetivo"] },
  "Histórico de Saúde": { Icon: ClipboardList, campos: ["problemaSaude","historicoDencas","medicamentos","examesRecentes","pesaComFrequencia","familiaAcimaPeso"] },
  "Estilo de Vida": { Icon: Leaf, campos: ["cargaHoraria","rotinaTrab","localTrabRecursos","quemPrepara","disposicao","sintomasCansaco","qualidadeSono","horarioSono","estressada","reacaoEstresse","nivelEstresse","memoria","praticaAtividade","qualAtividade","motivoNaoAtividade","frequenciaAtividade","horarioAtividade","desempenhoAtividade"] },
  "Hábitos Alimentares": { Icon: Salad, campos: ["alimentacao","horarioFome","alergiaAlimentar","consumoAgua","alcool","fumante","restauranteFreq","suplementacao","qualSuplemento"] },
  "Sintomas": { Icon: HeartPulse, campos: ["intestino","sintomasCorporais"] },
  "Saúde Feminina": { Icon: Flower2, campos: ["cicloRegular","fluxo","colicasIntensas","endometriose","sop","sintomasTPM","contraceptivo"] },
  "Motivação": { Icon: Sparkles, campos: ["motivacao","importancia"] },
};

// Campos de texto livre/longo — ganham a linha toda no grid, em vez de ficar espremidos numa coluna
const CAMPOS_TEXTO_LONGO = new Set([
  "descricaoObjetivo", "problemaSaude", "historicoDencas", "medicamentos", "dificuldadeMudanca", "importancia",
]);

const formatarValorCampo = (val) => {
  if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) return null;
  if (Array.isArray(val)) return val.join(" · ");
  return String(val);
};

const formatarDataResposta = (resposta) => {
  if (!resposta?.enviadoEm) return "—";
  return new Date(resposta.enviadoEm?.toDate?.() || resposta.enviadoEm).toLocaleDateString("pt-BR");
};

const formatarDataHoraResposta = (resposta) => {
  if (!resposta?.enviadoEm) return "—";
  const d = new Date(resposta.enviadoEm?.toDate?.() || resposta.enviadoEm);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

const Adm = () => {
  const navigate = useNavigate();

  // Paleta Exclusiva de Lilás e Roxos da sua Imagem
  const ROXO_DESTAQUE = "#a090c9";     // Lilás Principal / Místico
  const ROXO_PROFUNDO = "#4c3e70";     // Roxo Escuro / Ameixa Nobre
  const LILAS_SUAVE = "#f2effa";       // Fundo Lilás bem claro (substituindo o bege)
  const TEXTO_LILAS = "#61528a";       // Lilás intermediário para badges e textos secundários

  const [telaAtiva, setTelaAtiva] = useState("agenda"); 
  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("Nutrição");
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [clientesTodos, setClientesTodos] = useState([]);
  const [dataFiltro, setDataFiltro] = useState(new Date()); 
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clienteFicha, setClienteFicha] = useState(null);
  const [respostasPorUid, setRespostasPorUid] = useState({}); // uid -> respostas do novo histórico (subcoleção)
  const [legadoPorUid, setLegadoPorUid] = useState({}); // uid -> resposta única antiga (pré-histórico)
  const [clienteFormularioSelecionado, setClienteFormularioSelecionado] = useState(null); // uid selecionado na aba Formulários
  const [respostaFormularioSelecionada, setRespostaFormularioSelecionada] = useState(null); // resposta específica em exibição
  const [buscaFormularios, setBuscaFormularios] = useState("");
  const [mostrarDetalheFormularioMobile, setMostrarDetalheFormularioMobile] = useState(false); // alterna lista/detalhe no mobile
  const [modalNovoHistorico, setModalNovoHistorico] = useState(false);
  const [modalLogOut, setModalLogOut] = useState(false);
  const [novoServico, setNovoServico] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [ordenacao, setOrdenacao] = useState("nome"); 

  // Agendar Retorno (nova aba)
  const [etapaRetorno, setEtapaRetorno] = useState(1);
  const [clienteRetorno, setClienteRetorno] = useState(null);
  const [buscaRetorno, setBuscaRetorno] = useState("");
  const [servicoRetorno, setServicoRetorno] = useState("");
  const [dataRetorno, setDataRetorno] = useState(new Date());
  const [mesRetorno, setMesRetorno] = useState(new Date());
  const [horarioRetorno, setHorarioRetorno] = useState(null);
  const [valorRetorno, setValorRetorno] = useState("");
  const [salvandoRetorno, setSalvandoRetorno] = useState(false);
  const [retornoSucesso, setRetornoSucesso] = useState(false);

  const lidarComLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "usuarios"), (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setClientesTodos(lista);

      const agendamentosAcumulados = [];
      lista.forEach((c) => {
        if (c.agendamentos && Array.isArray(c.agendamentos)) {
          c.agendamentos.forEach((ag) => {
            agendamentosAcumulados.push({
              ...ag,
              clienteId: c.id,
              clienteNome: c.nome || "Sem Nome",
              clienteTelefone: c.telefone || "",
              clienteEmail: c.email || "",
            });
          });
        }
      });

      agendamentosAcumulados.sort((a, b) => {
        if (a.data !== b.data) {
          const [diaA, mesA, anoA] = a.data.split("/");
          const [diaB, mesB, anoB] = b.data.split("/");
          return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
        }
        return a.horario.localeCompare(b.horario);
      });

      setTodosAgendamentos(agendamentosAcumulados);
    });
    return () => unsub();
  }, []);

  // Histórico de formulários de pré-consulta de TODOS os pacientes, para a aba "Formulários".
  // "respostas" é uma subcoleção homônima em cada preConsulta/{uid}, então uma collectionGroup
  // query traz tudo de uma vez, sem precisar selecionar cliente por cliente.
  useEffect(() => {
    const qTodasRespostas = query(collectionGroup(db, "respostas"), orderBy("enviadoEm", "desc"));
    const unsubRespostas = onSnapshot(qTodasRespostas, (snap) => {
      const agrupado = {};
      snap.docs.forEach((d) => {
        const dados = d.data();
        const uid = dados.uid || d.ref.parent.parent?.id;
        if (!uid) return;
        if (!agrupado[uid]) agrupado[uid] = [];
        agrupado[uid].push({ id: d.id, ...dados });
      });
      setRespostasPorUid(agrupado);
    });

    // Compatibilidade: respostas enviadas antes deste histórico existir ficam
    // apenas no documento único "preConsulta/{uid}"
    const unsubLegado = onSnapshot(collection(db, "preConsulta"), (snap) => {
      const mapa = {};
      snap.forEach((d) => { mapa[d.id] = { id: "legado", ...d.data() }; });
      setLegadoPorUid(mapa);
    });

    return () => { unsubRespostas(); unsubLegado(); };
  }, []);

  useEffect(() => {
    if (clienteSelecionado) {
      const cAtualizado = clientesTodos.find((c) => c.id === clienteSelecionado.id);
      if (cAtualizado) {
        const total = cAtualizado.historico?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
        setClienteFicha({ ...cAtualizado, totalGeral: total });
      }
    }
  }, [clientesTodos, clienteSelecionado]);

  const alterarStatusAgendamento = async (ag, novoStatus) => {
    try {
      const cRef = doc(db, "usuarios", ag.clienteId);
      const cData = clientesTodos.find((c) => c.id === ag.clienteId);
      if (!cData) return;

      const agendamentosAtualizados = cData.agendamentos.map((item) => {
        if (item.data === ag.data && item.horario === ag.horario && item.servico === ag.servico) {
          return { ...item, status: novoStatus };
        }
        return item;
      });

      if (novoStatus === "concluido") {
        const historicoAdicional = {
          servico: ag.servico,
          duracao: ag.duracao || "1h",
          data: ag.data,
          horario: ag.horario,
          valor: ag.valor || 0,
          status: "concluido",
        };
        await updateDoc(cRef, {
          agendamentos: agendamentosAtualizados,
          historico: arrayUnion(historicoAdicional),
        });
      } else {
        await updateDoc(cRef, { agendamentos: agendamentosAtualizados });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const adicionarAoHistoricoManual = async (e) => {
    e.preventDefault();
    if (!novoServico || !novoValor) return;
    try {
      const cRef = doc(db, "usuarios", clienteFicha.id);
      const novoItem = {
        servico: novoServico,
        valor: Number(novoValor),
        data: formatarData(new Date()),
        horario: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: "concluido",
      };
      await updateDoc(cRef, { historico: arrayUnion(novoItem) });
      setNovoServico("");
      setNovoValor("");
      setModalNovoHistorico(false);
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Agendar Retorno: mesma grade de horários do Agendamento.jsx ────── */
  // Lista completa de clientes (como no Banco de Clientes), filtrada pela busca quando houver
  const clientesParaRetorno = clientesTodos
    .filter((c) =>
      buscaRetorno === "" ||
      (c.nome && c.nome.toLowerCase().includes(buscaRetorno.toLowerCase())) ||
      (c.telefone && c.telefone.includes(buscaRetorno))
    )
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  const slotsRetorno = obterSlotsDoDia(dataRetorno);

  // Bloqueia os slots já ocupados por qualquer agendamento (de qualquer duração) naquele dia
  const horariosOcupadosRetorno = (() => {
    const dataString = formatarData(dataRetorno);
    let blocos = [];
    todosAgendamentos.forEach((ag) => {
      if (ag.data !== dataString || ag.status === "cancelado") return;
      const idx = slotsRetorno.indexOf(ag.horario);
      if (idx === -1) return;
      const chunks = chunksPorDuracao(ag.duracao);
      for (let i = 0; i < chunks; i++) {
        if (idx + i < slotsRetorno.length) blocos.push(slotsRetorno[idx + i]);
      }
    });
    return [...new Set(blocos)];
  })();

  const slotLivreRetorno = (hora) => !horariosOcupadosRetorno.includes(hora);

  const mudarMesRetorno = (dir) => setMesRetorno(new Date(mesRetorno.getFullYear(), mesRetorno.getMonth() + dir, 1));
  const irParaHojeRetorno = () => { const h = new Date(); setMesRetorno(h); setDataRetorno(h); };
  const diasNoMesRetorno = new Date(mesRetorno.getFullYear(), mesRetorno.getMonth() + 1, 0).getDate();
  const primeiroDiaRetorno = new Date(mesRetorno.getFullYear(), mesRetorno.getMonth(), 1).getDay();

  const limparFormularioRetorno = () => {
    setClienteRetorno(null);
    setBuscaRetorno("");
    setServicoRetorno("");
    setHorarioRetorno(null);
    setValorRetorno("");
    setEtapaRetorno(1);
  };

  const confirmarRetorno = async () => {
    if (!clienteRetorno) return alert("Selecione um cliente.");
    if (!servicoRetorno) return alert("Selecione o serviço.");
    if (!horarioRetorno) return alert("Selecione um horário.");

    try {
      setSalvandoRetorno(true);
      const dataString = formatarData(dataRetorno);

      const novoRetorno = {
        servico: servicoRetorno,
        duracao: "30min",
        valor: Number(valorRetorno) || 0,
        data: dataString,
        horario: horarioRetorno,
        status: "pendente",
        tipo: "retorno",
        timestamp: new Date(),
        userId: clienteRetorno.id,
        userName: clienteRetorno.nome || "Cliente",
      };

      const docRef = await addDoc(collection(db, "agendamentos"), novoRetorno);
      const cRef = doc(db, "usuarios", clienteRetorno.id);
      await updateDoc(cRef, { agendamentos: arrayUnion({ ...novoRetorno, id: docRef.id }) });

      setRetornoSucesso(true);
      limparFormularioRetorno();
    } catch (err) {
      console.error(err);
      alert("Erro ao agendar o retorno: " + err.message);
    } finally {
      setSalvandoRetorno(false);
    }
  };

  const agendamentosFiltrados = todosAgendamentos.filter((ag) => {
    const bateData = ag.data === formatarData(dataFiltro);
    const bateStatus = statusFiltro === "todos" || ag.status === statusFiltro;
    const bateBusca = busca === "" || (ag.clienteNome && ag.clienteNome.toLowerCase().includes(busca.toLowerCase()));
    return bateData && bateStatus && bateBusca;
  });

  const clientesFiltradosETordenados = clientesTodos
    .filter((c) => busca === "" || (c.nome && c.nome.toLowerCase().includes(busca.toLowerCase())) || (c.telefone && c.telefone.includes(busca)))
    .sort((a, b) => {
      if (ordenacao === "nome") return (a.nome || "").localeCompare(b.nome || "");
      const totalA = a.historico?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
      const totalB = b.historico?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
      return totalB - totalA;
    });

  // Junta o histórico novo (subcoleção "respostas") com o documento legado por uid,
  // produzindo uma lista de pacientes com pelo menos um formulário respondido.
  const formulariosPorCliente = Array.from(new Set([...Object.keys(respostasPorUid), ...Object.keys(legadoPorUid)]))
    .map((uid) => {
      const respostasNovas = respostasPorUid[uid] || [];
      const legado = legadoPorUid[uid];
      let respostas = [...respostasNovas];
      if (legado) {
        const dataLegado = legado.enviadoEm?.toDate?.() || legado.enviadoEm;
        const jaExiste = respostas.some((r) => {
          const dataR = r.enviadoEm?.toDate?.() || r.enviadoEm;
          return dataLegado && dataR && new Date(dataLegado).getTime() === new Date(dataR).getTime();
        });
        if (!jaExiste) respostas.push(legado);
      }
      respostas.sort((a, b) => {
        const da = a.enviadoEm?.toDate?.() || a.enviadoEm || 0;
        const dbb = b.enviadoEm?.toDate?.() || b.enviadoEm || 0;
        return new Date(dbb) - new Date(da);
      });
      const maisRecente = respostas[0];
      const cadastro = clientesTodos.find((c) => c.id === uid);
      return {
        uid,
        nome: cadastro?.nome || maisRecente?.nome || "Sem Nome",
        telefone: cadastro?.telefone || maisRecente?.telefone || "",
        email: cadastro?.email || maisRecente?.email || "",
        respostas,
        totalRespostas: respostas.length,
        dataMaisRecente: maisRecente?.enviadoEm,
      };
    })
    .sort((a, b) => {
      const da = a.dataMaisRecente?.toDate?.() || a.dataMaisRecente || 0;
      const dbb = b.dataMaisRecente?.toDate?.() || b.dataMaisRecente || 0;
      return new Date(dbb) - new Date(da);
    });

  const formulariosFiltrados = formulariosPorCliente.filter((f) =>
    buscaFormularios === "" ||
    (f.nome && f.nome.toLowerCase().includes(buscaFormularios.toLowerCase())) ||
    (f.telefone && f.telefone.includes(buscaFormularios))
  );

  const clienteFormAtivo = formulariosPorCliente.find((f) => f.uid === clienteFormularioSelecionado) || null;
  const respostaFormAtiva = clienteFormAtivo
    ? (clienteFormAtivo.respostas.find((r) => r.id === respostaFormularioSelecionada?.id) || clienteFormAtivo.respostas[0] || null)
    : null;
  const totalRespostasClienteFicha = clienteFicha
    ? (formulariosPorCliente.find((f) => f.uid === clienteFicha.id)?.totalRespostas || 0)
    : 0;

  const faturamentoTotalPeriodo = agendamentosFiltrados
    .filter((ag) => ag.status === "concluido")
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const totalClientesAtendidosPeriodo = new Set(
    agendamentosFiltrados.filter((ag) => ag.status === "concluido").map((ag) => ag.clienteId),
  ).size;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 px-4 lg:px-6 py-4 sticky top-0 z-40 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuAberto(!menuAberto)} className="lg:hidden text-slate-600 hover:text-slate-900 transition">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} style={{ color: ROXO_DESTAQUE }} />
            <h1 className="text-base lg:text-xl font-black text-slate-900 tracking-tight">
              Painel <span style={{ color: ROXO_DESTAQUE }}>Administrativo</span>
            </h1>
          </div>
        </div>
        <button onClick={() => setModalLogOut(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs transition-all shadow-xs">
          <LogOut size={14} /> Sair
        </button>
      </header>

      <div className="flex flex-1 relative">
        {/* SIDEBAR RESPONSIVO */}
        <aside className={`w-64 bg-white border-r border-slate-100 p-4 flex flex-col gap-2 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:h-[calc(100vh-73px)] ${menuAberto ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
          <div className="lg:hidden flex justify-end mb-2">
            <button onClick={() => setMenuAberto(false)} className="text-slate-400 hover:text-slate-700"><X size={22} /></button>
          </div>
          <button
            onClick={() => { setTelaAtiva("agenda"); setMenuAberto(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              backgroundColor: telaAtiva === "agenda" ? ROXO_DESTAQUE : "transparent",
              color: telaAtiva === "agenda" ? "white" : "#475569",
              boxShadow: telaAtiva === "agenda" ? `0 8px 16px -4px rgba(160, 144, 201, 0.4)` : "none"
            }}
          >
            <CalendarIcon size={16} /> Agenda de Consultas
          </button>
          <button
            onClick={() => { setTelaAtiva("retorno"); setMenuAberto(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              backgroundColor: telaAtiva === "retorno" ? ROXO_DESTAQUE : "transparent",
              color: telaAtiva === "retorno" ? "white" : "#475569",
              boxShadow: telaAtiva === "retorno" ? `0 8px 16px -4px rgba(160, 144, 201, 0.4)` : "none"
            }}
          >
            <Repeat size={16} /> Agendar Retorno
          </button>
          <button
            onClick={() => { setTelaAtiva("clientes"); setMenuAberto(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              backgroundColor: telaAtiva === "clientes" ? ROXO_DESTAQUE : "transparent",
              color: telaAtiva === "clientes" ? "white" : "#475569",
              boxShadow: telaAtiva === "clientes" ? `0 8px 16px -4px rgba(160, 144, 201, 0.4)` : "none"
            }}
          >
            <Users size={16} /> Banco de Clientes
          </button>
          <button
            onClick={() => { setTelaAtiva("formularios"); setMenuAberto(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              backgroundColor: telaAtiva === "formularios" ? ROXO_DESTAQUE : "transparent",
              color: telaAtiva === "formularios" ? "white" : "#475569",
              boxShadow: telaAtiva === "formularios" ? `0 8px 16px -4px rgba(160, 144, 201, 0.4)` : "none"
            }}
          >
            <ClipboardList size={16} /> Formulários
            {formulariosPorCliente.length > 0 && (
              <span
                className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: telaAtiva === "formularios" ? "rgba(255,255,255,0.25)" : LILAS_SUAVE,
                  color: telaAtiva === "formularios" ? "white" : TEXTO_LILAS,
                }}
              >
                {formulariosPorCliente.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setTelaAtiva("metricas"); setMenuAberto(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            style={{
              backgroundColor: telaAtiva === "metricas" ? ROXO_DESTAQUE : "transparent",
              color: telaAtiva === "metricas" ? "white" : "#475569",
              boxShadow: telaAtiva === "metricas" ? `0 8px 16px -4px rgba(160, 144, 201, 0.4)` : "none"
            }}
          >
            <BarChart3 size={16} /> Métricas & Faturamento
          </button>
        </aside>

        {menuAberto && <div onClick={() => setMenuAberto(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden" />}

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-3 lg:p-6 overflow-x-hidden max-w-full">
          {telaAtiva === "agenda" && (
            <div className="space-y-4 lg:space-y-6 animate-fade-in">
              {/* FILTROS DE DATA E ABAS */}
              <div className="bg-white p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="flex items-center justify-between md:justify-start gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button onClick={() => { const d = new Date(dataFiltro); d.setDate(d.getDate() - 1); setDataFiltro(d); }} className="p-2 bg-white hover:bg-slate-50 rounded-lg transition text-slate-600 shadow-xs"><ChevronLeft size={16} /></button>
                  <span className="font-black text-xs text-slate-800 min-w-[110px] text-center uppercase tracking-wider">{dataFiltro.toLocaleDateString("pt-BR", { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                  <button onClick={() => { const d = new Date(dataFiltro); d.setDate(d.getDate() + 1); setDataFiltro(d); }} className="p-2 bg-white hover:bg-slate-50 rounded-lg transition text-slate-600 shadow-xs"><ChevronRight size={16} /></button>
                  <button onClick={() => setDataFiltro(new Date())} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400" title="Hoje"><RotateCcw size={14} /></button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 md:flex md:gap-2">
                  {["Nutrição", "Farmácia", "Acupuntura"].map((serv) => (
                    <button
                      key={serv}
                      onClick={() => setAbaAtiva(serv)}
                      className="px-3 md:px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all text-center"
                      style={{
                        backgroundColor: abaAtiva === serv ? ROXO_DESTAQUE : "white",
                        color: abaAtiva === serv ? "white" : "#64748b",
                        border: abaAtiva === serv ? "none" : "1px solid #e2e8f0",
                        boxShadow: abaAtiva === serv ? `0 4px 10px rgba(160, 144, 201, 0.25)` : "none"
                      }}
                    >
                      {serv}
                    </button>
                  ))}
                </div>
              </div>

              {/* BARRA DE PESQUISA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Buscar cliente por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-xs transition focus:border-slate-400" />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="w-full bg-white pl-9 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-xs appearance-none cursor-pointer font-bold text-slate-600">
                    <option value="todos">Todos Status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="concluido">Concluídos</option>
                    <option value="faltou">Faltas</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* LISTAGEM */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                {/* Desktop (Tabela) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Horário</th>
                        <th className="py-4 px-6">Cliente</th>
                        <th className="py-4 px-6">Serviço / Duração</th>
                        <th className="py-4 px-6">Valor</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {agendamentosFiltrados.filter(ag => ag.servico === abaAtiva).length > 0 ? (
                        agendamentosFiltrados.filter(ag => ag.servico === abaAtiva).map((ag, index) => (
                          <tr key={index} className="hover:bg-slate-50/30 transition group text-xs">
                            <td className="py-4 px-6 font-bold text-slate-700"><div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {ag.horario}</div></td>
                            <td className="py-4 px-6"><p className="font-extrabold text-slate-800">{ag.clienteNome}</p><p className="text-[11px] text-slate-400 mt-0.5">{ag.clienteTelefone}</p></td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">{ag.servico}</span>
                                <span className="text-[10px] font-bold text-purple-600 px-2 py-0.5 bg-purple-50 rounded-md border border-purple-100">{formatarDuracaoLabel(ag.duracao)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-extrabold text-slate-700">R$ {ag.valor || 0},00</td>
                            <td className="py-4 px-6">
                              <span className="text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full" style={{ backgroundColor: ag.status === "concluido" ? LILAS_SUAVE : ag.status === "faltou" ? "#fef3c7" : ag.status === "cancelado" ? "#fee2e2" : "#dbeafe", color: ag.status === "concluido" ? TEXTO_LILAS : ag.status === "faltou" ? "#b45309" : ag.status === "cancelado" ? "#b91c1c" : "#1d4ed8" }}>
                                {ag.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {ag.status === "pendente" && (
                                <div className="flex gap-1 justify-end opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                                  <button onClick={() => alterarStatusAgendamento(ag, "concluido")} className="p-2 rounded-lg transition hover:bg-slate-100 text-slate-700" title="Concluir"><CheckCircle2 size={15} style={{ color: ROXO_DESTAQUE }} /></button>
                                  <button onClick={() => alterarStatusAgendamento(ag, "faltou")} className="p-2 rounded-lg transition hover:bg-amber-50 text-amber-600" title="Marcar Falta"><AlertCircle size={15} /></button>
                                  <button onClick={() => alterarStatusAgendamento(ag, "cancelado")} className="p-2 rounded-lg transition hover:bg-red-50 text-red-600" title="Cancelar"><X size={15} /></button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="6" className="py-12 text-center text-slate-400 font-medium"><CalendarIcon className="mx-auto mb-2 text-slate-300" size={28} /> Nenhum agendamento para hoje.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="block md:hidden divide-y divide-slate-100">
                  {agendamentosFiltrados.filter(ag => ag.servico === abaAtiva).length > 0 ? (
                    agendamentosFiltrados.filter(ag => ag.servico === abaAtiva).map((ag, index) => (
                      <div key={index} className="p-4 space-y-3 bg-white">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                            <Clock size={14} style={{ color: ROXO_DESTAQUE }} /> {ag.horario}
                            <span className="ml-1 text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">({formatarDuracaoLabel(ag.duracao)})</span>
                          </div>
                          <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: ag.status === "concluido" ? LILAS_SUAVE : ag.status === "faltou" ? "#fef3c7" : ag.status === "cancelado" ? "#fee2e2" : "#dbeafe", color: ag.status === "concluido" ? TEXTO_LILAS : ag.status === "faltou" ? "#b45309" : ag.status === "cancelado" ? "#b91c1c" : "#1d4ed8" }}>
                            {ag.status}
                          </span>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{ag.clienteNome}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{ag.clienteTelefone}</p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                          <span className="text-xs font-black text-slate-800">R$ {ag.valor || 0},00</span>
                          {ag.status === "pendente" && (
                            <div className="flex gap-1.5">
                              <button onClick={() => alterarStatusAgendamento(ag, "concluido")} className="flex items-center gap-1 px-3 py-2 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase">Concluir</button>
                              <button onClick={() => alterarStatusAgendamento(ag, "faltou")} className="p-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">Falta</button>
                              <button onClick={() => alterarStatusAgendamento(ag, "cancelado")} className="p-2 bg-red-50 text-red-600 rounded-lg"><X size={14} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-slate-400 text-xs"><CalendarIcon className="mx-auto mb-2 text-slate-300" size={24} /> Sem consultas agendadas.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {telaAtiva === "retorno" && (
            <div className="max-w-md mx-auto animate-fade-in">
              {retornoSucesso ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-10 text-center space-y-3">
                  <CheckCircle2 className="mx-auto" size={40} style={{ color: ROXO_DESTAQUE }} />
                  <h3 className="font-black text-slate-800 text-sm">Retorno agendado com sucesso!</h3>
                  <p className="text-slate-400 text-xs">O cliente já consegue ver essa consulta na agenda dele.</p>
                  <button
                    onClick={() => setRetornoSucesso(false)}
                    className="mt-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all"
                    style={{ backgroundColor: ROXO_DESTAQUE, boxShadow: `0 4px 14px rgba(160, 144, 201, 0.35)` }}
                  >
                    Agendar outro retorno
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">

                  {/* Indicador de progresso */}
                  <div className="flex items-center gap-1.5 px-5 pt-5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="h-1 flex-1 rounded-full transition-all" style={{ backgroundColor: n <= etapaRetorno ? ROXO_DESTAQUE : "#e2e8f0" }} />
                    ))}
                  </div>

                  {/* ETAPA 1: CLIENTE — lista completa, como no Banco de Clientes */}
                  {etapaRetorno === 1 && (
                    <div className="p-5 space-y-3">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Users size={14} style={{ color: ROXO_DESTAQUE }} /> Selecione o cliente
                      </h3>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                          type="text"
                          placeholder="Buscar por nome ou telefone..."
                          value={buscaRetorno}
                          onChange={(e) => setBuscaRetorno(e.target.value)}
                          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs transition focus:border-slate-400"
                        />
                      </div>
                      <div className="border border-slate-100 rounded-xl max-h-[26rem] overflow-y-auto divide-y divide-slate-50">
                        {clientesParaRetorno.length > 0 ? clientesParaRetorno.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => { setClienteRetorno(c); setEtapaRetorno(2); }}
                            className="w-full text-left p-3 flex items-center gap-3 hover:bg-slate-50 transition"
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold uppercase text-xs shrink-0" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}>
                              {(c.nome || "SN").slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-xs truncate">{c.nome || "Sem Nome"}</p>
                              <p className="text-[11px] text-slate-400">{c.telefone || "Sem telefone"}</p>
                            </div>
                          </button>
                        )) : (
                          <p className="p-6 text-center text-xs text-slate-400">Nenhum cliente encontrado.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ETAPA 2: SERVIÇO */}
                  {etapaRetorno === 2 && (
                    <div className="p-5 space-y-3">
                      <button onClick={() => setEtapaRetorno(1)} className="flex items-center gap-1.5 font-bold text-xs mb-1" style={{ color: ROXO_DESTAQUE }}>
                        <ChevronLeft size={15} /> Voltar
                      </button>
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <ClipboardList size={14} style={{ color: ROXO_DESTAQUE }} /> Serviço do retorno
                      </h3>
                      <p className="text-[11px] text-slate-400">Cliente: <span className="font-bold text-slate-600">{clienteRetorno?.nome}</span></p>
                      <div className="space-y-2">
                        {["Nutrição", "Farmácia", "Acupuntura"].map((serv) => (
                          <button
                            key={serv}
                            onClick={() => setServicoRetorno(serv)}
                            className="w-full px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-left"
                            style={{
                              backgroundColor: servicoRetorno === serv ? ROXO_DESTAQUE : "white",
                              color: servicoRetorno === serv ? "white" : "#64748b",
                              border: servicoRetorno === serv ? "none" : "1px solid #e2e8f0",
                            }}
                          >
                            {serv}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-xl" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}>
                        <Clock size={13} /> Consulta de retorno · duração fixa de 30 minutos
                      </div>
                      {servicoRetorno && (
                        <button
                          onClick={() => setEtapaRetorno(3)}
                          className="w-full mt-1 py-3.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                          style={{ backgroundColor: ROXO_DESTAQUE, boxShadow: `0 4px 14px rgba(160, 144, 201, 0.35)` }}
                        >
                          Continuar
                        </button>
                      )}
                    </div>
                  )}

                  {/* ETAPA 3: DATA */}
                  {etapaRetorno === 3 && (
                    <div className="p-5 space-y-3">
                      <button onClick={() => setEtapaRetorno(2)} className="flex items-center gap-1.5 font-bold text-xs mb-1" style={{ color: ROXO_DESTAQUE }}>
                        <ChevronLeft size={15} /> Voltar
                      </button>
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <CalendarIcon size={14} style={{ color: ROXO_DESTAQUE }} /> Escolha a data
                      </h3>
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div className="flex gap-1">
                          <button onClick={() => mudarMesRetorno(-1)} className="p-2 hover:bg-white rounded-lg text-slate-600 transition"><ChevronLeft size={16} /></button>
                          <button onClick={() => mudarMesRetorno(1)} className="p-2 hover:bg-white rounded-lg text-slate-600 transition"><ChevronRight size={16} /></button>
                        </div>
                        <span className="font-black text-xs text-slate-800 uppercase tracking-wider">
                          {mesRetorno.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                        </span>
                        <button onClick={irParaHojeRetorno} className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-600 shadow-xs transition hover:shadow-md" title="Hoje">
                          <RotateCcw size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                          <div key={i} className="text-center text-[10px] font-black text-slate-300 py-1.5">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {[...Array(primeiroDiaRetorno)].map((_, i) => <div key={`e-${i}`} />)}
                        {[...Array(diasNoMesRetorno)].map((_, i) => {
                          const dia = i + 1;
                          const data = new Date(mesRetorno.getFullYear(), mesRetorno.getMonth(), dia);
                          const isSel = data.toDateString() === dataRetorno.toDateString();
                          const isHoje = data.toDateString() === new Date().toDateString();
                          const isFds = data.getDay() === 0 || data.getDay() === 6;
                          return (
                            <button
                              key={dia}
                              disabled={isFds}
                              onClick={() => { setDataRetorno(data); setHorarioRetorno(null); }}
                              className="h-9 w-9 mx-auto rounded-lg flex items-center justify-center font-bold text-xs transition-all"
                              style={{
                                color: isFds ? "#cbd5e1" : isSel ? "white" : "#475569",
                                backgroundColor: isSel ? ROXO_DESTAQUE : "transparent",
                                border: isHoje && !isSel && !isFds ? `2px solid ${ROXO_DESTAQUE}` : "none",
                                cursor: isFds ? "not-allowed" : "pointer",
                              }}
                            >
                              {dia}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setEtapaRetorno(4)}
                        className="w-full mt-1 py-3.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                        style={{ backgroundColor: ROXO_DESTAQUE, boxShadow: `0 4px 14px rgba(160, 144, 201, 0.35)` }}
                      >
                        Ver Horários Disponíveis
                      </button>
                    </div>
                  )}

                  {/* ETAPA 4: HORÁRIO — mesma grade de Agendamento.jsx, slots de 30min */}
                  {etapaRetorno === 4 && (
                    <div className="p-5 space-y-3">
                      <button onClick={() => setEtapaRetorno(3)} className="flex items-center gap-1.5 font-bold text-xs mb-1" style={{ color: ROXO_DESTAQUE }}>
                        <ChevronLeft size={15} /> Voltar
                      </button>
                      <div className="rounded-xl p-3 text-center" style={{ backgroundColor: LILAS_SUAVE }}>
                        <p className="font-bold text-xs" style={{ color: TEXTO_LILAS }}>
                          {dataRetorno.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: TEXTO_LILAS }}>{servicoRetorno} · Retorno · 30min</p>
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">Horário disponível</h3>
                      {slotsRetorno.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {slotsRetorno.map((hora) => {
                            const livre = slotLivreRetorno(hora);
                            return (
                              <button
                                key={hora}
                                disabled={!livre}
                                onClick={() => { setHorarioRetorno(hora); setEtapaRetorno(5); }}
                                className="p-2.5 rounded-xl font-bold border text-[11px] transition-all"
                                style={{
                                  backgroundColor: !livre ? "#f1f5f9" : horarioRetorno === hora ? ROXO_DESTAQUE : "white",
                                  color: !livre ? "#94a3b8" : horarioRetorno === hora ? "white" : "#475569",
                                  borderColor: !livre ? "#e2e8f0" : horarioRetorno === hora ? ROXO_DESTAQUE : "#e2e8f0",
                                  cursor: !livre ? "not-allowed" : "pointer",
                                  opacity: !livre ? 0.6 : 1,
                                }}
                              >
                                {!livre ? "Ocupado" : hora}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-slate-400 text-xs py-4">Nenhum horário disponível para este dia.</p>
                      )}
                    </div>
                  )}

                  {/* ETAPA 5: CONFIRMAÇÃO */}
                  {etapaRetorno === 5 && (
                    <div className="p-5 space-y-3">
                      <button onClick={() => setEtapaRetorno(4)} className="flex items-center gap-1.5 font-bold text-xs mb-1" style={{ color: ROXO_DESTAQUE }}>
                        <ChevronLeft size={15} /> Voltar
                      </button>
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">Confirmar retorno</h3>
                      <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
                        <p className="flex justify-between"><span className="font-bold">Cliente:</span> {clienteRetorno?.nome}</p>
                        <p className="flex justify-between"><span className="font-bold">Serviço:</span> {servicoRetorno}</p>
                        <p className="flex justify-between"><span className="font-bold">Data:</span> {dataRetorno.toLocaleDateString("pt-BR")}</p>
                        <p className="flex justify-between"><span className="font-bold">Horário:</span> {horarioRetorno}</p>
                        <p className="flex justify-between"><span className="font-bold">Duração:</span> 30 minutos</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Valor cobrado (R$) — opcional</label>
                        <input
                          type="number"
                          placeholder="Ex: 0"
                          value={valorRetorno}
                          onChange={(e) => setValorRetorno(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none text-xs font-semibold"
                        />
                      </div>
                      <button
                        onClick={confirmarRetorno}
                        disabled={salvandoRetorno}
                        className="w-full py-3.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        style={{ backgroundColor: ROXO_DESTAQUE, boxShadow: `0 4px 14px rgba(160, 144, 201, 0.35)` }}
                      >
                        {salvandoRetorno ? "Agendando..." : "Confirmar Retorno"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {telaAtiva === "clientes" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Buscar por nome ou telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-xs transition" />
                  </div>
                  <button onClick={() => setOrdenacao(ordenacao === "nome" ? "faturamento" : "nome")} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition shadow-xs whitespace-nowrap">
                    <ArrowUpDown size={14} /> {ordenacao === "nome" ? "Ordem: Nome" : "Ordem: Valor Pago"}
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {clientesFiltradosETordenados.length > 0 ? (
                      clientesFiltradosETordenados.map((c) => {
                        const totalFaturado = c.historico?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
                        return (
                          <div key={c.id} onClick={() => setClienteSelecionado(c)} className="p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50/40" style={clienteSelecionado?.id === c.id ? { borderLeft: `4px solid ${ROXO_DESTAQUE}`, paddingLeft: "12px", backgroundColor: LILAS_SUAVE } : {}}>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold uppercase text-xs" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}>{(c.nome || "SN").slice(0, 2)}</div>
                              <div><h3 className="font-extrabold text-slate-800 text-xs">{c.nome || "Sem Nome"}</h3><p className="text-[11px] text-slate-400 mt-0.5">{c.telefone || "Sem Telefone"}</p></div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div><p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Total Pago</p><p className="font-black text-slate-700 text-xs">R$ {totalFaturado},00</p></div>
                              <ChevronIcon size={14} className="text-slate-300" />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs"><Users className="mx-auto mb-2 text-slate-300" size={28} /> Nenhum cliente localizado.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* DETALHES / FICHA DO CLIENTE */}
              <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-5">
                {clienteFicha ? (
                  <div className="space-y-5">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm uppercase" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}>{(clienteFicha.nome || "SN").slice(0,2)}</div>
                        <div><h2 className="font-black text-slate-900 text-sm">{clienteFicha.nome || "Sem Nome"}</h2><p className="text-[11px] text-slate-400 mt-0.5">Ficha do Cliente</p></div>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><Mail size={14} className="text-slate-400" /><div className="overflow-hidden"><p className="text-[9px] text-slate-400 uppercase font-bold">E-mail</p><p className="font-semibold text-slate-700 truncate">{clienteFicha.email || "Não informado"}</p></div></div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><MessageCircle size={14} className="text-slate-400" /><div><p className="text-[9px] text-slate-400 uppercase font-bold">WhatsApp</p><p className="font-semibold text-slate-700">{clienteFicha.telefone || "Não informado"}</p></div></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: LILAS_SUAVE, borderColor: "#e6e1f5" }}><p className="text-[9px] uppercase font-black tracking-wider" style={{ color: TEXTO_LILAS }}>Consultas</p><p className="font-black text-lg mt-0.5" style={{ color: ROXO_PROFUNDO }}>{clienteFicha.historico?.length || 0}</p></div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Total Já Pago</p><p className="font-black text-slate-700 text-lg mt-0.5">R$ {clienteFicha.totalGeral || 0},00</p></div>
                      </div>
                    </div>

                    {/* Histórico de Atendimentos */}
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                        <History size={12} /> Histórico de Atendimentos
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {clienteFicha.historico?.length > 0 ? (
                          clienteFicha.historico.map((h, i) => (
                            <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-slate-800">{h.servico} <span className="text-[10px] text-purple-600">({h.duracao || "1h"})</span></p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{h.data} • {h.horario} • <strong className="text-slate-700">R$ {h.valor},00</strong></p>
                              </div>
                              <span className="text-[8px] font-black uppercase px-2 py-1 rounded-md" style={{ backgroundColor: h.status === "concluido" ? LILAS_SUAVE : "#fee2e2", color: h.status === "concluido" ? TEXTO_LILAS : "#b91c1c" }}>
                                {h.status === "concluido" ? "OK" : h.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 py-4 text-center">Nenhum registro.</p>
                        )}
                      </div>
                      <button onClick={() => setModalNovoHistorico(true)} className="w-full mt-3 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition">Lançar Atendimento</button>
                    </div>

                    {/* Atalho para os formulários de pré-consulta deste paciente */}
                    <button
                      onClick={() => {
                        setTelaAtiva("formularios");
                        setClienteFormularioSelecionado(clienteFicha.id);
                        setRespostaFormularioSelecionada(null);
                        setMostrarDetalheFormularioMobile(true);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all"
                      style={totalRespostasClienteFicha > 0
                        ? { backgroundColor: LILAS_SUAVE, borderColor: "#e6e1f5" }
                        : { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
                    >
                      <span className="flex items-center gap-2 text-xs font-bold" style={{ color: totalRespostasClienteFicha > 0 ? TEXTO_LILAS : "#64748b" }}>
                        <ClipboardList size={14} />
                        {totalRespostasClienteFicha > 0
                          ? `Ver questionário${totalRespostasClienteFicha > 1 ? "s" : ""} de pré-consulta`
                          : "Sem questionário de pré-consulta"}
                      </span>
                      {totalRespostasClienteFicha > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: ROXO_DESTAQUE, color: "white" }}>
                          {totalRespostasClienteFicha}
                        </span>
                      )}
                    </button>

                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs"><History className="mx-auto mb-2 text-slate-300" size={28} /> Selecione um cliente para ver a ficha completa.</div>
                )}
              </div>
            </div>
          )}

          {telaAtiva === "formularios" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
              {/* LISTA DE PACIENTES COM FORMULÁRIO RESPONDIDO */}
              <div className={`lg:col-span-1 space-y-3 ${mostrarDetalheFormularioMobile ? "hidden lg:block" : "block"}`}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    value={buscaFormularios}
                    onChange={(e) => setBuscaFormularios(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-xs transition"
                  />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto">
                  <div className="divide-y divide-slate-100">
                    {formulariosFiltrados.length > 0 ? (
                      formulariosFiltrados.map((f) => {
                        const selecionado = clienteFormularioSelecionado === f.uid;
                        return (
                          <div
                            key={f.uid}
                            onClick={() => {
                              setClienteFormularioSelecionado(f.uid);
                              setRespostaFormularioSelecionada(null);
                              setMostrarDetalheFormularioMobile(true);
                            }}
                            className="p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50/40"
                            style={selecionado ? { borderLeft: `4px solid ${ROXO_DESTAQUE}`, paddingLeft: "12px", backgroundColor: LILAS_SUAVE } : {}}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold uppercase text-xs shrink-0" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}>
                                {(f.nome || "SN").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-extrabold text-slate-800 text-xs truncate">{f.nome}</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Última resposta: {formatarDataResposta(f.respostas[0])}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: ROXO_DESTAQUE, color: "white" }} title={`${f.totalRespostas} formulário(s) respondido(s)`}>
                                {f.totalRespostas}
                              </span>
                              <ChevronIcon size={14} className="text-slate-300" />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        <ClipboardList className="mx-auto mb-2 text-slate-300" size={28} />
                        {buscaFormularios ? "Nenhum paciente encontrado." : "Nenhum formulário respondido ainda."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DETALHE DO FORMULÁRIO SELECIONADO */}
              <div className={`lg:col-span-2 ${mostrarDetalheFormularioMobile ? "block" : "hidden lg:block"}`}>
                {clienteFormAtivo ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto">
                    {/* Cabeçalho do paciente + seletor de respostas */}
                    <div className="p-5 lg:p-6 border-b border-slate-100 space-y-4 lg:sticky lg:top-0 bg-white z-10">
                      <button
                        onClick={() => setMostrarDetalheFormularioMobile(false)}
                        className="lg:hidden flex items-center gap-1.5 text-slate-500 font-bold text-xs"
                      >
                        <ChevronLeft size={16} /> Voltar para a lista
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0" style={{ backgroundColor: LILAS_SUAVE, color: TEXTO_LILAS }}>
                          {(clienteFormAtivo.nome || "SN").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-black text-slate-900 text-base truncate">{clienteFormAtivo.nome}</h2>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                            {clienteFormAtivo.telefone && <span className="flex items-center gap-1"><MessageCircle size={11} /> {clienteFormAtivo.telefone}</span>}
                            {clienteFormAtivo.email && <span className="flex items-center gap-1"><Mail size={11} /> {clienteFormAtivo.email}</span>}
                          </div>
                        </div>
                      </div>

                      {clienteFormAtivo.respostas.length > 1 && (
                        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                          {clienteFormAtivo.respostas.map((resp, i) => {
                            const selecionada = respostaFormAtiva?.id === resp.id;
                            return (
                              <button
                                key={resp.id}
                                onClick={() => setRespostaFormularioSelecionada(resp)}
                                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all"
                                style={selecionada
                                  ? { backgroundColor: ROXO_DESTAQUE, color: "white", borderColor: ROXO_DESTAQUE }
                                  : { color: "#64748b", borderColor: "#e2e8f0", backgroundColor: "white" }}
                              >
                                {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                {formatarDataResposta(resp)}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Enviado em {formatarDataHoraResposta(respostaFormAtiva)}
                        {clienteFormAtivo.respostas.length > 1 && clienteFormAtivo.respostas[0]?.id === respostaFormAtiva?.id ? " • Resposta mais recente" : ""}
                      </p>
                    </div>

                    {/* Seções do questionário */}
                    <div className="p-5 lg:p-6 space-y-4">
                      {Object.entries(SECOES_MAPA).map(([secao, { Icon, campos }]) => {
                        if (secao === "Saúde Feminina" && respostaFormAtiva?.sexo === "Masculino") return null;
                        const camposComValor = campos
                          .map((campo) => ({ campo, valor: formatarValorCampo(respostaFormAtiva?.[campo]) }))
                          .filter((c) => c.valor);
                        if (camposComValor.length === 0) return null;
                        return (
                          <div key={secao} className="border border-slate-100 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                              <Icon size={15} style={{ color: ROXO_DESTAQUE }} />
                              <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">{secao}</h3>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              {camposComValor.map(({ campo, valor }) => (
                                <div key={campo} className={CAMPOS_TEXTO_LONGO.has(campo) ? "sm:col-span-2 lg:col-span-3" : ""}>
                                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{CAMPOS_LEGIVEL[campo] || campo}</p>
                                  <p className="text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">{valor}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs py-20 text-center text-slate-400 text-xs">
                    <ClipboardList className="mx-auto mb-2 text-slate-300" size={32} />
                    Selecione um paciente na lista para ver as respostas do questionário.
                  </div>
                )}
              </div>
            </div>
          )}

          {telaAtiva === "metricas" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
              <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-xs"><p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Faturamento Período</p><p className="text-2xl font-black text-slate-900 mt-1">R$ {faturamentoTotalPeriodo},00</p></div>
              <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-xs"><p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Clientes Atendidos</p><p className="text-2xl font-black text-slate-900 mt-1">{totalClientesAtendidosPeriodo}</p></div>
              <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-xs"><p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Consultas Concluídas</p><p className="text-2xl font-black text-slate-900 mt-1">{agendamentosFiltrados.filter(ag => ag.status === "concluido").length}</p></div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL LANÇAR ATENDIMENTO */}
      {modalNovoHistorico && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white p-5 rounded-t-2xl sm:rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm">Registrar Procedimento</h3>
              <button onClick={() => setModalNovoHistorico(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={adicionarAoHistoricoManual} className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Serviço / Tratamento</label>
                <select value={novoServico} onChange={(e) => setNovoServico(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none text-xs font-semibold text-slate-700">
                  <option value="">Selecione...</option>
                  <option value="Nutrição">Nutrição</option>
                  <option value="Farmácia">Farmácia</option>
                  <option value="Acupuntura">Acupuntura</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Valor Cobrado (R$)</label>
                <input type="number" placeholder="Ex: 150" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none text-xs font-semibold" />
              </div>
              <button type="submit" className="w-full py-3 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all" style={{ backgroundColor: ROXO_DESTAQUE, boxShadow: `0 4px 14px rgba(160, 144, 201, 0.35)` }}>
                Salvar no Histórico
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR LOGOUT */}
      {modalLogOut && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white p-5 rounded-t-2xl sm:rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm">Confirmar Saída</h3>
              <button onClick={() => setModalLogOut(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-600">Tem certeza de que deseja encerrar a sua sessão e sair do painel administrativo?</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalLogOut(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all hover:bg-slate-50">Cancelar</button>
              <button onClick={lidarComLogout} className="flex-1 py-2.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all" style={{ backgroundColor: ROXO_DESTAQUE, boxShadow: `0 4px 14px rgba(160, 144, 201, 0.35)` }}>Confirmar e Sair</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adm;
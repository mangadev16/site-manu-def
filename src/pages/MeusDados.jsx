import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot, getDoc, collection, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ClipboardList, ChevronDown, ChevronUp, PlusCircle, FileText, Download, Wifi, MessageCircle } from "lucide-react";
import Header from "./Header";

/* ── Campos exatos do PreConsulta.jsx atual ─────────────────── */
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
  "Objetivos": ["sexo","objetivos","objetivoOutro","nutricionistaAntes","tentouMudarHabitos","dificuldadeMudanca","usouRecurso","qualRecurso","pesoAtual","altura","descricaoObjetivo"],
  "Histórico de Saúde": ["problemaSaude","historicoDencas","medicamentos","examesRecentes","pesaComFrequencia","familiaAcimaPeso"],
  "Estilo de Vida": ["cargaHoraria","rotinaTrab","localTrabRecursos","quemPrepara","disposicao","sintomasCansaco","qualidadeSono","horarioSono","estressada","reacaoEstresse","nivelEstresse","memoria","praticaAtividade","qualAtividade","motivoNaoAtividade","frequenciaAtividade","horarioAtividade","desempenhoAtividade"],
  "Hábitos Alimentares": ["alimentacao","horarioFome","alergiaAlimentar","consumoAgua","alcool","fumante","restauranteFreq","suplementacao","qualSuplemento"],
  "Sintomas": ["intestino","sintomasCorporais"],
  "Saúde Feminina": ["cicloRegular","fluxo","colicasIntensas","endometriose","sop","sintomasTPM","contraceptivo"],
  "Motivação": ["motivacao","importancia"],
};

const formatarValor = (val) => {
  if (!val || (Array.isArray(val) && val.length === 0)) return null;
  if (Array.isArray(val)) return val.join(" · ");
  return String(val);
};

// Converte "dd/mm/yyyy" + "HH:MM" em timestamp, para ordenar as consultas
const timestampAgendamento = (ag) => {
  if (!ag?.data) return 0;
  const [dia, mes, ano] = ag.data.split("/");
  const [hora, minuto] = (ag.horario || "00:00").split(":");
  return new Date(ano, mes - 1, dia, hora || 0, minuto || 0).getTime();
};

const MeusDados = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [consultaAbertaId, setConsultaAbertaId] = useState(null);
  const [respostasPreConsulta, setRespostasPreConsulta] = useState([]);
  const [respostaExpandidaId, setRespostaExpandidaId] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("consultas");
  const [secoesAbertas, setSecoesAbertas] = useState({});
  const navigate = useNavigate();
  const nomeCompleto = auth.currentUser?.displayName || "Usuário";
  const nomeUsuario = nomeCompleto.includes("|") ? nomeCompleto.split("|")[0] : nomeCompleto;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Agendamentos via onSnapshot no doc do usuário
    const unsubAgendamentos = onSnapshot(doc(db, "usuarios", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const lista = [...(docSnap.data().agendamentos || [])];
        lista.sort((a, b) => timestampAgendamento(b) - timestampAgendamento(a));
        setAgendamentos(lista);
      }
    });

    // Histórico de pré-consulta: cada envio fica salvo como uma resposta própria
    const qRespostas = query(
      collection(db, "preConsulta", user.uid, "respostas"),
      orderBy("enviadoEm", "desc")
    );
    const unsubRespostas = onSnapshot(qRespostas, async (snap) => {
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Compatibilidade: respostas enviadas antes deste histórico existir
      // ficam só no documento único "preConsulta/{uid}" — inclui como a mais antiga
      try {
        const legadoSnap = await getDoc(doc(db, "preConsulta", user.uid));
        if (legadoSnap.exists()) {
          const legado = legadoSnap.data();
          const dataLegado = legado.enviadoEm?.toDate?.() || legado.enviadoEm;
          const jaExiste = lista.some((r) => {
            const dataR = r.enviadoEm?.toDate?.() || r.enviadoEm;
            return dataLegado && dataR && new Date(dataLegado).getTime() === new Date(dataR).getTime();
          });
          if (!jaExiste) lista.push({ id: "legado", ...legado });
        }
      } catch (e) { /* segue sem o legado em caso de erro */ }

      setRespostasPreConsulta(lista);
    });

    return () => { unsubAgendamentos(); unsubRespostas(); };
  }, []);

  const toggleSecao = (s) => setSecoesAbertas((prev) => ({ ...prev, [s]: !prev[s] }));

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">
      <Header nomeUsuario={nomeUsuario} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col items-center">
        <div className="w-full max-w-[640px] space-y-6">

          {/* Abas */}
          <div className="flex gap-2 bg-white border-2 border-gray-100 p-1.5 rounded-2xl">
            {[
              { key: "consultas", label: "Minhas Consultas", icon: <Calendar size={14} /> },
              { key: "questionario", label: "Pré-Consulta", icon: <ClipboardList size={14} /> },
            ].map((aba) => (
              <button
                key={aba.key}
                onClick={() => setAbaAtiva(aba.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  abaAtiva === aba.key
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {aba.icon} {aba.label}
              </button>
            ))}
          </div>

          {/* Aba: Consultas */}
          {abaAtiva === "consultas" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#064e3b]">HISTÓRICO DE CONSULTAS</h2>

              {/* Botão WhatsApp — consulta online mais recente */}
              {(() => {
                const online = [...agendamentos]
                  .filter(ag => ag.modalidade === "Online" && ag.status !== "cancelado")
                  .sort((a, b) => {
                    const toTs = (ag) => ag.timestamp?.toDate?.() || new Date(ag.timestamp || 0);
                    return toTs(b) - toTs(a);
                  })[0];
                if (!online) return null;
                return (
                  <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Wifi size={15} className="text-sky-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sky-800 text-sm">Consulta Online · {online.servico}</p>
                        <p className="text-sky-600 text-[11px] mt-0.5 leading-relaxed">
                          Entre em contato pelo WhatsApp para combinar o link da chamada ({online.data} às {online.horario}).
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/5599999999999"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <MessageCircle size={16} />
                      (99) 99999-9999
                    </a>
                  </div>
                );
              })()}

              {agendamentos.length === 0 ? (
                <div className="bg-white p-10 rounded-[30px] border-2 border-dashed border-gray-100 text-center text-gray-400">
                  Nenhum agendamento encontrado.
                </div>
              ) : (
                agendamentos.map((ag) => {
                  const chave = ag.id || `${ag.data}-${ag.horario}`;
                  const aberto = consultaAbertaId === chave;
                  return (
                    <div
                      key={chave}
                      className="bg-white rounded-[35px] border-2 border-emerald-50 shadow-sm overflow-hidden transition-all hover:shadow-md"
                    >
                      <button
                        onClick={() => setConsultaAbertaId(aberto ? null : chave)}
                        className="w-full p-6 flex justify-between items-center text-left gap-3"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`p-4 rounded-2xl shrink-0 ${ag.modalidade === "Online" ? "bg-sky-50 text-sky-500" : "bg-emerald-50 text-emerald-600"}`}>
                            {ag.modalidade === "Online" ? <Wifi size={24} /> : <Calendar size={24} />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-800 text-lg truncate">{ag.servico}</h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1 flex-wrap">
                              <Clock size={14} className="text-emerald-400" />
                              <span>{ag.data} às {ag.horario}</span>
                              {ag.modalidade && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ag.modalidade === "Online" ? "bg-sky-50 text-sky-600" : "bg-emerald-50 text-emerald-700"}`}>
                                  {ag.modalidade}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {ag.documentacoes?.length > 0 && (
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1.5 rounded-full" title={`${ag.documentacoes.length} documentação(ões) enviada(s)`}>
                              <FileText size={11} /> {ag.documentacoes.length}
                            </span>
                          )}
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-full uppercase">
                            {ag.status || "Confirmado"}
                          </span>
                          {aberto ? <ChevronUp size={16} className="text-emerald-500" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </div>
                      </button>

                      {aberto && (
                        <div className="px-6 pb-6 border-t-2 border-emerald-50 pt-4 space-y-3">
                          {ag.documentacoes?.length > 0 ? (
                            [...ag.documentacoes].reverse().map((docItem, i) => (
                              <div key={i} className="bg-emerald-50/60 rounded-2xl p-4 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Documentação da nutricionista</p>
                                  {i === 0 && ag.documentacoes.length > 1 && (
                                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Mais recente</span>
                                  )}
                                </div>
                                {docItem.texto && (
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{docItem.texto}</p>
                                )}
                                {docItem.urlPDF && (
                                  <a
                                    href={docItem.urlPDF}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all"
                                  >
                                    <Download size={13} /> Baixar PDF
                                  </a>
                                )}
                                <p className="text-[10px] text-gray-400">
                                  Enviado em {new Date(docItem.enviadoEm).toLocaleDateString("pt-BR")} às {new Date(docItem.enviadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-2">A nutricionista ainda não enviou nenhuma documentação para esta consulta.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Aba: Questionário */}
          {abaAtiva === "questionario" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-[#064e3b]">SUAS RESPOSTAS</h2>
                {respostasPreConsulta.length > 0 && (
                  <button
                    onClick={() => navigate("/pre-consulta?novo=1")}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shrink-0"
                  >
                    <PlusCircle size={14} /> Novo formulário
                  </button>
                )}
              </div>

              {respostasPreConsulta.length === 0 ? (
                <div className="bg-white p-10 rounded-[30px] border-2 border-dashed border-gray-100 text-center space-y-4">
                  <ClipboardList size={40} className="mx-auto text-gray-300" />
                  <p className="text-gray-400">Você ainda não respondeu o questionário de pré-consulta.</p>
                  <button
                    onClick={() => navigate("/pre-consulta")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all"
                  >
                    Responder Agora
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl px-4 py-3 text-xs text-emerald-700 font-bold">
                    {respostasPreConsulta.length === 1
                      ? "✅ Estas respostas são somente para leitura. Se algo mudou, você pode responder um novo formulário antes da próxima consulta."
                      : `✅ Você tem ${respostasPreConsulta.length} questionários respondidos. Acesse o mais recente ou os anteriores abaixo.`}
                  </div>

                  {respostasPreConsulta.map((resposta, idx) => {
                    const expandido = respostaExpandidaId === resposta.id;
                    const dataFormatada = resposta.enviadoEm
                      ? new Date(resposta.enviadoEm?.toDate?.() || resposta.enviadoEm).toLocaleDateString("pt-BR")
                      : "—";
                    return (
                      <div key={resposta.id} className="bg-white rounded-[28px] border-2 border-emerald-50 shadow-sm overflow-hidden">
                        <button
                          onClick={() => setRespostaExpandidaId(expandido ? null : resposta.id)}
                          className="w-full flex items-center justify-between p-5 text-left gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 shrink-0">
                              <ClipboardList size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-800 text-sm">Respondido em {dataFormatada}</span>
                                {idx === 0 && respostasPreConsulta.length > 1 && (
                                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                                    Mais recente
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400">Somente leitura</span>
                            </div>
                          </div>
                          {expandido ? <ChevronUp size={16} className="text-emerald-500 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                        </button>

                        {expandido && (
                          <div className="px-5 pb-5 space-y-3 border-t-2 border-emerald-50 pt-4">
                            {Object.entries(SECOES_MAPA).map(([secao, campos]) => {
                              // Ocultar seção de saúde feminina se o paciente for homem
                              if (secao === "Saúde Feminina" && resposta.sexo === "Masculino") return null;
                              const chave = `${resposta.id}__${secao}`;
                              return (
                                <div key={secao} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                                  <button
                                    onClick={() => toggleSecao(chave)}
                                    className="w-full flex justify-between items-center p-4 text-left"
                                  >
                                    <span className="font-black text-[11px] text-[#064e3b] uppercase tracking-wider">{secao}</span>
                                    {secoesAbertas[chave] ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-gray-400" />}
                                  </button>
                                  {secoesAbertas[chave] && (
                                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                                      {campos.map((campo) => {
                                        const val = formatarValor(resposta[campo]);
                                        if (!val) return null;
                                        return (
                                          <div key={campo} className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                              {CAMPOS_LEGIVEL[campo] || campo}
                                            </span>
                                            <span className="text-sm text-gray-700 font-medium">{val}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      {/* Modal visualizador de PDF via PDF.js */}
    </div>
  );
};

export default MeusDados;
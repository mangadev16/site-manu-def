import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import Header from "./Header";

const CAMPOS_LEGIVEL = {
  dataNascimento: "Data de Nascimento",
  idade: "Idade",
  profissao: "Profissão",
  telefone: "Telefone",
  email: "E-mail",
  cidade: "Cidade",
  estadoCivil: "Estado Civil",
  objetivos: "Objetivos",
  objetivoOutro: "Outro objetivo",
  buscouNutricionistaAntes: "Buscou nutricionista antes?",
  tentouMudarHabitos: "Tentou mudar hábitos antes?",
  dificuldadeMudanca: "Dificuldade para mudança",
  utilizouRecursoControle: "Utilizou recurso de controle de peso?",
  qualRecurso: "Qual recurso?",
  pesoAtual: "Peso atual (kg)",
  altura: "Altura (cm)",
  descricaoObjetivo: "Descrição do objetivo",
  problemaSaude: "Problema de saúde",
  historicoDoeancasFamiliar: "Histórico familiar de doenças",
  medicamentosAtuais: "Medicamentos em uso",
  examesRecentes: "Exames recentes?",
  frequenciaPeso: "Frequência que se pesa",
  familiaAcimaDosPeso: "Familiares acima do peso",
  cargaHorariaTrabalho: "Carga horária de trabalho",
  rotinaTrabalhoo: "Rotina de trabalho",
  localTrabalhoRecursos: "Recursos no trabalho",
  quemPrepRefeicoes: "Quem prepara as refeições",
  disposicaoDiaria: "Disposição diária (1–5)",
  sintomasGerais: "Sintomas frequentes",
  qualidadeSono: "Qualidade do sono",
  horarioDormir: "Horário de dormir",
  horarioAcordar: "Horário de acordar",
  frequentementeEstressada: "Frequentemente estressada?",
  reacaoEstresse: "Reação ao estresse",
  nivelEstresse: "Nível de estresse (1–5)",
  memoria: "Qualidade da memória",
  praticaAtividade: "Pratica atividade física?",
  qualAtividade: "Qual atividade?",
  porqueNaoAtividade: "Por que não pratica?",
  frequenciaAtividade: "Frequência de atividade",
  horarioAtividade: "Horário da atividade",
  desempenhoAtividade: "Desempenho na atividade",
  consideraAlimentacao: "Considera sua alimentação",
  horarioMaisFome: "Horário de maior fome",
  alergiaIntolerancia: "Alergia ou intolerância",
  consumoAgua: "Consumo de água",
  consumoAlcool: "Consumo de álcool",
  fumante: "É fumante?",
  frequenciaRestaurante: "Frequência em restaurantes/delivery",
  suplementacao: "Usa suplementação?",
  qualSuplementacao: "Qual suplementação?",
  intestino: "Funcionamento intestinal",
  sintomasCorpo: "Sintomas corporais",
  cicloRegular: "Ciclo menstrual",
  fluxo: "Fluxo menstrual",
  colicasIntensas: "Cólicas intensas?",
  endometriose: "Endometriose?",
  sop: "SOP?",
  sintomasTPM: "Sintomas de TPM",
  outroTPM: "Outros sintomas de TPM",
  metodoContraceptivo: "Método contraceptivo",
  nivelMotivacao: "Nível de motivação (1–5)",
  importanciaObjetivo: "Importância da mudança",
};

const SECOES_MAPA = {
  "Dados Pessoais": ["dataNascimento", "idade", "profissao", "telefone", "email", "cidade", "estadoCivil"],
  "Objetivos": ["objetivos", "objetivoOutro", "buscouNutricionistaAntes", "tentouMudarHabitos", "dificuldadeMudanca", "utilizouRecursoControle", "qualRecurso", "pesoAtual", "altura", "descricaoObjetivo"],
  "Histórico de Saúde": ["problemaSaude", "historicoDoeancasFamiliar", "medicamentosAtuais", "examesRecentes", "frequenciaPeso", "familiaAcimaDosPeso"],
  "Estilo de Vida": ["cargaHorariaTrabalho", "rotinaTrabalhoo", "localTrabalhoRecursos", "quemPrepRefeicoes", "disposicaoDiaria", "sintomasGerais", "qualidadeSono", "horarioDormir", "horarioAcordar", "frequentementeEstressada", "reacaoEstresse", "nivelEstresse", "memoria", "praticaAtividade", "qualAtividade", "porqueNaoAtividade", "frequenciaAtividade", "horarioAtividade", "desempenhoAtividade"],
  "Hábitos Alimentares": ["consideraAlimentacao", "horarioMaisFome", "alergiaIntolerancia", "consumoAgua", "consumoAlcool", "fumante", "frequenciaRestaurante", "suplementacao", "qualSuplementacao"],
  "Sintomas": ["intestino", "sintomasCorpo"],
  "Saúde da Mulher": ["cicloRegular", "fluxo", "colicasIntensas", "endometriose", "sop", "sintomasTPM", "outroTPM", "metodoContraceptivo"],
  "Motivação": ["nivelMotivacao", "importanciaObjetivo"],
};

const formatarValor = (val) => {
  if (!val || (Array.isArray(val) && val.length === 0)) return <span className="text-gray-300 italic text-xs">Não respondido</span>;
  if (Array.isArray(val)) return val.join(" · ");
  return val;
};

const MeusDados = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [preConsulta, setPreConsulta] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("consultas");
  const [secoesAbertas, setSecoesAbertas] = useState({});
  const navigate = useNavigate();
  const nomeCompleto = auth.currentUser?.displayName || "Usuário";
  const nomeUsuario = nomeCompleto.includes("|") ? nomeCompleto.split("|")[0] : nomeCompleto;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(doc(db, "usuarios", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setAgendamentos(docSnap.data().agendamentos || []);
        setPreConsulta(docSnap.data().preConsulta || null);
      }
    });
    return () => unsub();
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
              {agendamentos.length === 0 ? (
                <div className="bg-white p-10 rounded-[30px] border-2 border-dashed border-gray-100 text-center text-gray-400">
                  Nenhum agendamento encontrado.
                </div>
              ) : (
                agendamentos.map((ag) => (
                  <div
                    key={ag.id}
                    className="bg-white p-6 rounded-[35px] border-2 border-emerald-50 shadow-sm flex justify-between items-center transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{ag.servico}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                          <Clock size={14} className="text-emerald-400" />
                          <span>{ag.data} às {ag.horario}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-full uppercase">
                      {ag.status || "Confirmado"}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Aba: Questionário */}
          {abaAtiva === "questionario" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#064e3b]">SUAS RESPOSTAS</h2>

              {!preConsulta ? (
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
                <>
                  <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl px-4 py-3 text-xs text-emerald-700 font-bold">
                    ✅ Respondido em {new Date(preConsulta.respondidoEm).toLocaleDateString("pt-BR")} — estas respostas são somente para leitura.
                  </div>

                  {Object.entries(SECOES_MAPA).map(([secao, campos]) => (
                    <div key={secao} className="bg-white rounded-[25px] border-2 border-emerald-50 shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleSecao(secao)}
                        className="w-full flex justify-between items-center p-5 text-left"
                      >
                        <span className="font-black text-sm text-[#064e3b] uppercase tracking-wider">{secao}</span>
                        {secoesAbertas[secao] ? <ChevronUp size={16} className="text-emerald-500" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </button>
                      {secoesAbertas[secao] && (
                        <div className="px-5 pb-5 space-y-3 border-t-2 border-emerald-50 pt-4">
                          {campos.map((campo) => {
                            const val = preConsulta[campo];
                            if (!val || (Array.isArray(val) && val.length === 0)) return null;
                            return (
                              <div key={campo} className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                  {CAMPOS_LEGIVEL[campo] || campo}
                                </span>
                                <span className="text-sm text-gray-700 font-medium">{formatarValor(val)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MeusDados;
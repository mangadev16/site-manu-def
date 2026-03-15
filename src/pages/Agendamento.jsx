import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  PenLine,
  ChevronLeft,
  X,
  ChevronRight,
  CheckCircle2,
  User,
  ChevronDown,
  Activity,
  PlusCircle,
  ClipboardList,
  RotateCcw,
  Settings,
  LogOut,
} from "lucide-react";

const Agendamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [etapa, setEtapa] = useState(1);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  // Lógica de Nome (igual ao Dashboard)
  const nomeCompleto = auth.currentUser?.displayName || "Usuário";
  const nomeUsuario = nomeCompleto.includes("|")
    ? nomeCompleto.split("|")[0]
    : nomeCompleto;

  useEffect(() => {
    const buscarHorariosOcupados = async () => {
      try {
        const dataString = dataSelecionada.toLocaleDateString("pt-BR");

        const q = query(
          collection(db, "agendamentos"),
          where("data", "==", dataString)
        );

        const querySnapshot = await getDocs(q);
        const ocupados = querySnapshot.docs.map((doc) => doc.data().horario);
        setHorariosOcupados(ocupados);
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      }
    };

    buscarHorariosOcupados();
  }, [dataSelecionada]);

  const finalizarAgendamento = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const dataString = dataSelecionada.toLocaleDateString("pt-BR");

      const novoAgendamento = {
        servico: servicoSelecionado,
        data: dataString,
        horario: horarioSelecionado,
        status: "pendente",
        timestamp: new Date(),
      };

      await addDoc(collection(db, "agendamentos"), {
        ...novoAgendamento,
        userId: user.uid,
        userName: user.displayName || "Paciente",
      });

      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        agendamentos: arrayUnion({
          ...novoAgendamento,
          id: Date.now().toString(),
        }),
      });

      setEtapa(5);
    } catch (error) {
      console.error("Erro ao finalizar:", error);
    }
  };

  const horarios = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  // Lógica de Calendário
  const mudarMes = (dir) =>
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + dir, 1));
  const irParaHoje = () => {
    const hoje = new Date();
    setMesAtual(hoje);
    setDataSelecionada(hoje);
  };

  const diasNoMes = new Date(
    mesAtual.getFullYear(),
    mesAtual.getMonth() + 1,
    0
  ).getDate();
  const primeiroDia = new Date(
    mesAtual.getFullYear(),
    mesAtual.getMonth(),
    1
  ).getDay();
  const isAtivo = (rota) => location.pathname === rota;

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* CABEÇALHO PADRÃO DASHBOARD */}
      <header className="bg-[#059669] text-white p-4 flex justify-between items-center shadow-md z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMenuAberto(true);
            }}
            className="bg-white text-[#059669] font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md shrink-0 lg:cursor-default"
          >
            MB
          </button>

          <div className="flex items-center gap-6">
            <div>
              <h1 className="font-bold text-sm leading-none uppercase tracking-tight">
                Manuela Bernardo
              </h1>
              <p className="text-[10px] uppercase opacity-90 tracking-tighter">
                Nutrição • Acupuntura • Farmácia
              </p>
            </div>

            <nav className="hidden lg:flex items-center gap-1 ml-4 border-l border-emerald-400/30 pl-6">
              <button
                onClick={() => navigate("/dashboard")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  isAtivo("/dashboard")
                    ? "bg-emerald-700/50"
                    : "hover:bg-emerald-700/30"
                }`}
              >
                <Activity size={14} /> Serviços
              </button>
              <button
                onClick={() => navigate("/agendamento")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  isAtivo("/agendamento")
                    ? "bg-emerald-700/50"
                    : "hover:bg-emerald-700/30"
                }`}
              >
                <PlusCircle size={14} /> Agendar Horário
              </button>
              <button
                onClick={() => navigate("/meus-dados")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  isAtivo("/meus-dados")
                    ? "bg-emerald-700/50"
                    : "hover:bg-emerald-700/30"
                }`}
              >
                <ClipboardList size={14} /> Meus Dados
              </button>
            </nav>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setPerfilAberto(!perfilAberto)}
            className="flex items-center gap-2 bg-emerald-700/50 px-3 py-2 rounded-xl hover:bg-emerald-700/70 transition-all"
          >
            <User size={16} />
            <span className="text-xs font-bold">{nomeUsuario}</span>
            <ChevronDown
              size={14}
              className={perfilAberto ? "rotate-180" : ""}
            />
          </button>
          {perfilAberto && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
              <button
                onClick={() => navigate("/perfil")}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
              >
                <Settings size={16} className="text-emerald-600" /> Dados da Conta
              </button>
              <button
                onClick={() => auth.signOut()}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold border-t border-gray-50"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ÁREA DE AGENDAMENTO */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-[35px] shadow-xl border border-emerald-50 overflow-hidden">
          
          {/* ETAPA 1: CALENDÁRIO */}
          {etapa === 1 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 bg-emerald-50 p-2 rounded-2xl">
                <div className="flex gap-1">
                  <button
                    onClick={() => mudarMes(-1)}
                    className="p-2 hover:bg-white rounded-xl text-emerald-700 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => mudarMes(1)}
                    className="p-2 hover:bg-white rounded-xl text-emerald-700 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <h3 className="font-bold text-emerald-900 uppercase text-xs tracking-widest">
                  {mesAtual.toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>

                <button
                  onClick={irParaHoje}
                  className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl text-[10px] font-black uppercase text-emerald-600 shadow-sm hover:shadow-md transition-all"
                >
                  <RotateCcw size={12} /> Hoje
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] font-black text-emerald-200 py-2"
                  >
                    {d}
                  </div>
                ))}
                {[...Array(primeiroDia)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {[...Array(diasNoMes)].map((_, i) => {
                  const dia = i + 1;
                  const data = new Date(
                    mesAtual.getFullYear(),
                    mesAtual.getMonth(),
                    dia
                  );
                  const isSelecionado =
                    data.toDateString() === dataSelecionada.toDateString();
                  const isHoje =
                    data.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={dia}
                      onClick={() => setDataSelecionada(data)}
                      className={`h-10 w-10 mx-auto rounded-xl flex items-center justify-center font-bold text-sm transition-all
                        ${
                          isSelecionado
                            ? "bg-emerald-600 text-white shadow-lg scale-110"
                            : "text-gray-600 hover:bg-emerald-50"
                        }
                        ${
                          isHoje && !isSelecionado
                            ? "border-2 border-emerald-200 text-emerald-600"
                            : ""
                        }`}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setEtapa(2)}
                className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
              >
                Agendar Horário
              </button>
            </div>
          )}

          {/* ETAPA 2: HORÁRIOS */}
          {etapa === 2 && (
            <div className="p-6">
              <button
                onClick={() => setEtapa(1)}
                className="flex items-center gap-2 text-emerald-600 font-bold mb-4 text-sm"
              >
                <ArrowLeft size={16} /> Voltar ao calendário
              </button>
              <h3 className="font-bold text-gray-800 mb-4">
                Horários disponíveis:
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {horarios.map((hora) => {
                  const estaOcupado = horariosOcupados.includes(hora);

                  return (
                    <button
                      key={hora}
                      disabled={estaOcupado}
                      onClick={() => {
                        setHorarioSelecionado(hora);
                        setEtapa(3);
                      }}
                      className={`p-4 rounded-2xl font-bold border-2 transition-all ${
                        estaOcupado
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                          : horarioSelecionado === hora
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg"
                          : "bg-white border-emerald-50 text-gray-700 hover:border-emerald-200"
                      }`}
                    >
                      {estaOcupado ? "Ocupado" : hora}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ETAPA 3: SELEÇÃO DE SERVIÇO */}
          {etapa === 3 && (
            <div className="p-6 space-y-3">
              <button
                onClick={() => setEtapa(2)}
                className="flex items-center gap-2 text-emerald-600 font-bold mb-2 text-sm"
              >
                <ArrowLeft size={16} /> Voltar
              </button>

              <div className="bg-emerald-50 p-4 rounded-2xl text-center mb-4 border border-emerald-100">
                <p className="text-gray-700 font-bold">
                  {dataSelecionada.toLocaleDateString("pt-BR")} às{" "}
                  {horarioSelecionado}
                </p>
              </div>

              {[
                {
                  id: "Nutrição",
                  icon: <Activity className="text-emerald-600" />,
                  cor: "bg-emerald-50",
                },
                {
                  id: "Acupuntura",
                  icon: <PenLine className="text-blue-600" />,
                  cor: "bg-blue-50",
                },
                {
                  id: "Farmácia",
                  icon: <ClipboardList className="text-purple-600" />,
                  cor: "bg-purple-50",
                },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setServicoSelecionado(s.id);
                    setEtapa(4);
                  }}
                  className={`w-full p-5 rounded-2xl border-2 border-gray-100 flex items-center justify-between hover:border-emerald-500 transition-all ${s.cor}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      {s.icon}
                    </div>
                    <span className="font-bold text-gray-700">{s.id}</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* ETAPA 4: RESUMO E CONFIRMAÇÃO */}
          {etapa === 4 && (
            <div className="p-6 space-y-4">
              <button
                onClick={() => setEtapa(3)}
                className="flex items-center gap-2 text-emerald-600 font-bold mb-2 text-sm"
              >
                <ArrowLeft size={16} /> Voltar
              </button>

              <div className="bg-white border border-emerald-100 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                <h2 className="font-bold text-gray-800 text-lg uppercase tracking-tight">
                  Confirmar Agendamento
                </h2>
                <div className="flex flex-col gap-2 text-gray-600 text-sm text-left bg-gray-50 p-4 rounded-xl">
                  <p className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-bold">Serviço:</span>{" "}
                    {servicoSelecionado}
                  </p>
                  <p className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="font-bold">Data:</span>{" "}
                    {dataSelecionada.toLocaleDateString("pt-BR")}
                  </p>
                  <p className="flex justify-between pb-2">
                    <span className="font-bold">Horário:</span>{" "}
                    {horarioSelecionado}
                  </p>
                </div>
              </div>

              <button
                onClick={finalizarAgendamento}
                className="w-full bg-emerald-600 text-white font-bold rounded-2xl p-4 hover:bg-emerald-700 transition-colors shadow-md"
              >
                Confirmar e Finalizar
              </button>
            </div>
          )}

          {/* ETAPA 5: SUCESSO */}
          {etapa === 5 && (
            <div className="p-6 text-center py-10 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="bg-emerald-100 p-6 rounded-full">
                  <CheckCircle2 size={80} className="text-emerald-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">Agendado!</h2>
                <p className="text-gray-600">
                  Seu horário foi reservado com sucesso.
                </p>
              </div>

              <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm inline-block w-full">
                <p className="text-emerald-800 font-bold text-lg">
                  {servicoSelecionado}
                </p>
                <p className="text-gray-500">
                  {dataSelecionada.toLocaleDateString("pt-BR")} às{" "}
                  {horarioSelecionado}
                </p>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-emerald-600 text-white font-bold rounded-2xl p-4 hover:bg-emerald-700 transition-all shadow-lg"
              >
                Voltar para o Início
              </button>
            </div>
          )}
        </div>
      </main>

      {/* SIDEBAR MOBILE */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b bg-[#059669] text-white flex justify-between items-center">
          <span className="font-bold uppercase text-xs tracking-widest">
            Menu Principal
          </span>
          <button onClick={() => setMenuAberto(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          <button
            onClick={() => {
              navigate("/dashboard");
              setMenuAberto(false);
            }}
            className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${
              isAtivo("/dashboard")
                ? "bg-emerald-50 text-emerald-700"
                : "text-gray-600"
            }`}
          >
            <Activity size={18} /> Serviços
          </button>
          <button
            onClick={() => setMenuAberto(false)}
            className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${
              isAtivo("/agendamento")
                ? "bg-emerald-50 text-emerald-700"
                : "text-gray-600"
            }`}
          >
            <PlusCircle size={18} /> Agendar Horário
          </button>
          <button
            onClick={() => {
              navigate("/meus-dados");
              setMenuAberto(false);
            }}
            className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${
              isAtivo("/meus-dados")
                ? "bg-emerald-50 text-emerald-700"
                : "text-gray-600"
            }`}
          >
            <ClipboardList size={18} /> Meus Dados
          </button>
        </nav>
      </aside>
    </div>
  );
};

export default Agendamento;
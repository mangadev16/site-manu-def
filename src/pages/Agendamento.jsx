import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  ChevronDown,
  Activity,
  PlusCircle,
  RotateCcw,
  Settings,
  LogOut,
  ClipboardList
} from "lucide-react";

const Agendamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [etapa, setEtapa] = useState(1);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [perfilAberto, setPerfilAberto] = useState(false);

  // Lógica de Nome (igual ao Dashboard)
  const nomeCompleto = auth.currentUser?.displayName || "Usuário";
  const nomeUsuario = nomeCompleto.includes("|")
    ? nomeCompleto.split("|")[0]
    : nomeCompleto;


const finalizarAgendamento = async (servicoEscolhido) => {
  try {
    // 1. OBTER O UTILIZADOR PRIMEIRO
    const user = auth.currentUser;
    if (!user) {
      alert("Sessão expirada. Por favor, faça login novamente.");
      return;
    }

    // 2. CRIAR AS REFERÊNCIAS DENTRO DO TRY (após ter o user)
    const clienteRef = doc(db, "usuarios", user.uid);
    
    // 3. TRATAR DADOS DO PERFIL
    const nomeCompleto = user.displayName || "Usuário";
    const nome = nomeCompleto.includes("|") ? nomeCompleto.split("|")[0] : nomeCompleto;
    const whatsapp = nomeCompleto.includes("|") ? nomeCompleto.split("|")[1] : "";

    // 4. FORMATAR A DATA PARA O DOCUMENTO
    const dia = String(dataSelecionada.getDate()).padStart(2, '0');
    const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
    const ano = dataSelecionada.getFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const agendamentoRef = doc(db, "agendamentos", dataFormatada);

    const novoAgendamento = {
      id: String(Date.now()),
      usuarioNome: nome,
      telefone: whatsapp,
      email: user.email,
      horario: horarioSelecionado,
      servico: servicoEscolhido,
      status: "pendente",
      uid: user.uid
    };

    // 5. GRAVAR NO FIREBASE (Sequência correta)
    
    // Primeiro: Garante que o perfil do cliente existe (para aparecer no painel ADM)
    const clienteSnap = await getDoc(clienteRef);
    if (!clienteSnap.exists()) {
      await setDoc(clienteRef, {
        nome: nome,
        telefone: whatsapp,
        email: user.email,
        uid: user.uid,
        historico: []
      });
    }

    // Segundo: Grava o agendamento do dia
    const docSnap = await getDoc(agendamentoRef);
    if (docSnap.exists()) {
      await updateDoc(agendamentoRef, {
        agendamentos: arrayUnion(novoAgendamento)
      });
    } else {
      await setDoc(agendamentoRef, {
        agendamentos: [novoAgendamento]
      });
    }

    alert("Agendamento realizado com sucesso!");
    navigate("/dashboard");

  } catch (error) {
    // Se o banco estiver vazio, o erro aparecerá aqui no console
    console.error("Erro detalhado do Firebase:", error);
    alert("Erro ao gravar: " + error.message);
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
  const servicos = ["Nutrição", "Acupuntura", "Farmácia"];

  // Lógica de Calendário (estilo ADM)
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
    0,
  ).getDate();
  const primeiroDia = new Date(
    mesAtual.getFullYear(),
    mesAtual.getMonth(),
    1,
  ).getDay();
  const isAtivo = (rota) => location.pathname === rota;

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* CABEÇALHO PADRÃO DASHBOARD */}
      <header className="bg-[#059669] text-white p-4 flex justify-between items-center shadow-md z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-[#059669] font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md shrink-0"
          >
            MB
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
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
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${isAtivo("/dashboard") ? "bg-emerald-700/50" : "hover:bg-emerald-700/30"}`}
              >
                <Activity size={14} /> Serviços
              </button>
              <button
                onClick={() => navigate("/agendamento")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${isAtivo("/agendamento") ? "bg-emerald-700/50" : "hover:bg-emerald-700/30"}`}
              >
                <PlusCircle size={14} /> Agendar Horário
              </button>
              <button
                onClick={() => navigate("/meus-dados")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${isAtivo("/perfil") ? "bg-emerald-700/50" : "hover:bg-emerald-700/30"}`}
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
                <Settings size={16} className="text-emerald-600" /> Dados da
                Conta
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

      {/* ÁREA DE AGENDAMENTO COM CONTROLES ESTILO ADM */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-[35px] shadow-xl border border-emerald-50 overflow-hidden">
          {etapa === 1 && (
            <div className="p-6">
              {/* CONTROLES DE DATA ESTILO ADM */}
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

              {/* GRID DO CALENDÁRIO */}
              <div className="grid grid-cols-7 gap-1 mb-4">
  {/* CORREÇÃO: Usando o index 'i' para evitar erro de chaves duplicadas */}
  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
    <div key={i} className="text-center text-[10px] font-black text-emerald-200 py-2">
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
                    dia,
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
                        ${isSelecionado ? "bg-emerald-600 text-white shadow-lg scale-110" : "text-gray-600 hover:bg-emerald-50"}
                        ${isHoje && !isSelecionado ? "border-2 border-emerald-200 text-emerald-600" : ""}`}
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

          {/* AS ETAPAS 2 E 3 SEGUEM A LÓGICA QUE VOCÊ JÁ TINHA */}
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
                {horarios.map((h) => (
                  <button
                    key={h}
                    onClick={() => {
                      setHorarioSelecionado(h);
                      setEtapa(3);
                    }}
                    className="p-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

           {/* ETAPA 3: SERVIÇOS (AQUI CHAMA FINALIZAR) */}
          {etapa === 3 && (
            <div className="p-6 space-y-3">
              <button onClick={() => setEtapa(2)} className="flex items-center gap-2 text-emerald-600 font-bold mb-2 text-sm"><ArrowLeft size={16}/> Voltar</button>
              <div className="bg-emerald-50 p-4 rounded-2xl text-center mb-4">
                <p className="text-gray-700 font-bold">{dataSelecionada.toLocaleDateString('pt-BR')} às {horarioSelecionado}</p>
              </div>
              {[
                { id: 'Nutrição', icon: <Activity className="text-emerald-600"/>, cor: 'bg-emerald-50' },
                { id: 'Acupuntura', icon: <PlusCircle className="text-blue-600"/>, cor: 'bg-blue-50' },
                { id: 'Farmácia', icon: <ClipboardList className="text-purple-600"/>, cor: 'bg-purple-50' }
              ].map(s => (
                <button key={s.id} onClick={() => finalizarAgendamento(s.id)}
                  className={`w-full p-5 rounded-2xl border-2 border-gray-100 flex items-center justify-between hover:border-emerald-500 transition-all ${s.cor}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">{s.icon}</div>
                    <span className="font-bold text-gray-700">{s.id}</span>
                  </div>
                  <CheckCircle2 className="text-emerald-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Agendamento;

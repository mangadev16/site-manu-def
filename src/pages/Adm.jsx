import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { 
  LogOut, Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight, RotateCcw, 
  MessageCircle, ChevronRight as ChevronIcon, Users, BarChart3, CheckCircle2, 
  AlertCircle, LayoutDashboard, Menu, Search, Filter, ArrowUpDown, History, ChevronDown, Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatarData = (data) => {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
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
  const [modalNovoHistorico, setModalNovoHistorico] = useState(false);
  const [modalLogOut, setModalLogOut] = useState(false);
  const [novoServico, setNovoServico] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [ordenacao, setOrdenacao] = useState("nome"); 

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
        <aside className={`w-64 bg-white border-r border-slate-100 p-4 flex flex-col gap-2 fixed lg:static inset-y-0 left-0 z-50 transform ${menuAberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} transition-transform duration-300 ease-in-out lg:h-[calc(100vh-73px)]`}>
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

              {/* LISTAGEM RESPONSIVA */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                {/* Desktop (Tabela) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Horário</th>
                        <th className="py-4 px-6">Cliente</th>
                        <th className="py-4 px-6">Serviço</th>
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
                            <td className="py-4 px-6"><span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">{ag.servico}</span></td>
                            <td className="py-4 px-6 font-extrabold text-slate-700">R$ {ag.valor || 0}</td>
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

                {/* Mobile (Cards Inteligentes de Alta Leitura) */}
                <div className="block md:hidden divide-y divide-slate-100">
                  {agendamentosFiltrados.filter(ag => ag.servico === abaAtiva).length > 0 ? (
                    agendamentosFiltrados.filter(ag => ag.servico === abaAtiva).map((ag, index) => (
                      <div key={index} className="p-4 space-y-3 bg-white">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                            <Clock size={14} style={{ color: ROXO_DESTAQUE }} /> {ag.horario}
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
                          <span className="text-xs font-black text-slate-800">R$ {ag.valor || 0}</span>
                          {ag.status === "pendente" && (
                            <div className="flex gap-1.5">
                              <button onClick={() => alterarStatusAgendamento(ag, "concluido")} className="flex items-center gap-1 px-3 py-2 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase">
                                Concluir
                              </button>
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

          {telaAtiva === "clientes" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Buscar por nome ou telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-xs transition" />
                  </div>
                  <button onClick={() => setOrdenacao(ordenacao === "nome" ? "faturamento" : "nome")} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition shadow-xs whitespace-nowrap">
                    <ArrowUpDown size={14} /> {ordenacao === "nome" ? "Ordem: Nome" : "Ordem: Faturamento"}
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
                              <div><p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Total</p><p className="font-black text-slate-700 text-xs">R$ {totalFaturado}</p></div>
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
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Faturado</p><p className="font-black text-slate-700 text-lg mt-0.5">R$ {clienteFicha.totalGeral || 0}</p></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-400 text-[9px] uppercase border-b border-slate-100 pb-2 mb-2">Histórico</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {clienteFicha.historico?.length > 0 ? (
                          clienteFicha.historico.map((h, i) => (
                            <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                              <div><p className="font-bold text-slate-800 text-xs">{h.servico}</p><p className="text-[10px] text-slate-400 mt-0.5">{h.data} • {h.horario}</p></div>
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
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs"><History className="mx-auto mb-2 text-slate-300" size={28} /> Selecione um cliente para ver a ficha completa.</div>
                )}
              </div>
            </div>
          )}

          {telaAtiva === "metricas" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
              <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-xs"><p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Faturamento Período</p><p className="text-2xl font-black text-slate-900 mt-1">R$ {faturamentoTotalPeriodo}</p></div>
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
              <button onClick={() => setModalLogOut(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={lidarComLogout} className="flex-1 py-2.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all" style={{ backgroundColor: ROXO_DESTAQUE, boxShadow: `0 4px 14px rgba(160, 144, 201, 0.35)` }}>
                Confirmar e Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adm;
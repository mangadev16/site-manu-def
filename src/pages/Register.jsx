import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { 
  User, LogOut, Calendar as CalendarIcon, Clock, X, Apple, Thermometer, Milestone,
  ChevronLeft, ChevronRight, RotateCcw, MessageCircle, ChevronRight as ChevronIcon,
  Users, BarChart3, CheckCircle2, AlertCircle, Trash2, LayoutDashboard, Menu, Search, Filter, ArrowUpDown, History, ChevronDown, Mail
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

  const [telaAtiva, setTelaAtiva] = useState("agenda"); 
  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("Nutrição");
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [clientesTodos, setClientesTodos] = useState([]);
  const [dataFiltro, setDataFiltro] = useState(new Date()); 
  const [busca, setBusca] = useState("");
  const [servicoFiltro, setServicoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clienteFicha, setClienteFicha] = useState(null);
  const [modalNovoHistorico, setModalNovoHistorico] = useState(false);
  const [novoServico, setNovoServico] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [ordenacao, setOrdenacao] = useState("nome"); 

  // 🎯 Algoritmo de sobreposição forçada contra cache e CSS externo
  useEffect(() => {
    const estiloId = "estilo-magenta-override";
    let linkEstilo = document.getElementById(estiloId);
    
    if (!linkEstilo) {
      linkEstilo = document.createElement("style");
      linkEstilo.id = estiloId;
      linkEstilo.innerHTML = `
        /* Substitui classes utilitárias de background esmeralda/verde */
        .bg-emerald-500, .bg-emerald-600, .bg-emerald-700, 
        [class*="bg-emerald-500"], [class*="bg-emerald-600"] {
          background-color: #a090c9 !important;
        }
        /* Efeito hover nos botões */
        .hover\\:bg-emerald-600:hover, [class*="hover:bg-emerald-"]:hover {
          background-color: #8c7cb3 !important;
        }
        /* Substitui textos e títulos em verde */
        .text-emerald-500, .text-emerald-600, .text-emerald-700,
        [class*="text-emerald-"] {
          color: #a090c9 !important;
        }
        /* Substitui bordas */
        .border-emerald-500, .border-emerald-600, [class*="border-emerald-"] {
          border-color: #a090c9 !important;
        }
        /* Altera a badge de agendamentos Concluídos para um Lilás Fluido */
        .bg-emerald-100, [class*="bg-emerald-100"] {
          background-color: #f2effa !important;
          color: #61528a !important;
        }
        /* Anula anéis de foco do Tailwind */
        .focus\\:ring-emerald-500:focus, [class*="focus:ring-emerald-"]:focus {
          --tw-ring-color: #a090c9 !important;
          border-color: #a090c9 !important;
        }
      `;
      document.head.appendChild(linkEstilo);
    }
    return () => {
      // Remove o estilo ao sair da tela administrativa para não afetar as outras
      const est = document.getElementById(estiloId);
      if (est) est.remove();
    };
  }, []);

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
              clienteNome: c.nome,
              clienteTelefone: c.telefone,
              clienteEmail: c.email,
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

      let historicoAdicional = {};
      if (novoStatus === "concluido") {
        historicoAdicional = {
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
    const bateServico = servicoFiltro === "todos" || ag.servico === servicoFiltro;
    const bateStatus = statusFiltro === "todos" || ag.status === statusFiltro;
    const bateBusca = busca === "" || ag.clienteNome.toLowerCase().includes(busca.toLowerCase());
    return bateData && bateServico && bateStatus && bateBusca;
  });

  const clientesFiltradosETordenados = clientesTodos
    .filter((c) => busca === "" || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.telefone.includes(busca))
    .sort((a, b) => {
      if (ordenacao === "nome") return a.nome.localeCompare(b.nome);
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuAberto(!menuAberto)} className="lg:hidden text-slate-600 hover:text-slate-900">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={22} style={{ color: "#a090c9" }} />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Painel <span style={{ color: "#a090c9" }}>Administrativo</span></h1>
          </div>
        </div>
        <button onClick={lidarComLogout} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm transition-all shadow-sm">
          <LogOut size={16} /> Sair
        </button>
      </header>

      <div className="flex flex-1 relative">
        <aside className={`w-64 bg-white border-r border-slate-100 p-4 flex flex-col gap-2 fixed lg:static inset-y-0 left-0 z-50 transform ${menuAberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} transition-transform duration-300 ease-in-out lg:h-[calc(100vh-73px)]`}>
          <div className="lg:hidden flex justify-end mb-4">
            <button onClick={() => setMenuAberto(false)} className="text-slate-500 hover:text-slate-800"><X size={24} /></button>
          </div>
          <button
            onClick={() => { setTelaAtiva("agenda"); setMenuAberto(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all"
            style={{
              backgroundColor: telaAtiva === "agenda" ? "#a090c9" : "transparent",
              color: telaAtiva === "agenda" ? "white" : "#475569",
              boxShadow: telaAtiva === "agenda" ? "0 10px 15px -3px rgba(160, 144, 201, 0.3)" : "none"
            }}
          >
            <CalendarIcon size={18} /> Agenda de Consultas
          </button>
          <button
            onClick={() => { setTelaAtiva("clientes"); setMenuAberto(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all"
            style={{
              backgroundColor: telaAtiva === "clientes" ? "#a090c9" : "transparent",
              color: telaAtiva === "clientes" ? "white" : "#475569",
              boxShadow: telaAtiva === "clientes" ? "0 10px 15px -3px rgba(160, 144, 201, 0.3)" : "none"
            }}
          >
            <Users size={18} /> Banco de Clientes
          </button>
          <button
            onClick={() => { setTelaAtiva("metricas"); setMenuAberto(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all"
            style={{
              backgroundColor: telaAtiva === "metricas" ? "#a090c9" : "transparent",
              color: telaAtiva === "metricas" ? "white" : "#475569",
              boxShadow: telaAtiva === "metricas" ? "0 10px 15px -3px rgba(160, 144, 201, 0.3)" : "none"
            }}
          >
            <BarChart3 size={18} /> Métricas & Faturamento
          </button>
        </aside>

        {menuAberto && <div onClick={() => setMenuAberto(false)} className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden" />}

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden max-w-full">
          {telaAtiva === "agenda" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-4 lg:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <button onClick={() => { const d = new Date(dataFiltro); d.setDate(d.getDate() - 1); setDataFiltro(d); }} className="p-2 hover:bg-white rounded-xl transition text-slate-600 hover:text-slate-900 shadow-sm"><ChevronLeft size={18} /></button>
                  <span className="font-extrabold text-sm text-slate-800 min-w-[140px] text-center uppercase tracking-wider">{dataFiltro.toLocaleDateString("pt-BR", { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                  <button onClick={() => { const d = new Date(dataFiltro); d.setDate(d.getDate() + 1); setDataFiltro(d); }} className="p-2 hover:bg-white rounded-xl transition text-slate-600 hover:text-slate-900 shadow-sm"><ChevronRight size={18} /></button>
                  <button onClick={() => setDataFiltro(new Date())} className="p-2 hover:bg-white rounded-xl transition text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100" title="Ir para Hoje"><RotateCcw size={16} /></button>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {["Nutrição", "Farmácia", "Acupuntura"].map((serv) => (
                    <button
                      key={serv}
                      onClick={() => setAbaAtiva(serv)}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                      style={{
                        backgroundColor: abaAtiva === serv ? "#a090c9" : "white",
                        color: abaAtiva === serv ? "white" : "#64748b",
                        border: abaAtiva === serv ? "none" : "1px solid #e2e8f0",
                        boxShadow: abaAtiva === serv ? "0 4px 6px -1px rgba(160, 144, 201, 0.2)" : "none"
                      }}
                    >
                      {serv}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Buscar cliente por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-white pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 outline-none text-sm transition" style={{ focusWithin: { borderColor: "#a090c9" } }} />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="w-full bg-white pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 outline-none text-sm appearance-none cursor-pointer font-bold text-slate-600">
                    <option value="todos">Todos Status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="concluido">Concluídos</option>
                    <option value="faltou">Faltas</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
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
                          <tr key={index} className="hover:bg-slate-50/50 transition group text-sm">
                            <td className="py-4 px-6 font-bold text-slate-700 flex items-center gap-2"><Clock size={15} className="text-slate-400" /> {ag.horario}</td>
                            <td className="py-4 px-6"><p className="font-extrabold text-slate-800">{ag.clienteNome}</p><p className="text-[11px] text-slate-400 mt-0.5">{ag.clienteTelefone}</p></td>
                            <td className="py-4 px-6"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{ag.servico}</span></td>
                            <td className="py-4 px-6 font-extrabold text-slate-700">R$ {ag.valor || 0}</td>
                            <td className="py-4 px-6">
                              <span 
                                className="text-[9px] font-black uppercase px-3 py-1.5 rounded-full"
                                style={{
                                  backgroundColor: ag.status === "concluido" ? "#f2effa" : ag.status === "faltou" ? "#fef3c7" : ag.status === "cancelado" ? "#fee2e2" : "#dbeafe",
                                  color: ag.status === "concluido" ? "#61528a" : ag.status === "faltou" ? "#b45309" : ag.status === "cancelado" ? "#b91c1c" : "#1d4ed8"
                                }}
                              >
                                {ag.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {ag.status === "pendente" && (
                                <div className="flex gap-1 justify-end opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                                  <button onClick={() => alterarStatusAgendamento(ag, "concluido")} className="p-2 rounded-xl transition hover:text-white" style={{ backgroundColor: "#f2effa", color: "#61528a" }} title="Concluir"><CheckCircle2 size={16} /></button>
                                  <button onClick={() => alterarStatusAgendamento(ag, "faltou")} className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition" title="Marcar Falta"><AlertCircle size={16} /></button>
                                  <button onClick={() => alterarStatusAgendamento(ag, "cancelado")} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition" title="Cancelar"><X size={16} /></button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="6" className="py-12 text-center text-slate-400 font-medium"><CalendarIcon className="mx-auto mb-2 text-slate-300" size={32} /> Nenhum agendamento para {abaAtiva} nesta data.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {telaAtiva === "clientes" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Buscar por nome ou telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-white pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 outline-none text-sm transition" />
                  </div>
                  <button onClick={() => setOrdenacao(ordenacao === "nome" ? "faturamento" : "nome")} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition shadow-sm whitespace-nowrap">
                    <ArrowUpDown size={16} /> {ordenacao === "nome" ? "Ordem: Nome" : "Ordem: Faturamento"}
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {clientesFiltradosETordenados.length > 0 ? (
                      clientesFiltradosETordenados.map((c) => {
                        const totalFaturado = c.historico?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
                        return (
                          <div key={c.id} onClick={() => setClienteSelecionado(c)} className="p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50/40" style={clienteSelecionado?.id === c.id ? { backgroundColor: "#fcfbfe", borderLeft: "4px solid #a090c9", paddingLeft: "12px" } : {}}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold uppercase">{c.nome?.slice(0, 2)}</div>
                              <div><h3 className="font-extrabold text-slate-800 text-sm">{c.nome}</h3><p className="text-[11px] text-slate-400 mt-0.5">{c.telefone}</p></div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <div><p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Total Pago</p><p className="font-black text-slate-700 text-sm">R$ {totalFaturado}</p></div>
                              <ChevronIcon size={16} className="text-slate-300" />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-slate-400 font-medium"><Users className="mx-auto mb-2 text-slate-300" size={32} /> Nenhum cliente localizado.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit space-y-6">
                {clienteFicha ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg uppercase" style={{ backgroundColor: "#f2effa", color: "#61528a" }}>{clienteFicha.nome?.slice(0,2)}</div>
                        <div><h2 className="font-black text-slate-800 text-base">{clienteFicha.nome}</h2><p className="text-xs text-slate-400 mt-0.5">Ficha Geral do Cliente</p></div>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><Mail size={16} className="text-slate-400" /><div className="overflow-hidden text-ellipsis"><p className="text-[10px] text-slate-400 uppercase font-bold">E-mail</p><p className="font-semibold text-slate-700 truncate">{clienteFicha.email}</p></div></div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"><MessageCircle size={16} className="text-slate-400" /><div><p className="text-[10px] text-slate-400 uppercase font-bold">WhatsApp</p><p className="font-semibold text-slate-700">{clienteFicha.telefone}</p></div></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl border" style={{ backgroundColor: "#f2effa", borderColor: "#e8e3f7" }}><p className="text-[9px] uppercase font-black tracking-wider" style={{ color: "#61528a" }}>Consultas</p><p className="font-black text-xl mt-1" style={{ color: "#4c3e70" }}>{clienteFicha.historico?.length || 0}</p></div>
                        <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Faturamento</p><p className="font-black text-slate-700 text-xl mt-1">R$ {clienteFicha.totalGeral || 0}</p></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-400 text-[10px] uppercase border-b pb-2 mb-3">Histórico de Consultas</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {clienteFicha.historico?.length > 0 ? (
                          clienteFicha.historico.map((h, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center hover:bg-slate-100 transition">
                              <div><p className="font-bold text-slate-800 text-sm">{h.servico}</p><p className="text-[10px] text-slate-400 mt-1">{h.data} • {h.horario}</p></div>
                              <span 
                                className="text-[8px] font-black uppercase px-3 py-1.5 rounded-full"
                                style={{
                                  backgroundColor: h.status === "concluido" ? "#f2effa" : h.status === "faltou" ? "#fef3c7" : "#fee2e2",
                                  color: h.status === "concluido" ? "#61528a" : h.status === "faltou" ? "#b45309" : "#b91c1c"
                                }}
                              >
                                {h.status === "concluido" ? "Concluído" : h.status === "faltou" ? "Faltou" : "Cancelado"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 py-4 text-center">Nenhum procedimento registrado.</p>
                        )}
                      </div>
                      <button onClick={() => setModalNovoHistorico(true)} className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition">Lançar Novo Atendimento</button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 font-medium"><History className="mx-auto mb-2 text-slate-300" size={32} /> Selecione um cliente para expandir a ficha médica e financeira.</div>
                )}
              </div>
            </div>
          )}

          {telaAtiva === "metricas" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Faturamento do Período</p><p className="text-3xl font-black text-slate-800 mt-2">R$ {faturamentoTotalPeriodo}</p></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Clientes Atendidos</p><p className="text-3xl font-black text-slate-800 mt-2">{totalClientesAtendidosPeriodo}</p></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Consultas Concluídas</p><p className="text-3xl font-black text-slate-800 mt-2">{agendamentosFiltrados.filter(ag => ag.status === "concluido").length}</p></div>
              </div>
            </div>
          )}
        </main>
      </div>

      {modalNovoHistorico && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-800 text-base">Registrar Procedimento</h3>
              <button onClick={() => setModalNovoHistorico(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={adicionarAoHistoricoManual} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Serviço/Tratamento</label>
                <select value={novoServico} onChange={(e) => setNovoServico(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-sm font-semibold text-slate-700">
                  <option value="">Selecione...</option>
                  <option value="Nutrição">Nutrição</option>
                  <option value="Farmácia">Farmácia</option>
                  <option value="Acupuntura">Acupuntura</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1.5">Valor Cobrado (R$)</label>
                <input type="number" placeholder="Ex: 150" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none text-sm font-semibold" />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 text-white rounded-xl font-bold text-sm transition-all"
                style={{
                  backgroundColor: "#a090c9",
                  boxShadow: "0 6px 20px rgba(160, 144, 201, 0.3)"
                }}
              >
                Salvar no Histórico
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adm;
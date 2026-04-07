import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, query, where } from "firebase/firestore";
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

  // Estados
  const [telaAtiva, setTelaAtiva] = useState("agenda"); 
  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("Nutrição");
  const [agendamentosTodos, setAgendamentosTodos] = useState([]);
  const [clientesTodos, setClientesTodos] = useState([]);
  const [dataFiltro, setDataFiltro] = useState(new Date()); 
  const [buscaCliente, setBuscaCliente] = useState("");
  const [filtrosAtivos, setFiltrosAtivos] = useState([]); 
  const [ordemClientes, setOrdemClientes] = useState("alfabetica");
  const [filtroMenuAberto, setFiltroMenuAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [clienteFicha, setClienteFicha] = useState(null);
  
  const inputAgendaRef = useRef(null);
  const inputRelatoriosRef = useRef(null);

  const servicosConfig = {
    "Nutrição": { icon: <Apple size={16} />, color: "text-orange-500" },
    "Acupuntura": { icon: <Milestone size={16} />, color: "text-indigo-500" },
    "Farmácia": { icon: <Thermometer size={16} />, color: "text-rose-500" }
  };

  // Função para buscar dados do cliente pelo ID
  const buscarDadosCliente = (userId) => {
    const cliente = clientesTodos.find(c => c.id === userId);
    return cliente || { nome: "Carregando...", email: "", telefone: "" };
  };

  // Lógica de Saída
  const lidarSair = async () => {
    try {
      await auth.signOut();
      navigate("/"); 
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Efeito para carregar agendamentos
  useEffect(() => {
    const dataString = formatarData(dataFiltro);
    const q = query(
      collection(db, "agendamentos"),
      where("data", "==", dataString),
    );
    const unsub = onSnapshot(q, (querySnapshot) => {
      const agendamentos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAgendamentosTodos(agendamentos);
    });
    return () => unsub();
  }, [dataFiltro]);

  // Efeito para carregar os Clientes
  useEffect(() => {
    const unsubClientes = onSnapshot(collection(db, "usuarios"), (snap) => {
      const lista = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        totalGeral: doc.data().historico?.length || 0 
      }));
      setClientesTodos(lista);
    });
    return () => unsubClientes();
  }, []);

  const dataFormatada = dataFiltro.toLocaleDateString('pt-BR');
  const hojeFormatado = new Date().toLocaleDateString('pt-BR');
  
  const mudarDia = (dias) => {
    const novaData = new Date(dataFiltro);
    novaData.setDate(novaData.getDate() + dias);
    setDataFiltro(novaData);
  };

  const abrirCalendario = (ref) => {
    if (ref.current && typeof ref.current.showPicker === 'function') ref.current.showPicker();
  };

  const adicionarFiltro = (servico) => {
    if (!filtrosAtivos.includes(servico)) setFiltrosAtivos([...filtrosAtivos, servico]);
    setFiltroMenuAberto(false);
  };

  const removerFiltro = (servico) => setFiltrosAtivos(filtrosAtivos.filter(f => f !== servico));

  const clientesFiltrados = clientesTodos
    .filter(c => {
      const bateTexto = c.nome?.toLowerCase().includes(buscaCliente.toLowerCase()) || c.telefone?.includes(buscaCliente) || c.email?.toLowerCase().includes(buscaCliente.toLowerCase());
      if (!bateTexto) return false;
      if (filtrosAtivos.length === 0) return true;
      return filtrosAtivos.some(f => 
        agendamentosTodos.some(ag => ag.userId === c.id && ag.servico === f) || 
        (c.historico && c.historico.some(h => h.servico === f))
      );
    })
    .sort((a, b) => {
      if (ordemClientes === "alfabetica") return (a.nome || "").localeCompare(b.nome || "");
      return b.totalGeral - a.totalGeral;
    });

  const atualizarStatus = async (ag, novoStatus) => {
    try {
      const agRef = doc(db, "agendamentos", ag.id);
      const clienteRef = doc(db, "usuarios", ag.userId);
      
      await updateDoc(agRef, { status: novoStatus });
      
      const itemHistorico = { 
        servico: ag.servico,
        data: ag.data,
        horario: ag.horario,
        status: novoStatus, 
        dataConclusao: formatarData(new Date()) 
      };
      
      await updateDoc(clienteRef, {
        historico: arrayUnion(itemHistorico)
      });
      
      setAgendamentoSelecionado(null);
      alert("Status atualizado com sucesso!");
    } catch (e) {
      console.error("Erro crítico:", e);
      alert("Erro ao salvar. Verifique o console.");
    }
  };

  // Componente Seletor de Data
  const SeletorData = ({ inputRef }) => (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border">
        <button onClick={() => mudarDia(-1)} className="p-2 text-slate-400 hover:text-emerald-600">
          <ChevronLeft/>
        </button>
        <div onClick={() => abrirCalendario(inputRef)} className="flex items-center gap-3 px-4 py-1 cursor-pointer group">
          <CalendarIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
          <span className="font-black text-slate-700 text-sm">{dataFormatada}</span>
          <input 
            ref={inputRef} 
            type="date" 
            className="absolute w-0 h-0 opacity-0" 
            onChange={(e) => e.target.value && setDataFiltro(new Date(e.target.value.replace(/-/g, '\/')))}
          />
        </div>
        <button onClick={() => mudarDia(1)} className="p-2 text-slate-400 hover:text-emerald-600">
          <ChevronRight/>
        </button>
      </div>
      
      {dataFormatada !== hojeFormatado && (
        <button 
          onClick={() => setDataFiltro(new Date())} 
          className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-200"
          title="Voltar para hoje"
        >
          <RotateCcw size={18} />
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 h-screen w-full bg-[#f8fafc] flex flex-col lg:flex-row overflow-hidden text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-[#1e293b] text-white z-[100] transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"/>
          <h1 className="font-black text-xs uppercase tracking-widest text-emerald-400">Painel Administrativo</h1>
        </div>
        <nav className="p-6 space-y-3">
          <button onClick={() => {setTelaAtiva("agenda"); setMenuAberto(false)}} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[10px] transition-all ${telaAtiva === 'agenda' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <LayoutDashboard size={20}/> AGENDA
          </button>
          <button onClick={() => {setTelaAtiva("clientes"); setMenuAberto(false)}} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[10px] transition-all ${telaAtiva === 'clientes' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <Users size={20}/> CLIENTES
          </button>
          <button onClick={() => {setTelaAtiva("relatorios"); setMenuAberto(false)}} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[10px] transition-all ${telaAtiva === 'relatorios' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <BarChart3 size={20}/> RELATÓRIOS
          </button>
          <div className="mt-10 pt-10 border-t border-white/10">
            <button onClick={lidarSair} className="flex items-center gap-4 p-4 text-red-400 font-black text-[10px] hover:bg-red-400/10 w-full rounded-2xl transition-all">
              <LogOut size={20}/> SAIR
            </button>
          </div>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white p-4 lg:p-6 border-b flex justify-between items-center z-50">
          <button onClick={() => setMenuAberto(true)} className="lg:hidden p-2 text-slate-600">
            <Menu/>
          </button>
          <h2 className="font-black text-slate-800 uppercase tracking-tighter text-sm">
            {telaAtiva === "agenda" ? "AGENDA DO DIA" : telaAtiva === "clientes" ? "CLIENTES" : "RELATÓRIOS"}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-32">
          
          {/* TELA DE RELATÓRIOS */}
          {telaAtiva === "relatorios" && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in">
              <div className="flex justify-center">
                <SeletorData inputRef={inputRelatoriosRef} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Concluídos', status: 'concluido', icon: <CheckCircle2/>, bg: 'bg-[#1e293b]', text: 'text-white' },
                  { label: 'Faltas', status: 'faltou', icon: <AlertCircle/>, bg: 'bg-white', text: 'text-slate-800' },
                  { label: 'Cancelados', status: 'cancelado', icon: <Trash2/>, bg: 'bg-white', text: 'text-slate-800' }
                ].map(item => (
                  <div key={item.label} className={`${item.bg} ${item.text} p-10 rounded-[45px] shadow-sm flex flex-col items-center border border-slate-100`}>
                    <div className="mb-4 text-emerald-500">{item.icon}</div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">{item.label}</p>
                    <h3 className="text-5xl font-black">
                      {clientesTodos.flatMap(c => c.historico || []).filter(h => h.status === item.status && h.dataConclusao === formatarData(dataFiltro)).length}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TELA DE CLIENTES */}
          {telaAtiva === "clientes" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="relative">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                    <input 
                      type="text" 
                      placeholder="Pesquisar por nome, email ou telefone..." 
                      className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[25px] shadow-sm font-bold text-slate-700 outline-none focus:border-emerald-400" 
                      value={buscaCliente} 
                      onChange={(e) => setBuscaCliente(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setFiltroMenuAberto(!filtroMenuAberto)} className={`flex items-center justify-center gap-3 px-8 py-5 rounded-[25px] font-black text-[11px] transition-all ${filtroMenuAberto ? 'bg-slate-800 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-600 shadow-sm'}`}>
                    <Filter size={18} className="text-emerald-500"/> FILTROS
                  </button>
                </div>
                
                {filtroMenuAberto && (
                  <div className="absolute right-0 mt-4 w-72 bg-white border border-slate-100 rounded-[35px] shadow-2xl p-8 z-[60] animate-in zoom-in duration-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Ordenar por</p>
                    <div className="grid gap-2 mb-6">
                      <button onClick={() => {setOrdemClientes("alfabetica"); setFiltroMenuAberto(false)}} className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${ordemClientes === 'alfabetica' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <ArrowUpDown size={16}/> Ordem Alfabética
                      </button>
                      <button onClick={() => {setOrdemClientes("mais_agendamentos"); setFiltroMenuAberto(false)}} className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${ordemClientes === 'mais_agendamentos' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <History size={16}/> Mais Visitas
                      </button>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Filtrar por Serviço</p>
                    <div className="grid gap-2">
                      {Object.keys(servicosConfig).map(s => (
                        <button key={s} onClick={() => adicionarFiltro(s)} className="flex items-center justify-between p-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
                          {s.toUpperCase()}<ChevronRight size={14} className="text-slate-300"/>
                        </button>
                      ))}
                      <button onClick={() => {setFiltrosAtivos([]); setFiltroMenuAberto(false)}} className="mt-2 text-[10px] font-black text-red-400 uppercase hover:underline">Limpar Tudo</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 items-center">
                <span className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full text-[9px] font-black shadow-sm">
                  {ordemClientes === "alfabetica" ? <ArrowUpDown size={12}/> : <History size={12}/>} 
                  {ordemClientes === "alfabetica" ? "A - Z" : "MAIS FREQUENTES"}
                </span>
                {filtrosAtivos.map(f => (
                  <span key={f} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-[9px] font-black shadow-sm animate-in zoom-in">
                    {f.toUpperCase()}<button onClick={() => removerFiltro(f)} className="hover:bg-emerald-600 rounded-full p-0.5"><X size={12}/></button>
                  </span>
                ))}
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                {clientesFiltrados.map(cliente => (
                  <div key={cliente.id} onClick={() => setClienteFicha(cliente)} className="bg-white p-7 rounded-[40px] border border-transparent hover:border-emerald-500 transition-all cursor-pointer shadow-sm group hover:shadow-md">
                    <div className="flex justify-between items-start mb-5">
                      <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                        <User size={20}/>
                      </div>
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-3 py-1 rounded-lg uppercase">
                        {cliente.totalGeral} {cliente.totalGeral === 1 ? 'VISITA' : 'VISITAS'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{cliente.nome || "Cliente"}</h4>
                    {cliente.email && (
                      <p className="text-[11px] text-slate-500 truncate">{cliente.email}</p>
                    )}
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px] mt-2">
                      <MessageCircle size={14}/> {cliente.telefone || "Telefone não informado"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TELA DE AGENDA - VERSÃO MELHORADA */}
          {telaAtiva === "agenda" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <SeletorData inputRef={inputAgendaRef} />
                <div className="flex bg-slate-200/50 p-1.5 rounded-2xl gap-1">
                  {Object.keys(servicosConfig).map(id => (
                    <button 
                      key={id} 
                      onClick={() => setAbaAtiva(id)} 
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${abaAtiva === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                      <span className={abaAtiva === id ? servicosConfig[id].color : 'text-slate-400'}>{servicosConfig[id].icon}</span> 
                      {id.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-3">
                {agendamentosTodos.filter(ag => ag.servico === abaAtiva).length === 0 ? (
                  <div className="bg-white/50 p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200 text-slate-300 font-black uppercase text-[10px] tracking-widest">
                    Nenhum agendamento para {abaAtiva}
                  </div>
                ) : (
                  agendamentosTodos.filter(ag => ag.servico === abaAtiva).map(ag => {
                    const cliente = buscarDadosCliente(ag.userId);
                    return (
                      <div 
                        key={ag.id} 
                        onClick={() => setAgendamentoSelecionado({ ...ag, clienteData: cliente })} 
                        className="bg-white p-6 rounded-[30px] border border-transparent hover:border-emerald-500 transition-all cursor-pointer shadow-sm group hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              <User size={22}/>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 text-lg">{ag.userName || cliente.nome || "Cliente"}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <p className="text-[11px] font-black text-emerald-500 uppercase flex items-center gap-1.5">
                                  <Clock size={14}/> {ag.horario}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {ag.data}
                                </p>
                                {cliente.telefone && (
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <MessageCircle size={10}/> {cliente.telefone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full ${
                            ag.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' :
                            ag.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {ag.status === 'concluido' ? '✓ CONCLUÍDO' : 
                             ag.status === 'pendente' ? '⏳ PENDENTE' : '✗ CANCELADO'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL DETALHES DO AGENDAMENTO */}
      {agendamentoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[45px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-[#059669] to-[#047857] p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">
                    Detalhes do Agendamento
                  </p>
                  <h3 className="font-bold text-xl">{agendamentoSelecionado.userName || agendamentoSelecionado.clienteData?.nome || "Cliente"}</h3>
                </div>
                <button onClick={() => setAgendamentoSelecionado(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Informações de Contato */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato do Cliente</h4>
                
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <Mail size={16} className="text-emerald-600"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">E-mail</p>
                    <p className="text-sm font-medium text-slate-700">
                      {agendamentoSelecionado.clienteData?.email || "Não informado"}
                    </p>
                  </div>
                  {agendamentoSelecionado.clienteData?.email && (
                    <button 
                      onClick={() => window.location.href = `mailto:${agendamentoSelecionado.clienteData.email}`}
                      className="text-emerald-600 hover:text-emerald-700 text-xs font-bold"
                    >
                      Enviar
                    </button>
                  )}
                </div>
                
                {/* WhatsApp */}
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <MessageCircle size={16} className="text-emerald-600"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">WhatsApp</p>
                    <p className="text-sm font-medium text-slate-700">
                      {agendamentoSelecionado.clienteData?.telefone || "Não informado"}
                    </p>
                  </div>
                  {agendamentoSelecionado.clienteData?.telefone && (
                    <button 
                      onClick={() => window.open(`https://wa.me/55${agendamentoSelecionado.clienteData.telefone.replace(/\D/g,'')}`, '_blank')}
                      className="bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-green-600 transition"
                    >
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
              
              {/* Informações do Agendamento */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes da Consulta</h4>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Serviço:</span>
                  <span className="font-bold text-slate-800">{agendamentoSelecionado.servico}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Data:</span>
                  <span className="font-bold text-slate-800">{agendamentoSelecionado.data}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Horário:</span>
                  <span className="font-bold text-emerald-600">{agendamentoSelecionado.horario}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Status Atual:</span>
                  <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                    agendamentoSelecionado.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' :
                    agendamentoSelecionado.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {agendamentoSelecionado.status === 'concluido' ? 'Concluído' : 
                     agendamentoSelecionado.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                  </span>
                </div>
              </div>
              
              {/* Ações */}
              <div className="space-y-2 pt-2">
                <button 
                  onClick={() => atualizarStatus(agendamentoSelecionado, 'concluido')} 
                  className="w-full p-4 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                >
                  <CheckCircle2 size={18}/> MARCAR COMO CONCLUÍDO
                </button>
                
                <button 
                  onClick={() => atualizarStatus(agendamentoSelecionado, 'faltou')} 
                  className="w-full p-4 bg-amber-50 text-amber-700 rounded-2xl font-black text-sm hover:bg-amber-100 transition-all"
                >
                  MARCAR COMO FALTA
                </button>
                
                <button 
                  onClick={() => atualizarStatus(agendamentoSelecionado, 'cancelado')} 
                  className="w-full p-4 text-red-500 font-black text-sm hover:bg-red-50 rounded-2xl transition-all"
                >
                  CANCELAR AGENDAMENTO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FICHA DO CLIENTE */}
      {clienteFicha && (
        <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[50px] h-[80vh] flex flex-col shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-gradient-to-r from-[#059669] to-[#047857] rounded-t-[50px]">
              <div>
                <h3 className="font-black text-2xl text-white">{clienteFicha.nome || "Cliente"}</h3>
                {clienteFicha.email && (
                  <p className="text-emerald-100 text-sm mt-1">{clienteFicha.email}</p>
                )}
              </div>
              <button onClick={() => setClienteFicha(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <X size={20} className="text-white"/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex gap-4">
                {clienteFicha.telefone && (
                  <button 
                    onClick={() => window.open(`https://wa.me/55${clienteFicha.telefone.replace(/\D/g,'')}`, '_blank')} 
                    className="flex-1 bg-green-500 text-white p-4 rounded-3xl font-black text-[11px] uppercase flex items-center justify-center gap-2 hover:bg-green-600 transition"
                  >
                    <MessageCircle size={18}/> WhatsApp
                  </button>
                )}
                {clienteFicha.email && (
                  <button 
                    onClick={() => window.location.href = `mailto:${clienteFicha.email}`}
                    className="flex-1 bg-emerald-600 text-white p-4 rounded-3xl font-black text-[11px] uppercase flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
                  >
                    <Mail size={18}/> Enviar Email
                  </button>
                )}
                <div className="px-6 py-4 bg-slate-50 rounded-3xl text-center border">
                  <span className="text-slate-400 text-[9px] font-black uppercase">Visitas</span>
                  <p className="font-black text-xl text-slate-800">{clienteFicha.totalGeral || 0}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-black text-slate-400 text-[10px] uppercase border-b pb-2 mb-3">Histórico de Consultas</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {clienteFicha.historico?.length > 0 ? (
                    clienteFicha.historico.map((h, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center hover:bg-slate-100 transition">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{h.servico}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{h.data} • {h.horario}</p>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full ${
                          h.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' :
                          h.status === 'faltou' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {h.status === 'concluido' ? 'Concluído' : 
                           h.status === 'faltou' ? 'Faltou' : 'Cancelado'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 py-8 text-sm">
                      Nenhum histórico encontrado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adm;
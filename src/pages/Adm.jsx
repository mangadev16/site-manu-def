import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from "firebase/firestore";
import { 
  User, LogOut, Calendar as CalendarIcon, Clock, X, Apple, Thermometer, Milestone,
  ChevronLeft, ChevronRight, RotateCcw, MessageCircle, ChevronRight as ChevronIcon,
  Users, BarChart3, CheckCircle2, AlertCircle, Trash2, LayoutDashboard, Menu, Search, Filter, ArrowUpDown, History, ChevronDown
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

  // Lógica de Saída
  const lidarSair = async () => {
    try {
      await auth.signOut();
      navigate("/"); 
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  useEffect(() => {
  const dataAlvo = formatarData(dataFiltro);
  
  const unsub = onSnapshot(doc(db, "agendamentos", dataAlvo), (docSnap) => {
    if (docSnap.exists()) {
      const dados = docSnap.data();
      const ags = dados.agendamentos || [];
      // Injetamos o campo 'data' apenas para controle da interface
      setAgendamentosTodos(ags.map(item => ({ ...item, data: dataAlvo })));
    } else {
      setAgendamentosTodos([]);
    }
  });
  
  return () => unsub();
}, [dataFiltro]);

  // 2. Efeito para carregar os Clientes
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
      const bateTexto = c.nome?.toLowerCase().includes(buscaCliente.toLowerCase()) || c.telefone?.includes(buscaCliente);
      if (!bateTexto) return false;
      if (filtrosAtivos.length === 0) return true;
      return filtrosAtivos.some(f => 
        agendamentosTodos.some(ag => ag.uid === c.id && ag.servico === f) || 
        (c.historico && c.historico.some(h => h.servico === f))
      );
    })
    .sort((a, b) => {
      if (ordemClientes === "alfabetica") return a.nome.localeCompare(b.nome);
      return b.totalGeral - a.totalGeral;
    });

  const atualizarStatus = async (ag, novoStatus) => {
  try {
    const dataDoc = ag.data; 
    if (!dataDoc) return alert("Data não identificada.");

    const agRef = doc(db, "agendamentos", dataDoc);
    const clienteRef = doc(db, "usuarios", ag.uid);

    // 1. Pega os dados atuais do banco
    const docSnap = await getDoc(agRef);
    if (!docSnap.exists()) return;

    const listaAgendamentos = docSnap.data().agendamentos || [];

    // 2. Removemos o item da lista comparando apenas o ID (muito mais seguro)
    const novaLista = listaAgendamentos.filter(item => String(item.id) !== String(ag.id));

    // 3. Preparamos o item para o histórico (removendo a chave 'data' da interface)
    const itemHistorico = { ...ag };
    delete itemHistorico.data; // Remove campo temporário
    itemHistorico.status = novoStatus;
    itemHistorico.dataConclusao = dataDoc;

    // 4. Grava a lista nova (sem o agendamento) e o histórico
    await updateDoc(agRef, {
      agendamentos: novaLista,
      historico: arrayUnion(itemHistorico)
    });

    // 5. Atualiza a ficha do cliente
    if (ag.uid) {
      await updateDoc(clienteRef, {
        historico: arrayUnion(itemHistorico)
      });
    }

    setAgendamentoSelecionado(null);
    alert("Status atualizado!");
  } catch (e) {
    console.error("Erro crítico:", e);
    alert("Erro ao salvar. Verifique o console.");
  }
};
  // Componente Reutilizável do Seletor de Data com o Botão de Reset Externo
  const SeletorData = ({ inputRef }) => (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border">
        <button onClick={() => mudarDia(-1)} className="p-2 text-slate-400 hover:text-emerald-600"><ChevronLeft/></button>
        <div onClick={() => abrirCalendario(inputRef)} className="flex items-center gap-3 px-4 py-1 cursor-pointer group">
          <CalendarIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
          <span className="font-black text-slate-700 text-sm">{dataFormatada}</span>
          <input ref={inputRef} type="date" className="absolute w-0 h-0 opacity-0" onChange={(e) => e.target.value && setDataFiltro(new Date(e.target.value.replace(/-/g, '\/')))}/>
        </div>
        <button onClick={() => mudarDia(1)} className="p-2 text-slate-400 hover:text-emerald-600"><ChevronRight/></button>
      </div>
      
      {/* Botão de Voltar para Hoje FORA da caixinha branca */}
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

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white p-4 lg:p-6 border-b flex justify-between items-center z-50">
          <button onClick={() => setMenuAberto(true)} className="lg:hidden p-2 text-slate-600"><Menu/></button>
          <h2 className="font-black text-slate-800 uppercase tracking-tighter text-sm">{telaAtiva}</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-32">
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
                      {clientesTodos.flatMap(c => c.historico || []).filter(h => h.status === item.status && h.dataAcao === dataFormatada).length}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {telaAtiva === "clientes" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="relative">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                    <input type="text" placeholder="Pesquisar..." className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[25px] shadow-sm font-bold text-slate-700 outline-none" value={buscaCliente} onChange={(e) => setBuscaCliente(e.target.value)}/>
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
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Serviços</p>
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
                  {ordemClientes === "alfabetica" ? <ArrowUpDown size={12}/> : <History size={12}/>} {ordemClientes === "alfabetica" ? "A - Z" : "FREQUÊNCIA"}
                </span>
                {filtrosAtivos.map(f => (
                  <span key={f} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-[9px] font-black shadow-sm animate-in zoom-in">
                    {f.toUpperCase()}<button onClick={() => removerFiltro(f)} className="hover:bg-emerald-600 rounded-full p-0.5"><X size={12}/></button>
                  </span>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                {clientesFiltrados.map(cliente => (
                  <div key={cliente.id} onClick={() => setClienteFicha(cliente)} className="bg-white p-7 rounded-[40px] border border-transparent hover:border-emerald-500 transition-all cursor-pointer shadow-sm group">
                    <div className="flex justify-between items-start mb-5">
                      <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600"><User size={20}/></div>
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-3 py-1 rounded-lg uppercase">{cliente.totalGeral} Visitas</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{cliente.nome}</h4>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px]"><MessageCircle size={14}/> {cliente.telefone}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {telaAtiva === "agenda" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <SeletorData inputRef={inputAgendaRef} />
                <div className="flex bg-slate-200/50 p-1.5 rounded-2xl gap-1">
                  {Object.keys(servicosConfig).map(id => (
                    <button key={id} onClick={() => setAbaAtiva(id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${abaAtiva === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                      <span className={abaAtiva === id ? servicosConfig[id].color : 'text-slate-400'}>{servicosConfig[id].icon}</span> {id.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                {agendamentosTodos.filter(ag => ag.servico === abaAtiva && ag.data === dataFormatada).length === 0 ? (
                  <div className="bg-white/50 p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200 text-slate-300 font-black uppercase text-[10px] tracking-widest">Nenhum agendamento</div>
                ) : (
                  agendamentosTodos.filter(ag => ag.servico === abaAtiva && ag.data === dataFormatada).map(ag => (
                    <div key={ag.id} onClick={() => setAgendamentoSelecionado(ag)} className="bg-white p-6 rounded-[30px] border border-transparent hover:border-emerald-500 transition-all cursor-pointer flex justify-between items-center shadow-sm group">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><User size={22}/></div>
                        <div><p className="font-bold text-slate-800 text-lg">{ag.usuarioNome}</p><p className="text-[11px] font-black text-emerald-500 uppercase flex items-center gap-1.5 mt-0.5"><Clock size={14}/> {ag.horario}</p></div>
                      </div>
                      <ChevronIcon className="text-slate-300 group-hover:translate-x-1 transition-all" size={20}/>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL STATUS */}
      {agendamentoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[45px] overflow-hidden shadow-2xl">
            <div className="bg-[#1e293b] p-8 text-white flex justify-between items-center">
              <div><p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Status</p><h3 className="font-bold text-lg">{agendamentoSelecionado.usuarioNome}</h3></div>
              <button onClick={() => setAgendamentoSelecionado(null)}><X size={20}/></button>
            </div>
            <div className="p-8 space-y-3">
              <button onClick={() => atualizarStatus(agendamentoSelecionado, 'concluido')} className="w-full p-4 bg-emerald-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2"><CheckCircle2 size={18}/> CONCLUÍDO</button>
              <button onClick={() => atualizarStatus(agendamentoSelecionado, 'faltou')} className="w-full p-4 bg-amber-50 text-amber-700 rounded-2xl font-black text-xs">MARCAR FALTA</button>
              <button onClick={() => atualizarStatus(agendamentoSelecionado, 'cancelado')} className="w-full p-4 text-red-500 font-black text-xs">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FICHA CLIENTE */}
      {clienteFicha && (
        <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[50px] h-[80vh] flex flex-col shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="font-black text-2xl text-slate-800">{clienteFicha.nome}</h3>
              <button onClick={() => setClienteFicha(null)} className="p-2 bg-slate-50 rounded-full"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex gap-4">
                <button onClick={() => window.open(`https://wa.me/55${clienteFicha.telefone?.replace(/\D/g,'')}`)} className="flex-1 bg-emerald-600 text-white p-4 rounded-3xl font-black text-[11px] uppercase flex items-center gap-2"><MessageCircle size={18}/> WhatsApp</button>
                <div className="px-6 py-4 bg-slate-50 rounded-3xl text-center border">
                  <span className="text-slate-400 text-[9px] font-black uppercase">Visitas</span>
                  <p className="font-black text-xl">{clienteFicha.totalGeral}</p>
                </div>
              </div>
              <h4 className="font-black text-slate-400 text-[10px] uppercase border-b pb-2">Histórico</h4>
              <div className="space-y-2">
                {clienteFicha.historico?.map((h, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                    <div><p className="font-bold text-slate-800 text-sm">{h.servico}</p><p className="text-[10px] text-slate-400">{h.data} • {h.horario}</p></div>
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${h.status === 'concluido' ? 'bg-emerald-500 text-white' : h.status === 'faltou' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>{h.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adm;
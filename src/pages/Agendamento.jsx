import emailjs from "@emailjs/browser";

import React, { useState, useEffect } from "react";

import { auth, db } from "../firebase";

import {

  doc, updateDoc, arrayUnion, collection, query, where, getDocs, addDoc, setDoc, getDoc,

} from "firebase/firestore";

import { useNavigate, useLocation } from "react-router-dom";

import {

  ArrowLeft, PenLine, ChevronLeft, ChevronRight, CheckCircle2,

  Activity, PlusCircle, ClipboardList, RotateCcw, Clock, Wifi, MapPin, AlertTriangle, MessageCircle

} from "lucide-react";

import Header from "./Header";

import ModalPreConsulta from "../components/ModalPreConsulta";



const DURACAO = "1h30";

const VALOR   = 200;



const Agendamento = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const [etapa, setEtapa] = useState(1);

  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  const [mesAtual, setMesAtual] = useState(new Date());

  const [horariosOcupados, setHorariosOcupados] = useState([]);

  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const [modalidadeSelecionada, setModalidadeSelecionada] = useState(null); // "Online" | "Presencial"

  const [salvando, setSalvando] = useState(false);

  const [showPreConsulta, setShowPreConsulta] = useState(false);



  const nomeCompleto = auth.currentUser?.displayName || "Usuário";

  const nomeUsuario  = nomeCompleto.includes("|") ? nomeCompleto.split("|")[0] : nomeCompleto;



  useEffect(() => {

    const isMobile = window.innerWidth < 1024;

    if (isMobile) {

      document.body.style.overflow  = "hidden";

      document.body.style.position  = "fixed";

      document.body.style.width     = "100%";

    }

    return () => {

      document.body.style.overflow  = "auto";

      document.body.style.position  = "static";

    };

  }, []);



  // Verifica pré-consulta ao entrar na página

  useEffect(() => {

    const verificar = async () => {

      const user = auth.currentUser;

      if (!user) return;

      const snap = await getDoc(doc(db, "preConsulta", user.uid));

      if (!snap.exists()) setShowPreConsulta(true);

    };

    verificar();

  }, []);



  /* ── Slots de 30 min por dia da semana ─────────────────────── */

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



  /* ── Buscar horários ocupados ao mudar de data ─────────────── */

  useEffect(() => {

    const buscar = async () => {

      try {

        const dataString = dataSelecionada.toLocaleDateString("pt-BR");

        const q = query(collection(db, "agendamentos"), where("data", "==", dataString));

        const snap = await getDocs(q);

        const slots = obterSlotsDoDia(dataSelecionada);

        let blocos = [];



        snap.docs.forEach((d) => {

          const ag = d.data();

          if (ag.status === "cancelado") return;

          const idx = slots.indexOf(ag.horario);

          if (idx === -1) return;

          // 1h30 ocupa 3 slots de 30min

          const chunks = ag.duracao === "1h30" ? 3 : 2;

          for (let i = 0; i < chunks; i++) {

            if (idx + i < slots.length) blocos.push(slots[idx + i]);

          }

        });



        setHorariosOcupados([...new Set(blocos)]);

      } catch (e) {

        console.error("Erro ao buscar horários:", e);

      }

    };

    buscar();

  }, [dataSelecionada]);



  /* ── Finalizar agendamento ─────────────────────────────────── */

  const finalizarAgendamento = async () => {

    try {

      const user = auth.currentUser;

      if (!user)              return alert("Usuário não logado.");

      if (!servicoSelecionado) return alert("Selecione um serviço.");

      if (!horarioSelecionado) return alert("Selecione um horário.");



      const dataString = dataSelecionada.toLocaleDateString("pt-BR");

      const slots = obterSlotsDoDia(dataSelecionada);

      const idx   = slots.indexOf(horarioSelecionado);



      // 1h30 precisa de 3 slots livres consecutivos

      for (let i = 0; i < 3; i++) {

        if (idx + i >= slots.length || horariosOcupados.includes(slots[idx + i])) {

          alert("Este horário ou os blocos seguintes já estão ocupados. Escolha outro.");

          return;

        }

      }



      setSalvando(true);



      const novoAgendamento = {

        servico:       servicoSelecionado,

        modalidade:    modalidadeSelecionada,

        duracao:       DURACAO,

        valor:         VALOR,

        tipoConsulta:  "Primeira consulta",

        data:      dataString,

        horario:   horarioSelecionado,

        status:    "pendente",

        timestamp: new Date(),

        userId:    user.uid,

        userName:  user.displayName ? user.displayName.split("|")[0] : "Cliente",

      };



      const docRef = await addDoc(collection(db, "agendamentos"), novoAgendamento);

      const userRef = doc(db, "usuarios", user.uid);

      await setDoc(userRef, { agendamentos: arrayUnion({ ...novoAgendamento, id: docRef.id }) }, { merge: true });



      // Pequena pausa para o loading ser perceptível

      await new Promise(r => setTimeout(r, 800));



      setSalvando(false);

      setEtapa(5);

    } catch (e) {

      console.error("Erro:", e);

      setSalvando(false);

      alert("Erro ao finalizar: " + e.message);

    }

  };



  /* ── Helpers de calendário ─────────────────────────────────── */

  const mudarMes  = (dir) => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + dir, 1));

  const irParaHoje = () => { const h = new Date(); setMesAtual(h); setDataSelecionada(h); };

  const diasNoMes  = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();

  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay();

  const slotsDisponiveis = obterSlotsDoDia(dataSelecionada);



  /* ── Verificar se um slot está disponível para 1h30 ────────── */

  const slotLivre = (hora) => {

    const idx = slotsDisponiveis.indexOf(hora);

    for (let i = 0; i < 3; i++) {

      if (idx + i >= slotsDisponiveis.length || horariosOcupados.includes(slotsDisponiveis[idx + i]))

        return false;

    }

    return true;

  };



  /* ── Render ────────────────────────────────────────────────── */

  return (

    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">

      <style>{`

        @keyframes spin-slow { to { transform: rotate(360deg); } }

        @keyframes pulse-dot { 0%,100% { opacity:.3; transform: scale(.8); } 50% { opacity:1; transform: scale(1); } }

        .spin-slow  { animation: spin-slow 1.2s linear infinite; }

        .dot-1 { animation: pulse-dot 1.2s ease-in-out infinite; }

        .dot-2 { animation: pulse-dot 1.2s ease-in-out .2s infinite; }

        .dot-3 { animation: pulse-dot 1.2s ease-in-out .4s infinite; }

      `}</style>



      <Header nomeUsuario={nomeUsuario} />



      <main className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col items-center">

        <div className="w-full max-w-md bg-white rounded-[35px] shadow-xl border border-emerald-50 overflow-hidden">



          {/* LOADING — entre confirmar e sucesso */}

          {salvando && (

            <div className="flex flex-col items-center justify-center py-20 px-6 gap-6">

              {/* Anel giratório */}

              <div className="relative w-20 h-20">

                <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />

                <div

                  className="spin-slow absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-600"

                />

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">

                    <CheckCircle2 size={18} className="text-emerald-400" />

                  </div>

                </div>

              </div>



              <div className="text-center space-y-1">

                <p className="font-black text-gray-800 text-base">Confirmando agendamento</p>

                <p className="text-gray-400 text-sm">Aguarde um momento...</p>

              </div>



              {/* Três pontinhos */}

              <div className="flex gap-2">

                <div className="dot-1 w-2 h-2 bg-emerald-400 rounded-full" />

                <div className="dot-2 w-2 h-2 bg-emerald-400 rounded-full" />

                <div className="dot-3 w-2 h-2 bg-emerald-400 rounded-full" />

              </div>

            </div>

          )}



          {/* ETAPAS — ocultas durante o loading */}

          {!salvando && (<>



          {/* ETAPA 1: CALENDÁRIO */}

          {etapa === 1 && (

            <div className="p-6">

              <div className="flex items-center justify-between mb-6 bg-emerald-50 p-2 rounded-2xl">

                <div className="flex gap-1">

                  <button onClick={() => mudarMes(-1)} className="p-2 hover:bg-white rounded-xl text-emerald-700"><ChevronLeft size={20} /></button>

                  <button onClick={() => mudarMes(1)}  className="p-2 hover:bg-white rounded-xl text-emerald-700"><ChevronRight size={20} /></button>

                </div>

                <h3 className="font-bold text-emerald-900 uppercase text-xs tracking-widest">

                  {mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}

                </h3>

                <button onClick={irParaHoje} className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl text-[10px] font-black uppercase text-emerald-600 shadow-sm hover:shadow-md">

                  <RotateCcw size={12} /> Hoje

                </button>

              </div>



              <div className="grid grid-cols-7 gap-1 mb-4">

                {["D","S","T","Q","Q","S","S"].map((d, i) => (

                  <div key={i} className="text-center text-[10px] font-black text-emerald-200 py-2">{d}</div>

                ))}

              </div>



              <div className="grid grid-cols-7 gap-1 mb-4">

                {[...Array(primeiroDia)].map((_, i) => <div key={`e-${i}`} />)}

                {[...Array(diasNoMes)].map((_, i) => {

                  const dia  = i + 1;

                  const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);

                  const isSel   = data.toDateString() === dataSelecionada.toDateString();

                  const isHoje  = data.toDateString() === new Date().toDateString();

                  const isFds   = data.getDay() === 0 || data.getDay() === 6;

                  return (

                    <button

                      key={dia}

                      onClick={() => !isFds && setDataSelecionada(data)}

                      disabled={isFds}

                      className={`h-10 w-10 mx-auto rounded-xl flex items-center justify-center font-bold text-sm transition-all

                        ${isFds    ? "text-gray-300 cursor-not-allowed"

                        : isSel    ? "bg-emerald-600 text-white shadow-lg scale-110"

                        :            "text-gray-600 hover:bg-emerald-50"}

                        ${isHoje && !isSel && !isFds ? "border-2 border-emerald-200 text-emerald-600" : ""}`}

                    >

                      {dia}

                    </button>

                  );

                })}

              </div>



              <button

                onClick={() => setEtapa(2)}

                className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 active:scale-95"

              >

                Escolher Serviço

              </button>

            </div>

          )}



          {/* ETAPA 2: MODALIDADE + SERVIÇO */}

          {etapa === 2 && (() => {

            const isSegunda = dataSelecionada.getDay() === 1;

            const podeContinuar = servicoSelecionado && modalidadeSelecionada;

            return (

            <div className="p-6 space-y-5">

              <button onClick={() => setEtapa(1)} className="flex items-center gap-2 text-emerald-600 font-bold text-sm">

                <ArrowLeft size={16} /> Voltar ao calendário

              </button>



              {/* MODALIDADE */}

              <div className="space-y-2">

                <h3 className="font-bold text-gray-800">Tipo de atendimento:</h3>

                <div className="grid grid-cols-2 gap-3">

                  {[

                    {

                      id: "Online",

                      icon: <Wifi size={22} className="text-sky-500" />,

                      cor: "bg-sky-50",

                      borderSel: "border-sky-500",

                      dot: "bg-sky-500",

                      desc: "Qualquer dia disponível",

                      bloqueado: false,

                    },

                    {

                      id: "Presencial",

                      icon: <MapPin size={22} className={isSegunda ? "text-emerald-600" : "text-gray-300"} />,

                      cor: "bg-emerald-50",

                      borderSel: "border-emerald-600",

                      dot: "bg-emerald-600",

                      desc: isSegunda ? "Somente às segundas" : "Indisponível hoje",

                      bloqueado: !isSegunda,

                    },

                  ].map((m) => {

                    const sel = modalidadeSelecionada === m.id;

                    if (m.bloqueado) {

                      return (

                        <div

                          key={m.id}

                          className="p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center gap-2 text-center cursor-not-allowed select-none opacity-60"

                        >

                          <div className="p-2.5 rounded-xl bg-white/70">

                            {m.icon}

                          </div>

                          <span className="font-bold text-gray-400 text-sm">{m.id}</span>

                          <span className="text-[10px] text-gray-400 font-semibold leading-tight">{m.desc}</span>

                          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">

                            Somente 2ª feira

                          </span>

                        </div>

                      );

                    }

                    return (

                      <button

                        key={m.id}

                        onClick={() => setModalidadeSelecionada(m.id)}

                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 text-center transition-all

                          ${sel ? `${m.borderSel} bg-white shadow-md` : `border-gray-100 ${m.cor}`}`}

                      >

                        <div className={`p-2.5 rounded-xl ${sel ? "bg-white shadow-sm" : "bg-white/70"}`}>

                          {m.icon}

                        </div>

                        <span className="font-bold text-gray-800 text-sm">{m.id}</span>

                        <span className="text-[10px] text-gray-400 font-semibold leading-tight">{m.desc}</span>

                        {sel && <div className={`w-2.5 h-2.5 rounded-full ${m.dot}`} />}

                      </button>

                    );

                  })}

                </div>



              </div>



              {/* SERVIÇO */}

              <div className="space-y-2">

                <h3 className="font-bold text-gray-800">Selecione o Serviço:</h3>

                <div className="space-y-2.5">

                  {[

                    { id: "Nutrição",   icon: <Activity className="text-emerald-600" />,     cor: "bg-emerald-50" },

                    { id: "Acupuntura", icon: <PenLine  className="text-blue-600" />,          cor: "bg-blue-50" },

                    { id: "Farmácia",   icon: <ClipboardList className="text-purple-600" />,  cor: "bg-purple-50" },

                  ].map(s => (

                    <button

                      key={s.id}

                      onClick={() => setServicoSelecionado(s.id)}

                      className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all

                        ${servicoSelecionado === s.id ? "border-emerald-600 bg-white" : `border-gray-100 ${s.cor}`}`}

                    >

                      <div className="flex items-center gap-4">

                        <div className="bg-white p-2 rounded-lg shadow-sm">{s.icon}</div>

                        <span className="font-bold text-gray-700">{s.id}</span>

                      </div>

                      {servicoSelecionado === s.id && <div className="w-3 h-3 bg-emerald-600 rounded-full" />}

                    </button>

                  ))}

                </div>

              </div>



              {/* Duração / valor */}

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">

                <Clock size={18} className="text-emerald-600 shrink-0" />

                <div>

                  <p className="font-bold text-emerald-800 text-sm">1 hora e 30 minutos</p>

                  <p className="text-emerald-600 text-xs font-semibold">R$ {VALOR},00 por consulta</p>

                </div>

              </div>



              <button

                disabled={!podeContinuar}

                onClick={() => setEtapa(3)}

                className="w-full mt-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"

              >

                Ver Horários Disponíveis

              </button>

            </div>

            );

          })()}



          {/* ETAPA 3: HORÁRIOS */}

          {etapa === 3 && (

            <div className="p-6">

              <button onClick={() => setEtapa(2)} className="flex items-center gap-2 text-emerald-600 font-bold mb-4 text-sm">

                <ArrowLeft size={16} /> Voltar

              </button>



              <div className="bg-emerald-50 p-4 rounded-2xl text-center mb-5 border border-emerald-100">

                <p className="text-emerald-800 font-bold">

                  {dataSelecionada.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}

                </p>

                <p className="text-xs text-emerald-600 mt-0.5 font-semibold">

                  {servicoSelecionado} · 1h30 · R$ {VALOR},00

                </p>

              </div>



              <h3 className="font-bold text-gray-800 mb-4">Horários disponíveis:</h3>



              {slotsDisponiveis.length > 0 ? (

                <div className="grid grid-cols-3 gap-2.5">

                  {slotsDisponiveis.map(hora => {

                    const livre = slotLivre(hora);

                    return (

                      <button

                        key={hora}

                        disabled={!livre}

                        onClick={() => { setHorarioSelecionado(hora); setEtapa(4); }}

                        className={`p-3.5 rounded-2xl font-bold border text-xs transition-all

                          ${!livre

                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"

                            : horarioSelecionado === hora

                              ? "bg-emerald-600 border-emerald-600 text-white shadow-lg"

                              : "bg-white border-emerald-50 text-gray-700 hover:border-emerald-200"}`}

                      >

                        {!livre ? "Ocupado" : hora}

                      </button>

                    );

                  })}

                </div>

              ) : (

                <p className="text-center text-gray-500 py-6">Nenhum horário disponível para este dia.</p>

              )}

            </div>

          )}



          {/* ETAPA 4: CONFIRMAÇÃO */}

          {etapa === 4 && (

            <div className="p-6 space-y-4">

              <button onClick={() => setEtapa(3)} className="flex items-center gap-2 text-emerald-600 font-bold mb-2 text-sm">

                <ArrowLeft size={16} /> Voltar

              </button>

              <div className="bg-white border border-emerald-100 rounded-2xl p-6 text-center space-y-4 shadow-sm">

                <h2 className="font-bold text-gray-800 text-lg uppercase tracking-tight">Confirmar Agendamento</h2>

                <div className="flex flex-col gap-2 text-gray-600 text-sm text-left bg-gray-50 p-4 rounded-xl">

                  <p className="flex justify-between border-b border-gray-200 pb-2"><span className="font-bold">Serviço:</span> {servicoSelecionado}</p>

                  <p className="flex justify-between border-b border-gray-200 pb-2 items-center">

                    <span className="font-bold">Modalidade:</span>

                    <span className={`flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-full ${modalidadeSelecionada === "Online" ? "bg-sky-50 text-sky-600" : "bg-emerald-50 text-emerald-700"}`}>

                      {modalidadeSelecionada === "Online" ? <Wifi size={12} /> : <MapPin size={12} />}

                      {modalidadeSelecionada}

                    </span>

                  </p>

                  <p className="flex justify-between border-b border-gray-200 pb-2"><span className="font-bold">Duração:</span> 1 hora e 30 minutos</p>

                  <p className="flex justify-between border-b border-gray-200 pb-2"><span className="font-bold">Valor:</span> R$ {VALOR},00</p>

                  <p className="flex justify-between border-b border-gray-200 pb-2"><span className="font-bold">Data:</span> {dataSelecionada.toLocaleDateString("pt-BR")}</p>

                  <p className="flex justify-between pb-2"><span className="font-bold">Horário:</span> {horarioSelecionado}</p>

                </div>

              </div>

              <button

                onClick={finalizarAgendamento}

                className="w-full bg-emerald-600 text-white font-bold rounded-2xl p-4 hover:bg-emerald-700 shadow-md"

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

              <div>

                <h2 className="text-3xl font-bold text-gray-800">Agendado!</h2>

                <p className="text-gray-600">Seu horário foi reservado com sucesso.</p>

              </div>

              <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">

                <p className="text-emerald-800 font-bold text-lg">{servicoSelecionado}</p>

                <p className="text-gray-500">{dataSelecionada.toLocaleDateString("pt-BR")} às {horarioSelecionado}</p>

                <div className="flex items-center justify-center gap-2 mt-2.5">

                  <span className={`flex items-center gap-1.5 font-bold text-xs px-3 py-1 rounded-full ${modalidadeSelecionada === "Online" ? "bg-sky-50 text-sky-600" : "bg-emerald-50 text-emerald-700"}`}>

                    {modalidadeSelecionada === "Online" ? <Wifi size={12} /> : <MapPin size={12} />}

                    {modalidadeSelecionada}

                  </span>

                  <span className="text-emerald-600 font-bold text-xs uppercase tracking-wide">1h30 · R$ {VALOR},00</span>

                </div>

              </div>



              {modalidadeSelecionada === "Online" && (

                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 space-y-3">

                  <div className="flex items-start gap-2.5">

                    <div>

                      <p className="text-sky-800 text-[13px] mt-0.5 leading-relaxed">

                        Entre em contato pelo WhatsApp para combinar o link da chamada.

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

              )}



              <button

                onClick={() => navigate("/dashboard")}

                className="w-full bg-emerald-600 text-white font-bold rounded-2xl p-4 hover:bg-emerald-700 shadow-lg"

              >

                Voltar para o Início

              </button>

            </div>

          )}



          {/* fim das etapas */}

          </>)}



        </div>

      </main>



      <ModalPreConsulta

        isOpen={showPreConsulta}

        onClose={() => setShowPreConsulta(false)}

      />

    </div>

  );

};



export default Agendamento;
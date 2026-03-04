import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, 
  ChevronLeft, ChevronRight, CheckCircle2 
} from "lucide-react";

const Agendamento = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Data, 2: Horário, 3: Serviço
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date());

  const horarios = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const servicos = [
    { nome: "Nutrição", cor: "bg-apple-50" },
    { nome: "Acupuntura", cor: "bg-emerald-50" },
    { nome: "Farmácia", cor: "bg-teal-50" }
  ];

  // Lógica do Calendário
  const mudarMes = (dir) => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + dir, 1));
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay();

  const finalizarAgendamento = async (servicoEscolhido) => {
    try {
      const userRef = doc(db, "usuarios", auth.currentUser.uid);
      const novoAgendamento = {
        id: Date.now(),
        servico: servicoEscolhido,
        data: dataSelecionada.toLocaleDateString('pt-BR'),
        horario: horarioSelecionado,
        timestamp: new Date()
      };

      await updateDoc(userRef, {
        agendamentos: arrayUnion(novoAgendamento)
      });

      alert("Agendamento realizado com sucesso!");
      navigate("/meus-dados");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao agendar. Verifique se o banco de dados está configurado.");
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-[#059669] text-white p-4 flex items-center gap-4 shrink-0">
        <button onClick={() => etapa > 1 ? setEtapa(etapa - 1) : navigate("/dashboard")} className="p-2 bg-white/20 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold uppercase tracking-tight">Agendar {etapa === 3 ? "Serviço" : etapa === 2 ? "Horário" : "Data"}</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center overflow-hidden">
        <div className="w-full max-w-[500px] h-full flex flex-col">
          
          <div className="flex-1 min-h-0 bg-white rounded-[35px] border-2 border-emerald-100 shadow-sm flex flex-col overflow-hidden">
            
            {/* ETAPA 1: CALENDÁRIO */}
            {etapa === 1 && (
              <div className="flex flex-col h-full">
                <div className="p-4 flex justify-between items-center border-b shrink-0">
                  <span className="font-bold text-gray-700">{mesAtual.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                  <div className="flex gap-2">
                    <button onClick={() => mudarMes(-1)} className="p-1"><ChevronLeft /></button>
                    <button onClick={() => mudarMes(1)} className="p-1"><ChevronRight /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map(d => <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>)}
                    {Array.from({ length: primeiroDia }).map((_, i) => <div key={i} />)}
                    {Array.from({ length: diasNoMes }).map((_, i) => {
                      const dia = i + 1;
                      const isHoje = dataSelecionada.getDate() === dia && dataSelecionada.getMonth() === mesAtual.getMonth();
                      return (
                        <button 
                          key={dia} 
                          onClick={() => setDataSelecionada(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia))}
                          className={`h-10 rounded-xl font-bold text-sm ${isHoje ? 'bg-[#059669] text-white' : 'text-gray-600 hover:bg-emerald-50'}`}
                        >
                          {dia}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={() => setEtapa(2)} className="m-4 py-4 bg-[#059669] text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                   Próximo <ChevronRight size={18}/>
                </button>
              </div>
            )}

            {/* ETAPA 2: HORÁRIOS */}
            {etapa === 2 && (
              <div className="flex flex-col h-full">
                <div className="p-6 text-center shrink-0 border-b">
                  <p className="text-gray-500 text-sm">Disponibilidade para</p>
                  <p className="font-bold text-emerald-700">{dataSelecionada.toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-3">
                  {horarios.map(h => (
                    <button 
                      key={h}
                      onClick={() => { setHorarioSelecionado(h); setEtapa(3); }}
                      className="p-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ETAPA 3: SERVIÇO */}
            {etapa === 3 && (
              <div className="flex flex-col h-full p-6 space-y-4 overflow-y-auto">
                <div className="bg-emerald-50 p-4 rounded-2xl mb-2">
                  <p className="text-xs text-emerald-600 font-bold uppercase">Resumo da Reserva</p>
                  <p className="text-gray-700 font-medium">{dataSelecionada.toLocaleDateString('pt-BR')} às {horarioSelecionado}</p>
                </div>
                <p className="font-bold text-gray-800">Selecione o serviço:</p>
                {servicos.map(s => (
                  <button 
                    key={s.nome}
                    onClick={() => finalizarAgendamento(s.nome)}
                    className="p-5 rounded-[25px] border-2 border-gray-100 flex justify-between items-center group hover:border-emerald-500 transition-all"
                  >
                    <span className="font-bold text-gray-700">{s.nome}</span>
                    <CheckCircle2 className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Agendamento;
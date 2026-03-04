import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, 
  ChevronLeft, ChevronRight, CheckCircle2 
} from "lucide-react";

const Agendamento = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date());

  const horarios = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const servicos = ["Nutrição", "Acupuntura", "Farmácia"];

  const mudarMes = (dir) => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + dir, 1));
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay();

  const finalizarAgendamento = async (servico) => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Sessão expirada. Faça login novamente.");

      const userRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(userRef);

      // Se o documento do usuário não existir, cria um vazio
      if (!docSnap.exists()) {
        await setDoc(userRef, { agendamentos: [] });
      }

      await updateDoc(userRef, {
        agendamentos: arrayUnion({
          id: Date.now(),
          servico,
          data: dataSelecionada.toLocaleDateString('pt-BR'),
          horario: horarioSelecionado,
          status: "Confirmado"
        })
      });

      alert("Agendamento realizado com sucesso!");
      navigate("/meus-dados");
    } catch (error) {
      console.error("Erro ao agendar:", error);
      alert("Erro ao salvar no banco de dados.");
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-[#059669] text-white p-4 flex items-center gap-4 shrink-0 shadow-md">
        <button onClick={() => etapa > 1 ? setEtapa(etapa - 1) : navigate("/dashboard")} className="p-2 bg-white/20 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold uppercase tracking-tight">Agendar Horário</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center overflow-hidden">
        <div className="w-full max-w-[500px] h-full flex flex-col">
          
          <div className="flex-1 min-h-0 bg-white rounded-[35px] border-2 border-emerald-100 shadow-sm flex flex-col overflow-hidden">
            
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
                  <div className="grid grid-cols-7 gap-2 text-center mb-6">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map(d => <span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>)}
                    {Array.from({ length: primeiroDia }).map((_, i) => <div key={i} />)}
                    {Array.from({ length: diasNoMes }).map((_, i) => {
                      const dia = i + 1;
                      const selecionado = dataSelecionada.getDate() === dia && dataSelecionada.getMonth() === mesAtual.getMonth();
                      return (
                        <button key={dia} onClick={() => setDataSelecionada(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia))}
                          className={`h-10 rounded-xl font-bold text-sm ${selecionado ? 'bg-[#059669] text-white' : 'text-gray-600 hover:bg-emerald-50'}`}>
                          {dia}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={() => setEtapa(2)} className="m-4 py-4 bg-[#059669] text-white rounded-2xl font-bold">Próximo: Horário</button>
              </div>
            )}

            {etapa === 2 && (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b text-center shrink-0">
                  <p className="text-xs text-gray-400">Data: {dataSelecionada.toLocaleDateString()}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-3">
                  {horarios.map(h => (
                    <button key={h} onClick={() => { setHorarioSelecionado(h); setEtapa(3); }}
                      className="p-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {etapa === 3 && (
              <div className="flex flex-col h-full p-6 space-y-4 overflow-y-auto">
                <div className="bg-emerald-50 p-4 rounded-2xl mb-2 text-center">
                  <p className="text-gray-700 font-bold">{dataSelecionada.toLocaleDateString('pt-BR')} às {horarioSelecionado}</p>
                </div>
                <p className="font-bold text-gray-800">Escolha o serviço:</p>
                {servicos.map(s => (
                  <button key={s} onClick={() => finalizarAgendamento(s)}
                    className="p-5 rounded-[25px] border-2 border-gray-100 flex justify-between items-center group hover:border-emerald-500 transition-all">
                    <span className="font-bold text-gray-700">{s}</span>
                    <CheckCircle2 className="text-emerald-500" />
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
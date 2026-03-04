import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  User, LogOut, Calendar, Clock, Search, 
  ChevronDown, X, ClipboardList, Activity 
} from "lucide-react";

const Adm = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [agendamentosTodos, setAgendamentosTodos] = useState([]);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Escuta a coleção de usuários para pegar todos os agendamentos de todos os clientes
    const unsub = onSnapshot(collection(db, "usuarios"), (snapshot) => {
      const listaAgendamentos = [];
      snapshot.forEach((doc) => {
        const dados = doc.data();
        if (dados.agendamentos) {
          dados.agendamentos.forEach(ag => {
            listaAgendamentos.push({
              ...ag,
              usuarioNome: dados.nome || "Cliente",
              usuarioEmail: dados.email || "Não informado",
              usuarioTelefone: dados.telefone || "Não informado",
              uid: doc.id
            });
          });
        }
      });
      // Ordena pelos mais recentes primeiro
      setAgendamentosTodos(listaAgendamentos.sort((a, b) => b.id - a.id));
    });

    return () => unsub();
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* HEADER ADM */}
      <header className="bg-[#1f2937] text-white p-4 flex justify-between items-center shadow-md z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md">
            ADM
          </div>
          <div>
            <h1 className="font-bold text-sm uppercase leading-none tracking-tight">
              Painel de Controle
            </h1>
            <p className="text-[10px] uppercase opacity-90">
              Gestão de Agendamentos
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setPerfilAberto(!perfilAberto)}
            className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full border border-gray-600"
          >
            <User size={16} />
            <span className="text-xs font-bold">Admin Manuela</span>
            <ChevronDown
              size={14}
              className={perfilAberto ? "rotate-180" : ""}
            />
          </button>
          {perfilAberto && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
              <button
                onClick={async () => {
                  await auth.signOut(); // Desloga do Firebase (caso esteja logado)
                  navigate("/login"); // Força o retorno para a tela de login
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors"
              >
                <LogOut size={16} /> Sair do Painel
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-10 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-[800px] space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Próximos atendimentos
            </h2>
            <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs font-bold">
              {agendamentosTodos.length} Total
            </div>
          </div>

          {agendamentosTodos.length === 0 ? (
            <div className="bg-white p-12 rounded-[35px] border-2 border-dashed border-gray-100 text-center text-gray-400 font-medium">
              Nenhum agendamento realizado até agora.
            </div>
          ) : (
            <div className="grid gap-4">
              {agendamentosTodos.map((ag) => (
                <div
                  key={ag.id}
                  onClick={() => setAgendamentoSelecionado(ag)}
                  className="bg-white p-5 rounded-[30px] border-2 border-gray-50 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-emerald-200 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 shrink-0">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">
                        {ag.usuarioNome}
                      </h3>
                      <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider">
                        {ag.servico}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-2xl md:bg-transparent">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <Calendar size={16} className="text-emerald-500" />
                      <span>{ag.data}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <Clock size={16} className="text-emerald-500" />
                      <span>{ag.horario}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE DETALHES (ABRE AO CLICAR NO CARD) */}
      {agendamentoSelecionado && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg uppercase">
                Detalhes do Agendamento
              </h3>
              <button
                onClick={() => setAgendamentoSelecionado(null)}
                className="hover:bg-emerald-700 p-1 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Paciente
                </span>
                <p className="text-xl font-bold text-gray-800">
                  {agendamentoSelecionado.usuarioNome}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Data
                  </span>
                  <div className="flex items-center gap-2 font-bold text-gray-700">
                    <Calendar size={16} /> {agendamentoSelecionado.data}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Horário
                  </span>
                  <div className="flex items-center gap-2 font-bold text-gray-700">
                    <Clock size={16} /> {agendamentoSelecionado.horario}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border-l-4 border-emerald-500">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Serviço Solicitado
                </span>
                <p className="text-lg font-extrabold text-emerald-900">
                  {agendamentoSelecionado.servico}
                </p>
              </div>

              <button
                onClick={() => setAgendamentoSelecionado(null)}
                className="w-full py-4 bg-gray-800 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adm;
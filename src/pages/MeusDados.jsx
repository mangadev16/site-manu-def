import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import Header from "./Header";

const MeusDados = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const navigate = useNavigate();
  const nomeCompleto = auth.currentUser?.displayName || "Usuário";
  const nomeUsuario = nomeCompleto.includes("|") ? nomeCompleto.split("|")[0] : nomeCompleto;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(doc(db, "usuarios", user.uid), (docSnap) => {
      if (docSnap.exists()) setAgendamentos(docSnap.data().agendamentos || []);
    });
    return () => unsub();
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">
      <Header nomeUsuario={nomeUsuario} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col items-center">
        <div className="w-full max-w-[600px] space-y-6">
          <h2 className="text-2xl font-bold text-[#064e3b] mb-4">HISTÓRICO DE CONSULTAS</h2>
          {agendamentos.length === 0 ? (
            <div className="bg-white p-10 rounded-[30px] border-2 border-dashed border-gray-100 text-center text-gray-400">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            agendamentos.map((ag) => (
              <div
                key={ag.id}
                className="bg-white p-6 rounded-[35px] border-2 border-emerald-50 shadow-sm flex justify-between items-center transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{ag.servico}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Clock size={14} className="text-emerald-400" />
                      <span>{ag.data} às {ag.horario}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-full uppercase">
                  {ag.status || "Confirmado"}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default MeusDados;
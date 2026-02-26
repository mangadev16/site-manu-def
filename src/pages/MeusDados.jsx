import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, Clock3, AlertCircle } from "lucide-react";

const MeusDados = () => {
  const navigate = useNavigate();

  // Exemplo de como os dados virão do banco futuramente
  const historicoConsultas = [
    {
      id: 1,
      servico: "Nutrição",
      data: "10/03/2026",
      hora: "09:00",
      status: "Confirmado",
      profissional: "Dra. Manuela Bernardo"
    },
    {
      id: 2,
      servico: "Acupuntura",
      data: "22/02/2026",
      hora: "14:30",
      status: "Finalizado",
      profissional: "Dra. Manuela Bernardo"
    }
  ];

  // Função para renderizar a cor do status
  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmado": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Finalizado": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header className="bg-[#059669] text-white p-4 flex items-center gap-4 shadow-md sticky top-0 z-10">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-emerald-700 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg uppercase tracking-widest">Meus Dados</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Histórico de Consultas</h2>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-full font-bold uppercase">
            {historicoConsultas.length} Total
          </span>
        </div>

        {historicoConsultas.length > 0 ? (
          <div className="space-y-4">
            {historicoConsultas.map((consulta) => (
              <div 
                key={consulta.id} 
                className="bg-white rounded-[25px] p-5 shadow-sm border border-emerald-50 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Indicador lateral de status */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${consulta.status === 'Confirmado' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-lg leading-tight">{consulta.servico}</h3>
                    <p className="text-xs text-gray-400 font-medium">{consulta.profissional}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusStyle(consulta.status)} uppercase tracking-tighter`}>
                    {consulta.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="bg-gray-50 p-2 rounded-lg text-emerald-600">
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-semibold">{consulta.data}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="bg-gray-50 p-2 rounded-lg text-emerald-600">
                      <Clock size={16} />
                    </div>
                    <span className="text-sm font-semibold">{consulta.hora}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <MapPin size={12} /> Presencial
                  </div>
                  {consulta.status === "Confirmado" && (
                    <button className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase transition-colors">
                      Cancelar Agendamento
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ESTADO VAZIO */
          <div className="bg-white rounded-[35px] p-12 text-center border-2 border-dashed border-emerald-100 mt-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock3 size={40} className="text-emerald-200" />
            </div>
            <h3 className="font-bold text-gray-800">Nenhuma consulta encontrada</h3>
            <p className="text-sm text-gray-400 mt-2">Seus agendamentos futuros e passados aparecerão aqui.</p>
            <button 
              onClick={() => navigate("/dashboard")}
              className="mt-6 px-6 py-3 bg-[#059669] text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all"
            >
              Agendar minha primeira consulta
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MeusDados;
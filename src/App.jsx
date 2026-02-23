import React, { useState, useEffect } from "react";
import { auth } from "./firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./components/Login"; 
import setName from "./components/Login.jsx"

const App = () => {
  const [abaAtiva, setAbaAtiva] = useState("servicos");
  const [usuario, setUsuario] = useState(null); 
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelarEscuta = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
    });
    return () => cancelarEscuta(); 
  }, []);

  const lidarComLogout = () => signOut(auth);

  if (carregando) return <div className="flex h-screen items-center justify-center font-bold text-emerald-600">Carregando...</div>;

  if (!usuario) return <Login />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-[#059669] text-white p-4 shadow-md">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
    
    {/* Logo e Nome */}
    <div className="flex items-center gap-3">
      <div className="bg-white text-[#059669] font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl shadow-inner">
        MB
      </div>
      <div className="text-center md:text-left">
        <h1 className="font-bold text-lg md:text-2xl tracking-tight leading-none">MANUELA BERNARDO</h1>
        <p className="text-[10px] md:text-xs opacity-90 uppercase tracking-widest">Nutrição • Acupuntura • Farmácia</p>
      </div>
    </div>

    {/* Menu de Navegação Responsivo */}
    <nav className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
      <button onClick={() => setAbaAtiva("servicos")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${abaAtiva === "servicos" ? "bg-emerald-800 shadow-inner" : "hover:bg-emerald-600"}`}>
        Serviços
      </button>
      <button onClick={() => setAbaAtiva("agendamento")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${abaAtiva === "agendamento" ? "bg-emerald-800 shadow-inner" : "hover:bg-emerald-600"}`}>
        Agendar
      </button>
      <button onClick={() => setAbaAtiva("dados")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${abaAtiva === "dados" ? "bg-emerald-800 shadow-inner" : "hover:bg-emerald-600"}`}>
        Meus Dados
      </button>
      
      {/* Botão Sair com destaque */}
      <button onClick={() => auth.signOut()} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-all">
        SAIR
      </button>
    </nav>
  </div>
</header>

      <main className="p-6 max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        {abaAtiva === "servicos" && <Servicos />}
        {abaAtiva === "agendamento" && <Agendamento userEmail={usuario.email} />}
        {abaAtiva === "dados" && <MeusDados usuario={usuario} />}
      </main>
    </div>
  );
}; 
// --- Componentes das Abas ---
const Servicos = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2">

    {/* Card de Nutrição */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <span className="text-3xl mb-2 block">🍏</span>
      <h3 className="font-bold text-lg text-gray-800">Nutrição</h3>
      <p className="text-gray-500 text-sm">Planos personalizados para sua saúde.</p>
    </div>

    {/*card de acupuntura*/}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <span className="text-3xl mb-2 block">📍</span>
      <h3 className="font-bold text-lg text-gray-800">Acupuntura</h3>
      <p className="text-gray-500 text-sm">Energia de Volta.</p>
    </div>

    {/*card de farmácia*/}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <span className="text-3xl mb-2 block">💊</span>'
      <h3 className="font-bold text-lg text-gray-800">farmácia</h3>
      <p className="text-gray-500 text-sm">Medicamentos Modificados.</p>
    </div>
  </div>
);

const Agendamento = ({ userEmail }) => (
  <div className="text-center">
    <h2 className="text-xl font-bold text-emerald-700 mb-4 font-sans">Olá, {userEmail}</h2>
    <p className="text-gray-600 mb-6 font-sans">Escolha um horário para sua consulta:</p>
    <div className="grid grid-cols-3 gap-2">
      {["09:00", "10:00", "11:00", "14:00", "15:00"].map(h => (
        <button key={h} className="p-3 border-2 border-emerald-500 text-emerald-700 font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition">{h}</button>
      ))}
    </div>
  </div>
);

const MeusDados = ({ usuario }) => (
  <div className="animate-fade-in space-y-6">
    <div className="border-b pb-4">
      <h2 className="text-2xl font-bold text-emerald-700">Meus Dados</h2>
      <p className="text-gray-500">Gerencie suas informações pessoais e consultas.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
          👤 Informações do Perfil
        </h3>
        <div className="space-y-3 text-sm">
          <p><strong className="text-gray-600">Nome:</strong> {usuario.displayName || "Não informado"}</p>
          <p><strong className="text-gray-600">E-mail:</strong> {usuario.email}</p>
          <p><strong className="text-gray-600">ID da Conta:</strong> <span className="text-xs text-gray-400">{usuario.uid}</span></p>
        </div>
      </div>

      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
          📅 Próxima Consulta
        </h3>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-emerald-600 font-medium mb-1">Nenhum agendamento ativo</p>
          <p className="text-xs text-emerald-400">Vá na aba "Agendar" para marcar sua sessão.</p>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Histórico de Atividades</h3>
      <div className="text-center py-8 text-gray-400 italic text-sm">
        O seu histórico de consultas e receitas aparecerá aqui em breve.
      </div>
    </div>
  </div>
);

export default App;
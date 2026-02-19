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
      <header className="bg-emerald-600 text-white p-4 shadow-md">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    
    {/* Logo */}
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold">MB</div>
      <h1 className="font-bold hidden sm:block uppercase">Manuela Bernardo</h1>
    </div>

    {/* Menu Central */}
    <nav className="flex gap-4">
      <button onClick={() => setAbaAtiva("dados")} className="hover:text-emerald-200">Meus Dados</button>
      <button onClick={() => setAbaAtiva("servicos")} className="hover:text-emerald-200">Serviços</button>
      <button onClick={() => setAbaAtiva("agendamento")} className="hover:text-emerald-200">Agendar</button>
      
      
    </nav>

    {/* CANTO DIREITO: Onde o nome aparece */}
    <div className="flex items-center gap-2 bg-emerald-700/40 p-1.5 px-3 rounded-full border border-emerald-400/30">
      <div className="text-right leading-tight">
        <p className="text-[10px] text-emerald-100">Olá,</p>
        {/* Aqui ele pega o displayName do Firebase. Se estiver vazio, usa "Paciente" */}
        <p className="text-sm font-bold truncate max-w-[100px]">
          {usuario.displayName || "Paciente"}
        </p>
      </div>
      <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">
        👤
      </div>
      <button onClick={() => signOut(auth)} title="Sair" className="ml-2 hover:text-red-300">
        SAIR
      </button>
    </div>

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
  <div className="grid md:grid-cols-3 gap-6">
    <div className="p-5 border border-emerald-50 rounded-xl bg-emerald-50/30">
      <h3 className="font-bold text-lg mb-2">🍏 Nutrição</h3>
      <p className="text-sm text-gray-600">Planos personalizados.</p>
    </div>
    <div className="p-5 border border-emerald-50 rounded-xl bg-emerald-50/30">
      <h3 className="font-bold text-lg mb-2">📍 Acupuntura</h3>
      <p className="text-sm text-gray-600">Equilíbrio energético.</p>
    </div>
    <div className="p-5 border border-emerald-50 rounded-xl bg-emerald-50/30">
      <h3 className="font-bold text-lg mb-2">💊 Farmácia</h3>
      <p className="text-sm text-gray-600">Suplementação natural.</p>
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
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MeusDados from "./pages/MeusDados";
import Perfil from "./pages/Perfil";
import Agendamento from "./pages/Agendamento";
import Nutricao from "./pages/Nutricao";
import Acupuntura from "./pages/Acupuntura";
import Farmacia from "./pages/Farmacia";
import Adm from "./pages/Adm";
import Contatos from "./pages/Contatos";
import Manuela from "./pages/Manuela";
import Inicio from "./pages/Inicio";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <Router>
      <Routes>
        {/* Autenticação */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Administração */}
        <Route path="/adm" element={<Adm />} />

        {/* Rotas 100% públicas */}
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/manuela" element={<Manuela />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/nutricao" element={<Nutricao />} />
        <Route path="/acupuntura" element={<Acupuntura />} />
        <Route path="/farmacia" element={<Farmacia />} />

        {/* Rotas protegidas (requerem login) */}
        <Route path="/agendamento" element={user ? <Agendamento /> : <Navigate to="/login" />} />
        <Route path="/meus-dados" element={user ? <MeusDados /> : <Navigate to="/login" />} />
        <Route path="/perfil" element={user ? <Perfil /> : <Navigate to="/login" />} />

        {/* Padrão */}
        <Route path="/" element={<Navigate to="/inicio" />} />
      </Routes>
    </Router>
  );
}

export default App;
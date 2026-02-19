import React, { useState } from "react";
import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { Eye, EyeOff } from "lucide-react"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [confirmarEmail, setConfirmarEmail] = useState(""); // Novo estado
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState(""); 
  const [isCadastro, setIsCadastro] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  // Função para validar o padrão do e-mail
  const validarEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const lidarComAutenticacao = async (e) => {
    e.preventDefault();
    setErro("");

    // Validação de Padrão
    if (!validarEmail(email)) {
      setErro("Por favor, insira um e-mail válido (ex: nome@exemplo.com).");
      return;
    }

    // Validação de Confirmação (apenas no cadastro)
    if (isCadastro && email !== confirmarEmail) {
      setErro("Os e-mails digitados não coincidem.");
      return;
    }

    try {
      if (isCadastro) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        await updateProfile(userCredential.user, { displayName: nome });
        window.location.reload();
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
      }
    } catch (err) {
      setErro("Erro na autenticação. Verifique os dados.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] p-4 font-sans">
      <div className="bg-white p-8 rounded-[30px] shadow-2xl w-full max-w-md border border-emerald-50">
        
        <div className="text-center mb-8">
          <div className="inline-block px-8 py-3 bg-[#059669] rounded-full text-white font-bold text-xl mb-4 shadow-md">
            Manuel Bernardo
          </div>
          <h2 className="text-xl font-bold text-[#1f2937] leading-tight uppercase mb-1">
            Nutrição, Acupuntura e Farmácia
          </h2>
          <p className="text-[#059669] text-sm font-bold tracking-widest uppercase">
            {isCadastro ? "Criar minha Conta" : "Acesso ao Consultório"}
          </p>
        </div>

        <form onSubmit={lidarComAutenticacao} className="space-y-4">
          {isCadastro && (
            <input 
              type="text" 
              placeholder="Nome Completo" 
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              onChange={(e) => setNome(e.target.value)}
              required
            />
          )}
          
          <input 
            type="email" 
            placeholder="Seu E-mail" 
            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* NOVO CAMPO: Aparece apenas no Cadastro */}
          {isCadastro && (
            <input 
              type="email" 
              placeholder="Confirme seu E-mail" 
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 transition-all animate-pulse-once"
              onChange={(e) => setConfirmarEmail(e.target.value)}
              required
            />
          )}

          <div className="relative">
            <input 
              type={mostrarSenha ? "text" : "password"} 
              placeholder="Senha" 
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {erro && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
               <p className="text-red-700 text-xs font-bold">{erro}</p>
            </div>
          )}

          <button className="w-full bg-[#059669] text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
            {isCadastro ? "Finalizar Cadastro" : "Entrar"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          {isCadastro ? "Já tem uma conta?" : "Ainda não tem conta?"} 
          <button 
            onClick={() => { setIsCadastro(!isCadastro); setErro(""); }} 
            className="ml-1 text-[#059669] font-bold hover:underline"
          >
            {isCadastro ? "Faça Login" : "Cadastre-se aqui"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const lidarComLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/dashboard");
    } catch (err) {
      setErro("E-mail ou senha incorretos.");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#228B44] to-[#3DB261] p-4 overflow-hidden font-sans">
      {/* Mesma largura (max-w-md) e arredondamento do Register */}
      <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-2xl w-full max-w-md border border-emerald-50 flex flex-col justify-center min-h-[520px]">
        
        <div className="text-center mb-6">
          <div className="inline-block px-6 py-2 bg-[#059669] rounded-full text-white font-bold text-lg mb-4 shadow-md">
            Manuel Bernardo
          </div>
          <h2 className="text-xl font-extrabold text-[#1f2937] leading-tight uppercase">
            Nutrição e Acupuntura
          </h2>
          <p className="text-[#059669] text-[10px] font-bold tracking-widest uppercase mt-1">
            Acesso ao Consultório
          </p>
        </div>

        {/* space-y aumentado para compensar a falta de campos e manter o tamanho do card */}
        <form onSubmit={lidarComLogin} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Seu E-mail" 
              className="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="relative">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                placeholder="Senha" 
                className="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
              >
                {mostrarSenha ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {erro && <p className="text-red-500 text-[10px] font-bold text-center">{erro}</p>}

          <button className="w-full bg-[#059669] text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-95 mt-4">
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center text-[12px] text-gray-400">
          Ainda não tem conta? 
          <Link to="/register" className="ml-1 text-[#059669] font-bold hover:underline">
            Cadastre-se aqui
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
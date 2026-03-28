import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Lock, ArrowRight, Code } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [modoAdmin, setModoAdmin] = useState(false);
  const [senhaAdmin, setSenhaAdmin] = useState("");
  const [exibirDev, setExibirDev] = useState(false); // Novo estado para o contato do dev
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

  const lidarComLoginAdmin = (e) => {
    e.preventDefault();
    const SENHA_MESTRA = "123456";

    if (senhaAdmin === SENHA_MESTRA) {
      navigate("/adm");
    } else {
      setErro("Senha administrativa incorreta.");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#228B44] to-[#3DB261] p-4 overflow-hidden font-sans relative">
      <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-2xl w-full max-w-md border border-emerald-50 flex flex-col justify-center min-h-[520px]">
        <div className="text-center mb-6">
          <div className="inline-block px-6 py-2 bg-[#059669] rounded-full text-white font-bold text-lg mb-4 shadow-md">
            Manuela Bernardo
          </div>
          <h2 className="text-xl font-extrabold text-[#1f2937] leading-tight uppercase">
            {modoAdmin ? "Acesso Administrativo" : "Nutrição, Acupuntura e Farmácia"}
          </h2>
          <p className="text-[#059669] text-[10px] font-bold tracking-widest uppercase mt-1">
            {modoAdmin ? "Painel de Controle" : "Acesso ao Consultório"}
          </p>
        </div>

        {!modoAdmin ? (
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

            {erro && (
              <p className="text-red-500 text-[10px] font-bold text-center">
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#059669] text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={() => {
                setModoAdmin(true);
                setErro("");
              }}
              className="w-full py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all text-sm"
            >
              <ShieldCheck size={18} /> Entrar como Administrador
            </button>
          </form>
        ) : (
          <form
            onSubmit={lidarComLoginAdmin}
            className="space-y-6 animate-in fade-in duration-300"
          >
            <div className="space-y-4">
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  placeholder="Senha Administrativa"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-base font-bold"
                  value={senhaAdmin}
                  onChange={(e) => setSenhaAdmin(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            {erro && (
              <p className="text-red-500 text-[10px] font-bold text-center">
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#1f2937] text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Acessar Painel <ArrowRight size={20} />
            </button>

            <button
              type="button"
              onClick={() => {
                setModoAdmin(false);
                setErro("");
                setSenhaAdmin("");
              }}
              className="w-full text-center text-gray-400 text-xs font-bold hover:text-gray-600 uppercase tracking-widest"
            >
              Voltar ao login de cliente
            </button>
          </form>
        )}

        {!modoAdmin && (
          <div className="mt-8 text-center text-[12px] text-gray-400">
            Ainda não tem conta?
            <Link
              to="/register"
              className="ml-1 text-[#059669] font-bold hover:underline"
            >
              Cadastre-se aqui
            </Link>
          </div>
        )}
      </div>

      {/* --- BOTÃO DO DESENVOLVEDOR NO CANTO INFERIOR ESQUERDO --- */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3">
        <button
          onClick={() => setExibirDev(!exibirDev)}
          className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-lg backdrop-blur-sm transition-all border border-white/30 shadow-lg font-mono font-bold"
          title="Desenvolvedor"
        >
          {"</>"}
        </button>
        
        {exibirDev && (
          <div className="bg-white py-2 px-4 rounded-xl shadow-xl border border-emerald-100 animate-in slide-in-from-left-2 duration-300">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter leading-none">Contato do Desenvolvedor:</p>
            <p className="text-[#059669] text-sm font-bold">amiltondantasdev@gmail.com</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
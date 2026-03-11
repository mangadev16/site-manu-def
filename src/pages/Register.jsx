import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // Máscara e limite de dígitos
  const formatarWhatsApp = (valor) => {
    let v = valor.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
    return v;
  };

  const lidarComRegistro = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha,
      );

      // IMPORTANTE: Salvamos NOME + WHATSAPP usando o separador "|"
      await updateProfile(userCredential.user, {
        displayName: `${nome}|${whatsapp}`,
      });

      navigate("/dashboard");
    } catch (err) {
      // Exibe o erro real do Firebase para ajudar no diagnóstico
      setErro(err.message);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#228B44] to-[#3DB261] p-4 overflow-hidden font-sans">
      <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-2xl w-full max-w-md border border-emerald-50 flex flex-col justify-center">
        <div className="text-center mb-4">
          <div className="inline-block px-6 py-2 bg-[#059669] rounded-full text-white font-bold text-lg mb-3 shadow-md">
            Manuel Bernardo
          </div>
          <h2 className="text-xl font-extrabold text-[#1f2937] leading-tight uppercase">
            Nutrição, Acupuntura e Farmácia
          </h2>
          <p className="text-[#059669] text-[10px] font-bold tracking-widest uppercase mt-1">
            Criar minha conta
          </p>
        </div>

        <form onSubmit={lidarComRegistro} className="space-y-3">
          <input
            type="text"
            placeholder="Nome Completo"
            className="w-full p-3.5 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 text-base"
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Seu E-mail"
            className="w-full p-3.5 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 text-base"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="WhatsApp (Ex: (11) 99999-9999)"
            value={whatsapp}
            maxLength={15}
            className="w-full p-3.5 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 text-base"
            onChange={(e) => setWhatsapp(formatarWhatsApp(e.target.value))}
            required
          />
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              className="w-full p-3.5 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {erro && (
            <p className="text-red-500 text-[10px] font-bold text-center">
              {erro}
            </p>
          )}

          <button className="w-full bg-[#059669] text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-95 mt-2">
            Finalizar Cadastro
          </button>
        </form>

        <div className="mt-4 text-center text-[12px] text-gray-400">
          Já tem uma conta?
          <Link
            to="/login"
            className="ml-1 text-[#059669] font-bold hover:underline"
          >
            Faça Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

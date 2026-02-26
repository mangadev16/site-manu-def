import React, { useState } from "react";
import { auth } from "../firebase";
import { updatePassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Camera, Calendar, Save } from "lucide-react";

const Perfil = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  // Estados
  const [nome, setNome] = useState(user?.displayName || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(user?.photoURL || "");
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  // Data de criação formatada
  const dataCriacao = user?.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR') 
    : "Disponível após login";

  const handleSalvar = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    try {
      // 1. Atualizar Nome e Foto
      await updateProfile(user, { 
        displayName: nome,
        photoURL: fotoUrl 
      });

      // 2. Atualizar Senha (apenas se o campo não estiver vazio)
      if (novaSenha) {
        if (novaSenha.length < 6) {
          throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
        }
        await updatePassword(user, novaSenha);
        setNovaSenha(""); // Limpa o campo após sucesso
      }

      setMensagem({ tipo: "sucesso", texto: "Dados atualizados com sucesso!" });
    } catch (error) {
      console.error(error);
      setMensagem({ 
        tipo: "erro", 
        texto: error.message.includes("recent-login") 
          ? "Por segurança, faça login novamente para alterar a senha." 
          : "Erro ao atualizar os dados." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-[#059669] text-white p-4 flex items-center gap-4 shadow-md">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-emerald-700 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg uppercase tracking-widest">Dados da Conta</h1>
      </header>

      <main className="p-6 max-w-md mx-auto">
        <div className="bg-white rounded-[35px] shadow-xl p-8 border border-emerald-50">
          
          {/* FOTO DE PERFIL */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {fotoUrl ? (
                  <img src={fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-[#059669]" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-[#059669] p-2 rounded-full text-white cursor-pointer shadow-md hover:scale-110 transition-transform border-2 border-white">
                <Camera size={16} />
                <input 
                  type="text" 
                  className="hidden" 
                  onChange={(e) => setFotoUrl(e.target.value)} 
                  placeholder="URL da imagem"
                />
              </label>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 uppercase font-extrabold tracking-tighter text-center leading-tight">
              Toque no ícone para alterar<br/>a foto de perfil
            </p>
          </div>

          <form onSubmit={handleSalvar} className="space-y-5">
            
            {/* E-MAIL (FIXO) */}
            <div className="opacity-80">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">E-mail de Acesso</label>
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl border border-gray-100 text-gray-500">
                <Mail size={18} />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
            </div>

            {/* NOME COMPLETO */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">Seu Nome</label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-sm">
                <User size={18} className="text-emerald-600" />
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700"
                />
              </div>
            </div>

            <div className="relative py-2">
               <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
               <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300"><span className="bg-white px-2">Segurança</span></div>
            </div>

            {/* NOVA SENHA */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">Alterar Senha</label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-sm">
                <Lock size={18} className="text-emerald-600" />
                <input 
                  type={mostrarNovaSenha ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Introduza uma nova senha"
                  className="bg-transparent outline-none text-sm w-full font-semibold"
                />
                <button 
                  type="button" 
                  onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)} 
                  className="text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[9px] text-gray-400 mt-1 ml-2 font-medium">* Deixe vazio para manter a senha atual</p>
            </div>

            {/* DATA DE CRIAÇÃO */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-50">
              <Calendar size={12} className="text-gray-300" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                Membro desde: <span className="text-emerald-600">{dataCriacao}</span>
              </p>
            </div>

            {/* FEEDBACK */}
            {mensagem.texto && (
              <div className={`p-4 rounded-2xl text-center text-[11px] font-bold animate-pulse ${mensagem.tipo === "sucesso" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                {mensagem.texto}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#059669] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95 transition-all"
            >
              <Save size={20} /> Guardar Alterações
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
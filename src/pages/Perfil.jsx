import React, { useState } from "react";
import { auth } from "../firebase";
import { updatePassword, updateProfile, deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Camera, Calendar, Save, Phone, Trash2 } from "lucide-react";

const Perfil = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  // Separação lógica: Nome fica no índice [0], WhatsApp no [1]
  const partesDono = user?.displayName ? user.displayName.split("|") : ["", ""];
  
  const [nome, setNome] = useState(partesDono[0] || "");
  const [whatsapp, setWhatsapp] = useState(partesDono[1] || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(user?.photoURL || "");
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const formatarWhatsApp = (valor) => {
    let v = valor.replace(/\D/g, ""); 
    if (v.length > 11) v = v.slice(0, 11); 
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
    return v;
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" });
    try {
      // Salva novamente com o separador para manter o padrão
      await updateProfile(user, { 
        displayName: `${nome}|${whatsapp}`,
        photoURL: fotoUrl 
      });

      if (novaSenha) {
        if (novaSenha.length < 6) throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
        await updatePassword(user, novaSenha);
        setNovaSenha("");
      }
      setMensagem({ tipo: "sucesso", texto: "Dados atualizados com sucesso!" });
    } catch (error) {
      setMensagem({ 
        tipo: "erro", 
        texto: error.message.includes("recent-login") ? "Faça login novamente para alterar a senha." : "Erro ao atualizar." 
      });
    }
  };

  const handleApagarConta = async () => {
    if (window.confirm("ATENÇÃO: Deseja apagar sua conta permanentemente?")) {
      try {
        await deleteUser(user);
        navigate("/login");
      } catch (error) {
        setMensagem({ tipo: "erro", texto: "Erro ao excluir. Tente fazer login novamente." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <header className="bg-[#059669] text-white p-4 flex items-center gap-4 shadow-md">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 hover:bg-emerald-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg uppercase tracking-widest">
          Dados da Conta
        </h1>
      </header>

      <main className="p-6 max-w-md mx-auto">
        <div className="bg-white rounded-[35px] shadow-xl p-8 border border-emerald-50">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-[#059669]" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-[#059669] p-2 rounded-full text-white cursor-pointer border-2 border-white shadow-md">
                <Camera size={16} />
                <input
                  type="text"
                  className="hidden"
                  onChange={(e) => setFotoUrl(e.target.value)}
                />
              </label>
            </div>
            {/* EXIBE APENAS O NOME NO TEXTO DE BOAS-VINDAS */}
            <h2 className="mt-4 font-bold text-gray-800 text-lg">
              {nome || "Usuário"}
            </h2>
          </div>

          <form onSubmit={handleSalvar} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">
                Seu Nome
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-emerald-500 transition-all">
                <User size={18} className="text-emerald-600" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-700"
                />
              </div>
            </div>

            {/* whatsapp */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">
                WhatsApp
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl border border-gray-100 transition-all opacity-70 cursor-not-allowed">
                <Phone size={18} className="text-emerald-600" />
                <input
                  type="text"
                  value={whatsapp}
                  readOnly // <--- Isso impede a edição
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* ... Resto do formulário (Senha, Feedback, Botão Salvar e Apagar) mantém o estilo anterior ... */}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300">
                <span className="bg-white px-2">Segurança</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">
                Alterar Senha
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-emerald-500 transition-all">
                <Lock size={18} className="text-emerald-600" />
                <input
                  type={mostrarNovaSenha ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova senha"
                  className="bg-transparent outline-none text-sm w-full font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                  className="text-gray-400"
                >
                  {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mensagem.texto && (
              <div
                className={`p-4 rounded-2xl text-center text-[11px] font-bold ${mensagem.tipo === "sucesso" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
              >
                {mensagem.texto}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#059669] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Save size={20} /> Guardar Alterações
            </button>
          </form>

          <button
            onClick={handleApagarConta}
            className="w-full mt-6 bg-red-50 text-red-600 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
          >
            <Trash2 size={18} /> Apagar Minha Conta
          </button>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
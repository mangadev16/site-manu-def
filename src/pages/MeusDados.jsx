import React, { useState } from "react";
import { auth } from "../firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowLeft, Save } from "lucide-react";

const MeusDados = () => {
  const user = auth.currentUser;
  const [nome, setNome] = useState(user?.displayName || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const navigate = useNavigate();

  const atualizarPerfil = async (e) => {
    e.preventDefault();
    try {
      if (nome !== user.displayName) {
        await updateProfile(user, { displayName: nome });
      }
      if (novaSenha) {
        await updatePassword(user, novaSenha);
      }
      setMensagem({ tipo: "sucesso", texto: "Dados atualizados com sucesso!" });
      setTimeout(() => setMensagem({ tipo: "", texto: "" }), 3000);
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao atualizar. Verifique sua conexão." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-[#059669] text-white p-4 flex items-center gap-4 shadow-md">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-emerald-700 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg uppercase tracking-wider text-white">Meus Dados</h1>
      </header>

      <main className="p-6 max-w-md mx-auto">
        <div className="bg-white rounded-[35px] shadow-xl p-8 border border-emerald-50">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-[#059669]">
              <User size={40} />
            </div>
          </div>

          <form onSubmit={atualizarPerfil} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">E-mail (Login)</label>
              <input type="text" value={user?.email} disabled className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-100 text-gray-500 text-sm cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Nome Completo</label>
              <div className="relative">
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Nova Senha</label>
              <div className="relative">
                <input type="password" placeholder="Deixe em branco para manter" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>

            {mensagem.texto && (
              <p className={`text-center text-xs font-bold p-3 rounded-xl ${mensagem.tipo === "sucesso" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {mensagem.texto}
              </p>
            )}

            <button className="w-full bg-[#059669] text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all">
              <Save size={20} /> Salvar Alterações
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default MeusDados;
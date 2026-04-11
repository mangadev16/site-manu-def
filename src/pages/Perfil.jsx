import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Camera,
  Save,
  Phone,
  Trash2,
  AlertCircle,
} from "lucide-react";

const Perfil = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fotoUrl, setFotoUrl] = useState(user?.photoURL || "");
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [nomeAlterado, setNomeAlterado] = useState(false); // flag se já alterou o nome antes
  const [carregando, setCarregando] = useState(true);

  // Carregar dados do usuário do Firestore
  useEffect(() => {
    const carregarDados = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setNome(dados.nome || "");
          setWhatsapp(dados.telefone || "");
          setNomeAlterado(dados.nomeAlterado || false);
        } else {
          // Se não existir documento, usar dados do Auth
          const partes = user.displayName ? user.displayName.split("|") : ["", ""];
          setNome(partes[0] || "");
          setWhatsapp(partes[1] || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, [user]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    // Se já alterou o nome antes, não permitir nova alteração
    if (nomeAlterado) {
      setMensagem({
        tipo: "erro",
        texto: "O nome já foi alterado uma vez e não pode ser modificado novamente.",
      });
      return;
    }

    // Verificar se o nome foi realmente modificado
    const nomeOriginal = user?.displayName?.split("|")[0] || "";
    if (nome === nomeOriginal) {
      setMensagem({
        tipo: "erro",
        texto: "Nenhuma alteração detectada. Modifique o nome para salvar.",
      });
      return;
    }

    if (!nome.trim()) {
      setMensagem({ tipo: "erro", texto: "O nome não pode estar vazio." });
      return;
    }

    try {
      // Atualizar no Authentication
      await updateProfile(user, {
        displayName: `${nome}|${whatsapp}`,
        photoURL: fotoUrl,
      });

      // Atualizar no Firestore
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        nome: nome,
        telefone: whatsapp,
        email: user.email,
        nomeAlterado: true, // Marca que o nome já foi alterado
      });

      setNomeAlterado(true);
      setMensagem({ tipo: "sucesso", texto: "Nome alterado com sucesso! Não será possível alterar novamente." });
    } catch (error) {
      console.error(error);
      setMensagem({
        tipo: "erro",
        texto: "Erro ao atualizar. Tente novamente mais tarde.",
      });
    }
  };

  const handleApagarConta = async () => {
    if (window.confirm("ATENÇÃO: Deseja apagar sua conta permanentemente?")) {
      try {
        await user.delete();
        navigate("/login");
      } catch (error) {
        setMensagem({
          tipo: "erro",
          texto: "Erro ao excluir. Tente fazer login novamente.",
        });
      }
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

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
                  <img src={fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
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
                  placeholder="URL da foto"
                />
              </label>
            </div>
            <h2 className="mt-4 font-bold text-gray-800 text-lg">{nome || "Usuário"}</h2>
          </div>

          <form onSubmit={handleSalvar} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">
                Seu Nome
              </label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${nomeAlterado ? "bg-gray-100 border-gray-200 opacity-70" : "bg-gray-50 border-gray-100 focus-within:border-emerald-500"}`}>
                <User size={18} className="text-emerald-600" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={nomeAlterado}
                  className={`bg-transparent outline-none text-sm w-full font-semibold ${nomeAlterado ? "text-gray-500 cursor-not-allowed" : "text-gray-700"}`}
                />
              </div>
              {nomeAlterado ? (
                <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Nome já foi alterado. Não é possível modificar novamente.
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-1">Você só poderá alterar seu nome uma única vez.</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">
                WhatsApp
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl border border-gray-100 opacity-70 cursor-not-allowed">
                <Phone size={18} className="text-emerald-600" />
                <input
                  type="text"
                  value={whatsapp}
                  readOnly
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">O WhatsApp não pode ser alterado. Entre em contato com o suporte para mudanças.</p>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300">
                <span className="bg-white px-2">Informações</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2 tracking-widest">
                E-mail
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl border border-gray-100 opacity-70">
                <Mail size={18} className="text-emerald-600" />
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="bg-transparent outline-none text-sm w-full font-semibold text-gray-500 cursor-not-allowed"
                />
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
              disabled={nomeAlterado}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${nomeAlterado ? "bg-gray-400 cursor-not-allowed" : "bg-[#059669] text-white hover:bg-emerald-700"}`}
            >
              <Save size={20} /> {nomeAlterado ? "Nome já alterado" : "Alterar Nome"}
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
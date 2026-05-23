import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const TILE_W = 1878;
const TILE_H = 1080;

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
      // 1. Criar usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha,
      );
      const user = userCredential.user;

      // 2. Atualizar o perfil com nome e WhatsApp
      await updateProfile(user, {
        displayName: `${nome}|${whatsapp}`,
      });

      // 3. Salvar os dados do usuário no Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: nome,
        email: email,
        telefone: whatsapp,
        historico: [],
        agendamentos: [],
        criadoEm: new Date()
      });

      console.log("Usuário cadastrado com sucesso:", user.uid);
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setErro(err.message);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes slideBg {
          from { background-position: 0 0; }
          to   { background-position: -${TILE_W}px 0; }
        }
        .animated-bg { animation: slideBg 52s linear infinite; }
        .register-root * { font-family: 'Nunito', sans-serif; }
        input::placeholder { font-family: 'Nunito', sans-serif; color: #a1a1aa; }
      `}</style>

      <div
        className="register-root"
        style={{
          minHeight: "100vh", width: "100vw",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "4rem 1.25rem 2rem 1.25rem", overflowX: "hidden", position: "relative",
          /* 🎨 O gradiente liso e estático fica na base, sem quebras */
          background: "linear-gradient(135deg, #508461 0%, #76AB7A 50%, #A9DC93 100%)",
          boxSizing: "border-box"
        }}
      >
        <div 
          className="animated-bg"
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('/Vector.png')",
            backgroundRepeat: "repeat",
            backgroundSize: `${TILE_W}px ${TILE_H}px`,
            opacity: 0.55, 
            pointerEvents: "none", zIndex: 0,
          }} 
        />

        {/* Card Branco principal */}
        <div style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: "400px",
          borderRadius: "35px", 
          backgroundColor: "white",
          boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
          paddingBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "60px", 
          boxSizing: "border-box"
        }}>

          {/* Quadrado Verde que sobrepõe o card */}
          <div style={{
            backgroundColor: "#164E41", 
            width: "80%",              
            height: "135px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: "1rem",
            borderRadius: "28px", 
            marginTop: "-65px",        
            boxShadow: "0px 12px 25px rgba(0, 0, 0, 0.2)",
            boxSizing: "border-box",
            zIndex: 20,
            position: "relative"       
          }}>
            <img
              src="/logotransparente.png"
              alt="Manu"
              style={{
                position: "absolute",  
                top: "40%",            
                left: "50%",           
                transform: "translate(-50%, -50%)", 
                height: "200px",       
                width: "auto",
                objectFit: "contain",
              }}
            />
            <p style={{
              color: "#CBEF6C",
              fontSize: "10px",      
              fontWeight: 800,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              textAlign: "center",
              margin: 0,
              whiteSpace: "nowrap"
            }}>
              Nutrição ● Farmácia ● Acupuntura
            </p>
          </div>

          {/* Subtítulo do Card */}
          <p style={{
            color: "#2D7A5E", 
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "1.5rem",
            marginTop: "1.8rem",
          }}>
            Criar minha conta
          </p>

          {/* Formulário e Inputs */}
          <form onSubmit={lidarComRegistro} style={{ padding: "0 1.75rem", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <input
              type="text"
              placeholder="Nome Completo"
              style={{
                width: "100%", padding: "1rem 1.25rem",
                border: "none", borderRadius: "14px",
                backgroundColor: "#F4F6F8", outline: "none",
                fontSize: "15px", boxSizing: "border-box",
                color: "#3f3f46"
              }}
              onChange={(e) => setNome(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Seu E-mail"
              style={{
                width: "100%", padding: "1rem 1.25rem",
                border: "none", borderRadius: "14px",
                backgroundColor: "#F4F6F8", outline: "none",
                fontSize: "15px", boxSizing: "border-box",
                color: "#3f3f46"
              }}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="WhatsApp (Ex: (11) 99999-9999)"
              value={whatsapp}
              maxLength={15}
              style={{
                width: "100%", padding: "1rem 1.25rem",
                border: "none", borderRadius: "14px",
                backgroundColor: "#F4F6F8", outline: "none",
                fontSize: "15px", boxSizing: "border-box",
                color: "#3f3f46"
              }}
              onChange={(e) => setWhatsapp(formatarWhatsApp(e.target.value))}
              required
            />

            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                style={{
                  width: "100%", padding: "1rem 3.5rem 1rem 1.25rem",
                  border: "none", borderRadius: "14px",
                  backgroundColor: "#F4F6F8", outline: "none",
                  fontSize: "15px", boxSizing: "border-box",
                  color: "#3f3f46"
                }}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{
                  position: "absolute", right: "1.25rem", top: "50%",
                  transform: "translateY(-50%)", color: "#cbd5e1",
                  background: "none", border: "none", cursor: "pointer",
                }}>
                {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {erro && (
              <p style={{ color: "#ef4444", fontSize: "11px", fontWeight: 700, textAlign: "center", margin: "4px 0" }}>{erro}</p>
            )}

            <button
              type="submit"
              style={{
                width: "100%", backgroundColor: "#2D7A5E", color: "white",
                padding: "1rem", borderRadius: "14px", fontWeight: 700,
                fontSize: "16px", border: "none", cursor: "pointer",
                marginTop: "0.4rem", boxShadow: "0 6px 20px rgba(45, 122, 94, 0.25)"
              }}
            >
              Finalizar Cadastro
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#a1a1aa", margin: "1rem 0 0" }}>
            Já tem uma conta?{" "}
            <Link to="/login" style={{ color: "#2D7A5E", fontWeight: 700, textDecoration: "none" }}>
              Faça Login
            </Link>
          </p>

        </div>
      </div>
    </>
  );
};

export default Register;
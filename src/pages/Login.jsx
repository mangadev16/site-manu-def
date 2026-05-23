import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Lock, ArrowRight } from "lucide-react";

const TILE_W = 1878;
const TILE_H = 1080;

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [modoAdmin, setModoAdmin] = useState(false);
  const [senhaAdmin, setSenhaAdmin] = useState("");
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes slideBg {
          from { background-position: 0 0; }
          to   { background-position: -${TILE_W}px 0; }
        }
        .animated-bg { animation: slideBg 52s linear infinite; }
        .login-root * { font-family: 'Nunito', sans-serif; }
        input::placeholder { font-family: 'Nunito', sans-serif; color: #a1a1aa; }
      `}</style>

      <div
        className="animated-bg login-root"
        style={{
          minHeight: "100vh", width: "100vw",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "2rem 1.5rem", overflow: "hidden", position: "relative",
          backgroundColor: "#0D3D35",
          backgroundImage: "url('/backgroundlogin.png')",
          backgroundRepeat: "repeat",
          backgroundSize: `${TILE_W}px ${TILE_H}px`,
        }}
      >
        {/* Overlay original */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "#0D3D35", opacity: 0.72,
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Card Branco principal */}
        <div style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: "420px",
          borderRadius: "45px", 
          backgroundColor: "white",
          boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
          paddingBottom: "2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "4.5rem", /* Espaço para compensar a sobreposição */
        }}>

          {/* Quadrado Verde que sobrepõe o card (Estilo Canva autêntico) */}
<div style={{
  backgroundColor: "#0D3D35",
  width: "72%",
  height: "145px",          /*  Tamanho da caixa completamente travado */
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end", /* Garante que o texto fique sempre fixo no rodapé interno */
  paddingBottom: "1rem",     /* Afastamento do texto em relação à borda inferior */
  borderRadius: "35px", 
  marginTop: "-75px",        /* Puxa a caixa para cima do card branco */
  boxShadow: "0px 12px 25px rgba(0, 0, 0, 0.25)",
  boxSizing: "border-box",
  zIndex: 20,
  position: "relative"       
}}>
  <img
    src="/logotransparente.png"
    alt="Manu"
    style={{
      position: "absolute",  
      top: "43%",            /* 🎯 Move o centro da logo para perto do meio da caixa */
      left: "50%",           /* 🎯 Centraliza horizontalmente */
      transform: "translate(-50%, -50%)", /* 🎯 Truque perfeito para centralização absoluta */
      height: "250px",       /* 📏 Altura limite ideal para não estourar os limites da caixa */
      width: "auto",
      objectFit: "contain",
    }}
  />
  <p style={{
    color: "#CBEF6C",
    fontSize: "10.5px",      /* Tamanho ideal para não quebrar linha */
    fontWeight: 800,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    textAlign: "center",
    margin: 0,
    whiteSpace: "nowrap"
  }}>
    {modoAdmin
      ? "⬡ Modo Administrador"
      : "Nutrição ● Farmácia ● Acupuntura"}
  </p>
</div>

          {/* Subtítulo do Card */}
          <p style={{
            color: "#009669",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "1.5rem",
            marginTop: "1.8rem",
          }}>
            {modoAdmin ? "Acesso Restrito" : "Acesso ao Consultório"}
          </p>

          {/* Formulários e Inputs */}
          <div style={{ padding: "0 2.2rem", width: "100%", boxSizing: "border-box" }}>
            {!modoAdmin ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <input
                  type="email"
                  placeholder="Seu E-mail"
                  style={{
                    width: "100%", padding: "1.05rem 1.25rem",
                    border: "none", borderRadius: "14px",
                    backgroundColor: "#F4F6F8", outline: "none",
                    fontSize: "15px", boxSizing: "border-box",
                    color: "#3f3f46"
                  }}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div style={{ position: "relative" }}>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Senha"
                    style={{
                      width: "100%", padding: "1.05rem 3.5rem 1.05rem 1.25rem",
                      border: "none", borderRadius: "14px",
                      backgroundColor: "#F4F6F8", outline: "none",
                      fontSize: "15px", boxSizing: "border-box",
                      color: "#3f3f46"
                    }}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => !mostrarSenha ? setMostrarSenha(true) : setMostrarSenha(false)}
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
                  type="button"
                  onClick={lidarComLogin}
                  style={{
                    width: "100%", backgroundColor: "#009669", color: "white",
                    padding: "1.05rem", borderRadius: "14px", fontWeight: 700,
                    fontSize: "16px", border: "none", cursor: "pointer",
                    marginTop: "0.6rem", boxShadow: "0 6px 20px rgba(0, 150, 105, 0.25)"
                  }}
                >
                  Entrar
                </button>

                <button type="button" onClick={() => { setModoAdmin(true); setErro(""); }}
                  style={{
                    width: "100%", padding: "1.05rem",
                    border: "2px solid #009669", color: "#009669",
                    borderRadius: "14px", fontWeight: 700, fontSize: "14px",
                    background: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxSizing: "border-box"
                  }}>
                  <ShieldCheck size={18} /> Entrar como Administrador
                </button>

                <p style={{ textAlign: "center", fontSize: "12px", color: "#a1a1aa", margin: "1.2rem 0 0" }}>
                  Ainda não tem conta?{" "}
                  <Link to="/register" style={{ color: "#009669", fontWeight: 700, textDecoration: "none" }}>
                    Cadastre-se aqui
                  </Link>
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ position: "relative" }}>
                  <Lock style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "#a1a1aa" }} size={19} />
                  <input
                    type="password"
                    placeholder="Senha Administrativa"
                    style={{
                      width: "100%", padding: "1.05rem 1.25rem 1.05rem 3.25rem",
                      border: "none", borderRadius: "14px",
                      backgroundColor: "#F4F6F8", outline: "none",
                      fontSize: "15px", boxSizing: "border-box", color: "#3f3f46"
                    }}
                    value={senhaAdmin}
                    onChange={(e) => setSenhaAdmin(e.target.value)}
                    autoFocus required
                  />
                </div>

                {erro && (
                  <p style={{ color: "#ef4444", fontSize: "11px", fontWeight: 700, textAlign: "center", margin: "4px 0" }}>{erro}</p>
                )}

                <button type="button" onClick={lidarComLoginAdmin}
                  style={{
                    width: "100%", backgroundColor: "#1f2937", color: "white",
                    padding: "1.05rem", borderRadius: "14px", fontWeight: 700,
                    fontSize: "16px", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    marginTop: "0.6rem"
                  }}>
                  Acessar Painel <ArrowRight size={19} />
                </button>

                <button type="button" onClick={() => { setModoAdmin(false); setErro(""); setSenhaAdmin(""); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#a1a1aa", fontSize: "11px", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    textAlign: "center", marginTop: "0.8rem",
                  }}>
                  Voltar ao login de cliente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
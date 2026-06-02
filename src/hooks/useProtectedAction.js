import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

/**
 * Hook que protege ações que exigem login.
 *
 * Uso:
 *   const { showModal, setShowModal, modalConfig, executeProtectedAction, confirmLogin } = useProtectedAction();
 *
 *   executeProtectedAction(
 *     () => navigate("/agendamento"),
 *     {
 *       title: "Login necessário",
 *       message: "Para agendar você precisa estar logado."
 *     }
 *   );
 */
export const useProtectedAction = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: undefined, message: undefined });
  const navigate = useNavigate();

  const executeProtectedAction = (callback, config = {}) => {
    if (auth.currentUser) {
      callback();
    } else {
      setModalConfig(config);
      setShowModal(true);
    }
  };

  const confirmLogin = () => {
    setShowModal(false);
    navigate("/login");
  };

  return { showModal, setShowModal, modalConfig, executeProtectedAction, confirmLogin };
};
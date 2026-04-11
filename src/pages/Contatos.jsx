import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MessageCircle, Instagram, Globe, User, Code, Smartphone, Github } from "lucide-react";

const Contatos = () => {
  const navigate = useNavigate();

  const contatos = [
    {
      categoria: "Profissional",
      nome: "Manuela Bernardo",
      funcao: "Nutrição • Acupuntura • Farmácia",
      email: "contato@manuelabernardo.com",
      telefone: "(11) 99999-9999",
      whatsapp: "5511999999999",
      instagram: "@manuelabernardo",
      site: "www.manuelabernardo.com",
      icon: User,
      iconColor: "text-emerald-600",
      bgIcon: "bg-emerald-50"
    },
    {
      categoria: "Design",
      nome: "Fulano Silva",
      funcao: "Designer UX/UI",
      email: "designer@exemplo.com",
      portfolio: "www.behance.net/fulano",
      icon: Smartphone,
      iconColor: "text-purple-600",
      bgIcon: "bg-purple-50"
    },
    {
      categoria: "Desenvolvimento",
      nome: "Ciclano Santos",
      funcao: "Desenvolvedor Full Stack",
      email: "dev@exemplo.com",
      github: "github.com/ciclano",
      icon: Code,
      iconColor: "text-blue-600",
      bgIcon: "bg-blue-50"
    }
  ];

  return (
    <div className="fixed inset-0 h-screen w-full bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4 shadow-sm shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="font-semibold text-gray-800 text-lg">Contatos</h1>
      </header>

      {/* Grid de contatos */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contatos.map((contato, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Cabeçalho do card */}
                <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-gray-50">
                  <div className={`p-2 rounded-xl ${contato.bgIcon}`}>
                    <contato.icon size={20} className={contato.iconColor} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{contato.nome}</h3>
                    <p className="text-xs text-gray-400">{contato.funcao}</p>
                  </div>
                </div>

                {/* Corpo do card */}
                <div className="p-5 space-y-3">
                  {/* Email */}
                  <a
                    href={`mailto:${contato.email}`}
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors group"
                  >
                    <Mail size={16} className="text-gray-400 group-hover:text-emerald-600" />
                    <span className="flex-1 truncate">{contato.email}</span>
                  </a>

                  {/* Telefone/WhatsApp (só para profissional) */}
                  {contato.telefone && (
                    <>
                      <a
                        href={`tel:${contato.telefone}`}
                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors group"
                      >
                        <Phone size={16} className="text-gray-400 group-hover:text-emerald-600" />
                        <span className="flex-1">{contato.telefone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${contato.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors group"
                      >
                        <MessageCircle size={16} className="text-gray-400 group-hover:text-emerald-600" />
                        <span className="flex-1">WhatsApp</span>
                      </a>
                    </>
                  )}

                  {/* Instagram */}
                  {contato.instagram && (
                    <a
                      href="#"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors group"
                    >
                      <Instagram size={16} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="flex-1">{contato.instagram}</span>
                    </a>
                  )}

                  {/* Site/Portfólio/GitHub */}
                  {contato.site && (
                    <a
                      href={`https://${contato.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors group"
                    >
                      <Globe size={16} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="flex-1 truncate">{contato.site}</span>
                    </a>
                  )}
                  {contato.portfolio && (
                    <a
                      href={`https://${contato.portfolio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors group"
                    >
                      <Globe size={16} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="flex-1 truncate">{contato.portfolio}</span>
                    </a>
                  )}
                  {contato.github && (
                    <a
                      href={`https://${contato.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors group"
                    >
                      <Github size={16} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="flex-1 truncate">{contato.github}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contatos;
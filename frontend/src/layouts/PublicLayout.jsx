import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function normalizarWhatsApp(numeroConfigurado) {
  const numero = String(
    numeroConfigurado || ""
  ).replace(/\D/g, "");

  if (numero.length === 9) {
    return `51${numero}`;
  }

  if (
    numero.startsWith("51") &&
    numero.length === 11
  ) {
    return numero;
  }

  return "";
}

function PublicLayout() {
  const numeroWhatsApp =
    normalizarWhatsApp(
      import.meta.env.VITE_WHATSAPP_NUMBER
    );

  const mensaje = encodeURIComponent(
    "Hola, deseo información sobre los servicios de Taurus."
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />

      {numeroWhatsApp && (
        <a
          href={`https://wa.me/${numeroWhatsApp}?text=${mensaje}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Consultar a Taurus por WhatsApp"
          title="Consultar por WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-2xl transition hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
        >
          <MessageCircle size={27} />
        </a>
      )}
    </div>
  );
}

export default PublicLayout;

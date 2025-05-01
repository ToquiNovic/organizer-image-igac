import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import App from "./App.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Registrar el Service Worker solo en producción o preview
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registrado:", registration);
      })
      .catch((error) => {
        console.error("Error al registrar el Service Worker:", error);
      });

    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "UPDATE_AVAILABLE") {
        const toastId = toast("¡Nueva versión disponible!", {
          action: {
            label: "Actualizar ahora",
            onClick: () => window.location.reload(),
          },
          duration: 10000, // Cierra después de 10 segundos
        });

        // Actualizar automáticamente después de 10 segundos
        setTimeout(() => {
          toast.dismiss(toastId);
          window.location.reload();
        }, 10000);
      }
    });
  });
}

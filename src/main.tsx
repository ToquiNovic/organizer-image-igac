import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster, toast } from "sonner";
import App from "./App.tsx";
import "./index.css";
import { Workbox } from "workbox-window";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
    <Toaster richColors position="top-right" />
  </StrictMode>
);

// Registrar el Service Worker solo en producción o preview
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const wb = new Workbox("/sw.js");
  wb.addEventListener("waiting", () => {
    const toastId = toast("¡Nueva versión disponible!", {
      action: {
        label: "Actualizar ahora",
        onClick: () => {
          wb.addEventListener("controlling", () => {
            window.location.reload();
          });
          wb.messageSkipWaiting();
        },
      },
      duration: 10000,
    });

    setTimeout(() => {
      toast.dismiss(toastId);
      wb.addEventListener("controlling", () => {
        window.location.reload();
      });
      wb.messageSkipWaiting();
    }, 10000);
  });
  wb.register();
}

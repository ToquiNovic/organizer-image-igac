import { FC, memo, useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { CardContent } from "../components/ui/card";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";

// Estilos del visor PDF
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface ImageViewerProps {
  imageUrl: string | null;
  isPdf: boolean;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onPrev: () => void;
  onNext: () => void;
  rotation: number;
}

export const ImageViewer: FC<ImageViewerProps> = memo(
  ({
    imageUrl,
    isPdf,
    onRotateLeft,
    onRotateRight,
    onPrev,
    onNext,
    rotation,
  }) => {
    const [pdfError, setPdfError] = useState<string | null>(null);
    const defaultLayout = defaultLayoutPlugin();
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0);

    // Dimensiones fijas para el contenedor
    const FIXED_WIDTH = 800;
    const FIXED_HEIGHT = 600;

    // Normalizar el valor de rotation para que esté entre 0 y 360
    const normalizedRotation = rotation % 360;

    // Ajustar las dimensiones del contenedor según la rotación
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Guardar la posición de desplazamiento actual
      scrollPositionRef.current = window.scrollY;

      // Determinar si la rotación requiere intercambiar las dimensiones
      const isRotated90or270 =
        normalizedRotation === 90 || normalizedRotation === 270;

      // Asignar dimensiones fijas según la rotación
      if (isRotated90or270) {
        container.style.width = `${FIXED_HEIGHT}px`;
        container.style.height = `${FIXED_WIDTH}px`;
      } else {
        container.style.width = `${FIXED_WIDTH}px`;
        container.style.height = `${FIXED_HEIGHT}px`;
      }

      // Forzar repintado sin cambiar la visibilidad
      void container.getBoundingClientRect(); 
    }, [normalizedRotation]);

    // Restaurar la posición de desplazamiento después del re-renderizado
    useEffect(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, [normalizedRotation]);

    // Manejo de errores globales del Worker
    useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        if (
          event.message.includes("pdf.worker") ||
          event.message.includes("Cannot resolve callback")
        ) {
          setPdfError(`Error al cargar el PDF: ${event.message}`);
        }
      };
      window.addEventListener("error", handleError);
      return () => window.removeEventListener("error", handleError);
    }, []);

    // Manejadores de eventos para los botones con preventDefault
    const handlePrev = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onPrev();
    };

    const handleRotateLeft = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onRotateLeft();
    };

    const handleRotateRight = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onRotateRight();
    };

    const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onNext();
    };

    return (
      <div>
        <CardContent className="flex flex-col items-center w-full space-y-4">
          {/* Botones */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={handlePrev}>Anterior</Button>
            {!isPdf && (
              <>
                <Button onClick={handleRotateLeft}>Rotar Izquierda</Button>
                <Button onClick={handleRotateRight}>Rotar Derecha</Button>
              </>
            )}
            <Button onClick={handleNext}>Siguiente</Button>
          </div>

          {/* Contenedor de la imagen */}
          {imageUrl ? (
            isPdf ? (
              <div className="w-full max-w-[800px] h-[600px] border p-2 bg-white">
                {pdfError ? (
                  <p className="text-red-500 italic">{pdfError}</p>
                ) : (
                  <Worker workerUrl={workerSrc}>
                    <Viewer
                      fileUrl={imageUrl}
                      plugins={[defaultLayout]}
                      onDocumentLoad={() => setPdfError(null)}
                    />
                  </Worker>
                )}
              </div>
            ) : (
              <div className="w-full flex justify-center items-center border rounded bg-white p-2">
                <div
                  ref={containerRef}
                  className="inline-block"
                  style={{
                    width: `${FIXED_WIDTH}px`, // Tamaño fijo inicial
                    height: `${FIXED_HEIGHT}px`,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Vista previa"
                    className="w-full h-full object-contain transition-transform duration-300"
                    style={{
                      transform: `rotate(${normalizedRotation}deg)`,
                      transformOrigin: "center center",
                    }}
                  />
                </div>
              </div>
            )
          ) : (
            <p className="italic">No hay imagen seleccionada</p>
          )}
        </CardContent>
      </div>
    );
  }
);

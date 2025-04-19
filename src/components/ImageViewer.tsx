// src/components/ImageViewer.tsx
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
    const [zoom, setZoom] = useState<number>(1);
    const defaultLayout = defaultLayoutPlugin();
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0);

    const FIXED_WIDTH = 800;
    const FIXED_HEIGHT = 600;

    const normalizedRotation = rotation % 360;

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      scrollPositionRef.current = window.scrollY;

      const isRotated90or270 =
        normalizedRotation === 90 || normalizedRotation === 270;

      if (isRotated90or270) {
        container.style.width = `${FIXED_HEIGHT}px`;
        container.style.height = `${FIXED_WIDTH}px`;
      } else {
        container.style.width = `${FIXED_WIDTH}px`;
        container.style.height = `${FIXED_HEIGHT}px`;
      }

      void container.getBoundingClientRect();
    }, [normalizedRotation]);

    useEffect(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, [normalizedRotation]);

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

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.2));
    const handleResetZoom = () => setZoom(1);

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
                <Button onClick={handleZoomOut}>- Zoom</Button>
                <Button onClick={handleResetZoom}>Reset Zoom</Button>
                <Button onClick={handleZoomIn}>+ Zoom</Button>
              </>
            )}
            <Button onClick={handleNext}>Siguiente</Button>
          </div>

          {/* Contenedor de la imagen o PDF */}
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
              <div
                ref={containerRef}
                className="inline-block overflow-hidden"
                style={{
                  width:
                    normalizedRotation === 90 || normalizedRotation === 270
                      ? `${FIXED_HEIGHT}px`
                      : `${FIXED_WIDTH}px`,
                  height:
                    normalizedRotation === 90 || normalizedRotation === 270
                      ? `${FIXED_WIDTH}px`
                      : `${FIXED_HEIGHT}px`,
                }}
              >
                <img
                  src={imageUrl ?? ""}
                  alt={`Vista previa de ${imageUrl?.split("/").pop()}`}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = "/fallback.jpg")
                  }
                  className="transition-transform duration-300"
                  style={{
                    transform: `rotate(${normalizedRotation}deg) scale(${zoom})`,
                    transformOrigin: "center center",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
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

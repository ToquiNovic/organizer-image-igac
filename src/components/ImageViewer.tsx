// src/components/ImageViewer.tsx
import { FC, memo, useState } from "react";
import { Button } from "../components/ui/button";
import { CardContent } from "../components/ui/card";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

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

    return (
      <div>
        <CardContent className="flex flex-col items-center justify-center w-full">
          <div className="flex space-x-4 mb-4">
            <Button onClick={onPrev}>Anterior</Button>
            {!isPdf && (
              <>
                <Button onClick={onRotateLeft}>Rotar Izquierda</Button>
                <Button onClick={onRotateRight}>Rotar Derecha</Button>
              </>
            )}
            <Button onClick={onNext}>Siguiente</Button>
          </div>

          {imageUrl ? (
            isPdf ? (
              <div className="w-full max-w-[800px] h-[600px] border p-2 bg-white">
                {pdfError ? (
                  <p className="text-red-500 italic">{pdfError}</p>
                ) : (
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer
                      fileUrl={imageUrl}
                      plugins={[defaultLayout]}
                      onDocumentLoad={() => setPdfError(null)}
                    />
                  </Worker>
                )}
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Vista previa"
                className="max-w-[600px] max-h-[400px] object-contain border p-2"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            )
          ) : (
            <p className="italic">No hay imagen seleccionada</p>
          )}
        </CardContent>
      </div>
    );
  }
);

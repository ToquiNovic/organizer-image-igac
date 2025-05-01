import { FC, memo, useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { CardContent } from "../components/ui/card";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";
import {
  CircleArrowLeft,
  CircleArrowRight,
  RotateCcw,
  RotateCw,
  ScanEye,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";

// Estilos del visor PDF
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Utils
import {
  normalizeRotation,
  getFileNameFromUrl,
  getFallbackImage,
} from "../utils";

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
    const scrollPositionRef = useRef<number>(0);

    const FIXED_WIDTH = 800;
    const FIXED_HEIGHT = 600;
    const normalizedRotation = normalizeRotation(rotation);

    useEffect(() => {
      scrollPositionRef.current = window.scrollY;
    }, []);

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

    const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onPrev();
    };

    const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onNext();
    };

    const handleRotateLeft = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onRotateLeft();
    };

    const handleRotateRight = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onRotateRight();
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.2));
    const handleResetZoom = () => setZoom(1);

    return (
      <div>
        <CardContent className="flex flex-col items-center w-full space-y-4">
          {/* Controles */}
          <div className="flex flex-wrap justify-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handlePrev} aria-label="Anterior">
                  <CircleArrowLeft />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Anterior</TooltipContent>
            </Tooltip>

            {!isPdf && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRotateLeft}
                      aria-label="Rotar izquierda"
                    >
                      <RotateCcw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rotar Izquierda</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRotateRight}
                      aria-label="Rotar derecha"
                    >
                      <RotateCw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rotar Derecha</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleZoomOut}
                      aria-label="Alejar"
                    >
                      <ZoomOut />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Alejar</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleResetZoom}
                      aria-label="Restablecer zoom"
                    >
                      <ScanEye />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Restablecer Zoom</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleZoomIn}
                      aria-label="Acercar"
                    >
                      <ZoomIn />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Acercar</TooltipContent>
                </Tooltip>
              </>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleNext} aria-label="Siguiente">
                  <CircleArrowRight />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Siguiente</TooltipContent>
            </Tooltip>
          </div>

          {/* Visor */}
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
                  src={imageUrl}
                  alt={`Vista previa de ${getFileNameFromUrl(imageUrl)}`}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = getFallbackImage())
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

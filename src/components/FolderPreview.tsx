// src/components/FolderPreview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { zipSync } from "fflate";
import { saveAs } from "file-saver";
import { SUBCARPETAS } from "../utils/constants";

interface OrganizedFile {
  path: string;
  file: File;
}

interface FolderPreviewProps {
  organizedFiles: OrganizedFile[];
}

export default function FolderPreview({ organizedFiles }: FolderPreviewProps) {
  const handleDownloadZip = async () => {
    if (organizedFiles.length === 0) {
      toast.error("No hay archivos organizados", {
        description: "Organiza al menos un archivo antes de descargar.",
      });
      return;
    }

    const zipData: { [key: string]: Uint8Array } = {};
    const prediosSet = new Set(organizedFiles.map((f) => f.path.split("/")[0]));

    for (const predio of prediosSet) {
      for (const sub of SUBCARPETAS) {
        const folderPath = `${predio}/${sub}/`;
        if (!zipData[folderPath]) {
          zipData[folderPath] = new Uint8Array(0);
        }
      }
    }

    for (const { path, file } of organizedFiles) {
      const fileContent = new Uint8Array(await file.arrayBuffer());
      zipData[path] = fileContent;
    }

    try {
      const zipped = zipSync(zipData, { level: 0 });
      const zipBlob = new Blob([zipped.buffer], { type: "application/zip" });
      saveAs(zipBlob, "archivos_organizados.zip");
      toast.success("ZIP descargado");
    } catch (error) {
      toast.error("Error al generar el ZIP", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  return (
    <Card className="folder-preview">
      <CardHeader>
        <CardTitle>Vista Previa de Carpeta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Button onClick={handleDownloadZip} className="w-fit">
            Descargar Archivos Organizados (ZIP)
          </Button>
          <p className="text-sm">
            Archivos organizados: {organizedFiles.length}
          </p>
          <p className="text-sm mb-2">Lista de Archivos Organizados: </p>
          {organizedFiles.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              No hay imágenes organizadas aún.
            </p>
          ) : (
            <ul className="text-xs space-y-1 max-h-40 overflow-auto">
              {organizedFiles.map((file, index) => (
                <li key={index} className="truncate">
                  📁 {file.path}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

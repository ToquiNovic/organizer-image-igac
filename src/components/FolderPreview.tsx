// src/components/FolderPreview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { zipSync } from "fflate";
import { saveAs } from "file-saver";
import { SUBCARPETAS } from "../utils/constants";
import { FolderOpen, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { useState } from "react";

interface OrganizedFile {
  path: string;
  file: File;
}

interface FolderPreviewProps {
  organizedFiles: OrganizedFile[];
  setOrganizedFiles: React.Dispatch<React.SetStateAction<OrganizedFile[]>>;
}

export default function FolderPreview({
  organizedFiles,
  setOrganizedFiles,
}: FolderPreviewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<OrganizedFile | null>(null);

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

  const handleDeleteFile = (file: OrganizedFile) => {
    setOrganizedFiles((prev) => prev.filter((f) => f !== file));
    toast.success("Archivo eliminado exitosamente");
  };

  return (
    <Card className="folder-preview">
      <CardHeader>
        <CardTitle>Vista Previa de Carpeta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleDownloadZip}
            className="w-fit"
            id="step-download"
          >
            Descargar Archivos Organizados (ZIP)
          </Button>
          <div id="step-lista-archivos">
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
                  <li
                    key={index}
                    className="truncate flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen />
                      <span className="truncate">{file.path}</span>
                    </div>
                    <Button
                      variant="destructive"
                      className="p-1 ml-2"
                      onClick={() => {
                        setFileToDelete(file); // Establecer el archivo a eliminar
                        setShowDeleteDialog(file.path); // Mostrar el diálogo de confirmación
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={!!showDeleteDialog}
        onOpenChange={(open) => !open && setShowDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este archivo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)} // Cerrar el diálogo
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (fileToDelete) {
                  handleDeleteFile(fileToDelete); // Eliminar el archivo
                }
                setShowDeleteDialog(null); // Cerrar el diálogo
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// src/components/FileSelectors.tsx
import { ChangeEvent, FC } from "react";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface FileSelectorsProps {
  onOrigenChange: (files: File[]) => void;
  onExcelChange: (event: ChangeEvent<HTMLInputElement>) => void;
  origenCount: number;
  excelFile: File | null;
}

interface FileWithPath extends File {
  webkitRelativePath: string;
}

export const FileSelectors: FC<FileSelectorsProps> = ({
  onOrigenChange,
  onExcelChange,
  origenCount,
  excelFile,
}) => {
  const handleFolderSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []) as FileWithPath[];

    const validFiles = selectedFiles
      .filter((file) => {
        const fileName = file.name.toLowerCase();
        const isImage = fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/) !== null;
        const isPdf = fileName.endsWith(".pdf");

        if (!isImage && !isPdf) {
          toast.error("Archivo no compatible", {
            description: `El archivo ${file.name} no es una imagen ni un PDF.`,
          });
        }

        return isImage || isPdf;
      })
      .sort((a, b) => a.webkitRelativePath.localeCompare(b.webkitRelativePath));

    if (validFiles.length > 0) {
      onOrigenChange(validFiles);
      toast.success(`${validFiles.length} archivos seleccionados`);
    } else {
      toast.error("No se seleccionaron archivos válidos.");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Selección de carpeta con archivos */}
      <div className="space-y-2" id="step-origen">
        <Label htmlFor="folder-picker">
          Carpeta de Origen (Imágenes y/o PDFs)
        </Label>
        <Input
          id="folder-picker"
          type="file"
          multiple
          // @ts-expect-error: webkitdirectory no está en la definición de tipo estándar
          webkitdirectory="true"
          onChange={handleFolderSelect}
        />
        <p className="text-sm">{origenCount} archivos seleccionados</p>
      </div>

      {/* Excel File */}
      <div className="space-y-2" id="step-excel">
        <Label htmlFor="excel-file">Archivo Excel</Label>
        <Input
          id="excel-file"
          type="file"
          accept=".xlsx"
          onChange={onExcelChange}
        />
        <p className="text-sm">
          {excelFile ? excelFile.name : "Ningún archivo seleccionado"}
        </p>
      </div>
    </div>
  );
};

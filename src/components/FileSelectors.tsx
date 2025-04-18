// src/components/FileSelectors.tsx
import { ChangeEvent, FC } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface FileSelectorsProps {
  onOrigenChange: (files: File[]) => void;
  onExcelChange: (event: ChangeEvent<HTMLInputElement>) => void;
  origenCount: number;
  excelFile: File | null;
}

export const FileSelectors: FC<FileSelectorsProps> = ({
  onOrigenChange,
  onExcelChange,
  origenCount,
  excelFile,
}) => {
  const handleSelectFolder = async () => {
    try {
      const folderHandle: FileSystemDirectoryHandle = await (
        window as typeof window & {
          showDirectoryPicker: () => Promise<
            FileSystemDirectoryHandle & AsyncIterable<FileSystemHandle>
          >;
        }
      ).showDirectoryPicker();

      const files: File[] = [];

      for await (const entry of folderHandle.values()) {
        if (entry.kind === "file") {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          if (
            file.name.toLowerCase().endsWith(".pdf") ||
            file.type.startsWith("image/")
          ) {
            files.push(file);
          }
        }
      }

      onOrigenChange(files);
    } catch (error) {
      console.error("No se seleccionó una carpeta", error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Sección: Carpeta de Origen */}
      <div className="space-y-2">
        <Label htmlFor="folder-select" className="text-white">
          Carpeta de Origen
        </Label>
        <Button
          id="folder-select"
          onClick={handleSelectFolder}
          className="w-full"
        >
          Seleccionar Carpeta
        </Button>
        <p className="text-sm ">{origenCount} archivos seleccionados</p>
      </div>

      {/* Sección: Excel File */}
      <div className="space-y-2">
        <Label htmlFor="excel-file">Archivo Excel</Label>
        <Input
          id="excel-file"
          type="file"
          accept=".xlsx"
          onChange={onExcelChange}
        />
        <p className="text-sm ">
          {excelFile ? excelFile.name : "Ningún archivo seleccionado"}
        </p>
      </div>
    </div>
  );
};

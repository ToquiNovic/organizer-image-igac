import { useState, useCallback } from "react";
import {
  ColumnSelector,
  FileSelectors,
  ImageViewer,
  PredioPanel,
} from "./components";
import {
  readExcelColumns,
  extractColumnValues,
  organizeImage,
  OrganizedFile,
  checkUnidadExists,
} from "./utils";
import { SUBCARPETAS } from "./utils/constants";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import { Button } from "./components/ui/button";
import { Toaster, toast } from "sonner";
import { zipSync } from "fflate";
import { saveAs } from "file-saver";

function App() {
  const [origenFiles, setOrigenFiles] = useState<File[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [predios, setPredios] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [unidad, setUnidad] = useState<string>("A");
  const [rotation, setRotation] = useState<number>(0);
  const [organizedFiles, setOrganizedFiles] = useState<OrganizedFile[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState<string | null>(
    null
  );

  const handleOrigenChange = useCallback((files: File[]) => {
    const validFiles = files.filter((file) => {
      const fileName = file.name.toLowerCase();
      const isImage = fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/) !== null;
      const isPdf = fileName.endsWith(".pdf");
      if (!isImage && !isPdf) {
        toast.error("Archivo no compatible", {
          description: `El archivo ${file.name} no es una imagen ni un PDF.`,
        });
      }
      return isImage || isPdf;
    });

    setOrigenFiles(validFiles);
    toast.success(`${validFiles.length} archivos seleccionados`);
  }, []);

  const handleExcelChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files![0];
        setExcelFile(file);
        const columns = await readExcelColumns(file);
        setExcelColumns(columns);
        toast.success("Archivo Excel cargado", {
          description: `Se ha cargado el archivo: ${file.name}`,
        });
      } catch (error) {
        toast.error("Error al cargar el Excel", {
          description:
            error instanceof Error ? error.message : "Error desconocido",
        });
      }
    },
    []
  );

  const handleColumnSelect = useCallback(
    async (colName: string) => {
      setSelectedColumn(colName);
      if (excelFile) {
        try {
          const values = await extractColumnValues(excelFile, colName);
          setPredios(values);
          toast.info("Columna seleccionada", {
            description: `Se seleccionó la columna: ${colName}`,
          });
        } catch (error) {
          toast.error("Error al extraer valores", {
            description:
              error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }
    },
    [excelFile]
  );

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => prev - 90);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setRotation(0);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) =>
      prev < origenFiles.length - 1 ? prev + 1 : prev
    );
    setRotation(0);
  }, [origenFiles.length]);

  const handleOrganize = useCallback(
    async (predio: string) => {
      const file = origenFiles[selectedImageIndex];
      if (!file || !predio || !category) {
        toast.error("Error al organizar", {
          description: "Falta información (archivo, predio o categoría).",
        });
        return;
      }

      try {
        console.log(
          `Intentando organizar: predio=${predio}, unidad=${unidad}, categoría=${category}`
        );
        const unidadExists = checkUnidadExists(
          predio,
          category,
          unidad,
          organizedFiles
        );
        if (unidadExists) {
          console.log(
            `Unidad ${unidad} ya existe para predio ${predio}, abriendo diálogo`
          );
          setShowDuplicateDialog(predio);
          return;
        }

        const organizedFile = await organizeImage(
          file,
          predio,
          category,
          unidad
        );
        setOrganizedFiles((prev) => {
          const newFiles = [...prev, organizedFile];
          console.log(
            "Archivos organizados actualizados:",
            newFiles.map((f) => f.path)
          );
          return newFiles;
        });
        handleNext();
        setUnidad("A");
        toast.success("Imagen organizada", {
          description: `Organizada para el predio: ${predio}`,
        });
      } catch (error) {
        console.error("Error en handleOrganize:", error);
        toast.error("Error al organizar", {
          description:
            error instanceof Error ? error.message : "Error desconocido",
        });
      }
    },
    [
      origenFiles,
      selectedImageIndex,
      category,
      unidad,
      organizedFiles,
      handleNext,
    ]
  );

  const handleDownloadZip = useCallback(async () => {
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
  }, [organizedFiles]);

  const currentFile = origenFiles[selectedImageIndex];
  const imageUrl = currentFile ? URL.createObjectURL(currentFile) : null;

  return (
    <div className="grid h-screen p-6 gap-6">
      <Toaster richColors position="top-right" />
      <Card className="start-panel">
        <CardHeader>
          <CardTitle>Panel de Inicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FileSelectors
                onOrigenChange={handleOrigenChange}
                onExcelChange={handleExcelChange}
                origenCount={origenFiles.length}
                excelFile={excelFile}
              />
            </div>
            <div className="col-span-1">
              <ColumnSelector
                excelColumns={excelColumns}
                selectedColumn={selectedColumn}
                onSelect={handleColumnSelect}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Separator />
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 image-preview">
          <CardHeader>
            <CardTitle className="text-white">Vista Previa de Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageViewer
              imageUrl={imageUrl}
              isPdf={currentFile?.name.toLowerCase().endsWith(".pdf")}
              onRotateLeft={handleRotateLeft}
              onRotateRight={handleRotateRight}
              onPrev={handlePrev}
              onNext={handleNext}
              rotation={rotation}
            />
          </CardContent>
        </Card>
        <Card className="predio-panel">
          <CardHeader>
            <CardTitle>Panel de Predios</CardTitle>
          </CardHeader>
          <CardContent>
            <PredioPanel
              predios={predios}
              onSave={handleOrganize}
              category={category}
              setCategory={setCategory}
              unidad={unidad}
              setUnidad={setUnidad}
              organizedFiles={organizedFiles}
              showDuplicateDialog={showDuplicateDialog}
              setShowDuplicateDialog={setShowDuplicateDialog}
            />
          </CardContent>
        </Card>
      </div>
      <Separator />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;

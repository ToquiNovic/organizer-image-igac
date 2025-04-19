import * as XLSX from "xlsx";
import { IMG_CATEGORIES } from "./constants";

interface ExcelRow {
  [key: string]: string | number | boolean | undefined;
}

export interface OrganizedFile {
  path: string;
  file: File;
}

async function readExcelFile(file: File): Promise<ExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error("El archivo Excel no contiene hojas válidas.");
        }
        const sheet = workbook.Sheets[firstSheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData);
      } catch (error) {
        reject(
          new Error(
            `Error al leer el archivo Excel: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
      }
    };
    reader.onerror = () =>
      reject(new Error("Error al cargar el archivo Excel."));
    reader.readAsArrayBuffer(file);
  });
}

export async function readExcelColumns(file: File): Promise<string[]> {
  try {
    const jsonData = await readExcelFile(file);
    const columns =
      jsonData.length > 0 ? Object.keys(jsonData[0]).map(String) : [];
    return columns;
  } catch (error) {
    console.error("Error al leer las columnas del Excel:", error);
    throw error;
  }
}

export async function extractColumnValues(
  file: File,
  columnName: string
): Promise<string[]> {
  try {
    const jsonData = await readExcelFile(file);
    const values = [
      ...new Set(
        jsonData
          .map((row) => row[columnName])
          .filter(
            (value): value is string | number | boolean => value !== undefined
          )
          .map(String)
      ),
    ];
    return values;
  } catch (error) {
    console.error("Error al extraer los valores de la columna:", error);
    throw error;
  }
}

function isImageCategory(category: string): boolean {
  return IMG_CATEGORIES.some((entry) => entry.startsWith(category));
}

export async function organizeImage(
  file: File,
  predio: string,
  category: string,
  unidad: string | null
): Promise<OrganizedFile> {
  try {
    const unidadSegment = unidad ?? "sin_unidad";
    const isImg = isImageCategory(category);
    const subcarpetaDestino = isImg ? "03_img" : "02_doc_sop";
    const fileExtension = file.name.split(".").pop() || "";
    const finalFileName = `${predio}_${unidadSegment}_${category}${
      fileExtension ? `.${fileExtension}` : ""
    }`;
    const filePath = `${predio}/${subcarpetaDestino}/${finalFileName}`;
    return {
      path: filePath,
      file: file,
    };
  } catch (error) {
    console.error("Error al organizar la imagen:", error);
    throw new Error(
      `Error al organizar la imagen: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function checkUnidadExists(
  predio: string,
  category: string,
  unidad: string,
  organizedFiles: OrganizedFile[]
): boolean {
  const subcarpeta = isImageCategory(category) ? "03_img" : "02_doc_sop";

  const exists = organizedFiles.some((file) => {
    const [filePredio, fileSubcarpeta, fileName] = file.path.split("/");
    const isMatch =
      filePredio === predio &&
      fileSubcarpeta === subcarpeta &&
      fileName.startsWith(`${predio}_${unidad}_`);
    return isMatch;
  });

  return exists;
}

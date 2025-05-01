// src/utils/imageUtils.ts
/**
 * Gira una imagen en base al ángulo indicado y la devuelve como un nuevo File.
 */
export async function getRotatedImageFile(
  file: File,
  rotation: number
): Promise<File> {
  const imageBitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const angle = normalizeRotation(rotation);

  const is90or270 = angle === 90 || angle === 270;
  canvas.width = is90or270 ? imageBitmap.height : imageBitmap.width;
  canvas.height = is90or270 ? imageBitmap.width : imageBitmap.height;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(imageBitmap, -imageBitmap.width / 2, -imageBitmap.height / 2);
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("No se pudo generar la imagen rotada");
      const rotatedFile = new File([blob], file.name, { type: file.type });
      resolve(rotatedFile);
    }, file.type);
  });
}

/**
 * Verifica si una URL apunta a un archivo PDF.
 */
export function isPdfFile(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

/**
 * Normaliza el ángulo de rotación para que esté entre 0 y 359 grados.
 */
export function normalizeRotation(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}

/**
 * Extrae el nombre del archivo desde una URL.
 */
export function getFileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() || "archivo");
  } catch {
    return "archivo";
  }
}

/**
 * Devuelve la URL de imagen fallback en caso de error.
 */
export function getFallbackImage(): string {
  return "/fallback.jpg";
}

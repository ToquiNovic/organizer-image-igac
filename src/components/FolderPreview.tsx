// src/components/FolderPreview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface FolderPreviewProps {
  organizedImages: string[];
}

export default function FolderPreview({ organizedImages }: FolderPreviewProps) {
  return (
    <Card className="folder-preview">
      <CardHeader>
        <CardTitle>Vista Previa de Carpeta</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">Carpeta de Destino</p>
        {organizedImages.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            No hay imágenes organizadas aún.
          </p>
        ) : (
          <ul className="text-xs space-y-1 max-h-40 overflow-auto">
            {organizedImages.map((name, index) => (
              <li key={index} className="truncate">
                📁 {name}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

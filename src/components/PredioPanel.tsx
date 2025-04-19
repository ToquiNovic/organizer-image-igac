// src/components/PredioPanel.tsx
import {
  useCallback,
  SetStateAction,
  memo,
  Dispatch,
  FC,
  useState,
  useEffect,
} from "react";
import { OPTIONS } from "../utils";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { OrganizedFile } from "../utils/file";
import { toast } from "sonner";
import { checkUnidadExists } from "../utils/file";
import { Search } from "lucide-react";
import { CardFooter } from "../components/ui/card";

interface PredioPanelProps {
  predios: string[];
  onSave: (predio: string) => void;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  unidad: string;
  setUnidad: Dispatch<SetStateAction<string>>;
  organizedFiles: OrganizedFile[];
  showDuplicateDialog: string | null;
  setShowDuplicateDialog: Dispatch<SetStateAction<string | null>>;
}

export const PredioPanel: FC<PredioPanelProps> = memo(
  ({
    predios,
    onSave,
    category,
    setCategory,
    unidad,
    setUnidad,
    organizedFiles,
    showDuplicateDialog,
    setShowDuplicateDialog,
  }) => {
    const [newUnidad, setNewUnidad] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [selectedPredio, setSelectedPredio] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Validación en tiempo real de newUnidad
    useEffect(() => {
      if (!newUnidad) {
        setError(null);
        return;
      }

      if (!/^[A-Z]$/.test(newUnidad)) {
        setError("La unidad debe ser una sola letra mayúscula (A-Z).");
        return;
      }

      if (!showDuplicateDialog) {
        setError("No se ha seleccionado un predio.");
        return;
      }

      const unidadExists = checkUnidadExists(
        showDuplicateDialog,
        category,
        newUnidad,
        organizedFiles
      );

      if (unidadExists) {
        setError(
          `La unidad ${newUnidad} ya existe para este predio. Ingresa otra.`
        );
      } else {
        setError(null);
      }
    }, [newUnidad, showDuplicateDialog, category, organizedFiles]);

    // Filtrar predios según el término de búsqueda
    const filteredPredios = predios.filter((predio) =>
      predio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePredioClick = useCallback(
      (predio: string) => () => {
        setSelectedPredio(predio);
        setSearchTerm(predio);
      },
      []
    );

    const handleOrganize = useCallback(() => {
      if (!selectedPredio) {
        toast.error("Selecciona un predio antes de organizar.");
        return;
      }
      if (!category) {
        toast.error("Selecciona una categoría antes de organizar.");
        return;
      }
      onSave(selectedPredio);
    }, [selectedPredio, category, onSave]);

    const handleConfirmNewUnidad = useCallback(() => {
      if (!newUnidad) {
        setError("Por favor, ingresa una nueva unidad.");
        return;
      }

      if (!/^[A-Z]$/.test(newUnidad)) {
        setError("La unidad debe ser una sola letra mayúscula (A-Z).");
        return;
      }

      if (!showDuplicateDialog) {
        setError("No se ha seleccionado un predio.");
        return;
      }

      const unidadExists = checkUnidadExists(
        showDuplicateDialog,
        category,
        newUnidad,
        organizedFiles
      );

      if (unidadExists) {
        setError(
          `La unidad ${newUnidad} ya existe para este predio. Ingresa otra.`
        );
        return;
      }
      setUnidad(newUnidad);
      setNewUnidad("");
      setError(null);

      // Forzar el cierre del diálogo
      setShowDuplicateDialog(null);
      setTimeout(() => {
        setShowDuplicateDialog(null);
      }, 0);

      try {
        onSave(showDuplicateDialog);
      } catch (error) {
        console.error("Error en onSave:", error);
        toast.error("Error al organizar el archivo");
      }
    }, [
      newUnidad,
      category,
      organizedFiles,
      showDuplicateDialog,
      setUnidad,
      setShowDuplicateDialog,
      onSave,
    ]);

    return (
      <div className="w-64">
        <h3 className="text-lg font-semibold mb-2">Predios</h3>
        <div className="relative mb-2">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar predio..."
            className="pl-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <ScrollArea className="max-h-[300px] overflow-auto">
          <ul role="listbox" aria-label="Lista de predios">
            {filteredPredios.length > 0 ? (
              filteredPredios.map((predio, i) => (
                <li
                  key={i}
                  role="option"
                  aria-selected={predio === selectedPredio}
                >
                  <Button
                    variant={predio === selectedPredio ? "default" : "ghost"}
                    className="w-full text-left p-2 rounded-none whitespace-nowrap overflow-hidden text-ellipsis"
                    onClick={handlePredioClick(predio)}
                  >
                    {predio}
                  </Button>
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No se encontraron predios</li>
            )}
          </ul>
        </ScrollArea>
        <div className="mt-2 space-y-1">
          <Label htmlFor="category-select">Categoría</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              id="category-select"
              className="w-full border-none shadow-none"
            >
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {OPTIONS.map((opt, i) => {
                const [value, label] = opt.split("=");
                return (
                  <SelectItem key={i} value={value}>
                    {label || value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-2 space-y-1">
          <Label>Unidad Construcción</Label>
          <p className="text-sm font-medium">{unidad}</p>
        </div>
        <CardFooter className="mt-4 p-0">
          <Button
            onClick={handleOrganize}
            disabled={!selectedPredio || !category}
            className="w-full"
          >
            Ordenar
          </Button>
        </CardFooter>

        <Dialog
          open={!!showDuplicateDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowDuplicateDialog(null);
              setNewUnidad("");
              setError(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unidad duplicada</DialogTitle>
              <DialogDescription>
                La unidad <strong>{unidad}</strong> ya existe en la subcarpeta
                para el predio <strong>{showDuplicateDialog}</strong>. Ingresa
                una nueva unidad.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="new-unidad">Nueva unidad</Label>
              <Input
                id="new-unidad"
                type="text"
                value={newUnidad}
                onChange={(e) => setNewUnidad(e.target.value.toUpperCase())}
                placeholder="Ej. B"
                className="w-full"
                maxLength={1}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDuplicateDialog(null);
                  setNewUnidad("");
                  setError(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirmNewUnidad}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

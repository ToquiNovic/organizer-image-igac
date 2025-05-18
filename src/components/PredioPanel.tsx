import {
  useCallback,
  SetStateAction,
  memo,
  Dispatch,
  FC,
  useState,
  useEffect,
} from "react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { OrganizedFile } from "../utils/file";
import { toast } from "sonner";
import { checkUnidadExists } from "../utils/file";
import { Search, XCircle } from "lucide-react";
import { OPTIONS } from "../utils";

interface PredioPanelProps {
  predios: string[];
  onSave: (predio: string) => void;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  unidad: string;
  setUnidad: Dispatch<SetStateAction<string>>;
  organizedFiles: OrganizedFile[];
  showDuplicateDialog?: string | null;
  setShowDuplicateDialog?: Dispatch<SetStateAction<string | null>>;
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
  }: PredioPanelProps) => {
    const [error, setError] = useState<string | null>(null);
    const [selectedPredio, setSelectedPredio] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Validar unidad en tiempo real
    useEffect(() => {
      if (!unidad) {
        setError(null);
        return;
      }

      if (!/^[A-Z]$/.test(unidad)) {
        setError("La unidad debe ser una sola letra mayúscula (A-Z).");
        return;
      }

      if (!selectedPredio) {
        setError("No se ha seleccionado un predio.");
        return;
      }

      const unidadExists = checkUnidadExists(
        selectedPredio,
        category,
        unidad,
        organizedFiles
      );

      if (unidadExists) {
        setError(
          `La unidad ${unidad} ya existe para este predio. Ingresa otra.`
        );
      } else {
        setError(null);
      }
    }, [unidad, selectedPredio, category, organizedFiles]);

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
        toast.error("Seleccione un predio");
        return;
      }
      if (!category) {
        toast.error("Seleccione una categoría");
        return;
      }
      if (!unidad || unidad.trim() === "") {
        toast.error("Ingrese una unidad válida");
        return;
      }

      const unidadExists = checkUnidadExists(
        selectedPredio,
        category,
        unidad,
        organizedFiles
      );

      if (unidadExists) {
        setError(`La unidad ${unidad} ya existe para este predio.`);
        toast.error(`La unidad ${unidad} ya existe para este predio.`);
        return;
      }

      // Todo válido, guardar
      onSave(selectedPredio);
      toast.success("Unidad organizada exitosamente");
    }, [selectedPredio, unidad, category, organizedFiles, onSave]);

    return (
      <div className="w-64">
        <h3 className="text-lg font-semibold mb-2">Predios</h3>
        <div className="relative mb-2" id="step-lista-predios">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar predio..."
            className="pl-10 pr-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="max-h-[300px] overflow-auto">
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
        </div>

        <div className="mt-2 space-y-1" id="step-categoria">
          <Label htmlFor="category-select">Categoría</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              id="category-select"
              className="w-full shadow-none"
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

        <div className="mt-4" id="step-unidad">
          <Label>Unidad Construcción</Label>
          <div className="mt-4 space-y-2">
            <Input
              id="unidad"
              type="text"
              value={unidad}
              onChange={(e) => setUnidad(e.target.value.toUpperCase())}
              placeholder="Ej. B"
              className="w-full"
              maxLength={1}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>

        <div className="mt-4 p-0" id="step-organizar">
          <Button
            onClick={handleOrganize}
            disabled={!selectedPredio || !category || !unidad}
            className="w-full"
          >
            Ordenar
          </Button>
        </div>
      </div>
    );
  }
);

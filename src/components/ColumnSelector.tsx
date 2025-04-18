import { FC } from "react";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface ColumnSelectorProps {
  excelColumns: string[];
  selectedColumn: string;
  onSelect: (column: string) => void;
}

export const ColumnSelector: FC<ColumnSelectorProps> = ({
  excelColumns,
  selectedColumn,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="column-select">Seleccionar Columna</Label>
      <Select
        value={selectedColumn}
        onValueChange={onSelect}
        disabled={excelColumns.length === 0}
      >
        <SelectTrigger id="column-select" className="w-full">
          <SelectValue placeholder="Seleccionar columna" />
        </SelectTrigger>
        <SelectContent>
          {excelColumns && excelColumns.length > 0 ? (
            excelColumns.map((col) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-columns" disabled>
              No hay columnas disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TableType } from "@/services/table-type.service";
import { cn } from "@/lib/utils";

interface TableTypeFilterProps {
  tableTypes: TableType[];
  selectedTableType: string | null;
  onSelect: (tableType: string) => void;
}

export function TableTypeFilter({
  tableTypes,
  selectedTableType,
  onSelect,
}: TableTypeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (typeName: string) => {
    onSelect(typeName);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tableType", typeName);
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
        ប្រភេទតុ
      </p>
      <div className="flex flex-wrap gap-2">
        {tableTypes.map((type) => (
          <Button
            key={type.id}
            onClick={() => handleSelect(type.name)}
            variant={selectedTableType === type.name ? "default" : "outline"}
            size="sm"
            className={cn(
              "transition-all duration-200 transform hover:scale-105",
              selectedTableType === type.name && "scale-105 shadow-lg"
            )}
          >
            {type.displayName}
          </Button>
        ))}
      </div>
    </div>
  );
}


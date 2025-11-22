import { Trash2, Edit2, Check, X } from "lucide-react";

import { useCurrency } from "@/hooks/useCurrency";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useState } from "react";

interface ExpenseItemProps {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  onDelete?: () => void;
  onEdit?: (id: string, data: { name: string; amount: number; category: string }) => void;
}

export function ExpenseItem({
  id,
  name,
  amount,
  category,
  date,
  onDelete,
  onEdit,
}: ExpenseItemProps) {
  const { formatCurrency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name, amount: amount.toString(), category });
  
  const categories = [
    "food",
    "transport",
    "bills",
    "shopping",
    "entertainment",
    "healthcare",
    "emergency",
    "other",
  ];

  const handleSave = () => {
    if (onEdit && editData.name && editData.amount) {
      onEdit(id, {
        name: editData.name,
        amount: parseInt(editData.amount, 10),
        category: editData.category,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({ name, amount: amount.toString(), category });
    setIsEditing(false);
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      food: "bg-orange-100 text-orange-700",
      transport: "bg-blue-100 text-blue-700",
      entertainment: "bg-purple-100 text-purple-700",
      shopping: "bg-pink-100 text-pink-700",
      bills: "bg-red-100 text-red-700",
      healthcare: "bg-green-100 text-green-700",
      emergency: "bg-yellow-100 text-yellow-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[cat.toLowerCase()] || colors.other;
  };

  if (isEditing) {
    return (
      <Card className="p-4 bg-muted">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name</label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Expense name"
                className="h-8"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
              <Input
                type="number"
                value={editData.amount}
                onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                placeholder="0"
                className="h-8"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <select
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-input-background text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!editData.name || !editData.amount}
              className="h-8"
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="truncate">{name}</h4>
            <Badge variant="secondary" className={getCategoryColor(category)}>
              {category}
            </Badge>
          </div>
          <p className="text-muted-foreground">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-destructive whitespace-nowrap">
            -{formatCurrency(amount)}
          </p>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:text-primary"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

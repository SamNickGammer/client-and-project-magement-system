"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: "low" | "medium" | "high";
  checklistId: string;
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

interface ActionItemsTabProps {
  leadId: string;
}

export function ActionItemsTab({ leadId }: ActionItemsTabProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");

  useEffect(() => {
    fetchChecklists();
  }, [leadId]);

  const fetchChecklists = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}/checklists`);
      if (!res.ok) throw new Error("Failed to load checklists");
      const data = await res.json();
      setChecklists(data);
    } catch (error) {
      toast.error("Failed to load action items");
    } finally {
      setLoading(false);
    }
  };

  const createChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      const res = await fetch(`/api/leads/${leadId}/checklists`, {
        method: "POST",
        body: JSON.stringify({ title: newChecklistTitle }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const newItem = await res.json();
      setChecklists([...checklists, { ...newItem, items: [] }]);
      setNewChecklistTitle("");
      toast.success("Checklist created");
    } catch (error) {
      toast.error("Error creating checklist");
    }
  };

  const addItemToChecklist = async (checklistId: string) => {
    if (!newItemTitle.trim()) return;
    try {
      const res = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "POST",
        body: JSON.stringify({ title: newItemTitle, priority: "medium" }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      const newItem = await res.json();

      setChecklists(
        checklists.map((list) =>
          list.id === checklistId
            ? { ...list, items: [...list.items, newItem] }
            : list,
        ),
      );
      setNewItemTitle("");
      setAddingItemTo(null);
    } catch (error) {
      toast.error("Error adding item");
    }
  };

  const toggleItem = async (item: ChecklistItem) => {
    // Optimistic update
    const originalChecklists = [...checklists];
    const newStatus = !item.isCompleted;

    setChecklists((prev) =>
      prev.map((list) => {
        if (list.id !== item.checklistId) return list;
        return {
          ...list,
          items: list.items.map((i) =>
            i.id === item.id ? { ...i, isCompleted: newStatus } : i,
          ),
        };
      }),
    );

    try {
      await fetch(`/api/checklist-items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ isCompleted: newStatus }),
      });
    } catch (error) {
      setChecklists(originalChecklists);
      toast.error("Failed to update item");
    }
  };

  const updatePriority = async (item: ChecklistItem, priority: string) => {
    // Optimistic update
    setChecklists((prev) =>
      prev.map((list) => {
        if (list.id !== item.checklistId) return list;
        return {
          ...list,
          items: list.items.map((i) =>
            i.id === item.id ? { ...i, priority: priority as any } : i,
          ),
        };
      }),
    );

    await fetch(`/api/checklist-items/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ priority }),
    });
  };

  const deleteItem = async (item: ChecklistItem) => {
    setChecklists((prev) =>
      prev.map((list) => {
        if (list.id !== item.checklistId) return list;
        return {
          ...list,
          items: list.items.filter((i) => i.id !== item.id),
        };
      }),
    );

    await fetch(`/api/checklist-items/${item.id}`, { method: "DELETE" });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New Checklist Name..."
          value={newChecklistTitle}
          onChange={(e) => setNewChecklistTitle(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={createChecklist} disabled={!newChecklistTitle.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add Checklist
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={checklists.map((c) => c.id)}
        className="space-y-4"
      >
        {checklists.map((list) => {
          const completedItems = list.items.filter((i) => i.isCompleted);
          const activeItems = list.items.filter((i) => !i.isCompleted);
          // Sort active items by priority: high > medium > low
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          activeItems.sort(
            (a, b) =>
              (priorityOrder[a.priority] ?? 1) -
              (priorityOrder[b.priority] ?? 1),
          );

          const sortedItems = [...activeItems, ...completedItems];

          return (
            <AccordionItem
              key={list.id}
              value={list.id}
              className="border rounded-lg bg-card px-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex justify-between w-full items-center mr-4">
                  <span className="font-semibold">{list.title}</span>
                  <span className="text-xs text-muted-foreground mr-2">
                    {completedItems.length}/{list.items.length} done
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-2">
                <div className="space-y-1">
                  {sortedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`group flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors ${
                        item.isCompleted ? "opacity-60" : ""
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item)}
                        className={`mt-0.5 ${item.isCompleted ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                      >
                        {item.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <span
                        className={`flex-1 text-sm ${
                          item.isCompleted
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.title}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge
                            variant="outline"
                            className={`cursor-pointer text-[10px] h-5 px-1.5 uppercase ${
                              item.priority === "high"
                                ? "text-red-500 border-red-200 bg-red-50"
                                : item.priority === "medium"
                                  ? "text-yellow-600 border-yellow-200 bg-yellow-50"
                                  : "text-slate-500"
                            }`}
                          >
                            {item.priority}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => updatePriority(item, "high")}
                          >
                            High
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updatePriority(item, "medium")}
                          >
                            Medium
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updatePriority(item, "low")}
                          >
                            Low
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => deleteItem(item)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {addingItemTo === list.id ? (
                  <div className="flex gap-2 mt-2 pl-8">
                    <Input
                      autoFocus
                      placeholder="Task name here..."
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && addItemToChecklist(list.id)
                      }
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => addItemToChecklist(list.id)}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => setAddingItemTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-muted-foreground hover:text-primary pl-2"
                    onClick={() => setAddingItemTo(list.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Task
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      {checklists.length === 0 && !loading && (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
          No checklists yet. Create one to get started.
        </div>
      )}
    </div>
  );
}

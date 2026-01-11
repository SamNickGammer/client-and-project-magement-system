"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Project } from "@/utils/dto/project";
import { Task } from "@/utils/dto/task";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskStatus } from "@/generated/prisma";

// --- Components ---

interface KanbanBoardProps {
  project: Project;
  onUpdate: () => void;
}

export function KanbanBoard({ project, onUpdate }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = useMemo(() => {
    return {
      [TaskStatus.TODO]: tasks.filter((t) => t.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: tasks.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS,
      ),
      [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE),
    };
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Handle drag over for cleaner visual feedback or placeholder
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the container (column status) of the dropped item
    // If over a container directly
    let overContainer = overId as TaskStatus;
    if (!Object.values(TaskStatus).includes(overContainer)) {
      // Must be over another task, find that task's status
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) overContainer = overTask.status;
      else return; // Should not happen
    }

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    if (activeTask.status !== overContainer) {
      // Moving to a different column
      // Optimistic update
      const updatedTasks = tasks.map((t) =>
        t.id === activeId ? { ...t, status: overContainer } : t,
      );
      setTasks(updatedTasks);

      // API Update
      try {
        await fetch(`/api/tasks/${activeId}`, {
          method: "PUT",
          body: JSON.stringify({ status: overContainer }),
        });
        onUpdate();
      } catch (e) {
        console.error("Failed to update status", e);
        // Revert on error?
      }
    } else {
      // Reordering in same column (if we implement order field logic later)
      // For now, just allow visual drop but order isn't persisted strictly without order index logic
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        <KanbanColumn
          id={TaskStatus.TODO}
          title="To Do"
          tasks={columns[TaskStatus.TODO]}
        />
        <KanbanColumn
          id={TaskStatus.IN_PROGRESS}
          title="In Progress"
          tasks={columns[TaskStatus.IN_PROGRESS]}
        />
        <KanbanColumn
          id={TaskStatus.DONE}
          title="Done"
          tasks={columns[TaskStatus.DONE]}
        />
      </div>
      <DragOverlay>
        {activeId ? (
          <TaskCard task={tasks.find((t) => t.id === activeId)!} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  id,
  title,
  tasks,
}: {
  id: string;
  title: string;
  tasks: Task[];
}) {
  return (
    <div className="flex h-full w-[350px] min-w-[350px] flex-col rounded-xl bg-muted/50 border">
      <div className="p-4 pb-2">
        <h3 className="font-semibold flex items-center justify-between">
          {title}
          <Badge variant="secondary">{tasks.length}</Badge>
        </h3>
      </div>
      <ScrollArea className="flex-1 px-4 pb-4">
        <SortableContext
          id={id}
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Drop here
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="cursor-grab hover:shadow-sm active:cursor-grabbing">
      <CardContent className="p-4 space-y-2">
        <div className="font-medium text-sm leading-tight">{task.title}</div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex justify-between items-center pt-1">
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
            {task.priority || "Normal"}
          </Badge>
          {task.dueDate && (
            <span className="text-[10px] text-muted-foreground">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

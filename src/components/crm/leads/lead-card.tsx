import { Lead } from "./lead-columns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pencil,
  Trash2,
  ArrowRightCircle,
  DollarSign,
  User,
} from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onConvert: (lead: Lead) => void;
}

export function LeadCard({ lead, onEdit, onDelete, onConvert }: LeadCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 space-y-0">
        <div className="flex flex-col overflow-hidden gap-1">
          <Badge
            variant={lead.status === "CONVERTED" ? "secondary" : "default"}
            className="w-fit"
          >
            {lead.status}
          </Badge>
          <h3 className="font-semibold truncate text-lg mt-1">{lead.title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 grid gap-2">
        {lead.value !== null && lead.value !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="truncate">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(lead.value)}
            </span>
          </div>
        )}
        {lead.assignedTo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="truncate">{lead.assignedTo.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Contacts:</span>
          <div className="flex -space-x-2">
            {lead.contacts.slice(0, 3).map((c) => (
              <Avatar
                key={c.contact.id}
                className="h-6 w-6 border-2 border-background"
              >
                <AvatarImage src={c.contact.image || ""} />
                <AvatarFallback className="text-[10px]">
                  {c.contact.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onConvert(lead)}
          disabled={lead.status === "CONVERTED"}
          title="Convert to Client"
        >
          <ArrowRightCircle className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(lead)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(lead.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

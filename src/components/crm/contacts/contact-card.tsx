import { Contact } from "@/components/crm/contacts/contact-columns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Mail, Phone, Pencil, Trash2, Building, Briefcase } from "lucide-react";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={contact.image || ""} alt={contact.name} />
          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-semibold truncate">{contact.name}</h3>
          {contact.position && (
            <span className="text-sm text-muted-foreground truncate flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> {contact.position}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 grid gap-2">
        {contact.company && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="w-4 h-4" />
            <span className="truncate">{contact.company}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <a
              href={`mailto:${contact.email}`}
              className="truncate hover:underline text-primary"
            >
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <a
              href={`tel:${contact.phone}`}
              className="truncate hover:underline text-primary"
            >
              {contact.phone}
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(contact)}>
          <Pencil className="w-4 h-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(contact.id)}
        >
          <Trash2 className="w-4 h-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileIcon, Search, Upload, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadAttachment } from "@/utils/dto/lead";

export function LeadAttachmentsTab({ leadId }: { leadId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  // Mock data
  const [attachments] = useState<LeadAttachment[]>([
    {
      id: "1",
      name: "proposal_v1.pdf",
      type: "PDF",
      size: 2400,
      uploadedBy: "Om",
      createdAt: "2024-02-10",
      leadId: leadId,
      url: "https://example.com/proposal_v1.pdf",
    },
    {
      id: "2",
      name: "requirements.docx",
      type: "DOCX",
      size: 1100,
      uploadedBy: "Client",
      createdAt: "2024-02-09",
      leadId: leadId,
      url: "https://example.com/requirements.docx",
    },
  ]);

  const filteredAttachments = attachments.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload File
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttachments.map((file, index) => (
              <TableRow key={file.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-primary" />
                  {file.name}
                </TableCell>
                <TableCell>{file.type}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.uploadedBy}</TableCell>
                <TableCell>{file.createdAt}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

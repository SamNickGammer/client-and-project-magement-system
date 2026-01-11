"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Upload,
  MoreVertical,
  Download,
  Eye,
  FileIcon,
  Loader2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadAttachment } from "@/utils/dto/lead";
import { ICONS_FOR_FILETYPE } from "@/utils/backend/icons";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

interface LeadAttachmentsTabProps {
  leadId: string;
  attachments?: LeadAttachment[];
  onRefresh?: () => Promise<void> | void;
}

export function LeadAttachmentsTab({
  leadId,
  attachments = [],
  onRefresh,
}: LeadAttachmentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<LeadAttachment | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(fileName, file);

      if (uploadError) throw new Error(uploadError.message);

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(fileName);

      // 3. Save Metadata to DB
      const res = await fetch(`/api/leads/${leadId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
        }),
      });

      if (!res.ok) throw new Error("Failed to save attachment metadata");

      toast.success("File uploaded successfully");
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (type: string) => {
    const iconUrl =
      ICONS_FOR_FILETYPE[type as keyof typeof ICONS_FOR_FILETYPE] ||
      ICONS_FOR_FILETYPE.DEFAULT;
    return iconUrl;
  };

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
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>

      {attachments.length === 0 && !isUploading ? (
        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
          No attachments yet. Upload one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Uploading Skeleton Card */}
          {isUploading && (
            <div className="h-40 border rounded-lg flex flex-col items-center justify-center bg-muted/20 animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Uploading...
              </span>
            </div>
          )}

          {filteredAttachments.map((file) => (
            <div
              key={file.id}
              className="group relative border rounded-lg p-3 hover:shadow-md transition-all bg-card flex flex-col justify-between h-40"
            >
              {/* Top Actions (Header) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={file.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Icon / Content */}
              <div
                className="flex-1 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                <div className="relative w-16 h-16 mb-2 transition-transform group-hover:scale-110">
                  {/* Using img tag for external icons as configuring domains might be needed for Next Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFileIcon(file.type)}
                    alt={file.type}
                    className="object-contain w-full h-full drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-2 text-center w-full">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity h-4">
                  <span className="uppercase">{file.type}</span>
                  <span>•</span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      >
        <DialogContent
          className="max-w-[75vw] sm:max-w-[75vw] w-[75vw] h-[75vh] flex flex-col p-6"
          showCloseButton={false}
        >
          {previewFile && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg truncate flex-1 mr-4">
                  {previewFile.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm">
                    <a
                      href={previewFile.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>
              <div className="flex-1 bg-muted/20 rounded-lg overflow-auto flex items-center justify-center p-4 border">
                {["JPG", "JPEG", "PNG", "GIF", "WEBP", "SVG"].includes(
                  previewFile.type.toUpperCase(),
                ) ? (
                  <div className="relative w-full h-full min-h-[400px]">
                    <Image
                      src={previewFile.url}
                      alt={previewFile.name}
                      fill
                      className="object-contain"
                      unoptimized // Since remote url
                    />
                  </div>
                ) : previewFile.type.toUpperCase() === "PDF" ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-full min-h-[600px]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <FileIcon className="h-16 w-16" />
                    <p>Preview not available for this file type.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TipTapEditor } from "@/components/common/tiptap-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smile, Reply, MessageSquare, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ChatComment, ChatMutationPayload } from "@/utils/dto/lead";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface CommentItemProps {
  comment: ChatComment;
  nestLevel?: number;
  replyingTo: string | null;
  onSetReplyingTo: (id: string | null) => void;
  replyContent: string;
  onSetReplyContent: (content: string) => void;
  onReply: (parentId: string) => void;
  onReaction: (parentId: string, emoji: string) => void;
  loading: boolean;
}

const CommentItem = ({
  comment,
  nestLevel = 0,
  replyingTo,
  onSetReplyingTo,
  replyContent,
  onSetReplyContent,
  onReply,
  onReaction,
  loading,
}: CommentItemProps) => {
  const isReplying = replyingTo === comment.id;

  // System Message (Divider)
  if (comment.author.id === "system") {
    return (
      <div className="relative flex py-5 items-center">
        <div className="grow border-t border-muted-foreground/30"></div>
        <span className="shrink-0 mx-4 text-xs font-semibold uppercase text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-muted-foreground/20">
          {comment.content}
        </span>
        <div className="grow border-t border-muted-foreground/30"></div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mt-4 ${nestLevel > 0 ? "ml-8" : ""}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={comment.author.image || undefined} />
        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div
          className="text-sm prose prose-sm max-w-none dark:prose-invert wrap-break-words bg-muted/30 p-3 rounded-md"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />

        {/* Reactions Display */}
        {comment.reactions && comment.reactions.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {comment.reactions.map((r, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs px-1.5 py-0.5 h-auto cursor-pointer"
                onClick={() => onReaction(comment.id, r.emoji)}
              >
                {r.emoji} {r.count}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              if (replyingTo === comment.id) {
                onSetReplyingTo(null);
              } else {
                onSetReplyingTo(comment.id);
                onSetReplyContent("");
              }
            }}
          >
            <Reply className="mr-1 h-3 w-3" /> {isReplying ? "Cancel" : "Reply"}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Smile className="mr-1 h-3 w-3" /> React
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" align="start">
              <div className="flex gap-1">
                {["👍", "❤️", "😂", "😮", "😢", "🎉"].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onReaction(comment.id, emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-2 space-y-2 border-l-2 pl-4 border-primary/20">
            <TipTapEditor content={replyContent} onChange={onSetReplyContent} />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                onClick={() => onReply(comment.id)}
                disabled={loading || !replyContent.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies?.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            nestLevel={nestLevel + 1}
            replyingTo={replyingTo}
            onSetReplyingTo={onSetReplyingTo}
            replyContent={replyContent}
            onSetReplyContent={onSetReplyContent}
            onReply={onReply}
            onReaction={onReaction}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

interface LeadChatTabProps {
  initialComments: ChatComment[];
  // If leadId is provided, it uses /api/leads/[leadId]/chat
  // If apiEndpoint is provided, it uses that instead
  leadId?: string;
  apiEndpoint?: string;
}

export function LeadChatTab({
  initialComments,
  leadId,
  apiEndpoint,
}: LeadChatTabProps) {
  const [comments, setComments] = useState<ChatComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever comments change
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  // Determine the API URL
  const apiUrl = apiEndpoint || (leadId ? `/api/leads/${leadId}/chat` : "");

  // Common wrapper to call the chat API
  const mutateChat = async (payload: ChatMutationPayload) => {
    if (!apiUrl) {
      toast.error("Chat API not configured");
      return false;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update chat");
      const updatedHistory = await res.json();
      setComments(updatedHistory);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    // Basic validation for Tiptap's empty HTML structure
    if (!newComment.trim() || newComment === "<p></p>") return;

    // Optimistic UI update could happen here, but for now wait for server
    const success = await mutateChat({
      type: "comment",
      content: newComment,
    });
    if (success) setNewComment("");
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || replyContent === "<p></p>") return;
    const success = await mutateChat({
      type: "reply",
      parentId,
      content: replyContent,
    });
    if (success) {
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const handleReaction = async (parentId: string, emoji: string) => {
    await mutateChat({
      type: "reaction",
      parentId,
      emoji,
    });
  };

  return (
    <div className="flex flex-col h-[600px] gap-4">
      <Card className="flex-1 flex flex-col min-h-0 shadow-sm border-0 bg-transparent md:border md:bg-card">
        <ScrollArea className="flex-1 p-0 md:p-4">
          <div className="flex flex-col justify-end min-h-full">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                <p>No comments yet. Start the conversation!</p>
              </div>
            ) : (
              // Assuming comments are Oldest -> Newest. If API returns Newest -> First, we might need column-reverse
              // or just .reverse() here. Standard is usually to append new at bottom.
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replyingTo={replyingTo}
                  onSetReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  onSetReplyContent={setReplyContent}
                  onReply={handleReply}
                  onReaction={handleReaction}
                  loading={loading}
                />
              ))
            )}
            <div ref={scrollBottomRef} />
          </div>
        </ScrollArea>
      </Card>

      <div className="space-y-2">
        <h4 className="text-sm font-medium ml-1">New Message</h4>
        <div className="border rounded-md shadow-sm bg-background">
          <TipTapEditor content={newComment} onChange={setNewComment} />
          <div className="p-2 flex justify-between items-center bg-muted/20 border-t">
            <div className="text-xs text-muted-foreground hidden md:block">
              Press click inside to type, supports markdown
            </div>
            <Button
              onClick={handlePostComment}
              disabled={loading || !newComment.trim()}
              size="sm"
              className="gap-2"
            >
              Post Message <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TipTapEditor } from "@/components/common/tiptap-editor";
import { Reply, Smile, Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ChatComment } from "@/utils/dto/lead";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface LeadChatSidebarProps {
  initialComments: ChatComment[];
  leadId: string;
}

type ChatMutationPayload =
  | { type: "comment"; content: string }
  | { type: "reply"; parentId: string; content: string }
  | { type: "reaction"; parentId: string; emoji: string };

export function LeadChatSidebar({
  initialComments,
  leadId,
}: LeadChatSidebarProps) {
  const [comments, setComments] = useState<ChatComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  // Auto-scroll logic removed as per user request to keep view stable at top/current position
  /*
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);
  */

  const mutateChat = async (payload: ChatMutationPayload) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/chat`, {
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

  const handlePost = async () => {
    if (!newComment.trim()) return;

    // Check if replying
    let success = false;
    if (replyingTo) {
      success = await mutateChat({
        type: "reply",
        parentId: replyingTo.id,
        content: newComment,
      });
    } else {
      success = await mutateChat({
        type: "comment",
        content: newComment,
      });
    }

    if (success) {
      setNewComment("");
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

  const CommentItem = ({
    comment,
    nestLevel = 0,
  }: {
    comment: ChatComment;
    nestLevel?: number;
  }) => {
    return (
      <div
        className={`flex gap-3 mt-4 ${nestLevel > 0 ? "ml-8 border-l-2 pl-3 border-muted" : ""}`}
      >
        <Avatar className="h-8 w-8 mt-1 shrink-0">
          <AvatarImage src={comment.author.image || undefined} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{comment.author.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div
            className="text-sm prose prose-sm max-w-none dark:prose-invert wrap-break-words mt-1"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />

          {/* Reactions */}
          <div className="flex items-center gap-2 mt-2">
            {comment.reactions && comment.reactions.length > 0 && (
              <div className="flex gap-1">
                {comment.reactions.map((r, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-5 cursor-pointer hover:bg-muted-foreground/20"
                    onClick={() => handleReaction(comment.id, r.emoji)}
                  >
                    {r.emoji} {r.count}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={() => {
                  setReplyingTo({
                    id: comment.id,
                    authorName: comment.author.name,
                  });
                  // Optionally focus input here
                }}
              >
                <Reply className="h-3 w-3" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                  >
                    <Smile className="h-3 w-3" />
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
                        onClick={() => handleReaction(comment.id, emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Replies */}
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              nestLevel={nestLevel + 1}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-muted/10 border-r">
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full p-4">
          <div className="pb-4 space-y-2">
            {comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 text-sm">
                No activity yet.
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="group">
                  <CommentItem comment={c} />
                </div>
              ))
            )}
            {/* <div ref={scrollRef} /> Auto-scroll target removed */}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Input Area */}
      <div className="p-4 border-t bg-background z-10">
        {replyingTo && (
          <div className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded-t-lg border-x border-t text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Reply className="h-3 w-3" /> Replying to{" "}
              <span className="font-semibold text-foreground">
                {replyingTo.authorName}
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div
          className={`border rounded-lg shadow-sm bg-background overflow-hidden ${replyingTo ? "rounded-t-none border-t-0" : ""}`}
        >
          <div className="max-h-[150px] overflow-y-auto">
            {/* Customize Tiptap to be cleaner for small input */}
            <TipTapEditor content={newComment} onChange={setNewComment} />
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/10 border-t">
            <div className="text-[10px] text-muted-foreground">
              Enter to send (Shift+Enter for new line) - Logic to be added
            </div>
            <Button
              size="sm"
              onClick={handlePost}
              disabled={!newComment.trim() || loading}
              className="gap-2 h-7 px-3"
            >
              Send <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

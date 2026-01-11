import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { ChatComment } from "@/utils/dto/lead";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-env";

// Helper to recursively finding and updating a comment
function updateCommentTree(
  comments: ChatComment[],
  targetId: string,
  updateFn: (comment: ChatComment) => ChatComment,
  appendReply?: ChatComment,
): ChatComment[] {
  return comments.map((comment) => {
    if (comment.id === targetId) {
      const updated = updateFn(comment);
      if (appendReply) {
        updated.replies = [...(updated.replies || []), appendReply];
      }
      return updated;
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentTree(
          comment.replies,
          targetId,
          updateFn,
          appendReply,
        ),
      };
    }
    return comment;
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;

    // 1. Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId as string;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Session invalid. Please log out and log in again." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { type, content, parentId, emoji } = body;

    // Fetch current lead to get chat history
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { chatHistory: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    let currentHistory = (lead.chatHistory as unknown as ChatComment[]) || [];
    const newTimestamp = new Date().toISOString();

    const newComment: ChatComment = {
      id: Date.now().toString(),
      content: content || "",
      author: {
        id: currentUser.id,
        name: currentUser.name || "Unknown User",
        image: currentUser.image,
      },
      createdAt: newTimestamp,
      reactions: [],
      replies: [],
    };

    if (type === "comment") {
      // Add top-level comment
      currentHistory = [newComment, ...currentHistory];
    } else if (type === "reply" && parentId) {
      // Add reply to specific comment
      currentHistory = updateCommentTree(
        currentHistory,
        parentId,
        (c) => c, // No change to parent itself
        newComment, // Append this reply
      );
    } else if (type === "reaction" && parentId && emoji) {
      // Add/Update reaction
      currentHistory = updateCommentTree(currentHistory, parentId, (c) => {
        let reactions = c.reactions || [];

        // 1. Check if user currently has this emoji (for toggle logic)
        const userHashEmoji = reactions.find(
          (r) => r.emoji === emoji && r.userIds?.includes(userId),
        );

        // 2. Remove user from ALL reactions (enforce one per user)
        reactions = reactions.map((r) => ({
          ...r,
          userIds: r.userIds?.filter((id) => id !== userId) || [],
        }));

        // 3. If it wasn't a toggle-off (i.e., user didn't already have THIS emoji), add the new one
        if (!userHashEmoji) {
          const existingReactionIndex = reactions.findIndex(
            (r) => r.emoji === emoji,
          );
          if (existingReactionIndex !== -1) {
            reactions[existingReactionIndex].userIds.push(userId);
          } else {
            reactions.push({
              emoji,
              count: 1,
              userIds: [userId],
            });
          }
        }

        // 4. Recalculate counts and filter empty
        reactions = reactions
          .map((r) => ({ ...r, count: r.userIds.length }))
          .filter((r) => r.count > 0);

        return {
          ...c,
          reactions,
        };
      });
    }

    // Save updated history
    await prisma.lead.update({
      where: { id: leadId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { chatHistory: currentHistory as any },
    });

    return NextResponse.json(currentHistory);
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 },
    );
  }
}

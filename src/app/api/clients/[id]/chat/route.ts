import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { ChatComment } from "@/utils/dto/lead";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-env";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: clientId } = await params;
    const body = await req.json();
    const { type, content, parentId, emoji } = body;

    // 1. Get Current User from JWT
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Session invalid. Please log out and log in again." },
        { status: 401 },
      );
    }

    const author = {
      id: user.id,
      name: user.name || "Unknown User",
      image: user.image,
    };

    // 2. Fetch Client (Lead with status CLIENT) to get current chat history
    const client = await prisma.lead.findUnique({
      where: { id: clientId },
      select: { chatHistory: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chatHistory = (client.chatHistory as any[]) || [];

    // 3. Handle Mutation
    const newTimestamp = new Date().toISOString();

    if (type === "comment") {
      const newComment: ChatComment = {
        id: Date.now().toString(),
        content: content || "",
        author: author,
        createdAt: newTimestamp,
        reactions: [],
        replies: [],
      };
      // Append new comment
      chatHistory = [...chatHistory, newComment];
    } else if (type === "reply" && parentId) {
      // Find parent and add reply
      const addReply = (comments: ChatComment[]): boolean => {
        for (const comment of comments) {
          if (comment.id === parentId) {
            if (!comment.replies) comment.replies = [];
            comment.replies.push({
              id: Date.now().toString(),
              content: content || "",
              author: author,
              createdAt: newTimestamp,
              reactions: [],
              replies: [],
            });
            return true;
          }
          if (comment.replies && comment.replies.length > 0) {
            if (addReply(comment.replies)) return true;
          }
        }
        return false;
      };
      addReply(chatHistory);
    } else if (type === "reaction" && parentId && emoji) {
      // Better Reaction Logic (Copied from lead route)
      const updateReactions = (comments: ChatComment[]): boolean => {
        for (const comment of comments) {
          if (comment.id === parentId) {
            if (!comment.reactions) comment.reactions = [];

            // 1. Check if user already has THIS emoji
            const existingReaction = comment.reactions.find(
              (r) => r.emoji === emoji,
            );
            const userHasThisReaction = existingReaction?.userIds.includes(
              author.id,
            );

            // 2. Remove user from ALL reactions (enforce 1 per user)
            comment.reactions.forEach((r) => {
              r.userIds = r.userIds.filter((uid) => uid !== author.id);
              r.count = r.userIds.length;
            });

            // 3. If they didn't have it before, add it now. (Toggle: if they did, we just removed it, so do nothing)
            if (!userHasThisReaction) {
              const targetReaction = comment.reactions.find(
                (r) => r.emoji === emoji,
              );
              if (targetReaction) {
                targetReaction.userIds.push(author.id);
                targetReaction.count = targetReaction.userIds.length;
              } else {
                comment.reactions.push({
                  emoji,
                  count: 1,
                  userIds: [author.id],
                });
              }
            }

            // 4. Cleanup empty reactions
            comment.reactions = comment.reactions.filter((r) => r.count > 0);
            return true;
          }
          if (comment.replies && updateReactions(comment.replies)) return true;
        }
        return false;
      };

      updateReactions(chatHistory);
    }

    // 4. Update Client (Lead)
    await prisma.lead.update({
      where: { id: clientId },
      data: { chatHistory: chatHistory as any },
    });

    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error("Error updating client chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 },
    );
  }
}

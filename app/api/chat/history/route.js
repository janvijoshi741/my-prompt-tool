import { NextResponse } from "next/server";
import { chatService } from "@/lib/firebase/firestore";
import { auth } from "@/app/lib/firebase";
import { getIdToken } from "firebase/auth";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    //*****  Verify the firebase token in here, currently userId is applied *********
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's chat history
    const chats = await chatService.getUserChats(userId);

    return NextResponse.json({
      success: true,
      chats: chats,
      count: chats.length,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/history - Delete all chats for a user
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all user chats first
    const chats = await chatService.getUserChats(userId);

    // Delete all chats
    const deletePromises = chats.map((chat) => chatService.deleteChat(chat.id));

    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: `Deleted ${chats.length} chats`,
      deletedCount: chats.length,
    });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    return NextResponse.json(
      { error: "Failed to delete chat history" },
      { status: 500 }
    );
  }
}

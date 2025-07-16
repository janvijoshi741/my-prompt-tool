import { NextResponse } from "next/server";
import { chatService } from "@/lib/firebase/firestore";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const { userId, title } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const chatId = await chatService.createChat(userId, title || "New Chat");

    console.log("UserID", userId);
    console.log("Title", title);
    console.log("ChatId", chatId);

    return NextResponse.json({
      success: true,
      chatId,
      message: "Chat created successfully",
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}

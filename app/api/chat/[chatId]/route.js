import { NextResponse } from "next/server";
import { chatService } from "@/lib/firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBdngdiJSPl1z64-kTu6C8zwX3gkSUTHno");

//  Get messages for a specific chat
export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const { chatId } = params;
    console.log("ChatId", chatId);

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Get messages for the chat
    const messages = await chatService.getChatMessages(chatId);

    return NextResponse.json({
      success: true,
      messages,
      chatId,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

//  Send a message to a specific chat
export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const { chatId } = params;
    const { message, userId } = await request.json();

    if (!chatId || !message || !userId) {
      return NextResponse.json(
        { error: "Chat ID, message, and user ID are required" },
        { status: 400 }
      );
    }

    // Add user message to chat
    await chatService.addMessage(chatId, {
      chatId,
      role: "user",
      content: message,
    });

    // Generate AI response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const aiResponse = response.text();

    // Add AI response to chat
    await chatService.addMessage(chatId, {
      chatId,
      role: "assistant",
      content: aiResponse,
    });

    return NextResponse.json({
      success: true,
      userMessage: message,
      aiResponse,
      chatId,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

//  Delete a specific chat
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const { chatId } = params;

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Delete the chat (soft delete)
    await chatService.deleteChat(chatId);

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
      chatId,
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}

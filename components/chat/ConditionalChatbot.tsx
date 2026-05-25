"use client";

import { usePathname } from "next/navigation";
import { ChatbotWidget } from "@/components/chat/ChatbotWidget";

export function ConditionalChatbot() {
  const pathname = usePathname();

  // Hide chatbot on meeting live chat and exam/exam proctoring flows.
  if (!pathname) return null;
  if (pathname === "/meeting") return null;
  if (pathname.startsWith("/exam")) return null;
  if (pathname === "/quiz-login") return null;

  return <ChatbotWidget />;
}


"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

type ChatMessage = {
  id: number;
  from: "user" | "bot";
  text: string;
};

const SUGGESTED_QUESTIONS = [
  "How do I join a meeting?",
  "Where can I see my exams?",
  "How do I get my certificate?",
  "Who do I contact for support?",
];

function getBotReply(input: string): string {
  const text = input.toLowerCase();

  if (text.includes("meeting") || text.includes("live")) {
    return "To join a meeting, go to the Meeting page from the top navigation. Select a room for your course and start chatting in real time.";
  }

  if (text.includes("exam") || text.includes("test") || text.includes("quiz")) {
    return "You can access your exams from the My Exams section. Make sure you are logged in with your student account.";
  }

  if (text.includes("certificate") || text.includes("certification")) {
    return "Digital certificates are available in the Certificates section after you successfully complete a course or exam.";
  }

  if (text.includes("support") || text.includes("help") || text.includes("contact")) {
    return "For support, please contact your course administrator or the NMU IntelliLearn help desk provided by your institution.";
  }

  return "I'm a simple IntelliLearn assistant. I can help with navigation questions like meetings, exams, certificates, and support. Try asking me one of the suggested questions below.";
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Hi! I'm the IntelliLearn assistant. Ask me about meetings, exams, certificates, or getting support.",
    },
  ]);

  const sendMessage = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      from: "user",
      text: value,
    };

    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      from: "bot",
      text: getBotReply(value),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                IntelliLearn Assistant
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ask quick questions about this platform
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 max-h-80 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[80%] ${
                    m.from === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-2 space-y-2">
            <div className="flex flex-wrap gap-2 mb-1">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 bg-gray-50 dark:bg-gray-900">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your question..."
                className="flex-1 bg-transparent outline-none text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="text-xs font-semibold text-primary disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}


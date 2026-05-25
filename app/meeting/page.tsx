"use client";

import { useState, useEffect, useRef } from "react";
import { apiUrl } from "@/lib/config/api";
import { fetchJson } from "@/lib/api/client";

const API = apiUrl("chat.php");

interface Message {
  id: number;
  room_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface Room {
  id: string;
  name: string;
}

const fmt = (ts: string) =>
  new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function MeetingPage() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: "general", name: "General" },
    { id: "cs101", name: "CS 101" },
    { id: "math201", name: "Math 201" },
  ]);
  const [room, setRoom] = useState<Room>({ id: "general", name: "General" });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("Student");
  const [loading, setLoading] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [apiOffline, setApiOffline] = useState(false);

  const lastIdRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchJson<{ success: boolean; rooms?: Room[] }>(`${API}?action=rooms`)
      .then((d) => {
        setApiOffline(false);
        if (d.success && d.rooms?.length) setRooms(d.rooms);
      })
      .catch(() => {
        setApiOffline(true);
      });
  }, []);

  const loadMessages = async (r: Room) => {
    setLoading(true);
    lastIdRef.current = 0;
    try {
      const data = await fetchJson<{ success: boolean; messages?: Message[] }>(
        `${API}?action=messages&room_id=${r.id}&last_id=0`
      );
      if (data.success) {
        setApiOffline(false);
        setMessages(data.messages || []);
        if (data.messages?.length) lastIdRef.current = data.messages.at(-1).id;
      }
    } catch {
      setApiOffline(true);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (r: Room) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const data = await fetchJson<{ success: boolean; messages?: Message[] }>(
          `${API}?action=messages&room_id=${r.id}&last_id=${lastIdRef.current}`
        );
        if (data.success && data.messages?.length) {
          setApiOffline(false);
          setMessages((prev) => [...prev, ...data.messages]);
          lastIdRef.current = data.messages.at(-1).id;
        }
      } catch {
        setApiOffline(true);
      }
    }, 3000);
  };

  useEffect(() => {
    loadMessages(room);
    startPolling(room);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [room]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const opt: Message = {
      id: Date.now(),
      room_id: room.id,
      username,
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((p) => [...p, opt]);
    try {
      await fetchJson(`${API}?action=send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: room.id, username, message: text }),
      });
      setApiOffline(false);
    } catch {
      setApiOffline(true);
    }
  };

  const addRoom = async () => {
    const name = newRoom.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const r: Room = { id, name };
    setRooms((prev) => [...prev, r]);
    setRoom(r);
    setNewRoom("");
    setShowAdd(false);
    try {
      await fetchJson(`${API}?action=create_room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setApiOffline(false);
    } catch {
      setApiOffline(true);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="h-16" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Meeting Chat
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time chat rooms for your courses
          </p>
          {apiOffline && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Chat API is currently unavailable. Ensure `nmu-api/chat.php` is accessible.
            </p>
          )}
        </div>
        <div
          className="flex gap-4"
          style={{ height: "calc(100vh - 230px)" }}
        >
          <div className="w-60 flex-shrink-0 bg-card-light dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                Rooms
              </span>
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="w-6 h-6 rounded-full text-white text-sm flex items-center justify-center hover:opacity-80"
                style={{ background: "#8B1A1A" }}
              >
                +
              </button>
            </div>
            {showAdd && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <input
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRoom()}
                  placeholder="Room name..."
                  className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 outline-none"
                />
                <button
                  onClick={addRoom}
                  className="mt-2 w-full text-xs text-white rounded-lg py-1.5 hover:opacity-80"
                  style={{ background: "#8B1A1A" }}
                >
                  Create
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-2">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoom(r)}
                  className="w-full text-left px-3 py-2.5 rounded-xl mb-1 text-sm font-medium flex items-center gap-2 transition-all"
                  style={{
                    background: room.id === r.id ? "#8B1A1A" : "",
                    color: room.id === r.id ? "white" : "#4B5563",
                  }}
                >
                  <span>#</span>
                  {r.name}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                Your name
              </p>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 bg-card-light dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: "#8B1A1A22", color: "#8B1A1A" }}
                >
                  #
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {room.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {messages.length} messages
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full">
                🔄 Auto-refresh
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading && (
                <div className="flex justify-center py-10">
                  <div
                    className="w-6 h-6 border-2 border-gray-200 dark:border-gray-700 rounded-full animate-spin"
                    style={{ borderTopColor: "#8B1A1A" }}
                  />
                </div>
              )}
              {!loading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">Be the first to say something!</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.username === username;
                return (
                  <div
                    key={msg.id ?? i}
                    className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        background: isMe ? "#8B1A1A" : "#9CA3AF",
                      }}
                    >
                      {msg.username?.[0]?.toUpperCase()}
                    </div>
                    <div
                      className={`max-w-[65%] flex flex-col gap-1 ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`flex items-baseline gap-2 ${
                          isMe ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                          {msg.username}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {fmt(msg.created_at)}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "text-white rounded-tr-sm"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm"
                        }`}
                        style={isMe ? { background: "#8B1A1A" } : {}}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-3 items-center bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Message #${room.name}...`}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl text-white flex items-center justify-center hover:opacity-80 disabled:opacity-40"
                  style={{ background: "#8B1A1A" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                Press Enter to send
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


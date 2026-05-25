"use client";

import { useEffect, useState } from "react";
import { getClientSession } from "@/lib/auth/session";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Globe,
  BookOpen,
  Award,
  FileText,
  CheckCircle2,
} from "lucide-react";

const mockProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  location: "Riyadh, Saudi Arabia",
  language: "Arabic",
  bio: "Passionate developer focused on building modern web experiences.",
  stats: [
    { label: "Courses", value: "12", icon: BookOpen },
    { label: "Certificates", value: "8", icon: Award },
    { label: "Exams", value: "15", icon: FileText },
    { label: "Avg Score", value: "92%", icon: CheckCircle2 },
  ],
};

export default function ProfilePage() {
  const [tab, setTab] = useState("overview");
  const [name, setName] = useState(mockProfile.name);
  const [email, setEmail] = useState(mockProfile.email);

  useEffect(() => {
    const session = getClientSession();
    if (session) {
      setName(session.name);
      setEmail(session.email);
    }
  }, []);

  return (
    <div className="max-w-5xl space-y-8">

        {/* PROFILE HEADER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <User className="w-7 h-7 text-slate-500" />
            </div>

            <div>
              <h1 className="text-xl font-bold">{name}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {mockProfile.location}
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-500 text-right">
            <p className="flex items-center gap-1 justify-end">
              <Globe className="w-4 h-4" /> {mockProfile.language}
            </p>
            <p className="flex items-center gap-1 justify-end">
              <Mail className="w-4 h-4" /> {email}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          {["overview", "progress", "certificates"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                tab === t
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <>
            {/* BIO CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-slate-500">{mockProfile.bio}</p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockProfile.stats.map((s, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5"
                >
                  <s.icon className="w-5 h-5 text-slate-500 mb-2" />
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PLACEHOLDERS */}
        {tab === "progress" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border">
            Progress section coming soon...
          </div>
        )}

        {tab === "certificates" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border">
            Certificates section coming soon...
          </div>
        )}
    </div>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { InstructorApplication } from "@/lib/data/instructor-applications";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export default function InstructorApprovalsPage() {
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instructor-applications");
      const json = await res.json();
      if (json.success) setApplications(json.applications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    setActingId(id);
    try {
      const res = await fetch("/api/admin/instructor-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.success) await load();
    } finally {
      setActingId(null);
    }
  };

  const pending = applications.filter((a) => a.status === "pending");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Instructor Approvals</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        Review and approve instructor applications before dashboard access.
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center text-neutral-500">
          No pending applications.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card-light dark:bg-card-dark p-6"
            >
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{app.name}</h3>
                  <p className="text-sm text-neutral-500">{app.email}</p>
                  <p className="text-sm text-primary mt-1">{app.specialty}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 h-fit">
                  pending
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                {app.bio}
              </p>
              {app.portfolioUrl && (
                <a
                  href={app.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline block mb-4"
                >
                  {app.portfolioUrl}
                </a>
              )}
              <div className="flex gap-2">
                <Button
                  size="default"
                  onClick={() => updateStatus(app.id, "approved")}
                  disabled={actingId === app.id}
                  className="gap-1"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateStatus(app.id, "rejected")}
                  disabled={actingId === app.id}
                  className="gap-1"
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {applications.length > pending.length && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Reviewed</h2>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-800">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications
                  .filter((a) => a.status !== "pending")
                  .map((app) => (
                    <tr
                      key={app.id}
                      className="border-t border-neutral-200 dark:border-neutral-800"
                    >
                      <td className="p-3">{app.name}</td>
                      <td className="p-3">{app.email}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            app.status === "approved"
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          )}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

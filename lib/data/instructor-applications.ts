import { promises as fs } from "fs";
import path from "path";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface InstructorApplication {
  id: string;
  name: string;
  email: string;
  password: string;
  specialty: string;
  bio: string;
  portfolioUrl?: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "instructor-applications.json");

async function ensureStore(): Promise<InstructorApplication[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as InstructorApplication[];
  } catch {
    return [];
  }
}

async function writeStore(apps: InstructorApplication[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
}

export async function listApplications(): Promise<InstructorApplication[]> {
  const apps = await ensureStore();
  return apps.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export async function findApplicationByEmail(
  email: string
): Promise<InstructorApplication | null> {
  const apps = await ensureStore();
  return (
    apps.find((a) => a.email.toLowerCase() === email.trim().toLowerCase()) ??
    null
  );
}

export async function createApplication(
  data: Omit<InstructorApplication, "id" | "status" | "submittedAt">
): Promise<InstructorApplication> {
  const apps = await ensureStore();
  const email = data.email.trim().toLowerCase();

  if (apps.some((a) => a.email.toLowerCase() === email)) {
    throw new Error("An application with this email already exists.");
  }

  const app: InstructorApplication = {
    ...data,
    email,
    id: `app_${Date.now()}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  apps.push(app);
  await writeStore(apps);
  return app;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<InstructorApplication | null> {
  const apps = await ensureStore();
  const index = apps.findIndex((a) => a.id === id);
  if (index === -1) return null;

  apps[index] = {
    ...apps[index],
    status,
    reviewedAt: new Date().toISOString(),
  };
  await writeStore(apps);
  return apps[index];
}

export async function findApprovedInstructor(
  email: string,
  password: string
): Promise<InstructorApplication | null> {
  const app = await findApplicationByEmail(email);
  if (!app || app.status !== "approved") return null;
  if (app.password !== password.trim()) return null;
  return app;
}

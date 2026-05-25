"use client";

export interface CourseProgressRecord {
  courseId: number;
  courseTitle: string;
  completedModuleIds: number[];
  lastModuleId: number | null;
  enrolledAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "nmu_course_progress";

function readAll(email: string): CourseProgressRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, CourseProgressRecord[]>) : {};
    return map[email] ?? [];
  } catch {
    return [];
  }
}

function writeAll(email: string, records: CourseProgressRecord[]): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, CourseProgressRecord[]>) : {};
  map[email] = records;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getEnrollments(email: string): CourseProgressRecord[] {
  return readAll(email);
}

export function getCourseProgress(
  email: string,
  courseId: number
): CourseProgressRecord | null {
  return readAll(email).find((r) => r.courseId === courseId) ?? null;
}

export function enrollCourse(
  email: string,
  courseId: number,
  courseTitle: string
): CourseProgressRecord {
  const records = readAll(email);
  const existing = records.find((r) => r.courseId === courseId);
  if (existing) return existing;

  const record: CourseProgressRecord = {
    courseId,
    courseTitle,
    completedModuleIds: [],
    lastModuleId: null,
    enrolledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  records.push(record);
  writeAll(email, records);
  return record;
}

export function markModuleComplete(
  email: string,
  courseId: number,
  moduleId: number
): CourseProgressRecord | null {
  const records = readAll(email);
  const index = records.findIndex((r) => r.courseId === courseId);
  if (index === -1) return null;

  const record = records[index];
  if (!record.completedModuleIds.includes(moduleId)) {
    record.completedModuleIds = [...record.completedModuleIds, moduleId];
  }
  record.lastModuleId = moduleId;
  record.updatedAt = new Date().toISOString();
  records[index] = record;
  writeAll(email, records);
  return record;
}

export function getProgressPercent(
  record: CourseProgressRecord,
  totalModules: number
): number {
  if (totalModules <= 0) return 0;
  return Math.round(
    (record.completedModuleIds.length / totalModules) * 100
  );
}

export function getContinueTarget(
  record: CourseProgressRecord,
  moduleIds: number[]
): number | null {
  if (moduleIds.length === 0) return null;
  const next = moduleIds.find(
    (id) => !record.completedModuleIds.includes(id)
  );
  return next ?? moduleIds[moduleIds.length - 1];
}

/**
 * SubmissionsContext — shared state for the study-material upload/approval workflow.
 *
 * Flow:
 *   1. Student submits a note/PDF via Contributor Mode → status: "pending"
 *   2. Moderator or Admin reviews it → approves (status: "approved") or rejects (status: "rejected")
 *   3. Approved materials appear in the public Study Hub materials list.
 */
import { createContext, useContext, useState, type ReactNode } from "react";

export type SubmissionStatus = "pending" | "approved" | "rejected";
export type MaterialType = "pdf" | "notes" | "ppt" | "assignment" | "lab" | "syllabus" | "pyq";

export interface Submission {
  id: string;
  title: string;
  description: string;
  subject: string;
  course: string;
  semester: string;
  type: MaterialType;
  fileName: string;
  fileSize: string;
  uploadedBy: string;        // user name
  uploaderInitials: string;
  uploaderColor: string;
  submittedAt: string;       // display string
  status: SubmissionStatus;
  reviewNote?: string;       // moderator feedback
  reviewedBy?: string;
  reviewedAt?: string;
  downloads: number;
  rating: number;
}

interface SubmissionsContextValue {
  submissions: Submission[];
  addSubmission: (s: Omit<Submission, "id" | "status" | "downloads" | "rating">) => void;
  approveSubmission: (id: string, note: string, reviewerName: string) => void;
  rejectSubmission: (id: string, note: string, reviewerName: string) => void;
  pendingCount: number;
}

const SubmissionsContext = createContext<SubmissionsContextValue>({
  submissions: [],
  addSubmission: () => {},
  approveSubmission: () => {},
  rejectSubmission: () => {},
  pendingCount: 0,
});

// Pre-seeded demo pending submissions
const SEED: Submission[] = [
  {
    id: "s1",
    title: "Operating Systems — Unit 3 Complete Notes",
    description: "Covers process scheduling, memory management, and deadlock avoidance. Based on Silberschatz textbook.",
    subject: "Computer Science",
    course: "CS401",
    semester: "Semester 6",
    type: "notes",
    fileName: "os_unit3_notes.pdf",
    fileSize: "2.4 MB",
    uploadedBy: "Alex Rivera",
    uploaderInitials: "AR",
    uploaderColor: "bg-blue-500",
    submittedAt: "30 minutes ago",
    status: "pending",
    downloads: 0,
    rating: 0,
  },
  {
    id: "s2",
    title: "Software Engineering Previous Year Papers 2019–2023",
    description: "5 years of question papers with answer keys. Great for exam prep!",
    subject: "Computer Science",
    course: "CS305",
    semester: "Semester 5",
    type: "pyq",
    fileName: "se_pyq_2019_2023.zip",
    fileSize: "8.1 MB",
    uploadedBy: "Priya Iyer",
    uploaderInitials: "PI",
    uploaderColor: "bg-violet-500",
    submittedAt: "2 hours ago",
    status: "pending",
    downloads: 0,
    rating: 0,
  },
  {
    id: "s3",
    title: "Digital Electronics Lab Manual — Semester 4",
    description: "Complete lab manual with circuit diagrams and experiment results for all 12 labs.",
    subject: "Electronics",
    course: "EC201",
    semester: "Semester 4",
    type: "lab",
    fileName: "de_lab_manual_s4.pdf",
    fileSize: "5.7 MB",
    uploadedBy: "Karan Mehta",
    uploaderInitials: "KM",
    uploaderColor: "bg-amber-500",
    submittedAt: "5 hours ago",
    status: "pending",
    downloads: 0,
    rating: 0,
  },
];

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>(SEED);

  const addSubmission = (s: Omit<Submission, "id" | "status" | "downloads" | "rating">) => {
    const newSub: Submission = {
      ...s,
      id: `s_${Date.now()}`,
      status: "pending",
      downloads: 0,
      rating: 0,
    };
    setSubmissions((prev) => [newSub, ...prev]);
  };

  const approveSubmission = (id: string, note: string, reviewerName: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "approved", reviewNote: note, reviewedBy: reviewerName, reviewedAt: "Just now" }
          : s
      )
    );
  };

  const rejectSubmission = (id: string, note: string, reviewerName: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "rejected", reviewNote: note, reviewedBy: reviewerName, reviewedAt: "Just now" }
          : s
      )
    );
  };

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <SubmissionsContext.Provider value={{ submissions, addSubmission, approveSubmission, rejectSubmission, pendingCount }}>
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  return useContext(SubmissionsContext);
}

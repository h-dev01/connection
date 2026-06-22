/**
 * Reusable content moderation actions:
 *   - ReportDialog  — flag any content with a reason
 *   - DeleteConfirm — confirm before deleting own content
 *   - ActionMenu    — unified "⋯" dropdown that picks the right action per ownership
 */
import { useState } from "react";
import { Flag, Trash2, MoreHorizontal, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ─── shared toast helper ──────────────────────────────── */
export function ActionToast({ message, type = "success", onDone }: { message: string; type?: "success" | "warn"; onDone: () => void }) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white animate-in fade-in slide-in-from-bottom-4 duration-300",
        type === "success" ? "bg-emerald-600" : "bg-amber-600"
      )}
      onAnimationEnd={() => setTimeout(onDone, 2000)}
    >
      {type === "success"
        ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
        : <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
      {message}
    </div>
  );
}

/* ─── Report reasons ───────────────────────────────────── */
const REPORT_REASONS = [
  "Spam or misleading",
  "Inappropriate / offensive content",
  "Scam or fraudulent listing",
  "Duplicate post",
  "Wrong category",
  "Other",
];

export function ReportDialog({
  title,
  open,
  onClose,
  onSubmit,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");

  const handleSubmit = () => {
    onSubmit(reason === "Other" ? custom : reason);
    setReason("");
    setCustom("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Flag className="h-4 w-4" /> Report Content
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-sm text-slate-700 font-medium truncate">
            {title}
          </div>
          <p className="text-sm text-slate-500">Why are you reporting this?</p>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={cn(
                  "w-full text-left text-sm px-3 py-2.5 rounded-xl border transition-all",
                  reason === r
                    ? "bg-red-50 border-red-300 text-red-700 font-semibold"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {reason === "Other" && (
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Describe the issue..."
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
              disabled={!reason || (reason === "Other" && !custom.trim())}
              onClick={handleSubmit}
            >
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteConfirm({
  label,
  open,
  onClose,
  onConfirm,
}: {
  label: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-4 w-4" /> Delete {label}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <p className="text-sm text-slate-600">
            This will permanently remove your {label.toLowerCase()}. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={onConfirm}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * ActionMenu — "⋯" dropdown
 * isOwner = true  → shows Delete
 * isOwner = false → shows Report
 * isModerator     → shows both
 */
export function ActionMenu({
  title,
  isOwner,
  isModerator,
  onDelete,
  onReport,
  size = "sm",
}: {
  title: string;
  isOwner: boolean;
  isModerator?: boolean;
  onDelete: () => void;
  onReport: () => void;
  size?: "sm" | "xs";
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const btnSize = size === "xs" ? "h-6 w-6" : "h-8 w-8";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn(btnSize, "text-slate-400 hover:text-slate-700")}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {(isOwner || isModerator) && (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50 gap-2"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          )}
          {(!isOwner || isModerator) && (
            <DropdownMenuItem
              className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 gap-2"
              onClick={() => setReportOpen(true)}
            >
              <Flag className="h-3.5 w-3.5" /> Report
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        title={title}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={() => { setReportOpen(false); onReport(); }}
      />
      <DeleteConfirm
        label="Post"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { setDeleteOpen(false); onDelete(); }}
      />
    </>
  );
}

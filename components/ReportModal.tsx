"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { AlertCircle } from "lucide-react";

interface ReportModalProps {
  videoId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ videoId, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    try {
      setLoading(true);
      await api.post("/reports", { videoId, reason });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Report Video
          </DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="py-6 text-center text-green-500 font-medium">
            Report submitted successfully. Thank you for helping keep our community safe.
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for reporting</Label>
              <Textarea
                id="reason"
                placeholder="Please describe the issue..."
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                className="h-32 resize-none"
              />
            </div>
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
                onClick={handleSubmit} 
                disabled={loading || !reason.trim()}
                variant="destructive"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import api from "@/lib/api";
import { AlertCircle } from "lucide-react";

interface ReportModalProps {
  videoId: number;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_CATEGORIES = [
  { id: "sexual", label: "Sexual content" },
  { id: "violent", label: "Violent or repulsive content" },
  { id: "hateful", label: "Hateful or abusive content" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "harmful", label: "Harmful or dangerous acts" },
  { id: "misinformation", label: "Misinformation" },
  { id: "copyright", label: "Copyright infringement" }, // Added copyright claim
  { id: "spam", label: "Spam or misleading" },
];

export default function ReportModal({ videoId, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!category) return;

    try {
      setLoading(true);
      await api.post("/reports", { 
        videoId, 
        reason: reason || category, // Use category as reason if reason is empty
        category 
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason("");
        setCategory("");
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
      <DialogContent className="sm:max-w-[500px]">
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
          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label>What is the issue?</Label>
              <RadioGroup value={category} onValueChange={setCategory} className="grid gap-2">
                {REPORT_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={cat.id} id={cat.id} />
                    <Label htmlFor={cat.id} className="font-normal cursor-pointer">{cat.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {category && (
              <div className="grid gap-2">
                <Label htmlFor="reason">Additional details (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide more context..."
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                  className="h-24 resize-none"
                />
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
                onClick={handleSubmit} 
                disabled={loading || !category}
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

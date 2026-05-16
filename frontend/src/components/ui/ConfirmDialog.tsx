"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  isSubmitting,
  onClose,
  onConfirm
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Working..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

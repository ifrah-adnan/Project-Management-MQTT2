"use client";
import { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import { CircleAlertIcon } from "lucide-react";

export interface ConfirmButtonProps extends ButtonProps {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  action?: () => void | Promise<void>;
}

export function ConfirmButton({
  title = "Confirm",
  message = "this action is irreversible, are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  action = () => {},
  ...props
}: ConfirmButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    closeRef.current?.click();
  };

  const handleSubmit = async (formData: FormData) => {
    await action();
    handleClose();
  };

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button {...props} />
      </DialogTrigger>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle className="mb-4 flex items-center gap-2">
            <span>{title}</span>
            <CircleAlertIcon />
          </DialogTitle>
          <DialogDescription className=" mt-4">{message}</DialogDescription>
        </DialogHeader>
        <form
          action={handleSubmit}
          className="flex flex-1 flex-col gap-4 py-4 "
        >
          <div className="mt-auto flex items-center justify-end gap-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" ref={closeRef}>
                {cancelText}
              </Button>
            </DialogClose>
            <Button type="submit" className="flex items-center gap-2">
              {confirmText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

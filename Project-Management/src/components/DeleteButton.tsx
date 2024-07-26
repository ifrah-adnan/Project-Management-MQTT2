"use client";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { LucideIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteButtonProps {
    Icon?: LucideIcon;
    itemId?: string;
    confirmationMessage?: string;
    afterDeleteMessage?: string;
    onDelete: (itemId: string) => void
}

export const DeleteButton = ({
    itemId,
    onDelete,
    Icon = Trash2Icon,
    afterDeleteMessage = "Operation successful deleted",
    confirmationMessage = "Are you sure you want to delete this item, This action is irreversible"

}: DeleteButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSubmit = () => {
        try {
            onDelete(itemId || "");
            toast.success(afterDeleteMessage);
            router.refresh();
            handleClose();
        } catch (error) {
            toast.error("Error deleting operation");
        }
    };

    return (
        <Dialog onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                >
                    <Icon size={18} />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col">
                <DialogHeader>
                    <DialogTitle>Confirm</DialogTitle>
                    <DialogDescription>
                        {confirmationMessage}
                    </DialogDescription>
                </DialogHeader>
                <form
                    action={handleSubmit}
                    className="flex flex-1 flex-col gap-4"
                >
                    <div className="mt-auto flex items-center justify-end gap-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="flex items-center gap-2">
                            Confirm
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
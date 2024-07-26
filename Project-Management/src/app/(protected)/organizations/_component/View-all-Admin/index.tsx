import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ellipsis, PencilIcon, Trash2Icon } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteById } from "@/app/(protected)/users/_utils/actions";
import { EditUserButton } from "@/app/(protected)/users/_components/edit-user-button";

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface ViewAllAdminsDialogProps {
  admins: Admin[];
  organizationName: string;
}

export function ViewAllAdminsDialog({
  admins: initialAdmins,
  organizationName,
}: ViewAllAdminsDialogProps) {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>(
    {},
  );
  const togglePopover = (adminId: string) => {
    setOpenPopovers((prev) => ({
      ...prev,
      [adminId]: !prev[adminId],
    }));
  };

  const handleDelete = async (adminId: string) => {
    await deleteById(adminId);
    setAdmins((prevAdmins) =>
      prevAdmins.filter((admin) => admin.id !== adminId),
    );
    setOpenPopovers((prev) => ({ ...prev, [adminId]: false }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-blue-500">
          View All ({admins.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Administrators of {organizationName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[300px] rounded-md border p-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="mb-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{admin.name}</p>
                <p className="text-sm text-gray-500">{admin.email}</p>
              </div>
              <Popover
                open={openPopovers[admin.id]}
                onOpenChange={() => togglePopover(admin.id)}
              >
                <PopoverTrigger>
                  <Ellipsis size={16} />
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="flex w-fit flex-col gap-2"
                >
                  <EditUserButton
                    userData={admin}
                    variant="ghost"
                    className="justify-start gap-2 bg-none px-6 hover:text-sky-500 "
                  >
                    <PencilIcon size={16} />
                    <span>Edit</span>
                  </EditUserButton>
                  <ConfirmButton
                    variant="ghost"
                    size="icon"
                    className="flex w-full justify-start gap-2 rounded-md px-6 hover:text-red-500"
                    action={() => handleDelete(admin.id)}
                  >
                    <Trash2Icon size={18} />
                    <span>Delete</span>
                  </ConfirmButton>
                </PopoverContent>
              </Popover>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

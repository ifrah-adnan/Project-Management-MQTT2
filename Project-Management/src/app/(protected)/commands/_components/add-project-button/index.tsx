"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { PopoverClose } from "@radix-ui/react-popover";
import { PlusIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { createInputSchema } from "@/app/(protected)/products/_utils/schemas";
import { create } from "@/app/(protected)/products/_utils/actions";
import { mutate } from "swr";

interface CreateNewProjectButtonProps {
  closePopoverRef: React.RefObject<HTMLButtonElement>;
  setNewProject?: React.Dispatch<React.SetStateAction<string>> | null;
}

export default function CreateNewProjectButton({
  closePopoverRef,
  setNewProject = null,
}: CreateNewProjectButtonProps) {
  const addNewProjectAction = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const data = {
      name,
      description: description || undefined,
    };
    if (Object.values(data).some((value) => !value)) {
      toast.error("All fields are required");
      return;
    }
    const parsed = createInputSchema.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      return;
    }
    const { result, error } = await create(parsed.data);

    if (error) toast.error(error);

    if (result) {
      toast.success("Project added successfully");
      if (setNewProject) setNewProject("existing project");
      closePopoverRef.current?.click();
      mutate("addCommandData");
    }
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="w-full gap-2 text-sm font-medium"
          size={"sm"}
          variant={"outline"}
        >
          <PlusIcon size={18} />
          <span>Create new project</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[20rem]">
        <form
          action={addNewProjectAction}
          className="flex flex-col place-content-center  gap-x-2 gap-y-4"
        >
          <Label className="mt-4 inline-block">Name *</Label>
          <Input type="text" name="name" className="w-full" required />

          <Label>Description *</Label>
          <Textarea name="description" className="w-full" required />

          <div className=" col-span-2 mt-4 flex items-center justify-end gap-4">
            <Button
              onClick={(e) => {
                e.preventDefault();
                closePopoverRef.current?.click();
              }}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button type="submit" variant="outline">
              Add
            </Button>
          </div>
        </form>
        <PopoverClose hidden ref={closePopoverRef}></PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

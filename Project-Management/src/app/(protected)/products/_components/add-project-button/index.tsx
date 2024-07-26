"use client";

import { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import React from "react";
import { FieldErrors } from "@/actions/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormInput from "@/components/form-input";
import { TCreateInput, createInputSchema } from "../../_utils/schemas";
import { create } from "../../_utils/actions";
import FormTextarea from "@/components/form-textarea";

export interface AddOperatorButtonProps extends ButtonProps {}

export function AddProjectButton(props: AddOperatorButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInput>
  >({});
  const router = useRouter();

  const handleClose = () => {
    setFieldErrors({});
    closeRef.current?.click();
  };

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const data = {
      name,
      description: description || undefined,
    };

    const parsed = createInputSchema.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TCreateInput>,
      );
      return;
    }
    const { result, error, fieldErrors } = await create(parsed.data);

    if (error) toast.error(error);

    if (fieldErrors) setFieldErrors(fieldErrors);

    if (result) {
      handleClose();
      toast.success("Project added successfully");
      router.refresh();
    }
  };

  return (
    <Sheet onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button {...props} />
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            <span>Add Project</span>
          </SheetTitle>
          <SheetDescription>
            Fill in the form below to add a new project
          </SheetDescription>
        </SheetHeader>
        <form
          action={handleSubmit}
          className="flex flex-1 flex-col gap-2 py-4 "
        >
          <FormInput
            name="name"
            label="Name *"
            className="mt-4"
            required
            errors={fieldErrors.name}
          />
          <FormTextarea
            name="description"
            label="Description *"
            className="mt-4"
            errors={fieldErrors.description}
          />

          <div className="mt-auto flex items-center justify-end gap-4">
            <SheetClose ref={closeRef}></SheetClose>
            <Button
              type="button"
              variant="outline"
              className="flex w-24 gap-2"
              onClick={handleClose}
            >
              <ArrowLeftIcon size={18} />
              <span>Cancel</span>
            </Button>
            <Button type="submit" className="flex w-24 gap-2">
              <PlusIcon size={18} />
              Save
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

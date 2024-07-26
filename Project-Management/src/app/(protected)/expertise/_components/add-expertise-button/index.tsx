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
import { TCreateInput } from "../../_utils/schemas";
import { createExpertise, getOperations } from "../../_utils/actions";
import { Label } from "@/components/ui/label";
import useSWR from "swr";
import { MultiSelect } from "@/components/multi-select";
import FormErrors from "@/components/form-errors";
import { useSession } from "@/components/session-provider";
import { getServerSession } from "@/lib/auth";

export interface AddOperatorButtonProps extends ButtonProps {}

export function AddExpertiseButton(props: AddOperatorButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInput>
  >({});
  const [operations, setOperations] = React.useState<
    { name: string; id: string }[]
  >([]);
  const router = useRouter();

  const { data, isLoading, error } = useSWR("addUserData", async () => {
    const serverSession = await getServerSession();
    const organizationId =
      serverSession?.user.organizationId ||
      serverSession?.user.organization?.id;
    console.log(organizationId, "this is organizationId v22222");

    const [expertise] = await Promise.all([getOperations()]);
    return { expertise };
  });

  const handleClose = () => {
    setFieldErrors({});
    setOperations([]);
    closeRef.current?.click();
  };

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const serverSession = await getServerSession();
    const organizationId = serverSession?.user.organization?.id;
    console.log(organizationId, "aaaaaaaaaa");
    console.log("ttttttttttt");

    console.log("ddddddddddw", user.id);
    console.log("zzzzzzzzzzzzzzzz");

    const { result, error, fieldErrors } = await createExpertise({
      name,
      code,
      operations: operations.map((op) => op.id),
      userId: user.id,
    });

    if (error) toast.error(error);

    if (fieldErrors) setFieldErrors(fieldErrors);

    if (result) {
      handleClose();
      toast.success("Expertise added successfully");
      router.refresh();
    }
  };
  const { session } = useSession();
  const user = session?.user;

  console.log(user);

  return (
    <Sheet onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button {...props} />
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Expertise</SheetTitle>
          <SheetDescription>Add a new expertise to the list</SheetDescription>
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
          <FormInput
            name="code"
            label="Code *"
            className="mt-4"
            required
            errors={fieldErrors.code}
          />
          <Label className="mt-4 inline-block">Operations </Label>
          <MultiSelect
            options={data?.expertise || []}
            value={operations}
            onValueChange={setOperations}
            optionRenderer={(option) => option.name}
            valueRenderer={(option) => option.name}
          />
          <FormErrors errors={fieldErrors.operations} />

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

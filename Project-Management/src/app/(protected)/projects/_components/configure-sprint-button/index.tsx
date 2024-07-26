"use client";
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
} from "@/components/ui/dialog";
import useSWR from "swr";
import { configureSprint, getSprint } from "../../_utils/actions";
import { configureSpringSchema, TConfigureSprint } from "../../_utils/schemas";
import { FieldErrors } from "@/actions/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormInput from "@/components/form-input";
import { CornerDownLeftIcon, SaveIcon } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";

interface ConfigureSprintButtonProps extends ButtonProps {
  commandProjectId: string;
  sprint?: {
    target: number;
    days: number;
  } | null;
  maxTarget: number;
}

export default function ConfigureSprintButton({
  commandProjectId,
  disabled,
  sprint,
  maxTarget,
  ...props
}: ConfigureSprintButtonProps) {
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TConfigureSprint>
  >({});
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleClose = () => {
    setFieldErrors({});
    closeRef.current?.click();
  };

  const action = async (formData: FormData) => {
    const days = formData.get("days") as string;
    const target = formData.get("target") as string;
    if (parseInt(target) > maxTarget) {
      toast.error("target must not exceed " + maxTarget);
      return;
    }

    const data: TConfigureSprint = {
      days: parseInt(days),
      target: parseInt(target),
      commandProjectId,
    };

    const parsed = configureSpringSchema.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TConfigureSprint>,
      );
      return;
    }
    const { result, error, fieldErrors } = await configureSprint(data);

    if (error) toast.error(error);

    if (fieldErrors) setFieldErrors(fieldErrors);

    if (result) {
      handleClose();
      toast.success("Sprint configured successfully");
      router.refresh();
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button {...props} />
      </DialogTrigger>
      <DialogContent className=" max-w-sm">
        <DialogHeader>Configure Sprint</DialogHeader>
        <DialogDescription className="text-gray-500">
          Configure the sprint target and days
        </DialogDescription>
        <form action={action} className="flex flex-col gap-4">
          <FormInput
            defaultValue={sprint?.target}
            name="target"
            label="Target"
            type="number"
            errors={fieldErrors.target}
          />
          <FormInput
            defaultValue={sprint?.days}
            name="days"
            label="Days"
            type="number"
            errors={fieldErrors.days}
          />
          <div className="mt-4 flex justify-center gap-2 [&>*]:min-w-[6rem]">
            <Button
              type="button"
              className=" gap-2"
              variant="outline"
              onClick={handleClose}
            >
              <CornerDownLeftIcon />
              <span>Cancel</span>
            </Button>
            <Button type="submit" className=" gap-2" variant="outline">
              <SaveIcon size={16} />
              <span>Save</span>
            </Button>
          </div>
        </form>
        <DialogClose ref={closeRef} hidden />
      </DialogContent>
    </Dialog>
  );
}

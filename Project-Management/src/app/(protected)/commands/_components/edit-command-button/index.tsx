"use client";

import React from "react";
import { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { FieldErrors } from "@/actions/utils";
import {
  TCreateInput,
  TCreateInputforUpdate,
  createInputSchemaforUpdate,
} from "../../_utils/schemas";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FormInput from "@/components/form-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormErrors from "@/components/form-errors";
import {
  TEditInput,
  edit,
  getClients,
  getProjects,
} from "../../_utils/actions";
import { toast } from "sonner";
import useSWR from "swr";
export interface AddOperatorButtonProps extends ButtonProps {
  commands: {
    id: string;
    reference: string;
    client: { id: string; name: string; image: string | null };
  };
}
export function EditCommandButton({
  commands,
  ...props
}: AddOperatorButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInputforUpdate>
  >({});
  const [clientId, setClientId] = React.useState(commands.client.id);

  const router = useRouter();

  const handleClose = () => {
    setFieldErrors({});
    closeRef.current?.click();
  };
  const { data, isLoading, error } = useSWR("addCommandData", async () => {
    const [projects, clients] = await Promise.all([
      getProjects(),
      getClients(),
    ]);
    return { projects, clients };
  });
  // React.useEffect(() => {
  //   console.log("Initial clientId:", clientId);
  // }, []);

  // React.useEffect(() => {
  //   console.log("Updated clientId:", commands);
  // }, [commands]);

  const projects = data?.projects || [];
  const clients = data?.clients || [];
  const handleSubmit = async (formData: FormData) => {
    const reference = formData.get("reference") as string;

    const data: TEditInput = {
      commandId: commands.id,
      reference,
      clientId,
    };

    const parsed = createInputSchemaforUpdate.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      setFieldErrors(
        parsed.error.flatten()
          .fieldErrors as FieldErrors<TCreateInputforUpdate>,
      );
      return;
    }

    const { result, error } = await edit(data);

    if (error) toast.error(error);

    if (fieldErrors) setFieldErrors(fieldErrors);

    if (result) {
      handleClose();
      toast.success("Post added successfully");
      router.refresh();
    }
  };

  return (
    <Sheet onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button {...props} />
      </SheetTrigger>
      <SheetContent className=" flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Command</SheetTitle>
          <SheetDescription>
            Fill in the form below to edit this command
          </SheetDescription>
        </SheetHeader>
        <form
          action={handleSubmit}
          className=" flex flex-1 flex-col gap-2 py-4"
        >
          {" "}
          <FormInput
            name="reference"
            label="Reference *"
            required
            errors={fieldErrors.reference}
            defaultValue={commands.reference}
          />
          <Label className="mt-4 inline-block">Client</Label>
          <Select onValueChange={setClientId} value={clientId}>
            <SelectTrigger>
              <SelectValue>
                {clients.find((client) => client.id === clientId)?.name ||
                  "Select a client"}
              </SelectValue>{" "}
            </SelectTrigger>
            <SelectContent>
              {clients.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 border-2 border-[#E6B3BA]">
                      <AvatarImage src={item.image || ""} alt={item.name} />
                      <AvatarFallback className="font-bold">
                        {`${item.name.charAt(0).toUpperCase()}`}
                      </AvatarFallback>
                    </Avatar>
                    <span className="capitalize">{item.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormErrors errors={fieldErrors.clientId} />
          <SheetClose ref={closeRef}></SheetClose>
          <div className="mt-auto flex items-center justify-end gap-4">
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

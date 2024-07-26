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
import useSWR, { mutate } from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FormInput from "@/components/form-input";
import {
  TEditInput,
  createOnlyCommand,
  getClients,
} from "@/app/(protected)/commands/_utils/actions";
import { FieldErrors } from "@/actions/utils";
import { createInputSchemaforUpdate } from "@/app/(protected)/commands/_utils/schemas";
interface CreateNewProjectButtonProps {
  closePopoverRef: React.RefObject<HTMLButtonElement>;
  setNewCommand: React.Dispatch<React.SetStateAction<string>>;
}

export default function CreateNewCommandButton({
  setNewCommand,
  closePopoverRef,
}: CreateNewProjectButtonProps) {
  const [clientId, setClientId] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors<TEditInput>>(
    {},
  );
  const { data, isLoading, error } = useSWR("client", async () => {
    const [clients] = await Promise.all([getClients()]);
    return { clients };
  });

  const clients = data?.clients || [];

  const addNewCommandAction = async (formData: FormData) => {
    const reference = formData.get("reference") as string;

    const data = {
      reference,
      clientId,
    };
    if (Object.values(data).some((value) => !value)) {
      toast.error("All fields are required");
      return;
    }
    const parsed = createInputSchemaforUpdate.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TEditInput>,
      );
      return;
    }
    const { result, error } = await createOnlyCommand(parsed.data);

    if (error) toast.error(error);

    if (result) {
      toast.success("Command added successfully");
      setNewCommand("existing command");
      setFieldErrors({});
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
          <span>Create new command</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[20rem]">
        <form
          action={addNewCommandAction}
          className="flex flex-col place-content-center  gap-x-2 gap-y-4"
        >
          <FormInput
            name="reference"
            label="Reference"
            required
            errors={fieldErrors.reference}
          />
          <Label className="mt-4 inline-block">Client</Label>
          <Select onValueChange={setClientId} value={clientId}>
            <SelectTrigger>
              <SelectValue className="w-full" placeholder="Select a client" />
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

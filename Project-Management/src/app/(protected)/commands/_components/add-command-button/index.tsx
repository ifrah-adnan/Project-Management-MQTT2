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
import React, { useState } from "react";
import { FieldErrors } from "@/actions/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormInput from "@/components/form-input";
import { TCreateInput, createInputSchema } from "../../_utils/schemas";
import {
  // create,
  createCommandd,
  getClients,
  getProjects,
} from "../../_utils/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR from "swr";
import { Label } from "@/components/ui/label";
import FormErrors from "@/components/form-errors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import CreateNewProjectButton from "../add-project-button";
import { useSession } from "@/components/session-provider";

export interface AddOperatorButtonProps extends ButtonProps {}

export function AddCommandButton(props: AddOperatorButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const closePopoverRef = React.useRef<HTMLButtonElement>(null);
  const [projectId, setProjectId] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInput>
  >({});
  const router = useRouter();
  const [commandProjects, setCommandProjects] = useState<
    TCreateInput["commandProjects"]
  >([]);
  const { session } = useSession();
  const user = session?.user;
  const userId = user.id;

  const { data, isLoading, error } = useSWR("addCommandData", async () => {
    const [projects, clients] = await Promise.all([
      getProjects(),
      getClients(),
    ]);
    return { projects, clients };
  });

  const projects = data?.projects || [];
  const clients = data?.clients || [];

  const handleClose = () => {
    setFieldErrors({});
    setCommandProjects([]);
    closeRef.current?.click();
  };

  const handleSubmit = async (formData: FormData) => {
    const reference = formData.get("reference") as string;

    // const data: TCreateInput = {
    //   reference,
    //   clientId,
    //   commandProjects,
    // };
    // const parsed = createInputSchema.safeParse(data);

    // if (!parsed.success) {
    //   toast.error("Invalid input");
    //   setFieldErrors(
    //     parsed.error.flatten().fieldErrors as FieldErrors<TCreateInput>,
    //   );
    //   return;
    // }

    const { result, error, fieldErrors } = await createCommandd({
      reference,
      clientId,
      commandProjects,
      userId,
    });

    if (error) toast.error(error);

    if (fieldErrors) setFieldErrors(fieldErrors);

    if (result) {
      handleClose();
      toast.success("Command added successfully");
      router.refresh();
    }
  };

  const addExistingProjectAction = async (formData: FormData) => {
    const target = formData.get("target") as string;
    const endDate = formData.get("endDate") as string;

    const data = {
      projectId,
      target: +target,
      endDate: new Date(endDate),
    };
    if (Object.values(data).some((value) => !value)) {
      toast.error("All fields are required");
      return;
    }
    setCommandProjects([...commandProjects, data]);
    setProjectId("");
    closePopoverRef.current?.click();
  };
  return (
    <Sheet onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button {...props} />
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Command</SheetTitle>
          <SheetDescription>
            Fill in the form below to add a new command
          </SheetDescription>
        </SheetHeader>
        <form
          action={handleSubmit}
          className="flex flex-1 flex-col gap-2 py-4 "
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
          {/* <FormErrors errors={fieldErrors.clientId} />
          <Label className="mt-4 inline-block space-x-2">
            <span>Projects</span>
            <span className="text-xs opacity-60">{"(Min 1 project) "}</span>
          </Label>
          <div className="grid grid-cols-3  rounded border text-xs [&>*]:px-3 [&>*]:py-2">
            <span className="font-medium">Project</span>
            <span className="font-medium">Target</span>
            <span className="font-medium">Deadline</span>
            {commandProjects.length === 0 && (
              <div className="col-span-3 text-center opacity-60">
                No projects added
              </div>
            )}
            {commandProjects.map((item, index) => {
              const project = projects.find((p) => p.id === item.projectId);
              return (
                <React.Fragment key={index}>
                  <div>{project?.name}</div>
                  <div>{item.target}</div>
                  <div>{format(new Date(item.endDate), "PP ")}</div>
                </React.Fragment>
              );
            })}
          </div>
          <Popover
            onOpenChange={(isOpen) => {
              if (!isOpen) setProjectId("");
            }}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                className="w-full gap-2 text-sm font-medium"
                size={"sm"}
                variant={"outline"}
              >
                <PlusIcon size={18} />
                <span>Add existing project</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[20rem]">
              <form
                action={addExistingProjectAction}
                className="grid grid-cols-[min-content,1fr] place-content-center items-center gap-x-2 gap-y-4"
              >
                <Label className="mt-4 inline-block">Project</Label>
                <Select required onValueChange={setProjectId} value={projectId}>
                  <SelectTrigger>
                    <SelectValue
                      className="w-full"
                      placeholder="Select a project"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter(
                        (p) =>
                          !commandProjects.some((cp) => cp.projectId === p.id),
                      )
                      .map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Label>Target</Label>
                <Input
                  type="number"
                  name="target"
                  className="w-full"
                  required
                />
                <Label>Deadline</Label>
                <Input type="date" name="endDate" className="w-full" required />
                <div className=" col-span-2 mt-4 flex items-center justify-end gap-4">
                  <Button variant="ghost">Cancel</Button>
                  <Button type="submit" variant="outline">
                    Add
                  </Button>
                </div>
              </form>
              <PopoverClose hidden ref={closePopoverRef}></PopoverClose>
            </PopoverContent>
          </Popover>
          <CreateNewProjectButton closePopoverRef={closePopoverRef} />

          <FormErrors errors={fieldErrors.commandProjects} /> */}

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

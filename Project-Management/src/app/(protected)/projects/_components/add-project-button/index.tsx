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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import React from "react";
import { FieldErrors } from "@/actions/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormInput from "@/components/form-input";
import {
  TCreateInput,
  TProjectNotInCommand,
  createInputSchema,
} from "../../_utils/schemas";
import {
  createCommandProject,
  getProjectsNotInCommand,
} from "@/app/(protected)/projects/_utils/actions";
import FormTextarea from "@/components/form-textarea";
import useSWR, { mutate } from "swr";
import {
  getClients,
  getProjects,
  getCommands,
} from "@/app/(protected)/commands/_utils/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CreateNewProjectButton from "@/app/(protected)/commands/_components/add-project-button";
import CreateNewCommandButton from "../add-command-button";
import { useSession } from "@/components/session-provider";

export interface AddOperatorButtonProps extends ButtonProps {}

export function AddProjectButton(props: AddOperatorButtonProps) {
  const closePopoverRef = React.useRef<HTMLButtonElement>(null);

  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInput>
  >({});
  const [projectId, setProjectId] = React.useState("");
  const [commandId, setCommandId] = React.useState("");
  const [newProject, setNewProject] = React.useState("existing project");
  const [newCommand, setNewCommand] = React.useState("existing command");

  const router = useRouter();
  const { session } = useSession();
  const user = session?.user;
  console.log(user, "sssssssss");
  const { data, isLoading, error } = useSWR("addCommandData", async () => {
    const commands = await getCommands();
    return { commands };
  });
  const [projects2, setProjects2] = React.useState<TProjectNotInCommand>([]);
  // const commands = React.useMemo(() => data?.commands || [], [data]);
  const commands = data?.commands || [];
  React.useEffect(() => {
    setProjectId("");
    const fetchProjects = async () => {
      try {
        const projectsNotInCommand = await getProjectsNotInCommand(commandId);
        setProjects2(projectsNotInCommand);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [commandId, newProject]);
  const handleClose = () => {
    setFieldErrors({});
    setProjectId("");
    setCommandId("");
    closeRef.current?.click();
  };

  const handleSubmit = async (formData: FormData) => {
    const target = formData.get("target") as string;
    const endDate = formData.get("endDate") as string;

    const data = {
      command_id: commandId,
      project_id: projectId,
      target: +target,
      endDate: new Date(endDate),
    };

    const parsed = createInputSchema.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TCreateInput>,
      );
      return;
    }
    const { result, error, fieldErrors } = await createCommandProject(
      parsed.data,
      user.id,
    );

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
          <div className=" border p-2">
            <div className="grid grid-cols-2 ">
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 hover:text-[#fa993a] ${newCommand === "existing command" && "border-b-[#FA993A]"} "`}
                onClick={(e) => {
                  e.preventDefault();
                  setNewCommand("existing command");
                }}
              >
                Existing Command
              </Button>{" "}
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 hover:text-[#fa993a] ${newCommand === "new command" && "border-b-[#FA993A]"} "`}
                onClick={(e) => {
                  e.preventDefault();
                  setNewCommand("new command");
                }}
              >
                New Command
              </Button>
            </div>

            {newCommand === "existing command" ? (
              <>
                <Label className="mt-4 inline-block">Command</Label>
                <Select required onValueChange={setCommandId} value={commandId}>
                  <SelectTrigger>
                    <SelectValue
                      className="w-full"
                      placeholder="Select a Command"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {commands.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.reference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <div className="m-2">
                <CreateNewCommandButton
                  setNewCommand={setNewCommand}
                  closePopoverRef={closePopoverRef}
                />
              </div>
            )}
          </div>
          <div className=" border p-2">
            <div className="grid grid-cols-2 ">
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 hover:text-[#fa993a] ${newProject === "existing project" && "border-b-[#FA993A]"} "`}
                onClick={(e) => {
                  e.preventDefault();
                  setNewProject("existing project");
                }}
              >
                Existing Project
              </Button>{" "}
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 hover:text-[#fa993a] ${newProject === "new project" && "border-b-[#FA993A]"} "`}
                onClick={(e) => {
                  e.preventDefault();
                  setNewProject("new project");
                }}
              >
                New Project
              </Button>
            </div>

            {newProject === "existing project" ? (
              <>
                <Label className="mt-4 inline-block">Project</Label>
                <Select required onValueChange={setProjectId} value={projectId}>
                  <SelectTrigger>
                    <SelectValue
                      className="w-full"
                      placeholder="Select a project"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projects2.length === 0 && (
                      <SelectItem
                        disabled
                        value="0"
                        className="px-2 text-center text-xs"
                      >
                        This command includes all existing projects.
                      </SelectItem>
                    )}
                    {projects2.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <div className="m-2">
                <CreateNewProjectButton
                  setNewProject={setNewProject}
                  closePopoverRef={closePopoverRef}
                />
              </div>
            )}
          </div>
          <Label>Target</Label>
          <Input type="number" name="target" className="w-full" required />
          <Label>Deadline</Label>
          <Input type="date" name="endDate" className="w-full" required />

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

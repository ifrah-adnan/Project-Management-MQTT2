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
  TData,
  TProjectNotInCommand,
  createInputSchema,
  createInputSchemaForUpdate,
} from "../../_utils/schemas";
import {
  edit,
  getProjectsNotInCommand,
} from "@/app/(protected)/projects/_utils/actions";
import FormTextarea from "@/components/form-textarea";
import useSWR, { mutate } from "swr";
import {
  getProjects,
  getCommands,
} from "@/app/(protected)/commands/_utils/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CreateNewProjectButton from "@/app/(protected)/commands/_components/add-project-button";
import CreateNewCommandButton from "../add-command-button";
import { Status } from "@prisma/client";
import { projectsStatus } from "@/utils";

export interface AddOperatorButtonProps extends ButtonProps {
  project: {
    id: string;
    createdAt: Date;
    status: Status;
    project: {
      id: string;
      name: string;
      status: boolean;
    };
    command: {
      id: string;
      client: {
        name: string;
        image: string | null;
      } | null;
      reference: string;
    };
    sprint: {
      target: number;
      days: number;
    } | null;
    target: number;
    endDate: Date;
  };
}

export function EditProjectButton({
  project,
  ...props
}: AddOperatorButtonProps) {
  const closePopoverRef = React.useRef<HTMLButtonElement>(null);

  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInput>
  >({});
  const [projectId, setProjectId] = React.useState(project.project.id);
  const [commandId, setCommandId] = React.useState(project.command.id);
  const [newProject, setNewProject] = React.useState("existing project");
  const [newCommand, setNewCommand] = React.useState("existing command");
  const [status, setStatus] = React.useState<Status>("ACTIVE");

  const router = useRouter();
  const { data, isLoading, error } = useSWR("addCommandData", async () => {
    const [projects, commands] = await Promise.all([
      getProjects(),
      getCommands(),
    ]);
    return { projects, commands };
  });
  const [projects2, setProjects2] = React.useState<TProjectNotInCommand>([]);
  const projects = data?.projects || [];
  const commands = React.useMemo(() => data?.commands || [], [data]);
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
  }, [commandId]);
  const handleClose = () => {
    setFieldErrors({});

    closeRef.current?.click();
  };

  const handleSubmit = async (formData: FormData) => {
    const target = formData.get("target") as string;
    const endDate = formData.get("endDate") as string;

    const data = {
      projectToUpdateId: project.id,
      commandId,
      projectId: projectId ? projectId : project.project.id,
      target: +target,
      status,
      endDate: new Date(endDate),
    };

    const parsed = createInputSchemaForUpdate.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TCreateInput>,
      );
      return;
    }
    const { result, error, fieldErrors } = await edit(parsed.data);

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
            <span>Edit Project</span>
          </SheetTitle>
          <SheetDescription>
            Fill in the form below to edit project
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
                <Label className="mt-4 inline-block">
                  Project ( current project is {project.project.name})
                </Label>
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
          <Label className="mt-4 inline-block">Status</Label>
          <Select
            required
            value={status}
            onValueChange={(val) => setStatus(val as Status)}
          >
            <SelectTrigger>
              <SelectValue className="w-full" placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projectsStatus.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label>Target</Label>
          <Input
            type="number"
            name="target"
            className="w-full"
            defaultValue={project.target}
            required
          />
          <Label>Deadline</Label>
          <Input
            type="date"
            name="endDate"
            className="w-full"
            defaultValue={project.endDate.toISOString().slice(0, 10)}
            required
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

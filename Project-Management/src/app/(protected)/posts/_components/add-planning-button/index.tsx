"use client";
import FormInput from "@/components/form-input";
import { ButtonProps, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import {
  addPlanning,
  createOperationHistory,
  deletePlanning,
  getCommandProjects,
  getOperations,
  getOperations2,
  getOperators,
  getPlannings,
} from "../../_utils/actions";
import { FormSelect } from "@/components/form-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TAddPlanningInput,
  TExpertise,
  TPlanning,
  addPlanningSchema,
} from "../../_utils/schemas";
import { FieldErrors } from "@/actions/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  CalendarPlus2Icon,
  Ellipsis,
  MoveLeftIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { Table } from "@/components/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSWRConfig } from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

export interface AddEditPlanningButtonProps extends ButtonProps {
  postId: string;
  onClose: () => void;
  expertises: {
    operations: {
      name: string;
      id: string;
    }[];
    name: string;
    id: string;
  }[];
}

export interface AddEditPlanningFormProps {
  postId: string;
  planing?: TPlanning;

  operators: {
    name: string;
    id: string;
    image: string | null;
  }[];
  operationsInExpertises: string[];
  // operations: {
  //   name: string;
  //   id: string;
  // }[];
  plannings: TPlanning[];
  commandProjects: {
    project: { id: string; name: string };
    command: { id: string; reference: string };
    id: string;
  }[];
  expertises: string[];
  back: () => void;
}

export function AddEditPlanningForm({
  planing,
  postId,
  // operations,
  operationsInExpertises,
  operators,
  plannings,
  commandProjects,
  back,
}: AddEditPlanningFormProps) {
  // const { data, isLoading, error } = useSWR(
  //   `addPlanningData/${postId}`,
  //   async () => {
  //     const [operations] = await Promise.all([
  //       getOperations2({ operationsInExpertises }),
  //     ]);
  //     return { operations };
  //   },
  // );
  // const operations = data?.operations || [];
  const [operations, setOperations] = React.useState<TExpertise[]>([]);
  const [command_project_id, setCommandProjectId] = React.useState<string>("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getOperations2({
          operationsInExpertises,
          command_project_id,
        });

        setOperations(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [command_project_id, operationsInExpertises]);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TAddPlanningInput>
  >({});

  const { mutate } = useSWRConfig();
  const action = async (formData: FormData) => {
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const operatorId = formData.get("operatorId") as string;
    const operationId = formData.get("operationId") as string;
    // const commandProjectId = formData.get("commandProjectId") as string;
    if (endDate <= startDate) {
      toast.error("Invalid input");
      return;
    }
    const data: TAddPlanningInput = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      operatorId,
      operationId,
      commandProjectId: command_project_id,
      postId,
      planningId: planing?.id,
    };

    const parsed = addPlanningSchema.safeParse(data);
    if (!parsed.success) {
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TAddPlanningInput>,
      );
      toast.error("Invalid input");
      return;
    }

    // const { result, error, fieldErrors } = await addPlanning(parsed.data);
    // if (fieldErrors) setFieldErrors(fieldErrors);
    // if (error) {
    //   toast.error(error);
    //   return;
    // }
    // toast.success("Planning added successfully");
    // router.refresh();
    // handleClose();
    mutate(
      `addPlanningData/${postId}`,
      async () => {
        const { result, error } = await addPlanning(parsed.data);
        if (fieldErrors) setFieldErrors(fieldErrors);
        if (error) {
          toast.error(error);
          return {
            operators,
            operations,
            plannings,
            commandProjects,
          };
        }
        toast.success("Planning added successfully");
        back();
        if (result) createOperationHistory(result.id, 0);
        return {
          operators,
          operations,
          commandProjects,
          plannings: planing?.id
            ? plannings.map((p) => (p.id === planing.id ? result : p))
            : [...plannings, result],
        };
      },
      { revalidate: false },
    );
  };

  return (
    <form action={action}>
      <Label className="mt-4 inline-block">Command</Label>
      <Select
        required
        onValueChange={setCommandProjectId}
        value={command_project_id}
      >
        <SelectTrigger>
          <SelectValue
            className="w-full"
            placeholder="Select a Command project"
          />
        </SelectTrigger>
        <SelectContent>
          {commandProjects.map((op) => (
            <SelectItem key={op.id} value={op.id}>
              {op.command.reference}
              {" > "}
              {op.project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FormSelect
        name="operationId"
        placeholder="Select operation"
        label="Operation"
        className="mt-4"
        defaultValue={planing?.operation.id}
        errors={fieldErrors.operationId}
      >
        {operations.map((op) => (
          <SelectItem key={op.id} value={op.id}>
            {op.name}
          </SelectItem>
        ))}
      </FormSelect>
      <FormSelect
        name="operatorId"
        placeholder="Select operator"
        label="Operator"
        className="mt-4"
        defaultValue={planing?.operator.id}
        errors={fieldErrors.operatorId}
      >
        {operators.map((op) => (
          <SelectItem key={op.id} value={op.id}>
            {op.name}
          </SelectItem>
        ))}
      </FormSelect>
      <FormInput
        label="Start date"
        type="date"
        name="startDate"
        className="mt-4"
        defaultValue={
          planing?.startDate &&
          new Date(planing.startDate).toISOString().split("T")[0]
        }
        errors={fieldErrors.startDate}
      />
      <FormInput
        label="End date"
        type="date"
        name="endDate"
        className="mt-4"
        defaultValue={
          planing?.endDate &&
          new Date(planing.endDate).toISOString().split("T")[0]
        }
        errors={fieldErrors.endDate}
      />
      <div className="mt-8 flex justify-end gap-4 [&_*]:w-20     ">
        <Button variant="outline" type="button" onClick={back}>
          Cancel
        </Button>
        <Button>Save</Button>
      </div>
    </form>
  );
}

export function AddEditPlanningButton({
  postId,
  disabled,
  expertises,
  onClose,
  ...props
}: AddEditPlanningButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [view, setView] = React.useState<"view" | "write">("view");
  const [planingId, setPlaningId] = React.useState<string | null>(null);
  const { mutate } = useSWRConfig();
  const router = useRouter();
  let operationsInExpertises: string[] = [];
  expertises.map((e) =>
    e.operations.map((i) => operationsInExpertises.push(i.id)),
  );
  const operatorsInExperises: string[] = expertises.map((i) => i.id);
  const handleClose = () => {
    onClose();
    closeRef.current?.click();
    setView("view");
    setPlaningId(null);
    mutate("posts");
    router.refresh();
  };

  const { data, isLoading, error } = useSWR(
    `addPlanningData/${postId}`,
    async () => {
      const [operators, operations, plannings, commandProjects] =
        await Promise.all([
          getOperators({ operatorsInExperises }),
          getOperations({ operationsInExpertises }),
          getPlannings({ postId }),
          getCommandProjects(),
        ]);
      return { operators, operations, plannings, commandProjects };
    },
  );

  const handleDelete = async (id: string) => {
    mutate(
      `addPlanningData/${postId}`,
      async (data: any) => {
        await deletePlanning(id);
        return {
          ...data,
          plannings: data.plannings.filter((p: TPlanning) => p.id !== id),
        };
      },
      {
        revalidate: false,
        optimisticData: {
          operators: data?.operators,
          operations: data?.operations,
          plannings: data?.plannings.filter((p: TPlanning) => p.id !== id),
        },
      },
    );
  };

  const operators = data?.operators || [];
  const operations = data?.operations || [];
  const plannings = data?.plannings || [];
  const commandProjects = data?.commandProjects || [];
  const planning = plannings.find((p) => p.id === planingId);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogTrigger asChild>
        <Button {...props} disabled={disabled || isLoading || error} />
      </DialogTrigger>
      <DialogContent className="flex min-h-[30rem] flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {view === "write" && (
              <Button
                variant={"ghost"}
                onClick={() => {
                  setView("view");
                  setPlaningId(null);
                }}
              >
                <MoveLeftIcon size={16} />
              </Button>
            )}
            {view === "view" && (
              <div className="flex items-center gap-2">
                <span>Plannings for this post</span>
                <Button
                  className=""
                  variant="ghost"
                  onClick={() => setView("write")}
                >
                  <CalendarPlus2Icon size={20} />
                </Button>
              </div>
            )}
            {view === "write" && `${planning ? "Edit" : "Add"} planning`}
          </DialogTitle>
        </DialogHeader>
        {view === "view" ? (
          <div className="h-1 flex-1 overflow-auto rounded border">
            <Table className="w-full text-xs [&_td]:px-2 [&_th]:px-2">
              <thead>
                <tr>
                  <th className="w-[4rem]">Operator</th>
                  <th>Operation</th>
                  <th className="w-[7rem]">from</th>
                  <th className="w-[8rem]">to</th>
                </tr>
              </thead>
              <tbody>
                {plannings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <TooltipProvider delayDuration={50}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Avatar className="size-7 border-2 border-[#E6B3BA]">
                              <AvatarImage
                                src={item.operator.name || ""}
                                alt={item.operator.name}
                              />
                              <AvatarFallback className="font-bold">
                                {`${item.operator.name.charAt(0).toUpperCase()}`}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            {item.operator.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td>
                      <div className="max-w-[8rem] truncate">
                        {item.operation.name}{" "}
                      </div>
                    </td>
                    <td>
                      {new Date(item.startDate).toLocaleDateString("en-GB")}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>
                          {new Date(item.endDate).toLocaleDateString("en-GB")}
                        </span>
                        <Popover>
                          <PopoverTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                            >
                              <Ellipsis size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="flex w-fit flex-col gap-2">
                            <Button
                              className="justify-start gap-2 px-6 hover:text-sky-500"
                              variant="ghost"
                              onClick={() => {
                                setView("write");
                                setPlaningId(item.id);
                              }}
                            >
                              <PencilIcon size={16} />
                              <span>Edit</span>
                            </Button>
                            <Button
                              className="justify-start gap-2 px-6 hover:text-red-500"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                            >
                              <TrashIcon size={16} />
                              <span>Delete</span>
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                  </tr>
                ))}
                {plannings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="">
                      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-2xl">
                        <div className="text-gray-500">No plannings found</div>
                        <Button
                          className="gap-2"
                          variant="outline"
                          size="lg"
                          onClick={() => setView("write")}
                        >
                          <CalendarPlus2Icon size={20} />
                          <span>Add new </span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        ) : (
          <AddEditPlanningForm
            // operations={operations}
            operationsInExpertises={operationsInExpertises}
            operators={operators}
            postId={postId}
            planing={planning}
            plannings={plannings}
            commandProjects={commandProjects}
            expertises={[]}
            back={() => {
              setView("view");
              setPlaningId(null);
            }}
          />
        )}
      </DialogContent>
      <DialogClose ref={closeRef} />
    </Dialog>
  );
}

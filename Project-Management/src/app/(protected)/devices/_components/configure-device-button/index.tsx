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
import React, { useEffect, useMemo } from "react";
import { FieldErrors } from "@/actions/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormInput from "@/components/form-input";
import {
  TCreateInput,
  TData,
  TdeviceConfigInput,
  createInputSchema,
  deviceConfigInputSchema,
} from "../../_utils/schemas";
import useSWR from "swr";
import { Label } from "@/components/ui/label";
import { configure, getPosts } from "../../_utils/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AddEditPlanningButton } from "@/app/(protected)/posts/_components/add-planning-button";
import { FormSelect } from "@/components/form-select";
import { format } from "date-fns";
type TDevice = {
  planning: {
    commandProject: { id: string; project: { name: string } };
    startDate: Date;
    endDate: Date;
    operation: {
      id: string;
      name: string;
    };
    operator: {
      id: string;
      name: string;
      image: string | null;
    };
  } | null;
  deviceId: string;
  post: any | null;
  count: number;
  id: string;
  createdAt: Date;
};
export interface ConfigureDeviceButtonProps extends ButtonProps {
  devices: TData;
}

export function ConfigureDeviceButton({
  devices,
  ...props
}: ConfigureDeviceButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const { data } = useSWR(`posts`, getPosts);
  const posts = useMemo(() => data || [], [data]);

  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInput>
  >({});
  const [deviceToConfigure, setDeviceToConfigure] = React.useState<
    any | TDevice
  >();
  const [post, setPost] = React.useState<any | undefined>();

  useEffect(() => {
    if (deviceToConfigure) setPost(deviceToConfigure?.post || undefined);
  }, [deviceToConfigure]);

  function handleNewPlanning() {
    setPost((post: any) => {
      if (post)
        return {
          ...post,
          id: "",
        };
    });
  }
  const router = useRouter();

  const handleClose = () => {
    setFieldErrors({});
    closeRef.current?.click();
  };

  const handleSubmit = async (formData: FormData) => {
    const deviceId = formData.get("deviceId") as string;
    const count = formData.get("count") as string;
    const planningId = formData.get("planningId") as string;
    console.log("planningId", planningId);

    const data: TdeviceConfigInput = {
      id: deviceToConfigure?.id || "",
      deviceId,
      postId: post?.id || "",
      count: +count,
      planningId: planningId,
    };

    const parsed = deviceConfigInputSchema.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TCreateInput>,
      );
      return;
    }

    const { result, error, fieldErrors } = await configure(data);

    if (error) toast.error(error);

    if (fieldErrors) setFieldErrors(fieldErrors);

    if (result) {
      handleClose();
      toast.success("Device configured successfully");
      router.refresh();
    }
  };
  function handlePostChange(id: string) {
    const p = posts?.filter((item) => item.id === id)[0];
    setPost(p);
  }
  function handleDeviceChange(id: string) {
    const p = devices?.filter((item) => item.id === id)[0];
    setDeviceToConfigure(p);
  }
  return (
    <Sheet onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button {...props} />
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            <span>Device configuration</span>
          </SheetTitle>
        </SheetHeader>
        <form
          action={handleSubmit}
          className="flex flex-1 flex-col gap-2 py-4 "
        >
          <Label className="mt-4 inline-block">Devices</Label>
          <Select
            onValueChange={(id) => handleDeviceChange(id)}
            value={deviceToConfigure?.id}
          >
            <SelectTrigger>
              <SelectValue className="w-full" placeholder="Select a post" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.deviceId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormInput
            name="deviceId"
            label="Device ID *"
            className="mt-4"
            required
            defaultValue={deviceToConfigure?.deviceId}
            errors={fieldErrors.deviceId}
          />
          <Label className="mt-4 inline-block">Post</Label>
          <Select onValueChange={(id) => handlePostChange(id)} value={post?.id}>
            <SelectTrigger>
              <SelectValue className="w-full" placeholder="Select a post" />
            </SelectTrigger>
            <SelectContent>
              {posts.map((post) => (
                <SelectItem key={post.id} value={post.id}>
                  {post.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {post?.id && (
            <>
              {" "}
              <FormSelect
                name="planningId"
                placeholder="Select planning"
                label="Planning"
                className="mt-4"
                // errors={fieldErrors.operationId}
              >
                {post.plannings.map((op: any) => (
                  <SelectItem key={op.id} value={op.id} className="text-xs">
                    {op.operation.name} from{" "}
                    {format(new Date(op.startDate), "PP")} to{" "}
                    {format(new Date(op.endDate), "PP")}
                  </SelectItem>
                ))}
              </FormSelect>
              <AddEditPlanningButton
                postId={post?.id || ""}
                className=" mt-4 flex w-full gap-2 rounded-sm p-0 text-sm font-medium"
                variant={"outline"}
                size={"icon"}
                expertises={post?.expertises || []}
                onClose={handleNewPlanning}
              >
                <PlusIcon size={18} />
                <span>Add new planning</span>
              </AddEditPlanningButton>
            </>
          )}
          <Label className="mt-4 inline-block">Value</Label>
          <Input
            type="number"
            name="count"
            className="w-full"
            defaultValue={deviceToConfigure?.count}
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

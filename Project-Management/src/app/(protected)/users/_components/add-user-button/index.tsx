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
import { create, getExpertises } from "../../_utils/actions";
import useSWR from "swr";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormErrors from "@/components/form-errors";
import { MultiSelect } from "@/components/multi-select";
import { Input } from "@/components/ui/input";
import { Role } from "@prisma/client";
import { roles } from "@/utils/constants";
import { getServerSession } from "@/lib/auth";

export interface AddUserButtonProps extends ButtonProps {}

export function AddUserButton(props: AddUserButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInput>
  >({});
  const [role, setRole] = React.useState<Role>("USER");
  const [selectedExpertise, setSelectedExpertise] = React.useState<
    { name: string; id: string }[]
  >([]);
  const router = useRouter();

  const { data, isLoading, error } = useSWR("addUserData", async () => {
    const [expertise] = await Promise.all([getExpertises()]);
    return { expertise };
  });

  const expertise = data?.expertise || [];

  const handleClose = () => {
    setFieldErrors({});
    setRole("USER");
    closeRef.current?.click();
  };
  const availableRoles = roles.filter((role) => role !== "SYS_ADMIN");
  const handleSubmit = async (formData: FormData) => {
    const session = await getServerSession();
    if (!session || !["SYS_ADMIN", "ADMIN"].includes(session.user.role)) {
      toast.error("Insufficient permissions");
      return;
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const data: TCreateInput = {
      name,
      email,
      password,
      expertise:
        role === "OPERATOR" ? selectedExpertise.map((e) => e.id) : undefined,
      role,
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
      toast.success("User added successfully");
      router.refresh();
    }
  };

  return (
    <Sheet onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button {...props} />
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-auto">
        <SheetHeader>
          <SheetTitle>Add User</SheetTitle>
          <SheetDescription>
            Fill the form below to add a new user
          </SheetDescription>
        </SheetHeader>
        <form
          action={handleSubmit}
          className="flex flex-1 flex-col gap-2 py-4 "
        >
          <Label className="space-x-2">
            <span>Image</span>
            <span className="text-xs opacity-60">{"(Optional)"}</span>
          </Label>
          <Input type="file" name="file" accept="image/*" />
          <FormInput
            name="name"
            label="Name"
            className="mt-4"
            required
            errors={fieldErrors.name}
          />
          <FormInput
            name="email"
            label="Email"
            required
            errors={fieldErrors.email}
          />
          <FormInput
            name="password"
            label="Password"
            type="password"
            required
            errors={fieldErrors.password}
          />

          <Label className="mt-4 inline-block">Role </Label>
          <Select value={role} onValueChange={(val) => setRole(val as Role)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormErrors errors={fieldErrors.role} />
          {!isLoading && !error && role === "OPERATOR" && (
            <>
              <Label className="mt-4 inline-block">Expertise </Label>
              <MultiSelect
                options={expertise}
                value={selectedExpertise}
                onValueChange={setSelectedExpertise}
                optionRenderer={(option) => option.name}
                valueRenderer={(option) => option.name}
              />
              <FormErrors errors={fieldErrors.expertise} />
            </>
          )}
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
              Save User
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

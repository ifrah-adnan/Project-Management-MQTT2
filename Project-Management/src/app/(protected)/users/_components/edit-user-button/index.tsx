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
import { ArrowLeftIcon, EditIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import React from "react";
import { FieldErrors } from "@/actions/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormInput from "@/components/form-input";
import {
  TCreateInput,
  TData2,
  TUpdateInput,
  updateInputSchema,
} from "../../_utils/schemas";
import { update, getExpertises } from "../../_utils/actions";
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
import { useState } from "react";

export interface EditUserButtonProps extends ButtonProps {
  userData: {
    email?: string;
    name?: string;
    password?: string;
    expertises?: {
      name?: string;
      id?: string;
    }[];
    id?: string;
    image?: string | null;
    role?: Role;
  };
}

export function EditUserButton({ userData, ...props }: EditUserButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateInput>
  >({});
  const [role, setRole] = React.useState(userData.role);
  const [selectedExpertise, setSelectedExpertise] = React.useState(
    userData.expertises || [],
  );
  const [password, setPassword] = React.useState("");
  const [isPasswordEditable, setPasswordEditable] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const handleResetPassword = () => {
    setPassword("");
    setPasswordEditable(true);
  };

  const router = useRouter();

  const { data, isLoading, error } = useSWR("editUserData", async () => {
    const [expertise] = await Promise.all([getExpertises()]);
    return { expertise };
  });

  const expertise = data?.expertise || [];

  const handleClose = () => {
    setFieldErrors({});
    closeRef.current?.click();
  };
  const availableRoles = roles.filter((role) => role !== "SYS_ADMIN");
  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const data: any = {
      userId: userData.id!,
      name,
      email,
      role,
    };

    if (isPasswordEditable) {
      data.password = password;
    }

    if (role === "OPERATOR") {
      data.expertise = selectedExpertise.map((e) => e.id);
    }

    const parsed = updateInputSchema.safeParse(data);

    if (!parsed.success) {
      toast.error("Invalid input");
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TUpdateInput>,
      );
      return;
    }

    try {
      const { result, error, fieldErrors } = await update(parsed.data);

      if (error) {
        toast.error(error);
      } else if (fieldErrors) {
        setFieldErrors(fieldErrors);
      } else if (result) {
        handleClose();
        toast.success("User updated successfully");
        router.refresh();
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsPasswordChanged(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Sheet onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button {...props}>
          <EditIcon size={18} />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-auto">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Edit the form below to update user details
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleSubmit(formData);
          }}
          className="flex flex-1 flex-col gap-2 py-4"
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
            defaultValue={userData.name}
            required
            errors={fieldErrors.name}
          />
          <FormInput
            name="email"
            label="Email"
            defaultValue={userData.email}
            required
            errors={fieldErrors.email}
          />
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password to change"
                value={password}
                onChange={handlePasswordChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          <Button type="button" onClick={handleResetPassword}>
            Reset Password
          </Button>

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
              Save
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

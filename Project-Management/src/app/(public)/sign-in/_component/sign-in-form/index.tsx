"use client";

import { useState } from "react";
import { signIn } from "@/actions/sign-in";
import { TInput } from "@/actions/sign-up/schema";
import { toast } from "sonner";
import { FieldErrors } from "@/actions/utils";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/form-input";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<TInput>>({});
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const { result, error, fieldErrors } = await signIn({
        email,
        password,
      });
      if (error) {
        toast.error(error);
      }
      if (fieldErrors) {
        toast.error("Please check your input");
        setFieldErrors(fieldErrors);
      }
      if (result) {
        toast.success("Signed In");
        if (result.role === "SYS_ADMIN") {
          router.push("/organizations");
        } else router.push("/projects");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  return (
    <form
      action={handleSubmit}
      className="flex w-full flex-col gap-4 [&>form-input]:grid "
    >
      <FormInput
        label="Email"
        type="email"
        name="email"
        errors={fieldErrors.email}
      />
      <FormInput
        label="Password"
        name="password"
        type="password"
        errors={fieldErrors.password}
      />
      <Button type="submit" className="mt-4">
        Sign In
      </Button>
    </form>
  );
}

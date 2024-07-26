import React from "react";
import SignUpForm from "./_component/sign-up-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/logo";
export default function SignUp() {
  return (
    <div className="bg-background flex h-full items-center justify-center p-6 ">
      <Card
        className="flex w-full max-w-sm flex-col gap-4 p-4 sm:p-6 md:p-8 
       bg-card  items-center"
      >
        <Logo className="w-[10rem] h-[4rem]  fill-primary" />
        <SignUpForm />
        <Button
          asChild
          className="mt-2 border border-gray-50 w-full"
          size="sm"
          variant="ghost"
        >
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </Card>
    </div>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import React from "react";

export default function List() {
  return (
    <main className="overflow-auto p-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="h-[4rem]"></Card>
        <Card className="h-[4rem]"></Card>
        <Card className="h-[4rem]"></Card>
        <Card className="h-[4rem]"></Card>
        <Card className="col-span-2 h-[19rem]"></Card>
        <Card className="h-[19rem]"></Card>
        <Card className="h-[19rem]"></Card>
        <Card className="col-span-full h-[19rem]"></Card>
      </div>
    </main>
  );
}

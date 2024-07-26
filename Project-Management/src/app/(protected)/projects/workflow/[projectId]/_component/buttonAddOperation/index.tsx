"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Clock1, MousePointer, PlusIcon, ShieldPlus } from "lucide-react";
import React, { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "@/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useStore } from "../../store";
import { NodeTypes } from "@/utils/types";
import icons from "../icons";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import SelectOperation from "./selectOperation";
import { createOperation } from "../../../_utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuid } from "uuid";
const views = [
  {
    value: "create",
    label: "create operation",
    icon: <ShieldPlus size={16} />,
  },
  {
    value: "select",
    label: "select operation",
    icon: <MousePointer size={16} />,
  },
];
const formSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  estimatedTime: z
    .string()
    .regex(/^([0-9]+h)?([0-9]+min)?$/, "Invalid time format"),
  isFinal: z.boolean().optional().default(false),
  code: z.string().min(3).default(""),
});

const randomicons = (arr: Array<keyof typeof icons>, nbr: number) => {
  const result = new Array(nbr).fill(0).map(() => {
    return arr[Math.floor(Math.random() * arr.length)];
  });
  return result;
};

function ButtonAddOperation() {
  const [open, setOpen] = React.useState(false);
  const { setNodes, nodes } = useStore();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      estimatedTime: "0h0min",
      isFinal: false,
      code: "",
    },
  });
  const [view, setView] = React.useState("create");
  const toggle = (value: string) => {
    setView(value);
  };

  const [dataIcons, setDataIcons] = React.useState<Array<keyof typeof icons>>(
    [],
  );
  const [isPanding, startTransition] = useTransition();
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (data.isFinal) {
        const finalNode = nodes.find((node) => node.data.isFinal);
        if (finalNode) {
          toast.error("You can't have more than one final node");
          return;
        }
      }

      startTransition(async () => {
        try {
          const id = uuid();
          const res = await createOperation({
            ...data,
            id,
          });
          setNodes([
            ...nodes,
            {
              id,
              type: "customNode",
              data: {
                name: data.name,
                operationId: res.id,
                description: data.description,
                icon: data.icon,
                estimatedTime: data.estimatedTime,
                isFinal: data.isFinal,
                code: data.code,
              },
              position: { x: 750, y: 250 },
            } as NodeTypes,
          ]);
          setOpen(false);
          form.reset();
        } catch (e) {
          console.log(e);
          toast.error("An error occurred");
        }
      });
    } catch (e) {
      console.log(e);
      toast.error("An error occurred");
    }
  };

  useEffect(() => {
    const dataIcons = randomicons(
      Object.keys(icons).filter(
        (key) => !key.startsWith("Lucide") || !key.endsWith("Icon"),
      ) as Array<keyof typeof icons>,
      100,
    );
    setDataIcons(dataIcons);
  }, []);

  const handClose = () => {
    form.reset();
    setOpen((prev) => !prev);
  };

  return (
    <Dialog onOpenChange={handClose} open={open}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-card "
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <PlusIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="scroll_gutter_fixed flex h-[90%] max-h-[45rem]  max-w-[30rem] flex-col">
        <div className="flex w-full items-center">
          {views.map((v) => (
            <button
              className={cn(
                "flex flex-1 items-center gap-2 border-b-2 px-4 py-2 font-medium capitalize transition-colors",
                {
                  "border-transparent opacity-50 hover:opacity-75":
                    view !== v.value,
                  " border-[#FA993A]": view === v.value,
                },
              )}
              key={v.value}
              onClick={() => toggle(v.value)}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          ))}
        </div>
        {view === "create" ? (
          <ScrollArea
            className="h-full px-4"
            scrollareathumbclassName="w-4 bg-[#FA993A]"
            scrollbarclassName="w-2 "
          >
            <div className="flex h-1 w-full flex-1 shrink-0 flex-col gap-2">
              <h2>Add new operation?</h2>
              <Card
                variant="outline"
                className="flex items-center gap-4 border-[#D2D3D6] border-[2]"
              >
                <Button variant="outline" type="button" className="size-12">
                  {form?.watch("icon") &&
                    typeof form?.watch("icon") === "string" &&
                    React.createElement(
                      icons?.[
                        form?.watch("icon") as keyof typeof icons
                      ] as React.ComponentType<{
                        size: number;
                      }>,
                      { size: 20 },
                    )}
                </Button>
                <div className="text-md flex w-[90%] flex-col gap-1 truncate ">
                  {form?.watch("name") || <div>{"Operation name"}</div>}

                  <div className="flex items-center gap-1 text-sm text-[#AAAAAA]">
                    <Clock1 size={15} />
                    <span className="">
                      {"time estimate: "}
                      {form?.watch("estimatedTime") || <span>{"0h00min"}</span>}
                    </span>
                  </div>
                </div>
              </Card>
              <div className="mb-2 h-[1px] w-full bg-[#AAAAAA]/40"></div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel className="text-[#AAAAAA]">
                          Operation name
                        </FormLabel>
                        <FormControl>
                          <input
                            placeholder="name"
                            {...field}
                            className="rounded-md border border-[#AAAAAA]/50 p-2 outline-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel className="text-[#AAAAAA]">Code</FormLabel>
                        <FormControl>
                          <input
                            placeholder="code"
                            {...field}
                            className="rounded-md border border-[#AAAAAA]/50 p-2 outline-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel className="text-[#AAAAAA]">
                          Time estimated
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 rounded-md border border-[#AAAAAA]/50 p-2  ">
                            <Clock1 size={15} className="text-[#AAAAAA]" />
                            <input
                              placeholder="timeEstimate"
                              {...field}
                              className="outline-none"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-2 ">
                    <span className="text-[#AAAAAA]">Icon</span>
                    <div className=" w-full  rounded-md border border-[#AAAAAA]/50 p-2 ">
                      <div className="flex h-[8rem] max-w-full  flex-wrap gap-1 overflow-y-auto">
                        {dataIcons.map((icon, index) => (
                          <Button
                            type="button"
                            key={index}
                            variant="ghost"
                            className={cn("size-8 p-1 hover:bg-[#FA993A]/30 ", {
                              "bg-[#FA993A] hover:bg-[#FA993A]":
                                form.watch("icon") === icon,
                            })}
                            onClick={(e) => {
                              form.setValue("icon", icon as string);
                            }}
                          >
                            {React.createElement(
                              icons?.[icon] as React.ComponentType<{
                                size: number;
                              }>,
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel className="text-[#AAAAAA]">
                          Description
                        </FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="description"
                            {...field}
                            className="h-[4rem] resize-none rounded-md border border-[#AAAAAA]/50 p-2 outline-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFinal"
                    render={({ field }) => (
                      <FormItem className="flex items-end gap-2">
                        <FormControl>
                          <Checkbox
                            {...field}
                            value={form.watch("isFinal") ? "true" : "false"}
                            className="border border-[#AAAAAA]/50  data-[state=checked]:bg-[#FA993A] "
                            onCheckedChange={(e: boolean) => {
                              form.setValue("isFinal", e);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-[#AAAAAA]">
                          Is final?
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between gap-4 pb-2">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="#FA993A"
                      className="bg-[#FA993A] hover:bg-[#FA993A]/40"
                    >
                      Add Operation
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
        ) : (
          <SelectOperation setOpen={setOpen} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ButtonAddOperation;

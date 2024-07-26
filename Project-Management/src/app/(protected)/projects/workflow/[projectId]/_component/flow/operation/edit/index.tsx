import Card from "@/components/card";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Clock1 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useStore } from "../../../../store";
import icons from "../../../icons";
import { updateOperation } from "@/app/(protected)/projects/workflow/_utils";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  // 1h45min example
  estimatedTime: z
    .string()
    .regex(/^([0-9]+h)?([0-9]+min)?$/, "Invalid time format"),
});

function EditOperation() {
  const { setNodes, nodes, nodeSelected, setNodeSelected } = useStore();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: nodeSelected?.data?.name || "",
      description: nodeSelected?.data?.description || "",
      icon: nodeSelected?.data?.icon || "",
      estimatedTime: nodeSelected?.data?.estimatedTime || "0h0min",
      operationId: nodeSelected?.data?.operationId,
    },
  });
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        await updateOperation({
          id: nodeSelected?.data?.operationId,
          ...data,
        });
        setNodes(
          nodes.map((node) => {
            if (node.id === nodeSelected?.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...data,
                },
              };
            }
            return node;
          }),
        );
        setNodeSelected(null);
      } catch (err) {
        toast.error("Error updating operation");
      }
    });
  };
  return (
    <Card className="z-99 absolute inset-y-4 right-4 flex w-full max-w-80 !cursor-pointer flex-col gap-2 overflow-y-auto bg-white ">
      <div className="flex h-1  w-full flex-1  flex-col gap-2">
        <h2>Add new operation?</h2>
        <Card
          variant="outline"
          className="flex items-center gap-4 border-[#D2D3D6] border-[2] p-2 "
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
            <span>
              {form?.watch("name") ? (form?.watch("name") as string) : "name"}
            </span>

            <div className="flex items-center gap-1 text-sm text-[#AAAAAA]">
              <Clock1 size={15} />
              <span className="">
                {"time estimate: "}
                <span></span>
                {form?.watch("estimatedTime")
                  ? (form?.watch("estimatedTime") as string)
                  : "0h00min"}
              </span>
            </div>
          </div>
        </Card>
        <div className="mb-2 h-[1px] w-full bg-[#AAAAAA]/40"></div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-1  flex-1 flex-col justify-between  space-y-4  "
          >
            <div className="flex flex-col gap-4 ">
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
                        value={field.value as string}
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
                          value={field.value as string}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-auto flex items-center justify-between gap-4  [&>*]:flex-1">
              <Button
                variant="outline"
                className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                type="button"
                onClick={() => {
                  form.reset();
                  setNodeSelected(null);
                }}
              >
                Cancel
              </Button>
              <Button>Save changed</Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}

export default EditOperation;

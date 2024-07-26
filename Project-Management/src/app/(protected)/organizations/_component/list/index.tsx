"use client";
import { Table } from "@/components/table";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import {
  AddAdminToOrganization,
  TData,
  deleteOrganization,
  getOrganizations,
} from "../../_utils/action";
import { useSession } from "@/components/session-provider";
import ParamsPagination from "@/components/params-pagination";
import {
  Copy,
  Ellipsis,
  PencilIcon,
  PlusCircle,
  Trash2Icon,
} from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { EditExpertiseButton } from "@/app/(protected)/expertise/_components/edit-expertise-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EditOrganizationButton } from "../edit-organization-button";
import { create, deleteById } from "@/app/(protected)/users/_utils/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormInput from "@/components/form-input";
import { toast } from "sonner";
import { ViewAllAdminsDialog } from "../View-all-Admin";
import { TCreateAdmin, createAdminOrganization } from "../../_utils/schema";
import { FieldErrors } from "@/actions/utils";

export default function ListO({ data, total }: { data: TData; total: number }) {
  const { session } = useSession();
  const user = session?.user;
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    FieldErrors<TCreateAdmin>
  >({});
  const handleClose = () => {
    closeRef.current?.click();
  };
  const handleAddAdmin = async (formData: FormData) => {
    const data = {
      adminName: formData.get("adminName") as string,
      adminEmail: formData.get("adminEmail") as string,
      adminPassword: formData.get("adminPassword") as string,
      organizationId: formData.get("organizationId") as string,
    };
    const parsed = createAdminOrganization.safeParse(data);

    if (!parsed.success) {
      setFieldErrors(
        parsed.error.flatten().fieldErrors as FieldErrors<TCreateAdmin>,
      );
      return;
    }
    try {
      await AddAdminToOrganization(data);
      toast.success("Organization and admin created successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating organization and admin:", error);
      toast.error("An unexpected error occurred");
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <main className="p-6">
      <div className="h-1 flex-1 p-6">
        <Card className="mx-auto flex h-full w-full max-w-screen-2xl flex-1 flex-col overflow-auto bg-white p-4 text-black dark:bg-gray-800 dark:text-white">
          {" "}
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Admin</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {item.users.length >= 1 && (
                        <ViewAllAdminsDialog
                          admins={item.users}
                          organizationName={item.name}
                        />
                      )}{" "}
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <PlusCircle className="h-5 w-5 text-blue-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Add new Admin for this organization {item.name}
                            </DialogTitle>
                            <DialogDescription>
                              Enter the email of the user you want to add as an
                              admin.
                            </DialogDescription>
                          </DialogHeader>
                          <form action={handleAddAdmin}>
                            <div className="grid gap-4 py-4">
                              <input
                                type="hidden"
                                name="organizationId"
                                value={item.id}
                              />

                              <div className="flex flex-1 flex-col gap-2 py-4 ">
                                <FormInput
                                  name="adminName"
                                  label="Admin Name *"
                                  className="mt-4"
                                  required
                                  errors={fieldErrors.adminName}
                                />
                                <FormInput
                                  name="adminEmail"
                                  label="Admin Email *"
                                  type="email"
                                  className="mt-4"
                                  required
                                  errors={fieldErrors.adminEmail}
                                />
                                <FormInput
                                  name="adminPassword"
                                  label="Admin Password *"
                                  type="password"
                                  className="mt-4"
                                  required
                                  errors={fieldErrors.adminPassword}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit">Add Admin</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>

                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <Popover>
                    <PopoverTrigger>
                      <Ellipsis size={16} />
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="flex w-fit flex-col gap-2"
                    >
                      <EditOrganizationButton
                        organization={{
                          ...item,
                          description: item.description ?? "",
                        }}
                        variant="default"
                        className="justify-start gap-2 bg-none px-6 hover:text-sky-500 "
                      >
                        <PencilIcon size={16} />
                        <span>Edit</span>
                      </EditOrganizationButton>
                      <ConfirmButton
                        variant="ghost"
                        size="icon"
                        className="flex w-full justify-start gap-2 rounded-md px-6 hover:text-red-500"
                        action={async () => {
                          await deleteOrganization(item.id);
                          await deleteById(item.users[0].id);
                        }}
                      >
                        <Trash2Icon size={18} />
                        <span>Delete{item.users[0].id}</span>
                      </ConfirmButton>
                    </PopoverContent>
                  </Popover>
                </tr>
              ))}
            </tbody>
          </Table>
          {data.length === 0 && (
            <div className="grid flex-1 place-content-center">
              <span className=" text-center text-3xl font-semibold opacity-50">
                No Data
              </span>
            </div>
          )}
        </Card>
        <div className="mt-auto flex justify-end px-4 pb-4 pt-1">
          {data.length}
          <ParamsPagination total={data.length} />
        </div>
      </div>
    </main>
  );
}

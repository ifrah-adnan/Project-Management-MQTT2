"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Calendar,
  Building,
  Trash2Icon,
  PencilIcon,
  Search,
  PlusCircle,
  Map,
  ChevronDown,
} from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { EditOrganizationButton } from "@/app/(protected)/organizations/_component/edit-organization-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AddAdminToOrganization,
  deleteOrganization,
} from "@/app/(protected)/organizations/_utils/action";
import { deleteById } from "../../_utils/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormInput from "@/components/form-input";
import {
  TCreateAdmin,
  createAdminOrganization,
} from "@/app/(protected)/organizations/_utils/schema";
import { FieldErrors } from "@/actions/utils";
import { toast } from "sonner";
import { ViewAllAdminsDialog } from "@/app/(protected)/organizations/_component/View-all-Admin";
import ParamsPagination from "@/components/params-pagination";
import { setOrganizationId } from "@/lib/auth";
import Image from "next/image";
import MapDialog from "../map-dialog/MapDialog";
import DetailsDialog from "../DetailsOrganization";
import { motion } from "framer-motion";

type TData = {
  id: any;
  name: string;
  description: any;
  createdAt: Date;
  imagePath: string | null;
  address: string | null;
  users: {
    id: string;
    name: string;
    email: string;
  }[];
};

export function AdminComponent({
  data,
  total,
}: {
  data: TData[];
  total: number;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<TCreateAdmin>>({});
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const [detailsDialog, setDetailsDialog] = useState<{
    isOpen: boolean;
    orgId: string | null;
  }>({ isOpen: false, orgId: null });
  const router = useRouter();

  const openDialog = (orgId: string) => {
    setOpenDialogs((prev) => ({ ...prev, [orgId]: true }));
  };

  const closeDialog = (orgId: string) => {
    setOpenDialogs((prev) => ({ ...prev, [orgId]: false }));
  };
  const handleAddAdmin = async (formData: FormData, orgId: string) => {
    const data = {
      adminName: formData.get("adminName") as string,
      adminEmail: formData.get("adminEmail") as string,
      adminPassword: formData.get("adminPassword") as string,
      organizationId: orgId,
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
      closeDialog(orgId);
    } catch (error) {
      console.error("Error creating organization and admin:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleViewDetails = (id: string) => async () => {
    setDetailsDialog({ isOpen: true, orgId: id });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredData = data.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-1 flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-6">
        <div className="relative mx-auto max-w-md">
          <Input
            type="text"
            placeholder="Search organizations..."
            className="w-full rounded-full border-2 border-gray-300 py-3 pl-12 pr-4 transition-all duration-300 ease-in-out focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 transform text-gray-400"
            size={20}
          />
        </div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {filteredData.map((org, index) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-blue-400 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {org.imagePath ? (
                        <Image
                          src={org.imagePath}
                          alt={`${org.name} logo`}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500"
                          height={48}
                          width={48}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          <Building size={24} className="text-blue-600" />
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {org.name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      {org.address && (
                        <MapDialog
                          address={org.address}
                          organizationName={org.name}
                        />
                      )}
                      {org.users.length >= 1 && (
                        <ViewAllAdminsDialog
                          admins={org.users}
                          organizationName={org.name}
                        />
                      )}
                      <Dialog
                        open={openDialogs[org.id] || false}
                        onOpenChange={(open) =>
                          open ? openDialog(org.id) : closeDialog(org.id)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                          >
                            <PlusCircle className="h-5 w-5 text-blue-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              Add new Admin for {org.name}
                            </DialogTitle>
                            <DialogDescription>
                              Enter the details of the new admin.
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              await handleAddAdmin(formData, org.id);
                            }}
                          >
                            <div className="grid gap-4 py-4">
                              <input
                                type="hidden"
                                name="organizationId"
                                value={org.id}
                              />
                              <FormInput
                                name="adminName"
                                label="Admin Name"
                                required
                              />
                              <FormInput
                                name="adminEmail"
                                label="Admin Email"
                                type="email"
                                required
                              />
                              <FormInput
                                name="adminPassword"
                                label="Admin Password"
                                type="password"
                                required
                              />
                            </div>
                            <DialogFooter>
                              <Button type="submit">Add Admin</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    {org.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={18} />
                    <span>
                      Created on {new Date(org.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                  <Button
                    onClick={handleViewDetails(org.id)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    View Details
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        Manage
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48">
                      <div className="flex flex-col space-y-2">
                        <EditOrganizationButton
                          organization={org}
                          variant="ghost"
                          className="justify-start text-left text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <PencilIcon size={16} className="mr-2" />
                          <span>Edit</span>
                        </EditOrganizationButton>
                        <ConfirmButton
                          variant="ghost"
                          className="justify-start text-left text-gray-700 hover:bg-gray-100 hover:text-red-600 dark:text-gray-200 dark:hover:bg-gray-700"
                          action={async () => {
                            await deleteOrganization(org.id);
                            await deleteById(org.users[0].id);
                          }}
                        >
                          <Trash2Icon size={16} className="mr-2" />
                          <span>Delete</span>
                        </ConfirmButton>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="mt-8 flex justify-end px-4">
        <ParamsPagination total={total} />
      </div>
      <DetailsDialog
        isOpen={detailsDialog.isOpen}
        onClose={() => setDetailsDialog({ isOpen: false, orgId: null })}
        orgId={detailsDialog.orgId ?? ""}
      />
    </div>
  );
}

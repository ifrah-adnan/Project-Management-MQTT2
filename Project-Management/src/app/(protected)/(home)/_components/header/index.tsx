"use client";

import { useSession } from "@/components/session-provider";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ListFilterIcon,
  RefreshCcwIcon,
  SearchIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Collapsible from "@/components/collapsible";
import { projectsStatus } from "@/utils";
import { useStore } from "../store";
import { cn } from "@/lib/utils";
import { Status } from "@prisma/client";
import { statusMap } from "@/app/(protected)/_components/status-map";

export default function DashboardHeader() {
  const { session } = useSession();
  const { user } = session;
  console.log(user);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [showFilters, setShowFilters] = React.useState(false);
  const { filters, resetFilters, setFilters } = useStore();

  const setName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, name: e.target.value });
  };

  const setStatus = (status: string) => {
    setFilters({ ...filters, status });
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  const isToday = date && date.toDateString() === new Date().toDateString();

  return (
    <div className="flex flex-col ">
      <div className="flex items-center justify-end">
        <div className="mr-auto flex flex-col">
          <div className="text-balance font-medium">Dashboard</div>
          <div className="">Welcome back, {user.name.split(" ")[0]}! 🖐</div>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={resetFilters}>
                <RefreshCcwIcon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="border-none bg-white ">
              <p>Reset filters</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleFilters}>
                <ListFilterIcon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="border-none  bg-white ">
              <p>{showFilters ? "Hide" : "Show"} filters</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Popover>
          <PopoverTrigger asChild>
            <Button className="ml-2 flex items-center gap-2  uppercase">
              <CalendarIcon size={18} />
              {isToday && <span className="hidden md:inline-block">today</span>}
              <span>{format(date || new Date(), "MMM dd, yyyy")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit max-w-screen-md p-0 " align="end">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </div>
      <Collapsible open={showFilters} className="">
        <div className="flex flex-wrap gap-8 bg-primary  pb-2 pt-4">
          <div className="flex items-center gap-2 border-b-2 border-black/10 has-[:focus]:border-primary ">
            <input
              type="text"
              placeholder="Project name"
              value={filters.name}
              onChange={setName}
              className="border-none! peer w-44 bg-transparent outline-none"
            />
            <SearchIcon
              size={18}
              className="text-foreground/50 peer-focus:text-primary"
            />
          </div>
          <div className="flex rounded-lg bg-white/25 ">
            {["ALL", ...projectsStatus].map((status) => (
              <button
                key={status}
                className={cn("relative px-2 py-2 transition-colors ", {
                  "hover:text-foreground/50": filters.status !== status,
                })}
                onClick={() => setStatus(status)}
              >
                <div className="relative z-10 text-sm">
                  {statusMap[status as Status] || status}
                </div>
                {filters.status === status && (
                  <motion.div
                    layoutId="selectedStatus"
                    className="absolute inset-1 rounded  bg-white "
                  ></motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Collapsible>
    </div>
  );
}

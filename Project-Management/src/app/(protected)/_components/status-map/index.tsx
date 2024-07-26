import { Status } from "@prisma/client";
import {
  CircleCheckBigIcon,
  CircleDashedIcon,
  CirclePauseIcon,
  CircleSlashIcon,
} from "lucide-react";

export const statusMap: Record<Status, React.ReactNode> = {
  ACTIVE: (
    <div className="flex items-center gap-1 whitespace-nowrap text-xs font-medium uppercase text-blue-500 ">
      <CircleDashedIcon size={16} />
      <span>Active</span>
    </div>
  ),
  ON_HOLD: (
    <div className="flex shrink-0 items-center gap-1 text-xs font-medium uppercase text-yellow-600">
      <CirclePauseIcon size={16} />
      <span>On Hold</span>
    </div>
  ),
  COMPLETED: (
    <div className="flex items-center gap-1 text-xs font-medium uppercase text-green-500">
      <CircleCheckBigIcon size={16} />
      <span>Completed</span>
    </div>
  ),
  CANCELLED: (
    <div className="flex items-center gap-1 text-xs font-medium uppercase text-gray-500">
      <CircleSlashIcon size={16} />
      <span>Cancelled</span>
    </div>
  ),
};

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Map as MapIcon, MapPinned } from "lucide-react";

interface MapDialogProps {
  address: string;
  organizationName: string;
}

const MapDialog: React.FC<MapDialogProps> = ({ address, organizationName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <span
          className="cursor-pointer rounded-full bg-gray-100 px-2 py-1 text-sm font-medium text-gray-500"
          onClick={() => setIsOpen(true)}
        >
          <MapPinned />
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{organizationName}</DialogTitle>
        </DialogHeader>
        <div>
          <p>Voir ladresse sur Google Maps :</p>
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {address}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapDialog;

import { Modal, Button, ActionIcon } from "@mantine/core";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  variant?: "destructive" | "primary";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  variant = "primary",
  isLoading,
}: ConfirmationDialogProps) {
  return (
    <Modal
      opened={isOpen}
      onClose={() => onOpenChange(false)}
      withCloseButton={false}
      centered
      size="sm"
      padding="xl"
      radius="md"
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 3,
      }}
      styles={{
        content: {
          overflow: "hidden",
        }
      }}
    >
      <div className="relative flex flex-col items-center text-center space-y-4">
        {/* Close Button */}
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => onOpenChange(false)}
          className="absolute right-0 top-0 rounded-full hover:bg-muted/50"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </ActionIcon>

        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
          variant === "destructive" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
        }`}>
          <AlertTriangle className="h-7 w-7" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
          <Button 
            variant="outline" 
            color="gray" 
            onClick={() => onOpenChange(false)}
            className="flex-1 font-semibold border-border"
          >
            Cancel
          </Button>
          <Button 
            color={variant === "destructive" ? "red" : "blue"}
            className="flex-1 font-bold text-white"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

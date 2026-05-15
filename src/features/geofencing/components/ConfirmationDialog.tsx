import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1200] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl z-[1201] p-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
              variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            }`}>
              <AlertTriangle className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <Dialog.Title className="text-xl font-bold tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1 font-semibold border-border">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button 
                variant={variant === "destructive" ? "destructive" : "default"}
                className={`flex-1 font-bold ${variant === "primary" ? "text-white" : ""}`}
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

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

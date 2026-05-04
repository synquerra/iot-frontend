import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FotaUpdate } from "../types";
import { createFotaUpdate, editFotaUpdate } from "../services/fotaService";
import { toast } from "sonner";
import { RefreshCw, PackagePlus, Edit3, FileUp } from "lucide-react";

// FilePond Imports
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

// Register FilePond plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

interface FotaFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData: FotaUpdate | null;
}

export function FotaFormDialog({ isOpen, onOpenChange, onSuccess, editData }: FotaFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    version_name: "",
    version_code: "0",
    file_url: "",
    file_size: "0",
    release_notes: "",
  });

  const isEditing = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData({
        version_name: editData.version_name,
        version_code: editData.version_code,
        file_url: editData.file_url,
        file_size: editData.file_size,
        release_notes: editData.release_notes,
      });
      setFiles([]); // Reset files on edit (user can re-upload if needed)
    } else {
      setFormData({
        version_name: "",
        version_code: "0",
        file_url: "",
        file_size: "0",
        release_notes: "",
      });
      setFiles([]);
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.version_name) {
      toast.error("Please fill in version name");
      return;
    }

    // In a real scenario, we'd wait for file upload to finish and get the URL
    // For now, if it's a new entry and no file is selected, we warn
    if (!isEditing && files.length === 0 && !formData.file_url) {
      toast.error("Please upload a firmware file");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        version_name: formData.version_name,
        version_code: Number(formData.version_code),
        file_url: formData.file_url || "https://pending-upload.s3.amazonaws.com/firmware.bin", // Mock URL
        file_size: Number(formData.file_size),
        release_notes: formData.release_notes,
      };

      let response;
      if (isEditing && editData) {
        response = await editFotaUpdate({ ...payload, id: editData.id });
      } else {
        response = await createFotaUpdate(payload);
      }
      
      if (response.status === "success") {
        toast.success(response.message || `Firmware update ${isEditing ? 'updated' : 'added'} successfully`);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.message || `Failed to ${isEditing ? 'update' : 'add'} firmware update`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpdate = (fileItems: any[]) => {
    setFiles(fileItems);
    if (fileItems.length > 0) {
      const file = fileItems[0].file;
      setFormData(prev => ({
        ...prev,
        file_size: file.size.toString()
      }));
      // Note: file_url will be set by the S3 upload logic in the future
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? (
                <Edit3 className="h-5 w-5 text-primary" />
              ) : (
                <PackagePlus className="h-5 w-5 text-primary" />
              )}
              {isEditing ? 'Edit Firmware' : 'Register New Firmware'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the details for this firmware version in the FOTA registry."
                : "Upload a firmware file and provide version details to register a new update."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="version_name">Version Name</Label>
                <Input
                  id="version_name"
                  placeholder="e.g. v1.0.2"
                  value={formData.version_name}
                  onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version_code">Version Code</Label>
                <Input
                  id="version_code"
                  type="number"
                  placeholder="e.g. 102"
                  value={formData.version_code}
                  onChange={(e) => setFormData({ ...formData, version_code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2 mb-1">
                <FileUp className="h-4 w-4 text-primary" />
                Update file
              </Label>
              <div className="filepond-wrapper rounded-xl overflow-hidden border border-dashed border-primary/20 bg-primary/5 p-1">
                <FilePond
                  files={files}
                  onupdatefiles={handleFileUpdate}
                  allowMultiple={false}
                  maxFiles={1}
                  name="firmware"
                  labelIdle='Drag & Drop your firmware .bin file or <span class="filepond--label-action">Browse</span>'
                  acceptedFileTypes={['application/octet-stream', 'application/x-binary', '.bin']}
                  labelFileTypeNotAllowed="Invalid file type"
                  fileValidateTypeDetectType={(source, type) =>
                    new Promise((resolve, reject) => {
                      resolve(type);
                    })
                  }
                />
              </div>
              {isEditing && !files.length && (
                 <p className="text-[10px] text-muted-foreground italic px-1">
                   Current: {formData.file_url.split('/').pop()}
                 </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="release_notes">Release Notes</Label>
              <Textarea
                id="release_notes"
                placeholder="Describe what's new in this version..."
                className="min-h-[100px]"
                value={formData.release_notes}
                onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="font-bold min-w-[120px]">
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                isEditing ? "Save Changes" : "Add Firmware"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

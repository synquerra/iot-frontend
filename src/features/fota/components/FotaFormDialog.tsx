import { useEffect, useState } from "react";
import { Modal, Button, TextInput, Textarea, Group, Stack, SimpleGrid, Text } from "@mantine/core";
import type { FotaUpdate } from "../types";
import { createFotaUpdate, editFotaUpdate } from "../services/fotaService";
import { toast } from "@/lib/toast";
import { PackagePlus, Edit3, FileUp } from "lucide-react";

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
    <Modal 
      opened={isOpen} 
      onClose={() => onOpenChange(false)}
      title={
        <Group gap="xs">
          {isEditing ? <Edit3 size="1.25rem" className="text-primary" /> : <PackagePlus size="1.25rem" className="text-primary" />}
          <Text fw={600}>{isEditing ? 'Edit Firmware' : 'Register New Firmware'}</Text>
        </Group>
      }
      size="lg"
      overlayProps={{ blur: 3, backgroundOpacity: 0.55 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md" mt="sm">
          <Text size="sm" c="dimmed">
            {isEditing 
              ? "Update the details for this firmware version in the FOTA registry."
              : "Upload a firmware file and provide version details to register a new update."
            }
          </Text>

          <SimpleGrid cols={2}>
            <TextInput
              label="Version Name"
              withAsterisk
              placeholder="e.g. v1.0.2"
              value={formData.version_name}
              onChange={(e) => setFormData({ ...formData, version_name: e.currentTarget.value })}
              required
            />
            <TextInput
              label="Version Code"
              withAsterisk
              type="number"
              placeholder="e.g. 102"
              value={formData.version_code}
              onChange={(e) => setFormData({ ...formData, version_code: e.currentTarget.value })}
              required
            />
          </SimpleGrid>

          <Stack gap="xs">
            <Text size="sm" fw={500} className="flex items-center gap-2">
              <FileUp size="1rem" className="text-primary" />
              Update file <span className="text-red-500">*</span>
            </Text>
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
                <Text size="xs" c="dimmed" fs="italic" px={4}>
                  Current: {formData.file_url.split('/').pop()}
                </Text>
            )}
          </Stack>

          <Textarea
            label="Release Notes"
            placeholder="Describe what's new in this version..."
            minRows={4}
            value={formData.release_notes}
            onChange={(e) => setFormData({ ...formData, release_notes: e.currentTarget.value })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {isEditing ? "Save Changes" : "Add Firmware"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

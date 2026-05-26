import { useState, useEffect } from "react";
import { Modal, Button, TextInput, PasswordInput, Select, Switch, Group, Stack, SimpleGrid } from "@mantine/core";
import { type User, type UserRole } from "../types";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function UserForm({ open, onOpenChange, user, onSubmit, isLoading }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<User & { password?: string }>>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    mobile: "",
    user_type: "testing",
    is_active: true,
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: "", // Don't pre-fill password for editing
      });
    } else {
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        mobile: "",
        user_type: "testing",
        is_active: true,
        password: "",
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      title={user ? "Edit User" : "Add New User"}
      size="md"
      overlayProps={{ blur: 3, backgroundOpacity: 0.55 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <SimpleGrid cols={2}>
            <TextInput
              label="First Name"
              withAsterisk
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <TextInput
              label="Last Name"
              withAsterisk
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </SimpleGrid>
          
          <TextInput
            label="Middle Name"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
          />
          
          <TextInput
            label="Email Address"
            withAsterisk
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <TextInput
            label="Mobile Number"
            withAsterisk
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
          
          <SimpleGrid cols={user ? 1 : 2}>
            <Select
              label="User Type"
              withAsterisk
              value={formData.user_type}
              onChange={(value) => setFormData((prev) => ({ ...prev, user_type: value as UserRole }))}
              data={[
                { value: 'admin', label: 'Admin' },
                { value: 'fota', label: 'FOTA' },
                { value: 'testing', label: 'Testing' }
              ]}
              required
            />
            {!user && (
              <PasswordInput
                label="Password"
                withAsterisk
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            )}
          </SimpleGrid>

          {user && (
            <Group justify="space-between" mt="xs">
              <Switch
                labelPosition="left"
                label="Active Status"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.currentTarget.checked }))}
                color="teal"
              />
            </Group>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {user ? "Update User" : "Create User"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserTable } from "./components/UserTable";
import { UserForm } from "./components/UserForm";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "./services/userService";
import { type User } from "./types";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";

import { PageHeader } from "@/components/PageHeader";

export default function UsersPage() {
  const { setIsLoading } = useGlobalLoading();
  const [users, setUsers] = useState<User[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setIsFetching(true);
      const response = await listUsers();
      if (response.status === "success") {
        setUsers(response.data);
      } else {
        toast.error(response.message || "Failed to load users");
      }
    } catch (error) {
      toast.error("Network error while fetching users");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setIsLoading(true, "Deleting user...");
      const response = await deleteUser(userId);
      if (response.status === "success") {
        toast.success("User deleted successfully");
        fetchUsers(true);
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Error deleting user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        // Update existing user
        const response = await updateUser({
          ...formData,
          user_id: selectedUser.user_id,
        });
        if (response.status === "success") {
          toast.success("User updated successfully");
          setIsFormOpen(false);
          fetchUsers(true);
        } else {
          toast.error(response.message || "Failed to update user");
        }
      } else {
        // Create new user
        const response = await createUser(formData);
        if (response.status === "success") {
          toast.success("User created successfully");
          setIsFormOpen(false);
          fetchUsers(true);
        } else {
          toast.error(response.message || "Failed to create user");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="User Management"
        description="Control access and manage team profiles"
        icon={Users}
      >
        <Button
          onClick={handleAddClick}
          className="gap-2 rounded-xl h-10 px-3 sm:px-4 shadow-lg shadow-primary/20"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add User</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchUsers()}
          disabled={isFetching}
          className="h-10 w-10 rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </PageHeader>

      <div className="min-h-[400px]">
        {isFetching && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Synchronizing user data...</p>
          </div>
        ) : (
          <UserTable
            data={users}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onAdd={handleAddClick}
          />
        )}
      </div>

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

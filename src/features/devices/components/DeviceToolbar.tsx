import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDeviceTable } from "../context/DeviceTableContext"
import { Search, X, RefreshCw, Plus } from "lucide-react"
import { AddDeviceModal } from "./AddDeviceModal"

export function DeviceToolbar() {
    const {
        search,
        setSearch,
        refresh,
        selected,
        clearSelection,
    } = useDeviceTable()

    return (
        <div className="space-y-3">
            {/* Top row - always visible */}
            <div className="flex gap-2">
                {/* Search - takes most space */}
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-8"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Refresh and Add (mobile) */}
                <div className="flex sm:hidden gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={refresh}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <AddDeviceModal>
                        <Button size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </AddDeviceModal>
                </div>

                {/* Desktop buttons */}
                <div className="hidden sm:flex gap-2">
                    <Button variant="outline" onClick={refresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <AddDeviceModal>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Device
                        </Button>
                    </AddDeviceModal>
                </div>
            </div>

            {/* Selection bar */}
            {selected.length > 0 && (
                <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                    <span className="text-sm text-destructive font-medium">
                        {selected.length} selected
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearSelection}
                        className="h-8"
                    >
                        <X className="h-4 w-4 sm:mr-2" />
                        <span className="sm:inline">Clear</span>
                    </Button>
                </div>
            )}
        </div>
    )
}
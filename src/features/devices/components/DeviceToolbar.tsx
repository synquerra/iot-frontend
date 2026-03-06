import { Input } from "@/components/ui/input"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useDeviceTable } from "../context/DeviceTableContext"
import { Search, X, RefreshCw, Filter } from "lucide-react"
import { useState } from "react"

export function DeviceToolbar() {
    const {
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        refresh,
        selected,
        clearSelection,
    } = useDeviceTable()

    const [showFilters, setShowFilters] = useState(false)

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

                {/* Filter toggle button (mobile) + refresh (all screens) */}
                <Button
                    variant="outline"
                    size="icon"
                    className="sm:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={refresh}
                    className="sm:hidden"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>

                {/* Desktop buttons */}
                <div className="hidden sm:flex gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={refresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Collapsible filter section (mobile) */}
            {showFilters && (
                <div className="sm:hidden">
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All devices</SelectItem>
                            <SelectItem value="active">Active only</SelectItem>
                            <SelectItem value="inactive">Inactive only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

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
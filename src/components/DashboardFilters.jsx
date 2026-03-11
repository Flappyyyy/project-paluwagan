import React from 'react';
import { FileDown, Search, Filter, Plus } from 'lucide-react';

const DashboardFilters = ({
    searchTerm,
    setSearchTerm,
    monthFilter,
    setMonthFilter,
    onAddClient,
    onExport,
    selectedDashboardClient,
    onEditDashboardClient,
    onDeleteDashboardClient,
    showAddButton = true
}) => {
    const months = [
        "All Months", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-pink-300" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-rose-400 focus:border-rose-400 text-sm"
                        placeholder="Search by client name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Month Filter */}
                <div className="relative w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-pink-300" />
                    </div>
                    <select
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-rose-400 focus:border-rose-400 text-sm appearance-none bg-white cursor-pointer"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                    >
                        {months.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
                {selectedDashboardClient && (
                    <>
                        <button
                            onClick={onEditDashboardClient}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-rose-600 border border-pink-200 rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors"
                        >
                            Edit Selected
                        </button>
                        <button
                            onClick={onDeleteDashboardClient}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors"
                        >
                            Delete Selected
                        </button>
                    </>
                )}
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-rose-700 bg-white hover:bg-pink-50 transition-colors"
                >
                    <FileDown className="h-4 w-4" />
                    Export CSV
                </button>
                {showAddButton && (
                    <button
                        onClick={onAddClient}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-400 text-white rounded-lg text-sm font-medium hover:bg-rose-500 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Client
                    </button>
                )}
            </div>
        </div>
    );
};

export default DashboardFilters;

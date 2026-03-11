import React from 'react';

const HistoryTable = ({ clients, selectedIds = [], onSelectRow, onSelectAll }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden">
            <div className="p-6 border-b border-emerald-200 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-lg font-bold text-emerald-800">Completed History</h2>
                    <p className="text-sm text-emerald-600 mt-1">Archive of clients who have fully reached their target payment plans.</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-rose-600">
                    <thead className="bg-emerald-50 text-emerald-900 font-semibold border-b border-emerald-200">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                    checked={clients.length > 0 && selectedIds.length === clients.length}
                                    onChange={(e) => onSelectAll(clients.map(c => c.id), e.target.checked)}
                                />
                            </th>
                            <th className="px-6 py-4 whitespace-nowrap">Client Name</th>
                            <th className="px-6 py-4 whitespace-nowrap">Items</th>
                            <th className="px-6 py-4 whitespace-nowrap">Start Month</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Target Months</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Months Paid</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">Total Plan Amount</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">Total Paid Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                    No completed history available yet.
                                </td>
                            </tr>
                        ) : (
                            clients.map((c, index) => {
                                const monthly = (c.payment15.amount + c.payment30.amount);
                                const targetMonths = c.monthsToPay || 5;
                                const totalPlan = monthly * targetMonths;

                                // amount paid this current month (partially)
                                let currentMonthPaid = 0;
                                if (c.payment15.paid) currentMonthPaid += c.payment15.amount;
                                if (c.payment30.paid) currentMonthPaid += c.payment30.amount;

                                const monthsPaid = c.monthsPaid || 0;
                                const totalPaid = (monthsPaid * monthly) + currentMonthPaid;
                                const remaining = totalPlan - totalPaid;

                                return (
                                    <tr key={c.id} className={`hover:bg-emerald-50/80 transition-colors ${selectedIds.includes(c.id) ? 'bg-emerald-100/60' : (index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30')}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                                checked={selectedIds.includes(c.id)}
                                                onChange={() => onSelectRow(c.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-emerald-900">{c.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-emerald-700">{c.items}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">{c.startMonth || c.month}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-emerald-600">{targetMonths}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-emerald-500">
                                            {monthsPaid}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-emerald-600 font-medium">
                                            ₱{totalPlan.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-emerald-700 font-bold">
                                            ₱{totalPaid.toLocaleString()}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default HistoryTable;

import React from 'react';

const HistoryTable = ({ clients, onSelectClient }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden">
            <div className="p-6 border-b border-pink-200 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-lg font-bold text-rose-800">Completed Accounts Archive</h2>
                    <p className="text-sm text-pink-500 mt-1">Permanent record of clients who have fully finished their payment plans.</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-rose-600">
                    <thead className="bg-pink-50 text-rose-900 font-semibold border-b border-pink-200">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Client Name</th>
                            <th className="px-6 py-4 whitespace-nowrap">Items</th>
                            <th className="px-6 py-4 whitespace-nowrap">Start Month</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Target Months</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Months Paid</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">Total Plan Amount</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">Total Paid Amount</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Balance</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-12 text-center text-pink-500">
                                    No history available.
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
                                    <tr key={c.id} className={`hover:bg-pink-50/80 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-pink-50/40'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-rose-900">{c.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-rose-600">{c.items}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{c.startMonth || c.month}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-pink-500">{targetMonths}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-rose-500">
                                            {monthsPaid}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-pink-500">
                                            ₱{totalPlan.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-emerald-600 font-medium">
                                            ₱{totalPaid.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-rose-600">
                                            ₱{Math.max(0, remaining).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => onSelectClient(c)}
                                                className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-400 hover:text-white hover:border-rose-400 font-medium text-sm rounded-lg transition-colors shadow-sm cursor-pointer"
                                            >
                                                Select
                                            </button>
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

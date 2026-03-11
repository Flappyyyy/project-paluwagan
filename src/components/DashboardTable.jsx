import React from 'react';
import StatusBadge from './StatusBadge';

const DashboardTable = ({
    clients,
    selectedClientId,
    onSelectRow,
    onTogglePayment15,
    onTogglePayment30,
    onSavePayment,
    onToggleItemReceived
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-rose-600">
                    <thead className="bg-pink-50 text-rose-900 font-semibold border-b border-pink-200">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Select</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Date</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Client Name</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Items</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Month</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">15-Day Payment</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">30-Day Payment</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-12 text-center text-pink-500">
                                    No clients found.
                                </td>
                            </tr>
                        ) : (
                            clients.map((client, index) => (
                                <tr
                                    key={client.id}
                                    className={`hover:bg-pink-50/80 transition-colors ${selectedClientId === client.id ? 'bg-pink-100/60' : (index % 2 === 0 ? 'bg-white' : 'bg-pink-50/40')}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="radio"
                                            name="dashboardSelectClient"
                                            checked={selectedClientId === client.id}
                                            onChange={() => onSelectRow(client.id)}
                                            className="w-4 h-4 text-rose-500 bg-white border-pink-200 focus:ring-rose-500 cursor-pointer accent-rose-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">{client.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-rose-900 text-center">{client.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span>{client.items}</span>
                                            {client.isItemReceived ? (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded border border-emerald-200">
                                                    Received
                                                </span>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={false}
                                                    onChange={() => onToggleItemReceived(client.id)}
                                                    className="w-4 h-4 text-rose-500 rounded border-pink-300 focus:ring-rose-500 cursor-pointer accent-rose-500"
                                                    title="Mark as received"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-pink-500">{client.month}</td>

                                    {/* 15-Day Payment Toggle */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => onTogglePayment15(client.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${client.payment15.paid
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                : 'bg-white text-rose-600 border-pink-200 hover:bg-pink-100'
                                                }`}
                                        >
                                            {client.payment15.paid ? '✅ Paid' : '❌ Unpaid'}
                                            <span className="text-xs text-pink-300 ml-1">
                                                (₱{client.payment15.amount.toLocaleString()})
                                            </span>
                                        </button>
                                    </td>

                                    {/* 30-Day Payment Toggle */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => onTogglePayment30(client.id)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${client.payment30.paid
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                : 'bg-white text-rose-600 border-pink-200 hover:bg-pink-100'
                                                }`}
                                        >
                                            {client.payment30.paid ? '✅ Paid' : '❌ Unpaid'}
                                            <span className="text-xs text-pink-300 ml-1">
                                                (₱{client.payment30.amount.toLocaleString()})
                                            </span>
                                        </button>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <StatusBadge status={client.status} />
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {client.status === 'Paid' ? (
                                            <button
                                                onClick={() => onSavePayment(client.id)}
                                                className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <span className="text-pink-300 text-xs font-semibold">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardTable;

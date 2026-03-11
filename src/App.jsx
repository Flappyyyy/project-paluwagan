import { useState, useMemo, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import DashboardSummary from './components/DashboardSummary';
import DashboardFilters from './components/DashboardFilters';
import DashboardTable from './components/DashboardTable';
import HistoryTable from './components/HistoryTable';
import PaymentLogsTable from './components/PaymentLogsTable';
import ClientModal from './components/ClientModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import ClientDetailsModal from './components/ClientDetailsModal';
import Auth from './components/Auth';
import { LogOut } from 'lucide-react';

// Helper to calculate status
const calculateStatus = (paid15, paid30) => {
  if (paid15 && paid30) return "Paid";
  if (paid15 || paid30) return "Partially Paid";
  return "Unpaid";
};

function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // App UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [paymentLogs, setPaymentLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('All Months');

  // Modal states
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Client Details Modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClientHistory, setSelectedClientHistory] = useState(null);

  // Dashboard row selection
  const [selectedDashboardClientId, setSelectedDashboardClientId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchClients();
    }
  }, [session]);

  const fetchClients = async () => {
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientsData) setClients(clientsData);

    const { data: logsData } = await supabase
      .from('payment_logs')
      .select('*')
      .order('date_saved', { ascending: false });

    if (logsData) setPaymentLogs(logsData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSelectClientHistory = (client) => {
    setSelectedClientHistory(client);
    setIsDetailsModalOpen(true);
  };

  // Filter clients based on search and month
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Archive fully paid clients from the Active Dashboard view
      if (client.monthsPaid >= (client.monthsToPay || 5)) return false;

      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = monthFilter === 'All Months' || client.month === monthFilter;
      return matchesSearch && matchesMonth;
    });
  }, [clients, searchTerm, monthFilter]);

  // Handlers for toggling payments
  const handleTogglePayment15 = async (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newPaid15 = !client.payment15.paid;
    const newStatus = calculateStatus(newPaid15, client.payment30.paid);
    const newPayment15 = { ...client.payment15, paid: newPaid15 };

    // Optimistic UI update
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, payment15: newPayment15, status: newStatus } : c));

    await supabase
      .from('clients')
      .update({ payment15: newPayment15, status: newStatus })
      .eq('id', clientId);
  };

  const handleTogglePayment30 = async (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newPaid30 = !client.payment30.paid;
    const newStatus = calculateStatus(client.payment15.paid, newPaid30);
    const newPayment30 = { ...client.payment30, paid: newPaid30 };

    // Optimistic UI update
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, payment30: newPayment30, status: newStatus } : c));

    await supabase
      .from('clients')
      .update({ payment30: newPayment30, status: newStatus })
      .eq('id', clientId);
  };

  const handleToggleItemReceived = async (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newIsItemReceived = !client.isItemReceived;
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, isItemReceived: newIsItemReceived } : c));
    await supabase.from('clients').update({ isItemReceived: newIsItemReceived }).eq('id', clientId);
  };

  const handleSavePayment = async (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || client.status !== 'Paid') return;

    const newMonthsPaid = (client.monthsPaid || 0) + 1;
    const isCompleted = newMonthsPaid >= (client.monthsToPay || 5);
    const resetPayment15 = { ...client.payment15, paid: false };
    const resetPayment30 = { ...client.payment30, paid: false };
    const newStatus = isCompleted ? "Completed" : "Unpaid";

    setClients(prev => prev.map(c => c.id === clientId ? {
      ...c,
      monthsPaid: newMonthsPaid,
      payment15: resetPayment15,
      payment30: resetPayment30,
      status: newStatus
    } : c));

    // Create new log record
    const newLog = {
      user_id: session.user.id,
      client_id: client.id,
      client_name: client.name,
      items: client.items,
      month_paid_for: client.month,
      payment15_amount: client.payment15,
      payment30_amount: client.payment30,
      status: 'Paid'
    };

    // Insert Log
    const { data: insertedLog } = await supabase
      .from('payment_logs')
      .insert([newLog])
      .select();

    if (insertedLog && insertedLog.length > 0) {
      setPaymentLogs(prev => [insertedLog[0], ...prev]);
    }

    // Update Client Status
    await supabase
      .from('clients')
      .update({
        monthsPaid: newMonthsPaid,
        payment15: resetPayment15,
        payment30: resetPayment30,
        status: newStatus
      })
      .eq('id', clientId);
  };

  const handleUpdateMonthsPaid = async (clientId, newMonthsPaid) => {
    if (newMonthsPaid < 0) return;
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, monthsPaid: newMonthsPaid } : c));
    await supabase.from('clients').update({ monthsPaid: newMonthsPaid }).eq('id', clientId);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Name', 'Items', 'Month', '15-Day Payment', '15-Day Amount', '30-Day Payment', '30-Day Amount', 'Status'];
    const rows = clients.map(c => [
      c.id,
      c.date,
      `"${c.name}"`,
      `"${c.items}"`,
      c.month,
      c.payment15.paid ? 'Paid' : 'Unpaid',
      c.payment15.amount,
      c.payment30.paid ? 'Paid' : 'Unpaid',
      c.payment30.amount,
      c.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "paluwagan_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleDeleteRequest = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      // Opt UI
      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      setIsDeleteModalOpen(false);

      await supabase
        .from('clients')
        .delete()
        .eq('id', clientToDelete.id);

      if (selectedDashboardClientId === clientToDelete.id) {
        setSelectedDashboardClientId(null);
      }

      setClientToDelete(null);
    }
  };

  const handleSaveClient = async (formData) => {
    const halfPayment = Number(formData.monthlyPayment) / 2;

    if (editingClient) {
      const updatedClientData = {
        name: formData.name,
        items: formData.items,
        startMonth: formData.startMonth,
        monthsToPay: Number(formData.monthsToPay),
        monthsPaid: Number(formData.monthsPaid),
        payment15: { ...editingClient.payment15, amount: halfPayment },
        payment30: { ...editingClient.payment30, amount: halfPayment },
      };

      // Optimistic UI
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...updatedClientData } : c));

      await supabase
        .from('clients')
        .update(updatedClientData)
        .eq('id', editingClient.id);

      if (selectedClientHistory && selectedClientHistory.id === editingClient.id) {
        setSelectedClientHistory({ ...selectedClientHistory, ...updatedClientData });
      }

    } else {
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const newClientData = {
        user_id: session.user.id,
        name: formData.name,
        items: formData.items,
        date: new Date().toISOString().split('T')[0],
        month: currentMonth,
        startMonth: formData.startMonth || currentMonth,
        monthsToPay: Number(formData.monthsToPay),
        monthsPaid: Number(formData.monthsPaid),
        payment15: { amount: halfPayment, paid: false },
        payment30: { amount: halfPayment, paid: false },
        status: "Unpaid"
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([newClientData])
        .select();

      if (data && data.length > 0) {
        setClients(prev => [data[0], ...prev]);
      }
    }
    setIsClientModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-swirl flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-pink-swirl text-rose-800 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-pink-200 px-6 h-[73px] shrink-0 flex items-center justify-between sticky top-0 z-10 md:justify-end">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-rose-400 flex items-center justify-center text-white font-bold shadow-sm">
              P
            </div>
            <h1 className="text-lg font-bold text-rose-900 tracking-tight">Paluwagan</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm font-medium text-pink-500">
              {activeTab === 'dashboard' && 'Administrator Dashboard'}
              {activeTab === 'history' && 'Client Payment History'}
              {activeTab === 'logs' && 'Confirmed Payment Logs'}
            </div>
            <button onClick={handleLogout} className="md:hidden p-2 text-pink-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' ? (
            <div className="max-w-7xl mx-auto space-y-6">
              <DashboardSummary clients={clients} />

              <DashboardFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                monthFilter={monthFilter}
                setMonthFilter={setMonthFilter}
                onAddClient={handleAddClient}
                onExport={handleExportCSV}
                selectedDashboardClient={clients.find(c => c.id === selectedDashboardClientId)}
                onEditDashboardClient={() => clients.find(c => c.id === selectedDashboardClientId) && handleEditClient(clients.find(c => c.id === selectedDashboardClientId))}
                onDeleteDashboardClient={() => clients.find(c => c.id === selectedDashboardClientId) && handleDeleteRequest(clients.find(c => c.id === selectedDashboardClientId))}
              />

              <DashboardTable
                clients={filteredClients}
                selectedClientId={selectedDashboardClientId}
                onSelectRow={setSelectedDashboardClientId}
                onTogglePayment15={handleTogglePayment15}
                onTogglePayment30={handleTogglePayment30}
                onSavePayment={handleSavePayment}
                onToggleItemReceived={handleToggleItemReceived}
              />
            </div>
          ) : activeTab === 'history' ? (
            <div className="max-w-7xl mx-auto">
              <HistoryTable
                clients={clients}
                onSelectClient={handleSelectClientHistory}
              />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <PaymentLogsTable logs={paymentLogs} />
            </div>
          )}
        </main>
      </div>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        client={editingClient}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        clientName={clientToDelete?.name}
      />

      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        client={selectedClientHistory}
        onEdit={handleEditClient}
        onDelete={handleDeleteRequest}
        onUpdateMonthsPaid={handleUpdateMonthsPaid}
      />
    </div>
  );
}

export default App;

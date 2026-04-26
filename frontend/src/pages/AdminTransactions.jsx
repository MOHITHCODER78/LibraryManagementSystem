import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Loader2, 
  User, 
  Book, 
  Clock, 
  Calendar, 
  AlertCircle,
  ClipboardList
} from 'lucide-react';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/transactions/${id}/${action}`);
            fetchTransactions();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || 'Error'));
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading transaction ledger...</p>
        </div>
    );

    const pendingRequests = transactions.filter(t => t.status === 'pending');
    const activeLoans = transactions.filter(t => t.status === 'issued');

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transaction Ledger</h2>
                <p className="text-slate-500 mt-1 font-medium">Process university book requests, issues, and returns.</p>
            </div>

            {/* Pending Requests Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Pending Approval ({pendingRequests.length})</h3>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/30 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Asset</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested Book</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Request Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Decision</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingRequests.map((t) => (
                                <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
                                                {(t.user?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{t.user?.name || 'Unknown Student'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{t.user?.email || 'No Email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-10 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                                                {t.book?.thumbnail && <img src={t.book.thumbnail} className="w-full h-full object-cover" />}
                                            </div>
                                            <p className="text-xs font-bold text-slate-700">{t.book?.title || 'Unknown Book'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs text-slate-500 font-medium">{new Date(t.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleAction(t._id, 'issue')}
                                                className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(t._id, 'reject')}
                                                className="bg-white border border-slate-200 text-slate-400 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Active Ledger Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Active Library Ledger</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Borrower</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status/Fine</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ledger Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.filter(t => t.status !== 'pending').map((t) => (
                                <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-slate-900">{t.user?.name || 'Unknown'}</p>
                                        <p className="text-[10px] text-slate-400">{t.user?.role || 'user'}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs font-bold text-slate-700">{t.book?.title || 'Unknown'}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                <Calendar className="w-3 h-3 text-emerald-500" />
                                                Issued: {new Date(t.issueDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                <Clock className="w-3 h-3 text-rose-500" />
                                                Due: {new Date(t.dueDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                t.status === 'issued' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {t.status}
                                            </span>
                                            {t.fine > 0 && <span className="text-[10px] font-bold text-rose-600 tracking-tight">Fine: ₹{t.fine}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {t.status === 'issued' && (
                                            <button 
                                                onClick={() => handleAction(t._id, 'return')}
                                                className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 ml-auto"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Return Book
                                            </button>
                                        )}
                                        {t.status === 'returned' && (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Ledger Closed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminTransactions;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Book, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  History,
  ArrowUpRight
} from 'lucide-react';

const StudentDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const location = useLocation();
    const isFinesPage = location.pathname === '/fines';

    useEffect(() => {
        fetchMyTransactions();
    }, []);

    const fetchMyTransactions = async () => {
        try {
            const res = await api.get('/transactions/my');
            setTransactions(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (transactionId, amount) => {
        try {
            const orderRes = await api.post(`/payments/order/${transactionId}`, { amount });
            
            const options = {
                key: "rzp_test_Shj8RyjZg1NsJ6",
                amount: orderRes.data.order.amount,
                currency: "INR",
                name: "NexLib University",
                description: "Library Fine Payment",
                order_id: orderRes.data.order.id,
                handler: async function (response) {
                    try {
                        await api.post('/payments/verify', {
                            ...response,
                            transactionId
                        });
                        alert('Payment Successful!');
                        fetchMyTransactions();
                    } catch (err) {
                        alert('Payment verification failed');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert('Error creating payment order');
        }
    };

    // Active loans and returned books that still have unpaid fines
    const activeLoans = transactions.filter(t => t.status === 'issued' || (t.status === 'returned' && t.fine > 0));
    const pendingRequests = transactions.filter(t => t.status === 'pending');
    const totalFine = activeLoans.reduce((sum, t) => sum + (t.fine || 0), 0);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading your activity...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Dashboard</h2>
                <p className="text-slate-500 mt-1 font-medium">Welcome back, {user?.name}. Here is your library activity.</p>
            </div>

            {/* Stats Grid - Show only relevant stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {!isFinesPage && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Book className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Loans</p>
                            <h4 className="text-2xl font-black text-slate-900">{activeLoans.length}</h4>
                        </div>
                    </div>
                )}
                {!isFinesPage && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                            <Clock className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pending Requests</p>
                            <h4 className="text-2xl font-black text-slate-900">{pendingRequests.length}</h4>
                        </div>
                    </div>
                )}
                <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 ${isFinesPage ? 'md:col-span-3' : ''}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${totalFine > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <CreditCard className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Fines</p>
                        <h4 className={`text-2xl font-black ${totalFine > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₹{totalFine}</h4>
                    </div>
                </div>
            </div>

            {/* Active Loans Table - Only show if not on Fines page or if there are fines to show */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-slate-900">{isFinesPage ? 'Fine Payment History' : 'Your Current Loans'}</h3>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Book Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Issue Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Fine</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeLoans.map((transaction) => (
                                <tr key={transaction._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {transaction.book.thumbnail ? (
                                                    <img src={transaction.book.thumbnail} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Book className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{transaction.book.title}</p>
                                                <p className="text-xs text-slate-500">{transaction.book.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(transaction.issueDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(transaction.dueDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {transaction.fine > 0 ? (
                                            <span className="text-rose-600 font-bold text-sm">₹{transaction.fine}</span>
                                        ) : (
                                            <span className="text-emerald-600 font-bold text-sm italic">No Fine</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {transaction.fine > 0 && (
                                            <button 
                                                onClick={() => handlePayment(transaction._id, transaction.fine)}
                                                className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2 ml-auto"
                                            >
                                                Pay Now
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {transaction.fine === 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                <CheckCircle2 className="w-3 h-3" /> On Track
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {activeLoans.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Book className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium italic">No active book loans found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="bg-amber-50 rounded-3xl border border-amber-100 p-6 flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900 mb-1">Pending Reservations</h4>
                        <p className="text-sm text-amber-700">You have {pendingRequests.length} books waiting for librarian approval. You will be notified once they are ready for pickup.</p>
                        <div className="flex gap-2 mt-4">
                            {pendingRequests.map(r => (
                                <span key={r._id} className="px-3 py-1 bg-white/50 rounded-full text-[10px] font-bold text-amber-800 border border-amber-200">
                                    {r.book.title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight,
  Library,
  FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/transactions/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Synthesizing library analytics...</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-4">
            <Library className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-slate-900">Analytics Unavailable</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">We couldn't retrieve the library data ledger. Please ensure your database is connected.</p>
    </div>
  );

  const stats = [
    { label: 'Total Books', value: data.totalBooks || 0, icon: Library, color: 'bg-blue-50 text-blue-600', trend: '+12% this month' },
    { label: 'Active Loans', value: data.activeLoans || 0, icon: BookOpen, color: 'bg-indigo-50 text-indigo-600', trend: '+5% since yesterday' },
    { label: 'Pending Fines', value: `₹${data.totalFines || 0}`, icon: FileText, color: 'bg-rose-50 text-rose-600', trend: '24 overdue books' },
    { label: 'Registered Students', value: data.totalStudents || 0, icon: Users, color: 'bg-emerald-50 text-emerald-600', trend: '+156 this semester' },
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Analytics</h2>
          <p className="text-slate-500 mt-1 font-medium">Real-time overview of library operations and student engagement.</p>
        </div>
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2">
            Export Report
            <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {i % 2 === 0 ? (
                  <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Growth
                  </span>
              ) : (
                <span className="flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
                    <Clock className="w-3 h-3 mr-1" /> Live
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
            <h4 className="text-2xl font-black text-slate-900 mb-1">{stat.value}</h4>
            <p className="text-xs text-slate-400 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900">Collection Distribution</h3>
              <p className="text-xs text-slate-400 font-medium">Book categories spread across the library.</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-300" />
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                >
                  {(data.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Borrowing Trends */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900">Borrowing Volume</h3>
              <p className="text-xs text-slate-400 font-medium">Daily trends of book issues and returns.</p>
            </div>
            <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issues</span>
                </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                />
                <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

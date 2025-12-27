import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { api } from '../utils/api';
import { FinancialSummary } from '../types';
import { showToast } from './Toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#FFD700', '#F59E0B', '#D97706', '#92400E', '#78350F', '#451A03'];

export default function Financial() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('📊 Financial component mounted, loading data...');
    setMounted(true);
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading financial data...');
      const data = await api.getFinancialSummary();
      console.log('✅ Financial data loaded:', data);
      setSummary(data);
    } catch (error: any) {
      console.error('❌ Failed to load financial data:', error);
      const errorMessage = error.message || 'Failed to load financial data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      // Set empty summary to show "no data" state instead of blank
      setSummary({
        totalRevenue: 0,
        totalPaid: 0,
        totalPending: 0,
        totalClients: 0,
        averagePayment: 0,
        monthlyData: [],
        paymentMethods: [],
        topClients: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Always render something - never blank
  console.log('📊 Financial render state:', { loading, error, hasSummary: !!summary, mounted });

  // If not mounted yet, show nothing (prevents flash)
  if (!mounted) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show loading state immediately
  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Loading financial data...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error loading financial data</h2>
            <p className="text-red-600 text-sm mb-6">{error}</p>
            <button
              onClick={loadFinancialData}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-600 text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No financial data available</h2>
            <p className="text-gray-600 text-sm mb-6">Start adding clients and payments to see financial insights</p>
            <button
              onClick={loadFinancialData}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data with safe defaults
  const monthlyChartData = (summary.monthlyData || []).map((item) => ({
    month: formatMonth(item.month || ''),
    income: item.totalIncome || 0,
    paid: item.totalPaid || 0,
    pending: item.pendingAmount || 0,
  }));

  const paymentMethodData = (summary.paymentMethods || []).map((pm) => ({
    name: pm.method || 'Unknown',
    value: pm.totalAmount || 0,
    count: pm.count || 0,
    percentage: pm.percentage || 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in" style={{ minHeight: '600px', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <div className="border-b border-amber-200/50 pb-4 sm:pb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2 tracking-tight">
            Financial Overview
          </h2>
          <p className="text-amber-700/80 text-base sm:text-lg font-medium">
            Track income, payments, and financial metrics
          </p>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="glass-gold rounded-2xl p-5 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-amber-700" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-2">From {summary.totalClients} clients</p>
        </div>

        {/* Total Paid */}
        <div className="glass-gold rounded-2xl p-5 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Paid</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(summary.totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {summary.totalPaid > 0 && summary.totalRevenue > 0
              ? `${Math.round((summary.totalPaid / summary.totalRevenue) * 100)}% collected`
              : '0% collected'}
          </p>
        </div>

        {/* Pending Amount */}
        <div className="glass-gold rounded-2xl p-5 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl shadow-lg">
              <CreditCard className="w-6 h-6 text-orange-700" />
            </div>
            <ArrowDownRight className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Pending Amount</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(summary.totalPending)}</p>
          <p className="text-xs text-gray-500 mt-2">Outstanding payments</p>
        </div>

        {/* Average Payment */}
        <div className="glass-gold rounded-2xl p-5 sm:p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Average Payment</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(summary.averagePayment)}</p>
          <p className="text-xs text-gray-500 mt-2">Per transaction</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income Chart */}
        <div className="glass-gold rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Monthly Income Trend</h3>
              <p className="text-sm text-gray-600">Revenue vs Payments over time</p>
            </div>
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => formatCurrency(value || 0)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Total Income"
                dot={{ fill: '#F59E0B', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="paid"
                stroke="#10B981"
                strokeWidth={2}
                name="Paid"
                dot={{ fill: '#10B981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#F97316"
                strokeWidth={2}
                name="Pending"
                dot={{ fill: '#F97316', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Chart */}
        <div className="glass-gold rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Methods</h3>
              <p className="text-sm text-gray-600">Distribution by payment type</p>
            </div>
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent || 0).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => formatCurrency(value || 0)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Payments Bar Chart */}
        <div className="glass-gold rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Monthly Payments</h3>
              <p className="text-sm text-gray-600">Paid amounts by month</p>
            </div>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => formatCurrency(value || 0)}
              />
              <Legend />
              <Bar dataKey="paid" fill="#10B981" name="Paid" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#F97316" name="Pending" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Clients */}
        <div className="glass-gold rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Top Clients</h3>
              <p className="text-sm text-gray-600">Highest paying clients</p>
            </div>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-3">
            {summary.topClients.length > 0 ? (
              summary.topClients.map((client, index) => (
                <div
                  key={client.clientId}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-amber-200/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{client.clientName}</p>
                      <p className="text-xs text-gray-500">{client.paymentCount} payment{client.paymentCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-700">{formatCurrency(client.totalPaid)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No payment data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


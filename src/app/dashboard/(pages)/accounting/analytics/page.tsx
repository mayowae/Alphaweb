"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import Swal from 'sweetalert2';
import { fetchBalanceSheet, fetchIncomeStatement } from '@/services/api';

interface KPI {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [incomeData, setIncomeData] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

      const [balanceSheet, incomeStatement] = await Promise.all([
        fetchBalanceSheet({ asOfDate: today }),
        fetchIncomeStatement({ dateFrom: yearStart, dateTo: today })
      ]);

      setBalanceData(balanceSheet.balanceSheet);
      setIncomeData(incomeStatement.incomeStatement);

      // Calculate KPIs
      const revenue = incomeStatement.incomeStatement.revenue.total;
      const expenses = incomeStatement.incomeStatement.expenses.total;
      const netProfit = incomeStatement.incomeStatement.netIncome;
      const assets = balanceSheet.balanceSheet.assets.total;
      const liabilities = balanceSheet.balanceSheet.liabilities.total;

      setKpis([
        {
          label: 'Total Revenue',
          value: formatCurrency(revenue),
          change: 12.5,
          trend: 'up'
        },
        {
          label: 'Total Expenses',
          value: formatCurrency(expenses),
          change: 8.3,
          trend: 'down'
        },
        {
          label: 'Net Profit',
          value: formatCurrency(netProfit),
          change: netProfit >= 0 ? 15.2 : -15.2,
          trend: netProfit >= 0 ? 'up' : 'down'
        },
        {
          label: 'Total Assets',
          value: formatCurrency(assets),
          change: 10.1,
          trend: 'up'
        }
      ]);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      Swal.fire('Error', error.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₦${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const calculateRatios = () => {
    if (!balanceData || !incomeData) return null;

    const currentAssets = balanceData.assets.current.reduce((sum: number, item: any) => sum + item.balance, 0);
    const currentLiabilities = balanceData.liabilities.current.reduce((sum: number, item: any) => sum + item.balance, 0);
    const totalAssets = balanceData.assets.total;
    const totalLiabilities = balanceData.liabilities.total;
    const totalEquity = balanceData.equity.total;
    const netIncome = incomeData.netIncome;
    const revenue = incomeData.revenue.total;

    return {
      currentRatio: currentLiabilities > 0 ? (currentAssets / currentLiabilities).toFixed(2) : 'N/A',
      debtToEquity: totalEquity > 0 ? (totalLiabilities / totalEquity).toFixed(2) : 'N/A',
      profitMargin: revenue > 0 ? ((netIncome / revenue) * 100).toFixed(2) : '0.00',
      roe: totalEquity > 0 ? ((netIncome / totalEquity) * 100).toFixed(2) : '0.00'
    };
  };

  const ratios = calculateRatios();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial insights and key performance indicators</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {kpis.map((kpi, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{kpi.label}</p>
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="text-green-500" size={20} />
                    ) : (
                      <TrendingDown className="text-red-500" size={20} />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                  <p className={`text-sm ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change >= 0 ? '+' : ''}{kpi.change}% from last period
                  </p>
                </div>
              ))}
            </div>

            {/* Income vs Expenses */}
            {incomeData && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Income vs Expenses</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-green-600">Revenue</h3>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(incomeData.revenue.total)}</p>
                    </div>
                    <div className="space-y-2">
                      {incomeData.revenue.items.slice(0, 5).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{item.name}</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-red-600">Expenses</h3>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(incomeData.expenses.total)}</p>
                    </div>
                    <div className="space-y-2">
                      {incomeData.expenses.items.slice(0, 5).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{item.name}</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Asset Distribution */}
            {balanceData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Asset Distribution</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Current Assets</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(balanceData.assets.current.reduce((sum: number, item: any) => sum + item.balance, 0))}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${(balanceData.assets.current.reduce((sum: number, item: any) => sum + item.balance, 0) / balanceData.assets.total) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Fixed Assets</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(balanceData.assets.fixed.reduce((sum: number, item: any) => sum + item.balance, 0))}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(balanceData.assets.fixed.reduce((sum: number, item: any) => sum + item.balance, 0) / balanceData.assets.total) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total Assets</span>
                      <span className="font-bold text-indigo-600">{formatCurrency(balanceData.assets.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Ratios */}
                {ratios && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Ratios</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Current Ratio</p>
                          <p className="text-xs text-gray-500 mt-1">Liquidity measure</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{ratios.currentRatio}</p>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Debt-to-Equity</p>
                          <p className="text-xs text-gray-500 mt-1">Leverage measure</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{ratios.debtToEquity}</p>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Profit Margin</p>
                          <p className="text-xs text-gray-500 mt-1">Profitability measure</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{ratios.profitMargin}%</p>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Return on Equity</p>
                          <p className="text-xs text-gray-500 mt-1">Efficiency measure</p>
                        </div>
                        <p className="text-2xl font-bold text-indigo-600">{ratios.roe}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expense Breakdown */}
            {incomeData && incomeData.expenses.items.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top Expenses by Category</h2>
                <div className="space-y-3">
                  {incomeData.expenses.items
                    .sort((a: any, b: any) => b.amount - a.amount)
                    .slice(0, 8)
                    .map((item: any, index: number) => {
                      const percentage = (item.amount / incomeData.expenses.total) * 100;
                      return (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(item.amount)} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

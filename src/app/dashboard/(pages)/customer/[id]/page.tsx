// app/customer-dashboard/page.tsx

import { MoreVertical, ChevronRight, Filter, Search, ChevronDown } from 'lucide-react';
import type { NextPage } from 'next';

// Define a type for our transaction data for better type-safety
type Transaction = {
  id: string;
  type: string;
  package: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
};

// Sample data for the collection activities table
const transactions: Transaction[] = [
  { id: 'COL-103-A45', type: 'Withdrawal', package: 'NIL', amount: 150000, date: '23 Jan, 2025', status: 'Completed' },
  { id: 'COL-103-A45', type: 'Collection payment', package: 'Alpha300', amount: 1000, date: '23 Jan, 2025', status: 'Completed' },
  { id: 'COL-103-A45', type: 'Collection payment', package: 'Alpha300', amount: 1000, date: '23 Jan, 2025', status: 'Pending' },
  { id: 'COL-103-A45', type: 'Collection payment', package: 'Alpha300', amount: 1000, date: '23 Jan, 2025', status: 'Completed' },
  { id: 'COL-103-A45', type: 'Collection payment', package: 'Alpha300', amount: 1000, date: '23 Jan, 2025', status: 'Completed' },
  { id: 'COL-103-A45', type: 'Collection payment', package: 'Alpha300', amount: 1000, date: '23 Jan, 2025', status: 'Completed' },
  { id: 'COL-103-A45', type: 'Collection payment', package: 'Alpha300', amount: 1000, date: '23 Jan, 2025', status: 'Completed' },
];

// A small, reusable component for the status badges in the table
const StatusBadge = ({ status }: { status: 'Completed' | 'Pending' }) => {
  const baseClasses = "px-2.5 py-1 text-xs font-medium rounded-full";
  const statusClasses = {
    Completed: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

// Main page component
const CustomerProfilePage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-gray-500 mb-4 flex items-center">
          <span>Customers</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-gray-700 font-medium">James Odunayo</span>
        </nav>

        {/* Header Section */}
        <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">James Odunayo</h1>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              View profile
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
              Post to collection
            </button>
            <button className="p-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">Live wallet balance</p>
            <p className="text-2xl font-bold text-purple-900">₦1,000,000</p>
          </div>
          <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">Collection wallet balance</p>
            <p className="text-2xl font-bold text-yellow-900">₦1,000,000</p>
          </div>
          <div className="bg-pink-50 p-5 rounded-lg border border-pink-200">
            <p className="text-sm text-pink-800">Loan wallet balance</p>
            <p className="text-2xl font-bold text-pink-900">200</p>
          </div>
          <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-800">Investment wallet balance</p>
            <p className="text-2xl font-bold text-indigo-900">₦1,000,000</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <a href="#" className="py-3 px-1 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">Collection</a>
            <a href="#" className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-semibold text-sm">Loan</a>
            <a href="#" className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-semibold text-sm">Investment</a>
            <a href="#" className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-semibold text-sm">Charges</a>
            <a href="#" className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-semibold text-sm">Wallet activity</a>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Collection Details Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Collection details</h2>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                <div><p className="text-gray-500">Package name</p><p className="font-medium">Alpha 1K</p></div>
                <div><p className="text-gray-500">Collection days</p><p className="font-medium">Daily</p></div>
                <div><p className="text-gray-500">Collection Period</p><p className="font-medium">360 days</p></div>
                <div><p className="text-gray-500">Collection amount</p><p className="font-medium">₦1,000</p></div>
                <div><p className="text-gray-500">Total amount paid</p><p className="font-medium">₦12,000</p></div>
                <div><p className="text-gray-500">Start date</p><p className="font-medium">23/04/2024</p></div>
                <div><p className="text-gray-500">End date</p><p className="font-medium">23/04/2025</p></div>
              </div>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
                <button className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    Export <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <button className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                    Process withdrawal
                </button>
            </div>
          </div>

          {/* Collection Activities Section */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Collection activities</h3>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span>Filter</span>
                </button>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
            
            {/* Activities Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id + tx.amount + tx.status} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.package}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₦{tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>s
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
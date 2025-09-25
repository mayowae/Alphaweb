"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { 
  createInvestmentTransaction, 
  updateInvestmentTransaction, 
  fetchCustomers, 
  fetchAgents, 
  fetchBranches,
  fetchPackages 
} from '../../services/api';
import Swal from 'sweetalert2';

interface InvestmentTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

interface Customer {
  id: number;
  fullName: string;
  accountNumber?: string;
}

interface Agent {
  id: number;
  fullName: string;
  branch: string;
}

interface Branch {
  id: number;
  name: string;
  location: string;
}

interface Package {
  id: number;
  name: string;
  type: string;
  amount: number;
  packageCategory?: string;
}

const InvestmentTransactionForm: React.FC<InvestmentTransactionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData
}) => {
  const [formData, setFormData] = useState({
    customer: '',
    accountNumber: '',
    package: '',
    amount: '',
    branch: '',
    agent: '',
    transactionType: 'deposit' as 'deposit' | 'withdrawal' | 'interest' | 'penalty',
    notes: ''
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (editData) {
        setFormData({
          customer: editData.customer || '',
          accountNumber: editData.accountNumber || '',
          package: editData.package || '',
          amount: editData.amount?.replace('N', '').replace(',', '') || '',
          branch: editData.branch || '',
          agent: editData.agent || '',
          transactionType: editData.transactionType || 'deposit',
          notes: editData.notes || ''
        });
      } else {
        setFormData({
          customer: '',
          accountNumber: '',
          package: '',
          amount: '',
          branch: '',
          agent: '',
          transactionType: 'deposit',
          notes: ''
        });
      }
    }
  }, [isOpen, editData]);

  const fetchData = async () => {
    try {
      const [customersRes, agentsRes, branchesRes, packagesRes] = await Promise.all([
        fetchCustomers(),
        fetchAgents(),
        fetchBranches(),
        fetchPackages()
      ]);
      setCustomers(customersRes.customers || []);
      setAgents(agentsRes.agents || []);
      setBranches(branchesRes.branches || []);
      // Filter packages to only show investment packages
      const investmentPackages = (packagesRes.packages || []).filter((pkg: Package) => 
        pkg.packageCategory === 'Investment' || !pkg.packageCategory
      );
      setPackages(investmentPackages);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'customer') {
      const filtered = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(value.length > 0);
    }

    if (name === 'agent') {
      const filtered = agents.filter(agent =>
        agent.fullName.toLowerCase().includes(value.toLowerCase()) ||
        agent.branch.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAgents(filtered);
      setShowAgentDropdown(value.length > 0);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setShowCustomerDropdown(false);
    setShowAgentDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer || !formData.amount || !formData.transactionType) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.'
      });
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        customer: formData.customer,
        accountNumber: formData.accountNumber || '',
        package: formData.package || '',
        amount: parseFloat(formData.amount),
        branch: formData.branch || '',
        agent: formData.agent || '',
        transactionType: formData.transactionType,
        notes: formData.notes || ''
      };

      if (editData?.id) {
        await updateInvestmentTransaction(editData.id, transactionData);
      } else {
        await createInvestmentTransaction(transactionData);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Investment transaction ${editData ? 'updated' : 'created'} successfully!`
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || `Failed to ${editData ? 'update' : 'create'} investment transaction`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? 'Edit Investment Transaction' : 'Create Investment Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                placeholder="Search customer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        handleSelectChange('customer', customer.fullName);
                        setFormData(prev => ({ ...prev, accountNumber: customer.accountNumber || '' }));
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {customer.fullName}{customer.accountNumber ? ` • ${customer.accountNumber}` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Package */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Package
              </label>
              <select
                name="package"
                value={formData.package}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Investment Package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.name}>
                    {pkg.name} - ₦{pkg.amount?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type *
              </label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="interest">Interest</option>
                <option value="penalty">Penalty</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name} - {branch.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Agent */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent
              </label>
              <input
                type="text"
                value={formData.agent}
                onChange={(e) => {
                  const term = e.target.value.toLowerCase();
                  const filtered = agents.filter(agent =>
                    agent.fullName.toLowerCase().includes(term) || agent.branch.toLowerCase().includes(term)
                  );
                  setFilteredAgents(filtered);
                  setShowAgentDropdown(e.target.value.length > 0);
                  setFormData(prev => ({ ...prev, agent: e.target.value }));
                }}
                placeholder="Search agent..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showAgentDropdown && filteredAgents.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => {
                        handleSelectChange('agent', agent.fullName);
                        setFormData(prev => ({ ...prev, branch: agent.branch }));
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {agent.fullName} - {agent.branch}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-black bg-blue-500 border border-transparent rounded-md "
            >
              {loading ? 'Processing...' : editData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestmentTransactionForm;

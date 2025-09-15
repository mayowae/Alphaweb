"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { fetchCustomers, fetchAgents, createInvestmentApplication, updateInvestmentApplication } from '../../services/api';
import Swal from 'sweetalert2';

interface InvestmentApplicationFormProps {
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

const InvestmentApplicationForm: React.FC<InvestmentApplicationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    accountNumber: '',
    targetAmount: '',
    duration: '',
    agentId: '',
    branch: '',
    notes: ''
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
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
          customerName: editData.customerName || '',
          accountNumber: editData.accountNumber || '',
          targetAmount: editData.targetAmount?.toString() || '',
          duration: editData.duration?.toString() || '',
          agentId: editData.agentId?.toString() || '',
          branch: editData.branch || '',
          notes: editData.notes || ''
        });
      } else {
        setFormData({
          customerName: '',
          accountNumber: '',
          targetAmount: '',
          duration: '',
          agentId: '',
          branch: '',
          notes: ''
        });
      }
    }
  }, [isOpen, editData]);

  const fetchData = async () => {
    try {
      const [customersRes, agentsRes] = await Promise.all([
        fetchCustomers(),
        fetchAgents()
      ]);
      setCustomers(customersRes.customers || []);
      setAgents(agentsRes.agents || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'customerName') {
      const filtered = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(value.length > 0);
    }

    if (name === 'branch') {
      // When user types in branch field, also open agent dropdown filtered by branch
      const filtered = agents.filter(agent =>
        agent.branch.toLowerCase().includes(value.toLowerCase()) ||
        agent.fullName.toLowerCase().includes(value.toLowerCase())
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
    
    if (!formData.customerName || !formData.targetAmount || !formData.duration) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields.'
      });
      return;
    }

    setLoading(true);
    try {
      const applicationData = {
        customerName: formData.customerName,
        accountNumber: formData.accountNumber || undefined,
        targetAmount: parseFloat(formData.targetAmount),
        duration: parseInt(formData.duration),
        agentId: formData.agentId ? parseInt(formData.agentId) : undefined,
        branch: formData.branch || undefined,
        notes: formData.notes || undefined
      };

      if (editData?.id) {
        await updateInvestmentApplication(editData.id, {
          targetAmount: applicationData.targetAmount,
          duration: applicationData.duration,
          agentId: applicationData.agentId,
          branch: applicationData.branch,
          notes: applicationData.notes,
        });
      } else {
        await createInvestmentApplication(applicationData);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Investment application created successfully!'
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create investment application'
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
            {editData ? 'Edit Investment Application' : 'Create Investment Application'}
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
                name="customerName"
                value={formData.customerName}
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
                        // Set customer name and auto-fill account number
                        handleSelectChange('customerName', customer.fullName);
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

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount *
              </label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Days) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="30"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Agent */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent
              </label>
              <input
                type="text"
                value={agents.find(a => a.id.toString() === formData.agentId)?.fullName || ''}
                onChange={(e) => {
                  const term = e.target.value.toLowerCase();
                  const filtered = agents.filter(agent =>
                    agent.fullName.toLowerCase().includes(term) || agent.branch.toLowerCase().includes(term)
                  );
                  setFilteredAgents(filtered);
                  setShowAgentDropdown(e.target.value.length > 0);
                }}
                placeholder="Search agent or branch..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showAgentDropdown && filteredAgents.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => {
                        handleSelectChange('agentId', agent.id.toString());
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

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="Branch name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-blue-500 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? 'Creating...' : editData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestmentApplicationForm;

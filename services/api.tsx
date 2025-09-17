export const BASE_URL = 'http://localhost:3000';

function getAuthHeaders(): Record<string, string> {
  const user = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
  console.log('getAuthHeaders - Raw user from localStorage:', user);

  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      console.log('getAuthHeaders - Parsed user object:', parsedUser);
      console.log('getAuthHeaders - Available keys:', Object.keys(parsedUser));

      const token = parsedUser.token;
      if (token) {
        console.log('Auth headers - Token found:', token.substring(0, 20) + '...');
        console.log('Auth headers - Full token length:', token.length);
        return {
          Authorization: `Bearer ${token}`,
        };
      } else {
        console.log('Auth headers - No token found in user object');
        console.log('Auth headers - User object keys:', Object.keys(parsedUser));
      }
    } catch (error) {
      console.error('Auth headers - Error parsing user from localStorage:', error);
      console.error('Auth headers - Raw user string:', user);
    }
  } else {
    console.log('Auth headers - No user found in localStorage');
  }
  return {};
}

export async function registerUser(userData: any) {
  const response = await fetch(BASE_URL + '/merchant/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      businessName: userData.businessName,
      businessAlias: userData.businessAlias,
      phone: userData.phoneNumber,
      email: userData.email,
      currency: userData.currency,
      password: userData.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
}
export async function loginUserWithEmail(userData:any) {
  const response = await fetch(BASE_URL+'/merchant/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}
export async function forgotPassword(email: string) {
  const response = await fetch(BASE_URL + '/merchant/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }
  return data;
}
export async function resendOtp(email: string) {
  const response = await fetch(BASE_URL + '/merchant/resend-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP');
  }
  return data;
}
export async function verifyOtp(email: string, otp: string) {
  const response = await fetch(BASE_URL + '/merchant/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }
  return data;
}
export async function updatePassword(email: string, newPassword: string) {
  const response = await fetch(BASE_URL + '/merchant/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Password update failed');
  }
  return data;
}


// Collaborator APIs
export async function collaboratorForgotPassword(email: string) {
  const response = await fetch(BASE_URL + '/collaborator/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }
  return data;
}

export async function collaboratorResendOtp(email: string) {
  const response = await fetch(BASE_URL + '/collaborator/resend-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP');
  }
  return data;
}

export async function collaboratorVerifyOtp(email: string, otp: string) {
  const response = await fetch(BASE_URL + '/collaborator/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }
  return data;
}

export async function collaboratorUpdatePassword(email: string, newPassword: string) {
  const response = await fetch(BASE_URL + '/collaborator/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Password update failed');
  }
  return data;
}


export async function addAgent(agentData: { fullName: string; phoneNumber: string; email: string; password: string; branch: string; }) {
  // Get merchant ID from token
  const user = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
  let merchantId = null;

  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      merchantId = parsedUser.id;
    } catch (error) {
      console.error('Error parsing user for merchant ID:', error);
    }
  }

  const payload: any = {
    fullName: agentData.fullName,
    phoneNumber: agentData.phoneNumber,
    email: agentData.email,
    password: agentData.password,
    branch: agentData.branch,
  };
  if (merchantId) payload.merchantId = merchantId;

  const response = await fetch(BASE_URL + '/agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add agent');
  }
  return data;
}
export async function updateAgent(agentData: { id: number; fullName: string; phoneNumber: string; email: string; password: string; branch: string; status?: string; }) {
  const formData = new FormData();
  formData.append('id', String(agentData.id));
  formData.append('fullName', agentData.fullName);
  formData.append('phoneNumber', agentData.phoneNumber);
  formData.append('email', agentData.email);
  formData.append('password', agentData.password);
  formData.append('branch', agentData.branch);
  if (agentData.status) {
    formData.append('status', agentData.status);
  }
  
  const response = await fetch(BASE_URL + '/agents', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update agent');
  }
  return data;
}

export async function updateAgentStatus(agentId: number, status: string) {
  const formData = new FormData();
  formData.append('status', status);
  
  const response = await fetch(BASE_URL + `/agents/${agentId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update agent status');
  }
  return data;
}
export async function fetchAgents() {
  const response = await fetch(BASE_URL + '/agents', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch agents');
  }
  return data;
}
export async function createBranch(branchData: { name: string; state: string; location: string; }) {
  console.log('Creating branch with data:', branchData);

  // Get merchant ID from token
  const user = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
  let merchantId = null;

  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      merchantId = parsedUser.id;
      console.log('Merchant ID from token:', merchantId);
    } catch (error) {
      console.error('Error parsing user for merchant ID:', error);
    }
  }

  const formData = new FormData();
  formData.append('name', branchData.name);
  formData.append('state', branchData.state);
  formData.append('location', branchData.location);
  if (merchantId) {
    formData.append('merchantId', String(merchantId));
  }

  const headers = getAuthHeaders();
  console.log('Headers being sent:', headers);
  console.log('FormData contents:', { name: branchData.name, state: branchData.state, location: branchData.location, merchantId });

  const response = await fetch(BASE_URL + '/branches', {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  console.log('Response status:', response.status);
  const data = await response.json();
  console.log('Response data:', data);

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create branch');
  }
  return data;
}
export async function updateBranch(branchData: { id: number; name: string; state: string; location: string; }) {
  const formData = new FormData();
  formData.append('id', String(branchData.id));
  formData.append('name', branchData.name);
  formData.append('state', branchData.state);
  formData.append('location', branchData.location);
  const response = await fetch(BASE_URL + '/branches', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update branch');
  }
  return data;
}
export async function fetchBranches() {
  const response = await fetch(BASE_URL + '/branches', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch branches');
  }
  return data;
}
export async function deleteBranch(branchId: number) {
  const response = await fetch(BASE_URL + `/branches/${branchId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete branch');
  }
  return data;
}
export async function addCustomer(customerData: { fullName: string; phoneNumber: string; email: string; agentId: string; branchId: string; packageId?: string; accountNumber?: string; alias?: string; address?: string; }) {
  // Get merchant ID from token
  const user = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
  let merchantId: number | null = null;
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      merchantId = parsedUser.id;
    } catch (e) {
      console.error('Error parsing user for merchant ID:', e);
    }
  }

  const formData = new FormData();
  formData.append('fullName', customerData.fullName);
  formData.append('phoneNumber', customerData.phoneNumber);
  formData.append('email', customerData.email);
  if (customerData.alias) {
    formData.append('alias', customerData.alias);
  }
  if (customerData.address) {
    formData.append('address', customerData.address);
  }
  formData.append('agentId', customerData.agentId);
  formData.append('branchId', customerData.branchId);
  if (customerData.accountNumber) {
    formData.append('accountNumber', customerData.accountNumber);
  }
  if (customerData.packageId) {
    formData.append('packageId', customerData.packageId);
  }
  if (merchantId) {
    formData.append('merchantId', String(merchantId));
  }
  const response = await fetch(BASE_URL + '/customers', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add customer');
  }
  return data;
}
export async function fetchCustomers() {
  const response = await fetch(BASE_URL + '/customers', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch customers');
  }
  return data;
}
// Role APIs
export async function createRole(roleData: { roleName: string; cantView: number; canViewOnly: number; canEdit: number; permissions: Record<string, string>; }) {
  const formData = new FormData();
  formData.append('roleName', roleData.roleName);
  formData.append('cantView', String(roleData.cantView));
  formData.append('canViewOnly', String(roleData.canViewOnly));
  formData.append('canEdit', String(roleData.canEdit));
  formData.append('permissions', JSON.stringify(roleData.permissions));
  const response = await fetch(BASE_URL + '/roles', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create role');
  }
  return data;
}

export async function fetchRoles() {
  const response = await fetch(BASE_URL + '/roles', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch roles');
  }
  return data;
}

export async function updateRole(roleData: { id: number; roleName: string; cantView: number; canViewOnly: number; canEdit: number; permissions: Record<string, string>; }) {
  const formData = new FormData();
  formData.append('id', String(roleData.id));
  formData.append('roleName', roleData.roleName);
  formData.append('cantView', String(roleData.cantView));
  formData.append('canViewOnly', String(roleData.canViewOnly));
  formData.append('canEdit', String(roleData.canEdit));
  formData.append('permissions', JSON.stringify(roleData.permissions));
  const response = await fetch(BASE_URL + '/roles', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update role');
  }
  return data;
}
// Staff APIs
export async function createStaff(staffData: { branch: string; fullName: string; email: string; phoneNumber: string; role: string; }) {
  const formData = new FormData();
  formData.append('branch', staffData.branch);
  formData.append('fullName', staffData.fullName);
  formData.append('email', staffData.email);
  formData.append('phoneNumber', staffData.phoneNumber);
  formData.append('role', staffData.role);
  const response = await fetch(BASE_URL + '/staff', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create staff');
  }
  return data;
}

export async function listStaff() {
  const response = await fetch(BASE_URL + '/staff', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch staff');
  }
  return data;
}

export async function updateStaff(staffData: { id: number; branch: string; fullName: string; email: string; phoneNumber: string; role: string; status: string; }) {
  const formData = new FormData();
  formData.append('id', String(staffData.id));
  formData.append('branch', staffData.branch);
  formData.append('fullName', staffData.fullName);
  formData.append('email', staffData.email);
  formData.append('phoneNumber', staffData.phoneNumber);
  formData.append('role', staffData.role);
  formData.append('status', staffData.status);
  const response = await fetch(BASE_URL + '/staff', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update staff');
  }
  return data;
}

// Transaction APIs
export async function getUserTransactions() {
  const response = await fetch(BASE_URL + '/wallet/transactions', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch transactions');
  }
  return data;
}

export async function getTransactionById(id: string) {
  const response = await fetch(BASE_URL + `/wallet/transactions/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch transaction');
  }
  return data;
}

export async function createTransaction(transactionData: { type: string; amount: number; description: string; recipientId?: string; }) {
  const response = await fetch(BASE_URL + '/wallet/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(transactionData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create transaction');
  }
  return data;
}

// Summary APIs
export async function getUserSummary() {
  const response = await fetch(BASE_URL + '/api/summary', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user summary');
  }
  return data;
}

export async function getUserStats() {
  const response = await fetch(BASE_URL + '/api/user/stats', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user stats');
  }
  return data;
}

// Charges APIs
export async function createCharge(chargeData: { chargeName: string; type: string; amount: string; }) {
  const formData = new FormData();
  formData.append('chargeName', chargeData.chargeName);
  formData.append('type', chargeData.type);
  formData.append('amount', chargeData.amount);
  
  const response = await fetch(BASE_URL + '/charges', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create charge');
  }
  return data;
}

export async function assignCharge(assignData: { chargeName: string; amount: string; dueDate: string; customer: string; }) {
  const formData = new FormData();
  formData.append('chargeName', assignData.chargeName);
  formData.append('amount', assignData.amount);
  formData.append('dueDate', assignData.dueDate);
  formData.append('customer', assignData.customer);
  
  const response = await fetch(BASE_URL + '/charges/assign', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to assign charge');
  }
  return data;
}

export async function fetchCharges() {
  const response = await fetch(BASE_URL + '/charges', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch charges');
  }
  return data;
}

export async function fetchChargeHistory() {
  const response = await fetch(BASE_URL + '/charges/history', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch charge history');
  }
  return data;
}

export async function updateCharge(chargeData: { id: number; chargeName?: string; type?: string; amount?: string | number; }) {
  const response = await fetch(BASE_URL + '/charges', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(chargeData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update charge');
  }
  return data;
}

// Loan APIs (legacy - removed duplicate)

// Investment APIs
export async function createInvestment(investmentData: { customerName: string; amount: number; plan: string; duration: number; }) {
  const formData = new FormData();
  formData.append('customerName', investmentData.customerName);
  formData.append('amount', String(investmentData.amount));
  formData.append('plan', investmentData.plan);
  formData.append('duration', String(investmentData.duration));
  
  const response = await fetch(BASE_URL + '/investments', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create investment');
  }
  return data;
}

export async function fetchInvestments() {
  const response = await fetch(BASE_URL + '/investments', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch investments');
  }
  return data;
}

// Package APIs
export async function createPackage(packageData: { 
  name: string; 
  type: string; 
  amount: number; 
  seedAmount: number; 
  seedType: string; 
  period: number; 
  collectionDays: string; 
  duration: number; 
  benefits: string[]; 
  description?: string; 
  interestRate?: number;
  extraCharges?: number;
  defaultPenalty?: number;
  defaultDays?: number;
  // Loan-specific fields
  loanAmount?: number;
  loanInterestRate?: number;
  loanPeriod?: number;
  defaultAmount?: number;
  gracePeriod?: number;
  loanCharges?: number;
  packageCategory?: string;
}) {
  // Include merchantId
  const user = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
  let merchantId: number | null = null;
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      const possible = parsedUser?.id || parsedUser?.merchantId || parsedUser?.user?.id || parsedUser?.merchant?.id;
      if (possible) merchantId = Number(possible);
    } catch {}
  }
  const formData = new FormData();
  formData.append('name', packageData.name);
  formData.append('type', packageData.type);
  formData.append('amount', String(packageData.amount));
  formData.append('seedAmount', String(packageData.seedAmount));
  formData.append('seedType', packageData.seedType);
  formData.append('period', String(packageData.period));
  formData.append('collectionDays', packageData.collectionDays);
  formData.append('duration', String(packageData.duration));
  formData.append('benefits', JSON.stringify(packageData.benefits));
  if (merchantId) {
    formData.append('merchantId', String(merchantId));
  }
  if (packageData.description) {
    formData.append('description', packageData.description);
  }
  if (packageData.interestRate) {
    formData.append('interestRate', String(packageData.interestRate));
  }
  if (packageData.extraCharges) {
    formData.append('extraCharges', String(packageData.extraCharges));
  }
  if (packageData.defaultPenalty) {
    formData.append('defaultPenalty', String(packageData.defaultPenalty));
  }
  if (packageData.defaultDays) {
    formData.append('defaultDays', String(packageData.defaultDays));
  }
  // Loan-specific fields
  if (packageData.loanAmount) {
    formData.append('loanAmount', String(packageData.loanAmount));
  }
  if (packageData.loanInterestRate) {
    formData.append('loanInterestRate', String(packageData.loanInterestRate));
  }
  if (packageData.loanPeriod) {
    formData.append('loanPeriod', String(packageData.loanPeriod));
  }
  if (packageData.defaultAmount) {
    formData.append('defaultAmount', String(packageData.defaultAmount));
  }
  if (packageData.gracePeriod) {
    formData.append('gracePeriod', String(packageData.gracePeriod));
  }
  if (packageData.loanCharges) {
    formData.append('loanCharges', String(packageData.loanCharges));
  }
  if (packageData.packageCategory) {
    formData.append('packageCategory', packageData.packageCategory);
  }
  
  const response = await fetch(BASE_URL + '/packages', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create package');
  }
  return data;
}

export async function fetchPackages() {
  const response = await fetch(BASE_URL + '/packages', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch packages');
  }
  return data;
}

export async function updatePackage(packageData: { 
  id: number; 
  name: string; 
  type: string; 
  amount: number; 
  seedAmount: number; 
  seedType: string; 
  period: number; 
  collectionDays: string; 
  duration: number; 
  benefits: string[]; 
  description?: string; 
  status?: string; 
  interestRate?: number;
  extraCharges?: number;
  defaultPenalty?: number;
  defaultDays?: number;
  // Loan-specific fields
  loanAmount?: number;
  loanInterestRate?: number;
  loanPeriod?: number;
  defaultAmount?: number;
  gracePeriod?: number;
  loanCharges?: number;
  packageCategory?: string;
}) {
  const formData = new FormData();
  formData.append('id', String(packageData.id));
  formData.append('name', packageData.name);
  formData.append('type', packageData.type);
  formData.append('amount', String(packageData.amount));
  formData.append('seedAmount', String(packageData.seedAmount));
  formData.append('seedType', packageData.seedType);
  formData.append('period', String(packageData.period));
  formData.append('collectionDays', packageData.collectionDays);
  formData.append('duration', String(packageData.duration));
  formData.append('benefits', JSON.stringify(packageData.benefits));
  if (packageData.description) {
    formData.append('description', packageData.description);
  }
  if (packageData.status) {
    formData.append('status', packageData.status);
  }
  if (packageData.interestRate) {
    formData.append('interestRate', String(packageData.interestRate));
  }
  if (packageData.extraCharges) {
    formData.append('extraCharges', String(packageData.extraCharges));
  }
  if (packageData.defaultPenalty) {
    formData.append('defaultPenalty', String(packageData.defaultPenalty));
  }
  if (packageData.defaultDays) {
    formData.append('defaultDays', String(packageData.defaultDays));
  }
  // Loan-specific fields
  if (packageData.loanAmount) {
    formData.append('loanAmount', String(packageData.loanAmount));
  }
  if (packageData.loanInterestRate) {
    formData.append('loanInterestRate', String(packageData.loanInterestRate));
  }
  if (packageData.loanPeriod) {
    formData.append('loanPeriod', String(packageData.loanPeriod));
  }
  if (packageData.defaultAmount) {
    formData.append('defaultAmount', String(packageData.defaultAmount));
  }
  if (packageData.gracePeriod) {
    formData.append('gracePeriod', String(packageData.gracePeriod));
  }
  if (packageData.loanCharges) {
    formData.append('loanCharges', String(packageData.loanCharges));
  }
  if (packageData.packageCategory) {
    formData.append('packageCategory', packageData.packageCategory);
  }
  
  const response = await fetch(BASE_URL + '/packages', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update package');
  }
  return data;
}

export async function deletePackage(packageId: number) {
  const response = await fetch(BASE_URL + `/packages/${packageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete package');
  }
  return data;
}

// Add a new function to fetch loan packages specifically
export async function fetchLoanPackages(params?: { 
  status?: string; 
  search?: string; 
  type?: string; 
  page?: number; 
  limit?: number; 
}) {
  const queryParams = new URLSearchParams();
  queryParams.append('category', 'Loan');
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  
  const response = await fetch(BASE_URL + '/packages?' + queryParams.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch loan packages');
  }
  return data;
}

// Collection APIs
export async function createCollection(collectionData: { customerName: string; amount: number; dueDate: string; type: string; }) {
  const formData = new FormData();
  formData.append('customerName', collectionData.customerName);
  formData.append('amount', String(collectionData.amount));
  formData.append('dueDate', collectionData.dueDate);
  formData.append('type', collectionData.type);
  
  const response = await fetch(BASE_URL + '/collections', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create collection');
  }
  return data;
}

export async function fetchCollections() {
  const response = await fetch(BASE_URL + '/collections', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch collections');
  }
  return data;
}

// Wallet APIs
export async function getWalletBalance() {
  const response = await fetch(BASE_URL + '/wallet/balance', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch wallet balance');
  }
  return data;
}

export async function createWalletTransaction(transactionData: { type: string; amount: number; description: string; }) {
  const formData = new FormData();
  formData.append('type', transactionData.type);
  formData.append('amount', String(transactionData.amount));
  formData.append('description', transactionData.description);
  
  const response = await fetch(BASE_URL + '/wallet/transactions', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create wallet transaction');
  }
  return data;
}

export async function fetchWalletTransactions() {
  const response = await fetch(BASE_URL + '/wallet/transactions', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch wallet transactions');
  }
  return data;
}

export async function transferToCustomer(transferData: { customerId: number; amount: number; description?: string; transactionType?: string; type?: 'credit' | 'debit'; paymentMethod?: string; }) {
  const response = await fetch(BASE_URL + '/wallet/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(transferData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to complete transfer');
  }

  return data;
}

// Investment Application APIs
export async function createInvestmentApplication(applicationData: { 
  customerName: string; 
  accountNumber?: string; 
  targetAmount: number; 
  duration: number; 
  agentId?: number; 
  branch?: string; 
  notes?: string; 
}) {
  const formData = new FormData();
  formData.append('customerName', applicationData.customerName);
  if (applicationData.accountNumber) formData.append('accountNumber', applicationData.accountNumber);
  formData.append('targetAmount', String(applicationData.targetAmount));
  formData.append('duration', String(applicationData.duration));
  if (applicationData.agentId) formData.append('agentId', String(applicationData.agentId));
  if (applicationData.branch) formData.append('branch', applicationData.branch);
  if (applicationData.notes) formData.append('notes', applicationData.notes);
  
  const response = await fetch(BASE_URL + '/investment-applications', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create investment application');
  }
  return data;
}

export async function fetchInvestmentApplications(params?: { 
  status?: string; 
  search?: string; 
  fromDate?: string; 
  toDate?: string; 
  page?: number; 
  limit?: number; 
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  
  const response = await fetch(BASE_URL + '/investment-applications?' + queryParams.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch investment applications');
  }
  return data;
}

export async function updateInvestmentApplicationStatus(id: number, statusData: { 
  status: string; 
  notes?: string; 
  rejectionReason?: string; 
}) {
  const formData = new FormData();
  formData.append('status', statusData.status);
  if (statusData.notes) formData.append('notes', statusData.notes);
  if (statusData.rejectionReason) formData.append('rejectionReason', statusData.rejectionReason);
  
  const response = await fetch(BASE_URL + `/investment-applications/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update application status');
  }
  return data;
}

export async function deleteInvestmentApplication(id: number) {
  const response = await fetch(BASE_URL + `/investment-applications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete investment application');
  }
  return data;
}

export async function updateInvestmentApplication(id: number, applicationData: {
  targetAmount?: number;
  duration?: number;
  agentId?: number;
  branch?: string;
  notes?: string;
  status?: string;
}) {
  const formData = new FormData();
  if (applicationData.targetAmount !== undefined) formData.append('targetAmount', String(applicationData.targetAmount));
  if (applicationData.duration !== undefined) formData.append('duration', String(applicationData.duration));
  if (applicationData.agentId !== undefined) formData.append('agentId', String(applicationData.agentId));
  if (applicationData.branch !== undefined) formData.append('branch', applicationData.branch);
  if (applicationData.notes !== undefined) formData.append('notes', applicationData.notes);
  if (applicationData.status !== undefined) formData.append('status', applicationData.status);

  const response = await fetch(BASE_URL + `/investment-applications/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update investment application');
  }
  return data;
}

// Loan Application APIs
export async function createLoanApplication(applicationData: { 
  customerName: string; 
  accountNumber?: string; 
  requestedAmount: number; 
  interestRate: number;
  duration: number; 
  agentId?: number; 
  branch?: string; 
  notes?: string;
  purpose?: string;
  collateral?: string;
}) {
  const formData = new FormData();
  formData.append('customerName', applicationData.customerName);
  if (applicationData.accountNumber) formData.append('accountNumber', applicationData.accountNumber);
  formData.append('requestedAmount', String(applicationData.requestedAmount));
  formData.append('interestRate', String(applicationData.interestRate));
  formData.append('duration', String(applicationData.duration));
  if (applicationData.agentId) formData.append('agentId', String(applicationData.agentId));
  if (applicationData.branch) formData.append('branch', applicationData.branch);
  if (applicationData.notes) formData.append('notes', applicationData.notes);
  if (applicationData.purpose) formData.append('purpose', applicationData.purpose);
  if (applicationData.collateral) formData.append('collateral', applicationData.collateral);
  
  const response = await fetch(BASE_URL + '/loan-applications', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create loan application');
  }
  return data;
}

export async function fetchLoanApplications(params?: { 
  status?: string; 
  search?: string; 
  fromDate?: string; 
  toDate?: string; 
  page?: number; 
  limit?: number; 
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  
  const response = await fetch(BASE_URL + '/loan-applications?' + queryParams.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch loan applications');
  }
  return data;
}

export async function updateLoanApplicationStatus(id: number, statusData: { 
  status: string; 
  notes?: string; 
  rejectionReason?: string; 
}) {
  const formData = new FormData();
  formData.append('status', statusData.status);
  if (statusData.notes) formData.append('notes', statusData.notes);
  if (statusData.rejectionReason) formData.append('rejectionReason', statusData.rejectionReason);
  
  const response = await fetch(BASE_URL + `/loan-applications/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update application status');
  }
  return data;
}

export async function deleteLoanApplication(id: number) {
  const response = await fetch(BASE_URL + `/loan-applications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete loan application');
  }
  return data;
}

// Loan APIs
export async function createLoan(loanData: { 
  customerName: string; 
  accountNumber?: string; 
  loanAmount: number; 
  interestRate: number; 
  duration: number; 
  agentId?: number; 
  branch?: string; 
  notes?: string;
  dueDate: string;
}) {
  const response = await fetch(BASE_URL + '/loans', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(loanData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create loan');
  }
  return data;
}

export async function fetchLoans(params: {
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  agentId?: string;
}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });

  const response = await fetch(BASE_URL + `/loans?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch loans');
  }
  return data;
}

export async function updateLoanStatus(id: number, statusData: { status: string; notes?: string }) {
  const response = await fetch(BASE_URL + `/loans/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(statusData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update loan status');
  }
  return data;
}

export async function deleteLoan(id: number) {
  const response = await fetch(BASE_URL + `/loans/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete loan');
  }
  return data;
}

export async function fetchLoanStats() {
  const response = await fetch(BASE_URL + '/loans/stats/summary', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch loan statistics');
  }
  return data;
}

// Repayment APIs
export async function createRepayment(repaymentData: { 
  loanId: number; 
  customerName: string; 
  accountNumber?: string; 
  package?: string; 
  amount: number; 
  branch?: string; 
  agentId?: number; 
  paymentMethod?: string; 
  reference?: string; 
  notes?: string;
}) {
  const response = await fetch(BASE_URL + '/repayments', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(repaymentData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create repayment');
  }
  return data;
}

export async function fetchRepayments(params: {
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  agentId?: string;
}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });

  const response = await fetch(BASE_URL + `/repayments?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch repayments');
  }
  return data;
}

export async function updateRepaymentStatus(id: number, statusData: { status: string; notes?: string }) {
  const response = await fetch(BASE_URL + `/repayments/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(statusData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update repayment status');
  }
  return data;
}

export async function deleteRepayment(id: number) {
  const response = await fetch(BASE_URL + `/repayments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete repayment');
  }
  return data;
}

export async function fetchRepaymentStats() {
  const response = await fetch(BASE_URL + '/repayments/stats/summary', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch repayment statistics');
  }
  return data;
}

// Dashboard Statistics API functions
export async function fetchDashboardStats() {
  const response = await fetch(BASE_URL + '/dashboard/stats', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch dashboard statistics');
  }
  return data;
}

export async function fetchTransactionStats(duration = 'Last 12 months') {
  const response = await fetch(BASE_URL + `/dashboard/transaction-stats?duration=${encodeURIComponent(duration)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch transaction statistics');
  }
  return data;
}

export async function fetchAgentCustomerStats() {
  const response = await fetch(BASE_URL + '/dashboard/agent-customer-stats', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch agent-customer statistics');
  }
  return data;
}

// Customer Wallet APIs
export async function fetchCustomerWallets(params: {
  page?: number;
  limit?: number;
  search?: string;
  accountLevel?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });

  const response = await fetch(BASE_URL + `/customer-wallets?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch customer wallets');
  }
  return data;
}

export async function fetchCustomerWalletById(id: number) {
  const response = await fetch(BASE_URL + `/customer-wallets/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch customer wallet');
  }
  return data;
}

export async function createCustomerWallet(walletData: {
  customerId: number;
  accountNumber?: string;
  accountLevel?: string;
  balance?: number;
  notes?: string;
}) {
  const response = await fetch(BASE_URL + '/customer-wallets', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(walletData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create customer wallet');
  }
  return data;
}

export async function updateCustomerWallet(id: number, walletData: {
  accountLevel?: string;
  balance?: number;
  status?: string;
  notes?: string;
}) {
  const response = await fetch(BASE_URL + `/customer-wallets/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(walletData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update customer wallet');
  }
  return data;
}

export async function deleteCustomerWallet(id: number) {
  const response = await fetch(BASE_URL + `/customer-wallets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete customer wallet');
  }
  return data;
}

export async function fetchCustomerWalletStats() {
  const response = await fetch(BASE_URL + '/customer-wallets/stats/summary', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch customer wallet statistics');
  }
  return data;
}
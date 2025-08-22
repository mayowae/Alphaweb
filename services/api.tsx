export const BASE_URL = 'http://localhost:3000';
export async function registerUser(userData: any) {
  const formData = new FormData();
  formData.append('business_name', userData.businessName);
  formData.append('business_alias', userData.businessAlias);
  formData.append('phone', userData.phoneNumber);
  formData.append('email', userData.email);
  formData.append('currency', userData.currency);
  formData.append('password', userData.password);

  const response = await fetch(BASE_URL + '/merchant/register', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
}
export async function loginUserWithEmail(userData:any) {
  const formData = new FormData();
  formData.append('email', userData.email);
  formData.append('password', userData.password);

  const response = await fetch(BASE_URL+'/merchant/login', {
    method: 'POST',
    body: formData, // Do NOT set Content-Type manually
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}
export async function forgotPassword(email: string) {
  const formData = new FormData();
  formData.append('email', email);
  const response = await fetch(BASE_URL + '/merchant/forgot-password', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }
  return data;
}
export async function resendOtp(email: string) {
  const formData = new FormData();
  formData.append('email', email);
  const response = await fetch(BASE_URL + '/merchant/resend-otp', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP');
  }
  return data;
}
export async function verifyOtp(email: string, otp: string) {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('otp', otp);
  const response = await fetch(BASE_URL + '/merchant/verify-otp', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }
  return data;
}
export async function updatePassword(email: string, newPassword: string) {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('newPassword', newPassword);
  const response = await fetch(BASE_URL + '/merchant/change-password', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Password update failed');
  }
  return data;
}


// Collaborator APIs
export async function collaboratorForgotPassword(email: string) {
  const formData = new FormData();
  formData.append('email', email);
  const response = await fetch(BASE_URL + '/collaborator/collaborator/forgot-password', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }
  return data;
}

export async function collaboratorResendOtp(email: string) {
  const formData = new FormData();
  formData.append('email', email);
  const response = await fetch(BASE_URL + '/collaborator/resend-otp', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to resend OTP');
  }
  return data;
}

export async function collaboratorVerifyOtp(email: string, otp: string) {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('otp', otp);
  const response = await fetch(BASE_URL + '/collaborator/verify-otp', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }
  return data;
}

export async function collaboratorUpdatePassword(email: string, newPassword: string) {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('new_password', newPassword);
  const response = await fetch(BASE_URL + '/collaborator/change-password', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Password update failed');
  }
  return data;
}


export async function addAgent(agentData: { fullName: string; phoneNumber: string; email: string; password: string; branch: string; }) {
  const formData = new FormData();
  formData.append('fullName', agentData.fullName);
  formData.append('phoneNumber', agentData.phoneNumber);
  formData.append('email', agentData.email);
  formData.append('password', agentData.password);
  formData.append('branch', agentData.branch);
  const response = await fetch(BASE_URL + '/agent/register', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add agent');
  }
  return data;
}
export async function updateAgent(agentData: { id: number; fullName: string; phoneNumber: string; email: string; password: string; branch: string; }) {
  const formData = new FormData();
  formData.append('id', String(agentData.id));
  formData.append('fullName', agentData.fullName);
  formData.append('phoneNumber', agentData.phoneNumber);
  formData.append('email', agentData.email);
  formData.append('password', agentData.password);
  formData.append('branch', agentData.branch);
  const response = await fetch(BASE_URL + '/agent/update', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update agent');
  }
  return data;
}
export async function fetchAgents() {
  const response = await fetch(BASE_URL + '/agent/list', {
    method: 'GET',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch agents');
  }
  return data;
}
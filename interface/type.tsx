
export interface Sidebarmenu {
    title:string;
    path:string;
    icon: string;
    submenu?:boolean,
    submenuitems?:Sidebarmenu[];

}

export interface InvestmentTransaction {
    id: string;
    customer: string;
    accountNumber: string;
    package: string;
    amount: string;
    branch: string;
    agent: string;
    date: string;
    status?: 'pending' | 'completed' | 'cancelled';
    transactionType?: 'deposit' | 'withdrawal' | 'interest' | 'penalty';
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MerchantData {
    id: string;
    package: string;
    account: string;
    amount: string;
    customer: string;
    method:string;
    status: string;
    created: string;
  }
  export interface datas {
    id:string;
    title:string;
    desc:string;
  }
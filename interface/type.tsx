
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
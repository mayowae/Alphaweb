import { Sidebarmenu } from "../../interface/type"

export const Sidemenuitems: Sidebarmenu[] =[
    {
        title:"Dashboard",
        path: "/dashboard",
        icon: "/icons/Sidebar.png",

    },

     {
        title:"Branch Management",
        path: "/dashboard/branchManagement",
        icon: "/icons/Sidebar.png",

    },

     {
        title:"Agents",
        path: "/dashboard/agents",
        icon: "/icons/Sidebar.png",

    },

     {
        title:"Package",
        path: "/dashboard/package",
        icon: "/icons/Sidebar.png",
        submenu: true,
        submenuitems: [
            {title: 'Collection', path: "/dashboard/package/collection", icon: "/icons/brown.png"},
            {title: 'Loan', path: "/dashboard/package/loan", icon: "/icons/blue.png"},
            {title: 'Investment', path: "/dashboard/package/investment", icon: "/icons/green.png"}

        ]

    },

    {
        title:"Collection",
        path: "/dashboard/collection",
        icon: "/icons/Sidebar.png",
        submenu: true,
        submenuitems: [
            {title: 'Collections', path: "/dashboard/collection/collections", icon: "/icons/brown.png"},
            {title: 'Remittance', path: "/dashboard/collection/remittance", icon: "/icons/green.png"},
           
        ]

    },

     {
        title:"Loan",
        path: "/dashboard/loan",
        icon: "/icons/Sidebar.png",
        submenu: true,
        submenuitems: [
            {title: 'Applications', path: "/dashboard/loan/applications", icon: "/icons/blue.png"},
            {title: 'Loans', path: "/dashboard/loan/loans", icon: "/icons/Vector.png"},
            {title: 'Repayments', path: "/dashboard/loan/repayments", icon: "/icons/green.png"}

        ]

    },

    {
        title:"Investment",
        path: "/dashboard/investment",
        icon: "/icons/Sidebar.png",
        submenu: true,
        submenuitems: [
            {title: 'Applications', path: "/dashboard/investment/applications", icon: "/icons/green.png"},
            {title: 'Investments', path: "/dashboard/investment/investments", icon: "/icons/Vector.png"},
            {title: 'Transactions', path: "/dashboard/investment/transactions", icon: "/icons/brown.png"}

        ]

    },

     {
        title:"Accounting",
        path: "/dashboard/accounting",
        icon: "/icons/Sidebar.png",
        submenu: true,
        submenuitems: [
            {title: 'Accounting', path: "/dashboard/accounting", icon: "/icons/green.png"},
           
        ]

    },


    {
        title:"Customer",
        path: "/dashboard/customer",
        icon: "/icons/Sidebar.png",

    },


    {
        title:"Wallet",
        path: "/dashboard/wallet",
        icon: "/icons/Sidebar.png",

    },

    {
        title:"Charges",
        path: "/dashboard/charges",
        icon: "/icons/Sidebar.png",

    },

    {
        title:"Staff Management",
        path: "/dashboard/staffManagement",
        icon: "/icons/Sidebar.png",

    },


]


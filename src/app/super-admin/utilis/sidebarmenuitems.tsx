import { Sidebarmenu } from "../interface/type";
import { datas } from "../interface/type"; 

export const Sidemenuitems: Sidebarmenu[] =[
    {
        title:"Dashboard",
        path: "/super-admin/dashboard",
        icon: "/icons/sidebar.svg",

    },

     {
        title:"Merchants",
        path: "/super-admin/dashboard/merchants",
        icon: "/icons/merchant.svg",

    },

     {
        title:"Transactions",
        path: "/super-admin/dashboard/transactions",
        icon: "/icons/transaction.svg",

    },

     
    {
        title:"Plans & billings",
        path: "/super-admin/dashboard/billings",
        icon: "/icons/billing.svg",

    },


    {
        title:"Audit logs",
        path: "/dashboard/auditlogs",
        icon: "/icons/audits.svg",

    },

    {
        title:"Staff",
        path: "/dashboard/staffs",
        icon: "/icons/staff.svg",

    },

    {
        title:"Support",
        path: "/dashboard/support",
        icon: "/icons/support.svg",

    },


]





export const data: datas [] = [

    {
      id: "1",
      title: "Organization_ID",
      desc: "MRCH-1023ASDTIYUPIUYHSTYUHFG",
    },
    {
      id: "2",
      title: "Phone_number",
      desc: "+234706564657",
    },
    {
      id: "3",
      title: "No_of_Agents",
      desc: "23",
    },
    {
      id: "4",
      title: "Date_created",
      desc: "23 Jan, 2025 -10:00",

    },
    {
      id: "5",
      title: "Business_name",
      desc: "Ruppet Micro-finance bank",
    },
    {
      id: "6",
      title: "Email",
      desc: "tolu@gmail.com",
    },
    {
      id: "7",
      title: "No_of_Customers",
      desc: "345",
    },
    {
      id: "8",
      title: "  Status",
      desc: "Active",
    },
    {
      id: "9",
      title: "Business_alias",
      desc: "23",
    },
    {
      id: "10",
      title: "  Present_plan",
      desc: "Basic",
    },
    {
      id: "11",
      title: "No_of_Branches",
      desc: "4"
    }

  ]

export interface faqss {
    id: number;
    question: string;
    answer: string;
}

interface help {
    icon: string,
    slug: string;
    title: string;
    text: string;
    faqs: faqss[];
}

export const helpCategories: help[] = [
    {
        icon: "/icons/started.svg",
        slug: "getting-started",
        title: "Getting Started",
        text: "Set up your account and begin quickly.",
        faqs: [
            {
                id: 1,
                question: "How do I create an account?",
                answer: "Click the signup button and complete the form."
            },
            {
                id: 2,
                question: "How do I login?",
                answer: "Enter your email and password."
            }
        ]
    },

    {
        icon: "/icons/dashboard.svg",
        slug: "merchant-dashboard",
        title: "Merchant Dashboard",
        text: "Set up your account and begin quickly.",
        faqs: [
            {
                id: 1,
                question: "How do I track transactions?",
                answer: "Go to Dashboard → Transactions."
            },
            {
                id: 2,
                question: "How do I withdraw?",
                answer: "Open Wallet → Withdraw."
            }
        ]
    },


    {
        icon: "/icons/agents.svg",
        slug: "agents",
        title: "Agents",
        text: "Set up your account and begin quickly.",
        faqs: [
            {
                id: 1,
                question: "How do I add a new agent?",
                answer: "Go to Agents → Add New Agent and fill out the details."
            },
            {
                id: 2,
                question: "Can agents manage customer accounts?",
                answer: "Agents can only access permissions assigned to them."
            },
            {
                id: 3,
                question: "How do I deactivate an agent?",
                answer: "Open the agent profile and click Deactivate."
            }
        ]
    },

    {
        icon: "/icons/customers.svg",
        slug: "customers",
        title: "Customers",
        text: "Set up your account and begin quickly.",
        faqs: [
            {
                id: 1,
                question: "How do I view my customers?",
                answer: "Navigate to Dashboard → Customers to see all customer accounts."
            },
            {
                id: 2,
                question: "Can I block a customer?",
                answer: "Yes, click on the customer's profile and select Block."
            },
            {
                id: 3,
                question: "How do I resolve customer complaints?",
                answer: "Check the Support → Complaints section for customer reports."
            }
        ]
    },


    {
        icon: "/icons/billings.svg",
        slug: "billings-plans",
        title: "Billings & Plans",
        text: "Set up your account and begin quickly.",
        faqs: [
            {
                id: 1,
                question: "How do I upgrade my plan?",
                answer: "Go to Settings → Billing → Choose a plan and complete payment."
            },
            {
                id: 2,
                question: "What payment methods are supported?",
                answer: "We support card payments, bank transfers, and wallet payments."
            },
            {
                id: 3,
                question: "Will my plan renew automatically?",
                answer: "Yes, all plans renew automatically unless you cancel manually."
            }
        ]
    },


    {
        icon: "/icons/security.svg",
        slug: "security-compliance",
        title: "Security & Compliance",
        text: "Set up your account and begin quickly.",
        faqs: [
            {
                id: 1,
                question: "How is my data protected?",
                answer: "We use industry-grade encryption and secure storage for all data."
            },
            {
                id: 2,
                question: "Do you comply with data regulations?",
                answer: "Yes, we comply with GDPR, NDPR, and other relevant policies."
            },
            {
                id: 3,
                question: "How can I report a security issue?",
                answer: "Send an email to security@yourapp.com or use the Support page."
            }
        ]
    }
];


interface contacts {
    icon: string,
    title: string,
    text: string,
    link: string
}


export const contact: contacts[] = [
    {
        icon: "/icons/caht.svg",
        title: "Live Chat",
        text: "Chat instantly with our support team",
        link: "Click to chat"
    },
    {
        icon: "/icons/caht.svg",
        title: "Email support",
        text: "Send us a message anytime",
        link: "Support@alphakolect.com"
    },
    {
        icon: "/icons/caht.svg",
        title: "Phone Support",
        text: "Direct line for enterprise clients only",
        link: "+23470662112467"
    }
]
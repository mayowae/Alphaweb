import re

file_path = r'C:\Users\trade\Documents\Alphaweb-main\local_edit\main_page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove common merge markers pattern
# Note: This is an aggressive cleanup for this specific file context
patterns = [
    r'<<<<<<< HEAD\n',
    r'=======\n',
    r'>>>>>>> c8679db .*\n'
]

cleaned = content
# Manually cleaning the faqs specifically to avoid messy regex
faqs_clean = """  const faqs = [
    {
      question: "What is Alphakolect?",
      answer: "Alphakolect is a Daily Contribution, Loans (Microcredit) and Target Savings management solution. It comprises of Web part (for Administration, support and reports), Agent Mobile App (for Agents to interface with customers) and Customer App (for Customers to engage and follow up transactions with their respective merchant).",
    },
    {
      question: "Who can use Alphakolect?",
      answer: "Any microfinance institution that engages in the traditional Daily Contribution system with customers.",
    },
    {
      question: "How does Alphakolect help financial institutions?",
      answer: "Transparently monitoring of transactions by customers, and Microfinance Institution owners",
    },
    {
      question: "What can agents do with the Alphakolect app?",
      answer: "Agents can process and track transactions via the Agent mobile app..",
    },
    {
      question: "What benefits do end-user customers get?",
      answer: "Customers can track transactions, make requests to their respective merchants and get support via the Customer Mobile App.",
    }, {
      question: "Is Alphakolect secure?",
      answer: "Alphakolect is hosted or secured dedicated servers with encrypted connections.",
    },
    {
      question: "How does pricing work?",
      answer: "There are 5 plans available; Starter, Growth, Mid-Level, Large and Enterprise plans. All newly registered merchants are however automatically placed in Starter level while upgrading to other levels flexibly as the business grows. Details in the Pricing section.",
    },
    {
      question: "How long does it take to get started?",
      answer: "Register and start using Alphakolect instantly. User guides are available for further understanding while online and physical (onsite) training can be arranged for the staff.",
    },
    {
      question: "Where can I get support?",
      answer: "For support and enquiries, Send email to support@alphakolect.com or WhatsApp and calls via (234-9050226306)",
    },
  ];"""

# Replace the faqs block
start_marker = "  const faqs = ["
end_marker = "  ];"
# Find the first occurrence of faqs block
start_idx = cleaned.find(start_marker)
end_idx = cleaned.find(end_marker, start_idx) + len(end_marker)

if start_idx != -1 and end_idx != -1:
    final_content = cleaned[:start_idx] + faqs_clean + cleaned[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Main page cleaned successfully.")
else:
    print("Could not find faqs block.")

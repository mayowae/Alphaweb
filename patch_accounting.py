import os

target_file = 'live_accountingController.js'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

target = """// Get all accounts
const getAccounts = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { type, category, isActive } = req.query;"""

replacement = """// Get all accounts
const getAccounts = async (req, res) => {
  try {
    const merchantId = req.user.id;
    
    // Auto-seed default accounts if they don't exist yet
    const { seedDefaultAccounts } = require('../utils/doubleEntry');
    await seedDefaultAccounts(merchantId);

    const { type, category, isActive } = req.query;"""

content_norm = content.replace('\r\n', '\n')
target_norm = target.replace('\r\n', '\n')
replacement_norm = replacement.replace('\r\n', '\n')

if target_norm in content_norm:
    new_content = content_norm.replace(target_norm, replacement_norm)
    with open(target_file, 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)
    print("SUCCESS: accountingController successfully patched!")
else:
    print("ERROR: Target content not found in accountingController.js!")

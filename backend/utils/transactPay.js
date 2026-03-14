const forge = require('node-forge');
const fetch = require('node-fetch');

const PUBLIC_KEY = process.env.TRANSACTPAY_PUBLIC_KEY;
const SECRET_KEY = process.env.TRANSACTPAY_SECRET_KEY;
const ENCRYPTION_KEY_BASE64 = process.env.TRANSACTPAY_ENCRYPTION_KEY_BASE64;

const encryptPayload = (payload) => {
    try {
        // 1. Decode Base64
        let xmlString = Buffer.from(ENCRYPTION_KEY_BASE64, 'base64').toString('utf8');
        
        // 2. Remove '4096!' prefix if present
        if (xmlString.startsWith('4096!')) {
            xmlString = xmlString.substring(5);
        }

        // 3. Extract Modulus and Exponent basic regex
        const modulusMatch = xmlString.match(/<Modulus>(.*?)<\/Modulus>/);
        const exponentMatch = xmlString.match(/<Exponent>(.*?)<\/Exponent>/);

        if (!modulusMatch || !exponentMatch) {
            throw new Error('Invalid RSA XML Key Format');
        }

        const modulusB64 = modulusMatch[1];
        const exponentB64 = exponentMatch[1];

        // 4. Decode Modulus and Exponent from Base64
        const modulusBytes = forge.util.decode64(modulusB64);
        const exponentBytes = forge.util.decode64(exponentB64);

        const modulus = new forge.jsbn.BigInteger(forge.util.bytesToHex(modulusBytes), 16);
        const exponent = new forge.jsbn.BigInteger(forge.util.bytesToHex(exponentBytes), 16);

        // 5. Create Public Key
        const publicKey = forge.pki.setRsaPublicKey(modulus, exponent);

        // 6. Encrypt Data (RSAES-PKCS1-V1_5)
        const jsonString = JSON.stringify(payload);
        const encryptedBytes = publicKey.encrypt(jsonString, 'RSAES-PKCS1-V1_5');

        // 7. Base64 Encode
        return forge.util.encode64(encryptedBytes);

    } catch (error) {
        console.error('Encryption Error:', error);
        throw error;
    }
};

const createVirtualAccount = async (userData) => {
    try {
        console.log('Creating virtual account for:', userData.email);

        const payload = {
            firstname: userData.firstname || userData.businessName || 'Merchant',
            lastname: userData.lastname || 'User',
            email: userData.email,
            phonenumber: userData.phoneNumber || userData.phone,
            dob: "1990-01-01",
            bvn: userData.bvn || "22222222222",
            gender: "M",
            address: userData.address || "Lagos, Nigeria",
            title: "Mr",
            state: "Lagos",
            lga: "Ikeja",
            tx_ref: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };
        
        console.log('Payload before encryption:', payload);

        const encryptedData = encryptPayload(payload);

        const apiUrl = process.env.TRANSACTPAY_API_URL || 'https://payment-api-service.transactpay.ai/payment/virtual-account/create';
        const response = await fetch(apiUrl, { 
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'api-key': PUBLIC_KEY, 
                 'Authorization': `Bearer ${SECRET_KEY}` 
             },
             body: JSON.stringify({
                 data: encryptedData
             })
         });

        const text = await response.text();
        console.log('TransactPay Raw Response:', response.status, text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON response:', e);
            if (response.ok) return { status: 'success', data: {} };
            throw new Error(`API Error ${response.status}: ${text}`);
        }
        
        console.log('TransactPay API Response:', JSON.stringify(result, null, 2));

        if (result.status === 'success' || result.status === true || result.message === 'Success') {
            const data = result.data || result;
            return {
                status: 'success',
                accountNumber: data.accountNumber || data.account_number,
                bankName: data.bankName || data.bank_name,
                accountName: data.accountName || data.account_name,
                bankCode: data.bankCode || data.bank_code,
                data: data
            };
        }

        return result;

    } catch (error) {
        console.error('createVirtualAccount Error:', error);
        return null;
    }
};

const getWalletBalance = async (accountNumber) => {
    try {
        const apiUrl = `https://payment-api-service.transactpay.ai/payment/virtual-account/balance/${accountNumber}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'api-key': PUBLIC_KEY,
                'Authorization': `Bearer ${SECRET_KEY}`
            }
        });

        const result = await response.json();
        if (result.status === 'success' || result.status === true) {
            return result.data || result;
        }
        return null;
    } catch (error) {
        console.error('getWalletBalance Error:', error);
        return null;
    }
};

const getWalletTransactions = async (accountNumber) => {
    try {
        const apiUrl = `https://payment-api-service.transactpay.ai/payment/virtual-account/transactions/${accountNumber}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'api-key': PUBLIC_KEY,
                'Authorization': `Bearer ${SECRET_KEY}`
            }
        });

        const result = await response.json();
        if (result.status === 'success' || result.status === true) {
            return result.data || result.transactions || [];
        }
        return [];
    } catch (error) {
        console.error('getWalletTransactions Error:', error);
        return [];
    }
};

module.exports = {
    createVirtualAccount,
    getWalletBalance,
    getWalletTransactions
};

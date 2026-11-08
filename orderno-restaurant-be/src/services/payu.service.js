const axios = require('axios');
const PAYU_CLIENT_ID = process.env.PAYU_CLIENT_ID;
const PAYU_CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET;
const PAYU_BASE_URL = process.env.PAYU_BASE_URL;
const createOuthToken = async () => {
    const res = await axios.get(PAYU_BASE_URL+"pl/standard/user/oauth/authorize",{
        params: {
            grant_type: "client_credentials",
            client_id: PAYU_CLIENT_ID,
            client_secret: PAYU_CLIENT_SECRET
        }
    });
    return res.data.access_token;
};

const retrievePaymentMethods = async (token) => {
    const res = await axios.get(PAYU_BASE_URL+"api/v2_1/payment-methods",{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
}
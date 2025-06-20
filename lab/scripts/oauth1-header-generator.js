const OAuth = require('oauth-1.0a');
const CryptoJS = require('crypto-js');
require('dotenv').config({ path: '../../.env' });

// Load variables from env
const consumerKey = process.env.COMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.COMMERCE_CONSUMER_SECRET;
const accessToken = process.env.COMMERCE_ACCESS_TOKEN;
const accessTokenSecret = process.env.COMMERCE_ACCESS_TOKEN_SECRET;
const baseUrl = process.env.COMMERCE_BASE_URL;
const method = process.argv[2] || process.env.HTTP_METHOD;
const endpointPath = process.argv[3] || process.env.ENDPOINT_PATH;

const signatureMethod = 'HMAC-SHA256';

// Create OAuth 1.0a client
const oauth = OAuth({
    consumer: {
        key: consumerKey,
        secret: consumerSecret
    },
    signature_method: signatureMethod,
    hash_function(base_string, key) {
        return CryptoJS.HmacSHA256(base_string, key).toString(CryptoJS.enc.Base64);
    }
});

const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

const url = cleanBaseUrl.endsWith('/rest')
    ? `${cleanBaseUrl}${cleanPath}`
    : `${cleanBaseUrl}/rest${cleanPath}`;

const requestData = {
    url: url,
    method: method.toUpperCase()
};

const token = {
    key: accessToken,
    secret: accessTokenSecret
};

// Generate Authorization header
const authHeader = oauth.toHeader(oauth.authorize(requestData, token));
console.log(authHeader.Authorization)

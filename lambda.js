// This Lambda function handles the OAuth 2.0 authorization code handoff
// for the Bungie API. It's triggered by an API Gateway endpoint.

import https from 'node:https';
import querystring from 'node:querystring';

export async function handler(event) {
    // Check and log missing environment variables at the start
    const missingEnvVars = [];
    if (!process.env.CLIENT_ID) missingEnvVars.push('CLIENT_ID');
    if (!process.env.CLIENT_SECRET) missingEnvVars.push('CLIENT_SECRET');
    if (!process.env.API_KEY) missingEnvVars.push('API_KEY');
    if (!process.env.REDIRECT_URI) missingEnvVars.push('REDIRECT_URI');
    if (missingEnvVars.length > 0) {
        console.error('Missing environment variables:', missingEnvVars.join(', '));
    }

    console.log('Received event:', JSON.stringify(event, null, 2));

    // CORS: Only allow 127.0.0.1, localhost (http/https), and https://forgehub.app/
    const allowedOrigins = [
        'http://127.0.0.1',
        'https://127.0.0.1',
        'http://localhost',
        'https://localhost',
        'https://forgehub.app'
    ];
    const requestOrigin = event.headers?.origin || event.headers?.Origin || '';
    const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : '';

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            body: ''
        };
    }

    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        console.error('Failed to parse request body:', e);
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            body: JSON.stringify({ message: 'Invalid request body format.' }),
        };
    }

    const { code, state } = requestBody || {};

    if (!code || !state) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            body: JSON.stringify({ message: 'Missing authorization code or state parameter in body.' }),
        };
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const apiKey = process.env.API_KEY;
    const redirectUri = process.env.REDIRECT_URI;

    if (!clientId || !clientSecret || !apiKey || !redirectUri) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            body: JSON.stringify({ message: 'Server configuration error: Missing environment variables.' }),
        };
    }
    
    try {
        // Step 1: Exchange the authorization code for tokens
        const tokenUrl = 'https://www.bungie.net/Platform/App/OAuth/Token/';
        const postData = querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri
        });

        const tokenResponse = await new Promise((resolve, reject) => {
            const req = https.request(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-API-Key': apiKey,
                    'Content-Length': postData.length
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            reject(new Error('Failed to parse Bungie token response.'));
                        }
                    } else {
                        // Log the full error from Bungie's API
                        console.error(`Bungie API token exchange failed with status ${res.statusCode}. Body: ${data}`);
                        reject(new Error(`Bungie API token exchange failed: ${res.statusCode}. Detail: ${data}`));
                    }
                });
            });
            req.on('error', e => reject(e));
            req.write(postData);
            req.end();
        });

        const bungieNetMembershipId = tokenResponse.membership_id;

        // Step 2: Get all linked profiles using the Bungie.net membership ID
        const linkedProfilesUrl = `https://www.bungie.net/Platform/Destiny2/254/Profile/${bungieNetMembershipId}/LinkedProfiles/`;

        const linkedProfilesResponse = await new Promise((resolve, reject) => {
            const req = https.get(linkedProfilesUrl, {
                headers: { 'X-API-Key': apiKey }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            reject(new Error('Failed to parse linked profiles response.'));
                        }
                    } else {
                        // Log the full error from Bungie's API
                        console.error(`Linked profiles lookup failed with status ${res.statusCode}. Body: ${data}`);
                        reject(new Error(`Linked profiles lookup failed: ${res.statusCode}. Detail: ${data}`));
                    }
                });
            });
            req.on('error', e => reject(e));
            req.end();
        });

        // Step 3: Extract the primary membership type and ID for Destiny 2.
        // For simplicity, we'll take the first linked profile's membership type.
        const destinyProfile = linkedProfilesResponse.Response.profiles?.find(p => p.membershipType !== 254);
        const destinyMembershipType = destinyProfile ? destinyProfile.membershipType : null;
        
        // Step 4: Combine the data and send it to the frontend
        const finalResponse = {
            ...tokenResponse,
            bungieNetMembershipId,
            membership_type: destinyMembershipType,
            linkedProfiles: linkedProfilesResponse.Response
        };

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            body: JSON.stringify(finalResponse),
        };

    } catch (error) {
        console.error('Unhandled error in handler:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            body: JSON.stringify({ message: 'Internal Server Error', detail: error.message }),
        };
    }
}

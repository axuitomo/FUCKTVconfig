import { SignJWT, jwtVerify } from 'jose';
import { html } from './html.js';

// Format Examples
const formatExamples = {
    "LunaTV/MoonTV": {
        "spider": "https://example.com/spider.jar",
        "sites": [
            { "key": "site1", "name": "Site 1", "type": 3, "api": "csp_Site1", "searchable": 1, "quickSearch": 1, "filterable": 1 }
        ],
        "lives": [
            { "name": "Live 1", "type": 0, "url": "http://example.com/live.m3u8" }
        ]
    },
    "Omnibox": {
        "urls": [
            { "name": "Source 1", "url": "https://example.com/api" }
        ],
        "parses": [
            { "name": "Parse 1", "url": "https://example.com/parse" }
        ]
    }
};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Routes
        if (url.pathname === '/' && request.method === 'GET') {
            return new Response(html, {
                headers: { 'Content-Type': 'text/html;charset=UTF-8' }
            });
        }

        if (url.pathname === '/auth' && request.method === 'POST') {
            return handleAuth(request, env, corsHeaders);
        }

        if (url.pathname === '/api/convert' && request.method === 'POST') {
            return handleConvert(request, env, corsHeaders);
        }

        if (url.pathname === '/api/status' && request.method === 'GET') {
            return handleStatus(request, env, corsHeaders);
        }

        if (url.pathname === '/api/test' && request.method === 'POST') {
            return handleTestAPI(request, env, corsHeaders);
        }

        if (url.pathname === '/favicon.ico' && request.method === 'GET') {
            return new Response(null, { status: 204 });
        }

        return new Response('Not Found', { status: 404 });
    }
};

async function handleAuth(request, env, corsHeaders) {
    try {
        const { password } = await request.json();

        if (password !== env.KEY) {
            return new Response(JSON.stringify({ error: 'Invalid password' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const role = 'admin';
        const secret = new TextEncoder().encode(env.KEY); // Use KEY as JWT secret
        const token = await new SignJWT({ role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('72h') // 3 days for security - users must re-login after 3 days
            .sign(secret);

        return new Response(JSON.stringify({ token, role }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
}

async function verifyAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = new TextEncoder().encode(env.KEY);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (e) {
        return null;
    }
}

async function handleStatus(request, env, corsHeaders) {
    const user = await verifyAuth(request, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ status: 'ok', role: user.role }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleConvert(request, env, corsHeaders) {
    const user = await verifyAuth(request, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    try {
        const { sourceJson, targetFormatName } = await request.json();

        if (!sourceJson || !targetFormatName) {
            throw new Error('Missing sourceJson or targetFormatName');
        }

        const targetExample = formatExamples[targetFormatName] || {};

        const prompt = `
You are a professional JSON format converter. Your task is to convert the source JSON data into the target format strictly following the requirements.

# Task Requirements:
1. Analyze the structure and field meanings of the source JSON.
2. Map the fields from the source JSON to the target format.
3. If the target format requires fields not present in the source (e.g., id, time, isDefault), generate them based on common sense or default values.
4. The output must be a PURE, well-formatted JSON object. DO NOT include any markdown formatting (like \`\`\`json), comments, or explanations. JUST THE JSON.

# Target Format Name:
${targetFormatName}

# Target Format Example:
${JSON.stringify(targetExample, null, 2)}

# Source JSON Data:
${sourceJson}

Please start the conversion and return the JSON object directly.
        `;

        let resultJsonStr = '';

        if (env.APIURL) {
            // Custom AI Provider
            const response = await fetch(env.APIURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.APIKEY}`
                },
                body: JSON.stringify({
                    model: env.MODEL,
                    messages: [{ role: "user", content: prompt }]
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Upstream API error (${response.status}): ${text.substring(0, 200)}...`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Upstream API returned non-JSON (${contentType}): ${text.substring(0, 200)}...`);
            }

            const data = await response.json();
            // Assuming standard OpenAI format
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Unexpected API response format: ' + JSON.stringify(data));
            }
            resultJsonStr = data.choices[0].message.content;
        } else {
            // Cloudflare WorkerAI
            if (!env.AI) {
                throw new Error('WorkerAI binding (AI) not found and no custom APIURL provided.');
            }
            const response = await env.AI.run(env.MODEL || '@cf/meta/llama-3-8b-instruct', {
                prompt: prompt
            });
            // WorkerAI response format varies, usually { response: "..." } or stream
            // For text generation models it is usually { response: "string" }
            resultJsonStr = response.response;
        }

        // Clean up result (remove markdown code blocks if AI added them)
        resultJsonStr = resultJsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

        // Verify JSON
        const resultJson = JSON.parse(resultJsonStr);

        return new Response(JSON.stringify(resultJson), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function handleTestAPI(request, env, corsHeaders) {
    const user = await verifyAuth(request, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        const testPrompt = 'Say "API test successful" in JSON format with a field called "message".';

        if (env.APIURL) {
            // Test Custom AI Provider
            const response = await fetch(env.APIURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.APIKEY}`
                },
                body: JSON.stringify({
                    model: env.MODEL,
                    messages: [{ role: "user", content: testPrompt }]
                })
            });

            if (!response.ok) {
                const text = await response.text();
                return new Response(JSON.stringify({
                    success: false,
                    error: `API returned status ${response.status}`,
                    details: text.substring(0, 500)
                }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                return new Response(JSON.stringify({
                    success: false,
                    error: `API returned non-JSON content type: ${contentType}`,
                    details: text.substring(0, 500)
                }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const data = await response.json();

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Unexpected API response format',
                    details: JSON.stringify(data)
                }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            return new Response(JSON.stringify({
                success: true,
                message: 'API test successful',
                response: data.choices[0].message.content,
                config: {
                    url: env.APIURL,
                    model: env.MODEL,
                    hasApiKey: !!env.APIKEY
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else {
            // Test Cloudflare WorkerAI
            if (!env.AI) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'WorkerAI binding (AI) not found and no custom APIURL provided.'
                }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const response = await env.AI.run(env.MODEL || '@cf/meta/llama-3-8b-instruct', {
                prompt: testPrompt
            });

            return new Response(JSON.stringify({
                success: true,
                message: 'WorkerAI test successful',
                response: response.response,
                config: {
                    provider: 'WorkerAI',
                    model: env.MODEL || '@cf/meta/llama-3-8b-instruct'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (e) {
        return new Response(JSON.stringify({
            success: false,
            error: e.message,
            stack: e.stack
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}


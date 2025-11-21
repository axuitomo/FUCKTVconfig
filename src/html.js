export const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI JSON Converter</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --bg-color: #f8fafc;
            --panel-bg: #ffffff;
            --border-color: #e2e8f0;
            --text-color: #1e293b;
        }
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        /* Modal */
        #login-modal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }
        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
            width: 300px;
            text-align: center;
        }
        .modal-content h2 { margin-top: 0; }
        input, select, button, textarea {
            width: 100%;
            padding: 0.75rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            box-sizing: border-box;
            font-family: inherit;
        }
        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        }
        button:hover { background-color: #1d4ed8; }
        button:disabled { background-color: #94a3b8; cursor: not-allowed; }
        
        /* App Layout */
        #app {
            display: flex;
            flex: 1;
            height: 100%;
            overflow: hidden;
        }
        .panel {
            flex: 1;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--border-color);
            background: var(--panel-bg);
        }
        .panel:last-child { border-right: none; }
        .panel h3 { margin-top: 0; display: flex; justify-content: space-between; align-items: center; }
        
        textarea {
            flex: 1;
            resize: none;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .controls {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        .controls input { margin-bottom: 0; }
        
        .footer {
            padding: 1rem;
            background: white;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #status-message { margin: 0; color: #64748b; font-size: 0.9rem; }
        
        /* Loading Spinner */
        .spinner {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 0.5rem;
            vertical-align: middle;
            display: none;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading .spinner { display: inline-block; }
    </style>
</head>
<body>

    <div id="login-modal">
        <div class="modal-content">
            <h2>登录</h2>
            <p>请输入访问密码</p>
            <input type="password" id="password-input" placeholder="密码">
            <button id="login-btn">进入系统</button>
            <p id="login-error" style="color: red; display: none; font-size: 0.8rem; margin-top: 0.5rem;"></p>
        </div>
    </div>

    <div id="app" style="display: none;">
        <div class="panel">
            <h3>
                源数据
                <small style="font-weight: normal; font-size: 0.8rem; color: #64748b;">支持 JSON</small>
            </h3>
            <div class="controls">
                <input type="text" id="url-input" placeholder="输入 URL 获取 JSON">
                <button id="fetch-url-btn" style="width: auto;">获取</button>
            </div>
            <div class="controls">
                 <input type="file" id="file-upload" accept=".json">
            </div>
            <textarea id="input-json" placeholder="在此粘贴 JSON 内容..."></textarea>
        </div>

        <div class="panel">
            <h3>
                转换结果
                <div style="display: flex; gap: 0.5rem;">
                    <select id="format-select" style="width: auto; margin-bottom: 0; padding: 0.25rem 0.5rem;">
                        <option value="LunaTV/MoonTV">LunaTV/MoonTV</option>
                        <option value="Omnibox">Omnibox</option>
                    </select>
                </div>
            </h3>
            <textarea id="output-json" readonly placeholder="等待转换..."></textarea>
            <div class="controls">
                <input type="text" id="filename-input" value="config.json" placeholder="文件名">
                <button id="download-btn" style="width: auto;">下载结果</button>
            </div>
        </div>
    </div>

    <div class="footer" id="footer" style="display: none;">
        <span id="status-message">准备就绪</span>
        <div style="display: flex; gap: 0.5rem;">
            <button id="test-api-btn" style="width: auto; padding: 0.75rem 1.5rem; background-color: #64748b;">
                <span class="spinner"></span>测试 API
            </button>
            <button id="convert-btn" style="width: auto; padding: 0.75rem 2rem;">
                <span class="spinner"></span>开始转换
            </button>
        </div>
    </div>

    <script>
        const API_BASE = '';
        let jwt = localStorage.getItem('jwt');

        // DOM Elements
        const loginModal = document.getElementById('login-modal');
        const app = document.getElementById('app');
        const footer = document.getElementById('footer');
        const passwordInput = document.getElementById('password-input');
        const loginBtn = document.getElementById('login-btn');
        const loginError = document.getElementById('login-error');
        
        const inputJson = document.getElementById('input-json');
        const outputJson = document.getElementById('output-json');
        const urlInput = document.getElementById('url-input');
        const fetchUrlBtn = document.getElementById('fetch-url-btn');
        const fileUpload = document.getElementById('file-upload');
        const formatSelect = document.getElementById('format-select');
        const convertBtn = document.getElementById('convert-btn');
        const testApiBtn = document.getElementById('test-api-btn');
        const statusMsg = document.getElementById('status-message');
        const downloadBtn = document.getElementById('download-btn');
        const filenameInput = document.getElementById('filename-input');

        // Init
        if (jwt) {
            checkAuth();
        }

        // Login Logic
        loginBtn.addEventListener('click', async () => {
            const password = passwordInput.value;
            try {
                const res = await fetch(API_BASE + '/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                if (res.ok) {
                    const data = await res.json();
                    jwt = data.token;
                    localStorage.setItem('jwt', jwt);
                    showApp();
                } else {
                    loginError.textContent = '密码错误';
                    loginError.style.display = 'block';
                }
            } catch (e) {
                loginError.textContent = '登录请求失败';
                loginError.style.display = 'block';
            }
        });

        async function checkAuth() {
            // Simple check by calling status endpoint
            try {
                const res = await fetch(API_BASE + '/api/status', {
                    headers: { 'Authorization': 'Bearer ' + jwt }
                });
                if (res.ok) {
                    showApp();
                } else {
                    logout();
                }
            } catch (e) {
                logout();
            }
        }

        function showApp() {
            loginModal.style.display = 'none';
            app.style.display = 'flex';
            footer.style.display = 'flex';
        }

        function logout() {
            localStorage.removeItem('jwt');
            jwt = null;
            loginModal.style.display = 'flex';
            app.style.display = 'none';
            footer.style.display = 'none';
        }

        // Data Fetching
        fetchUrlBtn.addEventListener('click', async () => {
            const url = urlInput.value;
            if (!url) return;
            statusMsg.textContent = '正在获取 URL 内容...';
            try {
                // Use a simple proxy or fetch directly if CORS allows (often fails, but user asked for logic)
                // In a real worker, we could proxy this through the worker itself to avoid CORS.
                // For now, let's try direct fetch, or maybe the worker can handle a proxy endpoint?
                // Let's keep it simple: direct fetch.
                const res = await fetch(url);
                const text = await res.text();
                inputJson.value = text; // Just dump text, let user validate
                statusMsg.textContent = '获取成功';
            } catch (e) {
                statusMsg.textContent = '获取失败: ' + e.message;
            }
        });

        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                inputJson.value = e.target.result;
            };
            reader.readAsText(file);
        });

        // Conversion
        convertBtn.addEventListener('click', async () => {
            const source = inputJson.value;
            if (!source) {
                alert('请先输入源 JSON 数据');
                return;
            }

            convertBtn.disabled = true;
            convertBtn.classList.add('loading');
            statusMsg.textContent = '正在向 AI 发送请求...';
            outputJson.value = '';

            try {
                const res = await fetch(API_BASE + '/api/convert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    },
                    body: JSON.stringify({
                        sourceJson: source,
                        targetFormatName: formatSelect.value
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    outputJson.value = JSON.stringify(data, null, 2);
                    statusMsg.textContent = '转换成功';
                } else {
                    const err = await res.json();
                    statusMsg.textContent = '转换失败: ' + (err.error || res.statusText);
                    if (res.status === 401 || res.status === 403) {
                        alert('权限不足或 Token 过期');
                    }
                }
            } catch (e) {
                statusMsg.textContent = '请求出错: ' + e.message;
            } finally {
                convertBtn.disabled = false;
                convertBtn.classList.remove('loading');
            }
        });

        // Test API
        testApiBtn.addEventListener('click', async () => {
            testApiBtn.disabled = true;
            testApiBtn.classList.add('loading');
            statusMsg.textContent = '正在测试 API 配置...';

            try {
                const res = await fetch(API_BASE + '/api/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        statusMsg.textContent = '✅ API 测试成功!';
                        alert('API 测试成功!\\n\\n配置信息:\\n' + JSON.stringify(data.config, null, 2) + '\\n\\nAI 响应:\\n' + data.response);
                    } else {
                        statusMsg.textContent = '❌ API 测试失败';
                        alert('API 测试失败\\n\\n错误: ' + data.error + '\\n\\n详情:\\n' + (data.details || 'N/A'));
                    }
                } else {
                    const err = await res.json();
                    statusMsg.textContent = '❌ 测试请求失败';
                    alert('测试失败: ' + (err.error || res.statusText));
                }
            } catch (e) {
                statusMsg.textContent = '❌ 测试出错';
                alert('测试出错: ' + e.message);
            } finally {
                testApiBtn.disabled = false;
                testApiBtn.classList.remove('loading');
            }
        });

        // Download
        downloadBtn.addEventListener('click', () => {
            const content = outputJson.value;
            if (!content) return;
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filenameInput.value || 'config.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    </script>
</body>
</html>
`;

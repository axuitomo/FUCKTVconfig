# AI 驱动的 JSON 转换工具 (Worker 版)

这是一个轻量级的、单文件的 Cloudflare Worker 应用，利用 AI 在不同格式之间转换 JSON 数据。它提供了一个安全的 Web 界面，并支持双层身份验证。

## 功能特性

- **AI 驱动转换**: 利用 Cloudflare WorkerAI 或自定义 OpenAI 兼容 API 进行智能格式转换。
- **Serverless & 单文件**: 整个应用（前端 + 后端）打包成一个 `worker.js` 文件，便于在 Cloudflare Workers 上部署。
- **双重认证**:
  - **管理员 (`KEY`)**: 拥有完整权限，包括使用 AI 转换功能。
  - **访客 (`TOKEN`)**: 仅拥有查看界面的权限。
- **安全**: 基于 JWT 的无状态认证。
- **友好的用户界面**:
  - 源数据与结果分栏显示。
  - 支持 URL 获取和文件上传。
  - 一键下载转换后的文件。

## 部署指南 (复制粘贴方式)

无需安装任何本地环境，直接在 Cloudflare 控制台操作。

### 1. 获取代码
打开项目中的 `worker.js` 文件，复制其**全部内容**。

### 2. 创建 Worker
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 进入 **Workers & Pages** -> **Overview**。
3. 点击 **Create Application** -> **Create Worker**。
4. 给 Worker 起个名字（例如 `json-converter`），点击 **Deploy**。

### 3. 粘贴代码
1. 在新创建的 Worker 页面，点击 **Edit code**。
2. 删除左侧编辑器中默认的 `worker.js` 内容。
3. 将第 1 步复制的代码粘贴进去。
4. 点击右上角的 **Deploy** 保存。

### 4. 配置变量 (Secrets)
为了安全起见，密码和 API Key 需要在后台配置，不要直接写在代码里。

1. 返回 Worker 的详情页面 (退出编辑器)。
2. 点击 **Settings** -> **Variables**。
3. 点击 **Add Variable**，添加以下环境变量 (点击 **Encrypt** 按钮将其加密为 Secret):

| 变量名 | 描述 | 是否必须 | 示例值 |
| :--- | :--- | :--- | :--- |
| `KEY` | 管理员密码 (完整权限) | **是** | `MySecretPass123` |
| `TOKEN` | 访客密码 (只读权限) | 否 | `GuestPass456` |
| `APIURL` | 自定义 AI API 地址 | 否* | `https://api.openai.com/v1/chat/completions` |
| `APIKEY` | 自定义 AI API Key | 否* | `sk-xxxxxxxx` |
| `MODEL` | 自定义模型名称 | 否* | `gpt-4o-mini` |

> **注意**: 如果不配置 `APIURL`，系统默认尝试调用 Cloudflare WorkerAI (需要绑定 AI 模型，见下文)。建议配置自定义 API 以获得更稳定的体验。

### 5. (可选) 绑定 Cloudflare WorkerAI
如果你不想用外部 API，而是用 Cloudflare 自带的 AI：
1. 在 **Settings** -> **Variables** 页面下方找到 **AI Bindings**。
2. 点击 **Add Binding**。
3. Variable name 填写 `AI`。
4. 保存并重新部署。

## 使用说明

1.  访问你的 Worker URL (例如 `https://json-converter.your-name.workers.dev`)。
2.  使用管理员 `KEY` 或访客 `TOKEN` 登录。
3.  粘贴源 JSON，或从 URL 获取、上传文件。
4.  选择目标格式 (例如 `LunaTV/MoonTV`)。
5.  点击 **开始转换**。
6.  下载结果。

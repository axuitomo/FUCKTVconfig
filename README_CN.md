# AI 驱动的 JSON 转换工具

这是一个轻量级的应用程序,利用 AI 在不同格式之间转换 JSON 数据。它提供了一个安全的 Web 界面,并支持双层身份验证。

## 功能特性

- **AI 驱动转换**: 利用 OpenAI 兼容 API 进行智能格式转换
- **双重认证**:
  - **管理员 (`KEY`)**: 拥有完整权限,包括使用 AI 转换功能
  - **访客 (`TOKEN`)**: 仅拥有查看界面的权限
- **安全**: 基于 JWT 的无状态认证,Token 3 天后自动过期
- **友好的用户界面**:
  - 源数据与结果分栏显示
  - 支持 URL 获取和文件上传
  - 一键下载转换后的文件

## Docker 快速开始

### 方式一: 使用 Docker Hub 镜像 (推荐)

拉取并运行预构建镜像:

```bash
docker pull axuitomo/fucktvconfig:latest

docker run -d \
  -p 8787:8787 \
  -e KEY=你的管理员密码 \
  -e TOKEN=你的访客密码 \
  -e APIURL=https://api.openai.com/v1/chat/completions \
  -e APIKEY=你的API密钥 \
  -e MODEL=gpt-4o-mini \
  --name json-converter \
  axuitomo/fucktvconfig:latest
```

在浏览器中访问 `http://localhost:8787`

### 方式二: 使用 Docker Compose

创建 `docker-compose.yml` 文件:

```yaml
version: '3.8'

services:
  json-converter:
    image: axuitomo/fucktvconfig:latest
    container_name: json-converter
    ports:
      - "8787:8787"
    environment:
      - KEY=你的管理员密码
      - TOKEN=你的访客密码
      - APIURL=https://api.openai.com/v1/chat/completions
      - APIKEY=你的API密钥
      - MODEL=gpt-4o-mini
    restart: unless-stopped
```

然后运行:

```bash
docker-compose up -d
```

### 方式三: 从源码构建

```bash
git clone https://github.com/axuitomo/FUCKTVconfig.git
cd FUCKTVconfig

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 构建并运行
docker-compose up -d --build
```

## 环境变量说明

| 变量名 | 是否必须 | 说明 |
|--------|---------|------|
| `KEY` | 是 | 管理员密码,拥有完整权限 |
| `TOKEN` | 否 | 访客密码,仅有只读权限 |
| `APIURL` | 是 | AI API 地址 (例如: `https://api.openai.com/v1/chat/completions`) |
| `APIKEY` | 是 | AI API 密钥 |
| `MODEL` | 否 | AI 模型名称 (默认: `gpt-4o-mini`) |

## 使用说明

1. 在浏览器中访问 `http://localhost:8787`
2. 使用管理员 `KEY` 或访客 `TOKEN` 登录
3. 粘贴源 JSON,或从 URL 获取、上传文件
4. 选择目标格式 (例如 `LunaTV/MoonTV`)
5. 点击 **开始转换**
6. 下载结果

## 安全性

- JWT Token **3 天后自动过期** - 用户需要重新登录以确保安全
- 密码存储在环境变量中,永不写入代码
- 仅管理员可使用 AI 转换功能

## 相关资源

- **Docker Hub**: [axuitomo/fucktvconfig](https://hub.docker.com/r/axuitomo/fucktvconfig)
- **GitHub**: [axuitomo/FUCKTVconfig](https://github.com/axuitomo/FUCKTVconfig)
- **调试指南**: [DOCKER_DEBUG.md](./DOCKER_DEBUG.md)

## 技术栈

- **运行时**: Node.js + Wrangler Dev Server
- **语言**: JavaScript (ES6+)
- **打包工具**: esbuild
- **认证**: jose (JWT)
- **前端**: 原生 JS + CSS (内嵌)
- **容器**: Docker

## 许可证

ISC

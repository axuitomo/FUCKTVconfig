# 推送镜像到 axuitomo/fucktvconfig 操作指南

## 前置要求

### 1. 安装 Docker Desktop

您的系统尚未安装 Docker，请先安装：

1. 下载 Docker Desktop for Windows：https://www.docker.com/products/docker-desktop/
2. 运行安装程序
3. 安装完成后重启计算机
4. 启动 Docker Desktop

验证安装：
```powershell
docker --version
```

### 2. 登录 Docker Hub

```powershell
docker login
# 输入用户名: axuitomo
# 输入密码或访问令牌
```

---

## 方法一：使用命令行（推荐）

### 步骤 1: 构建镜像

```powershell
cd c:\CODE\my-json-converter

# 构建镜像并打标签
docker build -t axuitomo/fucktvconfig:latest .
```

### 步骤 2: 推送镜像

```powershell
# 推送到 Docker Hub
docker push axuitomo/fucktvconfig:latest
```

### 步骤 3: 验证

访问 Docker Hub 查看镜像：
https://hub.docker.com/r/axuitomo/fucktvconfig

---

## 方法二：使用 PowerShell 脚本

### 步骤 1: 解除脚本执行限制

```powershell
# 以管理员身份运行 PowerShell，执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 步骤 2: 运行脚本

```powershell
cd c:\CODE\my-json-converter

# 运行构建和推送脚本
.\build-and-push.ps1 -Username "axuitomo" -ImageName "fucktvconfig" -Version "latest"
```

---

## 方法三：使用 GitHub Actions 自动推送

### 步骤 1: 配置 GitHub Secrets

1. 进入 GitHub 仓库：https://github.com/your-repo/settings/secrets/actions
2. 添加以下 Secrets：
   - Name: `DOCKER_USERNAME`，Value: `axuitomo`
   - Name: `DOCKER_PASSWORD`，Value: `你的Docker Hub密码或访问令牌`

### 步骤 2: 更新 GitHub Actions 配置

编辑 `.github/workflows/docker-publish.yml`，确保镜像名称正确：

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: fucktvconfig  # 已更新
```

### 步骤 3: 推送代码触发自动构建

```bash
# 推送到 main 分支
git add .
git commit -m "Update Docker configuration"
git push origin main

# 或创建版本标签
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions 会自动构建并推送镜像到 `axuitomo/fucktvconfig`。

---

## 完整的手动操作流程

```powershell
# 1. 进入项目目录
cd c:\CODE\my-json-converter

# 2. 登录 Docker Hub
docker login
# 用户名: axuitomo
# 密码: [输入密码]

# 3. 构建镜像
docker build -t axuitomo/fucktvconfig:latest .

# 4. （可选）打上版本标签
docker tag axuitomo/fucktvconfig:latest axuitomo/fucktvconfig:1.0.0

# 5. 推送 latest 标签
docker push axuitomo/fucktvconfig:latest

# 6. （可选）推送版本标签
docker push axuitomo/fucktvconfig:1.0.0

# 7. 验证镜像已推送
docker pull axuitomo/fucktvconfig:latest
```

---

## 使用已推送的镜像

其他用户可以这样使用您的镜像：

### 拉取镜像

```bash
docker pull axuitomo/fucktvconfig:latest
```

### 运行容器

```bash
docker run -d \
  -p 8787:8787 \
  -e KEY=your-admin-password \
  -e TOKEN=your-guest-password \
  -e APIURL=https://api.openai.com/v1/chat/completions \
  -e APIKEY=your-api-key \
  -e MODEL=gpt-4o-mini \
  --name json-converter \
  axuitomo/fucktvconfig:latest
```

### 使用 docker-compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  json-converter:
    image: axuitomo/fucktvconfig:latest
    container_name: json-converter
    ports:
      - "8787:8787"
    environment:
      - KEY=${KEY}
      - TOKEN=${TOKEN}
      - APIURL=${APIURL}
      - APIKEY=${APIKEY}
      - MODEL=${MODEL:-gpt-4o-mini}
    restart: unless-stopped
```

然后运行：

```bash
docker-compose up -d
```

---

## 故障排除

### Docker 未安装

错误信息：`docker : 无法将"docker"项识别为 cmdlet`

**解决方案**：
1. 安装 Docker Desktop
2. 重启计算机
3. 确保 Docker Desktop 正在运行

### PowerShell 脚本执行被阻止

错误信息：`UnauthorizedAccess`

**解决方案**：
```powershell
# 以管理员身份运行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 推送失败：unauthorized

**解决方案**：
```bash
# 重新登录
docker logout
docker login
```

### 推送失败：denied

**原因**：没有权限推送到 `axuitomo` 命名空间

**解决方案**：
- 确保使用 `axuitomo` 账户登录
- 或者推送到您自己的命名空间

---

## 下一步

安装 Docker 后，执行以下命令即可完成推送：

```powershell
cd c:\CODE\my-json-converter
docker login
docker build -t axuitomo/fucktvconfig:latest .
docker push axuitomo/fucktvconfig:latest
```

推送成功后，镜像将在以下地址可用：
**https://hub.docker.com/r/axuitomo/fucktvconfig**

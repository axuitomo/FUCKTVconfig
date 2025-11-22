# Docker 镜像构建和发布指南

本文档介绍如何构建 Docker 镜像并发布到镜像仓库。

## 目录

- [手动构建和推送](#手动构建和推送)
- [使用脚本自动化](#使用脚本自动化)
- [使用 GitHub Actions 自动发布](#使用-github-actions-自动发布)
- [发布到不同的镜像仓库](#发布到不同的镜像仓库)

---

## 手动构建和推送

### 1. 登录 Docker Hub

```bash
docker login
# 输入用户名和密码
```

### 2. 构建镜像

```bash
# 构建镜像并打标签
docker build -t your-username/fucktvconfig:latest .

# 构建特定版本
docker build -t your-username/fucktvconfig:1.0.0 .
```

### 3. 推送镜像

```bash
# 推送 latest 版本
docker push your-username/fucktvconfig:latest

# 推送特定版本
docker push your-username/fucktvconfig:1.0.0
```

### 4. 同时推送多个标签

```bash
# 构建镜像
docker build -t your-username/fucktvconfig:1.0.0 .

# 打上多个标签
docker tag your-username/fucktvconfig:1.0.0 your-username/fucktvconfig:latest
docker tag your-username/fucktvconfig:1.0.0 your-username/fucktvconfig:1.0
docker tag your-username/fucktvconfig:1.0.0 your-username/fucktvconfig:1

# 推送所有标签
docker push your-username/fucktvconfig:1.0.0
docker push your-username/fucktvconfig:latest
docker push your-username/fucktvconfig:1.0
docker push your-username/fucktvconfig:1
```

---

## 使用脚本自动化

项目提供了两个自动化脚本：

### Windows (PowerShell)

```powershell
# 基本使用
.\build-and-push.ps1 -Username "your-dockerhub-username" -Version "1.0.0"

# 只推送 latest
.\build-and-push.ps1 -Username "your-dockerhub-username"

# 使用环境变量
$env:DOCKER_USERNAME = "your-dockerhub-username"
.\build-and-push.ps1 -Version "1.0.0"
```

### Linux/Mac (Bash)

```bash
# 赋予执行权限
chmod +x build-and-push.sh

# 基本使用
./build-and-push.sh 1.0.0

# 使用环境变量
export DOCKER_USERNAME=your-dockerhub-username
./build-and-push.sh 1.0.0
```

---

## 使用 GitHub Actions 自动发布

项目已配置 GitHub Actions 工作流，可以自动构建和发布镜像。

### 配置步骤

1. **设置 GitHub Secrets**

   在 GitHub 仓库中设置以下 Secrets：
   - 进入仓库 Settings → Secrets and variables → Actions
   - 添加以下 secrets：
     - `DOCKER_USERNAME`: 你的 Docker Hub 用户名
     - `DOCKER_PASSWORD`: 你的 Docker Hub 密码或访问令牌

2. **触发构建**

   工作流会在以下情况自动触发：

   - **推送到 main 分支**：构建并推送 `latest` 标签
   - **创建版本标签**：构建并推送版本标签
   - **手动触发**：在 Actions 页面手动运行

### 发布新版本

```bash
# 创建版本标签
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions 会自动构建并推送以下标签：
# - your-username/fucktvconfig:1.0.0
# - your-username/fucktvconfig:1.0
# - your-username/fucktvconfig:1
# - your-username/fucktvconfig:latest
```

### 多平台支持

GitHub Actions 工作流支持构建多平台镜像：
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64)

---

## 发布到不同的镜像仓库

### Docker Hub (默认)

```bash
docker login
docker build -t your-username/fucktvconfig:latest .
docker push your-username/fucktvconfig:latest
```

### GitHub Container Registry (ghcr.io)

```bash
# 登录 GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 构建并推送
docker build -t ghcr.io/your-username/fucktvconfig:latest .
docker push ghcr.io/your-username/fucktvconfig:latest
```

### 阿里云容器镜像服务

```bash
# 登录阿里云
docker login --username=your-aliyun-username registry.cn-hangzhou.aliyuncs.com

# 构建并推送
docker build -t registry.cn-hangzhou.aliyuncs.com/your-namespace/fucktvconfig:latest .
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/fucktvconfig:latest
```

### 腾讯云容器镜像服务

```bash
# 登录腾讯云
docker login ccr.ccs.tencentyun.com --username=your-tencent-username

# 构建并推送
docker build -t ccr.ccs.tencentyun.com/your-namespace/fucktvconfig:latest .
docker push ccr.ccs.tencentyun.com/your-namespace/fucktvconfig:latest
```

### 私有镜像仓库

```bash
# 登录私有仓库
docker login your-registry.com

# 构建并推送
docker build -t your-registry.com/fucktvconfig:latest .
docker push your-registry.com/fucktvconfig:latest
```

---

## 最佳实践

### 1. 版本标签策略

推荐使用语义化版本（Semantic Versioning）：

```bash
# 主版本.次版本.修订号
docker tag image:1.2.3 image:1.2
docker tag image:1.2.3 image:1
docker tag image:1.2.3 image:latest
```

### 2. 构建优化

```bash
# 使用 BuildKit 加速构建
DOCKER_BUILDKIT=1 docker build -t fucktvconfig:latest .

# 使用缓存
docker build --cache-from fucktvconfig:latest -t fucktvconfig:latest .

# 多平台构建
docker buildx build --platform linux/amd64,linux/arm64 -t fucktvconfig:latest .
```

### 3. 镜像大小优化

- ✅ 使用 Alpine 基础镜像（已实现）
- ✅ 多阶段构建（已实现）
- ✅ .dockerignore 排除不必要文件（已实现）

### 4. 安全建议

- 使用访问令牌而非密码登录
- 定期更新基础镜像
- 扫描镜像漏洞：`docker scan fucktvconfig:latest`
- 不要在镜像中包含敏感信息

---

## 使用已发布的镜像

### 拉取镜像

```bash
# 拉取最新版本
docker pull your-username/fucktvconfig:latest

# 拉取特定版本
docker pull your-username/fucktvconfig:1.0.0
```

### 运行容器

```bash
docker run -d \
  -p 8787:8787 \
  -e KEY=your-admin-password \
  -e APIURL=https://api.openai.com/v1/chat/completions \
  -e APIKEY=your-api-key \
  -e MODEL=gpt-4o-mini \
  --name fucktvconfig \
  your-username/fucktvconfig:latest
```

### 使用 docker-compose

更新 `docker-compose.yml` 中的镜像名称：

```yaml
services:
  fucktvconfig:
    image: your-username/fucktvconfig:latest  # 使用已发布的镜像
    # 移除 build 配置
    ports:
      - "8787:8787"
    environment:
      - KEY=${KEY}
      - APIURL=${APIURL}
      - APIKEY=${APIKEY}
      - MODEL=${MODEL:-gpt-4o-mini}
```

---

## 故障排除

### 推送失败：unauthorized

```bash
# 重新登录
docker logout
docker login
```

### 推送失败：denied

检查镜像名称格式是否正确：`registry/username/image:tag`

### 构建缓慢

```bash
# 清理构建缓存
docker builder prune

# 使用 BuildKit
export DOCKER_BUILDKIT=1
```

### 镜像过大

```bash
# 查看镜像层
docker history fucktvconfig:latest

# 分析镜像大小
docker images fucktvconfig:latest
```

---

## 相关链接

- [Docker Hub](https://hub.docker.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [语义化版本](https://semver.org/lang/zh-CN/)

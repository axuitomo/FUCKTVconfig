# Docker 本地调试指南

本指南将帮助您在本地使用 Docker 调试 JSON Converter Worker 项目。

## 📋 前置要求

- Docker Desktop (Windows)
- Docker Compose
- 文本编辑器

## 🚀 快速开始

### 1. 创建环境配置文件

首先,复制示例环境文件并配置您的参数:

```powershell
# 复制环境文件
Copy-Item .env.example .env

# 使用记事本编辑 .env 文件
notepad .env
```

在 `.env` 文件中配置以下必需参数:

```env
# 管理员密码 - 必填
KEY=your-secure-admin-password

# AI API 配置 - Docker 部署必填
APIURL=https://api.openai.com/v1/chat/completions
APIKEY=sk-your-api-key-here
MODEL=gpt-4o-mini
```

### 2. 构建并启动容器

```powershell
# 构建并启动服务
docker-compose up --build

# 或者在后台运行
docker-compose up -d --build
```

### 3. 访问应用

应用启动后,在浏览器中访问:

```
http://localhost:8787
```

## 🔧 常用调试命令

### 查看日志

```powershell
# 查看实时日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f fucktvconfig

# 查看最近 100 行日志
docker-compose logs --tail=100 fucktvconfig
```

### 容器管理

```powershell
# 停止服务
docker-compose stop

# 启动已停止的服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络和卷
docker-compose down -v
```

### 进入容器调试

```powershell
# 进入运行中的容器
docker-compose exec fucktvconfig sh

# 在容器内执行命令
docker-compose exec fucktvconfig npm --version
docker-compose exec fucktvconfig wrangler --version
```

### 重新构建

```powershell
# 强制重新构建(不使用缓存)
docker-compose build --no-cache

# 重新构建并启动
docker-compose up --build --force-recreate
```

## 🐛 调试技巧

### 1. 热重载开发

当前配置已经支持代码热重载。修改以下文件会自动生效:

- `worker.js` - Worker 主文件
- `src/` 目录下的所有文件

> **注意**: 由于文件是以只读模式挂载的,修改需要在宿主机上进行,容器会自动检测变化。

### 2. 查看环境变量

```powershell
# 查看容器中的环境变量
docker-compose exec fucktvconfig env | grep -E "KEY|API"
```

### 3. 端口冲突

如果 8787 端口被占用,可以修改 `docker-compose.yml`:

```yaml
ports:
  - "8788:8787"  # 将本地端口改为 8788
```

### 4. 网络调试

```powershell
# 查看容器网络信息
docker network inspect fucktvconfig_fucktvconfig-network

# 查看容器 IP
docker-compose exec fucktvconfig hostname -i
```

## 📊 性能监控

### 查看资源使用情况

```powershell
# 查看容器资源使用
docker stats fucktvconfig

# 查看所有容器
docker stats
```

### 查看容器详细信息

```powershell
# 查看容器配置
docker inspect fucktvconfig

# 查看容器进程
docker-compose top
```

## 🔍 常见问题排查

### 问题 1: 容器无法启动

**检查日志**:
```powershell
docker-compose logs fucktvconfig
```

**可能原因**:
- 环境变量未配置
- 端口被占用
- Docker 资源不足

### 问题 2: API 调用失败

**检查环境变量**:
```powershell
docker-compose exec fucktvconfig env | grep API
```

**验证 API 配置**:
- 确认 `APIURL` 格式正确
- 确认 `APIKEY` 有效
- 确认 `MODEL` 名称正确

### 问题 3: 代码修改不生效

**重启容器**:
```powershell
docker-compose restart
```

**强制重新构建**:
```powershell
docker-compose down
docker-compose up --build --force-recreate
```

### 问题 4: 权限问题

**Windows 上的文件挂载**:
确保 Docker Desktop 有权限访问项目目录:
1. 打开 Docker Desktop
2. Settings → Resources → File Sharing
3. 添加项目所在的驱动器

## 🧪 测试 API 端点

### 使用 PowerShell 测试

```powershell
# 测试健康检查
Invoke-WebRequest -Uri http://localhost:8787/health

# 测试主页
Invoke-WebRequest -Uri http://localhost:8787/

# 测试 API (需要认证)
$headers = @{
    "Authorization" = "Bearer your-admin-password"
}
Invoke-WebRequest -Uri http://localhost:8787/api/convert -Method POST -Headers $headers
```

### 使用 curl (如果已安装)

```bash
# 测试健康检查
curl http://localhost:8787/health

# 测试主页
curl http://localhost:8787/
```

## 📝 开发工作流建议

### 推荐的开发流程

1. **启动开发环境**
   ```powershell
   docker-compose up -d
   docker-compose logs -f
   ```

2. **修改代码**
   - 在宿主机上编辑 `worker.js` 或 `src/` 目录下的文件
   - 保存后容器会自动检测变化

3. **测试更改**
   - 在浏览器中访问 `http://localhost:8787`
   - 使用浏览器开发者工具查看网络请求

4. **查看日志**
   ```powershell
   docker-compose logs -f fucktvconfig
   ```

5. **提交前清理**
   ```powershell
   docker-compose down
   ```

### 调试最佳实践

1. **使用日志输出**: 在代码中添加 `console.log()` 语句,日志会显示在 `docker-compose logs` 中

2. **分离关注点**: 
   - 先在容器外测试 API 配置
   - 再在容器内测试完整流程

3. **版本控制**: 
   - 不要提交 `.env` 文件到 Git
   - 保持 `.env.example` 更新

4. **资源清理**: 定期清理未使用的镜像和容器
   ```powershell
   docker system prune -a
   ```

## 🔐 安全提示

1. **不要在生产环境使用默认密码**
2. **保护 `.env` 文件** - 确保它在 `.gitignore` 中
3. **使用强密码** - 为 `KEY` 设置复杂密码
4. **定期更新依赖** - 运行 `npm audit` 检查安全漏洞

## 📚 相关文档

- [Dockerfile](./Dockerfile) - Docker 镜像构建配置
- [docker-compose.yml](./docker-compose.yml) - Docker Compose 服务配置
- [.env.example](./.env.example) - 环境变量示例
- [DOCKER_PUBLISH.md](./DOCKER_PUBLISH.md) - Docker 发布指南
- [README.md](./README.md) - 项目主文档

## 🆘 获取帮助

如果遇到问题:

1. 检查日志: `docker-compose logs -f`
2. 验证环境变量: `docker-compose exec fucktvconfig env`
3. 重新构建: `docker-compose up --build --force-recreate`
4. 查看 Docker Desktop 的 Containers 面板

---

**祝您调试顺利! 🎉**

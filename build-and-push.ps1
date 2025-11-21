# Docker 镜像构建和推送脚本 (PowerShell)
# 使用方法: .\build-and-push.ps1 -Version "1.0.0" -Username "your-dockerhub-username"

param(
    [string]$Version = "latest",
    [string]$Username = $env:DOCKER_USERNAME,
    [string]$Registry = "docker.io",
    [string]$ImageName = "json-converter"
)

# 检查 Username
if ([string]::IsNullOrEmpty($Username)) {
    Write-Host "错误: 请提供 Docker Hub 用户名" -ForegroundColor Red
    Write-Host "使用方法: .\build-and-push.ps1 -Username 'your-username' -Version '1.0.0'" -ForegroundColor Yellow
    exit 1
}

$FullImageName = "$Registry/$Username/$ImageName"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Docker 镜像构建和推送" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "镜像名称: $FullImageName"
Write-Host "版本标签: $Version"
Write-Host "=========================================" -ForegroundColor Cyan

# 1. 构建镜像
Write-Host ""
Write-Host "📦 步骤 1/4: 构建 Docker 镜像..." -ForegroundColor Green
docker build -t "${ImageName}:${Version}" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    exit 1
}

# 2. 打标签
Write-Host ""
Write-Host "🏷️  步骤 2/4: 为镜像打标签..." -ForegroundColor Green
docker tag "${ImageName}:${Version}" "${FullImageName}:${Version}"

if ($Version -ne "latest") {
    docker tag "${ImageName}:${Version}" "${FullImageName}:latest"
    Write-Host "已同时打上 latest 标签" -ForegroundColor Yellow
}

# 3. 登录 Docker Registry
Write-Host ""
Write-Host "🔐 步骤 3/4: 登录 Docker Registry..." -ForegroundColor Green
Write-Host "提示: 如果已登录，可以按 Ctrl+C 跳过" -ForegroundColor Yellow
docker login $Registry
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 登录失败" -ForegroundColor Red
    exit 1
}

# 4. 推送镜像
Write-Host ""
Write-Host "⬆️  步骤 4/4: 推送镜像到仓库..." -ForegroundColor Green
docker push "${FullImageName}:${Version}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失败" -ForegroundColor Red
    exit 1
}

if ($Version -ne "latest") {
    docker push "${FullImageName}:latest"
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ 完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "镜像已推送到: ${FullImageName}:${Version}"
if ($Version -ne "latest") {
    Write-Host "同时推送了: ${FullImageName}:latest"
}
Write-Host ""
Write-Host "拉取命令:" -ForegroundColor Yellow
Write-Host "  docker pull ${FullImageName}:${Version}"
Write-Host ""
Write-Host "运行命令:" -ForegroundColor Yellow
Write-Host "  docker run -d -p 8787:8787 ``"
Write-Host "    -e KEY=your-admin-password ``"
Write-Host "    -e APIURL=https://api.openai.com/v1/chat/completions ``"
Write-Host "    -e APIKEY=your-api-key ``"
Write-Host "    ${FullImageName}:${Version}"
Write-Host "=========================================" -ForegroundColor Cyan

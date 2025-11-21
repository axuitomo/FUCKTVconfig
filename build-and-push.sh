#!/bin/bash

# Docker 镜像构建和推送脚本
# 使用方法: ./build-and-push.sh [version]

set -e

# 配置
IMAGE_NAME="json-converter"
REGISTRY="docker.io"  # 默认使用 Docker Hub，可改为其他仓库
USERNAME="${DOCKER_USERNAME:-your-dockerhub-username}"  # 从环境变量读取或使用默认值
VERSION="${1:-latest}"  # 从参数读取版本号，默认为 latest

# 完整镜像名称
FULL_IMAGE_NAME="${REGISTRY}/${USERNAME}/${IMAGE_NAME}"

echo "========================================="
echo "Docker 镜像构建和推送"
echo "========================================="
echo "镜像名称: ${FULL_IMAGE_NAME}"
echo "版本标签: ${VERSION}"
echo "========================================="

# 1. 构建镜像
echo ""
echo "📦 步骤 1/4: 构建 Docker 镜像..."
docker build -t ${IMAGE_NAME}:${VERSION} .

# 2. 打标签
echo ""
echo "🏷️  步骤 2/4: 为镜像打标签..."
docker tag ${IMAGE_NAME}:${VERSION} ${FULL_IMAGE_NAME}:${VERSION}

# 如果版本不是 latest，同时打上 latest 标签
if [ "${VERSION}" != "latest" ]; then
    docker tag ${IMAGE_NAME}:${VERSION} ${FULL_IMAGE_NAME}:latest
    echo "已同时打上 latest 标签"
fi

# 3. 登录 Docker Registry（如果需要）
echo ""
echo "🔐 步骤 3/4: 登录 Docker Registry..."
echo "提示: 如果已登录，可以跳过此步骤"
docker login ${REGISTRY}

# 4. 推送镜像
echo ""
echo "⬆️  步骤 4/4: 推送镜像到仓库..."
docker push ${FULL_IMAGE_NAME}:${VERSION}

if [ "${VERSION}" != "latest" ]; then
    docker push ${FULL_IMAGE_NAME}:latest
fi

echo ""
echo "========================================="
echo "✅ 完成！"
echo "========================================="
echo "镜像已推送到: ${FULL_IMAGE_NAME}:${VERSION}"
if [ "${VERSION}" != "latest" ]; then
    echo "同时推送了: ${FULL_IMAGE_NAME}:latest"
fi
echo ""
echo "拉取命令:"
echo "  docker pull ${FULL_IMAGE_NAME}:${VERSION}"
echo ""
echo "运行命令:"
echo "  docker run -d -p 8787:8787 \\"
echo "    -e KEY=your-admin-password \\"
echo "    -e APIURL=https://api.openai.com/v1/chat/completions \\"
echo "    -e APIKEY=your-api-key \\"
echo "    ${FULL_IMAGE_NAME}:${VERSION}"
echo "========================================="

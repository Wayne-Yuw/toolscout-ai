#!/bin/bash

# Docker 快速启动脚本
# 用于启动 ToolScout AI 的前后端服务

echo "🚀 正在启动 ToolScout AI Docker 容器..."
echo ""

# 停止旧容器
echo "📦 停止旧容器..."
docker-compose down

# 重新构建并启动
echo "🔨 重新构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "📊 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 启动完成!"
echo ""
echo "📍 服务地址:"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:8000"
echo "   API 文档: http://localhost:8000/docs"
echo ""
echo "📝 查看日志:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""

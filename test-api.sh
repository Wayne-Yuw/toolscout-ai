#!/bin/bash

# API 测试脚本
# 用于测试 ToolScout AI 的认证 API

echo "🧪 开始测试 ToolScout AI API..."
echo ""

API_BASE="http://localhost:8000/api/v1"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 测试健康检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  测试健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo -e "${GREEN}✅ 健康检查通过${NC}"
else
    echo -e "${RED}❌ 健康检查失败${NC}"
    exit 1
fi
echo ""

# 2. 测试用户注册
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  测试用户注册"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser${TIMESTAMP}\",
    \"phone\": \"138${TIMESTAMP:0:8}\",
    \"password\": \"Test123456\",
    \"nickname\": \"测试用户\"
  }")

if [[ $REGISTER_RESPONSE == *"access_token"* ]]; then
    echo -e "${GREEN}✅ 用户注册成功${NC}"
    # 提取 token
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${YELLOW}⚠️  注册返回: $REGISTER_RESPONSE${NC}"
fi
echo ""

# 3. 测试用户登录
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  测试用户登录"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"login\": \"testuser${TIMESTAMP}\",
    \"password\": \"Test123456\"
  }")

if [[ $LOGIN_RESPONSE == *"access_token"* ]]; then
    echo -e "${GREEN}✅ 用户登录成功${NC}"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ 登录失败${NC}"
    echo "响应: $LOGIN_RESPONSE"
fi
echo ""

# 4. 测试获取当前用户信息
if [ ! -z "$TOKEN" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "4️⃣  测试获取用户信息"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    USER_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
      -H "Authorization: Bearer $TOKEN")

    if [[ $USER_RESPONSE == *"username"* ]]; then
        echo -e "${GREEN}✅ 获取用户信息成功${NC}"
        echo "用户信息: $USER_RESPONSE" | head -c 200
        echo "..."
    else
        echo -e "${RED}❌ 获取用户信息失败${NC}"
        echo "响应: $USER_RESPONSE"
    fi
    echo ""
fi

# 5. 测试用户名可用性检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  测试用户名可用性检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
AVAILABLE_RESPONSE=$(curl -s -X GET "$API_BASE/auth/check-username?username=newuser123")
echo "响应: $AVAILABLE_RESPONSE"
if [[ $AVAILABLE_RESPONSE == *"available"* ]]; then
    echo -e "${GREEN}✅ 用户名可用性检查正常${NC}"
else
    echo -e "${YELLOW}⚠️  用户名可用性检查返回异常${NC}"
fi
echo ""

# 6. 测试手机号可用性检查
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  测试手机号可用性检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PHONE_AVAILABLE_RESPONSE=$(curl -s -X GET "$API_BASE/auth/check-phone?phone=13900000000")
echo "响应: $PHONE_AVAILABLE_RESPONSE"
if [[ $PHONE_AVAILABLE_RESPONSE == *"available"* ]]; then
    echo -e "${GREEN}✅ 手机号可用性检查正常${NC}"
else
    echo -e "${YELLOW}⚠️  手机号可用性检查返回异常${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API 测试完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 访问以下地址查看完整 API 文档："
echo "   http://localhost:8000/docs"
echo ""

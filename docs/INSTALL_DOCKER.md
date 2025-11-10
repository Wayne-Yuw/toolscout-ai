# Docker Desktop 安装指南 (Windows 11)

## 方法 1: 官网下载安装 (推荐)

### 步骤 1: 下载 Docker Desktop

访问官方下载页面:
**https://www.docker.com/products/docker-desktop/**

或直接下载链接:
**https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe**

### 步骤 2: 运行安装程序

1. 双击下载的 `Docker Desktop Installer.exe`
2. 勾选以下选项:
   - ✅ Install required Windows components for WSL 2
   - ✅ Add shortcut to desktop
3. 点击 "OK" 开始安装
4. 等待安装完成(可能需要 5-10 分钟)

### 步骤 3: 重启电脑

安装完成后会提示重启,**必须重启才能使用 Docker**。

### 步骤 4: 启动 Docker Desktop

1. 从桌面或开始菜单打开 Docker Desktop
2. 首次启动会要求接受服务条款,点击 "Accept"
3. 可选:跳过教程(Skip tutorial)
4. 等待 Docker Engine 启动完成(左下角会显示 "Engine running")

### 步骤 5: 验证安装

打开 PowerShell 或 CMD,运行:

```bash
docker --version
docker compose version
```

如果显示版本号,说明安装成功!

---

## 方法 2: 使用 Chocolatey 安装

如果你已经安装了 Chocolatey 包管理器:

```powershell
# 以管理员身份运行 PowerShell
choco install docker-desktop -y
```

---

## 方法 3: 使用 winget 安装 (命令行)

以**管理员身份**打开 PowerShell,运行:

```powershell
winget install -e --id Docker.DockerDesktop --accept-source-agreements --accept-package-agreements
```

---

## 安装后验证

### 检查 Docker 版本
```bash
docker --version
docker compose version
```

### 运行测试容器
```bash
docker run hello-world
```

如果看到 "Hello from Docker!" 说明安装成功!

---

## 常见问题

### Q1: 提示需要 WSL 2

Windows 11 默认支持 WSL 2,但如果提示需要更新:

```powershell
# 以管理员身份运行
wsl --install
wsl --update
```

### Q2: Docker Desktop 启动失败

1. 确保已经重启电脑
2. 确保 Hyper-V 和虚拟化已启用:
   - 打开"控制面板" → "程序" → "启用或关闭 Windows 功能"
   - 勾选 "Hyper-V" 和 "虚拟机平台"
   - 点击确定并重启

### Q3: 下载速度慢

如果官网下载太慢,可以使用国内镜像:

**清华大学镜像:**
https://mirrors.tuna.tsinghua.edu.cn/docker-ce/win/static/stable/x86_64/

---

## 安装完成后的下一步

1. ✅ 重启电脑
2. ✅ 启动 Docker Desktop
3. ✅ 打开终端运行: `docker --version`
4. ✅ 进入项目目录: `cd d:\ai_coding_workspace\toolscout-ai`
5. ✅ 启动项目: `docker compose up -d`

---

## 需要帮助?

- Docker 官方文档: https://docs.docker.com/desktop/install/windows-install/
- 如果遇到问题,告诉我具体的错误信息,我来帮你解决!

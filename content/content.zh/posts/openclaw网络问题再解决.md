# OpenClaw 网络问题续：Clash TUN 模式一劳永逸

**日期**：2026-02-26  
**标签**：OpenClaw, Telegram, 代理, Clash, TUN 模式  

在上一篇中，我们记录了从零安装 OpenClaw、配置 Telegram 机器人、换用阿里云百炼 API 解决 rate limit 的全过程。本以为从此可以安心使用，没想到一次版本更新，又把网络问题带了回来。而这次，我们找到了终极解决方案——**Clash TUN 模式**。

---

## 更新后的噩梦

某天看到 OpenClaw 提示有新版本，顺手执行了升级：
```powershell
npm update -g openclaw
```
版本从 2026.2.23 升到了 2026.2.24。重启 gateway 后，熟悉的错误又出现了：
```
[telegram] deleteWebhook failed: Network request for 'deleteWebhook' failed!
```
明明 Clash 开着，代理环境变量也设置了，为什么 Node.js 就不走代理？

---

## 排查：为什么环境变量失效了？

### 1. 确认代理本身正常
在 PowerShell 里用 `curl` 测试：
```powershell
curl.exe -I https://api.telegram.org/bot
```
返回 `HTTP/1.1 200 Connection established`，说明代理是通的，端口 7890 没错。

### 2. 手动设置环境变量再启动
在同一个 PowerShell 窗口中：
```powershell
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"
openclaw gateway
```
日志依然全是 `Network request failed`。显然，OpenClaw 的 Node.js 进程根本没有使用这些变量。

### 3. 问题根源：Node.js 的 undici 库
查阅资料发现，Node.js 从 17.5 版本开始默认启用了新的 HTTP/HTTPS 实现库 `undici`，而这个库**不读取标准的 `HTTP_PROXY` 环境变量**。虽然可以通过代码配置代理，但 OpenClaw 本身并没有内置读取环境变量的逻辑。

换句话说，Clash 的“系统代理”模式（设置系统环境变量）只能影响浏览器等遵循标准代理协议的程序，对 Node.js 的 undici 无效。

---

## 终极方案：Clash TUN 模式

Clash 提供了更底层的 **TUN 模式**。它的原理是在系统中创建一张虚拟网卡，强制所有网络流量经过 Clash，无论程序是否支持代理。这就像在系统里建了一条“虚拟高速公路”，所有“车辆”（网络请求）都必须走这条路，Clash 就在收费站处理流量。

### 开启步骤（Clash for Windows）

#### 第一步：安装服务模式
TUN 模式需要 Clash 以系统服务方式运行，才能创建虚拟网卡。
1. 打开 Clash for Windows，进入 **General** 页面。
2. 找到 **Service Mode** 一行，点击右边的 **Manage**。
3. 在弹出的窗口中点击 **Install**，系统可能弹出 UAC 提示，点击“是”。
4. 安装成功后，Service Mode 右侧的图标会从灰色变为**绿色**。

#### 第二步：开启 TUN 模式
1. 仍在 **General** 页面，找到 **TUN Mode** 一行。
2. 将开关打开（变为绿色）。
3. （可选）点击右边的设置图标，可以微调 TUN 模式参数，但默认配置已足够。

#### 第三步：防火墙放行
首次开启 TUN 模式时，Windows 防火墙可能会弹出提示，询问是否允许 `clash-win64.exe` 在公共网络上通信，**务必点击“允许访问”**。

#### 第四步：重启 OpenClaw 验证
1. 关闭所有正在运行的 PowerShell 窗口。
2. 打开一个新的 PowerShell 窗口，直接运行：
   ```powershell
   openclaw gateway
   ```
3. 观察日志，如果出现：
   ```
   [telegram] setMyCommands succeeded
   [telegram] polling started
   ```
   恭喜，问题彻底解决！

---

## 自动化启动脚本

为了方便日常使用，在桌面创建 `start-openclaw.bat`，内容如下：
```batch
@echo off
title OpenClaw Gateway
echo 启动 OpenClaw...
openclaw gateway
pause
```
以后只需双击此文件，OpenClaw 就会在前台运行，关闭窗口即停止。

---

## 为什么 TUN 模式是终极方案？

- **对应用透明**：所有程序（包括 Node.js、curl、UWP 应用等）都自动走代理，无需任何配置。
- **稳定可靠**：不再依赖环境变量，也不怕程序更新后“不认识”代理设置。
- **一次配置，永久生效**：开启后 Clash 会随系统启动自动加载 TUN 模式，无需每次手动干预。

当然，TUN 模式也有一些小缺点：对系统资源消耗稍大，部分 DNS 设置可能需要调整。但对于追求“无感代理”的用户来说，这绝对是值得的。

---

## 总结

如果你也遇到了 OpenClaw（或其他命令行程序）无法走代理的问题，不妨试试 Clash 的 TUN 模式。它不仅能解决 Node.js 的网络问题，还能让所有应用都享受代理，堪称“一劳永逸”的方案。

至此，OpenClaw 的配置终于告一段落。从最初的网络不通，到 rate limit 困扰，再到版本更新后的代理失效，每一次都是对耐心的考验。但也正是这些折腾，让我们对 OpenClaw 的架构和网络原理有了更深的理解。

希望这篇记录能帮助到遇到类似问题的朋友。如果你有其他解决方案，欢迎留言交流！
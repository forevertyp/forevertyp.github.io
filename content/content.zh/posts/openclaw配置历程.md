# OpenClaw 配置指北：从安装到解决 API 限速的完整记录

**日期**：2026-02-24  
**标签**：OpenClaw, Telegram, AI, 阿里云, 配置教程  

最近发现了一个很有意思的开源项目——**OpenClaw**。它是一个能让你把 AI 接入各种聊天平台（Telegram、飞书等）的网关，而且支持丰富的“技能”（Skills），相当于给 AI 装上了各种插件。作为一个喜欢折腾的人，我决定把它跑起来，让它成为我的私人助手。但这个过程……嗯，有点曲折。好在最后成功了，现在把经验分享给大家，希望能帮你少踩坑。

## 一、从零开始安装

### 1.1 环境准备
OpenClaw 基于 Node.js，需要 22 以上的版本。我直接去 [Node.js官网](https://nodejs.org/) 下载了最新版，一路“下一步”装好。

### 1.2 安装 OpenClaw
官方推荐用 PowerShell 执行安装脚本：
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```
结果第一次就报错了：
```
iex : 无法加载文件 ...，因为在此系统上禁止运行脚本。
```
这是因为 PowerShell 默认禁止运行脚本。解决办法：**以管理员身份打开 PowerShell**，先放宽策略：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
再运行安装命令，成功！

### 1.3 配置向导
安装完会自动进入配置向导（`onboard`）。它会问你几个问题：
- 选择 **QuickStart**。
- 选择 AI 模型提供商：我选了 **Qwen**（通义千问），因为国内访问快，而且有免费额度。
- 选择聊天平台：我选了 **Telegram**，因为它配置简单。

## 二、Telegram 机器人的配置

### 2.1 获取 Bot Token
在 Telegram 里找到 **@BotFather**，发送 `/newbot`，按提示创建机器人，最后会得到一串 Token，比如 `123456:ABCdef...`。把它复制下来。

### 2.2 填入 Token
在向导中把 Token 粘贴进去，它就会自动完成配置。但等等，机器人没反应？打开日志一看，全是：
```
[telegram] setMyCommands failed: Network request for 'setMyCommands' failed!
```
**原因**：Telegram API 在国内被墙了。需要给 OpenClaw 设置代理。

### 2.3 设置代理
我的电脑上开着 Clash（端口 7890），所以在启动 OpenClaw 之前，先设置环境变量：
```powershell
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"
```
然后重新运行 `openclaw gateway`，日志中终于出现了：
```
[telegram] setMyCommands succeeded
[telegram] polling started
```
太好了，机器人上线了！

## 三、第一次对话：配对授权

给机器人发消息，它却回复：
```
OpenClaw: access not configured. Your Telegram user id: 7650264057
Pairing code: M67FM3NS
Ask the bot owner to approve with: openclaw pairing approve telegram M67FM3NS
```
原来默认的私聊策略是 `pairing`，需要手动授权。执行命令：
```powershell
openclaw pairing approve telegram M67FM3NS
```
再发消息，机器人终于回复了！🎉

## 四、突然的打击：API rate limit

正当我准备和机器人畅聊时，它突然回了一句：
```
⚠️ API rate limit reached. Please try again later.
```
What？我才聊了几句啊！查了一下，原来我用的 Qwen 是 OpenClaw 内置的 **`qwen-portal` 公共网关**，有严格的频率限制（毕竟大家共享）。要彻底解决，必须换成自己的阿里云百炼 API。

## 五、换用阿里云百炼官方 API

### 5.1 获取阿里云 API Key
登录 [阿里云百炼控制台](https://bailian.console.aliyun.com/)，在“API-KEY管理”里创建一个新的 Key。注意：新用户会有免费额度，即使需要付费，价格也极低（0.0025元/千 tokens），我的账户里充了 2 块钱，够用好几年。

### 5.2 修改 OpenClaw 配置
OpenClaw 的配置文件在 `~/.openclaw/openclaw.json`。我们需要添加一个新的模型提供商 `dashscope`（阿里云百炼的官方 API 地址），并修改默认模型。

最终配置如下（敏感信息已隐藏）：
```json
{
  "models": {
    "providers": {
      "qwen-portal": { ... }, // 原有的保留
      "dashscope": {
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "apiKey": "sk-你的完整Key",
        "api": "openai-completions",
        "models": [
          { "id": "qwen-plus", "name": "Qwen Plus", ... },
          { "id": "qwen-max", "name": "Qwen Max", ... }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "dashscope/qwen-plus"
      }
    }
  }
}
```
注意：`baseUrl` 一定要用 `compatible-mode/v1`，因为 OpenClaw 使用的是 OpenAI 兼容接口。

### 5.3 重启生效
保存文件，重启 gateway：
```powershell
openclaw gateway
```
日志显示 `agent model: dashscope/qwen-plus`，说明配置成功。

## 六、记忆系统的小插曲

为了进一步减少 token 消耗，我打算启用 OpenClaw 的记忆系统（可以自动管理上下文，避免每次对话都发全部历史）。配置里加了：
```json
"memory": { "backend": "memory-basic" }
```
结果启动时报错：
```
Config invalid: memory.backend: Invalid input
```
试了几个名字（`basic`、`file`、`memory`）都不行，可能当前版本不支持？暂时删掉这块，反正换了官方 API 后限速问题已经消失了，记忆功能等以后研究清楚了再加。

## 七、最终成果

现在，我的 Telegram 机器人已经稳定运行了好几天，再也没有遇到 rate limit。它不仅能聊天，还能通过安装各种技能（比如 GitHub 操作、PDF 处理）帮我做很多事情。更重要的是，整个过程让我对 OpenClaw 的架构和配置有了深刻理解。

## 八、经验总结

1. **网络问题是第一关**：在国内使用 Telegram 机器人，必须配置代理，而且要让 OpenClaw 的 gateway 继承代理环境变量。
2. **不要用公共网关**：`qwen-portal` 虽然方便，但限速严格。换成自己的 API 才是长久之计。
3. **配置文件手动修改更可靠**：OpenClaw 的 `config set` 命令有时会找不到路径，直接编辑 JSON 文件最保险。
4. **阿里云百炼是个好选择**：价格便宜，配额高，兼容 OpenAI 接口，接入简单。
5. **遇到问题看日志**：OpenClaw 的日志很详细，基本上所有问题都能从日志里找到线索。

如果你也想拥有一个自己的 AI 助手，不妨试试 OpenClaw。虽然配置过程有点折腾，但成功后的成就感也是满满的。如果遇到问题，欢迎在评论区交流，我会尽力帮忙。

---

**（本文所有 API Key、Token 均已打码，请勿直接使用）**
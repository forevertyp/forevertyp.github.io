---
title: "Obsidian 管理 Hugo Markdown 的避坑清单"
date: 2026-01-30T10:00:00+08:00
draft: false            # 写完改成 false 才发布
slug: obsidian-hugo-cheat-sheet   # 可选，固定链接
url: /post/obsidian-hugo-cheat-sheet/   # 可选，覆盖默认路径

# ===============  Hugo 可选字段  ===============
tags: ["Obsidian", "Hugo", "Markdown"]
categories: ["工具"]
summary: "一张模板搞定 Obsidian 与 Hugo 共用 Markdown 的全部坑点。"
# cover: ./cover.jpg      # 若用 page-bundle，封面图放同目
---

***
<!--  以下内容同时兼容 Obsidian 与 Hugo  -->
<!--  1. 关闭 Wikilink、图片放同目录、链接用标准 Markdown  -->
<!--  2. 行尾换行打两个空格或回车两次，否则 Hugo 不识别  -->

## 1. Obsidian 端必改 3 个设置

1. 设置 → 文件与链接 → **关闭**“使用 WikiLinks”  
2. 同一面板 → 新建链接格式 → 选“相对路径”  
3. 默认附件位置 → 选“同文件夹”（配合 Hugo page-bundle）

> 记得把 `.obsidian/workspace.json` 写进 `.gitignore`，避免多人冲突。

## 2. 图片示例（page-bundle 模式）

`![示例图片](./demo.png)`
<!-- 图片与 index.md 同目录，Hugo 生成后路径自动正确 -->

## 3. 内部链接示例

`请阅读[另一篇文章](./2025-12-31-example.md)。`  
<!-- 标准 Markdown 链接，两边都能跳转；不要用 [[xxx]] -->

## 4. 代码块高亮

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Obsidian → Hugo!")
}
```

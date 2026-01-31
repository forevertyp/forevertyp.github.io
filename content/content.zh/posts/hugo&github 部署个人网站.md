---
title: "Hugo+github搭建自己的学习网站"
date: 2026-01-30T19:55:34+08:00
---

# 搭建个人学习网站

## 准备工作

### 安装hugo

### 安装git

### 注册(登录)github账号

## 部署工作

### 命令行指令部分

##### 初始化hugo站点  

   1. 打开命令行工具(如Windows的命令提示符或PowerShell，macOS或Linux的终端)。
   2. 导航到你要创建hugo站点的目录。  
        ![保存路径]()
    
   3. 运行以下命令来初始化hugo站点：
      ```cmd
      hugo new site mysite
      ```
   4. 导航到mysite目录：
      ```
      cd mysite
      ```
   5. 初始化git仓库：
      ```
      git init
      ```
   6. 添加hugo主题：
      ```
      git submodule add https://github.com/yourusername/yourtheme.git themes/yourtheme
      ```
   7. 编辑config.toml文件，配置站点设置和主题。
   8. 运行hugo服务器，预览站点：
      ```
      hugo server -t yourtheme
      ```




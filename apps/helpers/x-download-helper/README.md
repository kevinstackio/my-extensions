# X Download Helper

## 1. 介绍

X Download Helper 是 X Download 浏览器扩展的 macOS 配套应用，负责接收扩展通过 Native Messaging 发送的任务并提供原生下载能力。

## 2. 项目框架

- 使用 Swift 和 AppKit 构建 macOS 菜单栏应用。
- `XDownloadHelper` 负责菜单栏界面、下载任务和用户通知。
- `XDownloadNativeHost` 负责 Chrome/Edge Native Messaging 接入。
- `Tests`、`XDownloadHelperTests` 和 `Tools` 提供测试与打包辅助。

## 3. 本目录项目结构

```text
x-download-helper/
├─ XDownloadHelper/              # macOS 菜单栏应用源码
├─ XDownloadNativeHost/          # Native Messaging Host
├─ NativeMessaging/              # Host 配置与通信资源
├─ Tests/                        # 打包和安装验证
├─ XDownloadHelperTests/         # 应用测试
├─ Tools/                        # 开发辅助工具
├─ VendorTools/                  # 第三方工具与说明
├─ XDownloadHelper.xcodeproj/    # Xcode 项目
└─ scripts/                      # 构建与安装脚本
```

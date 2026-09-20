# 本地视频工具

此目录只存放由 `scripts/prepare-video-tools.sh` 生成、且被 Git 忽略的本地工具：

```text
yt-dlp
ffmpeg
```

首次构建或固定版本变更时，在仓库根目录执行：

```text
zsh apps/helpers/x-download-helper/scripts/prepare-video-tools.sh
```

准备脚本会校验固定版本和 SHA-256，并在全部校验通过后才替换旧工具。普通 Xcode 构建不会联网下载，也不会搜索 Homebrew 或系统 `PATH`。

FFmpeg 9.0.2 源码归档可预先放在 `Tools/downloads/ffmpeg-9.0.2.tar.xz`；准备脚本会优先使用该本地归档，不存在时才访问清单中的官方下载地址。

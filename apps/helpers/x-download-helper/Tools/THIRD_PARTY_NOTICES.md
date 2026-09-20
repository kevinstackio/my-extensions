# 第三方工具来源与许可

## yt-dlp

- 版本：`2026.08.19`
- 资产：官方 GitHub Release 的 `yt-dlp_macos`
- 来源：https://github.com/yt-dlp/yt-dlp/releases/tag/2026.08.19
- SHA-256：`0f192b7ec147ab6288885d6351d9ab67367640029b4377576ef46dd79cf7b202`
- Release 说明：PyInstaller 可执行文件随版本发布的 `THIRD_PARTY_LICENSES.txt` 受其列出的许可约束。

## FFmpeg

- 版本：`9.0.2`
- 来源：https://ffmpeg.org/releases/ffmpeg-9.0.2.tar.xz
- 官方下载说明：https://www.ffmpeg.org/download.html
- 源码归档 SHA-256：`8c3850283eb25fa026482078a04051e0be17347b09ef81a0849bec15a96e002e`
- 构建边界：仅构建 `ffmpeg`，不构建 `ffplay` 或 `ffprobe`，不引入外部 GPL 编码库。
- FFmpeg 及其构建结果遵循 FFmpeg 项目适用许可；未来对外分发前仍需单独完成许可审查。

# 照片存储策略

## 结论

不要把 `media/` 提交到 Git，也不要把摄影原件放进网站的公开目录。

采用两个逻辑区域：

| 区域 | 内容 | 可见性 |
| --- | --- | --- |
| `find-white-rabbit-originals` | 相机/Instagram 导出的原文件 | 私有，仅摄影师和维护者可访问 |
| `find-white-rabbit-web` | 供展览显示的压缩衍生图 | 公开 CDN 读取 |

推荐 Cloudflare R2 作为对象存储，配合一个专用子域名（例如 `images.example.com`）。它适合小型静态摄影展：文件不进 Git、可直接由 CDN 交付，也不需要数据库或媒体服务。

## 本地开发

`media/` 是被 `.gitignore` 排除的本地原件目录。开发时，`/api/artwork/<key>` 只读这个目录，因此克隆代码的人即使没有照片也不会把它们误提交。

作品数据只保存稳定对象键，例如：

```ts
"201807/17886990100240451.jpg"
```

不保存机器路径，也不保存会失效的第三方链接。

## 发布时切换

上传已经处理过的展示图到公开 bucket，保持与 `content/artworks.ts` 相同的目录和文件名；然后在部署平台设置：

```bash
NEXT_PUBLIC_MEDIA_BASE_URL=https://images.example.com
```

页面会自动从：

```text
/api/artwork/17941740331294347.jpg
```

切换到：

```text
https://images.example.com/17941740331294347.jpg
```

无需修改组件或把图片加入 Git。

## 上传前处理

1. 保留本地原件，不覆盖。
2. 每张生成最大边 1600px 的 JPEG（质量约 82）和 AVIF/WebP 衍生版。
3. 当前首版可先上传 JPEG；图片总量很小，后续再接入格式协商。
4. 展示图可以公开；原件 bucket 必须保持私有，禁用列表浏览和公开写入。

当前 `media` 约 4.9MB；这批方图作为 MVP 的 JPEG 展示图已经足够轻，先不要为了它引入图库 SaaS、CMS 或付费图片 API。

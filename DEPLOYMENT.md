# STEM SVG 部署指南

## 本地开发测试（当前阶段）

### 1. 启动开发服务器
```bash
cd ~/project/stemsvg
npm run dev
```
访问 `http://localhost:4321`

### 2. 构建测试
```bash
npm run build
npm run preview
```

---

## Cloudflare Pages 部署（准备就绪后）

### 方式一：命令行部署（快速测试）

1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

2. 登录 Cloudflare
```bash
wrangler login
```

3. 构建并部署
```bash
npm run build
npx wrangler pages deploy dist --project-name=stemsvg
```

### 方式二：Git 自动部署（推荐用于生产）

#### 步骤 1: 推送到 GitHub
```bash
cd ~/project/stemsvg
git init
git add .
git commit -m "feat: 初始化 STEM SVG 项目"
git branch -M main
git remote add origin https://github.com/你的用户名/stemsvg.git
git push -u origin main
```

#### 步骤 2: 在 Cloudflare 控制台配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 授权并选择你的 `stemsvg` 仓库
5. 配置构建设置：
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: 无需配置

6. 点击 **Save and Deploy**

#### 步骤 3: 获取部署 URL

部署完成后，你将获得：
- 生产环境: `https://stem.askingai.org`
- 自定义域名（可选）: `https://你的域名.com`

---

## 后续更新流程

### 自动部署
```bash
# 本地修改后
git add .
git commit -m "feat: 添加新题目"
git push origin main

# Cloudflare 自动检测并重新构建部署（约 1-2 分钟）
```

### 预览部署
每个 Pull Request 都会自动创建预览部署，URL 格式：
```
https://分支名.stemsvg.pages.dev
```

---

## 性能优化建议

### 1. 图片优化
- 使用 SVG 优先（已实现）
- 栅格图片使用 WebP 格式
- 启用 Cloudflare 自动图片优化

### 2. 缓存策略
Cloudflare Pages 自动配置最佳缓存头：
- HTML: 无缓存（始终最新）
- JS/CSS: 长期缓存（带版本哈希）
- 静态资源: 1年缓存

### 3. 分析工具
- 使用 Cloudflare Web Analytics（免费，无 cookie）
- Lighthouse CI 集成（待实现）

---

## 环境变量配置（如需接入 API）

在 Cloudflare Pages 设置页面添加：
```
GEMINI_API_KEY=your_key_here
NODE_VERSION=20
```

---

## 故障排除

### 构建失败
1. 检查 Node.js 版本（需要 18+）
2. 清除依赖重新安装：`rm -rf node_modules && npm install`
3. 本地测试构建：`npm run build`

### 部署后页面空白
1. 检查构建输出目录是否正确（`dist/`）
2. 确认所有路径使用相对路径，非绝对路径

### SVG 不显示
1. 检查 SVG `role="img"` 和 ARIA 属性
2. 验证 viewBox 属性设置正确

---

## 当前状态

✅ 本地开发环境就绪  
✅ 项目结构完成  
✅ 示例页面创建  
⏳ 等待推送到 GitHub  
⏳ 等待配置 Cloudflare Pages

---

## 下一步

1. 完善更多学科题目
2. 创建交互式 React 组件
3. 实现模板系统
4. 推送到 GitHub
5. 配置自动部署

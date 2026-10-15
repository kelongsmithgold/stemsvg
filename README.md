# STEM SVG

> 高中数理化生交互式 SVG 学习平台 · 基于 Astro + React + Tailwind CSS 构建 · 免费部署于 Cloudflare Pages

## 功能特性

- 📐 **数学** — 函数图像、几何证明、向量与微积分动画
- ⚛️ **物理** — 光学仿真、电路分析、力学与天体运动
- 🧪 **化学** — 分子结构、有机反应机理、实验装置
- 🧬 **生物** — 细胞结构、遗传系谱、免疫调节流程

**核心体验**：每道题通过 `data-layer` 分步显隐 SVG 图层，配合右侧解题卡片，实现「审题 → 辅助线 → 推导 → 结论」四层渐进式讲解；知识点页提供可拖拽参数控制点，帮助学生建立动态直觉。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Astro 7（SSG 静态生成） |
| UI 组件 | React 19（Islands 架构按需水合） |
| 样式 | Tailwind CSS 4 |
| 内容 | MDX（Markdown + React 组件混写） |
| 语言 | TypeScript（strict 模式） |
| 部署 | Cloudflare Pages 免费方案 |

## 项目结构

```
stemsvg/
├── src/
│   ├── assets/
│   │   └── svg/                    # SVG 源文件（?raw 导入）
│   │       ├── math/
│   │       ├── physics/
│   │       ├── chemistry/
│   │       └── biology/
│   ├── components/
│   │   ├── Breadcrumb.astro        # 面包屑导航（Schema.org 结构化数据）
│   │   └── explainer/
│   │       ├── StepSvgExplainer.tsx    # 核心：分步图层讲解器
│   │       └── InteractiveQuadratic.tsx # 示例：可拖拽二次函数
│   ├── layouts/
│   │   └── MainLayout.astro        # 通用布局（导航 + SEO meta + footer）
│   ├── lib/
│   │   └── template-engine.ts      # JSON 驱动的 SVG 模板引擎
│   ├── pages/
│   │   ├── index.astro             # 首页
│   │   ├── knowledge/              # 知识点专栏
│   │   └── problems/               # 题库
│   │       ├── index.astro         # 题库总入口
│   │       ├── math/               # 数学（2 道题）
│   │       ├── physics/            # 物理（占位，内容建设中）
│   │       ├── chemistry/          # 化学（占位，内容建设中）
│   │       └── biology/            # 生物（占位，内容建设中）
│   └── styles/
│       └── global.css
├── public/
│   ├── favicon.svg
│   └── favicon.ico
├── COMPONENT-GUIDE.md              # 组件使用文档
├── DEPLOYMENT.md                   # 部署指南
└── GOAL-COMPLETION.md              # 阶段目标完成报告
```

## 核心组件

### `StepSvgExplainer`

分步 SVG 图层讲解器，通过 DOM 操作（非 `dangerouslySetInnerHTML`）切换图层 `opacity`：

```astro
---
import StepSvgExplainer from '../components/explainer/StepSvgExplainer.tsx';
import svgContent from '../assets/svg/math/my-diagram.svg?raw';

const steps = [
  { id: 0, label: '第一步', description: '说明文字', layers: ['base'] },
  { id: 1, label: '第二步', description: '进一步说明', layers: ['base', 'step2'] },
];
---

<StepSvgExplainer title="题目标题" steps={steps} svgContent={svgContent} client:load />
```

SVG 文件中用 `data-layer` 标记图层：

```svg
<svg viewBox="0 0 680 420">
  <g data-layer="base"><!-- 始终显示的基础内容 --></g>
  <g data-layer="step2"><!-- 第二步才出现的内容 --></g>
</svg>
```

**特性**：键盘 `←→` 导航（聚焦组件后生效）、累积/单步切换、`useMemo` 缓存可见图层集合、ARIA 无障碍支持。

### `TemplateEngine`

JSON 驱动的参数化 SVG 模板引擎：

```typescript
import { TemplateLoader } from '@/lib/template-engine';

TemplateLoader.register(myTemplate);          // 注册模板
const engine = TemplateLoader.createEngine('my-template');
engine.setVariable('radius', 50);             // 设置变量（含范围校验 + 开发警告）
const svg = engine.renderSVG();               // 渲染输出
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器（后台模式）
astro dev --background

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

访问 `http://localhost:4321` 查看：
- **首页**：四学科导航卡片
- **数学 / 三角形内角和**：`/problems/math/triangle-angles` — StepSvgExplainer 完整示例
- **数学 / 二次函数**：`/problems/math/quadratic-function` — 可拖拽交互演示
- **题库总览**：`/problems`
- **知识点**：`/knowledge`

## 内容创作

### 新建题目页

```
src/assets/svg/<学科>/<题目slug>.svg   ← SVG 源文件（用 data-layer 分图层）
src/pages/problems/<学科>/<题目slug>.astro ← 页面文件
```

在列表页 `src/pages/problems/<学科>/index.astro` 的数组中补充元数据，即可出现在题库卡片中。

### 重型 SVG（TikZ / SchemDraw）

通过 GitHub Actions 在推送时离线编译，输出 SVG 文件提交回仓库，Cloudflare 只处理静态文件，规避 10ms CPU 限制。参见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 路线图

- [x] 项目框架搭建（Astro + React + Tailwind）
- [x] `StepSvgExplainer` 核心组件
- [x] `TemplateEngine` 模板引擎
- [x] 数学题目 × 2（二次函数、三角形内角和）
- [x] Breadcrumb 导航 + SEO meta
- [x] `/problems` 和 `/knowledge` 路由
- [ ] Cloudflare Pages 部署
- [ ] 物理题目（凸透镜成像）
- [ ] 化学题目（有机官能团）
- [ ] 生物题目（遗传系谱）
- [ ] GitHub Actions SVG 编译流水线
- [ ] Astro Content Collections 数据层
- [ ] Pagefind 全文搜索

## 许可证

MIT

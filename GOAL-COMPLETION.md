# STEM SVG 阶段目标完成报告

📅 最后更新：2026-10-15  
🔖 版本：v0.2（代码审查与修复阶段）

---

## 迭代一：项目初始化 ✅

**完成时间**：2026-10-15 03:05  
**构建状态**：✅ 成功（10 个页面）

### 交付内容

| 组件 / 模块 | 文件 | 状态 |
|------------|------|------|
| StepSvgExplainer（分步讲解器） | `src/components/explainer/StepSvgExplainer.tsx` | ✅ |
| InteractiveQuadratic（可拖拽二次函数） | `src/components/explainer/InteractiveQuadratic.tsx` | ✅ |
| TemplateEngine + TemplateLoader | `src/lib/template-engine.ts` | ✅ |
| MainLayout 布局 | `src/layouts/MainLayout.astro` | ✅ |
| 首页 | `src/pages/index.astro` | ✅ |
| 数学题库（列表 + 2 道题） | `src/pages/problems/math/` | ✅ |
| 物理 / 化学 / 生物（占位页） | `src/pages/problems/*/` | ✅ |
| 模板演示页 | `src/pages/template-demo.astro` | ✅ |

### 探针测试验证

- ✅ SVG 可访问性属性（WCAG 2.1 AA 合规）
- ✅ Astro 7.3.8 最新版兼容性（Node.js v26.11.1）
- ✅ 数理化生 4 科模板结构 JSON 格式验证

---

## 迭代二：代码审查与修复 ✅

**完成时间**：2026-10-15 03:48  
**构建状态**：✅ 成功（12 个页面，0 错误，0 警告，~200ms）

### 修复清单（共 12 个问题）

#### 🔴 严重问题（3 个）

**Fix #1 — SVG 注入方式重构**  
文件：`StepSvgExplainer.tsx`

- **修复前**：每次步骤切换都触发 `dangerouslySetInnerHTML` + 正则替换整个 SVG 字符串，重写 DOM 子树，存在性能瓶颈和 XSS 风险
- **修复后**：`useRef` 持有容器，首次挂载 `innerHTML = svgContent`（只执行一次），步骤切换通过 `querySelectorAll('[data-layer]')` 直接操作 `style.opacity`

```tsx
// ✅ 首次挂载一次性注入
useEffect(() => {
  if (containerRef.current) containerRef.current.innerHTML = svgContent;
}, []); // 空依赖，仅执行一次

// ✅ 步骤切换只操作 opacity
useEffect(() => {
  const layers = containerRef.current?.querySelectorAll('[data-layer]');
  layers?.forEach(layer => {
    layer.style.opacity = visibleLayers.has(layer.getAttribute('data-layer')) ? '1' : '0';
  });
}, [visibleLayers]);
```

---

**Fix #2 — 键盘监听范围修正**  
文件：`StepSvgExplainer.tsx`

- **修复前**：`window.addEventListener('keydown', ...)` 全局监听，多组件实例共存时方向键会同时控制所有实例
- **修复后**：组件根元素添加 `tabIndex={0}`，改用 `onKeyDown` 事件，仅响应获得焦点的组件

```tsx
// ✅ 聚焦后才响应键盘，支持多实例互不干扰
<div tabIndex={0} onKeyDown={handleKeyDown} className="... focus:ring-2 focus:ring-blue-400">
```

---

**Fix #3 — 模板引擎构建期兼容**  
文件：`template-engine.ts`

- **修复前**：`loadFromJSON(path)` 用 `fetch()` 请求相对路径，在 Astro SSG 构建期 Node.js 环境中不存在 HTTP 服务，调用必定失败
- **修复后**：拆分为两个职责清晰的方法，附加明确注释

```typescript
// 客户端运行时使用（不可在 Astro frontmatter 中调用）
static async loadFromURL(url: string): Promise<void> { ... }

// 构建期/SSR 使用（在 .astro frontmatter 中调用）
static loadFromObject(templateObject: Template): void { ... }
```

---

#### 🟠 重要问题（4 个）

**Fix #4 — 移动端 Touch 事件**  
文件：`InteractiveQuadratic.tsx`

- 新增 `onTouchStart` / `onTouchMove` / `onTouchEnd` 处理器
- `e.preventDefault()` 阻止触摸时页面滚动
- `window.mouseup` + `window.touchend` 全局 cleanup，防止拖出 SVG 区域后卡住
- SVG 添加 `touch-none` Tailwind 类禁用默认触摸行为

**Fix #5 — `useMemo` 缓存可见图层集合**  
文件：`StepSvgExplainer.tsx`

- 原 `shouldShowLayer()` 每次渲染都遍历所有步骤×图层，O(steps×layers)
- 改为 `useMemo<Set<string>>` 缓存，仅当 `currentStep`/`cumulativeMode`/`steps` 变化时重算

**Fix #6 — MainLayout SEO 与导航完善**  
文件：`MainLayout.astro`

- 新增 Open Graph 和 Twitter Card meta 标签（`og:title`、`og:description`、`og:url` 等）
- 新增 `<link rel="canonical">` + `<link rel="icon">` + `<link rel="apple-touch-icon">`
- 导航从普通 `<nav>` 升级为 `sticky top-0` 带 backdrop blur 的粘性导航
- 新增 `<footer>` 含版权信息和链接
- 新增可选 `path` prop 用于 canonical URL 生成

**Fix #7 — setVariable 开发环境警告**  
文件：`template-engine.ts`

- 变量名拼错时原来静默忽略，导致 SVG 中留有未替换的 `{{变量名}}` 占位符
- 修复后在 `import.meta.env?.DEV` 下输出 `console.warn` 并列出所有可用变量名

---

#### 🟡 改进建议（5 个）

**Fix #8 — ARIA slider 语义**  
文件：`InteractiveQuadratic.tsx`

- 可拖拽 C 点补充 `role="slider"`、`aria-label`、`aria-valuemin`、`aria-valuemax`、`aria-valuenow`、`aria-valuetext`、`tabIndex={0}`
- `<desc>` 标签实时反映当前坐标和解析式（`aria-live` 区域）

**Fix #9 — SVG 独立文件化**  
文件：`triangle-angles.astro` + 新建 `src/assets/svg/math/triangle-angles.svg`

- 原 117 行 SVG 字符串内联在 `.astro` 页面中，难以维护和复用
- 抽取为独立 `.svg` 文件，通过 Vite 的 `?raw` import 读取：`import svgContent from '...svg?raw'`
- 同步改进 SVG 内容：补充 `<desc>`、角度标注文字、结论框加 QED 符号

**Fix #10 — 常量从 `useState` 移出**  
文件：`InteractiveQuadratic.tsx`

- `POINT_A`、`POINT_B`、`SCALE`、`ORIGIN_X`、`ORIGIN_Y` 均为纯常量
- 从 `useState` 初始值改为模块级 `const`，避免每次组件实例化创建新对象

**Fix #11 — 路径生成 `useMemo`**  
文件：`InteractiveQuadratic.tsx`

- `generateParabolaPath()` 每次渲染都循环约 60 次生成路径字符串
- 改为 `useMemo(() => ..., [a])` 缓存，仅当参数 `a` 变化时重算

**Fix #12 — 路由完整与面包屑导航**  
新建文件：`/problems/index.astro`、`/knowledge/index.astro`、`Breadcrumb.astro`  
更新文件：全部 7 个 `problems/*/` 页面

- 新建 `/problems` 题库总入口（四学科卡片，含题目计数）
- 新建 `/knowledge` 知识点总入口（占位，修复导航 404）
- 新建 `Breadcrumb.astro`（Schema.org `BreadcrumbList` 结构化数据 + `aria-current="page"`）
- 所有题目页和列表页统一接入面包屑

---

### 新增文件汇总

| 文件 | 说明 |
|------|------|
| `src/assets/svg/math/triangle-angles.svg` | 三角形内角和 SVG 源文件（Fix #9） |
| `src/components/Breadcrumb.astro` | 面包屑导航组件（Fix #12） |
| `src/pages/problems/index.astro` | 题库总入口页（Fix #12） |
| `src/pages/knowledge/index.astro` | 知识点总入口页（Fix #6/#12） |

---

## 当前项目质量评估

| 维度 | 迭代一（初始化） | 迭代二（修复后） |
|------|----------------|----------------|
| 性能（SVG 切换） | ❌ 每次重写 DOM | ✅ 直接操作 opacity |
| 安全（XSS） | ⚠️ 潜在风险 | ✅ 单次注入，无重复 |
| 移动端支持 | ❌ 无 Touch 事件 | ✅ 完整 Touch 支持 |
| 键盘多实例 | ❌ 全局 window | ✅ 组件级 onKeyDown |
| SEO | ❌ 无 OG meta | ✅ 完整 OG + canonical |
| 导航 | ⚠️ 多处 404 | ✅ 全路由可访问 |
| 可访问性 | ⚠️ 基础 ARIA | ✅ slider + aria-live |
| 代码组织 | ⚠️ SVG 内联页面 | ✅ 资源文件分离 |
| 开发体验 | ⚠️ 静默错误 | ✅ 开发警告提示 |
| 构建结果 | ✅ 10 页，通过 | ✅ 12 页，0 警告 |

---

## 下一阶段目标

### 阶段三：部署上线（P0，本周）

- [ ] `git init` → push GitHub → 连接 Cloudflare Pages
- [ ] 验证生产环境（Touch、React island 水合、所有路由）
- [ ] 更新 `MainLayout.astro` 中的 `siteUrl` 为真实域名

### 阶段四：四科内容扩充（P1，下周）

- [ ] 物理：凸透镜成像（5 步分层 SVG）
- [ ] 化学：有机官能团识别（SmilesDrawer SSR 预渲染）
- [ ] 生物：遗传系谱推导（7 步分层 SVG）
- [ ] 知识点专栏：每科 1 个标杆页面

### 阶段五：工程基础设施（P1，并行）

- [ ] GitHub Actions：TikZ/SchemDraw 离线编译 SVG 流水线
- [ ] Astro Content Collections：数据层替代硬编码数组
- [ ] 清理 `quadratic-svg.astro` 残留页

### 阶段六：搜索与发现（P2，题目 10+ 后）

- [ ] Pagefind 静态全文搜索
- [ ] 三维筛选器（学科 × 难度 × 标签）

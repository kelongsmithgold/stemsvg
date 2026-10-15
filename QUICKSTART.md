# STEM SVG 快速开始指南

## ✅ 项目已初始化完成

你的 STEM SVG 项目已经创建并构建成功！

## 🚀 立即体验

### 1. 启动开发服务器（推荐）

```bash
cd ~/project/stemsvg
npm run dev
```

访问 `http://localhost:4321` 查看：
- **首页**: 四学科导航卡片
- **示例题目**: `/problems/math/quadratic-function` - 二次函数动画解析

### 2. 查看构建结果

已构建的静态文件在 `dist/` 目录，可以直接部署到任何静态托管服务。

```bash
npm run preview  # 预览构建结果（端口 4321）
```

---

## 📁 项目结构说明

```
stemsvg/
├── src/
│   ├── layouts/MainLayout.astro    ✅ 已创建 - 通用页面布局
│   ├── pages/
│   │   ├── index.astro              ✅ 已创建 - 首页
│   │   └── problems/math/
│   │       └── quadratic-function.astro  ✅ 已创建 - 示例题目
│   └── styles/global.css            ✅ 已创建 - 全局样式
│
├── dist/                            ✅ 已构建 - 可部署的静态文件
├── README.md                        ✅ 项目文档
├── DEPLOYMENT.md                    ✅ 部署指南
└── package.json                     ✅ 依赖配置
```

---

## 📝 添加新题目

### 方法 1: 复制示例题目

```bash
cd ~/project/stemsvg/src/pages/problems
cp math/quadratic-function.astro math/my-new-problem.astro
# 编辑 my-new-problem.astro
```

### 方法 2: 使用 MDX 格式（更灵活）

创建 `src/pages/problems/math/example.mdx`:

```mdx
---
layout: ../../../layouts/MainLayout.astro
title: "你的题目标题"
---

## 题目描述
[题目内容]

## 解题步骤
[详细讲解]
```

---

## 🎨 创建交互式 SVG 组件

### 1. 创建 React 组件

```tsx
// src/components/explainer/AnimatedGraph.tsx
import { useState } from 'react';

export default function AnimatedGraph() {
  const [active, setActive] = useState(false);
  
  return (
    <svg viewBox="0 0 400 400" className="w-full">
      <circle
        cx="200"
        cy="200"
        r="50"
        fill={active ? "#3b82f6" : "#e5e7eb"}
        onClick={() => setActive(!active)}
        style={{ cursor: 'pointer' }}
      />
    </svg>
  );
}
```

### 2. 在页面中使用

```astro
---
import AnimatedGraph from '../../components/explainer/AnimatedGraph.tsx';
---

<AnimatedGraph client:load />
```

---

## 🛠 常用命令

```bash
# 开发
npm run dev           # 启动开发服务器（热更新）
npm run build         # 构建生产版本
npm run preview       # 预览构建结果

# 清理
rm -rf dist node_modules/.astro  # 清理缓存
npm install           # 重新安装依赖
```

---

## 🐛 常见问题

### Q: 修改代码后没有更新？
A: 开发服务器会自动热更新，如果没反应试试刷新浏览器

### Q: 构建失败？
A: 检查是否有 Tailwind CSS 类名错误，使用标准类（如 `bg-gray-100` 而非自定义 `bg-muted`）

### Q: SVG 不显示？
A: 确保 `viewBox` 属性设置正确，检查坐标系

---

## 📦 下一步计划

1. **添加更多题目**
   - 每个学科至少 3-5 道题
   - 覆盖不同难度和知识点

2. **创建组件库**
   - 可复用的交互式 SVG 组件
   - 数学函数图像、物理运动模拟等

3. **部署上线**
   - 推送到 GitHub
   - 连接 Cloudflare Pages（参考 DEPLOYMENT.md）

4. **功能增强**
   - 题目搜索和筛选
   - 用户进度跟踪
   - 评论讨论区

---

## 💡 提示

- SVG 使用 Tailwind 类进行样式控制
- 静态页面支持客户端 React 组件（使用 `client:load` 指令）
- 所有路径使用相对路径，方便部署
- 已内置无障碍支持（ARIA 属性）

---

## 🆘 需要帮助？

- 查看 README.md 了解详细功能
- 查看 DEPLOYMENT.md 了解部署流程
- 参考 `/problems/math/quadratic-function` 了解示例结构
- Astro 文档: https://docs.astro.build
- Tailwind CSS 文档: https://tailwindcss.com/docs

---

**准备好了吗？运行 `npm run dev` 开始创作吧！** 🎉

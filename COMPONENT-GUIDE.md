# 核心组件使用指南

## 1️⃣ StepSvgExplainer - 分步讲解器组件

### 功能特性

- ✅ 分步展示 SVG 图层
- ✅ 累积/单步模式切换
- ✅ 键盘快捷键支持（← → 方向键）
- ✅ 进度追踪
- ✅ 响应式设计

### 使用方法

#### 步骤 1: 定义步骤数据

```typescript
const steps = [
  {
    id: 0,
    label: "步骤标题",
    description: "步骤详细说明",
    layers: ["layer1", "layer2"]  // 该步骤要显示的图层 ID
  },
  // ... 更多步骤
];
```

#### 步骤 2: 准备 SVG 内容

```html
<svg viewBox="0 0 680 420">
  <!-- 使用 data-layer 属性标记图层 -->
  <g data-layer="layer1">
    <!-- 基础内容 -->
  </g>
  
  <g data-layer="layer2">
    <!-- 第二层内容 -->
  </g>
</svg>
```

#### 步骤 3: 在页面中使用

```astro
---
import StepSvgExplainer from '../components/explainer/StepSvgExplainer.tsx';

const steps = [...];
const svgContent = `<svg>...</svg>`;
---

<StepSvgExplainer 
  title="标题"
  steps={steps}
  svgContent={svgContent}
  width={680}
  height={420}
  client:load
/>
```

### 完整示例

参见：`src/pages/problems/math/triangle-angles.astro`

---

## 2️⃣ TemplateEngine - 模板驱动系统

### 功能特性

- ✅ JSON 配置驱动
- ✅ 变量替换
- ✅ 颜色主题
- ✅ 类型安全
- ✅ 参数验证

### 模板结构

```typescript
interface Template {
  type: 'mathematics' | 'physics' | 'chemistry' | 'biology';
  template_id: string;           // 唯一标识
  name: string;                  // 显示名称
  description: string;           // 描述
  svg_base: string;              // SVG 模板（支持变量）
  steps: TemplateStep[];         // 步骤定义
  variables?: Record<string, TemplateVariable>;  // 可调参数
  colors?: Record<string, string>;               // 配色方案
}
```

### 使用流程

#### 1. 创建模板 JSON

```json
{
  "type": "mathematics",
  "template_id": "my-template",
  "name": "示例模板",
  "description": "模板说明",
  "svg_base": "<svg>...<circle cx=\"{{x}}\" fill=\"{{color:primary}}\"/>...</svg>",
  "steps": [
    {
      "step": 0,
      "label": "第一步",
      "description": "说明",
      "layers": ["base"]
    }
  ],
  "variables": {
    "x": {
      "default": 100,
      "range": [0, 200],
      "step": 10
    }
  },
  "colors": {
    "primary": "#3b82f6"
  }
}
```

#### 2. 注册模板

```typescript
import { TemplateLoader, type Template } from '@/lib/template-engine';

const myTemplate: Template = { /* ... */ };
TemplateLoader.register(myTemplate);
```

#### 3. 使用模板

```typescript
// 创建引擎实例
const engine = TemplateLoader.createEngine('my-template');

// 设置变量
engine.setVariable('x', 150);

// 渲染 SVG
const svg = engine.renderSVG();

// 获取步骤
const steps = engine.getSteps();
```

### 变量替换语法

在 `svg_base` 中使用：

- `{{变量名}}` - 替换为变量值
- `{{color:颜色键}}` - 替换为配色方案中的颜色

示例：
```html
<circle cx="{{x}}" cy="{{y}}" fill="{{color:primary}}" />
```

### 完整示例

参见：
- 模板定义：`src/pages/template-demo.astro`
- 引擎使用：`src/lib/template-engine.ts`

---

## 3️⃣ 组合使用

将两个系统结合使用：

```astro
---
import { TemplateLoader } from '@/lib/template-engine';
import StepSvgExplainer from '@/components/explainer/StepSvgExplainer.tsx';

// 1. 加载模板
const engine = TemplateLoader.createEngine('quadratic-function');

// 2. 设置参数
engine.setVariable('vertex_y', 150);

// 3. 渲染 SVG
const svgContent = engine.renderSVG();

// 4. 获取步骤
const steps = engine.getSteps();
---

<!-- 5. 使用组件展示 -->
<StepSvgExplainer 
  title={engine.getMetadata().name}
  steps={steps}
  svgContent={svgContent}
  client:load
/>
```

---

## 4️⃣ 最佳实践

### SVG 图层设计

1. **基础层优先**：先绘制坐标系、网格等基础元素
2. **逐步添加**：每个步骤添加新元素，不要隐藏已有元素
3. **语义化命名**：图层名称要清晰（如 `triangle`, `angle-marks`, `conclusion`）

### 步骤拆分

1. **一步一个概念**：每步只讲解一个知识点
2. **循序渐进**：从简单到复杂
3. **控制数量**：建议 4-8 个步骤

### 模板设计

1. **参数化关键值**：把会变化的数值设为变量
2. **保留扩展性**：预留足够的变量范围
3. **文档化**：在 description 中说明模板用途

### 性能优化

1. **控制 SVG 大小**：单个 SVG 不超过 100KB
2. **减少图层数量**：合并不需要单独控制的元素
3. **使用 CSS 动画**：而非 JavaScript 动画

---

## 5️⃣ 故障排查

### StepSvgExplainer 不显示

- ✅ 检查 `client:load` 指令
- ✅ 确认 SVG 中有 `data-layer` 属性
- ✅ 查看浏览器控制台错误

### 模板变量未替换

- ✅ 检查变量名拼写
- ✅ 确认使用 `{{变量名}}` 语法
- ✅ 验证变量已通过 `setVariable` 设置

### 图层不显示/不隐藏

- ✅ 确认 `data-layer` 值与步骤中的 `layers` 数组匹配
- ✅ 检查是否拼写错误
- ✅ 查看累积模式是否开启

---

## 6️⃣ 扩展开发

### 添加新功能到 StepSvgExplainer

```typescript
// 在组件中添加新的交互功能
const [customFeature, setCustomFeature] = useState(false);

// 在 render 中使用
<button onClick={() => setCustomFeature(!customFeature)}>
  自定义功能
</button>
```

### 扩展模板系统

```typescript
// 添加新的模板类型
export type ExtendedType = Template['type'] | 'engineering' | 'computer-science';

// 添加新的验证规则
class TemplateValidator {
  static validate(template: Template): boolean {
    // 自定义验证逻辑
  }
}
```

---

## 7️⃣ 示例项目

查看完整示例：

1. **三角形内角和证明**：`/problems/math/triangle-angles`
   - 展示 StepSvgExplainer 基础用法
   
2. **二次函数图像**：`/problems/math/quadratic-function`
   - React 交互式组件示例
   
3. **模板系统演示**：`/template-demo`
   - 模板注册和使用流程

---

## 8️⃣ API 参考

### StepSvgExplainer Props

| 属性 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | ✅ | 组件标题 |
| steps | Step[] | ✅ | 步骤数组 |
| svgContent | string | ✅ | SVG HTML 字符串 |
| width | number | ❌ | SVG 宽度（默认 680） |
| height | number | ❌ | SVG 高度（默认 420） |

### TemplateEngine 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| setVariable | name, value | void | 设置变量值 |
| getVariable | name | number | 获取变量值 |
| renderSVG | - | string | 渲染 SVG |
| getSteps | - | Step[] | 获取步骤 |
| getMetadata | - | object | 获取元数据 |

---

**需要帮助？** 查看源代码或在 GitHub Issues 中提问。

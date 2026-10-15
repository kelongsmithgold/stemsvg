// 模板类型定义
export interface TemplateVariable {
  default: number;
  range: [number, number];
  step?: number;
}

export interface TemplateStep {
  step: number;
  label: string;
  description: string;
  layers: string[];
}

export interface Template {
  type: 'mathematics' | 'physics' | 'chemistry' | 'biology';
  template_id: string;
  name: string;
  description: string;
  svg_base: string;
  steps: TemplateStep[];
  variables?: Record<string, TemplateVariable>;
  colors?: Record<string, string>;
}

// 模板渲染引擎
export class TemplateEngine {
  private template: Template;
  private variables: Record<string, number>;

  constructor(template: Template) {
    this.template = template;
    this.variables = {};

    // 初始化变量为默认值
    if (template.variables) {
      Object.entries(template.variables).forEach(([key, config]) => {
        this.variables[key] = config.default;
      });
    }
  }

  // 设置变量值
  // Fix #7: 未注册变量时在开发环境给出警告，而不是静默忽略
  setVariable(name: string, value: number): void {
    if (!this.template.variables?.[name]) {
      // 开发环境下抛出可见警告，帮助快速发现拼写错误
      if (import.meta.env?.DEV) {
        console.warn(
          `[TemplateEngine] Unknown variable: "${name}" in template "${this.template.template_id}". ` +
          `Available variables: [${Object.keys(this.template.variables ?? {}).join(', ')}]`
        );
      }
      return;
    }

    const config = this.template.variables[name];
    // 验证范围
    if (value >= config.range[0] && value <= config.range[1]) {
      this.variables[name] = value;
    } else {
      throw new RangeError(
        `[TemplateEngine] Variable "${name}" value ${value} is out of range ` +
        `[${config.range[0]}, ${config.range[1]}] in template "${this.template.template_id}"`
      );
    }
  }

  // 获取变量值
  getVariable(name: string): number {
    return this.variables[name] ?? 0;
  }

  // 渲染 SVG（替换变量和颜色）
  renderSVG(): string {
    let svg = this.template.svg_base;

    // 替换变量
    Object.entries(this.variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      svg = svg.replace(regex, value.toString());
    });

    // 替换颜色
    if (this.template.colors) {
      Object.entries(this.template.colors).forEach(([key, color]) => {
        const regex = new RegExp(`\\{\\{color:${key}\\}\\}`, 'g');
        svg = svg.replace(regex, color);
      });
    }

    return svg;
  }

  // 获取步骤信息
  getSteps(): TemplateStep[] {
    return this.template.steps;
  }

  // 获取模板元数据
  getMetadata() {
    return {
      type: this.template.type,
      id: this.template.template_id,
      name: this.template.name,
      description: this.template.description
    };
  }
}

// 模板加载器
export class TemplateLoader {
  private static templates: Map<string, Template> = new Map();

  // 注册模板
  static register(template: Template): void {
    this.templates.set(template.template_id, template);
  }

  // 批量注册
  static registerBatch(templates: Template[]): void {
    templates.forEach((t) => this.register(t));
  }

  // 获取模板
  static get(templateId: string): Template | undefined {
    return this.templates.get(templateId);
  }

  // 创建引擎实例
  static createEngine(templateId: string): TemplateEngine | null {
    const template = this.get(templateId);
    return template ? new TemplateEngine(template) : null;
  }

  // 按类型获取所有模板
  static getByType(type: Template['type']): Template[] {
    return Array.from(this.templates.values()).filter((t) => t.type === type);
  }

  // 获取所有模板 ID
  static getAllIds(): string[] {
    return Array.from(this.templates.keys());
  }

  // Fix #3: 浏览器端（运行时）从 URL 加载 JSON 模板
  // 注意：此方法只能在客户端调用，不能在 Astro SSG 构建期使用
  static async loadFromURL(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const template: Template = await response.json();
      this.register(template);
    } catch (error) {
      console.error(`[TemplateLoader] Failed to load template from URL "${url}":`, error);
    }
  }

  // Fix #3: 服务端/构建期（Astro SSG）从文件系统加载 JSON 模板
  // 在 .astro 文件的 frontmatter 中使用，不要在客户端 React 组件中调用
  static loadFromObject(templateObject: Template): void {
    this.register(templateObject);
  }
}

// 导出便捷函数
export function createTemplateEngine(templateId: string): TemplateEngine | null {
  return TemplateLoader.createEngine(templateId);
}

export function registerTemplate(template: Template): void {
  TemplateLoader.register(template);
}

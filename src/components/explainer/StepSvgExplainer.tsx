import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface Step {
  id: number;
  label: string;
  description: string;
  layers: string[];
}

interface StepSvgExplainerProps {
  title: string;
  steps: Step[];
  svgContent: string;
  width?: number;
  height?: number;
}

export default function StepSvgExplainer({
  title,
  steps,
  svgContent,
  width = 680,
  height = 420
}: StepSvgExplainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [cumulativeMode, setCumulativeMode] = useState(true);

  // Fix #1: 用 ref 持有 DOM 容器，SVG 只注入一次
  const containerRef = useRef<HTMLDivElement>(null);
  // Fix #2: 容器 div 聚焦用于键盘事件（不挂 window）
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fix #5: useMemo 缓存可见图层集合，避免每帧重新遍历
  const visibleLayers = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    const minStep = cumulativeMode ? 0 : currentStep;
    for (let i = minStep; i <= currentStep; i++) {
      steps[i]?.layers.forEach((l) => set.add(l));
    }
    return set;
  }, [currentStep, cumulativeMode, steps]);

  // Fix #1: 首次挂载只注入一次 SVG，后续不再重写 innerHTML
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svgContent;
    }
    // 空依赖：仅执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fix #1: 步骤切换时直接操作已有 DOM 节点的 opacity，不重写 HTML
  useEffect(() => {
    if (!containerRef.current) return;
    const layers = containerRef.current.querySelectorAll<SVGGElement>('[data-layer]');
    layers.forEach((layer) => {
      const id = layer.getAttribute('data-layer') ?? '';
      layer.style.opacity = visibleLayers.has(id) ? '1' : '0';
      layer.style.transition = 'opacity 0.35s ease';
    });
  }, [visibleLayers]);

  // Fix #2: 键盘导航改为组件级 onKeyDown，避免多实例相互干扰
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        setCurrentStep((s) => Math.max(0, s - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
        e.preventDefault();
      }
    },
    [steps.length]
  );

  const goTo = useCallback((index: number) => {
    setCurrentStep(Math.max(0, Math.min(index, steps.length - 1)));
  }, [steps.length]);

  return (
    // Fix #2: tabIndex={0} 使容器可聚焦，onKeyDown 只作用于此实例
    <div
      ref={wrapperRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full max-w-5xl mx-auto outline-none focus:ring-2 focus:ring-blue-400 rounded-xl"
      aria-label={`${title}，使用左右方向键切换步骤`}
    >
      {/* 标题栏 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              checked={cumulativeMode}
              onChange={(e) => setCumulativeMode(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700">累积显示</span>
          </label>
        </div>
      </div>

      {/* 主体区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：SVG 画布 —— Fix #1: ref 挂载，不再用 dangerouslySetInnerHTML */}
        <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-hidden">
          <div
            ref={containerRef}
            className="svg-container w-full"
            role="img"
            aria-label={`步骤 ${currentStep + 1}/${steps.length}：${steps[currentStep]?.label ?? ''}`}
          />
        </div>

        {/* 右侧：步骤卡片 */}
        <div className="space-y-3" role="list" aria-label="解题步骤列表">
          <div className="text-sm font-semibold text-gray-500 mb-2">
            解题步骤 ({currentStep + 1}/{steps.length})
          </div>

          {steps.map((step, index) => (
            <button
              key={step.id}
              role="listitem"
              onClick={() => goTo(index)}
              aria-current={index === currentStep ? 'step' : undefined}
              aria-label={`第 ${index + 1} 步：${step.label}`}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${index === currentStep
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${index === currentStep
                    ? 'bg-blue-500 text-white'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {index < currentStep ? '✓' : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 mb-1">
                    {step.label}
                  </div>
                  <div className={`text-sm text-gray-600 ${index === currentStep ? 'block' : 'line-clamp-2'}`}>
                    {step.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep === 0}
          aria-label="上一步"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← 上一步
        </button>

        <span
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-mono font-bold"
          aria-live="polite"
          aria-atomic="true"
        >
          {currentStep + 1} / {steps.length}
        </span>

        <button
          onClick={() => goTo(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
          aria-label="下一步"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一步 →
        </button>
      </div>

      {/* 快捷键提示 */}
      <div className="mt-4 text-center text-sm text-gray-500">
        💡 点击此区域后使用键盘 ← → 方向键快速切换步骤
      </div>
    </div>
  );
}

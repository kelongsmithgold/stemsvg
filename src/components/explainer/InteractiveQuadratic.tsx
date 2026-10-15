import { useState, useEffect, useMemo, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

// Fix #10: pointA/pointB 是纯常量，移出组件避免每次渲染创建新对象
const POINT_A: Point = { x: 1, y: 0 };
const POINT_B: Point = { x: 3, y: 0 };

// 坐标系参数（同样是常量）
const SCALE = 40;    // 每单位的像素数
const ORIGIN_X = 200; // 原点 X 坐标（SVG 像素）
const ORIGIN_Y = 200; // 原点 Y 坐标（SVG 像素）
const TICK_RANGE = [-5, -4, -3, -2, -1, 1, 2, 3, 4] as const;

// 坐标转换（模块级纯函数）
const toSVG = (p: Point): Point => ({
  x: ORIGIN_X + p.x * SCALE,
  y: ORIGIN_Y - p.y * SCALE
});

const toMath = (svgX: number, svgY: number): Point => ({
  x: (svgX - ORIGIN_X) / SCALE,
  y: (ORIGIN_Y - svgY) / SCALE
});

export default function InteractiveQuadratic() {
  // C 点是唯一可变状态
  const [pointC, setPointC] = useState<Point>({ x: 0, y: -3 });
  const [isDragging, setIsDragging] = useState(false);

  // Fix #11: useMemo 缓存 a、顶点和抛物线路径，仅当 pointC 变化时重算
  const { a, vertex } = useMemo(() => {
    // 由于 A(1,0) 和 B(3,0) 是 x 轴上的点：y = a(x-1)(x-3)
    // 将 C 代入：pointC.y = a(0-1)(0-3) = 3a
    const newA = pointC.y / 3;
    const vx = (POINT_A.x + POINT_B.x) / 2; // 对称轴 x = 2
    const vy = newA * (vx - POINT_A.x) * (vx - POINT_B.x);
    return { a: newA, vertex: { x: vx, y: vy } };
  }, [pointC]);

  // Fix #11: useMemo 缓存路径字符串，避免每帧重复循环 60 次
  const parabolaPath = useMemo(() => {
    const pts: string[] = [];
    for (let x = -1; x <= 5; x += 0.1) {
      const y = a * (x - POINT_A.x) * (x - POINT_B.x);
      const svg = toSVG({ x, y });
      pts.push(`${svg.x.toFixed(2)},${svg.y.toFixed(2)}`);
    }
    return `M ${pts.join(' L ')}`;
  }, [a]);

  // 预先计算关键点 SVG 坐标
  const svgA = useMemo(() => toSVG(POINT_A), []);
  const svgB = useMemo(() => toSVG(POINT_B), []);
  const svgC = useMemo(() => toSVG(pointC), [pointC]);
  const svgVertex = useMemo(() => toSVG(vertex), [vertex]);

  // ── 拖拽逻辑（共用，接受 SVG 画布坐标） ──
  const updatePointC = useCallback((rawX: number, rawY: number, rect: DOMRect) => {
    const math = toMath(rawX - rect.left, rawY - rect.top);
    setPointC({
      x: Math.max(-2, Math.min(0.5, math.x)),
      y: Math.max(-6, Math.min(0, math.y))
    });
  }, []);

  // Mouse 事件
  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      updatePointC(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
    },
    [isDragging, updatePointC]
  );

  // Fix #4: Touch 事件，支持移动端/平板拖拽
  const handleTouchStart = useCallback((e: React.TouchEvent<SVGCircleElement>) => {
    e.preventDefault(); // 阻止触摸时页面滚动
    setIsDragging(true);
  }, []);
  const handleTouchEnd = useCallback(() => setIsDragging(false), []);
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      updatePointC(touch.clientX, touch.clientY, e.currentTarget.getBoundingClientRect());
    },
    [isDragging, updatePointC]
  );

  // Fix #4: 全局 mouseUp/touchEnd 防止拖出 SVG 区域后卡住
  useEffect(() => {
    const stop = () => setIsDragging(false);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto border-2 border-gray-300 rounded-lg bg-white touch-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}  /* Fix #4 */
        onTouchEnd={handleTouchEnd}    /* Fix #4 */
        role="img"
        aria-labelledby="interactive-title interactive-desc"
      >
        <title id="interactive-title">交互式二次函数图像</title>
        <desc id="interactive-desc">
          拖拽绿色点 C 改变抛物线形状，当前 C 点坐标为
          ({pointC.x.toFixed(1)}, {pointC.y.toFixed(1)})，
          解析式为 y = {a.toFixed(2)}(x - 1)(x - 3)
        </desc>

        {/* 网格背景 */}
        <defs>
          <pattern id="grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
            <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#grid)" />

        {/* 坐标轴 */}
        <line x1="0" y1={ORIGIN_Y} x2="400" y2={ORIGIN_Y} stroke="#64748b" strokeWidth="2" />
        <line x1={ORIGIN_X} y1="0" x2={ORIGIN_X} y2="400" stroke="#64748b" strokeWidth="2" />

        {/* 坐标轴箭头 */}
        <polygon points={`395,${ORIGIN_Y} 390,${ORIGIN_Y - 5} 390,${ORIGIN_Y + 5}`} fill="#64748b" />
        <polygon points={`${ORIGIN_X},5 ${ORIGIN_X - 5},10 ${ORIGIN_X + 5},10`} fill="#64748b" />

        {/* 坐标轴标签 */}
        <text x="390" y={ORIGIN_Y - 10} fontSize="14" fill="#64748b">x</text>
        <text x={ORIGIN_X + 10} y="15" fontSize="14" fill="#64748b">y</text>

        {/* 刻度 */}
        {TICK_RANGE.map((i) => (
          <g key={`x-${i}`}>
            <line
              x1={ORIGIN_X + i * SCALE} y1={ORIGIN_Y - 5}
              x2={ORIGIN_X + i * SCALE} y2={ORIGIN_Y + 5}
              stroke="#64748b" strokeWidth="1"
            />
            <text
              x={ORIGIN_X + i * SCALE} y={ORIGIN_Y + 20}
              fontSize="12" textAnchor="middle" fill="#64748b"
            >{i}</text>
          </g>
        ))}
        {TICK_RANGE.map((i) => (
          <g key={`y-${i}`}>
            <line
              x1={ORIGIN_X - 5} y1={ORIGIN_Y - i * SCALE}
              x2={ORIGIN_X + 5} y2={ORIGIN_Y - i * SCALE}
              stroke="#64748b" strokeWidth="1"
            />
            <text
              x={ORIGIN_X - 15} y={ORIGIN_Y - i * SCALE + 5}
              fontSize="12" textAnchor="end" fill="#64748b"
            >{i}</text>
          </g>
        ))}

        {/* 对称轴虚线 */}
        <line
          x1={svgVertex.x} y1="40"
          x2={svgVertex.x} y2="360"
          stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" opacity="0.6"
        />

        {/* 抛物线 */}
        <path
          d={parabolaPath}
          fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"
        />

        {/* 点 A（固定） */}
        <circle cx={svgA.x} cy={svgA.y} r="6" fill="#ef4444" />
        <text x={svgA.x} y={svgA.y - 15} fontSize="14" fontWeight="bold" fill="#ef4444" textAnchor="middle">
          A({POINT_A.x}, {POINT_A.y})
        </text>

        {/* 点 B（固定） */}
        <circle cx={svgB.x} cy={svgB.y} r="6" fill="#ef4444" />
        <text x={svgB.x} y={svgB.y - 15} fontSize="14" fontWeight="bold" fill="#ef4444" textAnchor="middle">
          B({POINT_B.x}, {POINT_B.y})
        </text>

        {/* 点 C（可拖拽）Fix #4 + Fix #8 */}
        <circle
          cx={svgC.x}
          cy={svgC.y}
          r="10"
          fill="#10b981"
          stroke="#fff"
          strokeWidth="2"
          style={{ cursor: 'move' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}  /* Fix #4 */
          /* Fix #8: ARIA slider 语义 */
          role="slider"
          aria-label={`C 点，当前坐标 (${pointC.x.toFixed(1)}, ${pointC.y.toFixed(1)})。拖拽改变抛物线形状`}
          aria-valuemin={-6}
          aria-valuemax={0}
          aria-valuenow={Math.round(pointC.y * 10) / 10}
          aria-valuetext={`y 坐标 ${pointC.y.toFixed(1)}`}
          tabIndex={0}
        />
        <text x={svgC.x - 20} y={svgC.y + 30} fontSize="14" fontWeight="bold" fill="#10b981">
          C({pointC.x.toFixed(1)}, {pointC.y.toFixed(1)})
        </text>

        {/* 顶点 */}
        <circle cx={svgVertex.x} cy={svgVertex.y} r="6" fill="#8b5cf6" />
        <text x={svgVertex.x + 15} y={svgVertex.y - 10} fontSize="14" fontWeight="bold" fill="#8b5cf6">
          顶点({vertex.x.toFixed(1)}, {vertex.y.toFixed(1)})
        </text>
      </svg>

      {/* 实时公式显示 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200" aria-live="polite" aria-atomic="true">
        <h3 className="font-bold text-blue-900 mb-2">实时解析式</h3>
        <div className="font-mono text-lg">
          <p className="mb-1">y = a(x - 1)(x - 3)</p>
          <p className="mb-1">
            其中 a = {pointC.y.toFixed(2)} ÷ 3 ={' '}
            <span className="text-blue-600 font-bold">{a.toFixed(2)}</span>
          </p>
          <p className="text-blue-600 font-bold">
            y = {a.toFixed(2)}(x - 1)(x - 3)
          </p>
        </div>
      </div>

      {/* 操作提示 */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-green-800 text-sm">
          <span className="font-bold">💡 试试看：</span>
          拖拽绿色点 C（支持鼠标和触摸）到不同位置，观察抛物线形状、顶点坐标和参数 a 的变化！
        </p>
      </div>
    </div>
  );
}

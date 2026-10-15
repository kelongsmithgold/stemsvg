import { useState } from 'react';

export default function SimpleTest() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', border: '2px solid blue', borderRadius: '8px' }}>
      <h3>React 组件测试</h3>
      <p>计数: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        点击 +1
      </button>
    </div>
  );
}

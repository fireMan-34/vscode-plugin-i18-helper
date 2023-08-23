import React from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');

const App = () => {
  return <div>
    这是我的 自定义插件
  </div>;
};

if (root) {
  console.log('当前 React 版本', React.version);
  createRoot(root).render(<App />);
}


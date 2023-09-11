/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ! 注意这里是根据 package 下命令所在位置为起始路径的全局匹配模式，所以可能必须以它为起点配置想丢路径
    "./client/**/*.{tsx,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};


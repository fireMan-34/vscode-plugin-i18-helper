const tailwindcss = require('./tailwind.config');

/** @type {import('postcss-loader/dist/config').PostCSSLoaderOptions} */
const postcssOptions = {
  plugins: {
    tailwindcss: tailwindcss,
    autoprefixer: {},
  }
};

module.exports = postcssOptions;
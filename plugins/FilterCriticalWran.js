module.exports = /** 跳過動態加載依賴的錯誤 @param {import('webpack').Compiler} compiler  */ ( compiler ) => {
    compiler.hooks.done.tap('Filter Tool Deependencies Warn', (r) => r.compilation.warnings = r.compilation.warnings.filter(w => {
        if (w.message === 'Critical dependency: the request of a dependency is an expression') {
            return false;
        }
        return true;
    }));
};
module.exports = {
    parser: "babel-eslint",
    plugins: ["prettier", "flowtype"],
    env: {
        node: true,
        browser: true,
        es6: true,
        mocha: true,
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
            modules: true,
            classes: true,
        },
        sourceType: "module",
    },
    rules: {
        "flowtype/define-flow-type": 1,
        indent: [
            "error",
            4,
            {
                SwitchCase: 1,
            },
        ],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        strict: [2, "safe"],
    },
};

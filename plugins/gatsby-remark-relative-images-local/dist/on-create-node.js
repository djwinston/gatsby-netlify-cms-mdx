"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCreateNode = void 0;
const path_1 = __importDefault(require("path"));
const lodash_1 = require("lodash");
const traverse_1 = __importDefault(require("traverse"));
const _1 = require(".");
const utils_1 = require("./utils");
exports.onCreateNode = ({ node, getNodesByType, actions }, pluginOptions) => {
    const { createNodeField } = actions;
    const options = lodash_1.defaults(pluginOptions, _1.defaultPluginOptions);
    if (node.internal.type === `MarkdownRemark` || node.internal.type === `Mdx`) {
        const files = getNodesByType(`File`);
        const directory = path_1.default.dirname(node.fileAbsolutePath);
        // Deeply iterate through frontmatter data for absolute paths
        traverse_1.default(node.frontmatter).forEach(function (value) {
            if (!lodash_1.isString(value))
                return;
            if (!path_1.default.isAbsolute(value) || !path_1.default.extname(value))
                return;
            const paths = this.path.reduce((acc, current) => {
                acc.push(acc.length > 0 ? [acc, current].join('.') : current);
                return acc;
            }, []);
            let shouldTransform = options.include.length < 1;
            if (options.include.some((a) => paths.includes(a))) {
                shouldTransform = true;
            }
            if (options.exclude.some((a) => paths.includes(a))) {
                shouldTransform = false;
            }
            if (!shouldTransform)
                return;
            const file = _1.findMatchingFile(value, files, options);
            const newValue = utils_1.slash(path_1.default.relative(directory, file.absolutePath));
            this.update(newValue);
        });
        createNodeField({ node });
    }
};

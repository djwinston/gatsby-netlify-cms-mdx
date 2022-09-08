import path from 'path';
import { defaults, isString } from 'lodash';
import traverse from 'traverse';
import {
  defaultPluginOptions,
  PluginOptions,
  GatsbyFile,
  MarkdownNode,
  findMatchingFile,
} from '.';
import { slash } from './utils'

export type GatsbyPluginArgs = {
  node: MarkdownNode;
  getNodesByType: (type: string) => GatsbyFile[];
  actions: Record<string, Function>;
  reporter: {
    info: (msg: string, error?: Error) => void;
  };
};

export const onCreateNode = (
  { node, getNodesByType, actions }: GatsbyPluginArgs,
  pluginOptions: PluginOptions,
) => {
  const { createNodeField } = actions
  const options = defaults(pluginOptions, defaultPluginOptions);

  if (node.internal.type === `MarkdownRemark` || node.internal.type === `Mdx`) {
    const files = getNodesByType(`File`);

    const directory = path.dirname(node.fileAbsolutePath);

    // Deeply iterate through frontmatter data for absolute paths
    traverse(node.frontmatter).forEach(function (value) {
      if (!isString(value)) return;
      if (!path.isAbsolute(value) || !path.extname(value)) return;

      /* @ts-ignore */
      const paths = this.path.reduce<string[]>((acc, current) => {
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

      if (!shouldTransform) return;

      const file = findMatchingFile(value, files, options);

      const newValue = slash(path.relative(directory, file.absolutePath));

      /* @ts-ignore */
      this.update(newValue);
    });
    createNodeField({ node })
  }
};

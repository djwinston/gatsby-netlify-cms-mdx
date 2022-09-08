import { PluginOptions, GatsbyFile, MarkdownNode } from '.';
export declare type GatsbyPluginArgs = {
    node: MarkdownNode;
    getNodesByType: (type: string) => GatsbyFile[];
    actions: Record<string, Function>;
    reporter: {
        info: (msg: string, error?: Error) => void;
    };
};
export declare const onCreateNode: ({ node, getNodesByType, actions }: GatsbyPluginArgs, pluginOptions: PluginOptions) => void;

declare module 'react-markdown' {
  import { ComponentType, ReactNode } from 'react';
  
  interface ReactMarkdownProps {
    children: string;
    className?: string;
    components?: {
      [nodeType: string]: ComponentType<any>;
    };
    remarkPlugins?: any[];
    rehypePlugins?: any[];
  }
  
  declare const ReactMarkdown: ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}

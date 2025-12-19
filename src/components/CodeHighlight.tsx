import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeHighlightProps {
  code: string;
  language: string;
}

const CodeHighlight: React.FC<CodeHighlightProps> = ({ code, language }) => {
  return (
    <Highlight
      theme={themes.vsDark}
      code={code}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} rounded-lg shadow-lg overflow-x-auto`} style={style}>
          <code className={className}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                <span className="inline-block w-8 text-right text-gray-500 mr-4 select-none">{i + 1}</span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
};

export default CodeHighlight;
import React, { useEffect } from "react";
import { readmeHtml } from "../generated/readme-content";
import Prism from "prismjs";
// Import order matters for Prism - dependencies must come first
import "prismjs/components/prism-markup"; // Required for JSX/TSX
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx"; // Requires markup + javascript
import "prismjs/components/prism-tsx"; // Requires jsx + typescript
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";

const Docs: React.FC = () => {
  // Highlight code blocks after render
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className="max-w-4xl select-text">
      {/* README Content - Auto-generated from README.md on build */}
      <article 
        className="readme-content dark:text-gray-100"
        dangerouslySetInnerHTML={{ __html: readmeHtml }}
      />
    </div>
  );
};

export default Docs;

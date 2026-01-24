import React, { useEffect, useState } from "react";
import { readmeHtmlEn, readmeHtmlDe } from "../generated/readme-content";
import { CONFIG } from "../app.config";
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
  const [language, setLanguage] = useState<"en" | "de">(CONFIG.language);
  const readmeHtml = language === "en" ? readmeHtmlEn : readmeHtmlDe;

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(CONFIG.language);
    };
    window.addEventListener("languagechange", handleLanguageChange);
    return () => window.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  // Highlight code blocks after render and when README changes
  useEffect(() => {
    Prism.highlightAll();
  }, [readmeHtml]);

  return (
    <div className="max-w-4xl select-text">
      <h1 className={CONFIG.style.title.className}>Dokumentation</h1>
      {/* README Content - Auto-generated from README.md/README_DE.md on build */}
      <article
        className="readme-content dark:text-neutral-100"
        dangerouslySetInnerHTML={{ __html: readmeHtml }}
      />
    </div>
  );
};

export default Docs;

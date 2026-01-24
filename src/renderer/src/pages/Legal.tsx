import React from "react";
import { CONFIG } from "../app.config";

const Legal: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <h1 className={CONFIG.style.title.className}>Rechtliches</h1>

      <section className="select-auto my-6">
        {/* Impressum Section */}
        <div className="">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Impressum</h2>
          <div className="text-neutral-700 dark:text-neutral-300 space-y-2">
            <p>
              Luca Mack
              <br />
              Lorystrasse 71
              <br />
              1110 Wien
              <br />
              Österreich
            </p>
          </div>
        </div>

        {/* Legal & License Section */}
        <div className="my-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Lizenz & Rechtliches</h2>
          <div className="text-neutral-700 dark:text-neutral-300 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">MIT License</h3>
              <p className="mb-2">Copyright (c) 2025 Luca Mack</p>
              <p className="text-sm leading-relaxed">
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
              </p>
              <p className="text-sm leading-relaxed mt-2">
                The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
              </p>
              <p className="text-sm leading-relaxed mt-2 font-semibold">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
              </p>
            </div>
            <div className="py-4 border-t border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold text-lg mb-2">Haftungsausschluss</h3>
              <p className="text-sm leading-relaxed">
                Diese Software wird zu Testzwecken bereitgestellt. Der Autor übernimmt keine Haftung für Schäden, die durch die Nutzung dieser Software entstehen. Die Verwendung erfolgt auf eigenes Risiko.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="my-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Datenschutz</h2>
          <div className="text-neutral-700 dark:text-neutral-300 space-y-4">
            <p className="text-sm leading-relaxed">
              Diese Anwendung speichert alle Daten lokal auf Ihrem Computer. Es werden keine Daten an externe Server übertragen. Die Datenbank befindet sich im Anwendungsverzeichnis und kann jederzeit gelöscht werden.
            </p>
            <p className="text-sm leading-relaxed">
              Zahlungsinformationen werden verschlüsselt in der lokalen Datenbank gespeichert. Die Verschlüsselung erfolgt mit AES-256-GCM.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Legal;

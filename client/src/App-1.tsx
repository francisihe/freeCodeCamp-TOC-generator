import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

interface TOCItem {
  id: string;
  text: string;
  level: number;
  link: string;
}

interface APIResponse {
  success: boolean;
  message: string;
  data: {
    tocItems: TOCItem[];
  };
}

function App() {
  const [url, setUrl] = useState('');
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const validateUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'preview.freecodecamp.org';
    } catch {
      return false;
    }
  };

  const extractTOC = async () => {
    if (!validateUrl(url)) {
      setError('Please enter a valid preview.freecodecamp.org URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setCopySuccess(false);

    try {
      const response = await fetch('http://localhost:3000/api/v1/extract-toc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ previewUrl: url }),
      });

      const apiResponse: APIResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to extract TOC');
      }

      setTocItems(apiResponse.data.tocItems);
      const markdown = generateMarkdown(apiResponse.data.tocItems);
      setEditedMarkdown(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMarkdown = (items: TOCItem[]) => {
    return items.map(item => {
      const indent = '  '.repeat(item.level - 1);
      return `${indent}- [${item.text}](${item.link})`;
    }).join('\n');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedMarkdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.log(err);
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">freeCodeCamp TOC Generator</h1>
          <a
            href="https://preview.freecodecamp.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            <span className="inline-block w-4 h-4">↗</span>
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter preview.freecodecamp.org URL"
                className="w-full p-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {url && validateUrl(url) && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">✓</span>
              )}
            </div>

            <button
              onClick={extractTOC}
              disabled={isLoading || !validateUrl(url)}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <><span className="animate-spin inline-block">⟳</span> Extracting...</>
              ) : (
                'Extract TOC'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 border border-red-400 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
              <span>⚠</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {tocItems.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Markdown Editor</h2>
                <textarea
                  value={editedMarkdown}
                  onChange={(e) => setEditedMarkdown(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                <div className="h-96 p-4 bg-gray-50 border border-gray-200 rounded-md overflow-y-auto prose prose-sm max-w-none">
                  {editedMarkdown.split('\n').map((line, index) => (
                    <div
                      key={index}
                      className="py-1"
                      style={{
                        paddingLeft: `${line?.match(/^\s*/)?.[0]?.length * 0.5}rem`
                      }}
                    >
                      {line.trim().replace(/^-\s*/, '• ')}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={copyToClipboard}
                className="w-full flex justify-center items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <span>📋</span>
                {copySuccess ? 'Copied!' : 'Copy Markdown'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

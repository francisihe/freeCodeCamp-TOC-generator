import { useState, useEffect } from 'react';

interface TOCItem {
    id: string;
    text: string;
    level: number;
    indentLevel: number;
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
    const [markdownCopySuccess, setMarkdownCopySuccess] = useState(false);
    const [previewCopySuccess, setPreviewCopySuccess] = useState(false);

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
        setMarkdownCopySuccess(false);
        setPreviewCopySuccess(false);

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
            const indent = '   '.repeat(item.indentLevel);
            return `${indent}- [${item.text}](${item.link})`;
        }).join('\n');
    };

    const copyToClipboard = async (text: string, type: 'markdown' | 'preview') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'markdown') {
                setMarkdownCopySuccess(true);
                setTimeout(() => setMarkdownCopySuccess(false), 2000);
            } else {
                setPreviewCopySuccess(true);
                setTimeout(() => setPreviewCopySuccess(false), 2000);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to copy to clipboard');
        }
    };

    // Effect to update TOC items when markdown changes
    useEffect(() => {
        if (editedMarkdown) {
            const lines = editedMarkdown.split('\n');
            const newItems = lines.map((line, index) => {
                const match = line.match(/^(\s*)-\s*\[(.*?)\]\((.*?)\)$/);
                if (!match) return null;

                const [, indent, text, link] = match;
                const indentLevel = Math.floor(indent.length / 3);  // 3 spaces per level

                return {
                    id: `toc-${index}`,
                    text,
                    level: indentLevel + 1,
                    indentLevel,
                    link
                };
            }).filter((item): item is TOCItem => item !== null);

            setTocItems(newItems);
        }
    }, [editedMarkdown]);

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
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">Markdown Editor</h2>
                                    <button
                                        onClick={() => copyToClipboard(editedMarkdown, 'markdown')}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <span>📋</span>
                                        {markdownCopySuccess ? 'Copied!' : 'Copy Markdown'}
                                    </button>
                                </div>
                                <textarea
                                    value={editedMarkdown}
                                    onChange={(e) => setEditedMarkdown(e.target.value)}
                                    className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                                    <button
                                        onClick={() => copyToClipboard(
                                            tocItems.map(item => {
                                                const indent = '    '.repeat(item.indentLevel);
                                                const bullet = item.indentLevel === 0 ? '•' : '○';
                                                return `${indent}${bullet} ${item.text}`;
                                            }).join('\n'),
                                            'preview'
                                        )}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <span>📋</span>
                                        {previewCopySuccess ? 'Copied!' : 'Copy Preview'}
                                    </button>
                                </div>
                                <div className="h-96 p-4 bg-gray-50 border border-gray-200 rounded-md overflow-y-auto">
                                    {tocItems.map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                marginLeft: `${item.indentLevel * 1.5}rem`,
                                                fontFamily: 'monospace'
                                            }}
                                            className="py-1"
                                        >
                                            <a
                                                href={item.link}
                                                className="text-gray-900 hover:text-blue-600 no-underline hover:underline"
                                            >
                                                {item.indentLevel === 0 ? '•' : '○'} {item.text}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
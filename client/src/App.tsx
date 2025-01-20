import { useState } from 'react';

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

const BULLET_POINTS = ['•', '○', '▪', '▫'];

export default function App() {
    const [url, setUrl] = useState('');
    const [tocItems, setTocItems] = useState<TOCItem[]>([]);
    const [markdown, setMarkdown] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'markdown-copied' | 'preview-copied'>('idle');

    const validateUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'preview.freecodecamp.org';
        } catch {
            return false;
        }
    };

    const generateMarkdown = (items: TOCItem[]) => {
        return items.map(item => {
            const indent = '  '.repeat(item.level - 1);
            return `${indent}- [${item.text}](${item.link})`;
        }).join('\n');
    };

    const parseMarkdown = (markdown: string): TOCItem[] => {
        return markdown.split('\n')
            .map((line, index) => {
                const match = line.match(/^(\s*)-\s*\[(.*?)\]\((.*?)\)$/);
                if (!match) return null;

                const [, indent, text, link] = match;
                const level = (indent.length / 2) + 1;

                return {
                    id: `toc-${index}`,
                    text,
                    level,
                    link
                };
            })
            .filter((item): item is TOCItem => item !== null);
    };

    const getMinLevel = (items: TOCItem[]) => {
        return Math.min(...items.map(item => item.level));
    };

    const getBulletPoint = (level: number, minLevel: number) => {
        const relativeLevel = level - minLevel;
        return BULLET_POINTS[relativeLevel % BULLET_POINTS.length];
    };

    const extractTOC = async () => {
        if (!validateUrl(url)) {
            setError('Please enter a valid preview.freecodecamp.org URL');
            return;
        }

        setIsLoading(true);
        setError('');
        setCopyStatus('idle');

        try {
            const response = await fetch('http://localhost:3000/api/v1/extract-toc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ previewUrl: url })
            });

            const apiResponse: APIResponse = await response.json();

            if (!apiResponse.success) {
                throw new Error(apiResponse.message || 'Failed to extract TOC');
            }

            const generatedMarkdown = generateMarkdown(apiResponse.data.tocItems);
            setTocItems(apiResponse.data.tocItems);
            setMarkdown(generatedMarkdown);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkdownChange = (newMarkdown: string) => {
        setMarkdown(newMarkdown);
        setTocItems(parseMarkdown(newMarkdown));
    };

    const copyToClipboard = async (text: string, type: 'markdown' | 'preview') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyStatus(type === 'markdown' ? 'markdown-copied' : 'preview-copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch (err) {
            console.error(err)
            setError('Failed to copy to clipboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
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

                {/* URL Input Section */}
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

                {/* TOC Display Section */}
                {tocItems.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="grid md:grid-cols-2 gap-6 p-6">
                            {/* Markdown Editor */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">Markdown Editor</h2>
                                    <button
                                        onClick={() => copyToClipboard(markdown, 'markdown')}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <span>📋</span>
                                        {copyStatus === 'markdown-copied' ? 'Copied!' : 'Copy Markdown'}
                                    </button>
                                </div>
                                <textarea
                                    value={markdown}
                                    onChange={(e) => handleMarkdownChange(e.target.value)}
                                    className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Preview */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                                    <button
                                        onClick={() => {
                                            const minLevel = getMinLevel(tocItems);
                                            copyToClipboard(
                                                tocItems.map(item => {
                                                    const indent = '  '.repeat(item.level - minLevel);
                                                    const bullet = getBulletPoint(item.level, minLevel);
                                                    return `${indent}${bullet} ${item.text}`;
                                                }).join('\n'),
                                                'preview'
                                            );
                                        }}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <span>📋</span>
                                        {copyStatus === 'preview-copied' ? 'Copied!' : 'Copy Preview'}
                                    </button>
                                </div>
                                <div className="h-96 p-4 bg-gray-50 border border-gray-200 rounded-md overflow-y-auto">
                                    {tocItems.length > 0 && (() => {
                                        const minLevel = getMinLevel(tocItems);
                                        return tocItems.map((item) => (
                                            <div
                                                key={item.id}
                                                style={{ paddingLeft: `${(item.level - minLevel) * 1.5}rem` }}
                                                className="py-1 font-mono"
                                            >
                                                <a
                                                    href={item.link}
                                                    className="text-gray-900 hover:text-blue-600 no-underline hover:underline"
                                                >
                                                    {getBulletPoint(item.level, minLevel)} {item.text}
                                                </a>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
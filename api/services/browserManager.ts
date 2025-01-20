import puppeteer, { Browser, Page } from 'puppeteer';
import { MAX_PAGES, PAGE_IDLE_TIMEOUT } from '../config/constants';

// Browser State
let browser: Browser | null = null;
let pages: Array<{ page: Page; inUse: boolean }> = [];
let browserInitializing: Promise<void> | null = null;

const createBrowser = async (): Promise<Browser> => {
    return await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
};

const createPage = async (browser: Browser): Promise<Page> => {
    const page = await browser.newPage();
    await page.setRequestInterception(false);
    return page;
};

const initializeBrowser = async (): Promise<void> => {
    if (browserInitializing) {
        await browserInitializing;
        return;
    }

    if (browser) return;
    
    // Initialize browser 
    browserInitializing = (async () => {
        try {
            browser = await createBrowser();
            
            const page = await createPage(browser);
            pages.push({ page, inUse: false });
            
            browser.on('disconnected', async () => {
                await cleanup(false);
            });
        } finally {
            browserInitializing = null;
        }
    })();

    await browserInitializing;
};

const cleanup = async (shouldCloseBrowser: boolean): Promise<void> => {
    if (shouldCloseBrowser && browser) {
        try {
            await browser.close();
        } catch (error) {
            console.error('Error closing browser:', error);
        }
    }
    
    // Reset state
    pages = [];
    browser = null;
};

const cleanupUnusedPages = async (): Promise<void> => {
    if (!browser) return;

    const unusedPages = pages.filter(pages => !pages.inUse);
    if (unusedPages.length <= 1) return; // Keep at least one page open

    for (const pageEntry of unusedPages.slice(1)) { // Start from second unused page
        try {
            await pageEntry.page.close();
            const index = pages.indexOf(pageEntry);
            if (index > -1) {
                pages.splice(index, 1);
            }
        } catch (error) {
            console.error('Error closing unused page:', error);
        }
    }
};

const schedulePageCleanup = (): void => {
    setTimeout(async () => {
        const allFree = pages.every(p => !p.inUse);
        if (allFree) {
            await cleanupUnusedPages();
        }
    }, PAGE_IDLE_TIMEOUT);
};

const getPage = async (): Promise<Page> => {
    try {
        if (!browser) {
            await initializeBrowser();
        }
        
        // Find available page
        const availablePage = pages.find(p => !p.inUse);
        if (availablePage) {
            availablePage.inUse = true;
            return availablePage.page;
        }
        
        // Create new page if under limit
        if (browser && pages.length < MAX_PAGES) {
            const newPage = await createPage(browser);
            pages.push({ page: newPage, inUse: true });
            return newPage;
        }
        
        throw new Error('No pages available and at maximum capacity');
        
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to get page');
    }
};

const releasePage = async (pageToRelease: Page): Promise<void> => {
    try {
        const pageEntry = pages.find(p => p.page === pageToRelease);
        if (!pageEntry) return;

        // Reset page state
        await pageEntry.page.goto('about:blank');
        await pageEntry.page.setRequestInterception(false);
        pageEntry.inUse = false;

        // Schedule cleanup if all pages are free
        if (pages.every(p => !p.inUse)) {
            schedulePageCleanup();
        }

    } catch (error) {
        console.error('Error releasing page:', error);
        // If page is broken, remove it and create a new one if needed
        const pageIndex = pages.findIndex(p => p.page === pageToRelease);
        if (pageIndex !== -1) {
            try {
                await pages[pageIndex].page.close();
            } catch (error) {
                console.error('Error closing broken page:', error);
            }
            pages.splice(pageIndex, 1);
        }

        // Create a replacement page if browser is still active
        if (browser && pages.length < MAX_PAGES) {
            try {
                const newPage = await createPage(browser);
                pages.push({ page: newPage, inUse: false });
            } catch (error) {
                console.error('Error creating replacement page:', error);
            }
        }
    }
};

const shutdown = async (): Promise<void> => {
    await cleanup(true);
};

const getStatus = (): {
    activePages: number;
    availablePages: number;
    isActive: boolean;
    maxPages: number;
    uptime: number;
} => {
    return {
        activePages: pages.length,
        availablePages: pages.filter(p => !p.inUse).length,
        isActive: browser !== null,
        maxPages: MAX_PAGES,
        uptime: browser ? process.uptime() : 0
    };
};

export {
    getPage,
    releasePage,
    shutdown,
    getStatus
};

// import puppeteer, { Browser, Page } from 'puppeteer';
// import { MAX_PAGES, QUEUE_TIMEOUT } from '../config/constants';

// // Types
// type PoolStatus = {
//     availablePages: number;
//     totalPages: number;
//     queueLength: number;
//     browserActive: boolean;
// };

// // // Configuration
// // const MAX_PAGES = 5;
// // const PAGE_TIMEOUT = 30000;
// // const QUEUE_TIMEOUT = 60000;

// // State management
// let browser: Browser | null = null;
// let pagePool: Page[] = [];
// let requestQueue: Array<{
//     resolve: (page: Page) => void;
//     reject: (error: Error) => void;
//     timestamp: number;
// }> = [];

// // Initialize browser and create initial page pool
// const initialize = async (): Promise<void> => {
//     if (browser) return;

//     browser = await puppeteer.launch({
//         headless: false,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });

//     // Create initial pool of pages
//     for (let i = 0; i < MAX_PAGES; i++) {
//         const page = await browser.newPage();
//         pagePool.push(page);
//     }

//     // Set up automatic queue cleanup
//     setInterval(cleanupStaleRequests, 10000);
// };

// // Clean up requests that have been waiting too long
// const cleanupStaleRequests = () => {
//     const now = Date.now();
//     requestQueue = requestQueue.filter(request => {
//         if (now - request.timestamp > QUEUE_TIMEOUT) {
//             request.reject(new Error('Request timeout - too many concurrent requests'));
//             return false;
//         }
//         return true;
//     });
// };

// // Get a page from the pool or queue the request
// const getPage = async (): Promise<Page> => {
//     if (!browser) {
//         await initialize();
//     }

//     if (pagePool.length > 0) {
//         return pagePool.pop()!;
//     }

//     // If no pages available, queue the request
//     return new Promise((resolve, reject) => {
//         requestQueue.push({
//             resolve,
//             reject,
//             timestamp: Date.now()
//         });
//     });
// };

// // Release a page back to the pool or give it to the next queued request
// const releasePage = async (page: Page): Promise<void> => {
//     try {
//         // Reset page state
//         await page.goto('about:blank');
//         await page.setRequestInterception(false);

//         // If there are waiting requests, give them the page
//         if (requestQueue.length > 0) {
//             const nextRequest = requestQueue.shift()!;
//             nextRequest.resolve(page);
//         } else {
//             // Otherwise return it to the pool
//             pagePool.push(page);
//         }
//     } catch (error) {
//         // If page is broken, close it and create a new one if needed
//         try {
//             await page.close();
//         } catch {
//             // console.error('Failed to close broken page');
//             // await initialize();
//         }

//         if (browser && pagePool.length + requestQueue.length < MAX_PAGES) {
//             const newPage = await browser.newPage();
//             pagePool.push(newPage);
//         }
//     }
// };

// // Shutdown the browser manager
// const shutdown = async (): Promise<void> => {
//     // Reject any queued requests
//     requestQueue.forEach(request => {
//         request.reject(new Error('Browser manager shutting down'));
//     });
//     requestQueue = [];

//     // Close browser
//     if (browser) {
//         await browser.close();
//         browser = null;
//         pagePool = [];
//     }
// };

// // Health check
// const isHealthy = async (): Promise<boolean> => {
//     try {
//         if (!browser) return false;
//         const pages = await browser.pages();
//         return pages.length > 0;
//     } catch {
//         return false;
//     }
// };

// // Get current status
// const getStatus = (): PoolStatus => ({
//     availablePages: pagePool.length,
//     totalPages: MAX_PAGES,
//     queueLength: requestQueue.length,
//     browserActive: !!browser
// });

// export {
//     getPage,
//     releasePage,
//     shutdown,
//     isHealthy,
//     getStatus,
//     initialize,
// };
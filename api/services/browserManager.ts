import puppeteer, { Browser, Page } from 'puppeteer';
import { MAX_PAGES, PAGE_IDLE_TIMEOUT, QUEUE_TIMEOUT } from '../config/constants';

// Browser State
let browser: Browser | null = null;
let pages: Array<{ page: Page; inUse: boolean }> = [];
let browserInitializing: Promise<void> | null = null;

const createBrowser = async (): Promise<Browser> => {
    return await puppeteer.launch({
        headless: true,
        // args: ['--no-sandbox', '--disable-setuid-sandbox']
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu'],
        executablePath: '/usr/bin/google-chrome-stable'
    });
};

const createPage = async (browser: Browser): Promise<Page> => {
    const page = await browser.newPage();
    await page.setRequestInterception(false);
    return page;
};

const waitForAvailablePage = async (): Promise<Page | null> => {
    const startTime = Date.now();

    while (Date.now() - startTime < QUEUE_TIMEOUT) {
        const availablePage = pages.find(p => !p.inUse);
        if (availablePage) {
            availablePage.inUse = true;
            return availablePage.page;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
};

const initializeBrowser = async (): Promise<void> => {
    if (browserInitializing) {
        await browserInitializing;
        return;
    }

    if (browser) return;

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

    pages = [];
    browser = null;
};

const cleanupUnusedPages = async (): Promise<void> => {
    if (!browser) return;

    const unusedPages = pages.filter(p => !p.inUse);
    if (unusedPages.length <= 1) return;

    for (const pageEntry of unusedPages.slice(1)) {
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

        const availablePage = pages.find(p => !p.inUse);
        if (availablePage) {
            availablePage.inUse = true;
            return availablePage.page;
        }

        if (browser && pages.length < MAX_PAGES) {
            const newPage = await createPage(browser);
            pages.push({ page: newPage, inUse: true });
            return newPage;
        }

        const waitedPage = await waitForAvailablePage();
        if (waitedPage) {
            return waitedPage;
        }

        throw new Error('Request timed out while waiting for an available page');

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

        await pageEntry.page.goto('about:blank');
        await pageEntry.page.setRequestInterception(false);
        pageEntry.inUse = false;

        if (pages.every(p => !p.inUse)) {
            schedulePageCleanup();
        }

    } catch (error) {
        console.error('Error releasing page:', error);
        const pageIndex = pages.findIndex(p => p.page === pageToRelease);
        if (pageIndex !== -1) {
            try {
                await pages[pageIndex].page.close();
            } catch (error) {
                console.error('Error closing broken page:', error);
            }
            pages.splice(pageIndex, 1);
        }

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
} => ({
    activePages: pages.length,
    availablePages: pages.filter(p => !p.inUse).length,
    isActive: browser !== null,
    maxPages: MAX_PAGES,
    uptime: browser ? process.uptime() : 0
});

export {
    getPage,
    releasePage,
    shutdown,
    getStatus
};
import { Request, Response } from "express";
import { getPage, releasePage } from '../services/browserManager';
import { PAGE_TIMEOUT } from "../config/constants";

export const extractTOC = async (req: Request, res: Response): Promise<void> => {
    let page = null;

    try {
        const { previewUrl } = req.body;
        page = await getPage();

        await page.goto(previewUrl, {
            waitUntil: 'networkidle0',
            timeout: PAGE_TIMEOUT
        });

        // Check for error content
        const isErrorPage = await page.evaluate(() => {
            const errorElement = document.querySelector('div h2');
            return errorElement && errorElement.textContent?.includes("Oops, something is not right!");
        });

        if (isErrorPage) {
            res.status(404).json({
                success: false,
                message: "The requested page could not be loaded. Please verify the URL.",
            });
            return;
        }

        // Extract TOC from article
        const tocItems = await page.evaluate(() => {
            const article = document.querySelector('.post-content');
            if (!article) return [];

            const headings = article.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');

            return Array.from(headings).map(heading => ({
                id: heading.id,
                text: heading.textContent?.trim().replace(/¶$/, '') || '',
                level: parseInt(heading.tagName[1]),
                link: `#${heading.id}`
            })).filter(item => item.text && item.id);
        });

        if (tocItems.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No headings found in the article'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Table of contents extracted successfully',
            data: { tocItems },
            meta: {
                totalItems: tocItems.length,
                generated: new Date().toISOString(),
            }
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        let statusCode = 500;

        if (errorMessage.includes('timeout')) {
            statusCode = 504;
        } else if (errorMessage.includes('waiting for an available page')) {
            statusCode = 503;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });

    } finally {
        if (page) {
            await releasePage(page);
        }
    }
};
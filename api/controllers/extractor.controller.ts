import { Request, Response } from "express";
import puppeteer from "puppeteer";


export const extractTOC = async (req: Request, res: Response): Promise<void> => {
    try {
        const { previewUrl } = req.body;

        const browser = await puppeteer.launch({
            headless: false,
            // headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        try {
            await page.goto(previewUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
        } catch (error) {
            await browser.close();
            res.status(504).json({
                success: false,
                message: 'Page load timeout'
            });
            return;
        }

        // Extract TOC items using selectors
        const tocItems = await page.evaluate(() => {
            const article = document.querySelector('.post-content');
            if (!article) return [];

            const headings = article.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');

            return Array.from(headings).map(heading => {
                // Clean up text content
                const text = heading.textContent?.trim().replace(/¶$/, '') || '';

                // Generate proper link
                const id = heading.id;
                const link = `#${id}`;

                return {
                    id,
                    text,
                    level: parseInt(heading.tagName[1]),
                    link
                };
            }).filter(item => item.text && item.id); // Remove empty items
        });

        await browser.close();

        // Validate there are actual headings
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
                generated: new Date().toISOString()
            }
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
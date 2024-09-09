import { ConvertBookToText, BookFile, TextFile, UnsupportedFileTypeError } from './types';
import fs from 'fs-extra';
import path from 'path';
import pdf from 'pdf-parse';
import Epub from 'epub2';
import { promisify } from 'util';
import { htmlToText } from 'html-to-text';

export const convertBookToText: ConvertBookToText = async (book: BookFile, startPage: number = 1): Promise<TextFile> => {
    let text: string;

    try {
        if (book.type === 'pdf') {
            text = await convertPdfToText(book.path, startPage);
        } else if (book.type === 'epub') {
            text = await convertEpubToText(book.path, startPage);
        } else {
            throw new UnsupportedFileTypeError(book.type);
        }

        const outputPath = path.join(path.dirname(book.path), `${path.basename(book.path, path.extname(book.path))}.txt`);
        await fs.writeFile(outputPath, text);

        return {
            path: outputPath,
            content: text
        };
    } catch (error) {
        if (error instanceof UnsupportedFileTypeError) {
            throw error;
        }
        throw new Error(`Error converting book to text: ${(error as Error).message}`);
    }
};

async function convertPdfToText(filePath: string, startPage: number): Promise<string> {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    // Split the text into pages and start from the specified page
    const pages = data.text.split('\n\n').slice(startPage - 1);
    return pages.join('\n\n');
}

async function convertEpubToText(filePath: string, startPage: number): Promise<string> {
    const epub = await Epub.createAsync(filePath);
    const getChapterAsync = promisify(epub.getChapterRaw.bind(epub));

    await epub.open();

    if (!epub.flow || epub.flow.length === 0) {
        throw new Error('EPUB file has no chapters or failed to load chapters.');
    }

    const chapters = epub.flow.slice(startPage - 1);
    const chapterTexts = await Promise.all(chapters.map(async (chapter) => {
        const content = await getChapterAsync(chapter.id);
        const plainText = htmlToText(content, {
            selectors: [
                { selector: 'img', format: 'skip' }, // Skip images
                { selector: 'a', options: { ignoreHref: true } }, // Skip links
                { selector: 'style', format: 'skip' }, // Skip styles
                { selector: 'script', format: 'skip' }, // Skip scripts
                { selector: 'comment', format: 'skip' } // Skip comments
            ],
        });
        return `${chapter.title}\n\n${plainText}`;
    }));

    return chapterTexts.join("\n\n");
}
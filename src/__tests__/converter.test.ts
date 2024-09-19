import { convertBookToText } from '../converter';
import { BookFile } from '../types';
import pdf from 'pdf-parse';
import { htmlToText } from 'html-to-text';
import fs from 'node:fs';

jest.mock('pdf-parse', () => jest.fn());
jest.mock('epub2', () => ({
    __esModule: true,
    default: {
        createAsync: () => Promise.resolve({
            getChapterRaw: () => Promise.resolve({ htmlContent: '<p>EPUB content</p>' }),
            flow: [{ title: 'title', id: 'chapter1' }],
            open: jest.fn(),
        }),
    },
}));
jest.mock('html-to-text');
jest.mock('node:fs');
jest.mock('node:util', () => ({
    promisify: (fn: any) => fn
}));

describe('convertBookToText', () => {
    const mockPdfFile: BookFile = { path: '/path/to/book.pdf', type: 'pdf' };
    const mockEpubFile: BookFile = { path: '/path/to/book.epub', type: 'epub' };
    const mockPdfContent = 'PDF content';
    const mockEpubContent = 'EPUB content';

    beforeEach(() => {
        (pdf as jest.Mock).mockResolvedValue({ text: mockPdfContent });
        (htmlToText as jest.Mock).mockReturnValue(mockEpubContent);
    });

    it('should convert PDF to text', async () => {
        const result = await convertBookToText(mockPdfFile);

        expect(result).toEqual({
            path: expect.stringContaining('.txt'),
            content: mockPdfContent,
        });
        expect(pdf).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('.txt'), mockPdfContent);
    });

    it('should convert EPUB to text', async () => {
        const expectedContent = 'title\n\nEPUB content'

        const result = await convertBookToText(mockEpubFile);

        expect(result).toEqual({
            path: expect.stringContaining('.txt'),
            content: expectedContent,
        });
        // expect(htmlToText).toHaveBeenCalledWith('<p>EPUB content</p>', expect.any(Object));
        expect(htmlToText).toHaveBeenCalledWith(
            { htmlContent: '<p>EPUB content</p>' },
            expect.any(Object)
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('.txt'), expectedContent);
    });

    it('should handle start page for PDF', async () => {
        const expectedContent = [5, 6].join('\n\n');
        const mockPdfContent = [1, 2, 3, 4, 5, 6].join('\n\n');
        (pdf as jest.Mock).mockResolvedValue({ text: mockPdfContent });

        const result = await convertBookToText(mockPdfFile, 5);

        expect(result.content).toEqual(expectedContent)
    });

    it('should throw an error for unsupported file type', async () => {
        const mockUnsupportedFile: BookFile = { path: '/path/to/book.txt', type: 'txt' as any };

        await expect(convertBookToText(mockUnsupportedFile)).rejects.toThrow('Unsupported file type: txt');
    });
});
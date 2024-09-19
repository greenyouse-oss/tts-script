import path from "node:path";
import { parseCommandLineArgs } from "../cli";
import { UnsupportedFileTypeError } from "../types";

describe("parseCommandLineArgs", () => {
    const validPdfPath = "/path/to/book.pdf";
    const validEpubPath = "/path/to/book.epub";

    it("should parse valid PDF file path", () => {
        const result = parseCommandLineArgs([validPdfPath]);
        expect(result).toEqual({
            bookFilePath: path.resolve(validPdfPath),
            startPage: 1,
        });
    });

    it("should parse valid EPUB file path", () => {
        const result = parseCommandLineArgs([validEpubPath]);
        expect(result).toEqual({
            bookFilePath: path.resolve(validEpubPath),
            startPage: 1,
        });
    });

    it("should parse valid file path with custom start page", () => {
        const result = parseCommandLineArgs([validPdfPath, "5"]);
        expect(result).toEqual({
            bookFilePath: path.resolve(validPdfPath),
            startPage: 5,
        });
    });

    it("should throw error for missing file path", () => {
        expect(() => parseCommandLineArgs([])).toThrow("Please provide a book file path.");
    });

    it("should throw error for non-string file path", () => {
        expect(() => parseCommandLineArgs([42 as unknown as string])).toThrow("Please provide a book file path.");
    });

    it("should throw UnsupportedFileTypeError for unsupported file type", () => {
        expect(() => parseCommandLineArgs(["/path/to/book.txt"])).toThrow(UnsupportedFileTypeError);
    });

    it("should throw error for invalid start page (non-numeric)", () => {
        expect(() => parseCommandLineArgs([validPdfPath, "abc"])).toThrow("Starting page must be a positive integer.");
    });

    it("should throw error for invalid start page (zero)", () => {
        expect(() => parseCommandLineArgs([validPdfPath, "0"])).toThrow("Starting page must be a positive integer.");
    });

    it("should throw error for invalid start page (negative)", () => {
        expect(() => parseCommandLineArgs([validPdfPath, "-1"])).toThrow("Starting page must be a positive integer.");
    });

    it("should ignore additional arguments after start page", () => {
        const result = parseCommandLineArgs([validPdfPath, "5", "ignored", "args"]);
        expect(result).toEqual({
            bookFilePath: path.resolve(validPdfPath),
            startPage: 5,
        });
    });

    it("should handle file paths with spaces", () => {
        const pathWithSpaces = "/path/to/my book.pdf";
        const result = parseCommandLineArgs([pathWithSpaces]);
        expect(result).toEqual({
            bookFilePath: path.resolve(pathWithSpaces),
            startPage: 1,
        });
    });

    it("should handle relative file paths", () => {
        const relativePath = "./my-book.epub";
        const result = parseCommandLineArgs([relativePath]);
        expect(result).toEqual({
            bookFilePath: path.resolve(process.cwd(), relativePath),
            startPage: 1,
        });
    });
});
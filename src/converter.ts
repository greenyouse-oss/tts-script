import fs from "node:fs"
import path from "node:path"
import { promisify } from "node:util"

import Epub from "epub2"
import { TocElement } from "epub2/lib/epub/const"
import { htmlToText } from "html-to-text"
import pdf from "pdf-parse"

import {
  BookFile,
  ConvertBookToText,
  TextFile,
  UnsupportedFileTypeError,
} from "./types"

export const convertBookToText: ConvertBookToText = async (
  book: BookFile,
  startPage: number = 1,
): Promise<TextFile> => {
  let text: string

  try {
    if (book.type === "pdf") {
      text = await convertPdfToText(book.path, startPage)
    } else if (book.type === "epub") {
      text = await convertEpubToText(book.path, startPage)
    } else {
      throw new UnsupportedFileTypeError(book.type)
    }

    const outputPath = path.join(
      path.dirname(book.path),
      `${path.basename(book.path, path.extname(book.path))}.txt`,
    )
    await fs.writeFileSync(outputPath, text)

    return {
      content: text,
      path: outputPath,
    }
  } catch (error) {
    if (error instanceof UnsupportedFileTypeError) {
      throw error
    }
    throw new Error(
      `Error converting book to text: ${(error as Error).message}`,
    )
  }
}

async function convertPdfToText(
  filePath: string,
  startPage: number,
): Promise<string> {
  const dataBuffer = await fs.readFileSync(filePath)
  const data = await pdf(dataBuffer)

  // Split the text into pages and start from the specified page
  const pages = data.text.split("\n\n").slice(startPage - 1)
  return pages.join("\n\n")
}

async function convertEpubToText(
  filePath: string,
  startPage: number,
): Promise<string> {
  const epub = await Epub.createAsync(filePath)
  const getChapterAsync = promisify(epub.getChapterRaw.bind(epub))

  await epub.open()

  if (!epub.flow || epub.flow.length === 0) {
    throw new Error("EPUB file has no chapters or failed to load chapters.")
  }

  const chapters: TocElement[] = epub.flow.slice(startPage - 1)
  const chapterTexts = await Promise.all(
    chapters.map(async (chapter) => {
      const content = await getChapterAsync(chapter.id)
      const plainText = htmlToText(content, {
        selectors: [
          { format: "skip", selector: "img" }, // Skip images
          { options: { ignoreHref: true }, selector: "a" }, // Skip links
          { format: "skip", selector: "style" }, // Skip styles
          { format: "skip", selector: "script" }, // Skip scripts
          { format: "skip", selector: "comment" }, // Skip comments
        ],
      })
      return `${chapter.title}\n\n${plainText}`
    }),
  )

  return chapterTexts.join("\n\n")
}

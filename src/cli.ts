import path from "node:path"

import {
  CommandLineArgs,
  ParseCommandLineArgs,
  UnsupportedFileTypeError,
} from "./types"

export const parseCommandLineArgs: ParseCommandLineArgs = (
  args,
): CommandLineArgs => {
  if (args.length < 1 || typeof args[0] !== "string") {
    throw new Error("Please provide a book file path.")
  }

  const bookFilePath = path.resolve(args[0])
  const fileExtension = path.extname(bookFilePath).toLowerCase()

  if (fileExtension !== ".pdf" && fileExtension !== ".epub") {
    throw new UnsupportedFileTypeError(fileExtension)
  }

  let startPage = 1
  if (args.length > 1 && typeof args[1] === "string") {
    const parsedStartPage = parseInt(args[1], 10)
    if (!isNaN(parsedStartPage) && parsedStartPage > 0) {
      startPage = parsedStartPage
    } else {
      throw new Error("Starting page must be a positive integer.")
    }
  }

  return {
    bookFilePath,
    startPage,
  }
}

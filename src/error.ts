import console from "node:console"
import process from "node:process"

import {
  ErrorHandler,
  ESpeakExecutionError,
  UnsupportedFileTypeError,
} from "./types"

export const errorHandler: ErrorHandler = (error: Error): void => {
  let errorMessage: string
  const exitCode = 1

  switch (true) {
    case error instanceof UnsupportedFileTypeError:
      errorMessage = `Error: ${error.message}\nPlease provide a PDF or EPUB file.`
      break

    case error instanceof ESpeakExecutionError:
      errorMessage = `Error: ${error.message}\nPlease ensure espeak is installed and try again.`
      break

    case error.message.includes("ENOENT"):
      errorMessage = `Error: File not found.\nPlease check the file path and try again.`
      break

    case error.message.includes("Permission denied"):
      errorMessage = `Error: Permission denied.\nPlease check file permissions and try again.`
      break

    default:
      errorMessage = `An unexpected error occurred: ${error.message}`
      break
  }

  // Print the error to stdout
  const timestamp = new Date().toISOString()
  console.error(`[${timestamp}] ${errorMessage}`)
  console.error(error.stack)

  process.exit(exitCode)
}

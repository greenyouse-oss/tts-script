// Supported book file types
export type BookFileType = "pdf" | "epub"

// Input book file
export interface BookFile {
  path: string
  type: BookFileType
}

// Output text file
export interface TextFile {
  path: string
  content: string
}

// Conversion process
export interface BookConverter {
  convert(book: BookFile, startPage?: number): Promise<TextFile>
}

// ESpeak command
export interface ESpeakCommand {
  inputFile: string
  outputFile: string
  execute(): Promise<void>
}

// Error types
export class UnsupportedFileTypeError extends Error {
  constructor(fileType: string) {
    super(`Unsupported file type: ${fileType}`)
    this.name = "UnsupportedFileTypeError"
  }
}

export class ESpeakExecutionError extends Error {
  constructor(message: string) {
    super(`ESpeak execution failed: ${message}`)
    this.name = "ESpeakExecutionError"
  }
}

// Command-line arguments
export interface CommandLineArgs {
  bookFilePath: string
  startPage: number
  voice?: string
  speed?: number
  showHelp?: boolean
}

// Function signatures
export type ParseCommandLineArgs = (args: string[]) => CommandLineArgs

export type ConvertBookToText = (
  book: BookFile,
  startPage?: number,
) => Promise<TextFile>

export interface ESpeakOptions {
  voice?: string
  speed?: number
}

export type GenerateAudioFile = (
  textFile: TextFile,
  outputPath: string,
  options?: ESpeakOptions,
) => void

export type ErrorHandler = (error: Error) => void

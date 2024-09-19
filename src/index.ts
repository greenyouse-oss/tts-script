import console from "node:console"
import path from "node:path"
import process from "node:process"

import { generateAudioFile } from "./audio"
import { convertBookToText } from "./converter"
import { errorHandler } from "./error"
import { CommandLineArgs, ESpeakOptions, ParseCommandLineArgs } from "./types"
import { BookFile } from "./types"

const showHelpMessage = (): void => {
  console.log(`
Usage: node script.js <book_file_path> [start_page] [options]

Arguments:
  book_file_path    Path to the PDF or EPUB file
  start_page        Page number to start from (default: 1)

Options:
  -h, --help        Show this help message
  --voice=<voice>   Specify the eSpeak voice to use
  --speed=<speed>   Specify the speech rate (words per minute)

Example:
  node script.js book.pdf 5 --voice=en-us --speed=150
    `)
}

const parseCommandLineArgs: ParseCommandLineArgs = (args): CommandLineArgs => {
  if (args.length < 3 || typeof args[2] !== "string") {
    showHelpMessage()
    process.exit(1)
  }

  const bookFilePath = args[2]
  const startPage = Number(args[3]) || 1
  const voice = args.find((arg) => arg.startsWith("--voice="))?.split("=")[1]
  const speed = args.find((arg) => arg.startsWith("--speed="))?.split("=")[1]

  return {
    bookFilePath,
    speed: speed ? parseInt(speed) : 400,
    startPage,
    voice,
  }
}

export async function main(): Promise<void> {
  const args = parseCommandLineArgs(process.argv)

  if (args.showHelp) {
    showHelpMessage()
    return
  }

  try {
    const bookFile: BookFile = {
      path: args.bookFilePath,
      type: path.extname(args.bookFilePath).toLowerCase().slice(1) as
        | "pdf"
        | "epub",
    }

    console.log(
      `Converting ${bookFile.type.toUpperCase()} file: ${bookFile.path}`,
    )
    console.log(`Starting from page: ${args.startPage}`)

    console.log("Converting book to text...")
    const textFile = await convertBookToText(bookFile, args.startPage)
    console.log(`Text file created: ${textFile.path}`)

    const outputPath = args.bookFilePath.replace(/\.(pdf|epub)$/, ".wav")
    console.log("Generating audio file...")
    const espeakOptions: ESpeakOptions = {
      speed: args.speed,
      voice: args.voice,
    }
    generateAudioFile(textFile, outputPath, espeakOptions)
    console.log(`Audio file generated: ${outputPath}`)

    console.log("Conversion completed successfully!")
  } catch (error) {
    errorHandler(error as Error)
  }
}

main()

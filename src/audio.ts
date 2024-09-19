import { execSync } from "node:child_process"
import console from "node:console"

import {
  ESpeakExecutionError,
  ESpeakOptions,
  GenerateAudioFile,
  TextFile,
} from "./types"

export const generateAudioFile: GenerateAudioFile = (
  textFile: TextFile,
  outputPath: string,
  options: ESpeakOptions = {},
): void => {
  try {
    // Check if espeak is installed
    execSync("espeak --version")
  } catch {
    throw new Error(
      "espeak is not installed or not available in the system PATH",
    )
  }

  try {
    // Use espeak to generate the audio file
    const voice = options.voice || "en-us"
    const speed = options.speed || 400
    const command = `espeak -v ${voice} -s ${speed} -f "${textFile.path}" -w "${outputPath}"`
    execSync(command)

    console.log(`Audio file generated successfully: ${outputPath}`)
  } catch (error) {
    throw new ESpeakExecutionError(
      `Failed to generate audio file: ${(error as Error).message}`,
    )
  }
}

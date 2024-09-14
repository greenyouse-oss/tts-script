import {
  GenerateAudioFile,
  TextFile,
  ESpeakExecutionError,
  ESpeakOptions,
} from "./types"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import console from "node:console"

const execAsync = promisify(exec)

export const generateAudioFile: GenerateAudioFile = async (
  textFile: TextFile,
  outputPath: string,
  options: ESpeakOptions = {},
): Promise<void> => {
  try {
    // Check if espeak is installed
    await execAsync("espeak --version")
  } catch (error) {
    throw new Error(
      "espeak is not installed or not available in the system PATH",
    )
  }

  try {
    // Use espeak to generate the audio file
    const voice = options.voice || "en-us"
    const speed = options.speed || 400
    const command = `espeak -v ${voice} -s ${speed} -f "${textFile.path}" -w "${outputPath}"`
    await execAsync(command)

    console.log(`Audio file generated successfully: ${outputPath}`)
  } catch (error) {
    throw new ESpeakExecutionError(
      `Failed to generate audio file: ${(error as Error).message}`,
    )
  }
}

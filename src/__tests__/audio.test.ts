import { execSync as mockExecSync } from "node:child_process"

import { generateAudioFile } from "../audio"
import { ESpeakExecutionError, TextFile } from "../types"

jest.mock("node:child_process", () => ({
  execSync: jest.fn(),
}))

describe("generateAudioFile", () => {
  const mockTextFile: TextFile = {
    content: "Sample content",
    path: "/path/to/text/file.txt",
  }
  const mockOutputPath = "/path/to/output/audio.wav"

  beforeEach(() => {
    ;(mockExecSync as jest.Mock).mockReturnValue({ stderr: "", stdout: "" })
  })

  it("should generate audio file successfully with default options", () => {
    generateAudioFile(mockTextFile, mockOutputPath)

    expect(mockExecSync).toHaveBeenCalledWith("espeak --version")
    expect(mockExecSync).toHaveBeenCalledWith(
      `espeak -v en-us -s 400 -f "${mockTextFile.path}" -w "${mockOutputPath}"`,
    )
  })

  it("should generate audio file successfully with custom options", () => {
    const options = { speed: 300, voice: "en-gb" }
    generateAudioFile(mockTextFile, mockOutputPath, options)

    expect(mockExecSync).toHaveBeenCalledWith(
      `espeak -v en-gb -s 300 -f "${mockTextFile.path}" -w "${mockOutputPath}"`,
    )
  })

  it("should throw an error if espeak is not installed", () => {
    ;(mockExecSync as jest.Mock).mockImplementation(() => {
      throw new Error("espeak is not installed")
    })

    expect(() => generateAudioFile(mockTextFile, mockOutputPath)).toThrow(
      "espeak is not installed or not available in the system PATH",
    )
  })

  it("should throw an ESpeakExecutionError if audio generation fails", () => {
    ;(mockExecSync as jest.Mock).mockReturnValueOnce({ stderr: "", stdout: "" })
    ;(mockExecSync as jest.Mock).mockImplementation(() => {
      throw new Error("Command failed")
    })

    expect(() => generateAudioFile(mockTextFile, mockOutputPath)).toThrow(
      ESpeakExecutionError,
    )
  })
})

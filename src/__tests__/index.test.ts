/* eslint-disable functional/immutable-data */
import process from "node:process"

import { generateAudioFile } from "../audio"
import { convertBookToText } from "../converter"
import { main } from "../index"
import { BookFile, TextFile } from "../types"

jest.mock("../converter")
jest.mock("../audio")
jest.mock("node:process", () => ({
  ...jest.requireActual("node:process"),
  exit: jest.fn(),
}))

describe("main function", () => {
  const mockArgs = ["node", "script.js", "/path/to/book.pdf", "5"]
  const mockBookFile: BookFile = {
    path: "/path/to/book.pdf",
    type: "pdf",
  }
  const mockTextFile: TextFile = {
    content: "Sample content",
    path: "/path/to/text.txt",
  }

  const originalArgv = process.argv

  beforeEach(() => {
    ;(convertBookToText as jest.Mock).mockResolvedValue(mockTextFile)
  })

  afterEach(() => {
    process.argv = originalArgv
  })

  it("should run the main process successfully", async () => {
    const expectedEspeakOptions = {
      speed: 400,
      voice: undefined,
    }
    process.argv = mockArgs

    await main()

    expect(convertBookToText).toHaveBeenCalledWith(mockBookFile, 5)
    expect(generateAudioFile).toHaveBeenCalledWith(
      mockTextFile,
      expect.stringContaining(".wav"),
      expectedEspeakOptions,
    )
  })

  it("should alow for custom espeak options", async () => {
    mockArgs[4] = "--speed=250"
    mockArgs[5] = "--voice=en-GB"
    jest.replaceProperty(process, "argv", mockArgs)

    const expectedEspeakOptions = {
      speed: 250,
      voice: "en-GB",
    }

    await main()

    expect(generateAudioFile).toHaveBeenCalledWith(
      mockTextFile,
      expect.stringContaining(".wav"),
      expectedEspeakOptions,
    )
  })

  it("should display a help message when no arguments are provided", async () => {
    jest.replaceProperty(process, "argv", [])
    const mockExit = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never)

    await main()

    expect(mockExit).toHaveBeenCalledWith(1)

    mockExit.mockRestore()
  })

  it("should handle errors and exit the process", async () => {
    const mockError = new Error("Test error")
    ;(convertBookToText as jest.Mock).mockRejectedValue(mockError)
    const mockExit = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never)
    const mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {})

    await main()

    expect(mockExit).toHaveBeenCalledWith(1)

    mockExit.mockRestore()
    mockConsoleError.mockRestore()
  })
})

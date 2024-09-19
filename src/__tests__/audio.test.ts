import { generateAudioFile } from "../audio"
import { ESpeakExecutionError, TextFile } from "../types"
import { execSync as mockExecSync } from "node:child_process"

jest.mock("node:child_process", () => ({
    execSync: jest.fn(),
}))

describe("generateAudioFile", () => {
    const mockTextFile: TextFile = {
        path: "/path/to/text/file.txt",
        content: "Sample content",
    }
    const mockOutputPath = "/path/to/output/audio.wav"

    beforeEach(() => {
        (mockExecSync as jest.Mock).mockReturnValue({ stdout: "", stderr: "" })
    })

    it("should generate audio file successfully with default options", () => {
        generateAudioFile(mockTextFile, mockOutputPath)

        expect(mockExecSync).toHaveBeenCalledWith("espeak --version")
        expect(mockExecSync).toHaveBeenCalledWith(
            `espeak -v en-us -s 400 -f "${mockTextFile.path}" -w "${mockOutputPath}"`
        )
    })

    it("should generate audio file successfully with custom options", () => {
        const options = { voice: "en-gb", speed: 300 }
        generateAudioFile(mockTextFile, mockOutputPath, options)

        expect(mockExecSync).toHaveBeenCalledWith(
            `espeak -v en-gb -s 300 -f "${mockTextFile.path}" -w "${mockOutputPath}"`
        )
    })

    it("should throw an error if espeak is not installed", () => {
        (mockExecSync as jest.Mock).mockImplementation(() => {
            throw new Error("espeak is not installed");
        });

        expect(() => generateAudioFile(mockTextFile, mockOutputPath)).toThrow(
            "espeak is not installed or not available in the system PATH"
        )
    })

    it("should throw an ESpeakExecutionError if audio generation fails", () => {
        (mockExecSync as jest.Mock).mockReturnValueOnce({ stdout: "", stderr: "" });
        (mockExecSync as jest.Mock).mockImplementation(() => {
            throw new Error("Command failed");
        });

        expect(() => generateAudioFile(mockTextFile, mockOutputPath)).toThrow(
            ESpeakExecutionError
        )
    })
})
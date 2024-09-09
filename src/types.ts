// Supported book file types
type BookFileType = 'pdf' | 'epub';

// Input book file
interface BookFile {
    path: string;
    type: BookFileType;
}

// Output text file
interface TextFile {
    path: string;
    content: string;
}

// Conversion process
interface BookConverter {
    convert(book: BookFile, startPage?: number): Promise<TextFile>;
}

// ESpeak command
interface ESpeakCommand {
    inputFile: string;
    outputFile: string;
    execute(): Promise<void>;
}

// Error types
class UnsupportedFileTypeError extends Error {
    constructor(fileType: string) {
        super(`Unsupported file type: ${fileType}`);
        this.name = 'UnsupportedFileTypeError';
    }
}

class ESpeakExecutionError extends Error {
    constructor(message: string) {
        super(`ESpeak execution failed: ${message}`);
        this.name = 'ESpeakExecutionError';
    }
}

// Command-line arguments
interface CommandLineArgs {
    bookFilePath: string;
    startPage: number;
    voice?: string;
    speed?: number;
    showHelp?: boolean;
}

// Function signatures
type ParseCommandLineArgs = (args: string[]) => CommandLineArgs;

type ConvertBookToText = (book: BookFile, startPage?: number) => Promise<TextFile>;

type GenerateAudioFile = (
    textFile: TextFile,
    outputPath: string,
    options?: ESpeakOptions
) => Promise<void>;

type ErrorHandler = (error: Error) => void;

export interface ESpeakOptions {
    voice?: string;
    speed?: number;
}

export {
    BookFileType,
    BookFile,
    TextFile,
    BookConverter,
    ESpeakCommand,
    UnsupportedFileTypeError,
    ESpeakExecutionError,
    CommandLineArgs,
    ParseCommandLineArgs,
    ConvertBookToText,
    GenerateAudioFile,
    ErrorHandler
};
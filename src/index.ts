import {
  exportVariable,
  getInput,
  setFailed,
  setOutput,
  summary,
} from "@actions/core";
import * as github from "@actions/github";
import isbn from "node-isbn";
import returnWriteFile from "./write-file";
import getBook from "./get-book";
import { getBookStatus, getDates, sortByDate, toArray } from "./utils";
import { checkOutBook } from "./checkout-book";
import { BookStatus } from "./clean-book";
import { summaryMarkown, summaryShort } from "./summary";
import returnReadFile from "./read-file";
import { updateBook } from "./update-book";
import { validatePayload } from "./validate-payload";

export type Dates = {
  dateAdded: string | undefined;
  dateStarted: string | undefined;
  dateFinished: string | undefined;
};

export type BookPayload = {
  "date-started": string | undefined;
  "date-finished": string | undefined;
  notes?: string;
  isbn: string;
  rating?: string;
  tags?: string;
};

export type ActionInputs = {
  filename: string;
  providers: string[];
  rating?: string;
  "time-zone": string;
  "thumbnail-width"?: number;
};

export type BookParams = {
  filename: string;
  bookIsbn: BookPayload["isbn"];
  dates: Dates;
  notes?: BookPayload["notes"];
  bookStatus: BookStatus;
  providers?: ActionInputs["providers"];
  rating?: ActionInputs["rating"];
  tags?: string[];
  thumbnailWidth?: number;
};

export async function read() {
  try {
    // Get book payload
    const payload = github.context.payload.inputs as BookPayload;
    // Validate payload
    validatePayload(payload);
    const {
      isbn: bookIsbn,
      "date-finished": dateFinished,
      "date-started": dateStarted,
      notes,
      rating,
      tags,
    } = payload;
    // Set inputs
    const filename: ActionInputs["filename"] = getInput("filename");
    const providers: ActionInputs["providers"] = getInput("providers")
      ? getInput("providers").split(",")
      : isbn._providers;
    const thumbnailWidth: ActionInputs["thumbnail-width"] = getInput(
      "thumbnail-width"
    )
      ? Number.parseInt(getInput("thumbnail-width"))
      : undefined;

    const bookStatus = getBookStatus(dateStarted, dateFinished);
    exportVariable("BookStatus", bookStatus);
    const dates = getDates(bookStatus, dateStarted, dateFinished);

    let library = await returnReadFile(filename);

    const bookParams: BookParams = {
      filename,
      bookIsbn,
      dates,
      notes,
      bookStatus,
      rating,
      providers,
      thumbnailWidth,
      ...(tags && { tags: toArray(tags) }),
    };

    const bookExists = checkOutBook(bookParams, library);

    if (bookExists) {
      library = await updateBook(bookParams, library);
    } else {
      const newBook = await getBook(bookParams);
      library.push(newBook);
      exportVariable(`BookTitle`, newBook.title);
      exportVariable(`BookThumbOutput`, `book-${newBook.isbn}.png`);
      exportVariable(`BookThumb`, newBook.thumbnail);
    }

    library = sortByDate(library);

    await returnWriteFile(filename, library);
    await summary.addRaw(summaryMarkown(library, dateFinished)).write();
    setOutput("summary", summaryShort(library, dateFinished));
  } catch (error) {
    setFailed(error);
  }
}

export default read();

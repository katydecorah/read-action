import { readFileSync, writeFileSync } from "fs";
import { exportVariable, setFailed } from "@actions/core";
import { load } from "js-yaml";
import { stringify } from "json-to-pretty-yaml";
import isbn from "node-isbn";

export const removeWrappedQuotes = (str: string) => {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.substring(1, str.length - 1);
  }
  if (str.startsWith('"') && str.endsWith('"--')) {
    return `${str.substring(1, str.length - 3)}…`;
  } else return str;
};

export type Book = {
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description: string;
  industryIdentifiers: {
    type: string;
    identifier: string;
  }[];
  readingModes: {
    text: boolean;
    image: boolean;
  };
  pageCount: number;
  printType: string;
  categories: string[];
  averageRating: number;
  ratingsCount: number;
  maturityRating: string;
  allowAnonLogging: boolean;
  contentVersion: string;
  panelizationSummary: {
    containsEpubBubbles: boolean;
    containsImageBubbles: boolean;
  };
  imageLinks: {
    smallThumbnail: string;
    thumbnail: string;
  };
  language: string;
  previewLink: string;
  infoLink: string;
  canonicalVolumeLink: string;
};

export type CleanBook = {
  dateFinished: string;
  title?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: { type?: string; indentifier?: string }[];
  categories?: string[];
  pageCount?: number;
  printType?: string;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
  language?: string;
  canonicalVolumeLink?: string;
  isbn: string;
  notes?: string;
};

export type BookOptions = {
  date: string;
  body?: string;
  bookIsbn: string;
  providers: [];
};

export const cleanBook = (options: BookOptions, book: Book): CleanBook => {
  const { date, body, bookIsbn } = options;
  return {
    isbn: bookIsbn,
    dateFinished: date,
    ...(body && { notes: body }),
    ...("title" in book && { title: book.title }),
    ...("authors" in book && {
      authors: book.authors,
    }),
    ...("publishedDate" in book && { publishedDate: book.publishedDate }),
    ...("description" in book && {
      description: removeWrappedQuotes(book.description),
    }),
    ...("industryIdentifiers" in book && {
      industryIdentifiers: book.industryIdentifiers,
    }),
    ...("pageCount" in book && { pageCount: book.pageCount }),
    ...("printType" in book && { printType: book.printType }),
    ...("categories" in book && { categories: book.categories }),
    ...("imageLinks" in book && {
      imageLinks: {
        ...("smallThumbnail" in book.imageLinks && {
          smallThumbnail: book.imageLinks.smallThumbnail.replace(
            "http:",
            "https:"
          ),
        }),
        ...("thumbnail" in book.imageLinks && {
          thumbnail: book.imageLinks.thumbnail.replace("http:", "https:"),
        }),
      },
    }),
    ...("language" in book && { language: book.language }),
    ...("canonicalVolumeLink" in book && {
      canonicalVolumeLink: book.canonicalVolumeLink,
    }),
  };
};

export const addBook = async (
  options: BookOptions,
  book: Book,
  fileName: string
) => {
  // convert yaml file to JSON
  const readListJson = (await toJson(fileName)) as CleanBook[];
  // clean up book data
  const newBook: CleanBook = cleanBook(options, book);
  // export book thumbnail to download later
  if (newBook.imageLinks && newBook.imageLinks.thumbnail) {
    exportVariable("BookThumbOutput", `book-${newBook.isbn}.png`);
    exportVariable("BookThumb", newBook.imageLinks.thumbnail);
  }
  // append new book
  readListJson.push(newBook);
  return sortByDate(readListJson);
};

export const toJson = async (fileName: string) => {
  try {
    const contents = (await readFile(fileName)) as string;
    return load(contents);
  } catch (error) {
    setFailed(error);
  }
};

/** make sure date is in YYYY-MM-DD format */
export const dateFormat = (date: string) =>
  date.match(/^\d{4}-\d{2}-\d{2}$/) != null;
/** make sure date value is a date */
export const isDate = (date: string) =>
  !isNaN(Date.parse(date)) && dateFormat(date);
/** make sure ISBN has 10 or 13 characters */
export const isIsbn = (isbn: string) =>
  isbn.length === 10 || isbn.length === 13;

export const titleParser = (
  title: string
): { bookIsbn?: string; date: string } => {
  const split = title.split(" ");
  const bookIsbn = isIsbn(split[0]) ? split[0] : undefined;
  if (!bookIsbn)
    setFailed(
      `ISBN must be 10 or 13 characters: ${bookIsbn} is ${
        bookIsbn ? `${bookIsbn.length} characters` : "undefined"
      }`
    );
  const date = isDate(split[1])
    ? split[1]
    : new Date().toISOString().slice(0, 10);
  exportVariable("DateRead", date);
  return {
    bookIsbn,
    date,
  };
};

export const toYaml = (json: {}) => stringify(json);

export const sortByDate = (array: { dateFinished: string }[]) =>
  array.sort(
    (a, b) =>
      new Date(a.dateFinished).valueOf() - new Date(b.dateFinished).valueOf()
  );

export async function getBook(
  options: BookOptions,
  fileName: string
): Promise<CleanBook[]> {
  const { bookIsbn, providers } = options;
  try {
    const book = (await isbn.provider(providers).resolve(bookIsbn)) as Book;
    if (!book) throw new Error(`Could not find book with ISBN: ${bookIsbn}`);
    exportVariable("BookTitle", book.title);
    const books = (await addBook(options, book, fileName)) as CleanBook[];
    return books;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function readFile(fileName: string) {
  try {
    return readFileSync(fileName, "utf8");
  } catch (error) {
    setFailed(error.message);
  }
}

export async function writeFile(fileName: string, bookMetadata: CleanBook[]) {
  try {
    writeFileSync(fileName, toYaml(bookMetadata), "utf-8");
  } catch (error) {
    setFailed(error.message);
  }
}

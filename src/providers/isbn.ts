import Isbn, { Book } from "@library-pals/isbn";
import { BookParams } from "..";
import { NewBook } from "../new-book";
import { formatDescription } from "../utils";
import { exportVariable, getInput, warning } from "@actions/core";

export async function getIsbn(options: BookParams): Promise<NewBook> {
  const { inputIdentifier, providers } = options;
  let book;
  try {
    const isbn = new Isbn();
    isbn.provider(providers);
    book = await isbn.resolve(inputIdentifier);
  } catch (error) {
    throw new Error(`Book (${inputIdentifier}) not found. ${error.message}`);
  }
  const newBook: NewBook = cleanBook(options, book);
  return newBook;
}

export function cleanBook(options: BookParams, book: Book): NewBook {
  const {
    notes,
    inputIdentifier,
    dateType,
    bookStatus,
    rating,
    tags,
    thumbnailWidth,
    setImage,
  } = options;
  checkMetadata(book, inputIdentifier);
  const {
    title,
    authors,
    publishedDate,
    description,
    categories,
    pageCount,
    printType,
    thumbnail,
    language,
    link,
  } = book;

  return {
    identifier: inputIdentifier,
    identifiers: {
      isbn: inputIdentifier,
    },
    ...dateType,
    status: bookStatus,
    ...(rating && { rating }),
    ...(notes && { notes }),
    ...(tags && { tags }),
    ...(title && { title }),
    ...(authors && {
      authors: authors,
    }),
    ...(publishedDate && { publishedDate }),
    ...(description && {
      description: formatDescription(description),
    }),
    ...(pageCount ? { pageCount } : { pageCount: 0 }),
    ...(printType && { format: printType.toLowerCase() }),
    ...(categories && { categories }),
    ...(thumbnail && {
      thumbnail: handleThumbnail(thumbnailWidth, thumbnail),
    }),
    ...(language && { language }),
    ...(link && {
      link,
    }),
    ...(setImage && {
      image: `book-${inputIdentifier}.png`,
    }),
  };
}

function handleThumbnail(
  thumbnailWidth: number | undefined,
  thumbnail: string
) {
  if (thumbnail.startsWith("http:")) {
    thumbnail = thumbnail.replace("http:", "https:");
  }
  const url = new URL(thumbnail);
  if (url.host === "books.google.com" && thumbnailWidth) {
    thumbnail = `${thumbnail}&w=${thumbnailWidth}`;
  }
  return thumbnail;
}

function checkMetadata(book: Book, inputIdentifier: string) {
  const missingMetadata: string[] = [];
  const requiredMetadata = getInput("required-metadata")
    .split(",")
    .map((s) => s.trim());
  if (!book.title && requiredMetadata.includes("title")) {
    missingMetadata.push("title");
  }
  if (
    (!book.pageCount || book.pageCount === 0) &&
    requiredMetadata.includes("pageCount")
  ) {
    missingMetadata.push("pageCount");
  }
  if (
    (!book.authors || book.authors.length === 0) &&
    requiredMetadata.includes("authors")
  ) {
    missingMetadata.push("authors");
  }
  if (!book.description && requiredMetadata.includes("description")) {
    missingMetadata.push("description");
  }
  if (!book.thumbnail && requiredMetadata.includes("thumbnail")) {
    missingMetadata.push("thumbnail");
  }
  if (missingMetadata.length > 0) {
    warning(`Book does not have ${missingMetadata.join(", ")}`);
    exportVariable("BookNeedsReview", true);
    exportVariable("BookMissingMetadata", missingMetadata.join(", "));
    exportVariable("BookIdentifier", inputIdentifier);
  }
}

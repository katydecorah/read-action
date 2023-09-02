import { removeWrappedQuotes } from "./utils";
import { Book } from "./get-book";
import { BookParams } from ".";
import { exportVariable, getInput, warning } from "@actions/core";

export type CleanBook = {
  dateAdded: string | undefined;
  dateStarted: string | undefined;
  dateFinished: string | undefined;
  title?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  categories?: string[];
  pageCount?: number;
  printType?: string;
  thumbnail?: string;
  language?: string;
  link?: string;
  isbn: string;
  notes?: string;
  status: BookStatus;
  rating?: string;
  tags?: BookParams["tags"];
};

export type BookStatus = "want to read" | "started" | "finished";

export default function cleanBook(options: BookParams, book: Book): CleanBook {
  const { notes, bookIsbn, dates, bookStatus, rating, tags, thumbnailWidth } =
    options;
  checkMetadata(book, bookIsbn);
  const {
    title,
    authors,
    publishedDate,
    description,
    categories,
    pageCount,
    printType,
    imageLinks,
    language,
    canonicalVolumeLink,
  } = book;

  return {
    isbn: bookIsbn,
    ...dates,
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
      description: removeWrappedQuotes(description),
    }),
    ...(pageCount ? { pageCount } : { pageCount: 0 }),
    ...(printType && { printType }),
    ...(categories && { categories }),
    ...(imageLinks &&
      imageLinks.thumbnail && {
        thumbnail: handleThumbnail(thumbnailWidth, imageLinks.thumbnail),
      }),
    ...(language && { language }),
    ...(canonicalVolumeLink && {
      link: canonicalVolumeLink,
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

function checkMetadata(book: Book, bookIsbn: string) {
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
  if (!book.imageLinks?.thumbnail && requiredMetadata.includes("thumbnail")) {
    missingMetadata.push("thumbnail");
  }
  if (missingMetadata.length > 0) {
    warning(`Book does not have ${missingMetadata.join(", ")}`);
    exportVariable("BookNeedsReview", true);
    exportVariable("BookMissingMetadata", missingMetadata.join(", "));
    exportVariable("BookIsbn", bookIsbn);
  }
}

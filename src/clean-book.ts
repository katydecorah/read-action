import { removeWrappedQuotes } from "./utils";
import { Book } from "./get-book";
import { BookParams } from ".";
import { exportVariable, warning } from "@actions/core";

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
  const { notes, bookIsbn, dates, bookStatus, rating, tags } = options;
  if (!book.pageCount || book.pageCount === 0) {
    warning("Book does not have `pageCount`.");
    exportVariable("BookNeedsReview", true);
    exportVariable("BookIsbn", bookIsbn);
  }
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
    ...(pageCount && pageCount > 0 && { pageCount }),
    ...(printType && { printType }),
    ...(categories && { categories }),
    ...(imageLinks &&
      imageLinks.thumbnail && {
        thumbnail: imageLinks.thumbnail.replace("http:", "https:"),
      }),
    ...(language && { language }),
    ...(canonicalVolumeLink && {
      link: canonicalVolumeLink,
    }),
  };
}

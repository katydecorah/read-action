import { BookParams } from ".";
import { getInput } from "@actions/core";
import { BookStatus, CleanBook } from "./clean-book";

/** make sure date is in YYYY-MM-DD format */
export function dateFormat(date: string) {
  return date.match(/^\d{4}-\d{2}-\d{2}$/) != null;
}

/** make sure date value is a date */
export function isDate(date: string) {
  return !isNaN(Date.parse(date)) && dateFormat(date);
}

/** make sure ISBN has 10 or 13 characters */
export function isIsbn(isbn: string) {
  return isbn.length === 10 || isbn.length === 13;
}

/** sort array of objects by `dateFinished` */
export function sortByDate(array: CleanBook[]): CleanBook[] {
  return array.sort((a, b) => {
    if (a.dateFinished && b.dateFinished) {
      return (
        new Date(a.dateFinished).valueOf() - new Date(b.dateFinished).valueOf()
      );
    } else return 0;
  });
}

export function formatDescription(str?: string) {
  if (!str) return "";

  str = str
    .replace(/(\r\n|\n|\r)/gm, " ") // remove line breaks
    .replace(/\s+/g, " ") // remove extra spaces
    .trim();

  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }

  if (str.startsWith('"') && str.endsWith('"--')) {
    return `${str.slice(1, -3)}…`;
  }

  return str;
}

function localDate() {
  // "fr-ca" will result YYYY-MM-DD formatting
  const dateFormat = new Intl.DateTimeFormat("fr-ca", {
    dateStyle: "short",
    timeZone: getInput("time-zone"),
  });
  return dateFormat.format(new Date());
}

export function getBookStatus({
  date,
  bookStatus,
}: {
  date?: string;
  bookStatus?: BookStatus;
}): {
  dateAbandoned?: string;
  dateStarted?: string;
  dateFinished?: string;
  dateAdded?: string;
} {
  const dateValue = date ?? localDate();
  switch (bookStatus) {
    case "abandoned":
      return {
        dateAbandoned: dateValue,
      };
    case "started":
      return {
        dateStarted: dateValue,
      };
    case "finished":
      return {
        dateFinished: dateValue,
      };
    case "want to read":
    default: {
      return {
        dateAdded: dateValue,
      };
    }
  }
}

export function toArray(tags: string): BookParams["tags"] {
  return tags.split(",").map((f) => f.trim());
}

export function lookUp(book: CleanBook, bookIsbn: string): boolean {
  return (
    book.isbn === bookIsbn ||
    book.identifier?.isbn === bookIsbn ||
    (bookIsbn.split("/").length > 1 &&
      book.identifier?.libby === bookIsbn.split("/").pop())
  );
}

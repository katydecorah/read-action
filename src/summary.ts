import { setOutput } from "@actions/core";
import { BookPayload } from ".";
import { CleanBook } from "./clean-book";
import {
  mAverageDays,
  mMostReadMonth,
  mGenre,
  mSameDay,
  mAverageLength,
  mTopAuthors,
  mTags,
  mMonthTable,
} from "./summary-markdown";
import { capitalize } from "./utils";

export function summaryMarkown(
  library: CleanBook[],
  dateFinished: BookPayload["date-finished"]
): string {
  const { BookStatus, BookTitle } = process.env;
  return `# Updated library

${capitalize(`${BookStatus}`)}: “${BookTitle}”
${
  BookStatus === "finished" && dateFinished
    ? yearReviewSummary(library, dateFinished.slice(0, 4))
    : ""
}
`;
}

export function summaryShort(
  library: CleanBook[],
  dateFinished: BookPayload["date-finished"]
): string | undefined {
  const { BookStatus } = process.env;
  if (BookStatus !== "finished" || !dateFinished) return;
  const year = dateFinished.slice(0, 4);
  const summary = yearReviewSummary(library, year);
  if (summary) {
    setOutput("summaryYear", year);
    const [, , , ...rest] = summary.split("\n");
    return rest.join("\n");
  }
}

export function yearReviewSummary(books: CleanBook[], year: string) {
  const obj = yearReview(books, year);
  if (obj === undefined) return undefined;
  const summary = [
    "",
    `## ${year} reading summary`,
    "",
    ...mMonthTable(obj),
    ``,
    `- **Total books:** ${obj.count}`,
    ...mAverageDays(obj),
    ...mMostReadMonth(obj),
    ...mGenre(obj),
    ...mSameDay(obj),
    ...mAverageLength(obj),
    ...mTopAuthors(obj),
    ...mTags(obj),
  ];
  return summary.join("\n");
}

export function yearReview(
  books: CleanBook[],
  year: string
): YearReview | undefined {
  if (books.length === 0) return undefined;
  const booksThisYear = bBooksThisYear(books, year);
  const count = booksThisYear.length;
  if (count === 0) return undefined;
  if (count < 5) {
    return {
      year,
      count,
    };
  }
  const longestBook = booksThisYear[0];
  const shortestBook = booksThisYear[count - 1];
  const topGenres = findTopItems(booksThisYear, "categories", toLowerCase);
  const groupByMonth = bGroupByMonth(booksThisYear);
  const mostReadMonth = getKeyFromBiggestValue(groupByMonth);
  const leastReadMonth = getKeyFromSmallestValue(groupByMonth);
  const finishedInOneDay = booksThisYear.filter(
    (b) => b.dateStarted === b.dateFinished
  );
  const topAuthors = findTopItems(booksThisYear, "authors");
  const averageFinishTime = average(
    booksThisYear.filter((b) => b.finishTime).map((b) => b.finishTime)
  );
  const bookLengths = booksThisYear.map((b) => b.pageCount).filter((f) => f);
  const averageBookLength =
    bookLengths.length > 0 ? Math.round(average(bookLengths)) : undefined;
  const totalPages = bookLengths.reduce(
    (total: number, book: number) => book + total,
    0
  );
  const tags = findTopItems(booksThisYear, "tags");

  return {
    year,
    count,
    topAuthors,
    dates: {
      averageFinishTime,
      byMonth: Object.keys(monthToWord)
        .map((month) => ({
          monthIndex: Number.parseInt(month),
          month: monthToWord[month],
          count: groupByMonth[month] || 0,
        }))
        .sort((a, b) => a.monthIndex - b.monthIndex),
      mostReadMonth: {
        month: monthToWord[mostReadMonth],
        count: booksThisYear.filter((f) =>
          f.dateFinished?.startsWith(`${year}-${mostReadMonth}`)
        ).length,
      },
      leastReadMonth: {
        month: monthToWord[leastReadMonth],
        count: booksThisYear.filter((f) =>
          f.dateFinished?.startsWith(`${year}-${leastReadMonth}`)
        ).length,
      },
      finishedInOneDay: {
        count: finishedInOneDay.length,
        books: finishedInOneDay.map(simpleData),
      },
    },
    topGenres,
    length: {
      longestBook: simpleData(longestBook),
      shortestBook: simpleData(shortestBook),
      averageBookLength,
      totalPages,
    },
    tags,
  };
}

function simpleData(book: CleanBook) {
  return {
    title: `“${book.title}”`,
    authors: book.authors?.join(", "),
    isbn: book.isbn,
    pageCount: book.pageCount,
  };
}

function getKeyFromBiggestValue(object) {
  return Object.keys(object).reduce((a, b) => (object[a] > object[b] ? a : b));
}

function getKeyFromSmallestValue(object) {
  return Object.keys(object).reduce((a, b) => (object[a] > object[b] ? b : a));
}

function groupBy(
  array,
  key: string
): {
  [key: string]: number;
} {
  return array
    .filter((b) => b[key])
    .map((b) => b[key])
    .reduce((obj, k) => {
      if (!obj[k]) obj[k] = 0;
      obj[k]++;
      return obj;
    }, {});
}

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

export type YearReview = {
  year: string;
  count: number;
  topAuthors?: { name: string; count: number }[];
  dates?: {
    averageFinishTime: number;
    byMonth: { monthIndex: number; month: string; count: number }[];
    mostReadMonth: { month: string; count: number };
    leastReadMonth: { month: string; count: number };
    finishedInOneDay: {
      count: number;
      books: {
        title: string | undefined;
        authors: string | undefined;
        isbn: string;
        pageCount: number | undefined;
      }[];
    };
  };
  topGenres?: { name: string; count: number }[];
  tags?: { name: string; count: number }[];
  length?: {
    longestBook: {
      title: string | undefined;
      authors: string | undefined;
      isbn: string;
      pageCount: number | undefined;
    };
    shortestBook: {
      title: string | undefined;
      authors: string | undefined;
      isbn: string;
      pageCount: number | undefined;
    };
    averageBookLength: number | undefined;
    totalPages: number | undefined;
  };
};

function bBooksThisYear(books: CleanBook[], year: string) {
  return books
    .filter((f) => f.dateFinished?.startsWith(year))
    .map((b) => ({
      ...b,
      finishTime:
        b.dateFinished !== undefined && b.dateStarted !== undefined
          ? Math.floor(
              (Date.parse(b.dateFinished) - Date.parse(b.dateStarted)) /
                86400000
            )
          : undefined,
    }))
    .sort((a, b) =>
      b.pageCount && a.pageCount ? b.pageCount - a.pageCount : -1
    );
}

function bGroupByMonth(booksThisYear: CleanBook[]): {
  [key: string]: number;
} {
  return groupBy(
    booksThisYear.map((b) => {
      const match =
        b.dateFinished && b.dateFinished.match(/\d\d\d\d-(\d\d)-\d\d/);
      return {
        ...b,
        ...(b.dateFinished &&
          match && {
            dateFinished: match[1],
          }),
      };
    }),
    "dateFinished"
  );
}

const monthToWord = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

function findTopItems(
  booksThisYear: CleanBook[],
  key: string,
  valueTransform?
): { name: string; count: number }[] {
  const items = booksThisYear
    .map((book) => book[key])
    .flat()
    .filter((f) => f)
    .map((f) => (valueTransform ? valueTransform(f) : f))
    .reduce((obj, item: string) => {
      if (!obj[item]) obj[item] = 0;
      obj[item]++;
      return obj;
    }, {});
  const itemsArr = Object.keys(items)
    .map((a) => ({ name: a, count: items[a] }))
    .filter((f) => f.count > 1);
  return itemsArr.sort((a, b) => b.count - a.count).slice(0, 3);
}

function toLowerCase(s: string) {
  return s.toLowerCase().trim();
}

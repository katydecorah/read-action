import { YearReview } from "./summary";

export function s(num: number) {
  return num === 1 ? "" : "s";
}

export function mAverageDays({ dates }: YearReview) {
  if (!dates || !dates.averageFinishTime) return [];
  return [
    `- **Average read time:** ${dates.averageFinishTime.toFixed(1)} days`,
  ];
}

export function mMostReadMonth({ dates }: YearReview) {
  if (!dates || dates.mostReadMonth.count == dates.leastReadMonth.count)
    return [];
  const { mostReadMonth, leastReadMonth } = dates;
  return [
    `- **Month with most books:** ${mostReadMonth.month} (${
      mostReadMonth.count
    } book${s(mostReadMonth.count)})`,
    `- **Month with least books:** ${leastReadMonth.month} (${
      leastReadMonth.count
    } book${s(leastReadMonth.count)})`,
  ];
}

export function mGenre({ topGenres }: YearReview) {
  if (!topGenres || topGenres.length === 0) return [];
  const genres = topGenres.map(
    ({ name, count }) => `  - ${name} (${count} book${s(count)})`
  );
  return [`- **Top genre${s(topGenres.length)}:**`, ...genres];
}

export function mSameDay({ dates }: YearReview) {
  if (!dates || !dates.finishedInOneDay.count) return [];
  const { books } = dates.finishedInOneDay;
  const booksList = books.map((book) => `  - ${book.title} by ${book.authors}`);
  return [`- **Read in a day:**`, ...booksList];
}

export function mAverageLength({ length }: YearReview) {
  if (!length || !length.averageBookLength) return [];
  const { averageBookLength, longestBook, shortestBook, totalPages } = length;
  return [
    `- **Average book length:** ${averageBookLength?.toLocaleString()} pages`,
    `- **Longest book:** ${longestBook.title} by ${
      longestBook.authors
    } (${longestBook.pageCount?.toLocaleString()} pages)`,
    `- **Shortest book:** ${shortestBook.title} by ${
      shortestBook.authors
    } (${shortestBook.pageCount?.toLocaleString()} pages)`,
    `- **Total pages read:** ${totalPages?.toLocaleString()}`,
  ];
}

export function mTopAuthors({ topAuthors }: YearReview) {
  if (!topAuthors || topAuthors.length === 0) return [];
  const authorList = topAuthors.map(
    ({ name, count }) => `  - ${name} (${count} book${s(count)})`
  );
  return [`- **Top authors:**`, ...authorList];
}

export function mTags({ tags }: YearReview) {
  if (!tags || tags.length === 0) return [];
  const tagList = tags.map(
    ({ name, count }) => `  - ${name} (${count} book${s(count)})`
  );
  return [`- **Top tags:**`, ...tagList];
}

export function mMonthTable({ dates }: YearReview) {
  if (!dates || !dates.byMonth) return [];
  const monthTable = dates.byMonth.map(
    ({ month, count }) =>
      `| ${month} | ${count > 0 ? "📗".repeat(count) : ""} | `
  );
  return ["| Month | Books read |", "| ---: | :--- |", ...monthTable];
}

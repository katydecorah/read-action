import { exportVariable, setOutput } from "@actions/core";
import getBook from "./get-book";
import { CleanBook } from "./clean-book";
import { BookParams } from ".";
import { getMetadata } from "./libby";

export async function handleNewBook({
  bookParams,
  library,
  bookStatus,
  setImage,
}: {
  bookParams: BookParams;
  library: CleanBook[];
  bookStatus: string;
  setImage: boolean;
}): Promise<void> {
  let newBook;
  if (bookParams.bookIsbn.startsWith("http")) {
    newBook = await getMetadata(bookParams);
  } else {
    newBook = await getBook(bookParams);
  }

  library.push(newBook);
  exportVariable(`BookTitle`, newBook.title);
  const image = `book-${newBook.identifier.libby ?? newBook.identifier.isbn}.png`;

  if (bookStatus === "started") {
    setOutput("nowReading", {
      title: newBook.title,
      authors: newBook.authors,
      description: newBook.description,
      isbn: newBook.isbn,
      thumbnail: newBook.thumbnail,
      ...(setImage && {
        image,
      }),
    });
  }

  if (newBook.thumbnail) {
    exportVariable(`BookThumbOutput`, image);
    exportVariable(`BookThumb`, newBook.thumbnail);
  }
}

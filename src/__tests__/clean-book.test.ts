import cleanBook from "../clean-book";
import book from "./fixture.json";
import * as core from "@actions/core";

const dateFinished = "2020-09-12";

const defaultOptions = {
  filename: "my-library.json",
  "required-metadata": "title,pageCount,authors,description",
  "time-zone": "America/New_York",
};

describe("cleanBook", () => {
  beforeEach(() => {
    jest
      .spyOn(core, "getInput")
      .mockImplementation((v) => defaultOptions[v] || undefined);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("cleanBook", () => {
    expect(
      cleanBook(
        {
          dateType: { dateFinished: dateFinished },
          notes: "I loved it!",
          bookIsbn: "0525658181",
          providers: [],
          bookStatus: "finished",
          filename: "_data/read.yml",
        },
        book
      )
    ).toMatchInlineSnapshot(`
      {
        "authors": [
          "Yaa Gyasi",
        ],
        "categories": [
          "Fiction",
        ],
        "dateFinished": "2020-09-12",
        "description": "A novel about faith, science, religion, and family that tells the deeply moving portrait of a family of Ghanaian immigrants ravaged by depression and addiction and grief, narrated by a fifth year candidate in neuroscience at Stanford school of medicine studying the neural circuits of reward seeking behavior in mice…",
        "isbn": "0525658181",
        "language": "en",
        "link": "https://books.google.com/books/about/Transcendent_Kingdom.html?hl=&id=ty19yQEACAAJ",
        "notes": "I loved it!",
        "pageCount": 288,
        "printType": "BOOK",
        "publishedDate": "2020",
        "status": "finished",
        "thumbnail": "https://books.google.com/books/content?id=ty19yQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        "title": "Transcendent Kingdom",
      }
    `);
  });

  it("cleanBook with rating", () => {
    expect(
      cleanBook(
        {
          dateType: { dateFinished: dateFinished },
          notes: "I loved it!",
          bookIsbn: "0525658181",
          providers: [],
          bookStatus: "finished",
          rating: "⭐️⭐️⭐️⭐️⭐️",
          filename: "_data/read.yml",
        },
        book
      )
    ).toMatchInlineSnapshot(`
      {
        "authors": [
          "Yaa Gyasi",
        ],
        "categories": [
          "Fiction",
        ],
        "dateFinished": "2020-09-12",
        "description": "A novel about faith, science, religion, and family that tells the deeply moving portrait of a family of Ghanaian immigrants ravaged by depression and addiction and grief, narrated by a fifth year candidate in neuroscience at Stanford school of medicine studying the neural circuits of reward seeking behavior in mice…",
        "isbn": "0525658181",
        "language": "en",
        "link": "https://books.google.com/books/about/Transcendent_Kingdom.html?hl=&id=ty19yQEACAAJ",
        "notes": "I loved it!",
        "pageCount": 288,
        "printType": "BOOK",
        "publishedDate": "2020",
        "rating": "⭐️⭐️⭐️⭐️⭐️",
        "status": "finished",
        "thumbnail": "https://books.google.com/books/content?id=ty19yQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        "title": "Transcendent Kingdom",
      }
    `);
  });

  it("cleanBook, no date", () => {
    expect(
      cleanBook(
        {
          notes: "I loved it!",
          bookIsbn: "0525658181",
          providers: [],
          bookStatus: "finished",
          filename: "_data/read.yml",
        },
        book
      )
    ).toMatchInlineSnapshot(`
      {
        "authors": [
          "Yaa Gyasi",
        ],
        "categories": [
          "Fiction",
        ],
        "description": "A novel about faith, science, religion, and family that tells the deeply moving portrait of a family of Ghanaian immigrants ravaged by depression and addiction and grief, narrated by a fifth year candidate in neuroscience at Stanford school of medicine studying the neural circuits of reward seeking behavior in mice…",
        "isbn": "0525658181",
        "language": "en",
        "link": "https://books.google.com/books/about/Transcendent_Kingdom.html?hl=&id=ty19yQEACAAJ",
        "notes": "I loved it!",
        "pageCount": 288,
        "printType": "BOOK",
        "publishedDate": "2020",
        "status": "finished",
        "thumbnail": "https://books.google.com/books/content?id=ty19yQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        "title": "Transcendent Kingdom",
      }
    `);
  });

  it("cleanBook, missing `authors`", () => {
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    const warningSpy = jest.spyOn(core, "warning");
    cleanBook(
      {
        dateType: { dateStarted: "2022-01-01" },
        bookIsbn: "1234597890",
        providers: [],
        bookStatus: "started",
        filename: "_data/read.yml",
      },
      {
        title: "Book Title",
        publishedDate: "2013",
        industryIdentifiers: [],
        pageCount: 584,
        printType: "BOOK",
        categories: [],
        imageLinks: {},
        previewLink: "https://openlibrary.org/books/BookTitle",
        infoLink: "https://openlibrary.org/books/BookTitle",
        publisher: "Publisher Name",
        language: "en",
      }
    );
    expect(warningSpy.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "Book does not have authors, description",
      ]
    `);
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookNeedsReview",
          true,
        ],
        [
          "BookMissingMetadata",
          "authors, description",
        ],
        [
          "BookIsbn",
          "1234597890",
        ],
      ]
    `);
  });

  it("cleanBook, missing `title`", () => {
    const warningSpy = jest.spyOn(core, "warning");
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    cleanBook(
      {
        dateType: { dateStarted: "2022-01-01" },
        bookIsbn: "1234597890",
        providers: [],
        bookStatus: "started",
        filename: "_data/read.yml",
      },
      {
        authors: ["Author Name"],
        description: "Book description",
        publishedDate: "2013",
        industryIdentifiers: [],
        pageCount: 584,
        printType: "BOOK",
        categories: [],
        imageLinks: {},
        previewLink: "https://openlibrary.org/books/BookTitle",
        infoLink: "https://openlibrary.org/books/BookTitle",
        publisher: "Publisher Name",
        language: "en",
      }
    );
    expect(warningSpy.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "Book does not have title",
      ]
    `);
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookNeedsReview",
          true,
        ],
        [
          "BookMissingMetadata",
          "title",
        ],
        [
          "BookIsbn",
          "1234597890",
        ],
      ]
    `);
  });

  it("cleanBook, missing `description`", () => {
    const warningSpy = jest.spyOn(core, "warning");
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    cleanBook(
      {
        dateType: { dateStarted: "2022-01-01" },
        bookIsbn: "1234597890",
        providers: [],
        bookStatus: "started",
        filename: "_data/read.yml",
      },
      {
        title: "Book Title",
        authors: ["Author Name"],
        publishedDate: "2013",
        industryIdentifiers: [],
        pageCount: 584,
        printType: "BOOK",
        categories: [],
        imageLinks: {},
        previewLink: "https://openlibrary.org/books/BookTitle",
        infoLink: "https://openlibrary.org/books/BookTitle",
        publisher: "Publisher Name",
        language: "en",
      }
    );
    expect(warningSpy.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "Book does not have description",
      ]
    `);
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookNeedsReview",
          true,
        ],
        [
          "BookMissingMetadata",
          "description",
        ],
        [
          "BookIsbn",
          "1234597890",
        ],
      ]
    `);
  });

  it("cleanBook, missing authors, pageCount, description, title", () => {
    const warningSpy = jest.spyOn(core, "warning");
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    cleanBook(
      {
        dateType: { dateStarted: "2022-01-01" },
        bookIsbn: "1234597890",
        providers: [],
        bookStatus: "started",
        filename: "_data/read.yml",
      },
      {
        publishedDate: "2013",
        industryIdentifiers: [],
        pageCount: 0,
        printType: "BOOK",
        categories: [],
        imageLinks: {},
        previewLink: "https://openlibrary.org/books/BookTitle",
        infoLink: "https://openlibrary.org/books/BookTitle",
        publisher: "Publisher Name",
        language: "en",
      }
    );
    expect(warningSpy.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "Book does not have title, pageCount, authors, description",
      ]
    `);
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookNeedsReview",
          true,
        ],
        [
          "BookMissingMetadata",
          "title, pageCount, authors, description",
        ],
        [
          "BookIsbn",
          "1234597890",
        ],
      ]
    `);
  });

  it("cleanBook, ignore missing", () => {
    const warningSpy = jest.spyOn(core, "warning");
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    jest
      .spyOn(core, "getInput")
      .mockImplementation((v) =>
        v === "required-metadata" ? "" : defaultOptions[v] || undefined
      );
    cleanBook(
      {
        dateType: { dateStarted: "2022-01-01" },
        bookIsbn: "1234597890",
        providers: [],
        bookStatus: "started",
        filename: "_data/read.yml",
      },
      {
        publishedDate: "2013",
        industryIdentifiers: [],
        pageCount: 0,
        printType: "BOOK",
        categories: [],
        imageLinks: {},
        previewLink: "https://openlibrary.org/books/BookTitle",
        infoLink: "https://openlibrary.org/books/BookTitle",
        publisher: "Publisher Name",
        language: "en",
      }
    );
    expect(warningSpy.mock.calls[0]).toMatchInlineSnapshot(`undefined`);
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`[]`);
  });

  it("cleanBook, change thumbnail image width", () => {
    expect(
      cleanBook(
        {
          dateType: { dateFinished: dateFinished },
          notes: "I loved it!",
          bookIsbn: "0525658181",
          providers: [],
          bookStatus: "finished",
          filename: "_data/read.yml",
          thumbnailWidth: 10000,
        },
        book
      )
    ).toMatchInlineSnapshot(`
      {
        "authors": [
          "Yaa Gyasi",
        ],
        "categories": [
          "Fiction",
        ],
        "dateFinished": "2020-09-12",
        "description": "A novel about faith, science, religion, and family that tells the deeply moving portrait of a family of Ghanaian immigrants ravaged by depression and addiction and grief, narrated by a fifth year candidate in neuroscience at Stanford school of medicine studying the neural circuits of reward seeking behavior in mice…",
        "isbn": "0525658181",
        "language": "en",
        "link": "https://books.google.com/books/about/Transcendent_Kingdom.html?hl=&id=ty19yQEACAAJ",
        "notes": "I loved it!",
        "pageCount": 288,
        "printType": "BOOK",
        "publishedDate": "2020",
        "status": "finished",
        "thumbnail": "https://books.google.com/books/content?id=ty19yQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api&w=10000",
        "title": "Transcendent Kingdom",
      }
    `);
  });

  it("cleanBook, already https thumbnail, doesn't set thumbnailWidth", () => {
    const newBook = book;
    newBook.imageLinks.thumbnail = "https://site.com/image.jpg";
    expect(
      cleanBook(
        {
          dateType: { dateFinished: dateFinished },
          notes: "I loved it!",
          bookIsbn: "0525658181",
          providers: [],
          bookStatus: "finished",
          filename: "_data/read.yml",
          thumbnailWidth: 10000,
        },
        newBook
      )
    ).toMatchInlineSnapshot(`
      {
        "authors": [
          "Yaa Gyasi",
        ],
        "categories": [
          "Fiction",
        ],
        "dateFinished": "2020-09-12",
        "description": "A novel about faith, science, religion, and family that tells the deeply moving portrait of a family of Ghanaian immigrants ravaged by depression and addiction and grief, narrated by a fifth year candidate in neuroscience at Stanford school of medicine studying the neural circuits of reward seeking behavior in mice…",
        "isbn": "0525658181",
        "language": "en",
        "link": "https://books.google.com/books/about/Transcendent_Kingdom.html?hl=&id=ty19yQEACAAJ",
        "notes": "I loved it!",
        "pageCount": 288,
        "printType": "BOOK",
        "publishedDate": "2020",
        "status": "finished",
        "thumbnail": "https://site.com/image.jpg",
        "title": "Transcendent Kingdom",
      }
    `);
  });
});

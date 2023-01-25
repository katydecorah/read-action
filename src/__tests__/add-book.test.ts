import addBook from "../add-book";
import { promises, readFileSync } from "fs";
import book from "./fixture.json";
import { exportVariable } from "@actions/core";
import * as core from "@actions/core";

const books = readFileSync("./_data/read.json", "utf-8");
const dateFinished = "2020-09-12";

jest.mock("@actions/core");

const defaultOptions = {
  readFileName: "_data/read.yml",
  requiredMetadata: "title,pageCount,authors,description",
  timeZone: "America/New_York",
};

describe("addBook", () => {
  beforeEach(() => {
    jest
      .spyOn(core, "getInput")
      .mockImplementation((v) => defaultOptions[v] || undefined);
  });

  test("works", async () => {
    jest.spyOn(promises, "readFile").mockResolvedValueOnce(books);
    expect(
      await addBook(
        {
          dates: {
            dateAdded: undefined,
            dateStarted: undefined,
            dateFinished,
          },
          notes: "Amazing!",
          bookIsbn: "0525658181",
          providers: [],
          bookStatus: "finished",
        },
        book,
        "_data/read.yml"
      )
    ).toMatchSnapshot();
    expect(exportVariable.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookThumbOutput",
          "book-0525658181.png",
        ],
        [
          "BookThumb",
          "https://books.google.com/books/content?id=ty19yQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        ],
      ]
    `);
  });

  test("works, no images", async () => {
    jest.spyOn(promises, "readFile").mockResolvedValueOnce(books);
    expect(
      await addBook(
        {
          dates: {
            dateAdded: undefined,
            dateStarted: undefined,
            dateFinished,
          },
          notes: "Amazing!",
          bookIsbn: "0525658181",
          providers: [],
          bookStatus: "finished",
        },

        {
          ...book,
          imageLinks: {},
        },

        "_data/read.json"
      )
    ).toMatchSnapshot();
    expect(exportVariable).not.toHaveBeenNthCalledWith(
      1,
      "BookThumbOutput",
      "book-0525658181.png"
    );
    expect(exportVariable).not.toHaveBeenNthCalledWith(
      2,
      "BookThumb",
      "https://books.google.com/books/content?id=ty19yQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
    );
  });

  test("works, empty file", async () => {
    jest.spyOn(promises, "readFile").mockResolvedValueOnce("");
    expect(
      await addBook(
        {
          dates: {
            dateAdded: undefined,
            dateStarted: undefined,
            dateFinished,
          },
          notes: "Brilliant!",
          bookIsbn: "0525658181",
          providers: [],
          bookStatus: "finished",
        },

        book,
        "_data/read.json"
      )
    ).toMatchSnapshot();
  });
});

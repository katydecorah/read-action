import { yearReviewSummary, yearReview, summaryShort } from "../summary";
import * as core from "@actions/core";
import books from "../../_data/read.json";
import booksLots from "./library/lots.json";
import booksNoPageCount from "./library/no-page-count.json";

describe("yearReviewSummary", () => {
  it("works", () => {
    const result = yearReviewSummary(books, "2022");
    expect(result).toMatchInlineSnapshot(`
"
## 2022 reading summary

- **Total books:** 7
- **Average read time:** 2.0 days
- **Month with most books:** September (2 books)
- **Month with least books:** January (1 book)
- **Top genres:**
  - fiction (5 books)
  - social science (2 books)
- **Read in a day:**
  - “Belly of the Beast” by Da'Shaun L. Harrison
- **Average book length:** 251 pages
- **Longest book:** “The Candy House” by Jennifer Egan (352 pages)
- **Shortest book:** “Bliss Montage” by Ling Ma (145 pages)
- **Total pages read:** 1,756
- **Top tags:**
  - recommend (3 books)"
`);
  });

  it("no books", () => {
    const result = yearReviewSummary([], "2022");
    expect(result).toMatchInlineSnapshot(`undefined`);
  });

  it("no books, this year", () => {
    const result = yearReviewSummary(booksLots, "2021");
    expect(result).toMatchInlineSnapshot(`undefined`);
  });

  it("no pagecount", () => {
    const result = yearReviewSummary(booksNoPageCount, "2022");
    expect(result).toMatchInlineSnapshot(`
"
## 2022 reading summary

- **Total books:** 5
- **Average read time:** 1.0 days
- **Top genre:**
  - fiction (5 books)
- **Read in a day:**
  - “Book 1” by Other Author Name
- **Top authors:**
  - Author Name (3 books)
  - Other Author Name (2 books)"
`);
  });

  it("works, lots", () => {
    const result = yearReviewSummary(booksLots, "2022");
    expect(result).toMatchInlineSnapshot(`
"
## 2022 reading summary

- **Total books:** 13
- **Month with most books:** January (12 books)
- **Month with least books:** February (1 book)
- **Top genres:**
  - fiction (9 books)
  - web sites (2 books)
- **Read in a day:**
  - “Noor” by Nnedi Okorafor
- **Average book length:** 303 pages
- **Longest book:** “Caste” by Isabel Wilkerson (678 pages)
- **Shortest book:** “You Should Write a Book” by Katel LeDû, Lisa Maria Marquis (100 pages)
- **Total pages read:** 3,938
- **Top tags:**
  - recommend (3 books)"
`);
  });

  it("works, 2021", () => {
    const result = yearReviewSummary(books, "2021");
    expect(result).toMatchInlineSnapshot(`
      "
      ## 2021 reading summary

      - **Total books:** 2"
    `);
  });

  it("works, 2020", () => {
    const result = yearReviewSummary(books, "2020");
    expect(result).toMatchInlineSnapshot(`
      "
      ## 2020 reading summary

      - **Total books:** 2"
    `);
  });
});

describe("yearReview", () => {
  it("works", () => {
    const result = yearReview(books, "2022");
    expect(result).toMatchInlineSnapshot(`
      {
        "count": 7,
        "dates": {
          "averageFinishTime": 2,
          "finishedInOneDay": {
            "books": [
              {
                "authors": "Da'Shaun L. Harrison",
                "isbn": "9781623175979",
                "pageCount": 148,
                "title": "“Belly of the Beast”",
              },
            ],
            "count": 1,
          },
          "leastReadMonth": {
            "count": 1,
            "month": "January",
          },
          "mostReadMonth": {
            "count": 2,
            "month": "September",
          },
        },
        "length": {
          "averageBookLength": 251,
          "longestBook": {
            "authors": "Jennifer Egan",
            "isbn": "9781476716763",
            "pageCount": 352,
            "title": "“The Candy House”",
          },
          "shortestBook": {
            "authors": "Ling Ma",
            "isbn": "9780374717124",
            "pageCount": 145,
            "title": "“Bliss Montage”",
          },
          "totalPages": 1756,
        },
        "tags": [
          {
            "count": 3,
            "name": "recommend",
          },
        ],
        "topAuthors": [],
        "topGenres": [
          {
            "count": 5,
            "name": "fiction",
          },
          {
            "count": 2,
            "name": "social science",
          },
        ],
        "year": "2022",
      }
    `);
  });

  it("one book", () => {
    const book = [
      {
        authors: ["Raven Leilani"],
        dateAdded: "2022-10-01",
        dateFinished: "2022-10-05",
        dateStarted: "2022-10-02",
        description:
          "Sharp, comic, disruptive, tender, Raven Leilani's debut novel, Luster, sees a young black woman fall into art and someone else's open marriage. Edie is stumbling her way through her twenties--sharing a subpar apartment in Bushwick, clocking in and out of her admin job, making a series of inappropriate sexual choices. She's also, secretly, haltingly, figuring her way into life as an artist. And then she meets Eric, a digital archivist with a family in New Jersey, including an autopsist wife who has agreed to an open marriage--with rules. As if navigating the constantly shifting landscapes of contemporary sexual manners and racial politics weren't hard enough, Edie finds herself unemployed and falling into Eric's family life, his home. She becomes a hesitant friend to his wife and a de facto role model to his adopted daughter. Edie is the only black woman who young Akila knows. Razor sharp, darkly comic, sexually charged, socially disruptive, Luster is a portrait of a young woman trying to make her sense of her life in a tumultuous era. It is also a haunting, aching description of how hard it is to believe in your own talent and the unexpected influences that bring us into ourselves along the way.",
        isbn: "9780385696005",
        language: "en",
        link: "https://books.google.com/books/about/Luster.html?hl=&id=eJ06zQEACAAJ",
        pageCount: 240,
        printType: "BOOK",
        publishedDate: "2020-08-04",
        status: "started",
        thumbnail:
          "https://books.google.com/books/content?id=eJ06zQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        title: "Luster",
      },
    ];
    expect(yearReview(book, "2022")).toMatchInlineSnapshot(`
      {
        "count": 1,
        "year": "2022",
      }
    `);

    expect(yearReviewSummary(book, "2022")).toMatchInlineSnapshot(`
      "
      ## 2022 reading summary

      - **Total books:** 1"
    `);
  });
});

describe("summaryShort", () => {
  it("works", () => {
    // mock process.env.BookStatus=finished
    process.env.BookStatus = "finished";
    const setOutputSpy = jest.spyOn(core, "setOutput");
    const result = summaryShort(books, "2022-06-30");
    expect(result).toMatchInlineSnapshot(`
"- **Total books:** 7
- **Average read time:** 2.0 days
- **Month with most books:** September (2 books)
- **Month with least books:** January (1 book)
- **Top genres:**
  - fiction (5 books)
  - social science (2 books)
- **Read in a day:**
  - “Belly of the Beast” by Da'Shaun L. Harrison
- **Average book length:** 251 pages
- **Longest book:** “The Candy House” by Jennifer Egan (352 pages)
- **Shortest book:** “Bliss Montage” by Ling Ma (145 pages)
- **Total pages read:** 1,756
- **Top tags:**
  - recommend (3 books)"
`);
    expect(setOutputSpy.mock.calls[0]).toMatchInlineSnapshot(`
[
  "summaryYear",
  "2022",
]
`);
  });
  it("works, no summary", () => {
    // mock process.env.BookStatus=finished
    process.env.BookStatus = "finished";
    const result = summaryShort(books, "2002-06-30");
    expect(result).toMatchInlineSnapshot(`undefined`);
  });
});

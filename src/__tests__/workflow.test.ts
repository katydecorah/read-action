import { read } from "../index";
import * as github from "@actions/github";
import * as core from "@actions/core";
import returnWriteFile from "../write-file";
import { promises } from "fs";

jest.mock("@actions/core", () => {
  return {
    ...jest.requireActual("@actions/core"),
    setFailed: jest.fn(),
    getInput: jest.fn(),
    warning: jest.fn(),
    summary: {
      addRaw: () => ({
        write: jest.fn(),
      }),
    },
  };
});

jest.mock("../write-file");

const defaultOptions = {
  filename: "my-library.json",
  "required-metadata": "title,pageCount,authors,description",
  "time-zone": "America/New_York",
  providers: "google",
  "thumbnail-width": "128",
};

describe("workflow", () => {
  beforeEach(() => {
    jest
      .spyOn(core, "getInput")
      .mockImplementation((v) => defaultOptions[v] || undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("want to read", async () => {
    jest.spyOn(promises, "readFile").mockResolvedValue();
    const summarySpy = jest.spyOn(core.summary, "addRaw");
    jest.useFakeTimers().setSystemTime(new Date("2022-10-01T12:00:00"));
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780385696005",
          },
        },
      },
    });
    await read();
    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(summarySpy.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "# Updated library

      Want to read: “Luster”

      ",
      ]
    `);
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Raven Leilani",
            ],
            "categories": [
              "Fiction",
            ],
            "dateAdded": "2022-10-01",
            "dateFinished": undefined,
            "dateStarted": undefined,
            "description": "NEW YORK TIMES BESTSELLER Winner of the 2020 Center for Fiction First Novel Prize Winner of the 2020 National Book Critics Circle's John Leonard Prize for Best First Book Winner of the 2020 Kirkus Prize for Fiction Winner of the 2021 Dylan Thomas Prize Finalist for the 2021 PEN/Hemingway Award for Best First Novel Longlisted for the 2021 Andrew Carnegie Medal for Excellence in Fiction Longlisted for the 2021 PEN/Jean Stein Book Award Longlisted for the 2021 Women's Prize for Fiction A New York Times Notable Book of the Year Named Best Book of the Year by O: the Oprah Magazine, Vanity Fair, Los Angeles Times, Town and Country, Amazon, Indigo, NPR, Harper’s Bazaar, Kirkus Reviews, Marie Claire, Good Housekeeping Sharp, comic, disruptive, and tender, Luster sees a young Black woman fall into art and someone else's open marriage. Edie is stumbling her way through her twenties—sharing a subpar apartment in Bushwick, clocking in and out of her admin job, making a series of inappropriate sexual choices. She's also, secretly, haltingly, figuring her way into life as an artist. And then she meets Eric, a digital archivist with a family in New Jersey, including an autopsist wife who has agreed to an open marriage—with rules. As if navigating the constantly shifting landscapes of contemporary sexual manners and racial politics weren't hard enough, Edie finds herself unemployed and falling into Eric's family life, his home. She becomes a hesitant friend to his wife and a de facto role model to his adopted daughter. Edie is the only Black woman who young Akila knows. Razor-sharp, darkly comic, sexually charged, socially disruptive, Luster is a portrait of a young woman trying to make sense of her life in a tumultuous era. It is also a haunting, aching description of how hard it is to believe in your own talent and the unexpected influences that bring us into ourselves along the way.",
            "isbn": "9780385696005",
            "language": "en",
            "link": "https://books.google.com/books/about/Luster.html?hl=&id=NFeTEAAAQBAJ",
            "printType": "BOOK",
            "publishedDate": "2020-08-04",
            "status": "want to read",
            "thumbnail": "https://books.google.com/books/content?id=NFeTEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api&w=128",
            "title": "Luster",
          },
        ],
      ]
    `);
  });

  test("added to started", async () => {
    jest.spyOn(promises, "readFile").mockResolvedValue(
      JSON.stringify([
        {
          authors: ["Raven Leilani"],
          dateAdded: "2022-10-01",
          dateFinished: undefined,
          dateStarted: undefined,
          description:
            "Sharp, comic, disruptive, tender, Raven Leilani's debut novel, Luster, sees a young black woman fall into art and someone else's open marriage. Edie is stumbling her way through her twenties--sharing a subpar apartment in Bushwick, clocking in and out of her admin job, making a series of inappropriate sexual choices. She's also, secretly, haltingly, figuring her way into life as an artist. And then she meets Eric, a digital archivist with a family in New Jersey, including an autopsist wife who has agreed to an open marriage--with rules. As if navigating the constantly shifting landscapes of contemporary sexual manners and racial politics weren't hard enough, Edie finds herself unemployed and falling into Eric's family life, his home. She becomes a hesitant friend to his wife and a de facto role model to his adopted daughter. Edie is the only black woman who young Akila knows. Razor sharp, darkly comic, sexually charged, socially disruptive, Luster is a portrait of a young woman trying to make her sense of her life in a tumultuous era. It is also a haunting, aching description of how hard it is to believe in your own talent and the unexpected influences that bring us into ourselves along the way.",
          isbn: "9780385696005",
          language: "en",
          link: "https://books.google.com/books/about/Luster.html?hl=&id=eJ06zQEACAAJ",
          pageCount: 240,
          printType: "BOOK",
          publishedDate: "2020-08-04",
          status: "want to read",
          thumbnail:
            "https://books.google.com/books/content?id=eJ06zQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          title: "Luster",
        },
      ])
    );
    const setFailedSpy = jest.spyOn(core, "setFailed");
    const summarySpy = jest.spyOn(core.summary, "addRaw");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780385696005",
            "date-started": "2022-10-02",
          },
        },
      },
    });
    await read();
    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(summarySpy.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "# Updated library

      Started: “Luster”

      ",
      ]
    `);
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Raven Leilani",
            ],
            "dateAdded": "2022-10-01",
            "dateFinished": undefined,
            "dateStarted": "2022-10-02",
            "description": "Sharp, comic, disruptive, tender, Raven Leilani's debut novel, Luster, sees a young black woman fall into art and someone else's open marriage. Edie is stumbling her way through her twenties--sharing a subpar apartment in Bushwick, clocking in and out of her admin job, making a series of inappropriate sexual choices. She's also, secretly, haltingly, figuring her way into life as an artist. And then she meets Eric, a digital archivist with a family in New Jersey, including an autopsist wife who has agreed to an open marriage--with rules. As if navigating the constantly shifting landscapes of contemporary sexual manners and racial politics weren't hard enough, Edie finds herself unemployed and falling into Eric's family life, his home. She becomes a hesitant friend to his wife and a de facto role model to his adopted daughter. Edie is the only black woman who young Akila knows. Razor sharp, darkly comic, sexually charged, socially disruptive, Luster is a portrait of a young woman trying to make her sense of her life in a tumultuous era. It is also a haunting, aching description of how hard it is to believe in your own talent and the unexpected influences that bring us into ourselves along the way.",
            "isbn": "9780385696005",
            "language": "en",
            "link": "https://books.google.com/books/about/Luster.html?hl=&id=eJ06zQEACAAJ",
            "pageCount": 240,
            "printType": "BOOK",
            "publishedDate": "2020-08-04",
            "status": "started",
            "thumbnail": "https://books.google.com/books/content?id=eJ06zQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
            "title": "Luster",
          },
        ],
      ]
    `);
  });

  test("started to finished", async () => {
    jest.spyOn(promises, "readFile").mockResolvedValue(
      JSON.stringify([
        {
          authors: ["Raven Leilani"],
          dateAdded: "2022-10-01",
          dateFinished: undefined,
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
      ])
    );
    const setFailedSpy = jest.spyOn(core, "setFailed");
    const summarySpy = jest.spyOn(core.summary, "addRaw");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780385696005",
            "date-finished": "2022-10-03",
            rating: "⭐️⭐️⭐️⭐️⭐️",
          },
        },
      },
    });
    await read();

    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(summarySpy.mock.calls[0]).toMatchInlineSnapshot(`
[
  "# Updated library

Finished: “Luster”

## 2022 reading summary


- **Total books:** 1
",
]
`);
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Raven Leilani",
            ],
            "dateAdded": "2022-10-01",
            "dateFinished": "2022-10-03",
            "dateStarted": "2022-10-02",
            "description": "Sharp, comic, disruptive, tender, Raven Leilani's debut novel, Luster, sees a young black woman fall into art and someone else's open marriage. Edie is stumbling her way through her twenties--sharing a subpar apartment in Bushwick, clocking in and out of her admin job, making a series of inappropriate sexual choices. She's also, secretly, haltingly, figuring her way into life as an artist. And then she meets Eric, a digital archivist with a family in New Jersey, including an autopsist wife who has agreed to an open marriage--with rules. As if navigating the constantly shifting landscapes of contemporary sexual manners and racial politics weren't hard enough, Edie finds herself unemployed and falling into Eric's family life, his home. She becomes a hesitant friend to his wife and a de facto role model to his adopted daughter. Edie is the only black woman who young Akila knows. Razor sharp, darkly comic, sexually charged, socially disruptive, Luster is a portrait of a young woman trying to make her sense of her life in a tumultuous era. It is also a haunting, aching description of how hard it is to believe in your own talent and the unexpected influences that bring us into ourselves along the way.",
            "isbn": "9780385696005",
            "language": "en",
            "link": "https://books.google.com/books/about/Luster.html?hl=&id=eJ06zQEACAAJ",
            "pageCount": 240,
            "printType": "BOOK",
            "publishedDate": "2020-08-04",
            "rating": "⭐️⭐️⭐️⭐️⭐️",
            "status": "finished",
            "thumbnail": "https://books.google.com/books/content?id=eJ06zQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
            "title": "Luster",
          },
        ],
      ]
    `);
  });
});

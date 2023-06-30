import { read } from "../index";
import * as github from "@actions/github";
import * as core from "@actions/core";
import returnWriteFile from "../write-file";
import { promises } from "fs";

const mockReadFile = JSON.stringify([
  {
    isbn: "9780525620792",
    dateStarted: "2021-09-26",
    title: "Mexican Gothic",
    authors: ["Silvia Moreno-Garcia"],
    publishedDate: "2020-06-30",
    description: "NEW YORK TIMES BESTSELLER",
    pageCount: 320,
    printType: "BOOK",
    categories: ["Fiction"],
    thumbnail:
      "https://books.google.com/books/content?id=ksKyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    language: "en",
    link: "https://play.google.com/store/books/details?id=ksKyDwAAQBAJ",
  },
]);

jest.mock("@actions/core", () => {
  return {
    setFailed: jest.fn(),
    exportVariable: jest.fn(),
    getInput: jest.fn(),
    warning: jest.fn(),
    setOutput: jest.fn(),
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
};

describe("index", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(promises, "readFile").mockResolvedValue(mockReadFile);
    jest
      .spyOn(core, "getInput")
      .mockImplementation((v) => defaultOptions[v] || undefined);
  });

  test("works, started a new book", async () => {
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780385696005",
            "date-started": "2022-01-02",
          },
        },
      },
    });
    await read();
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookStatus",
          "started",
        ],
        [
          "BookNeedsReview",
          true,
        ],
        [
          "BookMissingMetadata",
          "pageCount",
        ],
        [
          "BookIsbn",
          "9780385696005",
        ],
        [
          "BookTitle",
          "Luster",
        ],
        [
          "BookThumbOutput",
          "book-9780385696005.png",
        ],
        [
          "BookThumb",
          "https://books.google.com/books/content?id=NFeTEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        ],
      ]
    `);
    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Silvia Moreno-Garcia",
            ],
            "categories": [
              "Fiction",
            ],
            "dateStarted": "2021-09-26",
            "description": "NEW YORK TIMES BESTSELLER",
            "isbn": "9780525620792",
            "language": "en",
            "link": "https://play.google.com/store/books/details?id=ksKyDwAAQBAJ",
            "pageCount": 320,
            "printType": "BOOK",
            "publishedDate": "2020-06-30",
            "thumbnail": "https://books.google.com/books/content?id=ksKyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
            "title": "Mexican Gothic",
          },
          {
            "authors": [
              "Raven Leilani",
            ],
            "categories": [
              "Fiction",
            ],
            "dateAdded": undefined,
            "dateFinished": undefined,
            "dateStarted": "2022-01-02",
            "description": "NEW YORK TIMES BESTSELLER Winner of the 2020 Center for Fiction First Novel Prize Winner of the 2020 National Book Critics Circle's John Leonard Prize for Best First Book Winner of the 2020 Kirkus Prize for Fiction Winner of the 2021 Dylan Thomas Prize Finalist for the 2021 PEN/Hemingway Award for Best First Novel Longlisted for the 2021 Andrew Carnegie Medal for Excellence in Fiction Longlisted for the 2021 PEN/Jean Stein Book Award Longlisted for the 2021 Women's Prize for Fiction A New York Times Notable Book of the Year Named Best Book of the Year by O: the Oprah Magazine, Vanity Fair, Los Angeles Times, Town and Country, Amazon, Indigo, NPR, Harper’s Bazaar, Kirkus Reviews, Marie Claire, Good Housekeeping Sharp, comic, disruptive, and tender, Luster sees a young Black woman fall into art and someone else's open marriage. Edie is stumbling her way through her twenties—sharing a subpar apartment in Bushwick, clocking in and out of her admin job, making a series of inappropriate sexual choices. She's also, secretly, haltingly, figuring her way into life as an artist. And then she meets Eric, a digital archivist with a family in New Jersey, including an autopsist wife who has agreed to an open marriage—with rules. As if navigating the constantly shifting landscapes of contemporary sexual manners and racial politics weren't hard enough, Edie finds herself unemployed and falling into Eric's family life, his home. She becomes a hesitant friend to his wife and a de facto role model to his adopted daughter. Edie is the only Black woman who young Akila knows. Razor-sharp, darkly comic, sexually charged, socially disruptive, Luster is a portrait of a young woman trying to make sense of her life in a tumultuous era. It is also a haunting, aching description of how hard it is to believe in your own talent and the unexpected influences that bring us into ourselves along the way.",
            "isbn": "9780385696005",
            "language": "en",
            "link": "https://books.google.com/books/about/Luster.html?hl=&id=NFeTEAAAQBAJ",
            "printType": "BOOK",
            "publishedDate": "2020-08-04",
            "status": "started",
            "thumbnail": "https://books.google.com/books/content?id=NFeTEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
            "title": "Luster",
          },
        ],
      ]
    `);
  });

  test("works, finished a previous book", async () => {
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780525620792",
            "date-finished": "2021-09-30",
          },
        },
      },
    });
    await read();
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookStatus",
          "finished",
        ],
        [
          "BookTitle",
          "Mexican Gothic",
        ],
      ]
    `);
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Silvia Moreno-Garcia",
            ],
            "categories": [
              "Fiction",
            ],
            "dateAdded": undefined,
            "dateFinished": "2021-09-30",
            "dateStarted": "2021-09-26",
            "description": "NEW YORK TIMES BESTSELLER",
            "isbn": "9780525620792",
            "language": "en",
            "link": "https://play.google.com/store/books/details?id=ksKyDwAAQBAJ",
            "pageCount": 320,
            "printType": "BOOK",
            "publishedDate": "2020-06-30",
            "status": "finished",
            "thumbnail": "https://books.google.com/books/content?id=ksKyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
            "title": "Mexican Gothic",
          },
        ],
      ]
    `);
  });

  test("works, finished a book (new, not started)", async () => {
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780525511342",
            "date-finished": "2022-08-02",
          },
        },
      },
    });
    await read();
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookStatus",
          "finished",
        ],
        [
          "BookTitle",
          "Woman of Light",
        ],
        [
          "BookThumbOutput",
          "book-9780525511342.png",
        ],
        [
          "BookThumb",
          "https://books.google.com/books/content?id=5LhBEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
        ],
      ]
    `);
    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Silvia Moreno-Garcia",
            ],
            "categories": [
              "Fiction",
            ],
            "dateStarted": "2021-09-26",
            "description": "NEW YORK TIMES BESTSELLER",
            "isbn": "9780525620792",
            "language": "en",
            "link": "https://play.google.com/store/books/details?id=ksKyDwAAQBAJ",
            "pageCount": 320,
            "printType": "BOOK",
            "publishedDate": "2020-06-30",
            "thumbnail": "https://books.google.com/books/content?id=ksKyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
            "title": "Mexican Gothic",
          },
          {
            "authors": [
              "Kali Fajardo-Anstine",
            ],
            "categories": [
              "Fiction",
            ],
            "dateAdded": undefined,
            "dateFinished": "2022-08-02",
            "dateStarted": undefined,
            "description": "NATIONAL BESTSELLER • A “dazzling, cinematic, intimate, lyrical” (Roxane Gay) epic of betrayal, love, and fate that spans five generations of an Indigenous Chicano family in the American West, from the author of the National Book Award finalist Sabrina & Corina “Sometimes you just step into a book and let it wash over you, like you’re swimming under a big, sparkling night sky.”—Celeste Ng, author of Little Fires Everywhere and Everything I Never Told You A PHENOMENAL BOOK CLUB PICK AND AN AUDACIOUS BOOK CLUB PICK • ONE OF THE BEST BOOKS OF THE YEAR: Book Riot There is one every generation, a seer who keeps the stories. Luz “Little Light” Lopez, a tea leaf reader and laundress, is left to fend for herself after her older brother, Diego, a snake charmer and factory worker, is run out of town by a violent white mob. As Luz navigates 1930s Denver, she begins to have visions that transport her to her Indigenous homeland in the nearby Lost Territory. Luz recollects her ancestors’ origins, how her family flourished, and how they were threatened. She bears witness to the sinister forces that have devastated her people and their homelands for generations. In the end, it is up to Luz to save her family stories from disappearing into oblivion. Written in Kali Fajardo-Anstine’s singular voice, the wildly entertaining and complex lives of the Lopez family fill the pages of this multigenerational western saga. Woman of Light is a transfixing novel about survival, family secrets, and love—filled with an unforgettable cast of characters, all of whom are just as special, memorable, and complicated as our beloved heroine, Luz. LONGLISTED FOR THE JOYCE CAROL OATES PRIZE • LONGLISTED FOR THE CAROL SHIELDS PRIZE FOR FICTION",
            "isbn": "9780525511342",
            "language": "en",
            "link": "https://play.google.com/store/books/details?id=5LhBEAAAQBAJ",
            "pageCount": 353,
            "printType": "BOOK",
            "publishedDate": "2022-06-07",
            "status": "finished",
            "thumbnail": "https://books.google.com/books/content?id=5LhBEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
            "title": "Woman of Light",
          },
        ],
      ]
    `);
  });

  test("works, finished a book (new, not started) (with dateStarted)", async () => {
    const exportVariableSpy = jest.spyOn(core, "exportVariable");
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780525511342",
            "date-started": "2022-08-01",
            "date-finished": "2022-08-02",
          },
        },
      },
    });
    await read();
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookStatus",
          "finished",
        ],
        [
          "BookTitle",
          "Woman of Light",
        ],
        [
          "BookThumbOutput",
          "book-9780525511342.png",
        ],
        [
          "BookThumb",
          "https://books.google.com/books/content?id=5LhBEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
        ],
      ]
    `);
    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Silvia Moreno-Garcia",
            ],
            "categories": [
              "Fiction",
            ],
            "dateStarted": "2021-09-26",
            "description": "NEW YORK TIMES BESTSELLER",
            "isbn": "9780525620792",
            "language": "en",
            "link": "https://play.google.com/store/books/details?id=ksKyDwAAQBAJ",
            "pageCount": 320,
            "printType": "BOOK",
            "publishedDate": "2020-06-30",
            "thumbnail": "https://books.google.com/books/content?id=ksKyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
            "title": "Mexican Gothic",
          },
          {
            "authors": [
              "Kali Fajardo-Anstine",
            ],
            "categories": [
              "Fiction",
            ],
            "dateAdded": undefined,
            "dateFinished": "2022-08-02",
            "dateStarted": "2022-08-01",
            "description": "NATIONAL BESTSELLER • A “dazzling, cinematic, intimate, lyrical” (Roxane Gay) epic of betrayal, love, and fate that spans five generations of an Indigenous Chicano family in the American West, from the author of the National Book Award finalist Sabrina & Corina “Sometimes you just step into a book and let it wash over you, like you’re swimming under a big, sparkling night sky.”—Celeste Ng, author of Little Fires Everywhere and Everything I Never Told You A PHENOMENAL BOOK CLUB PICK AND AN AUDACIOUS BOOK CLUB PICK • ONE OF THE BEST BOOKS OF THE YEAR: Book Riot There is one every generation, a seer who keeps the stories. Luz “Little Light” Lopez, a tea leaf reader and laundress, is left to fend for herself after her older brother, Diego, a snake charmer and factory worker, is run out of town by a violent white mob. As Luz navigates 1930s Denver, she begins to have visions that transport her to her Indigenous homeland in the nearby Lost Territory. Luz recollects her ancestors’ origins, how her family flourished, and how they were threatened. She bears witness to the sinister forces that have devastated her people and their homelands for generations. In the end, it is up to Luz to save her family stories from disappearing into oblivion. Written in Kali Fajardo-Anstine’s singular voice, the wildly entertaining and complex lives of the Lopez family fill the pages of this multigenerational western saga. Woman of Light is a transfixing novel about survival, family secrets, and love—filled with an unforgettable cast of characters, all of whom are just as special, memorable, and complicated as our beloved heroine, Luz. LONGLISTED FOR THE JOYCE CAROL OATES PRIZE • LONGLISTED FOR THE CAROL SHIELDS PRIZE FOR FICTION",
            "isbn": "9780525511342",
            "language": "en",
            "link": "https://play.google.com/store/books/details?id=5LhBEAAAQBAJ",
            "pageCount": 353,
            "printType": "BOOK",
            "publishedDate": "2022-06-07",
            "status": "finished",
            "thumbnail": "https://books.google.com/books/content?id=5LhBEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
            "title": "Woman of Light",
          },
        ],
      ]
    `);
  });

  test("works, want to read/queue", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-10-01T12:00:00"));

    const exportVariableSpy = jest.spyOn(core, "exportVariable");
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
    expect(exportVariableSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "BookStatus",
          "want to read",
        ],
        [
          "BookNeedsReview",
          true,
        ],
        [
          "BookMissingMetadata",
          "pageCount",
        ],
        [
          "BookIsbn",
          "9780385696005",
        ],
        [
          "BookTitle",
          "Luster",
        ],
        [
          "BookThumbOutput",
          "book-9780385696005.png",
        ],
        [
          "BookThumb",
          "https://books.google.com/books/content?id=NFeTEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        ],
      ]
    `);
    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Silvia Moreno-Garcia",
            ],
            "categories": [
              "Fiction",
            ],
            "dateStarted": "2021-09-26",
            "description": "NEW YORK TIMES BESTSELLER",
            "isbn": "9780525620792",
            "language": "en",
            "link": "https://play.google.com/store/books/details?id=ksKyDwAAQBAJ",
            "pageCount": 320,
            "printType": "BOOK",
            "publishedDate": "2020-06-30",
            "thumbnail": "https://books.google.com/books/content?id=ksKyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
            "title": "Mexican Gothic",
          },
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
            "thumbnail": "https://books.google.com/books/content?id=NFeTEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
            "title": "Luster",
          },
        ],
      ]
    `);
  });

  test("error, no payload", async () => {
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {},
      },
    });

    await read();
    expect(setFailedSpy).toHaveBeenCalledWith("Missing `isbn` in payload");
  });

  test("error, missing isbn", async () => {
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            "date-finished": "2021-09-26",
          },
        },
      },
    });
    await read();
    expect(setFailedSpy).toHaveBeenCalledWith("Missing `isbn` in payload");
  });

  test("error, setFailed", async () => {
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
    jest.spyOn(core, "getInput").mockImplementation(() => {
      throw new Error("test error");
    });
    await read();
    expect(setFailedSpy.mock.calls[0][0]).toMatchInlineSnapshot(
      `[Error: test error]`
    );
  });

  test("tags", async () => {
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780385696005",
            tags: "new, recommend",
          },
        },
      },
    });
    await read();
    expect(returnWriteFile.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "my-library.json",
        [
          {
            "authors": [
              "Silvia Moreno-Garcia",
            ],
            "categories": [
              "Fiction",
            ],
            "dateStarted": "2021-09-26",
            "description": "NEW YORK TIMES BESTSELLER",
            "isbn": "9780525620792",
            "language": "en",
            "link": "https://play.google.com/store/books/details?id=ksKyDwAAQBAJ",
            "pageCount": 320,
            "printType": "BOOK",
            "publishedDate": "2020-06-30",
            "thumbnail": "https://books.google.com/books/content?id=ksKyDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
            "title": "Mexican Gothic",
          },
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
            "tags": [
              "new",
              "recommend",
            ],
            "thumbnail": "https://books.google.com/books/content?id=NFeTEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
            "title": "Luster",
          },
        ],
      ]
    `);
  });

  test("good dateFinished", async () => {
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780385696005",
            "date-finished": "2022-02-02",
          },
        },
      },
    });
    await read();
    expect(setFailedSpy).not.toHaveBeenCalled();
  });

  test("error, bad dateFinished", async () => {
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780385696005",
            "date-finished": "1234",
          },
        },
      },
    });
    await read();
    expect(setFailedSpy).toHaveBeenCalledWith(
      "Invalid `date-finished` in payload: 1234"
    );
  });

  test("error, bad dateStarted", async () => {
    const setFailedSpy = jest.spyOn(core, "setFailed");
    Object.defineProperty(github, "context", {
      value: {
        payload: {
          inputs: {
            isbn: "9780385696005",
            "date-started": "1234",
          },
        },
      },
    });
    await read();
    expect(setFailedSpy).toHaveBeenCalledWith(
      "Invalid `date-started` in payload: 1234"
    );
  });
});

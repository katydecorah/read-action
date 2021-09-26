"use strict";

const core = require("@actions/core");
const github = require("@actions/github");
const isbn = require("node-isbn");
const fetch = require("node-fetch");
const { titleParser, getBook, writeFile } = require("./utils");

async function read() {
  try {
    const { title, number, body } = github.context.payload.issue;
    const { bookIsbn, date } = titleParser(title);
    const fileName = core.getInput("readFileName");
    const providers = core.getInput("providers")
      ? core.getInput("providers").split(",")
      : isbn._providers;
    const imageDirectory = core.getInput("imageDirectory");
    core.exportVariable("IssueNumber", number);
    const bookMetadata = await getBook(
      { date, body, bookIsbn, providers },
      fileName
    );
    // Use https for thumbnail
    if (
      bookMetadata.imageLinks.thumbnail &&
      bookMetadata.imageLinks.thumbnail.startsWith("http:")
    ) {
      bookMetadata.imageLinks.thumbnail =
        bookMetadata.imageLinks.thumbnail.replace("http:", "https:");
    }
    // Write book to yaml file
    await writeFile(fileName, bookMetadata);
    // Download book thumbnail
    if (bookMetadata.imageLinks.thumbnail) {
      try {
        const response = await fetch(bookMetadata.imageLinks.thumbnail);
        const buffer = await response.buffer();
        await writeFile(`${imageDirectory}/book-${bookIsbn}.png`, buffer);
      } catch (error) {
        core.setFailed(error.err);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = read();

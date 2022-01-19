# read-action

![Test](https://github.com/katydecorah/read-action/workflows/Test/badge.svg?branch=main)

![.github/workflows/read.yml](https://github.com/katydecorah/read-action/workflows/.github/workflows/read.yml/badge.svg)

This GitHub action tracks the books that you read by updating a YAML file in your repository. Pair it with the [iOS Shortcut](shortcut/README.md) to automatically format and open the GitHub issue.

Create a new issue with the book's ISBN in the title. The action will then fetch the book's metadata using [node-isbn](https://www.npmjs.com/package/node-isbn) and commit the change in your repository, always sorting by the date you finished the book.

<!-- START GENERATED DOCUMENTATION -->

## Set up the workflow

To use this action, create a new workflow in `.github/workflows` and modify it as needed:

```yml
on:
  issues:
    types: opened

jobs:
  update_library:
    runs-on: macOS-latest
    name: Read
    # only continue if issue has "read" label
    if: contains( github.event.issue.labels.*.name, 'read')
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Read
        uses: katydecorah/read-action@v3.0.1
      - name: Download the book thumbnail
        run: curl "${{ env.BookThumb }}" -o "img/staging/${{ env.BookThumbOutput }}"
      - name: Commit files
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git commit -am "Add ${{ env.BookTitle }} to _data/read.yml"
          git push
      - name: Close issue
        uses: peter-evans/close-issue@v1
        with:
          issue-number: "${{ env.IssueNumber }}"
          comment: "📚 You read ${{ env.BookTitle }} on ${{env.DateRead}}."
```

## Action options

- `readFileName`: The file where you want to save your books. Default: `_data/read.yml`.

- `providers`: Specify the [ISBN providers](https://github.com/palmerabollo/node-isbn#setting-backend-providers) that you want to use, in the order you need them to be invoked. If setting more than one provider, separate each with a comma.

<!-- END GENERATED DOCUMENTATION -->

## Create an issue

The title of your issue must start with the ISBN of the book:

```
1234567890
```

The action will automatically set the date that you finished the book (`dateFinished`) to today. To specify a different date that you finished the book, add the date after the ISBN in `YYYY-MM-DD` format.

```
1234567890 2020-06-12
```

If you add content to the body of the comment, the action will add it as the value of `notes`.

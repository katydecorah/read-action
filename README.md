# read-action

![Test](https://github.com/katydecorah/read-action/workflows/Test/badge.svg?branch=main) [![Read](https://github.com/katydecorah/read-action/actions/workflows/read.yml/badge.svg)](https://github.com/katydecorah/read-action/actions/workflows/read.yml)

This GitHub action tracks the books that you read by updating a JSON file in your repository. Pair it with the [iOS Shortcut](shortcut/README.md) to automatically trigger the action or click **Run workflow** from the Actions tab to submit details about the book.

[Create a workflow dispatch event](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event) with information about the book. The action will then fetch the book's metadata using [node-isbn](https://www.npmjs.com/package/node-isbn) and commit the change in your repository, always sorting by the date you finished the book.

## Book status

There are three statuses a book can have:

1. **want to read** - to mark a book as one that you want to read, do not send a `date-started` or `date-finished` in your payload.
2. **started** - to mark a book as started, add `date-started` in your payload.
3. **finished** - to mark a book as finished, add `date-finished` in your payload.

If you mark a book as "want to read" you can update it to "started" by sending another payload with the same ISBN and `date-started`. Similarily, if you marked a book as "want to read" or "started", send a new payload with the same book ISBN and `date-finished` to mark the book as finished.

<!-- START GENERATED DOCUMENTATION -->

## Set up the workflow

To use this action, create a new workflow in `.github/workflows` and modify it as needed:

```yml
name: read action
run-name: Book (${{ inputs.isbn }})

# Grant the action permission to write to the repository
permissions:
  contents: write

# Trigger the action
on:
  workflow_dispatch:
    inputs:
      isbn:
        description: The book's ISBN. Required.
        required: true
        type: string
      notes:
        description: Notes about the book. Optional.
        type: string
      # Adding a rating is optional.
      # You can change the options to whatever you want to use.
      # For example, you can use numbers, other emoji, or words.
      rating:
        description: Rate the book. Optional.
        type: choice
        default: "unrated"
        options:
          - "unrated"
          - ⭐️
          - ⭐️⭐️
          - ⭐️⭐️⭐️
          - ⭐️⭐️⭐️⭐️
          - ⭐️⭐️⭐️⭐️⭐️
      # Tags are optional.
      tags:
        description: Add tags to categorize the book. Separate each tag with a comma. Optional.
        type: string
      # If you do not submit date-started or date-finished, the book status will be set to "want to read"
      date-started:
        description: Date you started the book (YYYY-MM-DD). Optional.
        type: string
      date-finished:
        description: Date you finished the book (YYYY-MM-DD). Optional.
        type: string

# Set up the steps to run the action
jobs:
  update-library:
    runs-on: macOS-latest
    name: Read
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Read
        uses: katydecorah/read-action@v7.3.0

      - name: Commit updated read file
        run: |
          git pull
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A && git commit -m "📚 “${{ env.BookTitle }}” (${{ env.BookStatus }})"
          git push
```

### Additional example workflows

<details>
<summary>When book is missing metadata, create a pull request</summary>

```yml
name: When book is missing metadata, create a pull request
run-name: Book (${{ inputs.isbn }})

# Grant the action permission to write to the repository
permissions:
  contents: write
  pull-requests: write

# Trigger the action
on:
  workflow_dispatch:
    inputs:
      isbn:
        description: The book's ISBN. Required.
        required: true
        type: string
      notes:
        description: Notes about the book. Optional.
        type: string
      # Adding a rating is optional.
      # You can change the options to whatever you want to use.
      # For example, you can use numbers, other emoji, or words.
      rating:
        description: Rate the book. Optional.
        type: choice
        default: "unrated"
        options:
          - "unrated"
          - ⭐️
          - ⭐️⭐️
          - ⭐️⭐️⭐️
          - ⭐️⭐️⭐️⭐️
          - ⭐️⭐️⭐️⭐️⭐️
      # Tags are optional.
      tags:
        description: Add tags to categorize the book. Separate each tag with a comma. Optional.
        type: string
      # If you do not submit date-started or date-finished, the book status will be set to "want to read"
      date-started:
        description: Date you started the book (YYYY-MM-DD). Optional.
        type: string
      date-finished:
        description: Date you finished the book (YYYY-MM-DD). Optional.
        type: string

# Set up the steps to run the action
jobs:
  update-library:
    runs-on: macOS-latest
    name: Read
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Read
        uses: katydecorah/read-action@v7.3.0

      - name: Download the book thumbnail
        if: env.BookThumbOutput != ''
        run: curl "${{ env.BookThumb }}" -o "img/${{ env.BookThumbOutput }}"

      - name: Commit updated read file
        if: env.BookNeedsReview != 'true' # Do not commit book if it needs review
        run: |
          git pull
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A && git commit -m "📚 “${{ env.BookTitle }}” (${{ env.BookStatus }})"
          git push

      # Create pull request instead of directly committing if book is missing metadata
      # Occasionally, some books returned from node-isbn may be missing a few properties.
      # Add this step to your workflow if you want the ability to fix the missing data by making the action open a new pull request.
      # You can customize the properties that will trigger a pull request with the `required-metadata` input.
      - name: If book needs review, create a pull request to review book metadata
        if: env.BookNeedsReview == 'true'
        run: |
          git config pull.rebase true
          git fetch origin
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git checkout -b review-book-${{env.BookIsbn}}
          git remote set-url origin https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}
          git add -A && git commit -m "📚 “${{ env.BookTitle }}” (${{ env.BookStatus }})" -m "“${{ env.BookTitle }}” is missing the following properties: ${{env.BookMissingMetadata}}. Edit this pull request to add them or merge it in."
          git push --set-upstream origin review-book-${{env.BookIsbn}}
          gh pr create -B main -H "review-book-${{env.BookIsbn}}" --fill
        env:
          GH_TOKEN: ${{ github.token }}
```

</details>

<details>
<summary>Download the book thumbnail</summary>

```yml
name: Download the book thumbnail
run-name: Book (${{ inputs.isbn }})

# Grant the action permission to write to the repository
permissions:
  contents: write

# Trigger the action
on:
  workflow_dispatch:
    inputs:
      isbn:
        description: The book's ISBN. Required.
        required: true
        type: string
      notes:
        description: Notes about the book. Optional.
        type: string
      # Adding a rating is optional.
      # You can change the options to whatever you want to use.
      # For example, you can use numbers, other emoji, or words.
      rating:
        description: Rate the book. Optional.
        type: choice
        default: "unrated"
        options:
          - "unrated"
          - ⭐️
          - ⭐️⭐️
          - ⭐️⭐️⭐️
          - ⭐️⭐️⭐️⭐️
          - ⭐️⭐️⭐️⭐️⭐️
      # Tags are optional.
      tags:
        description: Add tags to categorize the book. Separate each tag with a comma. Optional.
        type: string
      # If you do not submit date-started or date-finished, the book status will be set to "want to read"
      date-started:
        description: Date you started the book (YYYY-MM-DD). Optional.
        type: string
      date-finished:
        description: Date you finished the book (YYYY-MM-DD). Optional.
        type: string

# Set up the steps to run the action
jobs:
  update-library:
    runs-on: macOS-latest
    name: Read
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Read
        uses: katydecorah/read-action@v7.3.0
        with:
          thumbnail-width: 1280

      - name: Download the book thumbnail
        if: env.BookThumbOutput != ''
        run: curl "${{ env.BookThumb }}" -o "img/${{ env.BookThumbOutput }}"

      - name: Commit updated read file
        run: |
          git pull
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A && git commit -m "📚 “${{ env.BookTitle }}” (${{ env.BookStatus }})"
          git push
```

</details>

## Action options

- `filename`: The file where you want to save your books. Default: `_data/read.json`.

- `providers`: Specify the [ISBN providers](https://github.com/palmerabollo/node-isbn#setting-backend-providers) that you want to use, in the order you need them to be invoked. If setting more than one provider, separate each with a comma.

- `time-zone`: Your time zone. Default: `America/New_York`.

- `required-metadata`: Required metadata properties. This can be used to make the action open a pull request if one of these values is missing data in the desired book instead of committing directly to a repository. Default: `title,pageCount,authors,description,thumbnail`.

- `thumbnail-width`: The width of the thumbnail image (for books sourced from Google Books). The default size is 128.

## Trigger the action

To trigger the action, [create a workflow dispatch event](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event) with the following body parameters:

```js
{
  "ref": "main", // Required. The git reference for the workflow, a branch or tag name.
  "inputs": {
    "isbn": "", // Required. The book's ISBN. Required.
    "notes": "", // Notes about the book. Optional.
    "rating": "", // Rate the book. Optional. Default: `unrated`.
    "tags": "", // Add tags to categorize the book. Separate each tag with a comma. Optional.
    "date-started": "", // Date you started the book (YYYY-MM-DD). Optional.
    "date-finished": "", // Date you finished the book (YYYY-MM-DD). Optional.
  }
}
```

<!-- END GENERATED DOCUMENTATION -->

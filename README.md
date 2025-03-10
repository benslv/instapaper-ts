# instapaper-ts

`instapaper-ts` is an type-safe client for [Instapaper](https://instapaper.com).

Supports all available endpoints from the [Full Developer API](https://www.instapaper.com/api)!

---

## Installation

```sh
npm install --save-dev instapaper-ts
```

## Usage

```ts
import { Instapaper } from "instapaper-ts";

const instapaper = new Instapaper(CONSUMER_KEY, CONSUMER_SECRET);

instapaper.setCredentials(USERNAME, PASSWORD);

const bookmarks = await instapaper.bookmarks.list({ limit: 50 });

console.log(bookmarks);
```

## Methods

See [Full API](https://www.instapaper.com/api) documentation for expected parameters and return types.

### Authentication

- setCredentials
- verifyCredentials

### Bookmarks

- list
- updateReadProgress
- add
- delete
- star
- unstar
- archive
- unarchive
- move
- getText

### Folders

- list
- add
- delete
- setOrder

### Highlights

- list
- add
- delete

---

## Terms of Use

Please read the full Instapaper [Terms of Use](https://www.instapaper.com/api/terms) before using this library.

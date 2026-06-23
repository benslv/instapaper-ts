# instapaper

A TypeScript client for the [Instapaper API](https://www.instapaper.com/api).

## Installation

```bash
npm install instapaper-ts
```

## Authentication

Instapaper uses OAuth 1.0a with xAuth. You'll need a **consumer key and secret** from Instapaper, plus your account **username and password** — but only to perform a one-time token exchange. After that, store the token and use it directly for all future requests.

### First run — exchange credentials for a token

Call `Instapaper.fetchToken(...)` to authenticate with your username and password. This performs the xAuth token exchange and returns the result. Once you have the token, persist it so you don't repeat the exchange on every run.

```typescript
import { Instapaper } from "instapaper";

const token = await Instapaper.fetchToken({
	consumerKey: "your_consumer_key",
	consumerSecret: "your_consumer_secret",
	username: "your@email.com",
	password: "your_password",
});

// Persist the token for future use
await saveToken(token); // e.g. write to disk, a secrets store, a session cookie etc.
```

### Subsequent runs — initialise from a cached token

Once you have a token, you can then use it to instantiate the Instapaper client. This allows you to reuse your token in different parts of your app, without having to reauthenticate every time with your username and password.

```typescript
const token = await loadToken();

const client = new Instapaper({
	consumerKey: "your_consumer_key",
	consumerSecret: "your_consumer_secret",
	token,
});
```

## Methods

See the [full API documentation](https://www.instapaper.com/api) for complete parameter and response details.

### Account

| Method                | Description                                   |
| --------------------- | --------------------------------------------- |
| `verifyCredentials()` | Verify the current token and return user info |

### Bookmarks

All bookmark methods are available under `instapaper.bookmarks.*`.

| Method                         | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| `list(params?)`                | List bookmarks; optionally filter by `folder_id`, `limit`, etc. |
| `add(params)`                  | Save a URL as a new bookmark                                    |
| `delete(bookmark_id)`          | Permanently delete a bookmark                                   |
| `updateReadProgress(params)`   | Update the read progress percentage for a bookmark              |
| `star(bookmark_id)`            | Star a bookmark                                                 |
| `unstar(bookmark_id)`          | Unstar a bookmark                                               |
| `archive(bookmark_id)`         | Move a bookmark to the archive                                  |
| `unarchive(bookmark_id)`       | Move a bookmark out of the archive                              |
| `move(bookmark_id, folder_id)` | Move a bookmark to a specific folder                            |
| `getText(bookmark_id)`         | Fetch the processed text content of a bookmark                  |

### Folders

All folder methods are available under `instapaper.folders.*`.

| Method              | Description                         |
| ------------------- | ----------------------------------- |
| `list()`            | List all user-created folders       |
| `add(title)`        | Create a new folder                 |
| `delete(folder_id)` | Delete a folder                     |
| `setOrder(order)`   | Update the display order of folders |

### Highlights

All highlight methods are available under `instapaper.highlights.*`.

| Method                 | Description                        |
| ---------------------- | ---------------------------------- |
| `list(bookmark_id)`    | List all highlights for a bookmark |
| `add(params)`          | Add a highlight to a bookmark      |
| `delete(highlight_id)` | Delete a highlight                 |

---

## Terms of Use

Please review Instapaper's [API Terms of Use](https://www.instapaper.com/api/terms) before using this library.

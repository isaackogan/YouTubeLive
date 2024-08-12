YouTubeLive
==================
A Node.JS library to connect to YouTube stream chats and grab some of that sweet, sweet data.

YouTubeLive is a Node.JS library designed to connect to YouTube livestreams and receive realtime chat events.
This is particularly useful for use cases where YouTube's official API is too permissions-restrictive

> **Warning:**<br/>This is a <u>reverse-engineering</u> project. Unless you are capable of maintaining it, do not use this in production systems. I do fix issues as they arise, but on my own time.

Join the [community discord (yes, TikTokLive Discord)](https://discord.gg/e2XwPNTBBr) and visit
the `#youtube-support` channel for questions, contributions and ideas.


## Table of Contents

- [Getting Started](#getting-started)
- [Licensing](#license)

## Getting Started

1. Install the module via npm from the **Coming Soon** repository

```shell script
npm i youtubelive
```

2. Create your first chat connection

```typescript
import {YouTubeLiveClient, LiveEvent} from "youtubelive";

const client = new YouTubeLiveCient(
    "cheese.whiz"
);

client.on(LiveEvent.CONNECTED, (e: undefined) => {
  console.log('Connected!')
});

```

### Current Events

```typescript
export enum LiveEvent {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
  FETCH_COMMENTS = "fetch_comments",
  COMMENT = "comment",
  EMOJI = "emoji"
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

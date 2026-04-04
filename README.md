# Bok Stavern

Norwegian Scrabble word search tool. Search, find anagrams, and validate words against the official Norwegian Scrabble word list.

**Live site:** [simonliee.github.io/scrabbleOrdbok](https://simonliee.github.io/scrabbleOrdbok/)

## Features

- **Text search** with wildcard support (`?` for any letter)
- **Anagram search** with subset matching
- **Word checker** (no-cheat mode) — validates a single word without revealing others
- Norwegian Scrabble letter scores displayed as tiles
- Filters: word length, must contain, must not contain
- Sort by relevance, alphabetical, score, or length
- Game mode with chess-style clock for two players
- Dark/light theme
- Fully client-side — no backend required

## Tech stack

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Bun

## Development

```sh
bun install
bun dev
```

## Word list

The word list is sourced from [Norsk Scrabbleforbund (NSF)](https://www2.scrabbleforbundet.no/?page_id=1488).

## License

[MIT](LICENSE) — free to use, modify, and distribute with attribution.

## AI disclosure

This project was built with assistance from AI tools.

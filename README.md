# Thumbnail Studio

A small design tool for video thumbnails that runs in the browser. Put down a background, add text and shapes, drag things around, and download a 1280×720 PNG.

**Live demo:** https://motivationp81-star.github.io/thumbnail-studio/

## What it does

- 1280×720 export (the preview stage is smaller, the PNG is full size)
- Solid or gradient backgrounds, or your own photo as the background
- Text with size, colour, outline and bold controls — the bits a thumbnail actually needs
- Rectangles, circles and images as layers
- A layers list, duplicate / reorder / delete, opacity and rotation
- Three starter looks (music video, gaming, vlog) so you are not starting from a blank page

## Run it locally

No build step and no dependencies. Open `index.html` in a browser, or:

```bash
npx serve .
```

## How it is put together

The editor keeps a plain list of items (type, position, size, colours, text) and draws them twice: once as HTML elements on the stage so you can drag them, and once onto a canvas at export time at full resolution. Background photos are drawn with a cover-fit crop on export, same as they appear on the stage.

## Limits

- Text is single-line and centred; this is a thumbnail tool, not a full design suite.
- Fonts are whatever your system has — the export uses Arial as a safe default for the canvas copy.

## License

MIT

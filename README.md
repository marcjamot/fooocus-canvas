# Fooocus Canvas

Create any image you want using an iterative approach. The web-based canvas combines the power and simplicity of [Fooocus](https://github.com/lllyasviel/Fooocus) with a set of common as well as more powerful image editing tools.

## Image editing tools

- Generate image through [Fooocus](https://github.com/lllyasviel/Fooocus). This allows you to create content anywhere on the canvas and respects any image content already there (inpainting).
- **Todo**: Standard image editing tools such as pen, brush, eraser, filling can.
- **Todo**: Powerful selection tools to more eaily replace content.
- **Todo**: Layers with common functionality such as merge and hide.
- **Todo**: Basic filters such as blur and sharpen.
- **Todo**: [Fooocus](https://github.com/lllyasviel/Fooocus) based filters such as upscale, change color, change style.
- **Todo**: Upload or drop your own images on the canvas.
- **Todo**: More advanced control of Fooocus generation.

## Requirements

- Install Node.
- Instance running with [Fooocus](https://github.com/lllyasviel/Fooocus) accessible through the network.

## Running it locally

1. Install packages through `npm i`
2. Copy `.env.example` to `.env` and update the values
3. Run `npm run dev`
4. Visit http://localhost:5173

Alternatively build the production image with Docker and run, remember to set the environment variables listed in `.env.example`.

## License

GNU General Public License v3.0

<script lang="ts">
	import Canvas from "./Canvas.svelte";

	let canvas: Canvas;
	let canvases: (typeof Canvas)[] = [Canvas];
	let index = 0;

	export function draw(path: Path2D, color: string) {
		canvas.draw(path, color);
	}

	export function drawImage(img: CanvasImageSource, x: number, y: number, width: number, height: number) {
		canvas.drawImage(img, x, y, width, height);
	}

	export function erase(path: Path2D) {
		canvas.erase(path);
	}

	export function getImageData(x: number, y: number, width: number, height: number): ImageData {
		return canvas.getImageData(x, y, width, height);
	}

	export function reset() {
		canvas.reset();
	}

	export function redo() {
		canvas.redo();
	}

	export function undo() {
		canvas.undo();
	}
</script>

<div>
	<svelte:component this={canvases[index]} bind:this={canvas} />
</div>

<style>
	div {
		width: 100%;
		height: 100%;
	}
</style>

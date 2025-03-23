<script lang="ts">
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import { devicePixelRatio, innerHeight, innerWidth } from "svelte/reactivity/window";

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D;
	let future: HTMLCanvasElement[] = [];
	let history: HTMLCanvasElement[] = [];
	let lastAction: string | undefined;

	onMount(() => {
		context = canvas.getContext("2d")!;
	});

	$effect(() => {
		if (!browser) return;

		const width = innerWidth.current! * devicePixelRatio.current!;
		const height = innerHeight.current! * devicePixelRatio.current!;

		resize(width, height);
	});

	async function resize(width: number, height: number) {
		const bmp = await createImageBitmap(canvas);
		canvas.width = width;
		canvas.height = height;
		context.drawImage(bmp, 0, 0, width, height);
		context.scale(devicePixelRatio.current || 1, devicePixelRatio.current || 1);
	}

	export function draw(path: Path2D, color: string) {
		if (lastAction !== "draw") saveHistory();
		lastAction = "draw";

		context.globalCompositeOperation = "source-over";
		context.fillStyle = color;
		context.fill(path);
	}

	export function drawImage(img: CanvasImageSource, x: number, y: number, width: number, height: number) {
		saveHistory();
		lastAction = "image";

		context.globalCompositeOperation = "source-over";
		context.drawImage(img, x, y, width, height);
	}

	export function erase(path: Path2D) {
		if (lastAction !== "erase") saveHistory();
		lastAction = "erase";

		context.globalCompositeOperation = "destination-out";
		context.fillStyle = "#000";
		context.fill(path);
	}

	export function getImageData(x: number, y: number, width?: number, height?: number): ImageData {
		if (!width) width = canvas.width;
		if (!height) height = canvas.height;
		const ratio = devicePixelRatio.current || 1;
		return context.getImageData(x * ratio, y * ratio, width * ratio, height * ratio);
	}

	export function putImageData(data: ImageData, x: number, y: number): void {
		saveHistory();
		const ratio = devicePixelRatio.current || 1;
		context.putImageData(data, x * ratio, y * ratio);
	}

	export function grayscale(path: Path2D) {
		if (lastAction !== "grayscale") saveHistory();
		lastAction = "grayscale";

		context.globalCompositeOperation = "saturation";
		context.fillStyle = "#000";
		context.fill(path);
	}

	export function recolor(path: Path2D, color: string) {
		if (lastAction !== "recolor") saveHistory();
		lastAction = "recolor";

		context.globalCompositeOperation = "color";
		context.fillStyle = color;
		context.fill(path);
	}

	export function reset() {
		saveHistory();
		lastAction = "reset";

		context.reset();
		context.scale(devicePixelRatio.current || 1, devicePixelRatio.current || 1);
	}

	export function redo() {
		const futureCanvas = future.shift();
		if (!futureCanvas) return;

		lastAction = undefined;

		const historyCanvas = document.createElement("canvas");
		historyCanvas.width = canvas.width;
		historyCanvas.height = canvas.height;
		const historyCtx = historyCanvas.getContext("2d")!;
		historyCtx.drawImage(canvas, 0, 0);
		history.push(historyCanvas);

		context.reset();
		context.drawImage(futureCanvas, 0, 0, canvas.width, canvas.height);
		context.scale(devicePixelRatio.current || 1, devicePixelRatio.current || 1);
	}

	export function undo() {
		const historyCanvas = history.pop();
		if (!historyCanvas) return;

		lastAction = undefined;

		const futureCanvas = document.createElement("canvas");
		futureCanvas.width = canvas.width;
		futureCanvas.height = canvas.height;
		const futureCtx = futureCanvas.getContext("2d")!;
		futureCtx.drawImage(canvas, 0, 0);
		future.unshift(futureCanvas);

		context.reset();
		context.drawImage(historyCanvas, 0, 0, canvas.width, canvas.height);
		context.scale(devicePixelRatio.current || 1, devicePixelRatio.current || 1);
	}

	function saveHistory() {
		future = [];

		const historyCanvas = document.createElement("canvas");
		historyCanvas.width = canvas.width;
		historyCanvas.height = canvas.height;
		const historyCtx = historyCanvas.getContext("2d")!;
		historyCtx.drawImage(canvas, 0, 0);
		history.push(historyCanvas);

		if (history.length > 10) {
			history.shift();
		}
	}
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>

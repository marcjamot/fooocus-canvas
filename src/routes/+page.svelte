<script lang="ts">
	import type { PageAPI, Tool } from "$lib/models";
	import GenerateAction from "$lib/actions/GenerateAction.svelte";
	import EraseAction from "$lib/actions/EraseAction.svelte";
	import PaintAction from "$lib/actions/PaintAction.svelte";
	import { toolState } from "$lib/states.svelte";

	let canvas: HTMLCanvasElement;
	let history: HTMLCanvasElement[] = [];
	let future: HTMLCanvasElement[] = [];
	let lastAction: "clearRect" | "drawImage" | "drawRect" | undefined;
	let width: number = $state(0);
	let height: number = $state(0);

	const pageAPI = {
		clearRect: (x, y, width, height) => {
			if (lastAction !== "clearRect") {
				saveHistory();
			}

			lastAction = "clearRect";
			const ctx = canvas.getContext("2d")!;
			ctx.clearRect(x, y, width, height);
		},

		drawImage: (img, x, y, width, height) => {
			saveHistory();
			lastAction = "drawImage";
			const ctx = canvas.getContext("2d")!;
			ctx.drawImage(img, x, y, width, height);
		},

		drawRect: (x, y, width, height) => {
			if (lastAction !== "drawRect") {
				saveHistory();
			}

			lastAction = "drawRect";
			const ctx = canvas.getContext("2d")!;
			ctx.fillStyle = "black";
			ctx.fillRect(x, y, width, height);
		},

		getImageData: (x, y, width, height) => {
			const ctx = canvas.getContext("2d")!;
			return ctx.getImageData(x, y, width, height);
		},
	} satisfies PageAPI;

	$effect(() => {
		if (canvas && width && height) {
			(async () => {
				const bmp = await createImageBitmap(canvas);
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d")!;
				ctx.drawImage(bmp, 0, 0, width, height);
			})();
		}
	});

	function onKeyDown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "z") {
			event.preventDefault();
			restoreFuture();
		} else if ((event.metaKey || event.ctrlKey) && event.key === "z") {
			event.preventDefault();
			restoreHistory();
		}
	}

	function restoreFuture() {
		const futureCanvas = future.shift();
		if (!futureCanvas) return;

		lastAction = undefined;

		const historyCanvas = document.createElement("canvas");
		historyCanvas.width = canvas.width;
		historyCanvas.height = canvas.height;
		const historyCtx = historyCanvas.getContext("2d")!;
		historyCtx.drawImage(canvas, 0, 0);
		history.push(historyCanvas);

		const ctx = canvas.getContext("2d")!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(futureCanvas, 0, 0);
	}

	function restoreHistory() {
		const historyCanvas = history.pop();
		if (!historyCanvas) return;

		lastAction = undefined;

		const futureCanvas = document.createElement("canvas");
		futureCanvas.width = canvas.width;
		futureCanvas.height = canvas.height;
		const futureCtx = futureCanvas.getContext("2d")!;
		futureCtx.drawImage(canvas, 0, 0);
		future.unshift(futureCanvas);

		const ctx = canvas.getContext("2d")!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(historyCanvas, 0, 0);
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

	function selectTool(tool: Tool) {
		if (toolState.active === tool.name) {
			toolState.active = undefined;
		} else {
			toolState.active = tool.name;
		}
	}
</script>

<div class="main" bind:clientWidth={width} bind:clientHeight={height}>
	<canvas bind:this={canvas}> </canvas>

	<PaintAction {pageAPI} />
	<EraseAction {pageAPI} />
	<GenerateAction {pageAPI} />

	<div class="tools">
		{#each toolState.tools as tool}
			<div
				class="tool"
				onclick={() => selectTool(tool)}
				onkeydown={() => selectTool(tool)}
				role="button"
				tabindex="0"
				class:active={toolState.active === tool.name}
			>
				<div class="icon">
					<img src={tool.icon} alt={tool.name} />
				</div>
			</div>
		{/each}
	</div>
</div>

<svelte:window onkeydown={onKeyDown} />

<style>
	.main {
		position: relative;
		width: 100dvw;
		height: 100dvh;
		overflow: hidden;

		background:
			-webkit-linear-gradient(
				45deg,
				rgba(0, 0, 0, 0.0980392) 25%,
				transparent 25%,
				transparent 75%,
				rgba(0, 0, 0, 0.0980392) 75%,
				rgba(0, 0, 0, 0.0980392) 0
			),
			-webkit-linear-gradient(
					45deg,
					rgba(0, 0, 0, 0.0980392) 25%,
					transparent 25%,
					transparent 75%,
					rgba(0, 0, 0, 0.0980392) 75%,
					rgba(0, 0, 0, 0.0980392) 0
				),
			white;
		background:
			-moz-linear-gradient(
				45deg,
				rgba(0, 0, 0, 0.0980392) 25%,
				transparent 25%,
				transparent 75%,
				rgba(0, 0, 0, 0.0980392) 75%,
				rgba(0, 0, 0, 0.0980392) 0
			),
			-moz-linear-gradient(
					45deg,
					rgba(0, 0, 0, 0.0980392) 25%,
					transparent 25%,
					transparent 75%,
					rgba(0, 0, 0, 0.0980392) 75%,
					rgba(0, 0, 0, 0.0980392) 0
				),
			white;
		background:
			linear-gradient(
				45deg,
				rgba(0, 0, 0, 0.0980392) 25%,
				transparent 25%,
				transparent 75%,
				rgba(0, 0, 0, 0.0980392) 75%,
				rgba(0, 0, 0, 0.0980392) 0
			),
			linear-gradient(
				45deg,
				rgba(0, 0, 0, 0.0980392) 25%,
				transparent 25%,
				transparent 75%,
				rgba(0, 0, 0, 0.0980392) 75%,
				rgba(0, 0, 0, 0.0980392) 0
			),
			white;
		background-repeat: repeat, repeat;
		background-position:
			0px 0,
			5px 5px;
		-webkit-transform-origin: 0 0 0;
		transform-origin: 0 0 0;
		-webkit-background-origin: padding-box, padding-box;
		background-origin: padding-box, padding-box;
		-webkit-background-clip: border-box, border-box;
		background-clip: border-box, border-box;
		-webkit-background-size:
			10px 10px,
			10px 10px;
		background-size:
			10px 10px,
			10px 10px;
		-webkit-box-shadow: none;
		box-shadow: none;
		text-shadow: none;
		-webkit-transition: none;
		-moz-transition: none;
		-o-transition: none;
		transition: none;
		-webkit-transform: scaleX(1) scaleY(1) scaleZ(1);
		transform: scaleX(1) scaleY(1) scaleZ(1);
	}

	canvas {
		width: 100%;
		height: 100%;
	}

	.tools {
		position: absolute;
		top: 8px;
		left: 8px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.tool {
		padding: 8px;
		border: 1px solid black;
		border-radius: 8px;
		background-color: white;
		box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	.tool.active {
		background-color: #79c7ff;
		border: 1px solid #01406d;
		color: white;
	}

	.tool .icon {
		width: 2rem;
		height: 2rem;
	}
</style>

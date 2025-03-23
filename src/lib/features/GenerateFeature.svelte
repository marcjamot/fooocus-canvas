<script lang="ts">
	import type { LayerAPI, Selection } from "$lib/models";
	import { onMount, type ComponentProps } from "svelte";
	import Generation from "./Generation.svelte";
	import { toolState } from "$lib/states.svelte";
	import { bestResolution, PerformanceValues, type Performance } from "$lib/fooocus";

	const { layerAPI }: { layerAPI: LayerAPI } = $props();

	const NAME = "Generate Image";

	let dragging = false;
	let selection = $state<Selection>(undefined);
	let selectionDiv: HTMLDivElement;
	let generations: Record<string, ComponentProps<typeof Generation>> = $state({});
	let performance = $state<Performance>("Extreme Speed");
	let text = $state("A cat with a hat");
	let working = $state(false);

	let active = $derived(toolState.active === NAME);
	let canGenerate = $derived(
		!working && selection?.type === "progress" && Math.abs(selection.ex - selection.sx) * Math.abs(selection.ey - selection.sy) > 1024,
	);

	onMount(() => {
		toolState.tools = [
			...toolState.tools,
			{
				icon: "/icons/magic.svg",
				name: NAME,
			},
		];
	});

	$effect(() => {
		if (selectionDiv && selection?.type === "progress") {
			const { sx, sy, ex, ey } = selection;
			const width = Math.abs(sx - ex);
			const height = Math.abs(sy - ey);

			let x = sx < ex ? sx : sx - width;
			let y = sy < ey ? sy : sy - height;

			selectionDiv.style.top = `${y}px`;
			selectionDiv.style.left = `${x}px`;
			selectionDiv.style.width = `${width}px`;
			selectionDiv.style.height = `${height}px`;
		}
	});

	async function generate() {
		if (selection?.type !== "progress") return;

		const api = layerAPI.activeCanvas();

		working = true;

		const id = `${Math.random() * 1000000}`;
		const { sx, sy, ex, ey } = selection;
		const width = Math.abs(sx - ex);
		const height = Math.abs(sy - ey);
		const x = Math.min(sx, ex);
		const y = Math.min(sy, ey);
		const resolution = bestResolution(width, height);

		// Keep context from surrounding image if any
		const imageData = api.getImageData(x, y, width, height);
		const hasData = imageData.data.some((d) => d > 0);

		let inpaint: { image: string; mask: string } | null = null;
		if (hasData) {
			const imageCanvas = document.createElement("canvas");
			imageCanvas.width = imageData.width;
			imageCanvas.height = imageData.height;
			const imageCtx = imageCanvas.getContext("2d")!;
			imageCtx.putImageData(imageData, 0, 0);

			const scaledImageCanvas = document.createElement("canvas");
			scaledImageCanvas.width = resolution.w;
			scaledImageCanvas.height = resolution.h;
			const scaledImageCtx = scaledImageCanvas.getContext("2d")!;
			scaledImageCtx.drawImage(imageCanvas, 0, 0, imageData.width, imageData.height, 0, 0, resolution.w, resolution.h);
			const image = scaledImageCanvas.toDataURL("image/png");

			// Mask
			const maskCanvas = document.createElement("canvas");
			maskCanvas.width = imageData.width;
			maskCanvas.height = imageData.height;
			const maskCtx = maskCanvas.getContext("2d")!;
			const maskData = maskCtx.getImageData(0, 0, imageData.width, imageData.height);
			for (let i = 0; i < maskData.data.length; i += 4) {
				if (imageData.data[i + 3] > 0) {
					maskData.data[i] = 0;
					maskData.data[i + 1] = 0;
					maskData.data[i + 2] = 0;
					maskData.data[i + 3] = 0;
				} else {
					maskData.data[i] = 255;
					maskData.data[i + 1] = 255;
					maskData.data[i + 2] = 255;
					maskData.data[i + 3] = 255;
				}
			}
			maskCtx.putImageData(maskData, 0, 0);

			const scaledMaskCanvas = document.createElement("canvas");
			scaledMaskCanvas.width = resolution.w;
			scaledMaskCanvas.height = resolution.h;
			const scaledMaskCtx = scaledMaskCanvas.getContext("2d")!;
			scaledMaskCtx.drawImage(maskCanvas, 0, 0, imageData.width, imageData.height, 0, 0, resolution.w, resolution.h);
			const mask = scaledMaskCanvas.toDataURL("image/png");

			inpaint = {
				image: image,
				mask: mask,
			};
		}

		const generation: ComponentProps<typeof Generation> = {
			text: text,
			width: width,
			height: height,
			x: x,
			y: y,
			performance: performance,
			resolution: resolution,
			inpaint: inpaint,
			done: async (data) => {
				const image = new Image();
				image.onload = () => {
					api.drawImage(image, x, y, width, height);
				};
				image.src = data;

				delete generations[id];
				generations = generations;
				working = false;
			},
		};
		generations[id] = generation;
		generations = generations;
		selection = undefined;
	}

	function onPointerDown(ev: PointerEvent) {
		dragging = true;
		selection = {
			type: "start",
			sx: Math.floor(ev.x),
			sy: Math.floor(ev.y),
		};
	}

	function onPointerMove(ev: PointerEvent) {
		if (!dragging) return;
		if (!selection) return;

		selection = {
			type: "progress",
			sx: selection.sx,
			sy: selection.sy,
			ex: Math.floor(ev.x),
			ey: Math.floor(ev.y),
		};
	}

	function onPointerUp(ev: PointerEvent) {
		dragging = false;
	}
</script>

{#each Object.values(generations) as generation}
	<Generation {...generation} />
{/each}
<div
	class="backdrop"
	class:display-none={!active}
	onpointerdown={(e) => onPointerDown(e)}
	onpointermove={(e) => onPointerMove(e)}
	onpointerup={(e) => onPointerUp(e)}
></div>
<div
	class="selection"
	class:display-none={!active}
	class:disabled={selection?.type !== "progress"}
	class:lowres={selection?.type === "progress" && Math.abs(selection.sx - selection.ex) * Math.abs(selection.sy - selection.ey) > 600000}
	bind:this={selectionDiv}
></div>
<div class="actions" class:display-none={!active}>
	<div class="action">
		<span>Prompt</span>
		<input type="text" bind:value={text} />
	</div>
	<div class="action">
		<span>Quality</span>
		{#each PerformanceValues as value}
			<label>
				<input type="radio" {value} bind:group={performance} />
				{value}
			</label>
		{/each}
	</div>
	<div class="action">
		<button onclick={generate} disabled={!canGenerate}>Generate</button>
	</div>
	<!-- {#if selection?.type === 'progress'}
		<p>Width: {Math.abs(selection.sx - selection.ex)}</p>
		<p>Height: {Math.abs(selection.sy - selection.ey)}</p>
	{/if} -->
</div>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.selection {
		position: absolute;
		pointer-events: none;
		backdrop-filter: blur(10px);
		background-color: #ffffff33;

		background-image:
			linear-gradient(90deg, #454545 50%, transparent 50%), linear-gradient(90deg, #454545 50%, transparent 50%),
			linear-gradient(0deg, #454545 50%, transparent 50%), linear-gradient(0deg, #454545 50%, transparent 50%);
		background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
		background-size:
			15px 2px,
			15px 2px,
			2px 15px,
			2px 15px;
		background-position:
			left top,
			right bottom,
			left bottom,
			right top;
		animation: border-dance 1s infinite linear;
	}

	.selection.lowres {
		background-image:
			linear-gradient(90deg, #a60000 50%, transparent 50%), linear-gradient(90deg, #a60000 50%, transparent 50%),
			linear-gradient(0deg, #a60000 50%, transparent 50%), linear-gradient(0deg, #a60000 50%, transparent 50%);
	}

	@keyframes border-dance {
		0% {
			background-position:
				left top,
				right bottom,
				left bottom,
				right top;
		}

		100% {
			background-position:
				left 15px top,
				right 15px bottom,
				left bottom 15px,
				right top 15px;
		}
	}

	.selection.disabled {
		display: none;
	}
</style>

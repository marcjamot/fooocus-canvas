<script lang="ts">
	import { onMount } from "svelte";
	import ColorPicker from "svelte-awesome-color-picker";
	import type { LayerAPI } from "$lib/models";
	import { toolState } from "$lib/states.svelte";

	const { layerAPI }: { layerAPI: LayerAPI } = $props();

	const ACTIONS = ["Paint", "Grayscale", "Recolor"] as const;
	const BRUSH_TYPES = ["● Circle", "■ Square"] as const;
	const NAME = "Paint";

	let action = $state<(typeof ACTIONS)[number]>("Paint");
	let active = $derived(toolState.active === NAME);
	let brush = $state<(typeof BRUSH_TYPES)[number]>("● Circle");
	let color = $state("#000");
	let dragging = $state(false);
	let pointerCanvas: HTMLCanvasElement;
	let size = $state(80);
	let x = $state(0);
	let y = $state(0);

	onMount(() => {
		toolState.tools = [
			...toolState.tools,
			{
				icon: "/icons/brush.svg",
				name: NAME,
			},
		];
	});

	$effect(() => {
		pointerCanvas.width = size;
		pointerCanvas.height = size;
		const context = pointerCanvas.getContext("2d")!;
		const path = pathToRender(0, 0, size, size);
		context.fillStyle = color;
		context.fill(path);
	});

	function onPointerDown(ev: PointerEvent) {
		if (!active) return;

		dragging = true;
		x = ev.x;
		y = ev.y;

		const path = pathToRender(x - size / 2, y - size / 2, size, size);
		takeAction(path);
	}

	function onPointerMove(ev: PointerEvent) {
		if (!active) return;

		x = ev.x;
		y = ev.y;

		if (!dragging) return;

		const path = pathToRender(x - size / 2, y - size / 2, size, size);
		takeAction(path);
	}

	function onPointerUp(ev: PointerEvent) {
		dragging = false;
	}

	function pathToRender(x: number, y: number, width: number, height: number): Path2D {
		const path = new Path2D();
		switch (brush) {
			case "● Circle":
				path.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
				break;
			case "■ Square":
				path.rect(x, y, width, height);
				break;
			default:
				brush satisfies never;
		}
		return path;
	}

	function takeAction(path: Path2D) {
		const api = layerAPI.activeCanvas();
		switch (action) {
			case "Grayscale":
				api.grayscale(path);
				break;
			case "Paint":
				api.draw(path, color);
				break;
			case "Recolor":
				api.recolor(path, color);
				break;
			default:
				action satisfies never;
		}
	}
</script>

<div
	class="backdrop"
	class:display-none={!active}
	onpointerdown={(e) => onPointerDown(e)}
	onpointermove={(e) => onPointerMove(e)}
	onpointerup={(e) => onPointerUp(e)}
></div>
<canvas
	class="pointer"
	class:display-none={!active || (x === 0 && y === 0)}
	style="top: {y - size / 2}px; left: {x - size / 2}px; width: {size}px; height: {size}px;"
	bind:this={pointerCanvas}
></canvas>
<div class="actions" class:display-none={!active}>
	<div class="action">
		<span>Action:</span>
		{#each ACTIONS as actionType}
			<label>
				<input type="radio" value={actionType} bind:group={action} />
				{actionType}
			</label>
		{/each}
	</div>
	<div class="action">
		<span>Brush type:</span>
		{#each BRUSH_TYPES as brushType}
			<label>
				<input type="radio" value={brushType} bind:group={brush} />
				{brushType}
			</label>
		{/each}
	</div>
	<div style="margin: 0 -10px -10px;">
		<ColorPicker bind:hex={color} isDialog={false} />
	</div>
	<div class="action">
		<span>Brush size: {size}px</span>
		<input type="range" min={1} max={512} bind:value={size} />
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.pointer {
		pointer-events: none;
		position: absolute;
		background-color: transparent;
	}
</style>

<script lang="ts">
	import type { PageAPI } from "$lib/models";
	import { onMount } from "svelte";
	import { toolState } from "$lib/states.svelte";

	const { pageAPI }: { pageAPI: PageAPI } = $props();

	const NAME = "Paint";

	let active = $derived(toolState.active === NAME);
	let dragging = $state(false);
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

	function onPointerDown(ev: PointerEvent) {
		if (!active) return;

		dragging = true;
		x = ev.x;
		y = ev.y;

		pageAPI.drawRect(x - size / 2, y - size / 2, size, size);
	}

	function onPointerMove(ev: PointerEvent) {
		if (!active) return;

		x = ev.x;
		y = ev.y;

		if (!dragging) return;

		pageAPI.drawRect(x - size / 2, y - size / 2, size, size);
	}

	function onPointerUp(ev: PointerEvent) {
		dragging = false;
	}
</script>

<div
	class="backdrop"
	class:display-none={!active}
	onpointerdown={(e) => onPointerDown(e)}
	onpointermove={(e) => onPointerMove(e)}
	onpointerup={(e) => onPointerUp(e)}
></div>
<div
	class="eraser"
	class:display-none={!active || (x === 0 && y === 0)}
	style="top: {y - size / 2}px; left: {x - size / 2}px; width: {size}px; height: {size}px;"
></div>
<div class="action" class:display-none={!active}>
	<input type="range" min={1} max={512} bind:value={size} />
</div>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.eraser {
		pointer-events: none;
		position: absolute;
		border: 1px solid white;
		background-color: black;
	}
</style>

<script lang="ts">
	import type { PageAPI } from '$lib/models';
	import { onMount } from 'svelte';
	import { toolState } from '$lib/states.svelte';

	const { pageAPI }: { pageAPI: PageAPI } = $props();

	const NAME = 'Erase';
    const SIZE = 80;

	let active = $derived(toolState.active === NAME);
	let dragging = $state(false);
	let x = $state(0);
	let y = $state(0);

	onMount(() => {
		toolState.tools = [
			...toolState.tools,
			{
				icon: '/icons/erase.svg',
				name: NAME
			}
		];
	});

	function onPointerDown(ev: PointerEvent) {
		if (!active) return;

		dragging = true;
		x = ev.x;
		y = ev.y;

		pageAPI.clearRect(x - SIZE/2, y - SIZE/2, SIZE, SIZE);
	}

	function onPointerMove(ev: PointerEvent) {
		if (!active) return;

		x = ev.x;
		y = ev.y;

		if (!dragging) return;

		pageAPI.clearRect(x - SIZE/2, y - SIZE/2, SIZE, SIZE);
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
	style="top: {y - SIZE/2}px; left: {x - SIZE/2}px; width: {SIZE}px; height: {SIZE}px;"
></div>

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

<script lang="ts">
	import { mount, onDestroy, onMount, unmount } from "svelte";
	import Canvas from "./Canvas.svelte";
	import type { CanvasAPI } from "./models";

	let canvases = $state<Canvas[]>([]);
	let canvasesDiv: HTMLDivElement;
	let index = $state(0);

	onMount(() => {
		for (let i = 0; i < 3; i += 1) {
			const canvas = mount(Canvas, { target: canvasesDiv });
			canvases.push(canvas);
		}
	});

	onDestroy(() => {
		for (const canvas of canvases) {
			unmount(canvas);
		}
		canvases = [];
	});

	export function activeCanvas(): CanvasAPI {
		return canvases[index];
	}
</script>

<div class="canvases" bind:this={canvasesDiv}></div>
<div class="layers">
	{#each canvases as _canvas, i}
		<div class="layer" onclick={() => (index = i)} onkeydown={() => (index = i)} role="button" tabindex="0" class:active={i === index}>
			<div class="icon">
				<img src={"/icons/brush.svg"} alt={"tool.name"} />
			</div>
		</div>
	{/each}
</div>

<style>
	.canvases {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.layers {
		position: absolute;
		bottom: 8px;
		right: 8px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.layer {
		z-index: 1;
		padding: 8px;
		border: 1px solid black;
		border-radius: 8px;
		background-color: white;
		box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	.layer.active {
		background-color: #79c7ff;
		border: 1px solid #01406d;
		color: white;
	}

	.layer .icon {
		width: 2rem;
		height: 2rem;
	}
</style>

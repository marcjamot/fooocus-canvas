<script lang="ts">
	import { mount, onDestroy, onMount, unmount } from "svelte";
	import Canvas from "./Canvas.svelte";
	import type { CanvasAPI } from "./models";
	import DragList, { type SnippetProps } from "./DragList.svelte";

	let canvases: Canvas[] = [];
	let canvasesData = $state<{ name: string }[]>([]);
	let canvasesDiv: HTMLDivElement;
	let increment = 0;
	let index = $state(0);
	let transparency = $state(false);

	onMount(() => {
		addLayer();
	});

	onDestroy(() => {
		canvases = [];
	});

	$effect(() => {
		for (let i = 0; i < canvasesDiv.children.length; i += 1) {
			const child = canvasesDiv.children[i];
			child.classList.remove("transparent");
			if (transparency && index !== i) {
				child.classList.add("transparent");
			}
		}
	});

	export function activeCanvas(): CanvasAPI {
		return canvases[index];
	}

	function addLayer() {
		const canvas = mount(Canvas, { target: canvasesDiv });
		canvases.push(canvas);
		canvasesData.push({ name: `${increment++}` });
		index = canvases.length - 1;
	}

	function destroyLayer(position: number) {
		const removed = canvases.splice(position, 1);
		canvasesData.splice(position, 1);
		unmount(removed[0]);
		if (canvases.length === 0) addLayer();
		if (index === canvases.length) index -= 1;
	}

	function mergeLayer(sourcePosition: number, targetPosition: number) {
		const cU = canvases[sourcePosition];
		const cL = canvases[targetPosition];

		const dU = cU.getImageData(0, 0);
		const dL = cL.getImageData(0, 0);

		const dM = new ImageData(dL.width, dL.height);
		for (let i = 0; i < dM.data.length; i += 4) {
			const alpha = dU.data[i + 3] / 255;

			dM.data[i] = dU.data[i] * alpha + dL.data[i] * (1 - alpha);
			dM.data[i + 1] = dU.data[i + 1] * alpha + dL.data[i + 1] * (1 - alpha);
			dM.data[i + 2] = dU.data[i + 2] * alpha + dL.data[i + 2] * (1 - alpha);
			dM.data[i + 3] = dU.data[i + 3] + dL.data[i + 3] * (1 - alpha);
		}

		cL.putImageData(dM, 0, 0);
		destroyLayer(sourcePosition);
	}

	function moveLayer(oldPosition: number, newPosition: number) {
		if (oldPosition === newPosition) return;
		let currentIndex = index;
		if (currentIndex === oldPosition) {
			currentIndex = newPosition;
		} else if (oldPosition < currentIndex && newPosition >= currentIndex) {
			currentIndex -= 1;
		} else if (oldPosition > currentIndex && newPosition <= currentIndex) {
			currentIndex += 1;
		}

		const f = oldPosition < newPosition ? moveLayerUp : moveLayerDown;

		index = oldPosition;
		for (let i = 0; i < Math.abs(newPosition - oldPosition); i += 1) {
			f();
		}
		index = currentIndex;
	}

	function moveLayerDown() {
		if (canvases.length === 1) return;
		if (index === 0) return;

		const currentCanvas = canvases[index];
		const lowerCanvas = canvases[index - 1];

		const currentData = currentCanvas.getImageData(0, 0);
		const lowerData = lowerCanvas.getImageData(0, 0);

		currentCanvas.putImageData(lowerData, 0, 0);
		lowerCanvas.putImageData(currentData, 0, 0);

		[canvasesData[index], canvasesData[index - 1]] = [canvasesData[index - 1], canvasesData[index]];

		index = index - 1;
	}

	function moveLayerUp() {
		if (canvases.length === 1) return;
		if (index === canvases.length - 1) return;

		const currentCanvas = canvases[index];
		const upperCanvas = canvases[index + 1];

		const currentData = currentCanvas.getImageData(0, 0);
		const upperData = upperCanvas.getImageData(0, 0);

		currentCanvas.putImageData(upperData, 0, 0);
		upperCanvas.putImageData(currentData, 0, 0);

		[canvasesData[index], canvasesData[index + 1]] = [canvasesData[index + 1], canvasesData[index]];

		index = index + 1;
	}

	function selectLayer(i: number) {
		if (index === i) {
			transparency = !transparency;
		}

		index = i;
	}
</script>

<div class="canvases" bind:this={canvasesDiv}></div>
<div class="layers">
	{#snippet snippet(props: SnippetProps<{ name: string }>)}
		{#if props.item.name === "add"}
			<div class="layer" class:target={props.isTarget} onclick={addLayer}>
				<span>{props.anyDragging ? "-" : "+"}</span>
			</div>
		{:else}
			<div class="layer" class:active={index === props.position} class:target={props.isTarget} onclick={() => selectLayer(props.position)}>
				<span>{props.item.name}</span>
			</div>
		{/if}
	{/snippet}
	<DragList
		items={[...canvasesData.map((d) => ({ draggable: true, name: d.name })), { draggable: false, name: "add" }]}
		{snippet}
		ondrop={(_sourceItem, sourcePosition, targetItem, targetPosition) => {
			if (targetItem.name === "add") {
				destroyLayer(sourcePosition);
			} else {
				mergeLayer(sourcePosition, targetPosition);
			}
		}}
		onmove={(_sourceItem, oldPosition, newPosition) => {
			moveLayer(oldPosition, newPosition);
		}}
	/>
</div>

<style>
	.canvases {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.layers {
		z-index: 1;
		position: absolute;
		bottom: 8px;
		display: flex;
	}

	.layer {
		position: relative;
		margin-left: 8px;
		padding: 8px 24px;
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

	.layer.target {
		background-color: #de2424;
	}
</style>

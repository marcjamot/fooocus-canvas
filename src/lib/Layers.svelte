<script lang="ts">
	import { mount, onDestroy, onMount, unmount } from "svelte";
	import Canvas from "./Canvas.svelte";
	import type { CanvasAPI } from "./models";

	let canvases: Canvas[] = [];
	let canvasesDiv: HTMLDivElement;
	let count = $state(0);
	let index = $state(0);

	onMount(() => {
		addLayer();
	});

	onDestroy(() => {
		canvases = [];
	});

	export function activeCanvas(): CanvasAPI {
		return canvases[index];
	}

	function addLayer() {
		const canvas = mount(Canvas, { target: canvasesDiv });
		canvases.push(canvas);
		count += 1;
	}

	function destroyLayer() {
		const removed = canvases.splice(index, 1);
		unmount(removed[0]);
		count -= 1;
		if (count === 0) addLayer();
		if (index === count) index -= 1;
	}

	function duplicateLayer() {
		const currentCanvas = canvases[index];
		const currentData = currentCanvas.getImageData(0, 0);

		const canvas = mount(Canvas, { target: canvasesDiv });
		setTimeout(() => {
			canvas.putImageData(currentData, 0, 0);
		}, 1);
		canvases.push(canvas);
		count += 1;
	}

	function mergeLayer() {
		if (canvases.length === 1) return;
		if (index === 0) return;

		const cU = canvases[index];
		const cL = canvases[index - 1];

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
		destroyLayer();
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

		index = index + 1;
	}
</script>

<div class="canvases" bind:this={canvasesDiv}></div>
<div class="layer-actions">
	<div
		class="layer-action"
		onclick={duplicateLayer}
		onkeydown={(e) => {
			if (e.key === "Enter") duplicateLayer();
		}}
		role="button"
		tabindex="0"
	>
		<div class="icon">
			{"D"}
			<img src={"/icons/brush.svg"} alt={"tool.name"} />
		</div>
	</div>
	<div
		class="layer-action"
		onclick={addLayer}
		onkeydown={(e) => {
			if (e.key === "Enter") addLayer();
		}}
		role="button"
		tabindex="0"
	>
		<div class="icon">
			{"+"}
			<img src={"/icons/brush.svg"} alt={"tool.name"} />
		</div>
	</div>
	<div
		class="layer-action"
		onclick={destroyLayer}
		onkeydown={(e) => {
			if (e.key === "Enter") destroyLayer();
		}}
		role="button"
		tabindex="0"
	>
		<div class="icon">
			{"-"}
			<img src={"/icons/brush.svg"} alt={"tool.name"} />
		</div>
	</div>
	<div
		class="layer-action"
		onclick={mergeLayer}
		onkeydown={(e) => {
			if (e.key === "Enter") mergeLayer();
		}}
		role="button"
		tabindex="0"
	>
		<div class="icon">
			{"M"}
			<img src={"/icons/brush.svg"} alt={"tool.name"} />
		</div>
	</div>
	<div
		class="layer-action"
		onclick={moveLayerUp}
		onkeydown={(e) => {
			if (e.key === "Enter") moveLayerUp();
		}}
		role="button"
		tabindex="0"
	>
		<div class="icon">
			{"^"}
			<img src={"/icons/brush.svg"} alt={"tool.name"} />
		</div>
	</div>
	<div
		class="layer-action"
		onclick={moveLayerDown}
		onkeydown={(e) => {
			if (e.key === "Enter") moveLayerDown();
		}}
		role="button"
		tabindex="0"
	>
		<div class="icon">
			{"v"}
			<img src={"/icons/brush.svg"} alt={"tool.name"} />
		</div>
	</div>
</div>
<div class="layers">
	{#each Array(count) as _n, i}
		<div
			class="layer"
			onclick={() => (index = i)}
			onkeydown={(e) => {
				if (e.key === "Enter") {
					index = i;
				}
			}}
			role="button"
			tabindex="0"
			class:active={i === index}
		>
			<div class="icon">
				{i}
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

	.layer-actions {
		position: absolute;
		bottom: 8px;
		right: 68px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.layer-action {
		z-index: 1;
		padding: 8px;
		border: 1px solid black;
		border-radius: 8px;
		background-color: white;
		box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	.layers {
		position: absolute;
		bottom: 8px;
		right: 8px;
		display: flex;
		flex-direction: column-reverse;
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

	.icon {
		width: 2rem;
		height: 2rem;
	}
</style>

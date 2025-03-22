<script lang="ts">
	import { onMount, type ComponentProps } from 'svelte';
	import Generation from './Generation.svelte';

	/**
	 * TODO:
	 * - drag to move?
	 * - layers?
	 */

	let canvas: HTMLCanvasElement;
	let dragging = false;
	let selection:
		| {
				type: 'start';
				sx: number;
				sy: number;
		  }
		| {
				type: 'progress';
				sx: number;
				sy: number;
				ex: number;
				ey: number;
		  }
		| undefined;
	let selectionDiv: HTMLDivElement;
	let text = '';
	let generations: Record<string, ComponentProps<typeof Generation>> = {};
	let width: number;
	let height: number;

	$: if (canvas) {
		canvas.width = width;
		canvas.height = height;
	}

	$: if (selectionDiv && selection?.type === 'progress') {
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

	async function generate() {
		if (selection?.type !== 'progress') return;

		const { sx, sy, ex, ey } = selection;
		const id = `${Math.random() * 1000000}`;

		const width = Math.abs(sx - ex);
		const height = Math.abs(sy - ey);
		const x = Math.min(sx, ex);
		const y = Math.min(sy, ey);

		// Keep context from surrounding image if any
		const ctx = canvas.getContext('2d')!;
		const imageData = ctx.getImageData(x, y, width, height);
		const hasData = imageData.data.some((d) => d > 0);

		let inpaint: { image: string; mask: string } | null = null;

		if (hasData) {
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = width;
			tempCanvas.height = height;
			const tempCtx = tempCanvas.getContext('2d')!;
			tempCtx.putImageData(imageData, 0, 0);
			const image = tempCanvas.toDataURL('image/png');

			// Mask
			const maskCanvas = document.createElement('canvas');
			maskCanvas.width = width;
			maskCanvas.height = height;
			const maskCtx = maskCanvas.getContext('2d')!;
			const maskData = maskCtx.getImageData(0, 0, width, height);
			for (let i = 0; i < maskData.data.length; i += 4) {
				// If pixel has meaningful data (alpha > 0), make it black in the mask
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
			const mask = maskCanvas.toDataURL('image/png');

			inpaint = {
				image: image,
				mask: mask
			};
		}

		const generation: ComponentProps<typeof Generation> = {
			text: text,
			width: width,
			height: height,
			x: x,
			y: y,
			inpaint: inpaint,
			done: (img) => {
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, x, y, width, height);
				delete generations[id];
				generations = generations;
			}
		};
		generations[id] = generation;
		generations = generations;

		selection = undefined;
	}

	function erase() {
		if (selection?.type !== 'progress') return;

		const { sx, sy, ex, ey } = selection;

		const width = Math.abs(sx - ex);
		const height = Math.abs(sy - ey);
		const x = Math.min(sx, ex);
		const y = Math.min(sy, ey);

		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(x, y, width, height);

		selection = undefined;
	}

	function onPointerDown(ev: PointerEvent) {
		console.log('DOWN');
		dragging = true;
		selection = {
			type: 'start',
			sx: Math.floor(ev.x),
			sy: Math.floor(ev.y)
		};
	}

	function onPointerMove(ev: PointerEvent) {
		if (!dragging) return;
		if (!selection) return;
		console.log('MOVE');

		selection = {
			type: 'progress',
			sx: selection.sx,
			sy: selection.sy,
			ex: Math.floor(ev.x),
			ey: Math.floor(ev.y)
		};
	}

	function onPointerUp(ev: PointerEvent) {
		console.log('UP');
		dragging = false;
	}
</script>

<div class="main" bind:clientWidth={width} bind:clientHeight={height}>
	<canvas
		bind:this={canvas}
		on:pointerdown={(e) => onPointerDown(e)}
		on:pointermove={(e) => onPointerMove(e)}
		on:pointerup={(e) => onPointerUp(e)}
	>
	</canvas>
	<div class="menu">
		<input type="text" bind:value={text} />
		<button on:click={generate}>Generate</button>
		<button on:click={erase}>Erase</button>
		<!-- <img src={imgsrc} alt="" width="100px" height="100px" /> -->
	</div>
	{#each Object.values(generations) as generation}
		<Generation {...generation} />
	{/each}
	<div
		class="selection"
		class:disabled={selection?.type !== 'progress'}
		bind:this={selectionDiv}
	></div>
</div>

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

	.menu {
		position: absolute;
		top: 8px;
		right: 8px;
		padding: 16px;
		border: 1px dashed white;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
	}

	canvas {
		width: 100%;
		height: 100%;
	}

	.selection {
		position: absolute;
		background-color: #ff000044;
		pointer-events: none;
	}

	.selection.disabled {
		display: none;
	}
</style>

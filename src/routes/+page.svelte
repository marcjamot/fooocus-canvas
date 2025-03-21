<script lang="ts">
	import { Application, Graphics } from 'pixi.js';
	import { onMount, type ComponentProps } from 'svelte';
	import Generation from './Generation.svelte';

	/**
	 * TODO:
	 * - render generated images to background canvas
	 * - include image data for generation
	 * - add eraser to remove image data
	 * - drag to move?
	 * - layers?
	 */

	let app: Application;
	let dragging = false;
	let main: HTMLDivElement;
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
	let selectionGraphics: Graphics;
	let text = '';
	let generations: Record<string, ComponentProps<typeof Generation>> = {};

	$: if (selection?.type === 'progress') {
		const { sx, sy, ex, ey } = selection;
		const width = Math.abs(sx - ex);
		const height = Math.abs(sy - ey);

		let x = sx < ex ? sx : sx - width;
		let y = sy < ey ? sy : sy - height;

		selectionGraphics.clear();
		selectionGraphics.rect(x, y, width, height).fill('#ff000044');
	} else if (selectionGraphics) {
		selectionGraphics.clear();
	}

	onMount(async () => {
		app = new Application();
		await app.init({ backgroundAlpha: 0, resizeTo: main });

		selectionGraphics = new Graphics();
		app.stage.addChild(selectionGraphics);

		app.canvas.addEventListener('pointerdown', onPointerDown);
		app.canvas.addEventListener('pointerup', onPointerUp);
		app.canvas.addEventListener('pointermove', onPointerMove);

		main.appendChild(app.canvas);
	});

	async function generate() {
		if (selection?.type !== 'progress') return;
		const { sx, sy, ex, ey } = selection;
		const id = `${Math.random() * 1000000}`;

		const generation: ComponentProps<typeof Generation> = {
			app: app,
			text: text,
			width: Math.abs(sx - ex),
			height: Math.abs(sy - ey),
			x: Math.min(sx, ex),
			y: Math.min(sy, ey),
			done: () => {
				delete generations[id];
			}
		};
		generations[id] = generation;
	}

	function onPointerDown(ev: PointerEvent) {
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

		selection = {
			type: 'progress',
			sx: selection.sx,
			sy: selection.sy,
			ex: Math.floor(ev.x),
			ey: Math.floor(ev.y)
		};
	}

	function onPointerUp(ev: PointerEvent) {
		dragging = false;
	}
</script>

<div class="main" bind:this={main}>
	<div class="menu">
		<input type="text" bind:value={text} />
		<button on:click={generate}>Do it</button>
		<!-- <img src={imgsrc} alt="" width="100px" height="100px" /> -->
	</div>
	{#each Object.values(generations) as generation}
		<Generation {...generation} />
	{/each}
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
</style>

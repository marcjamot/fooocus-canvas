<script lang="ts">
	import type { PageAPI, Selection, Tool } from '$lib/models';
	import GenerateAction from '$lib/actions/GenerateAction.svelte';
	import { toolState } from '$lib/states.svelte';

	let canvas: HTMLCanvasElement;
	let dragging = false;
	let selection: Selection = $state(undefined);
	let selectionDiv: HTMLDivElement;
	let width: number = $state(0);
	let height: number = $state(0);

	const pageAPI = {
		drawImage: (img, x, y, width, height) => {
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, x, y, width, height);
		},

		getImageData: (x, y, width, height) => {
			const ctx = canvas.getContext('2d')!;
			return ctx.getImageData(x, y, width, height);
		},

		getSelection: () => {
			return selection;
		},

		setSelection: (newSelection) => {
			selection = newSelection;
		}
	} satisfies PageAPI;

	$effect(() => {
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}
	});

	$effect(() => {
		if (selectionDiv && selection?.type === 'progress') {
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

	function selectTool(tool: Tool) {
		if (toolState.active === tool.name) {
			toolState.active = undefined;
		} else {
			toolState.active = tool.name;
		}
	}
</script>

<div class="main" bind:clientWidth={width} bind:clientHeight={height}>
	<canvas
		bind:this={canvas}
		onpointerdown={(e) => onPointerDown(e)}
		onpointermove={(e) => onPointerMove(e)}
		onpointerup={(e) => onPointerUp(e)}
	>
	</canvas>

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

	.selection {
		position: absolute;
		pointer-events: none;
		backdrop-filter: blur(10px);
		background-color: #ffffff33;

		background-image:
			linear-gradient(90deg, #454545 50%, transparent 50%),
			linear-gradient(90deg, #454545 50%, transparent 50%),
			linear-gradient(0deg, #454545 50%, transparent 50%),
			linear-gradient(0deg, #454545 50%, transparent 50%);
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

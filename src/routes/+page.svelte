<script lang="ts">
	import type { PageAPI, Selection, Tool } from '$lib/models';
	import GenerateAction from '$lib/actions/GenerateAction.svelte';
	import { toolState } from '$lib/states.svelte';

	let canvas: HTMLCanvasElement;
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
		}
	} satisfies PageAPI;

	$effect(() => {
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}
	});

	function selectTool(tool: Tool) {
		if (toolState.active === tool.name) {
			toolState.active = undefined;
		} else {
			toolState.active = tool.name;
		}
	}
</script>

<div class="main" bind:clientWidth={width} bind:clientHeight={height}>
	<canvas bind:this={canvas}> </canvas>

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
</style>

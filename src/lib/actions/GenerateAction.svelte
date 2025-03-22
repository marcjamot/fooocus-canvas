<script lang="ts">
	import type { PageAPI } from '$lib/models';
	import { onMount, type ComponentProps } from 'svelte';
	import Generation from './Generation.svelte';
	import { toolState } from '$lib/states.svelte';

	const { pageAPI }: { pageAPI: PageAPI } = $props();

	let generations: Record<string, ComponentProps<typeof Generation>> = $state({});
	let text = $state('A cat with a hat');
	let working = $state(false);

	onMount(() => {
		toolState.tools = [
			...toolState.tools,
			{
				icon: '/icons/magic.svg',
				name: 'Generate Image',
				order: 99
			}
		];
	});

	async function generate() {
		const selection = pageAPI.getSelection();
		if (selection?.type !== 'progress') return;

		working = true;

		const id = `${Math.random() * 1000000}`;
		const { sx, sy, ex, ey } = selection;
		const width = Math.abs(sx - ex);
		const height = Math.abs(sy - ey);
		const x = Math.min(sx, ex);
		const y = Math.min(sy, ey);

		// Keep context from surrounding image if any
		const imageData = pageAPI.getImageData(x, y, width, height);
		const hasData = imageData.data.some((d) => d > 0);

		let inpaint: { image: string; mask: string } | null = null;
		if (hasData) {
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d')!;
			ctx.putImageData(imageData, 0, 0);
			const image = canvas.toDataURL('image/png');

			// Mask
			const maskCanvas = document.createElement('canvas');
			maskCanvas.width = width;
			maskCanvas.height = height;
			const maskCtx = maskCanvas.getContext('2d')!;
			const maskData = maskCtx.getImageData(0, 0, width, height);
			for (let i = 0; i < maskData.data.length; i += 4) {
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
				pageAPI.drawImage(img, x, y, width, height);
				delete generations[id];
				generations = generations;
				working = false;
			}
		};
		generations[id] = generation;
		generations = generations;
		pageAPI.setSelection(undefined);
	}
</script>

<div class="action" class:hidden={toolState.active !== "Generate Image"}>
	<input type="text" bind:value={text} />
	<button onclick={generate} disabled={working}>Generate</button>
</div>
{#each Object.values(generations) as generation}
	<Generation {...generation} />
{/each}

<style>
	.action {
		position: absolute;
		top: 8px;
		right: 8px;
		padding: 16px;
		background-color: #000000aa;
		border: 1px solid black;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
	}

    .action.hidden {
        display: none;
    }
</style>

<script lang="ts">
	import { generate } from '$lib/fooocus';
	import { onMount } from 'svelte';

	let {
		text,
		x,
		y,
		width,
		height,
		inpaint,
		done
	}: {
		text: string;
		x: number;
		y: number;
		width: number;
		height: number;
		inpaint: {
			image: string;
			mask: string;
		} | null;
		done: (img: HTMLImageElement) => void;
	} = $props();

	let img: HTMLImageElement;
	let src = $state('');

	onMount(async () => {
		const urls = generate({
			text: text,
			width: width,
			height: height,
			inpaint: inpaint
		});
		for await (const url of urls) {
			src = url;
		}

		done(img);
	});
</script>

<div style="width: {width + 4}px; height: {height + 4}px; left: {x - 2}px; top: {y - 2}px;">
	<img class:hidden={src === ''} {src} {width} {height} alt="" bind:this={img} />
</div>

<style>
	div {
		pointer-events: none;
		position: absolute;
		backdrop-filter: blur(10px);
		background-color: #ffffff33;

		border: 2px solid transparent;
		border-image: linear-gradient(
			to bottom right,
			#b827fc 0%,
			#2c90fc 25%,
			#b8fd33 50%,
			#fec837 75%,
			#fd1892 100%
		);
		border-image-slice: 1;
		box-sizing: border-box;
	}

	img {
		width: 100%;
		height: 100%;
	}

	img.hidden {
		visibility: hidden;
	}
</style>

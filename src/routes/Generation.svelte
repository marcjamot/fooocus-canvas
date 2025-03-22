<script lang="ts">
	import { generate } from '$lib/fooocus';
	import { onMount } from 'svelte';

	let {
		text,
		x,
		y,
		width,
		height,
		done
	}: {
		text: string;
		x: number;
		y: number;
		width: number;
		height: number;
		done: (img: HTMLImageElement) => void;
	} = $props();

	let img: HTMLImageElement;
	let src = $state('');

	onMount(async () => {
		const urls = generate({
			text: text,
			width: width,
			height: height
		});
		for await (const url of urls) {
			src = url;
		}

		done(img);
	});
</script>

<div style="width: {width}px; height: {height}px; left: {x}px; top: {y}px;">
	<img {src} {width} {height} alt="" bind:this={img} />
</div>

<style>
	div {
		position: absolute;
		border: 1px dashed black;
		background-color: #00000066;
	}

	img {
		width: 100%;
		height: 100%;
	}
</style>

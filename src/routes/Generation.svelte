<script lang="ts">
	import { generate } from '$lib/fooocus';
	import { Assets, Sprite, Texture, type Application } from 'pixi.js';
	import { onMount } from 'svelte';

	let {
		app,
		text,
		x,
		y,
		width,
		height,
		done
	}: {
		app: Application;
		text: string;
		x: number;
		y: number;
		width: number;
		height: number;
		done: () => void;
	} = $props();

	onMount(async () => {
		await Assets.load('http://localhost:5173/marquee.png');
		const texture = Texture.from('http://localhost:5173/marquee.png');

		const sprite = new Sprite({
			texture: texture,
			x: x,
			y: y,
			width: width,
			height: height
		});
		app.stage.addChild(sprite);

		const urls = generate({
			text: text,
			width: width,
			height: height
		});
		for await (const [url, asset] of urls) {
			await Assets.load(asset);
			const texture = Texture.from(url);
			sprite.texture = texture;
			app.render();
		}

		app.stage.removeChild(sprite);

		done();
	});
</script>

<div></div>

<style>
</style>

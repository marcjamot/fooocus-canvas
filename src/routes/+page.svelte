<script lang="ts">
	import { Client } from '@gradio/client';
	import { Application, Assets, Graphics, Sprite, Texture } from 'pixi.js';
	import { onMount } from 'svelte';

	/**
	 * TODO:
	 * - opacity background image
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

	$: if (selection?.type === 'progress') {
		const { sx, sy, ex, ey } = selection;
		selectionGraphics.clear();
		selectionGraphics
			.rect(Math.min(sx, ex), Math.min(sy, ey), Math.abs(sx - ex), Math.abs(sy - ey))
			.fill('#ff000044');
	} else if (selectionGraphics) {
		selectionGraphics.clear();
	}

	onMount(async () => {
		app = new Application();
		await app.init({ background: '#000000', resizeTo: main });

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

		const fooocus = await Client.connect('http://localhost:5173/fooocus');

		const r67 = await fooocus.predict(67, [
			false,
			text,
			'',
			['Fooocus V2', 'Fooocus Enhance', 'Fooocus Sharp'],
			'Extreme Speed',
			'704×1408 <span style="color: grey;"> ∣ 1:2</span>',
			1,
			'png',
			`${Math.floor(Math.random() * (1024 * 1024 * 1024 - 1))}`,
			false,
			2,
			4,
			'juggernautXL_v8Rundiffusion.safetensors',
			'None',
			0.5,
			true,
			'sd_xl_offset_example-lora_1.0.safetensors',
			0.1,
			true,
			'None',
			1,
			true,
			'None',
			1,
			true,
			'None',
			1,
			true,
			'None',
			1,
			false,
			'uov',
			'Disabled',
			null,
			[],
			null,
			'',
			null,
			false,
			false,
			false,
			false,
			1.5,
			0.8,
			0.3,
			7,
			2,
			'dpmpp_2m_sde_gpu',
			'karras',
			'Default (model)',
			-1,
			-1,
			-1,
			-1,
			-1,
			-1,
			false,
			false,
			false,
			false,
			64,
			128,
			'joint',
			0.25,
			false,
			1.01,
			1.02,
			0.99,
			0.95,
			false,
			false,
			'v2.6',
			1,
			0.618,
			false,
			false,
			0,
			false,
			'fooocus',
			null,
			0.5,
			0.6,
			'ImagePrompt',
			null,
			0.5,
			0.6,
			'ImagePrompt',
			null,
			0.5,
			0.6,
			'ImagePrompt',
			null,
			0.5,
			0.6,
			'ImagePrompt',
			false,
			0,
			false,
			null,
			false,
			'Disabled',
			'Before First Enhancement',
			'Original Prompts',
			false,
			'',
			'',
			'',
			'sam',
			'full',
			'vit_b',
			0.25,
			0.3,
			0,
			false,
			'v2.6',
			1,
			0.618,
			0,
			false,
			false,
			'',
			'',
			'',
			'sam',
			'full',
			'vit_b',
			0.25,
			0.3,
			0,
			false,
			'v2.6',
			1,
			0.618,
			0,
			false,
			false,
			'',
			'',
			'',
			'sam',
			'full',
			'vit_b',
			0.25,
			0.3,
			0,
			false,
			'v2.6',
			1,
			0.618,
			0,
			false
		]);

		console.log('Result 67:', r67);

		const r68 = fooocus.submit(68, []);

		const sprite = new Sprite({
			position: {
				x: Math.min(sx, ex),
				y: Math.min(sy, ey)
			},
			width: Math.abs(sx - ex),
			height: Math.abs(sy - ey)
		});
		app.stage.addChild(sprite);

		let i = Math.floor(Math.random() * 1000000);
		for await (const message of r68) {
			i += 1;
			if (message.type !== 'data') continue;

			const data = message.data as [
				{},
				{ visible?: boolean; value: string },
				{},
				{ visible?: boolean; value: [{ name: string }] }
			];

			if (data[1].visible && data[1].value) {
				const url = `step ${i}`;
				await Assets.load({ alias: url, format: 'png', src: data[1].value });
				const texture = Texture.from(url);
				sprite.texture = texture;
				app.render();
			}
			if (data[3].visible) {
				const url = `http://localhost:5173/fooocus/file=${data[3].value[0].name}`;
				await Assets.load(url);
				const texture = Texture.from(url);
				sprite.texture = texture;
				app.render();
			}
		}
	}

	function onPointerDown(ev: PointerEvent) {
		dragging = true;
		selection = {
			type: 'start',
			sx: ev.x,
			sy: ev.y
		};
	}

	function onPointerMove(ev: PointerEvent) {
		if (!dragging) return;
		if (!selection) return;

		selection = {
			type: 'progress',
			sx: selection.sx,
			sy: selection.sy,
			ex: ev.x,
			ey: ev.y
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
</div>

<style>
	.main {
		position: relative;
		width: 100dvw;
		height: 100dvh;
		overflow: hidden;
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

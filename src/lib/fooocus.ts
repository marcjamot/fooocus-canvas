import { Client } from '@gradio/client';

export interface Resolution {
	w: number;
	h: number;
	aW: number;
	aH: number;
	aspect: number;
}

const RESOLUTIONS: Resolution[] = [
	{ w: 704, h: 1408, aW: 1, aH: 2, aspect: 1 / 2 },
	{ w: 704, h: 1344, aW: 11, aH: 21, aspect: 11 / 21 },
	{ w: 768, h: 1344, aW: 4, aH: 7, aspect: 4 / 7 },
	{ w: 768, h: 1280, aW: 3, aH: 5, aspect: 3 / 5 },
	{ w: 832, h: 1216, aW: 13, aH: 19, aspect: 13 / 19 },
	{ w: 832, h: 1152, aW: 13, aH: 18, aspect: 13 / 18 },
	{ w: 896, h: 1152, aW: 7, aH: 9, aspect: 7 / 9 },
	{ w: 896, h: 1088, aW: 14, aH: 17, aspect: 14 / 17 },
	{ w: 960, h: 1088, aW: 15, aH: 17, aspect: 15 / 17 },
	{ w: 960, h: 1024, aW: 15, aH: 16, aspect: 15 / 16 },
	{ w: 1024, h: 1024, aW: 1, aH: 1, aspect: 1 / 1 },
	{ w: 1024, h: 960, aW: 16, aH: 15, aspect: 16 / 15 },
	{ w: 1088, h: 960, aW: 17, aH: 15, aspect: 17 / 15 },
	{ w: 1088, h: 896, aW: 17, aH: 14, aspect: 17 / 14 },
	{ w: 1152, h: 896, aW: 9, aH: 7, aspect: 9 / 7 },
	{ w: 1152, h: 832, aW: 18, aH: 13, aspect: 18 / 13 },
	{ w: 1216, h: 832, aW: 19, aH: 13, aspect: 19 / 13 },
	{ w: 1280, h: 768, aW: 5, aH: 3, aspect: 5 / 3 },
	{ w: 1344, h: 768, aW: 7, aH: 4, aspect: 7 / 4 },
	{ w: 1344, h: 704, aW: 21, aH: 11, aspect: 21 / 11 },
	{ w: 1408, h: 704, aW: 2, aH: 1, aspect: 2 / 1 },
	{ w: 1472, h: 704, aW: 23, aH: 11, aspect: 23 / 11 },
	{ w: 1536, h: 640, aW: 12, aH: 5, aspect: 12 / 5 },
	{ w: 1600, h: 640, aW: 5, aH: 2, aspect: 5 / 2 },
	{ w: 1664, h: 576, aW: 26, aH: 9, aspect: 26 / 9 },
	{ w: 1728, h: 576, aW: 3, aH: 1, aspect: 3 / 1 }
] as const;

export function bestResolution(width: number, height: number): Resolution {
	const selectionAspect = width / height;

	let bestResolution = RESOLUTIONS[0];
	let bestDA = Math.abs(bestResolution.aspect - selectionAspect);
	for (const resolution of RESOLUTIONS.slice(1)) {
		let da = Math.abs(resolution.aspect - selectionAspect);
		if (da < bestDA) {
			bestResolution = resolution;
			bestDA = da;
		}
	}

	return bestResolution;
}

export async function* generate(args: {
	text: string;
	resolution: Resolution;
	inpaint: {
		image: string;
		mask: string;
	} | null;
}): AsyncIterable<string> {
	const performance: 'Quality' | 'Speed' | 'Extreme Speed' = 'Extreme Speed';
	const resolutionString = `${args.resolution.w}×${args.resolution.h} <span style="color: grey;"> ∣ ${args.resolution.aW}:${args.resolution.aH}</span>`;
	const styles = [
		'Fooocus V2',
		'Fooocus Enhance',
		'Fooocus Sharp',
		'Fooocus Semi Realistic',
		'SAI Anime'
	];

	const fooocus = await Client.connect('http://localhost:5173/fooocus');

	const r67 = await fooocus.predict(67, [
		false,
		args.text,
		'',
		styles,
		performance,
		resolutionString,
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
		true,
		'inpaint',
		'Disabled',
		null,
		[],
		args.inpaint,
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

	// console.log('Result 67:', r67);

	const r68 = fooocus.submit(68, []);

	let i = Math.random() * 1000000;
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
			yield data[1].value;
		}
		if (data[3].visible) {
			const res = await fetch(`http://localhost:5173/fooocus/file=${data[3].value[0].name}`);
			const arrayBuffer = await res.arrayBuffer();
			const bytes = new Uint8Array(arrayBuffer);
			const b64data =
				'data:image/png;base64,' +
				btoa(bytes.reduce((data, byte) => data + String.fromCharCode(byte), ''));
			yield b64data;
			break;
		}
	}
}

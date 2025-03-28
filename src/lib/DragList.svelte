<script module lang="ts">
	export type SnippetProps<Item> = {
		anyDragging: boolean;
		isTarget: boolean;
		item: Item & { draggable: boolean };
		position: number;
	};
</script>

<script lang="ts" generics="Item extends { draggable: boolean }">
	import type { Snippet } from "svelte";

	type Drop = { item: Item; position: number };
	type Move = { position: number };
	type Source = { item: Item; position: number };

	const {
		items,
		ondrop,
		onmove,
		snippet,
	}: {
		items: Item[];
		ondrop: (sourceItem: Item, sourcePosition: number, targetItem: Item, targetPosition: number) => void;
		onmove: (sourceItem: Item, oldPosition: number, newPosition: number) => void;
		snippet: Snippet<[SnippetProps<Item>]>;
	} = $props();

	let drop = $state<Drop | undefined>(undefined);
	let move = $state<Move | undefined>(undefined);
	let source = $state<Source | undefined>(undefined);

	function ondragstart(e: DragEvent, item: Item, i: number) {
		(e.currentTarget as HTMLElement).classList.add("transparent");

		drop = undefined;
		move = { position: i };
		source = { item: item, position: i };
	}

	function ondragend(e: DragEvent) {
		(e.currentTarget as HTMLElement).classList.remove("transparent");

		if (drop) {
			ondrop(source!.item, source!.position, drop.item, drop.position);
		} else if (move) {
			onmove(source!.item, source!.position, move.position);
		}

		drop = undefined;
		move = undefined;
		source = undefined;
	}

	function ondragover(e: DragEvent, item: Item, i: number) {
		e.preventDefault();

		if (!source || source.position === i) return;
		if (!(e.target instanceof HTMLElement)) {
			return;
		}

		if (e.offsetX < e.target.clientWidth * 0.1) {
			if (!item.draggable) return;
			drop = undefined;
			move = { position: source.position < i ? i - 1 : i };
		} else if (e.offsetX > e.target.clientWidth * 0.9) {
			if (!item.draggable) return;
			drop = undefined;
			move = { position: source.position < i ? i : i + 1 };
		} else {
			drop = { item: item, position: i };
		}
	}

	function ondragleave(e: DragEvent, item: Item, i: number) {
		e.preventDefault();

		if (drop?.position === i) {
			drop = undefined;
		}
	}
</script>

{#each items as item, i}
	{#if source && move && source.position >= i && move.position === i}
		<div class="item placeholder">
			{@render snippet({
				anyDragging: source !== undefined,
				isTarget: false,
				item: source.item,
				position: source.position,
			})}
		</div>
	{/if}
	<div
		class="item"
		class:gone={move !== undefined && source?.position === i}
		draggable={item.draggable}
		ondragstart={(e) => ondragstart(e, item, i)}
		{ondragend}
		ondragover={(e) => ondragover(e, item, i)}
		ondragleave={(e) => ondragleave(e, item, i)}
		role="button"
		tabindex="0"
	>
		<div class:noevents={source !== undefined}>
			{@render snippet({
				anyDragging: source !== undefined,
				isTarget: drop?.position === i,
				item: item,
				position: i,
			})}
		</div>
	</div>
	{#if source && move && source.position < i && move.position === i}
		<div class="item placeholder">
			{@render snippet({
				anyDragging: source !== undefined,
				isTarget: false,
				item: source.item,
				position: source.position,
			})}
		</div>
	{/if}
{/each}

<style>
	.gone {
		display: none;
	}

	.placeholder {
		opacity: 0.5;
	}

	.noevents {
		pointer-events: none;
	}
</style>

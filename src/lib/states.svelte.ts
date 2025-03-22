import type { Tool } from "./models";

export const toolState: {
    active: string | undefined;
    tools: Tool[];
} = $state({
    active: undefined,
    tools: [],
});

// $effect(() => {
//     toolState.tools.sort((a, b) => a.order - b.order);
// });

export interface PageAPI {
    drawImage(img: HTMLImageElement, x: number, y: number, width: number, height: number): void;
    getImageData(x: number, y: number, width: number, height: number): ImageData;
    getSelection(): Selection;
    setSelection(selection: Selection): void;
}

export type Selection =
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

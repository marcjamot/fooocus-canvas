export interface CanvasAPI {
	draw(path: Path2D, color: string): void;
	drawImage(img: CanvasImageSource, x: number, y: number, width: number, height: number): void;
	erase(path: Path2D): void;
	getImageData(x: number, y: number, width: number, height: number): ImageData;
	grayscale(path: Path2D): void;
	recolor(path: Path2D, color: string): void;
	reset(): void;
}

export type Selection =
	| {
			type: "start";
			sx: number;
			sy: number;
	  }
	| {
			type: "progress";
			sx: number;
			sy: number;
			ex: number;
			ey: number;
	  }
	| undefined;

export interface Tool {
	icon: string;
	name: string;
}

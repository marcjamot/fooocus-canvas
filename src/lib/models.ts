export interface PageAPI {
	clearRect(x: number, y: number, width: number, height: number): void;
	drawImage(img: CanvasImageSource, x: number, y: number, width: number, height: number): void;
	drawRect(x: number, y: number, width: number, height: number): void;
	getImageData(x: number, y: number, width: number, height: number): ImageData;
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

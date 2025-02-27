export interface Pokemon {
	id: number;
	name: string;
	types: { type: { name: string } }[];
	sprites: { other: { 'official-artwork': { front_default: string } } };
}

export interface ColorType {
	[key: string]: string;
}
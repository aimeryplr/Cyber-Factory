class Entity {
	sellPrice: number;
	name: string;
	id: number | undefined;

	constructor(name: string, sellPrice: number) {
		this.sellPrice = sellPrice;
		this.name = name;
	}
}

export default Entity;

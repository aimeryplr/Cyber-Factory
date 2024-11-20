const tileEntitiesList: Map<string, { name: string, category: string, tier: number, speed: number, price: number, image: string }> = new Map([
    ["conveyor", {
        name: "conveyor",
        category: "conveyor",
        speed: 60,
        tier: 1,
        price: 50,
        image: "88240255345711",
    }],
    ["generator", {
        name: "generator",
        category: "generator",
        speed: 0,
        tier: 1,
        price: 500,
        image: "82799492428452",
    }],
    ["seller", {
        name: "seller",
        category: "seller",
        tier: 1,
        speed: 1,
        price: 1000,
        image: "71422763354668",
    }],
    ["merger", {
        name: "merger",
        category: "merger",
        speed: 60,
        tier: 1,
        price: 150,
        image: "116731642169244",
    }],
    ["splitter", {
        name: "splitter",
        category: "splitter",
        speed: 60,
        tier: 1,
        price: 150,
        image: "132392789948593",
    }],
    ["crafter", {
        name: "crafter",
        category: "crafter",
        speed: 60,
        tier: 1,
        price: 500,
        image: "128911947018595",
    }],
    ["assembler", {
        name: "assembler",
        category: "assembler",
        speed: 60,
        tier: 1,
        price: 500,
        image: "",
    }],
    ["subConveyerInput", {
        name: "subConveyerInput",
        category: "subConveyer",
        speed: 60,
        tier: 1,
        price: 2000,
        image: "",
    }]
]);

export default tileEntitiesList;

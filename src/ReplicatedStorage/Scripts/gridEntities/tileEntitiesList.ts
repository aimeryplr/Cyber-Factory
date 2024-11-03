const tileEntitiesList: Map<string, Map<string, { name: string, category: string, tier: number, speed: number, price: number, image: string }>> = new Map([
    ["conveyer", new Map([
        ["conveyer_t1", {
            name: "conveyer_t1",
            category: "conveyer",
            speed: 60,
            tier: 1,
            price: 50,
            image: "88240255345711",
        }],
        ["conveyer_t2", {
            name: "conveyer_t2",
            category: "conveyer",
            speed: 120,
            tier: 2,
            price: 1000,
            image: "",
        }],
        ["conveyer_t3", {
            name: "conveyer_t3",
            category: "conveyer",
            speed: 240,
            tier: 3,
            price: 100000,
            image: "",
        }]
    ])],
    ["generator", new Map([
        ["generator_t1", {
            name: "generator_t1",
            category: "generator",
            speed: 0,
            tier: 1,
            price: 500,
            image: "82799492428452",
        }],
        ["generator_t2", {
            name: "generator_t2",
            category: "generator",
            speed: 0,
            tier: 2,
            price: 10000,
            image: "",
        }],
        ["generator_t3", {
            name: "generator_t3",
            category: "generator",
            speed: 0,
            tier: 3,
            price: 1000000,
            image: "",
        }]
    ])],
    ["seller", new Map([
        ["seller", {
            name: "seller",
            category: "seller",
            tier: 1,
            speed: 1,
            price: 1000,
            image: "",
        }]
    ])],
    ["merger", new Map([
        ["merger_t1", {
            name: "merger_t1",
            category: "merger",
            speed: 60,
            tier: 1,
            price: 150,
            image: "",
        }],
        ["merger_t2", {
            name: "merger_t2",
            category: "merger",
            speed: 120,
            tier: 2,
            price: 3000,
            image: "",
        }],
        ["merger_t3", {
            name: "merger_t3",
            category: "merger",
            speed: 240,
            tier: 3,
            price: 300000,
            image: "",
        }]
    ])],
    ["splitter", new Map([
        ["splitter_t1", {
            name: "splitter_t1",
            category: "splitter",
            speed: 60,
            tier: 1,
            price: 150,
            image: "",
        }],
        ["splitter_t2", {
            name: "splitter_t2",
            category: "splitter",
            speed: 120,
            tier: 2,
            price: 3000,
            image: "",
        }],
        ["splitter_t3", {
            name: "splitter_t3",
            category: "splitter",
            speed: 240,
            tier: 3,
            price: 300000,
            image: "",
        }],
        ["splitter_intelligent", {
            name: "splitter_intelligent",
            category: "splitter",
            speed: 240,
            tier: 4,
            price: 600000,
            image: "",
        }]
    ])],
    ["crafter", new Map([
        ["crafter", {
            name: "crafter",
            category: "crafter",
            speed: 60,
            tier: 1,
            price: 500,
            image: "",
        }]
    ])],
    ["assembler", new Map([
        ["assembler", {
            name: "assembler",
            category: "assembler",
            speed: 60,
            tier: 1,
            price: 500,
            image: "",
        }]
    ])]
]);

export default tileEntitiesList;

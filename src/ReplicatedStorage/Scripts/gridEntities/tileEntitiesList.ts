const tileEntitiesList: Map<string, Map<string, { name: string, category: string, tier: number, speed: number, price: number, image: string }>> = new Map([
    ["conveyer", new Map([
        ["conveyer_t1", {
            name: "conveyer_t1",
            category: "conveyer",
            speed: 60,
            tier: 1,
            price: 50,
            image: "rbxassetid://0",
        }],
        ["conveyer_t2", {
            name: "conveyer_t2",
            category: "conveyer",
            speed: 120,
            tier: 2,
            price: 1000,
            image: "rbxassetid://0",
        }],
        ["conveyer_t3", {
            name: "conveyer_t3",
            category: "conveyer",
            speed: 240,
            tier: 3,
            price: 100000,
            image: "rbxassetid://0",
        }]
    ])],
    ["generator", new Map([
        ["generator_t1", {
            name: "generator_t1",
            category: "generator",
            speed: 0,
            tier: 1,
            price: 500,
            image: "rbxassetid://0",
        }],
        ["generator_t2", {
            name: "generator_t2",
            category: "generator",
            speed: 0,
            tier: 2,
            price: 10000,
            image: "rbxassetid://0",
        }],
        ["generator_t3", {
            name: "generator_t3",
            category: "generator",
            speed: 0,
            tier: 3,
            price: 1000000,
            image: "rbxassetid://0",
        }]
    ])],
    ["seller", new Map([
        ["seller", {
            name: "seller",
            category: "seller",
            tier: 1,
            speed: 1,
            price: 1000,
            image: "rbxassetid://0",
        }]
    ])],
    ["merger", new Map([
        ["merger_t1", {
            name: "merger_t1",
            category: "merger",
            speed: 60,
            tier: 1,
            price: 150,
            image: "rbxassetid://0",
        }],
        ["merger_t2", {
            name: "merger_t2",
            category: "merger",
            speed: 120,
            tier: 2,
            price: 3000,
            image: "rbxassetid://0",
        }],
        ["merger_t3", {
            name: "merger_t3",
            category: "merger",
            speed: 240,
            tier: 3,
            price: 300000,
            image: "rbxassetid://0",
        }]
    ])],
    ["splitter", new Map([
        ["splitter_t1", {
            name: "splitter_t1",
            category: "splitter",
            speed: 60,
            tier: 1,
            price: 150,
            image: "rbxassetid://0",
        }],
        ["splitter_t2", {
            name: "splitter_t2",
            category: "splitter",
            speed: 120,
            tier: 2,
            price: 3000,
            image: "rbxassetid://0",
        }],
        ["splitter_t3", {
            name: "splitter_t3",
            category: "splitter",
            speed: 240,
            tier: 3,
            price: 300000,
            image: "rbxassetid://0",
        }],
        ["splitter_intelligent", {
            name: "splitter_intelligent",
            category: "splitter",
            speed: 240,
            tier: 4,
            price: 600000,
            image: "rbxassetid://0",
        }]
    ])],
    ["crafter", new Map([
        ["crafter", {
            name: "crafter",
            category: "crafter",
            speed: 1,
            tier: 1,
            price: 500,
            image: "rbxassetid://0",
        }]
    ])],
    ["assembler", new Map([
        ["assembler_t1", {
            name: "assembler_t1",
            category: "assembler",
            speed: 1,
            tier: 1,
            price: 5000,
            image: "rbxassetid://0",
        }]
    ])]
]);

export default tileEntitiesList;

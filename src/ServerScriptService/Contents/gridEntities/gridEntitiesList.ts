const gridEntitiesList: Map<string, Map<string, { name: string, category: string, tier: number, price: number }>> = new Map([
    ["conveyer", new Map([
        ["conveyer_t1", {
            name: "conveyer_t1",
            category: "conveyer",
            speed: 1,
            tier: 0,
            price: 10,
        }],
        ["conveyer_t2", {
            name: "conveyer_t2",
            category: "conveyer",
            speed: 2,
            tier: 1,
            price: 100,
        }],
        ["conveyer_t3", {
            name: "conveyer_t3",
            category: "conveyer",
            speed: 3,
            tier: 2,
            price: 1000,
        }]
    ])],
    ["generator", new Map([
        ["generator_t1", {
            name: "generator_t1",
            category: "generator",
            speed: 1,
            tier: 1,
            price: 10,
        }],
        ["generator_t2", {
            name: "generator_t2",
            category: "generator",
            speed: 2,
            tier: 2,
            price: 100,
        }],
        ["generator_t3", {
            name: "generator_t3",
            category: "generator",
            speed: 3,
            tier: 3,
            price: 1000,
        }]
    ])]
]);

export default gridEntitiesList;
const gridEntitiesList: Map<string, Map<string, { name: string, category: string, tier: number, price: number }>> = new Map([
    ["conveyer", new Map([
        ["conveyer_t1", {
            name: "conveyer_t1",
            category: "conveyer",
            tier: 0,
            price: 10,
        }],
        ["conveyer_t2", {
            name: "conveyer_t2",
            category: "conveyer",
            tier: 1,
            price: 100,
        }],
        ["conveyer_t3", {
            name: "conveyer_t3",
            category: "conveyer",
            tier: 2,
            price: 1000,
        }]
    ])],
]);

export default gridEntitiesList;
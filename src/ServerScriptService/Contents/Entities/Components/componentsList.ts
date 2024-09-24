import RessourceType from "../ressourceEnum";
import Ressource from "ServerScriptService/Contents/Entities/ressource";

// Déclaration des variables de ressource
const copperResource = new Ressource("Copper", RessourceType.Copper);
const goldResource = new Ressource("Gold", RessourceType.Gold);
const plasticResource = new Ressource("Plastic", RessourceType.Plastic);

const componentsList: Map<string, Map<string, { name: string, category: string, tier: number, buildRessources: Map<Ressource, number> }>> = new Map([
    ["ram", new Map([
        ["ram_t0", {
            name: "ram",
            category: "ram",
            tier: 0,
            buildRessources: new Map([
                [copperResource, 1],
                [goldResource, 1],
                [plasticResource, 1],
            ])
        }],
        ["ram_t1", {
            name: "ram",
            category: "ram",
            tier: 1,
            buildRessources: new Map([
                [copperResource, 2],
                [goldResource, 2],
                [plasticResource, 2],
            ])
        }],
        ["ram_t2", {
            name: "ram",
            category: "ram",
            tier: 2,
            buildRessources: new Map([
                [copperResource, 3],
                [goldResource, 3],
                [plasticResource, 3],
            ])
        }]
    ])],
    ["cpu", new Map([
        ["cpu_t0", {
            name: "cpu",
            category: "cpu",
            tier: 0,
            buildRessources: new Map([
                [copperResource, 1],
                [goldResource, 1],
                [plasticResource, 1],
            ])
        }],
        ["cpu_t1", {
            name: "cpu",
            category: "cpu",
            tier: 1,
            buildRessources: new Map([
                [copperResource, 2],
                [goldResource, 2],
                [plasticResource, 2],
            ])
        }],
        ["cpu_t2", {
            name: "cpu",
            category: "cpu",
            tier: 2,
            buildRessources: new Map([
                [copperResource, 3],
                [goldResource, 3],
                [plasticResource, 3],
            ])
        }]
    ])],
    ["gpu", new Map([
        ["gpu_t0", {
            name: "gpu",
            category: "gpu",
            tier: 0,
            buildRessources: new Map([
                [copperResource, 1],
                [goldResource, 1],
                [plasticResource, 1],
            ])
        }],
        ["gpu_t1", {
            name: "gpu",
            category: "gpu",
            tier: 1,
            buildRessources: new Map([
                [copperResource, 2],
                [goldResource, 2],
                [plasticResource, 2],
            ])
        }],
        ["gpu_t2", {
            name: "gpu",
            category: "gpu",
            tier: 2,
            buildRessources: new Map([
                [copperResource, 3],
                [goldResource, 3],
                [plasticResource, 3],
            ])
        }]
    ])],
    ["motherboard", new Map([
        ["motherboard_t0", {
            name: "motherboard",
            category: "motherboard",
            tier: 0,
            buildRessources: new Map([
                [copperResource, 1],
                [goldResource, 1],
                [plasticResource, 1],
            ])
        }],
        ["motherboard_t1", {
            name: "motherboard",
            category: "motherboard",
            tier: 1,
            buildRessources: new Map([
                [copperResource, 2],
                [goldResource, 2],
                [plasticResource, 2],
            ])
        }],
        ["motherboard_t2", {
            name: "motherboard",
            category: "motherboard",
            tier: 2,
            buildRessources: new Map([
                [copperResource, 3],
                [goldResource, 3],
                [plasticResource, 3],
            ])
        }]
    ])],
    ["storage", new Map([
        ["ssd_t0", {
            name: "ssd",
            category: "storage",
            tier: 0,
            buildRessources: new Map([
                [copperResource, 2],
                [goldResource, 1],
                [plasticResource, 1],
            ])
        }],
        ["ssd_t1", {
            name: "ssd",
            category: "storage",
            tier: 1,
            buildRessources: new Map([
                [copperResource, 3],
                [goldResource, 2],
                [plasticResource, 2],
            ])
        }],
        ["ssd_t2", {
            name: "ssd",
            category: "storage",
            tier: 2,
            buildRessources: new Map([
                [copperResource, 4],
                [goldResource, 3],
                [plasticResource, 3],
            ])
        }]
    ])],
    ["power", new Map([
        ["powerSupply_t0", {
            name: "powerSupply",
            category: "power",
            tier: 0,
            buildRessources: new Map([
                [copperResource, 1],
                [goldResource, 1],
                [plasticResource, 1],
            ])
        }],
        ["powerSupply_t1", {
            name: "powerSupply",
            category: "power",
            tier: 1,
            buildRessources: new Map([
                [copperResource, 2],
                [goldResource, 2],
                [plasticResource, 2],
            ])
        }],
        ["powerSupply_t2", {
            name: "powerSupply",
            category: "power",
            tier: 2,
            buildRessources: new Map([
                [copperResource, 3],
                [goldResource, 3],
                [plasticResource, 3],
            ])
        }]
    ])],
    ["case", new Map([
        ["case_t0", {
            name: "case",
            category: "case",
            tier: 0,
            buildRessources: new Map([
                [copperResource, 1],
                [goldResource, 1],
                [plasticResource, 1],
            ])
        }],
        ["case_t1", {
            name: "case",
            category: "case",
            tier: 1,
            buildRessources: new Map([
                [copperResource, 2],
                [goldResource, 2],
                [plasticResource, 2],
            ])
        }],
        ["case_t2", {
            name: "case",
            category: "case",
            tier: 2,
            buildRessources: new Map([
                [copperResource, 3],
                [goldResource, 3],
                [plasticResource, 3],
            ])
        }]
    ])]
]);

export default componentsList;
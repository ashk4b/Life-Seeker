class GlobalManager {
    canvas;
    engine;
    scene;
    camera;

    gameState;

    shadowGenerators = [];

    static get instance() {
        return (globalThis[Symbol.for(`PF_${GlobalManager.name}`)] ||= new this());
    }

    constructor() {

    }

    init(canvas, engine) {
        this.canvas = canvas;
        this.engine = engine;
    }

    addShadowGenerator(shad) {
        this.shadowGenerators.push(shad);
    }

    addShadowCaster(objects, bChilds) {
        bChilds = bChilds || false;
        for(let shad of this.shadowGenerators){
            shad.addShadowCaster(objects, bChilds)
        }
    }

}

const {instance} = GlobalManager; 
export {instance as GlobalManager};  
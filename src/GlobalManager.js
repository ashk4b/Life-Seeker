import { PhysicsAggregate, PhysicsMotionType, PhysicsShapeType } from "@babylonjs/core";

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

    addShadowCaster(objects, bChilds = false) {
        if (!Array.isArray(objects)) objects = [objects];
        for (let shad of this.shadowGenerators) {
            for (let obj of objects) {
                shad.addShadowCaster(obj, bChilds);
            }
        }
    }

    addStaticPhysics(meshes) {
        for(const mesh of meshes) {
            mesh.refreshBoundingInfo(true);
            if(mesh.getTotalVertices() > 0){
                const meshAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass: 0, friction: 0.5, restitution: 0.1});
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                mesh.receiveShadows = true;
                this.addShadowCaster(mesh);
            }
        }
    }

}

//Destructuring on ne prends que la propriété statique instance 
const {instance} = GlobalManager; 
export {instance as GlobalManager};  
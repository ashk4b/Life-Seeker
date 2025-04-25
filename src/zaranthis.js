import { MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, StandardMaterial, Color3, Texture, Vector3, SceneLoader, Mesh, VertexData, TransformNode, Sound, Tools, ParticleSystem } from "@babylonjs/core";
import { WaterMaterial } from '@babylonjs/materials';
import { GlobalManager } from "./GlobalManager";

import zaranthisFloorTexture from "../assets/texture/sol_zaranthis.jpg";
import greenTree from "../assets/models/tree.glb";
import redTree from "../assets/models/twisted_tree.glb";
import crystalPlant from "../assets/models/crystal.glb";
import plant from "../assets/models/plant.glb";
import fantasyplant from "../assets/models/fantasy_plant.glb";
import treeSpikes from "../assets/models/tree_spikes.glb";
import shiningTree from "../assets/models/giant_glowbranch.glb";
import strangeFlower from "../assets/models/strange_flower.glb";
import glowingFlower from "../assets/models/glowing_flower.glb";
import rock1 from "../assets/models/ruined_rock_fence.glb";
import venus from "../assets/models/venus_flytrap.glb";
import carnivorePlant from "../assets/models/carnivore_plant.glb";
import alien from "../assets/models/alien_zarenthis.glb";
import flyingCreature from "../assets/models/flying_creature.glb";
import ciel from "../assets/models/ciel.glb";
import volcano from "../assets/models/volcano.glb";
import alienMuscle from "../assets/models/alien_muscle.glb";
import alienRose from "../assets/models/alien_rose.glb";
import cute from "../assets/models/cute_creature.glb";
import cuteSpider from "../assets/models/cute_spider__ccw.glb";
import mushy from "../assets/models/mushy_buddy.glb";
import ketkout from "../assets/models/cute_fantasy_animal.glb";
import chesnut from "../assets/models/little_chestnut.glb";
import vaisseau from "../assets/models/star_trek_-_arkonian_military_vessel.glb";
import spaceGateMesh from "../assets/models/space_gate.glb";

class Zaranthis {

    x;
    y;
    z;

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z
    }

    static getPosition() {
        return new Vector3(this.x, this.y, this.z);
    }


    async init() {
        const center = new Vector3(this.x, this.y, this.z);

        //Sol
        const ground = MeshBuilder.CreateGround("zaranthisGround", {
            width: 350,
            height: 350,
            subdivisions: 32
        }, GlobalManager.scene);

        const mat = new StandardMaterial("zaranthisMat", GlobalManager.scene);
        mat.diffuseTexture = new Texture(zaranthisFloorTexture, GlobalManager.scene);
        mat.diffuseTexture.uScale = 16;
        mat.diffuseTexture.vScale = 16;

        mat.specularColor = Color3.Black();
        ground.material = mat;
        ground.position = center;
        ground.receiveShadows = true;
        ground.checkCollisions = true;

        const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, {
            mass: 0,
            friction: 0.8,
            restitution: 0.1
        }, GlobalManager.scene);
        groundAggregate.body.setMotionType(PhysicsMotionType.STATIC);

        await SceneLoader.ImportMeshAsync("", "", ciel, GlobalManager.scene).then((result) => {
            const skybox = result.meshes[0];
            skybox.name = "skyboxMilkyWay";
            skybox.position = new Vector3(this.x, this.y, this.z);
            skybox.rotation = new Vector3(0, 0, Math.PI / 2); 
            skybox.scaling = new Vector3(600, 600, 600);
            skybox.isPickable = false;
            skybox.checkCollisions = false;
            skybox.receiveShadows = false;
        });

        await SceneLoader.ImportMeshAsync("", "", vaisseau, GlobalManager.scene).then((result) => {
            const vaisseauRoot = new TransformNode("vaisseauRoot", GlobalManager.scene);

            for (const mesh of result.meshes) {
                if (mesh !== result.meshes[0]) {
                    mesh.parent = vaisseauRoot;
                }
            }

            vaisseauRoot.scaling = new Vector3(0.1, 0.1, 0.1);
            vaisseauRoot.rotation = new Vector3(0, Math.PI / 2, 0);
            vaisseauRoot.position = center.add(new Vector3(-130, 5.30, -120));

            for (const child of result.meshes) {
                child.refreshBoundingInfo(true);
                if (child.getTotalVertices() > 0) {
                    const aggregate = new PhysicsAggregate(child, PhysicsShapeType.MESH, {
                        mass: 0,
                        friction: 0.4,
                        restitution: 0.1
                    }, GlobalManager.scene);
                    aggregate.body.setMotionType(PhysicsMotionType.STATIC);
                    child.receiveShadows = true;
                    child.checkCollisions = true;
                }
            }
        });

        await this.spawnModels(greenTree, 50, center, "greenTree", new Vector3(1, 1, 1));
        await this.spawnModels(shiningTree, 50, center, "shiningTree", new Vector3(120, 120, 120));
        await this.spawnModels(redTree, 50, center, "twistedTree", new Vector3(0.9, 0.9, 0.9));
        await this.spawnModels(treeSpikes, 30, center, "spikeTree", new Vector3(1, 1, 1));
        await this.spawnModels(fantasyplant, 45, center, "fantasyPlant", new Vector3(1, 1, 1));
        await this.spawnModels(plant, 30, center, "normalPlant", new Vector3(1, 1, 1));
        await this.spawnModels(crystalPlant, 18, center, "crystalPlant", new Vector3(0.2, 0.2, 0.2));
        await this.spawnModels(strangeFlower, 16, center, "strangeFlower", new Vector3(1, 1, 1));
        await this.spawnModels(glowingFlower, 16, center, "glowingFlower", new Vector3(1, 1, 1));
        await this.spawnModels(venus, 16, center, "Venus", new Vector3(0.5, 0.5, 0.5));
        await this.spawnModels(carnivorePlant, 16, center, "Carnivore", new Vector3(1, 1, 1))
        await this.spawnModels(rock1, 30, center, "rock1", new Vector3(0.01, 0.01, 0.01));
        await this.spawnModels(alien, 3, center, "alien", new Vector3(0.3, 0.3, 0.3));
        await this.spawnModels(flyingCreature, 4, center, "creature", new Vector3(0.5, 0.5, 0.5));
        await this.spawnModels(alienMuscle, 8, center, "alienMuscle", new Vector3(1, 1, 1));
        await this.spawnModels(alienRose, 15, center, "alienRose", new Vector3(1, 1, 1));
        await this.spawnModels(cute, 15, center, "cuteCreature", new Vector3(10, 10, 10));
        await this.spawnModels(cuteSpider, 10, center, "cuteSpider", new Vector3(0.6, 0.6, 0.6));
        await this.spawnModels(mushy, 15, center, "mushy", new Vector3(0.009, 0.009, 0.009));
        await this.spawnModels(ketkout, 25, center, "ketkout", new Vector3(1, 1, 1));
        await this.spawnModels(chesnut, 18, center, "chesnut", new Vector3(1, 1, 1));

        //Volcan
        await SceneLoader.ImportMeshAsync("", "", volcano, GlobalManager.scene).then((result) => {
            const volcanoRoot = new TransformNode("volcanoRoot", GlobalManager.scene);

            for (const mesh of result.meshes) {
                if (mesh !== result.meshes[0]) {
                    mesh.parent = volcanoRoot;
                }
            }

            volcanoRoot.scaling = new Vector3(200, 300, 200);
            volcanoRoot.rotation = new Vector3(0, Math.PI, 0);
            volcanoRoot.position = center.add(new Vector3(120, 27, -100));

            for (const child of result.meshes) {
                child.refreshBoundingInfo(true);
                if (child.getTotalVertices() > 0) {
                    const aggregate = new PhysicsAggregate(child, PhysicsShapeType.MESH, {
                        mass: 0,
                        friction: 0.5,
                        restitution: 0.1
                    }, GlobalManager.scene);
                    aggregate.body.setMotionType(PhysicsMotionType.STATIC);
                    child.receiveShadows = true;
                    child.checkCollisions = true;
                }
            }
        });
        await this.createWaterLake();

        //Téléporteur
        const resultSpaceGate = await SceneLoader.ImportMeshAsync("", "", spaceGateMesh, GlobalManager.scene);
        const spaceGate = resultSpaceGate.meshes[0];
        spaceGate.position = new Vector3(this.x+4, this.y+1.6, this.z);
        spaceGate.scaling = new Vector3(3.5, 3.5, 3.5);
        GlobalManager.addStaticPhysics(resultSpaceGate.meshes);

        //Particules téléporteur
        const jsonParticules = {"name":"CPU particle system","id":"default system","capacity":10000,"disposeOnStop":false,"manualEmitCount":-1,"emitter":[0,0,0],"particleEmitterType":{"type":"BoxParticleEmitter","direction1":[0,1,0],"direction2":[0,1,0],"minEmitBox":[-0.5,-0.5,-0.5],"maxEmitBox":[0.5,0.5,0.5]},"texture":{"tags":null,"url":"https://assets.babylonjs.com/core/textures/flare.png","uOffset":0,"vOffset":0,"uScale":1,"vScale":1,"uAng":0,"vAng":0,"wAng":0,"uRotationCenter":0.5,"vRotationCenter":0.5,"wRotationCenter":0.5,"homogeneousRotationInUVTransform":false,"isBlocking":true,"name":"https://assets.babylonjs.com/core/textures/flare.png","hasAlpha":false,"getAlphaFromRGB":false,"level":1,"coordinatesIndex":0,"optimizeUVAllocation":true,"coordinatesMode":0,"wrapU":1,"wrapV":1,"wrapR":1,"anisotropicFilteringLevel":4,"isCube":false,"is3D":false,"is2DArray":false,"gammaSpace":true,"invertZ":false,"lodLevelInAlpha":false,"lodGenerationOffset":0,"lodGenerationScale":0,"linearSpecularLOD":false,"isRenderTarget":false,"animations":[],"invertY":true,"samplingMode":3,"_useSRGBBuffer":false,"internalTextureLabel":"https://assets.babylonjs.com/core/textures/flare.png","noMipmap":false},"isLocal":false,"animations":[],"beginAnimationOnStart":false,"beginAnimationFrom":0,"beginAnimationTo":60,"beginAnimationLoop":false,"startDelay":0,"renderingGroupId":0,"isBillboardBased":true,"billboardMode":7,"minAngularSpeed":0,"maxAngularSpeed":0,"minSize":0.1,"maxSize":0.1,"minScaleX":1,"maxScaleX":1,"minScaleY":1,"maxScaleY":1,"minEmitPower":2,"maxEmitPower":2,"minLifeTime":1,"maxLifeTime":1.5,"emitRate":60,"gravity":[0,0,0],"noiseStrength":[10,10,10],"color1":[0.1450980392156863,0.1450980392156863,0.7333333333333333,1],"color2":[0.7294117647058823,0.27058823529411763,0.8549019607843137,1],"colorDead":[0,0,0,1],"updateSpeed":0.016666666666666666,"targetStopDuration":0,"blendMode":0,"preWarmCycles":0,"preWarmStepOffset":1,"minInitialRotation":0,"maxInitialRotation":0,"startSpriteCellID":0,"spriteCellLoop":true,"endSpriteCellID":0,"spriteCellChangeSpeed":1,"spriteCellWidth":0,"spriteCellHeight":0,"spriteRandomStartCell":false,"isAnimationSheetEnabled":false,"useLogarithmicDepth":false,"textureMask":[1,1,1,1],"customShader":null,"preventAutoStart":false,"worldOffset":[0,0,0]};
        const particules = ParticleSystem.Parse(jsonParticules, GlobalManager.scene, "");
        particules.particleEmitterType.minEmitBox.z = -1;
        particules.particleEmitterType.maxEmitBox.z = 1;
        particules.particleEmitterType.minEmitBox.x = -1;
        particules.particleEmitterType.maxEmitBox.x = 1;
        particules.emitter = new Vector3(this.x+4, this.y, this.z);
    }


    async spawnModels(modelPath, count, center, baseName, scale = new Vector3(1, 1, 1)) {
        const result = await SceneLoader.ImportMeshAsync("", "", modelPath, GlobalManager.scene);
        const base = result.meshes[0];
        base.setEnabled(false);

        const lakeCenter = Zaranthis.getPosition().add(new Vector3(-100, 0, 100));
        const lakeRadius = 85;
        const lakeBuffer = 15;
        let placed = 0;
        let specialCenter = center;
        let radius = 60;
        let randomness = 40;

        if (baseName.includes("greenTree") || baseName.includes("twistedTree") || baseName.includes("shiningTree")) {
            specialCenter = center;
            radius = 40;
            randomness = 25;
        }
        if (

            baseName.includes("creature") ||
            baseName.includes("alienMuscle")
        ) {
            specialCenter = center.add(new Vector3(30, 0, 50));
            radius = 80;
            randomness = 40;
        }
        if (baseName.includes("rock")) {
            radius = 100;
            randomness = 70;
        } else if (baseName.includes("crystal")) {
            radius = 100;
            randomness = 40;
        } else if (baseName.includes("plant") || baseName.includes("spike")) {
            radius = 85;
            randomness = 60;
        } else if (baseName.includes("Venus") || baseName.includes("Carnivore") || baseName.includes("cuteCreature") || baseName.includes("mushy") ||
            baseName.includes("alienRose") || baseName.includes("ketkout") || baseName.includes("chesnut")
            || baseName.includes("cuteCreature") || baseName.includes("cuteSpider") || baseName.includes("Flower")) {
            radius = 90;
            randomness = 55;
        }

        while (placed < count) {
            const clone = base.clone(`${baseName}_${placed}`, null);
            if (!clone) continue;

            const angle = Math.random() * Math.PI * 2;
            const distance = radius + Math.random() * randomness;

            const offsetX = Math.cos(angle) * distance;
            const offsetZ = Math.sin(angle) * distance;
            const candidatePosition = specialCenter.add(new Vector3(offsetX, 0, offsetZ));

            if (baseName.includes("chesnut") || baseName.includes("glowingFlower")) {
                const edgeOffset = 160; // presque à la limite du sol (350/2 = 175)
                const axis = Math.random() < 0.5 ? "x" : "z";

                if (axis === "x") {
                    candidatePosition.x = center.x + (Math.random() < 0.5 ? -edgeOffset : edgeOffset);
                } else {
                    candidatePosition.z = center.z + (Math.random() < 0.5 ? -edgeOffset : edgeOffset);
                }
            }
            const distFromLake = Vector3.Distance(candidatePosition, lakeCenter);
            const isCreature = baseName.includes("creature") || baseName.includes("alien");

            if (isCreature && distFromLake < lakeRadius + lakeBuffer + 10) continue;
            if (distFromLake < lakeRadius + lakeBuffer) continue;

            const volcanoCenter = center.add(new Vector3(120, 0, -100));
            const volcanoRadius = 80;
            const distFromVolcano = Vector3.Distance(candidatePosition, volcanoCenter);
            if (distFromVolcano < volcanoRadius) continue;

            let yOffset = 0;

            if (baseName.includes("alienMuscle")) {
                yOffset = 1.2;
            }

            else if (baseName.includes("alienRose")) {
                yOffset = 2.5;
            }

            else if (baseName.includes("cuteCreature")) {
                yOffset = 1.0;
            }

            else if (baseName.includes("creature")) {
                yOffset = 2.5;

            }

            else if (baseName.includes("Venus")) {
                yOffset = 0.05;
            }
            else if (baseName.includes("Carnivore")) {
                yOffset = 1.3
            }
            else if (baseName.includes("chesnut")) {
                yOffset = 1.5
            }

            clone.position = candidatePosition.add(new Vector3(0, yOffset, 0));
            clone.scaling = scale;
            if (baseName.includes("mushy") || baseName.includes("ketkout") || baseName.includes("chesnut")
                || baseName.includes("alien") || baseName.includes("cute")) {
                clone.lookAt(center); // 🔁 ils regardent vers le centre
            } else {
                clone.rotation.y = Math.random() * Math.PI * 2;
            }

            clone.setEnabled(true);
            for (const child of clone.getChildMeshes()) {
                if (child.getTotalVertices() > 0) {
                    child.refreshBoundingInfo(true);
                    const aggregate = new PhysicsAggregate(child, PhysicsShapeType.MESH, {
                        mass: 0,
                        friction: 0.4,
                        restitution: 0.1
                    }, GlobalManager.scene);
                    aggregate.body.setMotionType(PhysicsMotionType.STATIC);
                    child.receiveShadows = true;
                    child.checkCollisions = true;
                }
            }

            clone.checkCollisions = true;
            clone.receiveShadows = true;

            for (const child of clone.getChildMeshes()) {
                child.refreshBoundingInfo(true);
                if (child.getTotalVertices() > 0) {
                    const aggregate = new PhysicsAggregate(child, PhysicsShapeType.MESH, {
                        mass: 0,
                        friction: 0.4,
                        restitution: 0.1
                    }, GlobalManager.scene);
                    aggregate.body.setMotionType(PhysicsMotionType.STATIC);
                    child.receiveShadows = true;
                    child.checkCollisions = true;
                }
            }

            placed++;
        }
    }

    async createWaterLake() {
        const center = new Vector3(this.x, this.y, this.z);
        const lakePosition = center.add(new Vector3(-100, 0.05, 80));

        const waterMesh = MeshBuilder.CreateGround("waterMesh", {
            width: 120,
            height: 120,
            subdivisions: 32
        }, GlobalManager.scene);

        waterMesh.position = lakePosition;

        const waterMaterial = new WaterMaterial("waterMaterial", GlobalManager.scene);
        waterMaterial.bumpTexture = new Texture("https://assets.babylonjs.com/environments/waterbump.png", GlobalManager.scene);
        waterMaterial.windForce = -5;
        waterMaterial.waveHeight = 0.4;
        waterMaterial.bumpHeight = 0.1;
        waterMaterial.waveLength = 0.1;
        waterMaterial.colorBlendFactor = 0.3;
        waterMaterial.windDirection = new Vector3(1, 1);
        waterMaterial.waterColor = new Color3(0.1, 0.3, 0.6);

        waterMaterial.addToRenderList(GlobalManager.scene.getMeshByName("zaranthisGround"));

        waterMesh.material = waterMaterial;
        waterMesh.checkCollisions = true;

        const waterAggregate = new PhysicsAggregate(waterMesh, PhysicsShapeType.BOX, {
            mass: 0,
            friction: 0.9,
            restitution: 0.1
        }, GlobalManager.scene);
        waterAggregate.body.setMotionType(PhysicsMotionType.STATIC);
    }

} export default Zaranthis;
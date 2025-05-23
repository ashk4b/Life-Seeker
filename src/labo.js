import { Color3, ImportMeshAsync, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, PointLight, SceneLoader, ShadowGenerator, StandardMaterial, Texture, Tools, TransformNode, Vector3 } from "@babylonjs/core";
import { GlobalManager } from "./GlobalManager";
import floorLabo from "../assets/texture/sol_labo.png";
import doorMesh from "../assets/models/lab_door.glb";
import blackWindowMesh from "../assets/models/black_window.glb";
import labLightMesh from "../assets/models/labo_light.glb";
import labLightSwitchMesh from "../assets/models/light_switch.glb";
import labFurnitureMesh from "../assets/models/lab_furniture.glb";
import spaceGateMesh from "../assets/models/space_gate.glb";
import chemistryDeskMesh from "../assets/models/chemistry_desk.glb";
import messageBoard from "../assets/models/message_board.glb";
import deskMesh from "../assets/models/desk.glb";
import trashBinMesh from "../assets/models/trash_bin.glb";
import bookShelfMesh from "../assets/models/book_shelf.glb";
import upperCabinMesh from "../assets/models/upper_cabin.glb";
import scifiSmgMesh from "../assets/models/scifi_smg.glb";
import tableMesh from "../assets/models/table.glb";
import mapMesh from "../assets/models/map.glb";

const GROUND_WIDTH = 10;
const GROUND_HEIGHT = 0.1;
const GROUND_DEPTH = 10;
const WALL_HEIGHT = 8;

class Labo {

    x;
    y;
    z;

    labo = [];

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        //Création des murs du laboratoire
        //Sol
        const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20}, GlobalManager.scene);
        ground.position = new Vector3(0, -0.1, 0);

        let laboGround = MeshBuilder.CreateBox("laboGround", {width: GROUND_WIDTH, height: GROUND_HEIGHT, depth: GROUND_DEPTH}, GlobalManager.scene);
        laboGround.position = new Vector3(x, y, z);
        this.labo.push(laboGround);
        const matGround = new StandardMaterial("matGround", GlobalManager.scene);
        matGround.diffuseTexture = new Texture(floorLabo);
        matGround.diffuseTexture.uScale = 8;
        matGround.diffuseTexture.vScale = 8;
        matGround.specularPower = 90;
        laboGround.material = matGround;
        laboGround.receiveShadows = true;

        //Murs
        let rightWall = MeshBuilder.CreateBox("rightWal", {width: GROUND_HEIGHT, height: WALL_HEIGHT, depth: GROUND_DEPTH}, GlobalManager.scene);
        rightWall.parent = laboGround;
        rightWall.position = new Vector3(x+GROUND_WIDTH/2, y, z);
        const matWall = new StandardMaterial("matWall", GlobalManager.scene);
        matWall.emissiveColor = new Color3(0.4, 0.4, 0.4);
        rightWall.material = matWall;
        this.labo.push(rightWall);

        let leftWall = MeshBuilder.CreateBox("leftWall", {width:GROUND_HEIGHT, height: WALL_HEIGHT, depth: GROUND_DEPTH}, GlobalManager.scene);
        leftWall.parent = laboGround;
        leftWall.position = new Vector3(x-GROUND_WIDTH/2, y, z);
        leftWall.material = matWall;
        this.labo.push(leftWall);

        let frontWall = MeshBuilder.CreateBox("frontWall", {width:GROUND_WIDTH, height: WALL_HEIGHT, depth: GROUND_HEIGHT}, GlobalManager.scene);
        frontWall.parent = laboGround;
        frontWall.position = new Vector3(x, y, z+GROUND_DEPTH/2);
        frontWall.material = matWall;
        this.labo.push(frontWall);

        let behindWall = MeshBuilder.CreateBox("behindWall", {width:GROUND_WIDTH, height: WALL_HEIGHT, depth: GROUND_HEIGHT}, GlobalManager.scene);
        behindWall.parent = laboGround;
        behindWall.position = new Vector3(x, y, z-GROUND_DEPTH/2);
        behindWall.material = matWall;
        this.labo.push(behindWall);

        //Toit
        let laboRoof = MeshBuilder.CreateBox("laboGround", {width: GROUND_WIDTH, height: GROUND_HEIGHT, depth: GROUND_DEPTH}, GlobalManager.scene);
        laboRoof.parent = laboGround;
        laboRoof.position = new Vector3(x, y+WALL_HEIGHT/2, z);
        this.labo.push(laboRoof);

        GlobalManager.addStaticPhysics(this.labo);
    }

    async init() {
        //Importation de tous les Mesh du laboratoire
        //Porte
        const resultDoor = await SceneLoader.ImportMeshAsync("", "", doorMesh, GlobalManager.scene);
        const door = resultDoor.meshes[0];
        door.scaling = new Vector3(3.2, 2.2, 2.2);
        door.position = new Vector3((this.x-GROUND_WIDTH/2)+1, this.y, this.z-4.7);
        GlobalManager.addStaticPhysics(resultDoor.meshes);

        //Fenêtre
        const resultWindow = await SceneLoader.ImportMeshAsync("", "", blackWindowMesh, GlobalManager.scene);
        const window = resultWindow.meshes[0];
        window.scaling = new Vector3(0.6, 0.6, 1);
        window.position = new Vector3(this.x-0.5, this.y+1.7, (this.z-GROUND_DEPTH/2)+0.5);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const windowParent = new TransformNode("windowParent", GlobalManager.scene);
        for (let mesh of resultWindow.meshes) {
            mesh.setParent(windowParent);
        }
        windowParent.rotation.y = Tools.ToRadians(90);
        GlobalManager.addStaticPhysics(resultWindow.meshes);

        //Lustre
        const resultLight = await SceneLoader.ImportMeshAsync("", "", labLightMesh, GlobalManager.scene);
        const labLight = resultLight.meshes[0];
        labLight.position = new Vector3(this.x, this.y+2.8, this.z);
        labLight.scaling = new Vector3(0.1, 0.1, 0.1);
        //Lumière sur le lustre
        const lustreLight = new PointLight("lustreLight", Vector3.Zero(), GlobalManager.scene);
        lustreLight.intensity = 0.5;
        lustreLight.range = 10
        lustreLight.parent = labLight;
        //Ombres
        const shadowGeneratorLustre = new ShadowGenerator(1024, lustreLight);
        shadowGeneratorLustre.usePercentageCloserFiltering = true;
        shadowGeneratorLustre.filteringQuality = ShadowGenerator.QUALITY_HIGH;
        GlobalManager.addShadowGenerator(shadowGeneratorLustre);

        //Interrupteur lumière
        const resultSwitch = await SceneLoader.ImportMeshAsync("", "", labLightSwitchMesh, GlobalManager.scene);
        const lightSwitch = resultSwitch.meshes[0];
        lightSwitch.position = new Vector3(this.x-2.2, this.y+1.2, (this.z-GROUND_WIDTH/2)+0.1);
        lightSwitch.scaling = new Vector3(0.5, 0.5, 0.5);
        
        //Meuble
        const resultFurniture = await SceneLoader.ImportMeshAsync("", "", labFurnitureMesh, GlobalManager.scene);
        const furniture = resultFurniture.meshes[0];
        furniture.position = new Vector3(this.x-1, this.y+0.6, (this.z-GROUND_WIDTH/2)+1);
        furniture.scaling = new Vector3(1.2, 1.2, -1.2);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const furnitureParent = new TransformNode("furnitureParent", GlobalManager.scene);
        for (let mesh of resultFurniture.meshes) {
            mesh.setParent(furnitureParent);
        }
        furnitureParent.rotation.y = Tools.ToRadians(-15);
        furnitureParent.rotation.z = Tools.ToRadians(-2.5);
        GlobalManager.addStaticPhysics(resultFurniture.meshes);

        //Deuxième meuble
        const resultFurniture2 = await SceneLoader.ImportMeshAsync("", "", labFurnitureMesh, GlobalManager.scene);
        const furniture2 = resultFurniture2.meshes[0];
        furniture2.position = new Vector3(this.x-0.7, this.y+0.6, this.z-3.9);
        furniture2.scaling = new Vector3(1.2, 1.2, -1);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const furnitureParent2 = new TransformNode("furnitureParent2", GlobalManager.scene);
        for (let mesh of resultFurniture2.meshes) {
            mesh.setParent(furnitureParent2);
        }
        furnitureParent2.rotation.y = Tools.ToRadians(-103);
        furnitureParent2.rotation.z = Tools.ToRadians(-2.5);
        furnitureParent2.rotation.x = Tools.ToRadians(-3);
        GlobalManager.addStaticPhysics(resultFurniture2.meshes);

        //Téléporteur
        const resultSpaceGate = await SceneLoader.ImportMeshAsync("", "", spaceGateMesh, GlobalManager.scene);
        const spaceGate = resultSpaceGate.meshes[0];
        spaceGate.position = new Vector3(this.x-4.6, this.y+1.6, this.z-2);
        spaceGate.scaling = new Vector3(3.5, 3.5, -3.5);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const spaceGateParent = new TransformNode("spaceGateParent", GlobalManager.scene);
        for (let mesh of resultSpaceGate.meshes) {
            mesh.setParent(spaceGateParent);
        }
        spaceGateParent.rotation.y = Tools.ToRadians(70);
        GlobalManager.addStaticPhysics(resultSpaceGate.meshes);

        //Table de chimie
        const resultChemistryDesk = await SceneLoader.ImportMeshAsync("", "", chemistryDeskMesh, GlobalManager.scene);
        const chemistryDesk = resultChemistryDesk.meshes[0];
        chemistryDesk.position = new Vector3(this.x-4, this.y+1.2, (this.z-GROUND_WIDTH/2)+2.1);
        chemistryDesk.scaling = new Vector3(1, 1, 1);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const chemistryDeskParent = new TransformNode("chemistryDeskParent", GlobalManager.scene);
        for (let mesh of resultChemistryDesk.meshes) {
            mesh.setParent(chemistryDeskParent);
        }
        chemistryDeskParent.rotation.y = Tools.ToRadians(-85);
        chemistryDeskParent.rotation.z = Tools.ToRadians(1);
        GlobalManager.addStaticPhysics(resultChemistryDesk.meshes);

        //Tableau
        const resultBoard = await SceneLoader.ImportMeshAsync("", "", messageBoard, GlobalManager.scene);
        const board = resultBoard.meshes[0];
        board.position = new Vector3(this.x+4.8, this.y+1, this.z+1.8);
        board.scaling = new Vector3(0.015, 0.015, 0.017);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const boardParent = new TransformNode("cboardParent", GlobalManager.scene);
        for (let mesh of resultBoard.meshes) {
            mesh.setParent(boardParent);
        }
        boardParent.rotation.y = Tools.ToRadians(180);

        //Bureau
        const resultDesk = await SceneLoader.ImportMeshAsync("", "", deskMesh, GlobalManager.scene);
        const desk = resultDesk.meshes[0];
        desk.position = new Vector3(this.x-2, this.y+0.7, this.z-4.5);
        desk.scaling = new Vector3(1, 1, 1);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const deskParent = new TransformNode("deskParent", GlobalManager.scene);
        for (let mesh of resultDesk.meshes) {
            mesh.setParent(deskParent);
        }
        deskParent.rotation.y = Tools.ToRadians(-90);
        GlobalManager.addStaticPhysics(resultDesk.meshes);

        //Poubelle
        const resultBin = await SceneLoader.ImportMeshAsync("", "", trashBinMesh, GlobalManager.scene);
        const bin = resultBin.meshes[0];
        bin.position = new Vector3(this.x+4, this.y, this.z-4.2);
        bin.scaling = new Vector3(3, 3, -3);
        GlobalManager.addStaticPhysics(resultBin.meshes);

        //Bibliothèque
        const resultBookShelf = await SceneLoader.ImportMeshAsync("", "", bookShelfMesh, GlobalManager.scene);
        const bookShelf = resultBookShelf.meshes[0];
        bookShelf.position = new Vector3(this.x+1.9, this.y+0.3, this.z-4.7);
        bookShelf.scaling = new Vector3(2.3, 1.5, 1.5);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const bookShelfParent = new TransformNode("bookShelfParent", GlobalManager.scene);
        for (let mesh of resultBookShelf.meshes) {
            mesh.setParent(bookShelfParent);
        }
        bookShelfParent.rotation.y = Tools.ToRadians(90);
        GlobalManager.addStaticPhysics(resultBookShelf.meshes);

        //Petit meuble marron
        const resultUpperCabin = await SceneLoader.ImportMeshAsync("", "",  upperCabinMesh, GlobalManager.scene);
        const upperCabin = resultUpperCabin.meshes[0];
        upperCabin.position = new Vector3(this.x+1, this.y+0.5, this.z+4.7);
        upperCabin.scaling = new Vector3(2, 1.5, 1.8);
        GlobalManager.addStaticPhysics(resultUpperCabin.meshes);

        //SMG
        const resultScifiSmg = await SceneLoader.ImportMeshAsync("", "", scifiSmgMesh, GlobalManager.scene);
        const smg = resultScifiSmg.meshes[0];
        smg.position = new Vector3(this.x+0.9, this.y+4.6, this.z-1.1);
        smg.scaling = new Vector3(0.5, 0.5, 0.5);
        //Création d'un parent pour pouvoir pivoter le Mesh
        const smgParent = new TransformNode("smgParent", GlobalManager.scene);
        for (let mesh of resultScifiSmg.meshes) {
            mesh.setParent(smgParent);
        }
        smgParent.rotation.x = Tools.ToRadians(90);

        //Table au milieu
        const resultTable = await SceneLoader.ImportMeshAsync("", "", tableMesh, GlobalManager.scene);
        const table = resultTable.meshes[0];
        table.position = new Vector3(this.x, this.y, this.z);
        table.scaling = new Vector3(0.15, 0.12, 0.15);
        GlobalManager.addStaticPhysics(resultTable.meshes);

        //Carte
        const resultMap = await SceneLoader.ImportMeshAsync("", "", mapMesh, GlobalManager.scene);
        const map = resultMap.meshes[0];
        map.position = new Vector3(this.x, this.y+0.95, this.z);
        map.scaling = new Vector3(0.15, 0.15, 0.15);

        //Particules téléporteur
        const jsonParticules = {"name":"CPU particle system","id":"default system","capacity":10000,"disposeOnStop":false,"manualEmitCount":-1,"emitter":[0,0,0],"particleEmitterType":{"type":"BoxParticleEmitter","direction1":[0,1,0],"direction2":[0,1,0],"minEmitBox":[-0.5,-0.5,-0.5],"maxEmitBox":[0.5,0.5,0.5]},"texture":{"tags":null,"url":"https://assets.babylonjs.com/core/textures/flare.png","uOffset":0,"vOffset":0,"uScale":1,"vScale":1,"uAng":0,"vAng":0,"wAng":0,"uRotationCenter":0.5,"vRotationCenter":0.5,"wRotationCenter":0.5,"homogeneousRotationInUVTransform":false,"isBlocking":true,"name":"https://assets.babylonjs.com/core/textures/flare.png","hasAlpha":false,"getAlphaFromRGB":false,"level":1,"coordinatesIndex":0,"optimizeUVAllocation":true,"coordinatesMode":0,"wrapU":1,"wrapV":1,"wrapR":1,"anisotropicFilteringLevel":4,"isCube":false,"is3D":false,"is2DArray":false,"gammaSpace":true,"invertZ":false,"lodLevelInAlpha":false,"lodGenerationOffset":0,"lodGenerationScale":0,"linearSpecularLOD":false,"isRenderTarget":false,"animations":[],"invertY":true,"samplingMode":3,"_useSRGBBuffer":false,"internalTextureLabel":"https://assets.babylonjs.com/core/textures/flare.png","noMipmap":false},"isLocal":false,"animations":[],"beginAnimationOnStart":false,"beginAnimationFrom":0,"beginAnimationTo":60,"beginAnimationLoop":false,"startDelay":0,"renderingGroupId":0,"isBillboardBased":true,"billboardMode":7,"minAngularSpeed":0,"maxAngularSpeed":0,"minSize":0.1,"maxSize":0.1,"minScaleX":1,"maxScaleX":1,"minScaleY":1,"maxScaleY":1,"minEmitPower":2,"maxEmitPower":2,"minLifeTime":1,"maxLifeTime":1.5,"emitRate":60,"gravity":[0,0,0],"noiseStrength":[10,10,10],"color1":[0.1450980392156863,0.1450980392156863,0.7333333333333333,1],"color2":[0.7294117647058823,0.27058823529411763,0.8549019607843137,1],"colorDead":[0,0,0,1],"updateSpeed":0.016666666666666666,"targetStopDuration":0,"blendMode":0,"preWarmCycles":0,"preWarmStepOffset":1,"minInitialRotation":0,"maxInitialRotation":0,"startSpriteCellID":0,"spriteCellLoop":true,"endSpriteCellID":0,"spriteCellChangeSpeed":1,"spriteCellWidth":0,"spriteCellHeight":0,"spriteRandomStartCell":false,"isAnimationSheetEnabled":false,"useLogarithmicDepth":false,"textureMask":[1,1,1,1],"customShader":null,"preventAutoStart":false,"worldOffset":[0,0,0]};
        const particules = ParticleSystem.Parse(jsonParticules, GlobalManager.scene, "");
        particules.particleEmitterType.minEmitBox.z = -1;
        particules.particleEmitterType.maxEmitBox.z = 1;
        particules.particleEmitterType.minEmitBox.x = -1;
        particules.particleEmitterType.maxEmitBox.x = 1;
        particules.emitter = new Vector3(this.x-3, this.y, this.z+3.5);
    }

}

export default Labo;
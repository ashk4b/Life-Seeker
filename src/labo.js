import { Color3, MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, PointLight, SceneLoader, ShadowGenerator, StandardMaterial, Texture, Tools, TransformNode, Vector3 } from "@babylonjs/core";
import { GlobalManager } from "./GlobalManager";
import floorLabo from "../assets/texture/gris.png";
import doorMesh from "../assets/models/lab_door.glb";
import blackWindow from "../assets/models/black_window.glb";
import labLight from "../assets/models/labo_light.glb";
import labLightSwitch from "../assets/models/light_switch.glb";

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

        let rightWall = MeshBuilder.CreateBox("rightWal", {width: GROUND_HEIGHT, height: WALL_HEIGHT, depth: GROUND_DEPTH}, GlobalManager.scene);
        rightWall.parent = laboGround;
        rightWall.position = new Vector3(x+GROUND_WIDTH/2, y, z);
        const matWall = new StandardMaterial("matWall", GlobalManager.scene);
        //matWall.diffuseColor = new Color3(1, 1, 1);
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

        let laboRoof = MeshBuilder.CreateBox("laboGround", {width: GROUND_WIDTH, height: GROUND_HEIGHT, depth: GROUND_DEPTH}, GlobalManager.scene);
        laboRoof.parent = laboGround;
        laboRoof.position = new Vector3(x, y+WALL_HEIGHT/2, z);
        this.labo.push(laboRoof);

        for(let wallsLabo of this.labo){
            wallsLabo.refreshBoundingInfo(true);
            const meshAggregate =  new PhysicsAggregate(wallsLabo, PhysicsShapeType.MESH, {mass:0, friction: 0.4, restitution : 0.1}); 
            meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
            wallsLabo.receiveShadows = true;
        }
    }

    async init() {
        //Porte
        const resultDoor = await SceneLoader.ImportMeshAsync("", "", doorMesh, GlobalManager.scene);
        const door = resultDoor.meshes[0];
        door.scaling = new Vector3(3.2, 2.2, 2.2);
        door.position = new Vector3((this.x-GROUND_WIDTH/2)+1, this.y, this.z-4.7);

        for(let meshDoor of resultDoor.meshes){
            meshDoor.refreshBoundingInfo(true);
            if(meshDoor.getTotalVertices() > 0){
                const meshAggregate =  new PhysicsAggregate(meshDoor, PhysicsShapeType.MESH, {mass:0, friction: 0.4, restitution : 0.1}); 
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                meshDoor.receiveShadows = true;
            }
        }

        //Fenêtre
        const resultWindow = await SceneLoader.ImportMeshAsync("", "", blackWindow, GlobalManager.scene);
        const window = resultWindow.meshes[0];
        window.scaling = new Vector3(0.6, 0.6, 1);
        window.position = new Vector3(this.x-2, this.y+1.7, (this.z-GROUND_DEPTH/2)+0.5);

        //Création d'un parent pour pouvoir pivoter le Mesh
        const windowParent = new TransformNode("windowParent", GlobalManager.scene);
        for (let mesh of resultWindow.meshes) {
            mesh.setParent(windowParent);
        }
        windowParent.rotation.y = Tools.ToRadians(90);

        for (let meshWindow of resultWindow.meshes){
            meshWindow.refreshBoundingInfo(true);
            if(meshWindow.getTotalVertices() > 0){
                const meshAggregate = new PhysicsAggregate(meshWindow, PhysicsShapeType.MESH, {mass: 0, friction: 0.1, restitution: 0.1});
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                meshWindow.receiveShadows = true;
            }
        }

        //Lustre
        const resultLight = await SceneLoader.ImportMeshAsync("", "", labLight, GlobalManager.scene);
        const light = resultLight.meshes[0];
        light.position = new Vector3(this.x, this.y+2.8, this.z);
        light.scaling = new Vector3(0.1, 0.1, 0.1);
        //Lumière
        const lustreLight = new PointLight("lustreLight", Vector3.Zero(), GlobalManager.scene);
        lustreLight.intensity = 0.5;
        lustreLight.range = 10
        lustreLight.parent = light;
        //Ombres
        const shadowGeneratorLustre = new ShadowGenerator(1024, lustreLight);
        shadowGeneratorLustre.usePercentageCloserFiltering = true;
        shadowGeneratorLustre.filteringQuality = ShadowGenerator.QUALITY_HIGH;
        GlobalManager.addShadowGenerator(shadowGeneratorLustre);

        //Interrupteur lumière
        const resultSwitch = await SceneLoader.ImportMeshAsync("", "", labLightSwitch, GlobalManager.scene);
        const switchLight = resultSwitch.meshes[0];
        switchLight.position = new Vector3(this.x-2.2, this.y+1.2, (this.z-GROUND_WIDTH/2)+0.1);
        switchLight.scaling = new Vector3(0.5, 0.5, 0.5);
        //Création d'un parent pour pouvoir pivoter le Mesh
        // const switchParent = new TransformNode("switchParent", GlobalManager.scene);
        // for (let mesh of resultSwitch.meshes) {
        //     mesh.setParent(switchParent);
        // }
        // switchParent.rotation.y = Tools.ToRadians(180);

    }

}

export default Labo;
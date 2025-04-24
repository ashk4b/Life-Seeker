import { ActionManager, ArcRotateCamera, Color3, Color4, FollowCamera, FreeCamera, HavokPlugin, HemisphericLight, InterpolateValueAction, KeyboardEventTypes, Mesh, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, PointLight, Scene, SetValueAction, ShadowGenerator, SpotLight, StandardMaterial, Texture, Tools, Vector3 } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';
import HavokPhysics from "@babylonjs/havok";
import Player from "./player.js";
import { GlobalManager } from "./GlobalManager";
import { InputController } from "./InputController";
import Labo from "./labo.js";
import Zaranthis from "./zaranthis.js";

class Game {

    #canvas;
    #engine;
    #bInspector = false;
    #havokInstance;

    #zaranthisCamera;
    #laboCamera;

    #phase = 0.0;
    #vitesseY = 1.8;

    #player;
    #labo;
    #zaranthis;

    teleportZoneLabo;

    isPlayerReady = true;

    constructor(canvas, engine) {
        this.#canvas = canvas;
        this.#engine = engine;
        GlobalManager.init(canvas, engine);
    }

    async start() {
        await this.initGame()
        this.gameLoop();
        this.endGame();
    }

    createScene() {
        //Havok plugin
        const hk = new HavokPlugin(true, this.#havokInstance);
        GlobalManager.scene.enablePhysics(new Vector3(0, -9.8, 0), hk);

        //Camera du labo
        this.#laboCamera = new FreeCamera("freeCamera", new Vector3(5, 4, 5), GlobalManager.scene);
        this.#laboCamera.setTarget(Vector3.Zero());
        this.#laboCamera.attachControl(this.#canvas, true);
        GlobalManager.scene.activeCamera = this.#laboCamera;

        //Camera de zaranthis
        this.#zaranthisCamera = new FollowCamera("camera1", new Vector3(5000, 0, 0), GlobalManager.scene);
        this.#zaranthisCamera.heightOffset = 4;
        this.#zaranthisCamera.radius = -8;
        this.#zaranthisCamera.maxCameraSpeed = 1;
        this.#zaranthisCamera.cameraAcceleration = 0.025;
        this.#zaranthisCamera.rotationOffset = 180;
        this.#zaranthisCamera.attachControl(this.#canvas, true);

        //Light
        const light = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), GlobalManager.scene);
        light.intensity = 0.5;

        //Zone de téléportation
        this.teleportZoneLabo = MeshBuilder.CreateBox("teleportZone", { width: 0.5, height: 4, depth: 1.5 }, GlobalManager.scene);
        this.teleportZoneLabo.position = new Vector3(-3, 0, +3.5);

        
    }

    async getInitializedHavok() {
        return await HavokPhysics();
    }

    async initGame() {
        this.#havokInstance = await this.getInitializedHavok();

        GlobalManager.scene = new Scene(this.#engine);
        GlobalManager.scene.collisionsEnabled = true;
        InputController.init();
        this.createScene();

        this.#labo = new Labo(0, 0, 0);
        await this.#labo.init();

        //this.#zaranthis = new Zaranthis(5000, 0, 0);
        //await this.#zaranthis.init();

        this.#player = new Player(-3, 1, -4);
        //this.#player = new Player(5000, 0, 0);
        await this.#player.init();
        this.#zaranthisCamera.lockedTarget = this.#player.transform;
        GlobalManager.addShadowCaster(this.#player.gameObject);
    }

    endGame() {

    }

    gameLoop() {
        const divFps = document.getElementById("fps");
        this.#engine.runRenderLoop(() => {

            this.updateGame();

            //Debug
            if (InputController.actions["KeyI"]) {
                this.#bInspector = !this.#bInspector;

                if (this.#bInspector)
                    Inspector.Show();
                else
                    Inspector.Hide();
            }

            InputController.resetActions();
            divFps.innerHTML = this.#engine.getFps().toFixed() + " fps";
            GlobalManager.scene.render();
        });
    }

    updateGame() {
        let delta = this.#engine.getDeltaTime() / 1000.0;
        this.#player.update(InputController.inputMap, InputController.actions, delta);
    }
}

export default Game;
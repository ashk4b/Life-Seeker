import { ActionManager, ArcRotateCamera, Color3, Color4, FollowCamera, FreeCamera, HavokPlugin, HemisphericLight, InterpolateValueAction, KeyboardEventTypes, Mesh, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, PointLight, Scene, SetValueAction, ShadowGenerator, SpotLight, StandardMaterial, Texture, Tools, Vector3 } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';
import HavokPhysics from "@babylonjs/havok";
import Player from "./player.js";
import { GlobalManager } from "./GlobalManager";
import { InputController } from "./InputController";
import Labo from "./labo.js";

class Game {

    #canvas;
    #engine;
    #bInspector = false;
    #gameCamera;
    #havokInstance;

    #phase = 0.0;
    #vitesseY = 1.8;

    #player;
    #labo;

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

        //Camera
        this.#gameCamera = new FreeCamera("freeCamera", new Vector3(5, 4, 5), GlobalManager.scene);
        this.#gameCamera.setTarget(Vector3.Zero());
        this.#gameCamera.attachControl(this.#canvas, true);

        //Light
        const light = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), GlobalManager.scene);
        light.intensity = 0.5;

        //Ground
        const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20}, GlobalManager.scene);
        ground.position = new Vector3(0, -0.1, 0);
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

        this.#player = new Player(-3, 1, -4);
        await this.#player.init();
        //this.#gameCamera.lockedTarget = this.#player.transform;
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

        //Animation
        //this.#phase += this.#vitesseY * delta;
    }
}

export default Game;
import { ActionManager, ArcRotateCamera, Color3, Color4, FollowCamera, FreeCamera, HavokPlugin, HemisphericLight, InterpolateValueAction, KeyboardEventTypes, Mesh, MeshBuilder, ParticleSystem, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, PointerEventTypes, PointLight, Scene, SetValueAction, ShadowGenerator, SpotLight, StandardMaterial, Texture, Tools, Vector3 } from "@babylonjs/core";
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

    #currentPlayer;
    #playerLabo;
    #playerZaranthis;
    #labo;
    #zaranthis;

    teleportZoneLabo;
    teleportZoneZaranthis;
    teleportCooldown = 0;


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

        //Camera du laboratoire
        this.#laboCamera = new FreeCamera("freeCamera", new Vector3(5, 4, 5), GlobalManager.scene);
        this.#laboCamera.setTarget(Vector3.Zero());
        GlobalManager.scene.activeCamera = this.#laboCamera;

        //Camera de Zaranthis
        this.#zaranthisCamera = new FollowCamera("camera1", new Vector3(5000, 0, 0), GlobalManager.scene);
        this.#zaranthisCamera.heightOffset = 2;
        this.#zaranthisCamera.radius = -8;
        this.#zaranthisCamera.maxCameraSpeed = 1;
        this.#zaranthisCamera.cameraAcceleration = 0.025;
        this.#zaranthisCamera.rotationOffset = 180;
        this.#zaranthisCamera.attachControl(this.#canvas, false, false, false);
        this.#zaranthisCamera.checkCollisions = true;
        this.#zaranthisCamera.ellipsoid = new Vector3(1, 1, 1);
        this.#zaranthisCamera.ellipsoidOffset = new Vector3(0, 2, 0);
        this.setupCameraMouseControl();

        //Lumière
        const light = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), GlobalManager.scene);
        light.intensity = 0.5;

        //Zone de téléportation du laboratoire
        this.teleportZoneLabo = MeshBuilder.CreateBox("teleportZone", {width: 0.5, height: 4, depth: 1.5}, GlobalManager.scene);
        this.teleportZoneLabo.position = new Vector3(-3, 0, +3.5);
        this.teleportZoneLabo.checkCollisions = true;
        this.teleportZoneLabo.isVisible = false;

        //Zone de téléportation de Zaranthis
        this.teleportZoneZaranthis = MeshBuilder.CreateBox("teleportZoneZaranthis", {width: 0.5, height: 4, depth: 1.5}, GlobalManager.scene);
        this.teleportZoneZaranthis.position = new Vector3(5004.4, 0, -0.5);
        this.teleportZoneZaranthis.rotation.y = Tools.ToRadians(-110);
        this.teleportZoneZaranthis.checkCollisions = true;
        this.teleportZoneZaranthis.isVisible = false;
    }

    async getInitializedHavok() {
        return await HavokPhysics();
    }

    async initGame() {
        //Instanciation du moteur physique
        this.#havokInstance = await this.getInitializedHavok();

        //Instanciation de la scène
        GlobalManager.scene = new Scene(this.#engine);
        GlobalManager.scene.collisionsEnabled = true;
        InputController.init();
        this.createScene();

        //Instanciation du laboratoire
        this.#labo = new Labo(0, 0, 0);
        await this.#labo.init();

        //Instanciation de Zaranthis
        this.#zaranthis = new Zaranthis(5000, 0, 0);
        await this.#zaranthis.init();

        //Instanciation du joueur du laboratoire
        this.#playerLabo = new Player(-3, 1, -4);
        await this.#playerLabo.init();
        GlobalManager.addShadowCaster(this.#playerLabo.gameObject);
        this.#currentPlayer = this.#playerLabo;

        //Instanciation du joueur de Zaranthis
        this.#playerZaranthis = new Player(5004, 1, -1);
        await this.#playerZaranthis.init();
        this.#playerZaranthis.in_labo = false;
        GlobalManager.addShadowCaster(this.#playerZaranthis.gameObject);
        this.#zaranthisCamera.lockedTarget = this.#playerZaranthis.transform;
        
    }

    endGame() {

    }

    gameLoop() {
        const divFps = document.getElementById("fps");
        this.#engine.runRenderLoop(() => {
            this.updateGame();
            //Inspincteur
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

    teleportToZaranthis() {
        //Désactivation du parent du player du labo et activation du player de Zaranthis
        this.#playerLabo.transform.setEnabled(false);
        this.#playerZaranthis.transform.setEnabled(true);

        //Changement du player courant
        this.#currentPlayer = this.#playerZaranthis;

        //Changement de caméra courante
        this.#zaranthisCamera.lockedTarget = this.#playerZaranthis.transform;
        GlobalManager.scene.activeCamera = this.#zaranthisCamera;

        //Permet d'éviter la téléportation infinie (une téléportation toutes les 2 secondes)
        this.teleportCooldown = 2;
    }
    
    teleportToLabo() {
        //Désactivation du parent du player de Zaranthis et activation du player du labo
        this.#playerZaranthis.transform.setEnabled(false);
        this.#playerLabo.transform.setEnabled(true);

        //Changement du player courant
        this.#currentPlayer = this.#playerLabo;

        //Changement de caméra courante
        GlobalManager.scene.activeCamera = this.#laboCamera;
        //Permet d'éviter la téléportation infinie (une téléportation toutes les 2 secondes)
        this.teleportCooldown = 2;
    }    

    checkTeleportation() {
        //Méthode qui vérifie si le joueur rentre dans le téléporteur
        const playerPos = this.#currentPlayer.transform.position;
        if (playerPos.subtract(this.teleportZoneLabo.position).length() < 1.5 && this.#currentPlayer.in_labo) {
            this.teleportToZaranthis();
        } else if (playerPos.subtract(this.teleportZoneZaranthis.position).length() < 1.5 && !this.#currentPlayer.in_labo) {
            this.teleportToLabo();
        }
    }

    updateGame() {
        //FPS
        let delta = this.#engine.getDeltaTime() / 1000.0;

        this.#currentPlayer.update(delta);
        //Vérifie si 2 secondes se sont écoulées depuis la dernière téléportation
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= this.#engine.getDeltaTime() / 1000;
        } else {
            this.checkTeleportation();
        }
    }

    setupCameraMouseControl() {
        let lastX = 0;
        let lastY = 0;
        let isFirstMove = true;
        let verticalOffset = this.#zaranthisCamera.heightOffset;

        const minOffset = 1;
        const maxOffset = 3;

        this.#canvas.addEventListener("pointermove", (evt) => {
            if (isFirstMove) {
                lastX = evt.clientX;
                lastY = evt.clientY;
                isFirstMove = false;
                return;
            }

            const deltaX = evt.clientX - lastX;
            const deltaY = evt.clientY - lastY;

            // Seulement appliquer le changement si le mouvement est significatif
            if (Math.abs(deltaX) > 0.5) {
                this.#zaranthisCamera.rotationOffset += deltaX * 0.5;
            }

            if (Math.abs(deltaY) > 0.5) {
                verticalOffset -= deltaY * 0.1;
                verticalOffset = Math.max(minOffset, Math.min(maxOffset, verticalOffset));
                this.#zaranthisCamera.heightOffset = verticalOffset;
            }
            lastX = evt.clientX;
            lastY = evt.clientY;
        });

        this.#canvas.addEventListener("pointerout", () => {
            isFirstMove = true;
        });

        this.#canvas.addEventListener("pointerenter", () => {
            isFirstMove = true;
        });
    }


}

export default Game;
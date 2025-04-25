import { Axis, Mesh, MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShape, PhysicsShapeType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import astronaut from "../assets/models/toon_astronaut.glb";
import { GlobalManager } from "./GlobalManager";
import { InputController } from "./InputController";

const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.4;

class Player {

    //Position dans le monde
    transform;

    //Mesh
    gameObject;

    //Animations
    animationsGroup;
    bWalking = false;
    idleAnim;
    runAnim;
    walkAnim;
    runningSpeed = 2;
    in_labo = true;

    //Position et vitesse
    x = 0.0;
    y = 0.0;
    z = 0.0;
    speedX = 0.0;
    speedY = 0.0;
    speedZ = 0.0;

    //Physique
    capsuleAggregate;

    constructor(x, y, z) {
        //Position
        this.x = x || 0.0;
        this.y = y || 0.0;
        this.z = z || 0.0;
        //Parent du Mesh player pour suivre les déplacements
        this.transform = new MeshBuilder.CreateCapsule("player", { height: PLAYER_HEIGHT, radius: PLAYER_RADIUS }, GlobalManager.scene);
        this.transform.visibility = 0.0;
        this.transform.position = new Vector3(this.x, this.y, this.z);
    }

    async init() {
        //Import du Mesh player 
        const result = await SceneLoader.ImportMeshAsync("", "", astronaut, GlobalManager.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.scaling = new Vector3(1, 1, 1);
        this.gameObject.position = new Vector3(0, -PLAYER_HEIGHT / 2, 0);
        this.gameObject.rotate(Vector3.UpReadOnly, Math.PI);
        this.gameObject.bakeCurrentTransformIntoVertices();
        this.gameObject.checkCollisions = true;
    
        //Ombres
        for (let playerMesh of result.meshes) {
            playerMesh.receiveShadows = true;
            playerMesh.castShadows = true;
            GlobalManager.addShadowCaster(playerMesh);
        }
    
        //Physique
        this.capsuleAggregate = new PhysicsAggregate(this.transform, PhysicsShapeType.CAPSULE, { mass: 1, friction: 1, restitution: 0.1 }, GlobalManager.scene);
        this.capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        this.capsuleAggregate.body.setMassProperties({ inertia: new Vector3(0, 0, 0), centerOfMass: new Vector3(0, PLAYER_HEIGHT / 2, 0), mass: 1 });
    
        //Assignation du parent pour les déplacements
        this.gameObject.parent = this.transform;
    
        //Animations
        this.animationsGroup = result.animationGroups;
        this.idleAnim = result.animationGroups.find(group => group.name.toLowerCase().includes("idle"));
        this.walkAnim = result.animationGroups.find(group => group.name.toLowerCase().includes("walk"));
        this.runAnim = result.animationGroups.find(group => group.name.toLowerCase().includes("run"));
        this.animationsGroup.forEach(group => group.stop());
        this.idleAnim.start(true, 1.0, this.idleAnim.from, this.idleAnim.to, false);
    }
    
    update(delta) {
        //Gravité
        let currentVelocity = this.capsuleAggregate.body.getLinearVelocity();
        currentVelocity = new Vector3(this.speedX, currentVelocity.y, this.speedZ);

        
        //Mouvement en fonction de l'orentation de la caméra
        const camera = GlobalManager.scene.activeCamera;
        let move = Vector3.Zero();
        //Détection des inputs
        if (InputController.inputMap["KeyW"])
            move.addInPlace(camera.getDirection(Axis.Z));
        if (InputController.inputMap["KeyS"])
            move.addInPlace(camera.getDirection(Axis.Z).negate());
        if (InputController.inputMap["KeyA"])
            move.addInPlace(camera.getDirection(Axis.X).negate());
        if (InputController.inputMap["KeyD"])
            move.addInPlace(camera.getDirection(Axis.X));

        //Animation de mouvement
        if (move.length() > 0.1) {
            move.normalize();

            this.speedX = move.x * this.runningSpeed;
            this.speedZ = move.z * this.runningSpeed;

            const directionXZ = new Vector3(this.speedX, 0, this.speedZ);
            this.gameObject.lookAt(directionXZ.normalize());
            if (!this.bWalking) {
                if (!this.in_labo) {
                    this.runningSpeed = 6;
                    this.runAnim.start(true, 1.0, this.runAnim.from, this.runAnim.to, false);
                } else {
                    this.runningSpeed = 2;
                    this.walkAnim.start(true, 1.0, this.walkAnim.from, this.walkAnim.to, false);
                }
                this.bWalking = true;
            }
        } else {
            //Arrêt du mouvement
            this.speedX += (-12.0 * this.speedX * delta);
            this.speedZ += (-12.0 * this.speedZ * delta);

            //Arrêt
            if (this.bWalking) {
                this.runAnim.stop();
                this.walkAnim.stop();
                this.idleAnim.start(true, 1.0, this.idleAnim.from, this.idleAnim.to, false);
                this.bWalking = false;
            }
        }

        //Gravité
        currentVelocity = this.capsuleAggregate.body.getLinearVelocity();
        currentVelocity = new Vector3(this.speedX, 0 + currentVelocity.y, this.speedZ);

        //Appliquer la vitesse au corps
        this.capsuleAggregate.body.setLinearVelocity(currentVelocity);
    }

}

export default Player;
import { Axis, Mesh, MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShape, PhysicsShapeType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import astronaut from "../assets/models/toon_astronaut.glb";
import { GlobalManager } from "./GlobalManager";

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
    in_labo = false;

    //Position et vitesse
    x = 0.0;
    y = 0.0;
    z = 0.0;
    speedX = 0.0;
    speedY = 0.0;
    speedZ = 0.0;

    //Physics
    capsuleAggregate;

    constructor(x, y, z) {

        this.x = x || 0.0;
        this.y = y || 0.0;
        this.z = z || 0.0;
        this.transform = new MeshBuilder.CreateCapsule("player", { height: PLAYER_HEIGHT, radius: PLAYER_RADIUS }, GlobalManager.scene);
        this.transform.visibility = 0.0;
        this.transform.position = new Vector3(this.x, this.y, this.z);
    }

    async init() {
        //Creation du mesh
        const result = await SceneLoader.ImportMeshAsync("", "", astronaut, GlobalManager.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.scaling = new Vector3(1, 1, 1);
        this.gameObject.position = new Vector3(0, -PLAYER_HEIGHT / 2, 0);
        this.gameObject.rotate(Vector3.UpReadOnly, Math.PI);
        this.gameObject.bakeCurrentTransformIntoVertices();
        this.gameObject.checkCollisions = true;

        for (let playerMesh of result.meshes) {
            playerMesh.receiveShadows = true;
            playerMesh.castShadows = true;
            GlobalManager.addShadowCaster(playerMesh);
        }

        //Physic havok
        this.capsuleAggregate = new PhysicsAggregate(this.transform, PhysicsShapeType.CAPSULE, { mass: 1, friction: 1, restitution: 0.1 }, GlobalManager.scene);
        this.capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

        //Bloque la rotation du player
        this.capsuleAggregate.body.setMassProperties({ inertia: new Vector3(0, 0, 0), centerOfMass: new Vector3(0, PLAYER_HEIGHT / 2, 0), mass: 1 });

        //Accrochage du mesh au parent
        this.gameObject.parent = this.transform;

        //Animation du mesh
        this.animationsGroup = result.animationGroups;
        this.animationsGroup[0].stop();
        this.idleAnim = GlobalManager.scene.getAnimationGroupByName("idle");
        this.runAnim = GlobalManager.scene.getAnimationGroupByName("run");
        this.walkAnim = GlobalManager.scene.getAnimationGroupByName("walk");
        this.idleAnim.start(true, 1.0, this.idleAnim.from, this.idleAnim.to, false);

    }

    //Pour le moment on passe les events clavier ici, on utilisera un InputManager plus tard
    update(inputMap, actions, delta) {
        //Gravité
        let currentVelocity = this.capsuleAggregate.body.getLinearVelocity();
        currentVelocity = new Vector3(this.speedX, currentVelocity.y, this.speedZ);

        //Inputs
        const camera = GlobalManager.scene.activeCamera;
        let move = Vector3.Zero();

        if (inputMap["KeyW"])
            move.addInPlace(camera.getDirection(Axis.Z));
        if (inputMap["KeyS"])
            move.addInPlace(camera.getDirection(Axis.Z).negate());
        if (inputMap["KeyA"])
            move.addInPlace(camera.getDirection(Axis.X).negate());
        if (inputMap["KeyD"])
            move.addInPlace(camera.getDirection(Axis.X));

        //Mouvement
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

        // Appliquer la vitesse au corps
        this.capsuleAggregate.body.setLinearVelocity(currentVelocity);
    }

}

export default Player;
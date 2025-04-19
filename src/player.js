import { Mesh, MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShape, PhysicsShapeType, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import astronaut from "../assets/models/toon_astronaut.glb";
import { GlobalManager } from "./GlobalManager";

const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.4;
let RUNNING_SPEED = 6;

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
        this.transform = new MeshBuilder.CreateCapsule("player", {height: PLAYER_HEIGHT, radius: PLAYER_RADIUS}, GlobalManager.scene); 
        this.transform.visibility = 0.0; 
        this.transform.position = new Vector3(this.x, this.y, this.z); 
    }

    async init() {
        //Creation du mesh
        const result = await SceneLoader.ImportMeshAsync("", "", astronaut, GlobalManager.scene);
        this.gameObject = result.meshes[0];
        this.gameObject.scaling = new Vector3(1, 1, 1);
        this.gameObject.position = new Vector3(0, -PLAYER_HEIGHT/2, 0);
        this.gameObject.rotate(Vector3.UpReadOnly, Math.PI);
        this.gameObject.bakeCurrentTransformIntoVertices();
        this.gameObject.checkCollisions = true;

        //Physic havok
        this.capsuleAggregate = new PhysicsAggregate(this.transform, PhysicsShapeType.CAPSULE, {mass: 1, friction: 1, restitution: 0.1 }, GlobalManager.scene); 
        this.capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC); 

        //Bloque la rotation du player
        this.capsuleAggregate.body.setMassProperties({inertia : new Vector3(0, 0, 0), centerOfMass : new Vector3(0, PLAYER_HEIGHT/2, 0), mass: 1});

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
        if (inputMap["KeyA"])
            this.speedX = -RUNNING_SPEED;
        else if (inputMap["KeyD"])
            this.speedX = RUNNING_SPEED;
        else {
            this.speedX += (-12.0 * this.speedX * delta);
        }

        if (inputMap["KeyW"])
            this.speedZ = RUNNING_SPEED;
        else if (inputMap["KeyS"])
            this.speedZ = -RUNNING_SPEED;
        else {
            this.speedZ += (-12.0 * this.speedZ * delta);
        }

        //Gravité + saut
        let impulseY = 0;
        currentVelocity = new Vector3(this.speedX, impulseY + currentVelocity.y, this.speedZ);

        //Update position
        this.capsuleAggregate.body.setLinearVelocity(currentVelocity);

        //Orientation
        let directionXZ = new Vector3(this.speedX, 0, this.speedZ);
        

        //Animations
        if (directionXZ.length() > 2.5) {
            this.gameObject.lookAt(directionXZ.normalize());
            if (!this.bWalking) {
                this.runAnim.start(true, 1.0, this.runAnim.from, this.runAnim.to, false);
                this.bWalking = true;
            }
        }
        else {
            if (this.bWalking) {
                this.runAnim.stop();
                this.idleAnim.start(true, 1.0, this.runAnim.from, this.runAnim.to, false);
                this.bWalking = false;
            }
        }
    }

}

export default Player;
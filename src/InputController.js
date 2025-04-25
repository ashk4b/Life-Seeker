import { KeyboardEventTypes } from "@babylonjs/core";
import { GlobalManager } from "./GlobalManager";

class InputController {

    inputMap = {};
    actions = {};

    static get instance() {
        return (globalThis[Symbol.for(`PF_${InputController.name}`)] ||= new this());
    }

    constructor() {

    }

    init() {
        GlobalManager.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.code] = true;
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.code] = false;
                    this.actions[kbInfo.event.code] = true;
                    break;
            }
        });

    }

    update() {

    }

    resetActions() {
        this.actions = {};
    }


} 

//Destructuring on ne prends que la propriété statique instance 
const {instance} = InputController; 
export { instance as InputController }; 
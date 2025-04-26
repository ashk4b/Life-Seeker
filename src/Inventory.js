import * as GUI from "@babylonjs/gui"; // ← cette ligne est super importante !

export class Inventory {
    constructor(scene) {
        this.scene = scene;
        this.objets = [];
        this.inventaireVisible = false;

        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);

        this.panel = new GUI.StackPanel();
        this.panel.width = "220px";
        this.panel.height = "300px";
        this.panel.background = "rgba(0,0,0,0.7)";
        this.panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.panel.top = "10px";
        this.panel.left = "10px";
        this.panel.isVisible = false;

        this.advancedTexture.addControl(this.panel);
    }

    ajouterObjet(nomObjet) {
        this.objets.push(nomObjet);
        if (this.inventaireVisible) {
            this.mettreAJourUI();
        }
    }

    basculerAffichage() {
        this.inventaireVisible = !this.inventaireVisible;
        this.panel.isVisible = this.inventaireVisible;
        if (this.inventaireVisible) {
            this.mettreAJourUI();
        }
    }

    mettreAJourUI() {
        this.panel.clearControls();
        for (const nom of this.objets) {
            const item = new GUI.TextBlock();
            item.text = "- " + nom;
            item.color = "white";
            item.height = "30px";
            this.panel.addControl(item);
        }
    }
}

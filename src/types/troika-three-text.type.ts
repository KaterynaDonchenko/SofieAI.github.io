declare module 'troika-three-text' {
    import { Object3D } from 'three'

    export class Text extends Object3D {
        text: string;
        fontSize?: number;
        fontWeight?: number | string;
        maxWidth?: number;
        anchorX?: "left" | "center" | "right";
        anchorY?: "top" | "middle" | "bottom";
        color?: string;
        fillOpacity?: number;
        refCallback?: (ref: Text | null) => void;
        sync(): void;
    }
}



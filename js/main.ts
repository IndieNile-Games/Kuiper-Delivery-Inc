/*

Why am I no longer using C++?
Basically, C++ is something I like to call a "no bullshit" language.
That means I can't make bullshit or yandredev code as a quick fix.
I am not skilled enough in C++ to make "good" code and I don't have the 
time to learn how to. My best solution was to use typescript, which just
adds a little bit of structure to javascript, while still allowing for a
*little* bit of bullshit. I need that little bit.

*/ 

declare const Sprite: SpriteConstructor; // Only way I could get LMS canvas to work
declare const JoyStick: JoyStickConstructor;
declare function rsjs(element: HTMLElement, resize_type: ResizeType, options: ResizeJSOptions, scale?: number): void; // Load the ResizeJS lib

type bool = boolean; // I'm used to typing "bool", and I will never not be used to it.

interface JoyStickOptions {
    title?: string,
    width?: number,
    height?: number,
    internalFillColor?: string,
    internalLineWidth ?: number,
    internalStrokeColor?: string,
    externalLineWidth?: number,
    externalStrokeColor?: string,
    autoReturnToCenter?: bool,
};
interface JoyStickConstructor {
    new (htmlElementID: string, paramaters?: JoyStickOptions): JoyStick
};
type JoyStickDirections = "C" | "N" | "S" | "E" | "W" | "NW" | "SE" | "NE" | "SW"
interface JoyStick {
    GetWidth(): number,
    GetHeight(): number,
    GetPosX(): number,
    GetPosY(): number,
    GetX(): string,
    GetY(): string,
    GetDir(): JoyStickDirections
};

let joystick: JoyStick = null;

type ResizeType = "full" | "reset" | "specific";
interface ResizeJSOptions {
    margin_width?: number,
    margin_height?: number,
    min_width?: number,
    min_height?: number,
    max_width?: number,
    max_height?: number,
    width?: number,
    height?: number,
    keep_aspect_ratio?: bool
}

// Interfaces for LMS Canvas. I won't explain them here.
interface SpriteConstructor {
    new (src: string, frameWidth: number, frameHeight: number, frameCount: number, frameStart?: number, framesUntilUpdate?: number): Sprite,
};
interface Sprite {
    image: HTMLImageElement,
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
    frameStart: number,
    currentFrame: number,
    rotation: number
    
    getFramePosition(x?: number, y?: number): {x: number, y: number},
    update(): void,
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void;
};

class Sound {
    private audElement: HTMLAudioElement = <HTMLAudioElement>document.createElement("audio");

    constructor(src: string, loop: bool = false, volume: number = 1) {
        this.audElement.src = src;
        this.audElement.loop = loop;
        this.audElement.volume = volume;
    };

    public getVol(): number {
        return this.audElement.volume
    };
    public setVol(vol: number): number {
        this.audElement.volume = vol;
        return this.audElement.volume;
    };

    public getTime(): number {
        return this.audElement.currentTime;
    };
    public setTime(seconds: number): number {
        this.audElement.currentTime = seconds;
        return this.audElement.currentTime;
    };

    public play(): void {
        this.audElement.play();
    };
    public pause(): void {
        this.audElement.pause();
    };
    public stop(): void {
        this.pause();
        this.setTime(0);
    };
    public reset(): void {
        this.stop();
        this.play();
    };
};
class BGM extends Sound {
    constructor(src: string, vol: number = 1) {
        super(src, true, vol);
    };
};
class SFX extends Sound {
    constructor(src: string, vol: number = 1) {
        super(src, false, vol);
    };
};

function rad(degrees: number): number { // Convert degrees to radians
    return degrees * (Math.PI / 180);
};
function ratio(a1: number, a2: number, b1: number): number { // In a situation where a1:a2 = b1:b2, get b2
    return b1 * (a2 / a1);
};
function getScaleForPixel(oldSize: number, newSize: number): number { // Leftover from C++ days. Tells you the scale factor you need to scale pixels to another set of pixels.
    return ratio(oldSize, 1, newSize);
};
function fpsToMilliseconds(fps: number): number { // Convert FPS to milliseconds
    return 1000 / fps;
};
function angle(cx: number, cy: number, ex: number, ey: number): number { // Get angle of line
    var dy: number = ey - cy;
    var dx: number = ex - cx;
    var theta: number = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta;
};
function angle360(cx: number, cy: number, ex: number, ey: number): number {  // Get angle of line (360)
    var theta: number = angle(cx, cy, ex, ey); // range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
};
function weightedRandom(weight: number[], num: number[]): number {
    let n: number = Math.floor(Math.random()*100);
    let amt: number = 0;
    for (let i: number = 0; i < weight.length; i++) {
        amt += weight[i];
        if (n < amt) return num[i];
    };
};
function isMobile(): bool {
    return window.matchMedia("only screen and (max-width: 760px)").matches;
};
function invertHex(hex: string): string {
    return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
};


const fireButton: HTMLImageElement = <HTMLImageElement>document.querySelector("#fireBtn");
const dashButton: HTMLImageElement = <HTMLImageElement>document.querySelector("#dashBtn");

let fireButtonState: number = 0;
let dashButtonState: number = 2;


const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("#canvas");
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");


const globalSpeed: number = 3;
const globaFriction: number = 0.9;
const globalFPS: number = 30;


type KeystateList = bool[];
class Keys {
    public static KEY_W: number = 87;
    public static KEY_A: number = 65;
    public static KEY_S: number = 83;
    public static KEY_D: number = 68;
    public static KEY_SPACE: number = 32;


    public static state: KeystateList = [];
    public static getState(key: number): bool {
        return Keys.state[key];
    };
    
    public static handleKeydown(e: {keyCode: number}): void {
        Keys.state[e.keyCode] = true;
    };
    public static handleKeyup(e: {keyCode: number}): void {
        delete Keys.state[e.keyCode];
    };
};
document.addEventListener("keydown", Keys.handleKeydown);
document.addEventListener("keyup", Keys.handleKeyup);

class Mouse {
    public static readonly MOUSELEFT: number = 0;
    public static readonly MOUSEMIDDLE: number = 1;
    public static readonly MOUSERIGHT: number = 2;

    public static x: number = 0;
    public static y: number = 0;
    public static left: bool = false;
    public static middle: bool = false;
    public static right: bool = false;

    public static toRect(): Rect {
        return new Rect(Mouse.x, Mouse.y, 1, 1);
    };

    public static handleMousedown(e: MouseEvent): void {
        if (e.button === Mouse.MOUSELEFT) {
            Mouse.left = true;
        } else if (e.button === Mouse.MOUSEMIDDLE) {
            Mouse.middle = true;
        } else if (e.button === Mouse.MOUSERIGHT) {
            Mouse.right = true;
        };
    };
    public static handleMouseup(e: MouseEvent): void {
        Mouse.left = false;
        Mouse.middle = false;
        Mouse.right = false;
    };
    public static handleMousemove(e: {pageX: number, pageY: number}): void {
        Mouse.x = Math.floor(e.pageX - canvas.getBoundingClientRect().x);
        Mouse.y = Math.floor(e.pageY - canvas.getBoundingClientRect().y);
    };
};
canvas.addEventListener("mousedown", Mouse.handleMousedown);
canvas.addEventListener("mouseup", Mouse.handleMouseup);
canvas.addEventListener("mousemove", Mouse.handleMousemove);

class Rect {
    public x: number; // X position
    public y: number; // Y position
    public width: number; // Width
    public height: number; // Height
    public sprite: Sprite = null;

    constructor(x: number, y: number, width: number = 0, height: number = 0, sprite: Sprite = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprite = sprite;
    };

    public toRect(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    };

    public collidingWith(rect: Rect): bool {
        const yrect: Rect = this.toRect();
        const urect: Rect = rect.toRect();
        return yrect.x < urect.x + urect.width 
        && yrect.x + yrect.width > urect.x 
        && yrect.y < urect.y + urect.height 
        && yrect.y + yrect.height > urect.y;
    };
    public insideOf(rect: Rect): bool {
        const yrect: Rect = this.toRect();
        const urect: Rect = rect.toRect();
        return yrect.x > urect.x
        && yrect.x + yrect.width < urect.x + urect.width
        && yrect.y > urect.y
        && yrect.y + yrect.height < urect.x + urect.height;
    };

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.sprite) {
            this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
        } else {
            ctx.strokeRect(this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
        }
    };
};

class MovingEntity extends Rect { // A generic entity
    public dx: number; // Number to add to x every update
    public dy: number; // Number to add to y every update
    public speed: number; // Speed of entity
    public angle: number; // Direction of entity
    public liveTime: number = 0; // How long the entity has been alive
    public rotation: number = 0; // Degrees the enity is rotated at
    public sprite: Sprite; // Entity sprite
    constructor(x: number, y: number) {
        super(x, y);
    };
};

type CollectableType = "letter" | "fuel" | "none";
const getCollectableType = function (): CollectableType {
    const toGen: number = weightedRandom([10, 60, 30], [0, 1, 2]);
    switch (toGen) {
        case 0:
            return "letter";
        case 1:
            return "fuel";
        default:
            return "none";
    };
};

interface AsteroidTexture {
    src: string,
    width: number,
    height: number
};
type AsteroidType = "small" | "medium" | "large"; // The possible types of an asteroid
type AsteroidMitosisResult = "more" | "collectable";
class Asteroid extends MovingEntity { // Asteroid class. Makes the rock things.
    public static POSSIBLE_SPAWN_POS: {x: number, y: number, deg: number}[] = [
        {x: canvas.width/2, y: canvas.height, deg: 0},
        {x: canvas.width/2, y: 0, deg: 180},
        {x: canvas.width, y: canvas.height/2, deg: 270},
        {x: 0, y: canvas.height/2, deg: 90},
        {x: canvas.width, y: canvas.height, deg: 315},
        {x: 0, y: canvas.height, deg: 45},
        {x: 0, y: 0, deg: 135},
        {x: canvas.width, y: 0, deg: 225}
    ];

    public static SM_TEXTURES: AsteroidTexture[] = [
        {src: "images/asteroid/sm0.png", width: 60, height: 48},
        {src: "images/asteroid/sm1.png", width: 56, height: 40},
        {src: "images/asteroid/sm2.png", width: 36, height: 42}
    ];
    public static MED_TEXTURES: AsteroidTexture[] = [
        {src: "images/asteroid/med0.png", width: 448, height: 544},
        {src: "images/asteroid/med1.png", width: 480, height: 512},
        {src: "images/asteroid/med2.png", width: 72, height: 72}
    ];
    public static LG_TEXTURES: AsteroidTexture[] = [
        {src: "images/asteroid/lg0.png", width: 512, height: 640},
        {src: "images/asteroid/lg0.png", width: 640, height: 640},
        {src: "images/asteroid/lg0.png", width: 608, height: 640}
    ];

    public static create(type?: AsteroidType): Asteroid {
        const spawnPos: {x: number, y: number, deg: number} = Asteroid.POSSIBLE_SPAWN_POS[Math.floor(Math.random()*Asteroid.POSSIBLE_SPAWN_POS.length)];
        let angle: number = spawnPos.deg;
        let rand: number = Math.floor(Math.random()*3);
        switch (rand) {
            case 0:
                angle += 20;
                break;
            case 1:
                angle -= 20;
            default:
                break;
        };
        const types: AsteroidType[] = ["small", "medium", "large"];
        if (type) {
            return new Asteroid(spawnPos.x, spawnPos.y, angle, type);
        } else {
            return new Asteroid(spawnPos.x, spawnPos.y, angle, types[Math.floor(Math.random()*types.length)])
        };
    };

    public rotationSpeed: number; // Speed of rotation
    public size: number; // Size of asteroid
    public isLive: bool = true; // If the asteroids flagged for deletion
    public type: AsteroidType = "medium"; // The type of asteroid

    constructor(x: number, y: number, angle: number, type: AsteroidType = "medium") { // Make the asteriod
        super(x, y);
        this.x = x;
        this.y = y;
        this.angle = angle % 360; // Keep angle in range of 0-359
        this.type = type;

        let rand: number = Math.floor(Math.random()*3);
        switch (rand) {
            case 0:
                this.rotation += 10;
                break;
            case 1:
                this.rotation -= 10;
            default:
                break;
        };

        switch (this.type) { // Change some shit based off of the asteroid type
            case "small":
                this.size = 30;
                this.rotationSpeed = 2.1;
                this.speed = 2.2;
                break;
            case "large":
                this.size = 80;
                this.rotationSpeed = 1.4;
                this.speed = 1;
                break;
            default: // Deafaults to medium
                this.size = 55;
                this.rotationSpeed = 0.7;
                this.speed = 1.6;
                break;
        };

        if (this.type === "large") {
            const texture: AsteroidTexture = Asteroid.LG_TEXTURES[Math.floor(Math.random()*Asteroid.LG_TEXTURES.length)];
            this.sprite = new Sprite(texture.src, texture.width, texture.height, 1); // Load the asteriod sprite
        } else if (this.type === "small") {
            const texture: AsteroidTexture = Asteroid.SM_TEXTURES[Math.floor(Math.random()*Asteroid.SM_TEXTURES.length)];
            this.sprite = new Sprite(texture.src, texture.width, texture.height, 1); // Load the asteriod sprite
        } else {
            const texture: AsteroidTexture = Asteroid.MED_TEXTURES[Math.floor(Math.random()*Asteroid.MED_TEXTURES.length)];
            this.sprite = new Sprite(texture.src, texture.width, texture.height, 1); // Load the asteriod sprite
        };
        

        // Get the movement direction increments;
        this.dx = this.speed * Math.sin(rad(angle));
        this.dy = this.speed * -Math.cos(rad(angle));
    };


    public update(): void {
        this.liveTime++;

        // Move the asteroid
        this.x += this.dx;
        this.y += this.dy;

        // Rotate the asteroid
        this.rotation += this.rotationSpeed;

        // Set the rotation degree to 0 if it passes 360;
        this.rotation = this.rotation % 360;
    };
    public draw(ctx: CanvasRenderingContext2D): void {
        this.sprite.rotation = Math.floor(this.rotation);
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
    };
    
    public mitosisType(): AsteroidMitosisResult {
        if (this.type == "large" || this.type == "medium") {
            return "more";
        } else {
            return "collectable";
        };
    };

    public mitosisAsteroid(angle: number): Asteroid[] { // Get children of explosion

        // Get children movement direction
        let leftAngle: number = angle - 90;
        let rightAngle: number = angle + 90;
        if (leftAngle < 0) leftAngle = 360 + leftAngle;
        if (rightAngle >= 360) rightAngle = rightAngle - 360;

        // Generate children based off size
        const final: Asteroid[] = [];
        if (this.type === "large") {
            final.push(new Asteroid(this.x, this.y, leftAngle, "medium"));
            final.push(new Asteroid(this.x, this.y, rightAngle, "medium"));
        }
        else if (this.type === "medium") {
            final.push(new Asteroid(this.x, this.y, leftAngle, "small"));
            final.push(new Asteroid(this.x, this.y, rightAngle, "small"));
        }
        else if (this.type === "small") {
            final.push(new Asteroid(this.x, this.y, angle, "small"));
            final[final.length-1].rotation = this.rotation;
        };

        this.isLive = false; // Kill this asteroid

        return final;
    };

    public mitosisCollectable(): {type: CollectableType, col: Collectable[]} {
        const final: Collectable[] = [];

        const toGen: CollectableType = getCollectableType();

        switch (toGen) {
            case "letter":
                let newCollectable: CollectableLetter = CollectableLetter.createRandom(this.toRect().x, this.toRect().y);
                final.push(newCollectable);
                break;
            case "fuel":
                final.push(new CollectableFuel(this.toRect().x, this.toRect().y))
                break;
            default:
                break;
        }

        return {
            col: final,
            type: toGen
        };
    };

    public toRect(): Rect {
        return new Rect(this.x - (this.size/2), this.y - (this.size/2), this.size, this.size);
    };
};


type ProjectileType = "single" | "tri";
class Projectile extends Rect  {
    public angle: number = 0;
    public dx: number = 0;
    public dy: number = 0;
    public sprite: Sprite;
    public speed: number = 24;

    public static create(x: number, y: number, angle: number, type: ProjectileType): Projectile {
        switch (type) {
            case "tri":
                return new Projectile(x, y, angle, new Sprite("images/projectile1.png", 280, 320, 2, 0, 10));
            default:
                return new Projectile(x, y, angle, new Sprite("images/projectile0.png", 280, 320, 2, 0, 10));
        };
    };

    constructor(x: number, y: number, angle: number, sprite: Sprite) {
        super(x, y, 35, 35);
        this.angle = angle;
        this.sprite = sprite;
        this.sprite.rotation = this.angle;
        this.dx = this.speed * Math.sin(rad(angle));
        this.dy = this.speed * -Math.cos(rad(angle));
    };
    public update() {
        this.x += this.dx;
        this.y += this.dy;
    };
    public draw(ctx: CanvasRenderingContext2D): void {
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
    };
    public toRect(): Rect {
        return new Rect(this.x - (this.width/2), this.y - (this.height/2), this.width, this.height);
    };
};


type DashLetterCollectables = "d" | "a" | "s" | "h";
type SheildLetterCollectables = "s" | "h" | "e" | "i" | "l" | "d";
type ShotgunLetterCollectables = "s" | "h" | "o" | "t" | "g" | "u" | "n";
interface PlayerCollectables {
    dash: DashLetterCollectables[]
    shotgun: ShotgunLetterCollectables[],
    sheild: SheildLetterCollectables[]
};
interface PlayerSprites {
    still: number,
    active: number,
    sh_still: number,
    sh_active: number
};
class Player extends MovingEntity {
    public static SPRITEMAP: PlayerSprites = {
        still: 0,
        active: 1,
        sh_still: 2,
        sh_active: 3
    };

    public collectables: PlayerCollectables = {
        dash: [],
        shotgun: [],
        sheild: []
    };
    public readonly possibleCollectables: PlayerCollectables = {
        dash: ["d", "a", "s", "h"],
        shotgun: ["s", "h", "o", "t", "g", "u", "n"],
        sheild: ["s", "h", "e", "i", "l", "d"]
    };
    public readonly possibleCollectableKeys = {
        dash: {
            d: null,
            a: null,
            s: null,
            h: null
        },
        shotgun: {
            s: null,
            h: null,
            o: null,
            t: null,
            g: null,
            u: null,
            n: null
        },
        sheild: {
            s: null,
            h: null,
            e: null,
            i: null,
            l: null,
            d: null
        }
    };
    public coins: number = 0;
    public sprites: Sprite[] = [];
    public projectiles: Projectile[] = [];
    public readonly speed: number = 3;
    public readonly rotationSpeed: number = 5;
    public dashCooldownTimer: number = 0;
    public readonly dashCooldown: number = globalFPS * 2;
    public readonly dashMultiplyer: number = 12;
    public fireCooldownTimer: number = 0;
    public readonly fireCooldown: number = globalFPS * 0.5;
    public readonly levelInc: number = 5000;
    public dx: number = 0;
    public dy: number = 0;
    public flashX: number = 0;
    public flashY: number = 0;
    public score: number = 0;
    public prevScore: number = 0;
    public highScore: number = 0;
    public swidth: number = 70;
    public sheight: number = 70;
    public vx: number = 0;
    public vy: number = 0;
    public rotv: number = 0;
    public readonly rotFriction: number = 0.7;
    public readonly maxFuel: number = globalFPS * 20;
    public fuel: number = globalFPS * 20;

    constructor() {
        super(canvas.width/2, canvas.height/2);
        this.width = 58;
        this.height = 58;
        this.sprites[Player.SPRITEMAP.still] = new Sprite("images/ship.png", 128, 128, 1, 0);
        this.sprites[Player.SPRITEMAP.active] = new Sprite("images/ship.png", 128, 128, 4, 1);
        this.sprites[Player.SPRITEMAP.sh_still] = new Sprite("images/ship-s.png", 128, 128, 2, 0, 10);
        this.sprites[Player.SPRITEMAP.sh_active] = new Sprite("images/ship-s.png", 128, 128, 4, 2, 10);
        this.dx = this.speed * Math.sin(rad(this.rotation));
        this.dy = this.speed * -Math.cos(rad(this.rotation));

        if (!localStorage.getItem("kdi_hiscore")) {
            localStorage.setItem("kdi_hiscore", String(0));
        } else {
            this.highScore = Number(localStorage.getItem("kdi_hiscore"));
        };
    };

    public fire() {
        if (this.hasShotgun()) {
            let leftAngle: number = this.rotation - 10;
            let rightAngle: number = this.rotation + 10;
            if (leftAngle < 0) leftAngle = 360 + leftAngle;
            if (rightAngle >= 360) rightAngle = rightAngle - 360;
            this.projectiles.push(Projectile.create(this.x, this.y, leftAngle, "tri"));
            this.projectiles.push(Projectile.create(this.x, this.y, this.rotation, "tri"));
            this.projectiles.push(Projectile.create(this.x, this.y, rightAngle, "tri"));
        }  else {
            this.projectiles.push(Projectile.create(this.x, this.y, this.rotation, "single"));
        };
    };

    public hasDash(): bool {
        let finalState = {
            d: false,
            a: false,
            s: false,
            h: false
        };
        for (let i: number = 0; i < this.collectables.dash.length; i++) {
            switch (this.collectables.dash[i]) {
                case "d":
                    finalState.d = true;
                    break;
                case "a":
                    finalState.a = true;
                    break;
                case "s":
                    finalState.s = true;
                    break;
                case "h":
                    finalState.h = true;
                    break;
                default:
                    break;
            };
        };
        return finalState.d && finalState.a && finalState.s && finalState.h;
    };

    public hasShotgun(): bool {
        let finalState = {
            s: false,
            h: false,
            o: false,
            t: false,
            g: false,
            u: false,
            n: false
        };
        for (let i: number = 0; i < this.collectables.shotgun.length; i++) {
            switch (this.collectables.shotgun[i]) {
                case "s":
                    finalState.s = true;
                    break;
                case "h":
                    finalState.h = true;
                    break;
                case "o":
                    finalState.o = true;
                    break;
                case "t":
                    finalState.t = true;
                    break;
                case "g":
                    finalState.g = true;
                    break;
                case "u":
                    finalState.u = true;
                    break;
                case "n":
                    finalState.n = true;
                    break;
                default:
                    break;
            };
        };
        return finalState.s && finalState.h && finalState.o && finalState.t && finalState.g && finalState.u && finalState.n;
    };
    public hasSheild(): bool {
        let finalState = {
            s: false,
            h: false,
            e: false,
            i: false,
            l: false,
            d: false
        };
        for (let i: number = 0; i < this.collectables.sheild.length; i++) {
            switch (this.collectables.sheild[i]) {
                case "s":
                    finalState.s = true;
                    break;
                case "h":
                    finalState.h = true;
                    break;
                case "e":
                    finalState.e = true;
                    break;
                case "i":
                    finalState.i = true;
                    break;
                case "l":
                    finalState.l = true;
                    break;
                case "d":
                    finalState.d = true;
                    break;
                default:
                    break;
            };
        };
        return finalState.s && finalState.h && finalState.e && finalState.i && finalState.l && finalState.d;
    };

    public input(): void {
        if (isMobile()) {
            if (Number(joystick.GetY()) > 0) {
                this.dx = this.speed * Math.sin(rad(this.rotation)) * Math.abs(Number(joystick.GetY())) / 100;
                this.dy = this.speed * -Math.cos(rad(this.rotation)) * Math.abs(Number(joystick.GetY())) / 100;
                this.vx += this.dx;
                this.vy += this.dy;
            };
            if (Number(joystick.GetY()) < 0) {
                this.dx = -(this.speed/3) * Math.sin(rad(this.rotation)) * Math.abs(Number(joystick.GetY())) / 100;
                this.dy = -(this.speed/3) * -Math.cos(rad(this.rotation)) * Math.abs(Number(joystick.GetY())) / 100;
                this.vx += this.dx;
                this.vy += this.dy;
            };
            if (Number(joystick.GetX()) > 0) {
                this.rotv += this.rotationSpeed * Math.abs(Number(joystick.GetX())) / 100;
            };
            if (Number(joystick.GetX()) < 0) {
                this.rotv -= this.rotationSpeed * Math.abs(Number(joystick.GetX())) / 100;
            };
            if (dashButtonState == 1 && this.hasDash()) {
                if (this.dashCooldownTimer <= 0) {
                    this.dx = this.speed * Math.sin(rad(this.rotation));
                    this.dy = this.speed * -Math.cos(rad(this.rotation));
                    this.flashX = this.x;
                    this.flashY = this.y;
                    this.vx += this.dx*this.dashMultiplyer;
                    this.vy += this.dy*this.dashMultiplyer;
                    this.dashCooldownTimer = this.dashCooldown;
                };
            };
            if (fireButtonState == 1) {
                if (this.fireCooldownTimer <= 0) {
                    this.fire();
                    this.fireCooldownTimer = this.fireCooldown
                };
            };
        } else {
            if (Keys.getState(Keys.KEY_W)) {
                this.dx = this.speed * Math.sin(rad(this.rotation));
                this.dy = this.speed * -Math.cos(rad(this.rotation));
                this.vx += this.dx;
                this.vy += this.dy;
            };
            if (Keys.getState(Keys.KEY_A)) {
                this.rotv -= this.rotationSpeed;
            };
            if (Keys.getState(Keys.KEY_S)) {
                this.dx = -(this.speed/3) * Math.sin(rad(this.rotation));
                this.dy = -(this.speed/3) * -Math.cos(rad(this.rotation));
                this.vx += this.dx;
                this.vy += this.dy;
            };
            if (Keys.getState(Keys.KEY_D)) {
                this.rotv += this.rotationSpeed;
            };
            if (Keys.getState(Keys.KEY_SPACE) && this.hasDash()) {
                if (this.dashCooldownTimer <= 0) {
                    this.dx = this.speed * Math.sin(rad(this.rotation));
                    this.dy = this.speed * -Math.cos(rad(this.rotation));
                    this.flashX = this.x;
                    this.flashY = this.y;
                    this.vx += this.dx*this.dashMultiplyer;
                    this.vy += this.dy*this.dashMultiplyer;
                    this.dashCooldownTimer = this.dashCooldown;
                };
            };
            if (Mouse.left) {
                if (this.fireCooldownTimer <= 0) {
                    this.fire();
                    this.fireCooldownTimer = this.fireCooldown
                };
            };
        };
    };

    public reset(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.rotv = 0;
        this.rotation = 90;
        this.score = 0;
        this.collectables.dash = [];
        this.collectables.shotgun = [];
        this.collectables.sheild = [];
        this.projectiles = [];
        this.vx = 0;
        this.vy = 0;
        this.fuel = this.maxFuel;
    };

    public getLevel(): number {
        return Math.floor(this.score/this.levelInc);
    };

    public update(): void {
        this.liveTime++;
        this.fuel--;

        if (this.score > this.highScore) this.highScore = this.score
        if (Number(localStorage.getItem("kdi_hiscore")) < this.highScore) {
            localStorage.setItem("kdi_hiscore", this.highScore.toString());
        };

        this.dashCooldownTimer--;
        this.fireCooldownTimer--;
        this.input();

        this.rotv *= this.rotFriction;
        this.rotation += this.rotv;
        this.rotation = this.rotation % 360; 
        if (this.rotation < 0) this.rotation = 360 + this.rotation;

        this.vx *= globaFriction;
        this.vy *= globaFriction;

        if (this.vx >= 0.2) {
            for (let i = 0.2; i < this.vx; i++) {
                this.x++;
                if (!this.insideOf(cameraRect)) {
                    this.x--;
                    this.vx = 0;
                };
            };
        };
        if (this.vx < -0.2) {
            for (let i = this.vx; i < -0.2; i++) {
                this.x--;
                if (!this.insideOf(cameraRect)) {
                    this.x++;
                    this.vx = 0;
                };
            };
        };
        if (this.vy >= 0.2) {
            for (let i = 0.2; i < this.vy; i++) {
                this.y++;
                if (!this.insideOf(cameraRect)) {
                    this.y--;
                    this.vy = 0;
                };
            };
        };
        if (this.vy < -0.2) {
            for (let i = this.vy; i < -0.2; i++) {
                this.y--;
                if (!this.insideOf(cameraRect)) {
                    this.y++;
                    this.vy = 0;
                };
            };
        };
        
        for (let i: number = 0; i < this.projectiles.length; i++) {
            if (this.projectiles[i] == null) continue;
            this.projectiles[i].update();
            if (!cameraRect.collidingWith(player.projectiles[i])) delete this.projectiles[i];
        };
    };
    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.hasSheild()) {
            if ((this.vx > this.speed*1.8 || this.vy > this.speed*1.8) || (this.vx < -this.speed*1.8 || this.vy < -this.speed*1.8)) {
                this.sprites[Player.SPRITEMAP.sh_active].rotation = this.rotation;
                this.sprites[Player.SPRITEMAP.sh_active].draw(ctx, this.toRect2().x, this.toRect2().y, this.toRect2().width, this.toRect2().height);
            } else {
                this.sprites[Player.SPRITEMAP.sh_still].rotation = this.rotation;
                this.sprites[Player.SPRITEMAP.sh_still].draw(ctx, this.toRect2().x, this.toRect2().y, this.toRect2().width, this.toRect2().height);
            };
        } else {
            if ((this.vx > this.speed*1.8 || this.vy > this.speed*1.8) || (this.vx < -this.speed*1.8 || this.vy < -this.speed*1.8)) {
                this.sprites[Player.SPRITEMAP.active].rotation = this.rotation;
                this.sprites[Player.SPRITEMAP.active].draw(ctx, this.toRect2().x, this.toRect2().y, this.toRect2().width, this.toRect2().height);
            } else {
                this.sprites[Player.SPRITEMAP.still].rotation = this.rotation;
                this.sprites[Player.SPRITEMAP.still].draw(ctx, this.toRect2().x, this.toRect2().y, this.toRect2().width, this.toRect2().height);
            };
        };
    };


    public toRect(): Rect {
        return new Rect(this.x - (this.width/2), this.y - (this.height/2), this.width, this.height);
    };
    public toRect2(): Rect {
        return new Rect(this.x - (this.swidth/2), this.y - (this.sheight/2), this.swidth, this.sheight);
    };
};


class Collectable extends Rect {
    public sprite: Sprite;
    public value: string;
    public name: string;

    constructor(x: number, y: number, width: number, height: number, name: string, value: string, sprite: Sprite) {
        super(x, y, width, height);
        this.sprite = sprite;
        this.name = name;
        this.value = value;
    };

    public draw(ctx: CanvasRenderingContext2D): void {
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
    };
};

interface CollectableLetterSprites {
    dash: {
        d: Sprite,
        a: Sprite,
        s: Sprite,
        h: Sprite
    },
    sheild: {
        s: Sprite,
        h: Sprite,
        e: Sprite,
        i: Sprite,
        l: Sprite,
        d: Sprite
    },
    shotgun: {
        s: Sprite,
        h: Sprite,
        o: Sprite,
        t: Sprite,
        g: Sprite,
        u: Sprite,
        n: Sprite
    }
};

class CollectableLetter extends Collectable {
    public static SPRITES: CollectableLetterSprites = {
        dash: {
            d: new Sprite("images/letters/dash-d.png", 256, 288, 1),
            a: new Sprite("images/letters/dash-a.png", 256, 288, 1),
            s: new Sprite("images/letters/dash-s.png", 256, 288, 1),
            h: new Sprite("images/letters/dash-h.png", 256, 288, 1)
        },
        shotgun: {
            s: new Sprite("images/letters/shotgun-s.png", 256, 288, 1),
            h: new Sprite("images/letters/shotgun-h.png", 256, 288, 1),
            o: new Sprite("images/letters/shotgun-o.png", 256, 288, 1),
            t: new Sprite("images/letters/shotgun-t.png", 256, 288, 1),
            g: new Sprite("images/letters/shotgun-g.png", 256, 288, 1),
            u: new Sprite("images/letters/shotgun-u.png", 256, 288, 1),
            n: new Sprite("images/letters/shotgun-n.png", 256, 288, 1)
        },
        sheild: {
            s: new Sprite("images/letters/shield-s.png", 256, 288, 1),
            h: new Sprite("images/letters/shield-h.png", 256, 288, 1),
            e: new Sprite("images/letters/shield-e.png", 256, 288, 1),
            i: new Sprite("images/letters/shield-i.png", 256, 288, 1),
            l: new Sprite("images/letters/shield-l.png", 256, 288, 1),
            d: new Sprite("images/letters/shield-d.png", 256, 288, 1)
        }
    };

    public static createRandom(x: number, y: number): CollectableLetter {
        const possibleNames: string[] = Object.keys(CollectableLetter.SPRITES);
        const name: string = possibleNames[Math.floor(Math.random()*possibleNames.length)];
        const possibleValues: string[] = Object.keys(player.possibleCollectableKeys[name]);
        const value = possibleValues[Math.floor(Math.random()*possibleValues.length)];
        //console.log(name, value);
        return new CollectableLetter(x, y, name, value, CollectableLetter.SPRITES[name][value]);
    };

    constructor(x: number, y: number, name: string, value: string, sprite: Sprite) {
        super(x, y, 40, 45, name, value, sprite);
    };
};

class CollectableFuel extends Collectable {
    constructor(x: number, y: number) {
        super(x, y, 33, 47, "fuel", "fuel", new Sprite("images/fuel/canister.png", 33, 47, 1))
    };
};

class DrawableText extends Rect {
    public text: string;
    public color: string;
    public fontSize: number;
    
    constructor(text: string, x: number, y: number, color: string, fontSize: number) {
        super(x, y);
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
    };

    public draw(ctx: CanvasRenderingContext2D, drawCenter: bool = false): void {
        if (drawCenter) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
        } else {
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
        };
        ctx.fillStyle = this.color;
        ctx.strokeStyle = invertHex(this.color);
        ctx.lineWidth = 3;
        ctx.font = `${this.fontSize}px Dungeon-Swap`;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
    };
};

class Backdrop extends Rect {
    public sprite: Sprite;
    public speed: number;
    public readonly width: number = canvas.width;
    public readonly height: number = canvas.height;

    constructor(src: string, width: number, height: number, speed: number, spriteIndex: number = 0, startX: number = 0) {
        super(startX, 0);
        this.sprite = new Sprite(src, width, height, 1, spriteIndex);
        this.speed = speed;
    };

    public update(): void {
        this.x -= this.speed;
        if (this.x + this.width <= 0) {
            this.x = canvas.width;
        };
    };

    public draw(ctx: CanvasRenderingContext2D): void {
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height - 60)
    };
};
class UIElement extends Rect {
    public sprite: Sprite;
    public state: number = 0;
    public drawFrames: number[] = [];

    constructor(sprite: Sprite, x: number, y: number, width: number, height: number, update: Function) {
        super(x, y, width, height);
        this.sprite = sprite;
        this.update = update;
    };

    public update: Function = () => {};
    public draw(ctx: CanvasRenderingContext2D): void {
        this.update();
        for (let i: number = 0; i < this.drawFrames.length; i++) {
            this.sprite.currentFrame = this.drawFrames[i];
            this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
        };
        this.drawFrames = [];
    };
};
class Explosion extends Rect {
    public sprite: Sprite;

    constructor(x: number, y: number) {
        super(x, y, 50, 50);
        this.sprite = new Sprite("images/explosion.png", 512, 575, 9, 0, 8);
    };

    public toRect(): Rect {
        return new Rect(this.x - (this.width/2), this.y - (this.height/2), this.width, this.height);
    };

    public draw(ctx: CanvasRenderingContext2D): void {
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height)
    };
};

const cameraRect: Rect = new Rect(0, 0, canvas.width, canvas.height - 60);

const player = new Player();
player.reset(cameraRect.width/2, cameraRect.height/2);

let asteroids: Asteroid[] = []; // All the asteroids
let explosions: Explosion[] = [];

const backdropStar: Backdrop[] = [
    new Backdrop("images/bg.png", 1800, 600, 0.5, 0, 0),
    new Backdrop("images/bg.png", 1800, 600, 0.5, 0, canvas.width),
    new Backdrop("images/stars.png", 800, 600, 1, 0, 0),
    new Backdrop("images/stars.png", 800, 600, 1, 0, canvas.width),
    new Backdrop("images/stars.png", 800, 600, 1, 0, canvas.width*2),
    new Backdrop("images/stars.png", 800, 600, 2, 1, 0),
    new Backdrop("images/stars.png", 800, 600, 2, 1, canvas.width),
    new Backdrop("images/stars.png", 800, 600, 2, 1, canvas.width*2)
];

const dashUpgradeUpdate: Function = function (): void {
    let finalState = {
        d: false,
        a: false,
        s: false,
        h: false
    };
    for (let i: number = 0; i < player.collectables.dash.length; i++) {
        switch (player.collectables.dash[i]) {
            case "d":
                finalState.d = true;
                break;
            case "a":
                finalState.a = true;
                break;
            case "s":
                finalState.s = true;
                break;
            case "h":
                finalState.h = true;
                break;
            default:
                break;
        }
    };
    if (finalState.d && finalState.a && finalState.s && finalState.h) {
        this.drawFrames.push(9);
    } else {
        this.drawFrames.push(0);
        if (finalState.d) {
            this.drawFrames.push(2);
        } else {
            this.drawFrames.push(1);
        };
        if (finalState.a) {
            this.drawFrames.push(4);
        } else {
            this.drawFrames.push(3);
        };
        if (finalState.s) {
            this.drawFrames.push(6);
        } else {
            this.drawFrames.push(5);
        };
        if (finalState.h) {
            this.drawFrames.push(8);
        } else {
            this.drawFrames.push(7);
        };
    };
};
const shotgunUpgradeUpdate: Function = function (): void {
    let finalState = {
        s: false,
        h: false,
        o: false,
        t: false,
        g: false,
        u: false,
        n: false
    };
    for (let i: number = 0; i < player.collectables.shotgun.length; i++) {
        switch (player.collectables.shotgun[i]) {
            case "s":
                finalState.s = true;
                break;
            case "h":
                finalState.h = true;
                break;
            case "o":
                finalState.o = true;
                break;
            case "t":
                finalState.t = true;
                break;
            case "g":
                finalState.g = true;
                break;
            case "u":
                finalState.u = true;
                break;
            case "n":
                finalState.n = true;
                break;
            default:
                break;
        };
    };
    if (player.hasShotgun()) {
        this.drawFrames.push(15);
    } else {
        this.drawFrames.push(0);
        if (finalState.s) {
            this.drawFrames.push(2);
        } else {
            this.drawFrames.push(1);
        };
        if (finalState.h) {
            this.drawFrames.push(4);
        } else {
            this.drawFrames.push(3);
        };
        if (finalState.o) {
            this.drawFrames.push(6);
        } else {
            this.drawFrames.push(5);
        };
        if (finalState.t) {
            this.drawFrames.push(8);
        } else {
            this.drawFrames.push(7);
        };
        if (finalState.g) {
            this.drawFrames.push(10);
        } else {
            this.drawFrames.push(9);
        };
        if (finalState.u) {
            this.drawFrames.push(12);
        } else {
            this.drawFrames.push(11);
        };
        if (finalState.n) {
            this.drawFrames.push(14);
        } else {
            this.drawFrames.push(13);
        };
    };
};
const sheildUpgradeUpdate: Function = function (): void {
    let finalState = {
        s: false,
        h: false,
        e: false,
        i: false,
        l: false,
        d: false
    };
    for (let i: number = 0; i < player.collectables.sheild.length; i++) {
        switch (player.collectables.sheild[i]) {
            case "s":
                finalState.s = true;
                break;
            case "h":
                finalState.h = true;
                break;
            case "e":
                finalState.e = true;
                break;
            case "i":
                finalState.i = true;
                break;
            case "l":
                finalState.l = true;
                break;
            case "d":
                finalState.d = true;
                break;
            default:
                break;
        };
    };
    if (player.hasSheild()) {
        this.drawFrames.push(13);
    } else {
        this.drawFrames.push(0);
        if (finalState.s) {
            this.drawFrames.push(2);
        } else {
            this.drawFrames.push(1);
        };
        if (finalState.h) {
            this.drawFrames.push(4);
        } else {
            this.drawFrames.push(3);
        };
        if (finalState.i) {
            this.drawFrames.push(6);
        } else {
            this.drawFrames.push(5);
        };
        if (finalState.e) {
            this.drawFrames.push(8);
        } else {
            this.drawFrames.push(7);
        };
        if (finalState.l) {
            this.drawFrames.push(10);
        } else {
            this.drawFrames.push(9);
        };
        if (finalState.d) {
            this.drawFrames.push(12);
        } else {
            this.drawFrames.push(11);
        };
    };
};
const bottomBarUIUpdate: Function = function () {
    this.drawFrames = [0];
};
const playerFuelUpdate: Function = function () {
    this.drawFrames = [3];
    if (player.fuel < globalFPS * 15) {
        this.drawFrames = [2];
    };
    if (player.fuel < globalFPS * 10) {
        this.drawFrames = [1];
    }
    if (player.fuel <= 0) {
        this.drawFrames = [0];
    };
};
const alertUIUpdate: Function = function () {
    if (player.fuel < globalFPS * 10) {
        this.drawFrames = [0];
    } else {
        this.drawFrames = [1];
    };
};

const uiElements: UIElement[] = [
    new UIElement(new Sprite("images/bottombar.png", 6400, 480, 1, 0), 0, 540, 800, 60, bottomBarUIUpdate),
    new UIElement(new Sprite("images/upgrade/dash.png", 170, 50, 10), 15, 555, 102, 30, dashUpgradeUpdate),
    new UIElement(new Sprite("images/upgrade/shotgun.png", 290, 50, 10), 124.5, 555, 174, 30, shotgunUpgradeUpdate),
    new UIElement(new Sprite("images/upgrade/shield.png", 250, 50, 14), 306, 555, 150, 30, sheildUpgradeUpdate),
    new UIElement(new Sprite("images/fuel/indi.png", 200, 50, 4), 463.5, 555, 120, 30, playerFuelUpdate),
    new UIElement(new Sprite("images/alert.png", 110, 130, 2), 463.5 + 22, 555 - 100, 66, 78, alertUIUpdate)
];

let collectables: CollectableLetter[] = [];
let fuelCollectables: CollectableFuel[] = [];


type GameState = "game" | "title" | "death"
let gamestate: GameState = "title";
let lastGameSprite: Sprite = new Sprite("images/bg.png", 1800, 600, 1);


class Button extends Rect {
    public sprite: Sprite;
    public hsprite: Sprite;
    public onclick: Function;

    constructor(x: number, y: number, width: number, height: number, sprite: Sprite, onclick: Function, hoverSprite?: Sprite) {
        super(x, y, width, height);
        this.sprite = sprite;
        this.onclick = onclick;
        if (hoverSprite) {
            this.hsprite = hoverSprite;
        } else {
            this.hsprite = this.sprite;
        };
    };

    public isHovering(): bool {
        return this.collidingWith(Mouse.toRect());
    };

    public isActive(): bool {
        return this.collidingWith(Mouse.toRect()) && Mouse.left;
    };

    public update(): void {
        if (this.isActive()) this.onclick();
    };

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.isHovering()) {
            this.hsprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
        } else {
            this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height)
        };
    };
};

class Scene extends Rect {
    public buttons: Button[] = [];
    public text: DrawableText[] = [];
    public rects: Rect[] = [];

    constructor(buttons: Button[], drawableText: DrawableText[], rects: Rect[]) {
        super(0, 0, canvas.width, canvas.height);
        this.buttons = buttons;
        this.text = drawableText;
        this.rects = rects;
    };

    public update() {
        for (let i: number = 0; i < this.buttons.length; i++) {
            this.buttons[i].update();
        };
    };

    public draw(ctx: CanvasRenderingContext2D) {
        lastGameSprite.draw(ctx, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        for (let i: number = 0; i < this.rects.length; i++) {
            this.rects[i].draw(ctx);
        };
        for (let i: number = 0; i < this.buttons.length; i++) {
            this.buttons[i].draw(ctx);
        };
        for (let i: number = 0; i < this.text.length; i++) {
            this.text[i].draw(ctx, true);
        };
    };
};


const bgm: BGM = new BGM("aud/rushhour.wav");
const stranded: BGM = new BGM("aud/stranded.wav");


const titleScene: Scene = new Scene([
    new Button((canvas.width/2)-200, (canvas.height/2)+150, 100, 100, new Sprite("images/ship.png", 128, 128, 1), _ => {
        asteroids = [];
        player.reset(cameraRect.width/2, cameraRect.height/2);
        collectables = [];
        fuelCollectables = [];
        explosions = [];
        gamestate = "game";
        bgm.play();
    }, new Sprite("images/ship-s.png", 128, 128, 1)),
    new Button((canvas.width/2)+100, (canvas.height/2)+150, 100, 100, new Sprite("images/credits.png", 128, 128, 1), _ => {
        window.open("credits.html", "_blank");
    }, new Sprite("images/credits.png", 128, 128, 1, 1))
],[
    new DrawableText("PLAY", (canvas.width/2)-150, (canvas.height/2)+270, "#ffffff", 16),
    new DrawableText("CREDITS", (canvas.width/2)+150, (canvas.height/2)+270, "#ffffff", 16)
],[
    new Rect(canvas.width/2 - 300, canvas.height/2 - (97/2), 600, 97, new Sprite("images/logo.png", 815, 132, 1))
]);

const deathScene: Scene = new Scene([
    new Button((canvas.width/2)-300, (canvas.height/2)+150, 100, 100, new Sprite("images/back.png", 128, 128, 1), _ => {
        gamestate = "title";
        stranded.stop();
    }, new Sprite("images/back.png", 128, 128, 1, 1)),
    new Button((canvas.width/2)+200, (canvas.height/2)+150, 100, 100, new Sprite("images/ship.png", 128, 128, 1), _ => {
        asteroids = [];
        player.reset(cameraRect.width/2, cameraRect.height/2);
        collectables = [];
        fuelCollectables = [];
        explosions = [];
        gamestate = "game";
        stranded.stop();
        bgm.play();
    }, new Sprite("images/ship-s.png", 128, 128, 1))
],[
    new DrawableText("YOU WERE STRANDED", canvas.width/2, canvas.height/2, "#ffffff", 28),
    new DrawableText("TITLE", (canvas.width/2)-250, (canvas.height/2)+270, "#ffffff", 16),
    new DrawableText("PLAY AGAIN", (canvas.width/2)+250, (canvas.height/2)+270, "#ffffff", 16)
],[
    
]);

function renderGame(): void { // Main render loop
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i: number = 0; i < backdropStar.length; i++) {
        backdropStar[i].draw(ctx);
    };
    for (let i: number = 0; i < player.projectiles.length; i++) {
        if (player.projectiles[i] == null) continue;
        player.projectiles[i].draw(ctx);
    };
    for (let i: number = 0; i < asteroids.length; i++) {
        if (asteroids[i] == null) continue;
        asteroids[i].draw(ctx);
    };
    for (let i: number = 0; i < explosions.length; i++) { // Shit code dont ask
        if (explosions[i] == null) continue;
        explosions[i].draw(ctx);
    };
    for (let i: number = 0; i < collectables.length; i++) {
        if (collectables[i] == null) continue;
        collectables[i].draw(ctx);
    };
    for (let i: number = 0; i < fuelCollectables.length; i++) {
        if (fuelCollectables[i] == null) continue;
        fuelCollectables[i].draw(ctx);
    };
    player.draw(ctx);
    for (let i: number = 0; i < uiElements.length; i++) {
        if (uiElements[i] == null) continue;
        uiElements[i].draw(ctx);
    };
    new DrawableText(`SCORE  ${player.score.toString()}    HI SCORE  ${player.highScore.toString()}    LEVEL  ${player.getLevel() + 1}`, 10, 10, "#ffffff", 18).draw(ctx);  
};


function render(): void {
    if (gamestate == "game") {
        renderGame();
    } else if (gamestate == "death") {
        deathScene.draw(ctx);
    } else if (gamestate == "title") {
        titleScene.draw(ctx);
    };
    requestAnimationFrame(render);
};
render();

let spawnAsteroidCounter: number = 0;

const explosionSFX: SFX = new SFX("aud/explosion.wav");

function updateGame(): void { // Main update loop
    player.prevScore = player.score;
    for (let i: number = 0; i < backdropStar.length; i++) {
        backdropStar[i].update();
    };
    for (let i: number = 0; i < asteroids.length; i++) {
        if (asteroids[i] == null) continue;
        asteroids[i].update();
        if (!cameraRect.collidingWith(asteroids[i])) {
            delete asteroids[i];
            continue;
        };
        for (let k: number = 0; k < player.projectiles.length; k++) {
            if (player.projectiles[k] == null) continue;
            if (asteroids[i].collidingWith(player.projectiles[k])) {
                explosionSFX.play();
                explosions.push(new Explosion(asteroids[i].x, asteroids[i].y));
                if (asteroids[i].mitosisType() == "more") {
                    const newAst: Asteroid[] = asteroids[i].mitosisAsteroid(player.projectiles[k].angle);
                    newAst.forEach((e: Asteroid) => {
                        asteroids.push(e);
                    });
                    delete asteroids[i];
                    delete player.projectiles[k];

                    player.score += 50

                    continue;
                } else {
                    const newAst: {type: CollectableType, col: Collectable[]} = asteroids[i].mitosisCollectable();
                    if (newAst.type == "letter") {
                        newAst.col.forEach((e: CollectableLetter) => {
                            collectables.push(e);
                        });
    
                        player.score += 50;
                    } else if (newAst.type == "fuel") {
                        newAst.col.forEach((e: CollectableFuel) => {
                            fuelCollectables.push(e);
                        });
                        
                        player.score += 50;
                    };

                    delete asteroids[i];
                    delete player.projectiles[k];

                    continue;
                };
            };
        };
        if (player.collidingWith(asteroids[i].toRect())) {
            if (player.hasSheild()) {
                player.collectables.sheild = [];
                explosions.push(new Explosion(asteroids[i].x, asteroids[i].y));
                delete asteroids[i];
            } else {
                gamestate = "death";
                bgm.stop();
                stranded.play();
                lastGameSprite = new Sprite(canvas.toDataURL(), canvas.width, canvas.height, 1);
            };
        };
    };
    for (let i: number = 0; i < collectables.length; i++) {
        if (collectables[i] == null) continue;
        if (collectables[i].collidingWith(player.toRect())) {
            player.collectables[collectables[i].name].push(collectables[i].value);
            delete collectables[i];

            player.score += 150;

            continue;
        };
    };
    for (let i: number = 0; i < fuelCollectables.length; i++) {
        if (fuelCollectables[i] == null) continue;
        if (fuelCollectables[i].collidingWith(player.toRect())) {
            player.fuel = player.maxFuel;
            delete fuelCollectables[i];

            player.score += 150;

            continue;
        };
    };
    if (player.fuel <= 0) {
        gamestate = "death";
        bgm.stop();
        stranded.play();
        lastGameSprite = new Sprite(canvas.toDataURL(), canvas.width, canvas.height, 1);
    };
    for (let i: number = 0; i < explosions.length; i++) {
        if (explosions[i] == null) continue;
        if (explosions[i].sprite.currentFrame == explosions[i].sprite.frameCount - 1) {
            delete explosions[i];
        };
    };
    player.update();

    spawnAsteroidCounter++;
    let remainderThing: number = (globalFPS*4)-(Math.floor(player.score/player.levelInc)*10);
    if (remainderThing > globalFPS / 2) remainderThing = globalFPS;
    if (spawnAsteroidCounter % remainderThing == 0) asteroids.push(Asteroid.create());
};

setInterval(_ => {
    if (gamestate == "game") {
        updateGame();
    } else if (gamestate == "title") {
        titleScene.update();
    } else if (gamestate == "death") {
        deathScene.update();
    };
}, fpsToMilliseconds(globalFPS));

rsjs(canvas, "full", {
    margin_height: 0,
    margin_width: 0
}, 1);

window.addEventListener("resize", _ => {
    rsjs(canvas, "full", {
        margin_height: 0,
        margin_width: 0
    }, 1);
});

if (isMobile()) {
    joystick = new JoyStick("mobControls", {
        autoReturnToCenter: true,
        width: 100,
        height: 100,
        internalFillColor: "rgb(100, 100, 100)",
        internalStrokeColor: "rgb(75, 75, 75)",
        externalStrokeColor: "rgba(0, 0, 0, 0)"
    });

    const mobCont: HTMLDivElement = <HTMLDivElement>document.querySelectorAll("div#mobControls")[0];
    mobCont.style.display = "block";
};

fireButton.addEventListener('touchstart', _ => {
    fireButtonState = 1;
    fireButton.src = "images/mobile/fireon.png";
});
fireButton.addEventListener('touchend', _ => {
    fireButtonState = 0;
    fireButton.src = "images/mobile/fireoff.png";
});

dashButton.addEventListener('touchstart', _ => {
    if (player.hasDash()) {
        dashButtonState = 1;
        dashButton.src = "images/mobile/dashon.png";
    } else {
        dashButtonState = 2;
        dashButton.src = "images/mobile/dashdis.png";
    };
});
dashButton.addEventListener('touchend', _ => {
    if (player.hasDash()) {
        dashButtonState = 0;
        dashButton.src = "images/mobile/dashoff.png";
    } else {
        dashButtonState = 2;
        dashButton.src = "images/mobile/dashdis.png";
    };
});
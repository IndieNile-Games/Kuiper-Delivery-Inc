/*

Why am I no longer using C++?
Basically, C++ is something I like to call a "no bullshit" language.
That means I can't make bullshit or yandredev code as a quick fix.
I am not skilled enough in C++ to make "good" code and I don't have the 
time to learn how to. My best solution was to use typescript, which just
adds a little bit of structure to javascript, while still allowing for a
*little* bit of bullshit. I need that little bit.

*/ 

declare var Sprite: SpriteConstructor; // Only way I could get LMS canvas to work

type bool = boolean; // I'm used to typing "bool", and I will never not be used to it.

// Interfaces for LMS Canvas. I won't explain them here.
interface SpriteConstructor {
    new (src: string, frameWidth: number, frameHeight: number, frameCount: number, frameStart?: number),
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

function rad(degrees: number): number { // Convert degrees to radians
    return degrees * (Math.PI / 180);
};
function ratio(a1: number, a2: number, b1: number): number { // In a situation where a1:a2 = b1:b2, get b2
    return b1 * (a2 / a1);
};
function getScaleForPixel(oldSize: number, newSize: number): number { // Leftover from C++ days. Tells you the scale factor you need to scale pixels to another set of pixels.
    return ratio(oldSize, 1, newSize);
};
function fpsToMilliseconds(fps: number): number {
    return 1000 / fps;
};

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("#canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

class Rect {
    public x: number; // X position
    public y: number; // Y position
    public width: number; // Width
    public height: number; // Height

    constructor(x: number, y: number, width: number = 0, height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };

    public toRect(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    };

    public collidingWith(rect: Rect) {
        const yrect: Rect = this.toRect();
        return yrect.x < rect.x + rect.width &&
        yrect.x + yrect.width > rect.x &&
        yrect.y < rect.y + rect.height &&
        yrect.y + yrect.height > rect.y;
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

type AsteroidType = "small" | "medium" | "large"; // The possible types of an asteroid
class Asteroid extends MovingEntity { // Asteroid class. Makes the rock things.
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

        switch (this.type) { // Change some shit based off of the asteroid type
            case "small":
                this.size = 30;
                this.rotationSpeed = 2.1;
                this.speed = 1.75;
                this.sprite = new Sprite("images/asteriod-0.png", 512, 512, 1); // Load the asteriod sprite  
                break;
            case "large":
                this.size = 80;
                this.rotationSpeed = 1.4;
                this.speed = 0.75;
                this.sprite = new Sprite("images/asteriod-2.png", 512, 512, 1);
                break;
            default: // Deafaults to medium
                this.size = 55;
                this.rotationSpeed = 0.7;
                this.speed = 1.1;
                this.sprite = new Sprite("images/asteriod-1.png", 512, 512, 1);
                break;
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
        this.sprite.rotation = this.rotation;
        this.sprite.draw(ctx, this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    };


    public mitosis(): Asteroid[] { // Get children of explosion

        // Get children movement direction
        let leftAngle: number = this.angle - 90;
        let rightAngle: number = this.angle + 90;
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
            final.push(new Asteroid(this.x, this.y, this.angle, "small"));
            final[final.length-1].rotation = this.rotation;
        };

        this.isLive = false; // Kill this asteroid

        return final;
    };

    public toRect(): Rect {
        return new Rect(this.x - (this.width/2), this.y - (this.height/2), this.width, this.height);
    };
};

let cameraRect: Rect = new Rect(0, 0, canvas.width, canvas.height);

const asteroids: Asteroid[] = []; // All the asteroids
asteroids.push(new Asteroid(canvas.width/2, canvas.height/2 - 90, 0, "large"));
asteroids.push(new Asteroid(canvas.width/2 + 45, canvas.height/2 - 45, 45, "large"));
asteroids.push(new Asteroid(canvas.width/2 + 90, canvas.height/2, 90, "large"));
asteroids.push(new Asteroid(canvas.width/2 + 45, canvas.height/2 + 45, 135, "large"));
asteroids.push(new Asteroid(canvas.width/2, canvas.height/2 + 90, 180, "large"));
asteroids.push(new Asteroid(canvas.width/2 - 45, canvas.height/2 + 45, 225, "large"));
asteroids.push(new Asteroid(canvas.width/2 - 90, canvas.height/2, 270, "large"));
asteroids.push(new Asteroid(canvas.width/2 - 45, canvas.height/2 - 45, 315, "large"));


function render(): void { // Main render loop
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i: number = 0; i < asteroids.length; i++) {
        // if (asteroids[i+1] == null && asteroids[i+10] == null) i += 10;
        if (asteroids[i] == null) continue;
        asteroids[i].draw(ctx);
    };
    ctx.restore();
    requestAnimationFrame(render);
};
render();

function update(): void { // Main update loop
    cameraRect = new Rect(0, 0, canvas.width, canvas.height);
    for (let i: number = 0; i < asteroids.length; i++) {
        if (asteroids[i] == null) continue;
        asteroids[i].update();
        if (asteroids[i].liveTime > 120) {
            const newAsteroids: Asteroid[] = asteroids[i].mitosis();
            delete asteroids[i];
            newAsteroids.forEach(e => {
                asteroids.push(e);
            });
        };
        //if (cameraRect.collidingWith(asteroids[i]) === false) delete asteroids[i];
    };
};

setInterval(update, fpsToMilliseconds(30));
/*

Why am I no longer using C++?
Basically, C++ is something I like to call a "no bullshit" language.
That means I can't make bullshit or yandredev code as a quick fix.
I am not skilled enough in C++ to make "good" code and I don't have the
time to learn how to. My best solution was to use typescript, which just
adds a little bit of structure to javascript, while still allowing for a
*little* bit of bullshit. I need that little bit.

*/
;
;
;
let joystick = null;
;
;
function rad(degrees) {
    return degrees * (Math.PI / 180);
}
;
function ratio(a1, a2, b1) {
    return b1 * (a2 / a1);
}
;
function getScaleForPixel(oldSize, newSize) {
    return ratio(oldSize, 1, newSize);
}
;
function fpsToMilliseconds(fps) {
    return 1000 / fps;
}
;
function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta;
}
;
function angle360(cx, cy, ex, ey) {
    var theta = angle(cx, cy, ex, ey); // range (-180, 180]
    if (theta < 0)
        theta = 360 + theta; // range [0, 360)
    return theta;
}
;
function weightedRandom(weight, num) {
    let n = Math.floor(Math.random() * 100);
    let amt = 0;
    for (let i = 0; i < weight.length; i++) {
        amt += weight[i];
        if (n < amt)
            return num[i];
    }
    ;
}
;
function isMobile() {
    return window.matchMedia("only screen and (max-width: 760px)").matches;
}
;
const fireButton = document.querySelector("#fireBtn");
const dashButton = document.querySelector("#dashBtn");
let fireButtonState = 0;
let dashButtonState = 2;
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const globalSpeed = 3;
const globaFriction = 0.85;
const globalFPS = 30;
class Keys {
    static getState(key) {
        return Keys.state[key];
    }
    ;
    static handleKeydown(e) {
        Keys.state[e.keyCode] = true;
    }
    ;
    static handleKeyup(e) {
        delete Keys.state[e.keyCode];
    }
    ;
}
Keys.KEY_W = 87;
Keys.KEY_A = 65;
Keys.KEY_S = 83;
Keys.KEY_D = 68;
Keys.KEY_SPACE = 32;
Keys.state = [];
;
document.addEventListener("keydown", Keys.handleKeydown);
document.addEventListener("keyup", Keys.handleKeyup);
class Mouse {
    static handleMousedown(e) {
        if (e.button === Mouse.MOUSELEFT) {
            Mouse.left = true;
        }
        else if (e.button === Mouse.MOUSEMIDDLE) {
            Mouse.middle = true;
        }
        else if (e.button === Mouse.MOUSERIGHT) {
            Mouse.right = true;
        }
        ;
    }
    ;
    static handleMouseup(e) {
        Mouse.left = false;
        Mouse.middle = false;
        Mouse.right = false;
    }
    ;
    static handleMousemove(e) {
        Mouse.x = e.pageX;
        Mouse.y = e.pageY;
    }
    ;
}
Mouse.MOUSELEFT = 0;
Mouse.MOUSEMIDDLE = 1;
Mouse.MOUSERIGHT = 2;
Mouse.x = 0;
Mouse.y = 0;
Mouse.left = false;
Mouse.middle = false;
Mouse.right = false;
;
canvas.addEventListener("mousedown", Mouse.handleMousedown);
canvas.addEventListener("mouseup", Mouse.handleMouseup);
canvas.addEventListener("mousemove", Mouse.handleMousemove);
class Rect {
    constructor(x, y, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    ;
    toRect() {
        return new Rect(this.x, this.y, this.width, this.height);
    }
    ;
    collidingWith(rect) {
        const yrect = this.toRect();
        const urect = rect.toRect();
        return yrect.x < urect.x + urect.width
            && yrect.x + yrect.width > urect.x
            && yrect.y < urect.y + urect.height
            && yrect.y + yrect.height > urect.y;
    }
    ;
    insideOf(rect) {
        const yrect = this.toRect();
        const urect = rect.toRect();
        return yrect.x > urect.x
            && yrect.x + yrect.width < urect.x + urect.width
            && yrect.y > urect.y
            && yrect.y + yrect.height < urect.x + urect.height;
    }
    ;
}
;
class MovingEntity extends Rect {
    constructor(x, y) {
        super(x, y);
        this.liveTime = 0; // How long the entity has been alive
        this.rotation = 0; // Degrees the enity is rotated at
    }
    ;
}
;
const getCollectableType = function () {
    const toGen = weightedRandom([5], [0]);
    switch (toGen) {
        case 0:
            return "letter";
        default:
            return "none";
    }
    ;
};
;
class Asteroid extends MovingEntity {
    constructor(x, y, angle, type = "medium") {
        super(x, y);
        this.isLive = true; // If the asteroids flagged for deletion
        this.type = "medium"; // The type of asteroid
        this.x = x;
        this.y = y;
        this.angle = angle % 360; // Keep angle in range of 0-359
        this.type = type;
        let rand = Math.floor(Math.random() * 3);
        switch (rand) {
            case 0:
                this.rotation += 10;
                break;
            case 1:
                this.rotation -= 10;
            default:
                break;
        }
        ;
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
        }
        ;
        if (this.type === "large") {
            const texture = Asteroid.LG_TEXTURES[Math.floor(Math.random() * Asteroid.LG_TEXTURES.length)];
            this.sprite = new Sprite(texture.src, texture.width, texture.height, 1); // Load the asteriod sprite
        }
        else if (this.type === "small") {
            const texture = Asteroid.SM_TEXTURES[Math.floor(Math.random() * Asteroid.SM_TEXTURES.length)];
            this.sprite = new Sprite(texture.src, texture.width, texture.height, 1); // Load the asteriod sprite
        }
        else {
            const texture = Asteroid.MED_TEXTURES[Math.floor(Math.random() * Asteroid.MED_TEXTURES.length)];
            this.sprite = new Sprite(texture.src, texture.width, texture.height, 1); // Load the asteriod sprite
        }
        ;
        // Get the movement direction increments;
        this.dx = this.speed * Math.sin(rad(angle));
        this.dy = this.speed * -Math.cos(rad(angle));
    }
    static create(type) {
        const spawnPos = Asteroid.POSSIBLE_SPAWN_POS[Math.floor(Math.random() * Asteroid.POSSIBLE_SPAWN_POS.length)];
        let angle = spawnPos.deg;
        let rand = Math.floor(Math.random() * 3);
        switch (rand) {
            case 0:
                angle += 20;
                break;
            case 1:
                angle -= 20;
            default:
                break;
        }
        ;
        const types = ["small", "medium", "large"];
        if (type) {
            return new Asteroid(spawnPos.x, spawnPos.y, angle, type);
        }
        else {
            return new Asteroid(spawnPos.x, spawnPos.y, angle, types[Math.floor(Math.random() * types.length)]);
        }
        ;
    }
    ;
    ;
    update() {
        this.liveTime++;
        // Move the asteroid
        this.x += this.dx;
        this.y += this.dy;
        // Rotate the asteroid
        this.rotation += this.rotationSpeed;
        // Set the rotation degree to 0 if it passes 360;
        this.rotation = this.rotation % 360;
    }
    ;
    draw(ctx) {
        this.sprite.rotation = Math.floor(this.rotation);
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
    }
    ;
    mitosisType() {
        if (this.type == "large" || this.type == "medium") {
            return "more";
        }
        else {
            return "collectable";
        }
        ;
    }
    ;
    mitosisAsteroid(angle) {
        // Get children movement direction
        let leftAngle = angle - 90;
        let rightAngle = angle + 90;
        if (leftAngle < 0)
            leftAngle = 360 + leftAngle;
        if (rightAngle >= 360)
            rightAngle = rightAngle - 360;
        // Generate children based off size
        const final = [];
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
            final[final.length - 1].rotation = this.rotation;
        }
        ;
        this.isLive = false; // Kill this asteroid
        return final;
    }
    ;
    mitosisCollectable() {
        const final = [];
        const toGen = getCollectableType();
        switch (toGen) {
            case "letter":
                final.push();
                break;
            default:
                break;
        }
        return final;
    }
    ;
    toRect() {
        return new Rect(this.x - (this.size / 2), this.y - (this.size / 2), this.size, this.size);
    }
    ;
}
Asteroid.POSSIBLE_SPAWN_POS = [
    { x: canvas.width / 2, y: canvas.height, deg: 0 },
    { x: canvas.width / 2, y: 0, deg: 180 },
    { x: canvas.width, y: canvas.height / 2, deg: 270 },
    { x: 0, y: canvas.height / 2, deg: 90 },
    { x: canvas.width, y: canvas.height, deg: 315 },
    { x: 0, y: canvas.height, deg: 45 },
    { x: 0, y: 0, deg: 135 },
    { x: canvas.width, y: 0, deg: 225 }
];
Asteroid.SM_TEXTURES = [
    { src: "images/asteroid/sm0.png", width: 60, height: 48 },
    { src: "images/asteroid/sm1.png", width: 56, height: 40 },
    { src: "images/asteroid/sm2.png", width: 36, height: 42 }
];
Asteroid.MED_TEXTURES = [
    { src: "images/asteroid/med0.png", width: 448, height: 544 },
    { src: "images/asteroid/med1.png", width: 480, height: 512 },
    { src: "images/asteroid/med2.png", width: 72, height: 72 }
];
Asteroid.LG_TEXTURES = [
    { src: "images/asteroid/lg0.png", width: 512, height: 640 },
    { src: "images/asteroid/lg0.png", width: 640, height: 640 },
    { src: "images/asteroid/lg0.png", width: 608, height: 640 }
];
;
class Projectile extends Rect {
    constructor(x, y, angle, sprite) {
        super(x, y, 35, 35);
        this.angle = 0;
        this.dx = 0;
        this.dy = 0;
        this.speed = 24;
        this.angle = angle;
        this.sprite = sprite;
        this.sprite.rotation = this.angle;
        this.dx = this.speed * Math.sin(rad(angle));
        this.dy = this.speed * -Math.cos(rad(angle));
    }
    static create(x, y, angle, type) {
        switch (type) {
            case "tri":
                return new Projectile(x, y, angle, new Sprite("images/projectile1.png", 280, 320, 2));
            default:
                return new Projectile(x, y, angle, new Sprite("images/projectile0.png", 280, 320, 2));
        }
        ;
    }
    ;
    ;
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
    ;
    draw(ctx) {
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
    }
    ;
    toRect() {
        return new Rect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    }
    ;
}
;
;
;
class Player extends MovingEntity {
    constructor() {
        super(canvas.width / 2, canvas.height / 2);
        this.collectables = {
            dash: [],
            shotgun: [],
            laser: []
        };
        this.possibleCollectables = {
            dash: ["d", "a", "s", "h"],
            shotgun: ["s", "h", "o", "t", "g", "u", "n"],
            laser: ["l", "a", "z", "e", "r", "plus"]
        };
        this.coins = 0;
        this.sprites = [];
        this.projectiles = [];
        this.speed = 3;
        this.rotationSpeed = 5;
        this.dashCooldownTimer = 0;
        this.dashCooldown = globalFPS * 2;
        this.dashMultiplyer = 12;
        this.fireCooldownTimer = 0;
        this.fireCooldown = globalFPS * 0.5;
        this.dx = 0;
        this.dy = 0;
        this.flashX = 0;
        this.flashY = 0;
        this.vx = 0;
        this.vy = 0;
        this.rotv = 0;
        this.rotFriction = 0.7;
        this.width = 70;
        this.height = 70;
        this.sprites[Player.SPRITEMAP.still] = new Sprite("images/ship.png", 128, 128, 1, 0);
        this.sprites[Player.SPRITEMAP.active] = new Sprite("images/ship.png", 128, 128, 4, 1);
        this.dx = this.speed * Math.sin(rad(this.rotation));
        this.dy = this.speed * -Math.cos(rad(this.rotation));
    }
    ;
    fire() {
        if (this.hasShotgun()) {
            let leftAngle = this.rotation - 10;
            let rightAngle = this.rotation + 10;
            if (leftAngle < 0)
                leftAngle = 360 + leftAngle;
            if (rightAngle >= 360)
                rightAngle = rightAngle - 360;
            this.projectiles.push(Projectile.create(this.x, this.y, leftAngle, "tri"));
            this.projectiles.push(Projectile.create(this.x, this.y, this.rotation, "tri"));
            this.projectiles.push(Projectile.create(this.x, this.y, rightAngle, "tri"));
        }
        else {
            this.projectiles.push(Projectile.create(this.x, this.y, this.rotation, "single"));
        }
        ;
    }
    ;
    hasDash() {
        let finalState = {
            d: false,
            a: false,
            s: false,
            h: false
        };
        for (let i = 0; i < this.collectables.dash.length; i++) {
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
            }
            ;
        }
        ;
        return finalState.d && finalState.a && finalState.s && finalState.h;
    }
    ;
    hasShotgun() {
        let finalState = {
            s: false,
            h: false,
            o: false,
            t: false,
            g: false,
            u: false,
            n: false
        };
        for (let i = 0; i < this.collectables.shotgun.length; i++) {
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
            }
            ;
        }
        ;
        return finalState.s && finalState.h && finalState.o && finalState.t && finalState.g && finalState.u && finalState.n;
    }
    ;
    input() {
        if (isMobile()) {
            if (Number(joystick.GetY()) > 0) {
                this.dx = this.speed * Math.sin(rad(this.rotation)) * Math.abs(Number(joystick.GetY())) / 100;
                this.dy = this.speed * -Math.cos(rad(this.rotation)) * Math.abs(Number(joystick.GetY())) / 100;
                this.vx += this.dx;
                this.vy += this.dy;
            }
            ;
            if (Number(joystick.GetY()) < 0) {
                this.dx = -(this.speed / 3) * Math.sin(rad(this.rotation)) * Math.abs(Number(joystick.GetY())) / 100;
                this.dy = -(this.speed / 3) * -Math.cos(rad(this.rotation)) * Math.abs(Number(joystick.GetY())) / 100;
                this.vx += this.dx;
                this.vy += this.dy;
            }
            ;
            if (Number(joystick.GetX()) > 0) {
                this.rotv += this.rotationSpeed * Math.abs(Number(joystick.GetX())) / 100;
            }
            ;
            if (Number(joystick.GetX()) < 0) {
                this.rotv -= this.rotationSpeed * Math.abs(Number(joystick.GetX())) / 100;
            }
            ;
            if (dashButtonState == 1 && this.hasDash()) {
                if (this.dashCooldownTimer <= 0) {
                    this.dx = this.speed * Math.sin(rad(this.rotation));
                    this.dy = this.speed * -Math.cos(rad(this.rotation));
                    this.flashX = this.x;
                    this.flashY = this.y;
                    this.vx += this.dx * this.dashMultiplyer;
                    this.vy += this.dy * this.dashMultiplyer;
                    this.dashCooldownTimer = this.dashCooldown;
                }
                ;
            }
            ;
            if (fireButtonState == 1) {
                if (this.fireCooldownTimer <= 0) {
                    this.fire();
                    this.fireCooldownTimer = this.fireCooldown;
                }
                ;
            }
            ;
        }
        else {
            if (Keys.getState(Keys.KEY_W)) {
                this.dx = this.speed * Math.sin(rad(this.rotation));
                this.dy = this.speed * -Math.cos(rad(this.rotation));
                this.vx += this.dx;
                this.vy += this.dy;
            }
            ;
            if (Keys.getState(Keys.KEY_A)) {
                this.rotv -= this.rotationSpeed;
            }
            ;
            if (Keys.getState(Keys.KEY_S)) {
                this.dx = -(this.speed / 3) * Math.sin(rad(this.rotation));
                this.dy = -(this.speed / 3) * -Math.cos(rad(this.rotation));
                this.vx += this.dx;
                this.vy += this.dy;
            }
            ;
            if (Keys.getState(Keys.KEY_D)) {
                this.rotv += this.rotationSpeed;
            }
            ;
            if (Keys.getState(Keys.KEY_SPACE) && this.hasDash()) {
                if (this.dashCooldownTimer <= 0) {
                    this.dx = this.speed * Math.sin(rad(this.rotation));
                    this.dy = this.speed * -Math.cos(rad(this.rotation));
                    this.flashX = this.x;
                    this.flashY = this.y;
                    this.vx += this.dx * this.dashMultiplyer;
                    this.vy += this.dy * this.dashMultiplyer;
                    this.dashCooldownTimer = this.dashCooldown;
                }
                ;
            }
            ;
            if (Mouse.left) {
                if (this.fireCooldownTimer <= 0) {
                    this.fire();
                    this.fireCooldownTimer = this.fireCooldown;
                }
                ;
            }
            ;
        }
        ;
    }
    ;
    update() {
        this.liveTime++;
        this.dashCooldownTimer--;
        this.fireCooldownTimer--;
        this.input();
        this.rotv *= this.rotFriction;
        this.rotation += this.rotv;
        this.rotation = this.rotation % 360;
        if (this.rotation < 0)
            this.rotation = 360 + this.rotation;
        this.vx *= globaFriction;
        this.vy *= globaFriction;
        if (this.vx >= 0.2) {
            for (let i = 0.2; i < this.vx; i++) {
                this.x++;
                if (!this.insideOf(cameraRect)) {
                    this.x--;
                    this.vx = 0;
                }
                ;
            }
            ;
        }
        ;
        if (this.vx < -0.2) {
            for (let i = this.vx; i < -0.2; i++) {
                this.x--;
                if (!this.insideOf(cameraRect)) {
                    this.x++;
                    this.vx = 0;
                }
                ;
            }
            ;
        }
        ;
        if (this.vy >= 0.2) {
            for (let i = 0.2; i < this.vy; i++) {
                this.y++;
                if (!this.insideOf(cameraRect)) {
                    this.y--;
                    this.vy = 0;
                }
                ;
            }
            ;
        }
        ;
        if (this.vy < -0.2) {
            for (let i = this.vy; i < -0.2; i++) {
                this.y--;
                if (!this.insideOf(cameraRect)) {
                    this.y++;
                    this.vy = 0;
                }
                ;
            }
            ;
        }
        ;
        for (let i = 0; i < this.projectiles.length; i++) {
            if (this.projectiles[i] == null)
                continue;
            this.projectiles[i].update();
            if (!cameraRect.collidingWith(player.projectiles[i]))
                delete this.projectiles[i];
        }
        ;
    }
    ;
    draw(ctx) {
        if ((this.vx > this.speed * 1.8 || this.vy > this.speed * 1.8) || (this.vx < -this.speed * 1.8 || this.vy < -this.speed * 1.8)) {
            this.sprites[Player.SPRITEMAP.active].rotation = this.rotation;
            this.sprites[Player.SPRITEMAP.active].draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
        }
        else {
            this.sprites[Player.SPRITEMAP.still].rotation = this.rotation;
            this.sprites[Player.SPRITEMAP.still].draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
        }
        ;
    }
    ;
    toRect() {
        return new Rect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    }
    ;
}
Player.SPRITEMAP = {
    still: 0,
    active: 1
};
;
class Collectable extends Rect {
    constructor(x, y, width, height, name, value, sprite) {
        super(x, y, width, height);
        this.sprite = sprite;
        this.name = name;
        this.value = value;
    }
    ;
}
;
;
/*
const collectableLetterSprites: CollectableLetterSprites = {
    dash: {

    },
    laser: {

    }
};
*/
class CollectableLetter extends Collectable {
    static createRandom(x, y) {
        const possibleNames = Object.keys(player.collectables);
        const name = possibleNames[Math.floor(Math.random() * possibleNames.length)];
        const possibleValues = player.possibleCollectables[name];
        const value = possibleValues[Math.floor(Math.random() * possibleValues.length)];
        return new CollectableLetter(x, y, name, value, new Sprite("image/ship-zoom.png", 128, 128, 1, 0));
    }
    ;
    constructor(x, y, name, value, sprite) {
        super(x, y, 50, 50, name, value, sprite);
    }
    ;
}
;
class DrawableText extends Rect {
    constructor(text, x, y) {
        super(x, y);
        this.text = text;
    }
    ;
    draw(ctx) {
    }
    ;
}
;
class Backdrop extends Rect {
    constructor(src, width, height, speed, spriteIndex = 0, startX = 0) {
        super(startX, 0);
        this.width = canvas.width;
        this.height = canvas.height;
        this.sprite = new Sprite(src, width, height, 1, spriteIndex);
        this.speed = speed;
    }
    ;
    update() {
        this.x -= this.speed;
        if (this.x <= -this.width) {
            this.x = this.width * 2;
        }
        ;
    }
    ;
    draw(ctx) {
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height - 60);
    }
    ;
}
;
class UIElement extends Rect {
    constructor(sprite, x, y, width, height, update) {
        super(x, y, width, height);
        this.state = 0;
        this.drawFrames = [];
        this.update = () => { };
        this.sprite = sprite;
        this.update = update;
    }
    ;
    draw(ctx) {
        this.update();
        for (let i = 0; i < this.drawFrames.length; i++) {
            this.sprite.currentFrame = this.drawFrames[i];
            this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
        }
        ;
        this.drawFrames = [];
    }
    ;
}
;
const cameraRect = new Rect(0, 0, canvas.width, canvas.height - 60);
const player = new Player();
const asteroids = [
    Asteroid.create(),
    Asteroid.create(),
    Asteroid.create(),
    Asteroid.create(),
    Asteroid.create(),
    Asteroid.create(),
    Asteroid.create(),
    Asteroid.create()
]; // All the asteroids
const backdropStar = [
    new Backdrop("images/stars.png", 800, 600, 1, 0, 0),
    new Backdrop("images/stars.png", 800, 600, 1, 0, canvas.width),
    new Backdrop("images/stars.png", 800, 600, 1, 0, canvas.width * 2),
    new Backdrop("images/stars.png", 800, 600, 2, 1, 0),
    new Backdrop("images/stars.png", 800, 600, 2, 1, canvas.width),
    new Backdrop("images/stars.png", 800, 600, 2, 1, canvas.width * 2)
];
const dashUpgradeUpdate = function () {
    let finalState = {
        d: false,
        a: false,
        s: false,
        h: false
    };
    for (let i = 0; i < player.collectables.dash.length; i++) {
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
    }
    ;
    if (finalState.d && finalState.a && finalState.s && finalState.h) {
        this.drawFrames.push(9);
    }
    else {
        this.drawFrames.push(0);
        if (finalState.d) {
            this.drawFrames.push(2);
        }
        else {
            this.drawFrames.push(1);
        }
        ;
        if (finalState.a) {
            this.drawFrames.push(4);
        }
        else {
            this.drawFrames.push(3);
        }
        ;
        if (finalState.s) {
            this.drawFrames.push(6);
        }
        else {
            this.drawFrames.push(5);
        }
        ;
        if (finalState.h) {
            this.drawFrames.push(8);
        }
        else {
            this.drawFrames.push(7);
        }
        ;
    }
    ;
};
const shotgunUpgradeUpdate = function () {
    let finalState = {
        s: false,
        h: false,
        o: false,
        t: false,
        g: false,
        u: false,
        n: false
    };
    for (let i = 0; i < player.collectables.shotgun.length; i++) {
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
        }
        ;
    }
    ;
    if (player.hasShotgun()) {
        this.drawFrames.push(15);
    }
    else {
        this.drawFrames.push(0);
        if (finalState.s) {
            this.drawFrames.push(2);
        }
        else {
            this.drawFrames.push(1);
        }
        ;
        if (finalState.h) {
            this.drawFrames.push(4);
        }
        else {
            this.drawFrames.push(3);
        }
        ;
        if (finalState.o) {
            this.drawFrames.push(6);
        }
        else {
            this.drawFrames.push(5);
        }
        ;
        if (finalState.t) {
            this.drawFrames.push(8);
        }
        else {
            this.drawFrames.push(7);
        }
        ;
        if (finalState.g) {
            this.drawFrames.push(10);
        }
        else {
            this.drawFrames.push(9);
        }
        ;
        if (finalState.u) {
            this.drawFrames.push(12);
        }
        else {
            this.drawFrames.push(11);
        }
        ;
        if (finalState.n) {
            this.drawFrames.push(14);
        }
        else {
            this.drawFrames.push(13);
        }
        ;
    }
    ;
};
const bottomBarUIUpdate = function () {
    this.drawFrames = [0];
};
const uiElements = [
    new UIElement(new Sprite("images/bottombar.png", 960, 72, 1, 0), 0, 540, 800, 60, bottomBarUIUpdate),
    new UIElement(new Sprite("images/upgrade/dash.png", 170, 50, 10), 15, 555, 102, 30, dashUpgradeUpdate),
    new UIElement(new Sprite("images/upgrade/shotgun.png", 290, 50, 10), 124.5, 555, 174, 30, shotgunUpgradeUpdate)
];
function render() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < backdropStar.length; i++) {
        backdropStar[i].draw(ctx);
    }
    ;
    for (let i = 0; i < player.projectiles.length; i++) {
        if (player.projectiles[i] == null)
            continue;
        player.projectiles[i].draw(ctx);
    }
    ;
    for (let i = 0; i < asteroids.length; i++) {
        if (asteroids[i] == null)
            continue;
        asteroids[i].draw(ctx);
    }
    ;
    player.draw(ctx);
    for (let i = 0; i < uiElements.length; i++) {
        uiElements[i].draw(ctx);
    }
    ;
    requestAnimationFrame(render);
}
;
render();
function update() {
    for (let i = 0; i < backdropStar.length; i++) {
        backdropStar[i].update();
    }
    ;
    for (let i = 0; i < asteroids.length; i++) {
        if (asteroids[i] == null)
            continue;
        asteroids[i].update();
        if (!cameraRect.collidingWith(asteroids[i])) {
            delete asteroids[i];
            continue;
        }
        ;
        for (let k = 0; k < player.projectiles.length; k++) {
            if (player.projectiles[k] == null)
                continue;
            if (asteroids[i].collidingWith(player.projectiles[k])) {
                const newAst = asteroids[i].mitosisAsteroid(player.projectiles[k].angle);
                newAst.forEach((e) => {
                    asteroids.push(e);
                });
                delete asteroids[i];
                delete player.projectiles[k];
                continue;
            }
            ;
        }
        ;
    }
    ;
    player.update();
}
;
setInterval(update, fpsToMilliseconds(globalFPS));
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
    const mobCont = document.querySelectorAll("div#mobControls")[0];
    mobCont.style.display = "block";
}
;
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
    }
    else {
        dashButtonState = 2;
        dashButton.src = "images/mobile/dashdis.png";
    }
    ;
});
dashButton.addEventListener('touchend', _ => {
    if (player.hasDash()) {
        dashButtonState = 0;
        dashButton.src = "images/mobile/dashoff.png";
    }
    else {
        dashButtonState = 2;
        dashButton.src = "images/mobile/dashdis.png";
    }
    ;
});

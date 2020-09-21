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
document.addEventListener("mousedown", Mouse.handleMousedown);
document.addEventListener("mouseup", Mouse.handleMouseup);
document.addEventListener("mousemove", Mouse.handleMousemove);
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
                this.speed = 1.95;
                break;
            case "large":
                this.size = 80;
                this.rotationSpeed = 1.4;
                this.speed = 0.95;
                break;
            default: // Deafaults to medium
                this.size = 55;
                this.rotationSpeed = 0.7;
                this.speed = 1.3;
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
    mitosis(angle) {
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
    { src: "images/asteroid/sm0.png", width: 480, height: 384 },
    { src: "images/asteroid/sm1.png", width: 448, height: 320 },
    { src: "images/asteroid/sm2.png", width: 320, height: 384 }
];
Asteroid.MED_TEXTURES = [
    { src: "images/asteroid/med0.png", width: 448, height: 544 },
    { src: "images/asteroid/med1.png", width: 480, height: 512 },
    { src: "images/asteroid/med2.png", width: 544, height: 544 }
];
Asteroid.LG_TEXTURES = [
    { src: "images/asteroid/lg0.png", width: 512, height: 640 },
    { src: "images/asteroid/lg0.png", width: 640, height: 640 },
    { src: "images/asteroid/lg0.png", width: 608, height: 640 }
];
;
class Projectile extends Rect {
    constructor(x, y, angle) {
        super(x, y, 35, 35);
        this.angle = 0;
        this.dx = 0;
        this.dy = 0;
        this.speed = 24;
        this.angle = angle;
        this.sprite = new Sprite("images/projectile.png", 224, 256, 2);
        this.sprite.rotation = this.angle;
        this.dx = this.speed * Math.sin(rad(angle));
        this.dy = this.speed * -Math.cos(rad(angle));
    }
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
class Player extends MovingEntity {
    constructor() {
        super(canvas.width / 2, canvas.height / 2);
        this.coins = 0;
        this.sprites = [];
        this.projectiles = [];
        this.speed = 3;
        this.rotationSpeed = 5;
        this.dashCooldownTimer = 0;
        this.dashCooldown = globalFPS * 2;
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
        this.projectiles.push(new Projectile(this.x, this.y, this.rotation));
    }
    ;
    input() {
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
        if (Keys.getState(Keys.KEY_SPACE)) {
            if (this.dashCooldownTimer <= 0) {
                this.dx = this.speed * Math.sin(rad(this.rotation));
                this.dy = this.speed * -Math.cos(rad(this.rotation));
                this.flashX = this.x;
                this.flashY = this.y;
                this.vx += this.dx * 24;
                this.vy += this.dy * 24;
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
        if (this.vx >= 0.1) {
            for (let i = 0.1; i < this.vx; i++) {
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
        if (this.vx < -0.1) {
            for (let i = this.vx; i < -0.1; i++) {
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
        if (this.vy >= 0.1) {
            for (let i = 0.1; i < this.vy; i++) {
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
        if (this.vy < -0.1) {
            for (let i = this.vy; i < -0.1; i++) {
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
    constructor(x, y, width, height) {
        super(x, y, width, height);
    }
    ;
}
;
class Coin extends Collectable {
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
        this.sprite.draw(ctx, this.toRect().x, this.toRect().y, this.toRect().width, this.toRect().height);
    }
    ;
}
;
const cameraRect = new Rect(0, 0, canvas.width, canvas.height);
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
                const newAst = asteroids[i].mitosis(player.projectiles[k].angle);
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

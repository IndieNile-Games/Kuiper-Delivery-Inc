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
const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
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
        return yrect.x < rect.x + rect.width &&
            yrect.x + yrect.width > rect.x &&
            yrect.y < rect.y + rect.height &&
            yrect.y + yrect.height > rect.y;
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
class Asteroid extends MovingEntity {
    constructor(x, y, angle, type = "medium") {
        super(x, y);
        this.isLive = true; // If the asteroids flagged for deletion
        this.type = "medium"; // The type of asteroid
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
        }
        ;
        // Get the movement direction increments;
        this.dx = this.speed * Math.sin(rad(angle));
        this.dy = this.speed * -Math.cos(rad(angle));
    }
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
        this.sprite.rotation = this.rotation;
        this.sprite.draw(ctx, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
    ;
    mitosis() {
        // Get children movement direction
        let leftAngle = this.angle - 90;
        let rightAngle = this.angle + 90;
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
            final.push(new Asteroid(this.x, this.y, this.angle, "small"));
            final[final.length - 1].rotation = this.rotation;
        }
        ;
        this.isLive = false; // Kill this asteroid
        return final;
    }
    ;
    toRect() {
        return new Rect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    }
    ;
}
;
let cameraRect = new Rect(0, 0, canvas.width, canvas.height);
const asteroids = []; // All the asteroids
asteroids.push(new Asteroid(canvas.width / 2, canvas.height / 2 - 90, 0, "large"));
asteroids.push(new Asteroid(canvas.width / 2 + 45, canvas.height / 2 - 45, 45, "large"));
asteroids.push(new Asteroid(canvas.width / 2 + 90, canvas.height / 2, 90, "large"));
asteroids.push(new Asteroid(canvas.width / 2 + 45, canvas.height / 2 + 45, 135, "large"));
asteroids.push(new Asteroid(canvas.width / 2, canvas.height / 2 + 90, 180, "large"));
asteroids.push(new Asteroid(canvas.width / 2 - 45, canvas.height / 2 + 45, 225, "large"));
asteroids.push(new Asteroid(canvas.width / 2 - 90, canvas.height / 2, 270, "large"));
asteroids.push(new Asteroid(canvas.width / 2 - 45, canvas.height / 2 - 45, 315, "large"));
function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < asteroids.length; i++) {
        // if (asteroids[i+1] == null && asteroids[i+10] == null) i += 10;
        if (asteroids[i] == null)
            continue;
        asteroids[i].draw(ctx);
    }
    ;
    ctx.restore();
    requestAnimationFrame(render);
}
;
render();
function update() {
    cameraRect = new Rect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < asteroids.length; i++) {
        if (asteroids[i] == null)
            continue;
        asteroids[i].update();
        if (asteroids[i].liveTime > 120) {
            const newAsteroids = asteroids[i].mitosis();
            delete asteroids[i];
            newAsteroids.forEach(e => {
                asteroids.push(e);
            });
        }
        ;
        //if (cameraRect.collidingWith(asteroids[i]) === false) delete asteroids[i];
    }
    ;
}
;
setInterval(update, fpsToMilliseconds(30));

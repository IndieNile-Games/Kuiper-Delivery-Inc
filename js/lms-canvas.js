;
HTMLImageElement.prototype.draw = function (ctx, x, y, width, height, cropX = 0, cropY = 0, cropWidth = this.width, cropHeight = this.height) {
    ctx.drawImage(this, cropX, cropY, cropWidth, cropHeight, x, y, width, height);
};
function calcRatio(baseRatio, similerRatio) {
    const baseTop = Number(baseRatio.split(":")[0]);
    const baseBottom = Number(baseRatio.split(":")[1]);
    let similerTop2 = similerRatio.split(":")[0];
    let similerBottom2 = similerRatio.split(":")[1];
    if (similerTop2 === "X") {
        const similerBottom = Number(similerRatio.split(":")[1]);
        let comparison = baseBottom / similerBottom;
        return baseTop / comparison;
    }
    else if (similerBottom2 === "X") {
        const similerTop = Number(similerRatio.split(":")[0]);
        let comparison = baseTop / similerTop;
        return baseBottom / comparison;
    }
    ;
}
;
class Sprite {
    constructor(src, frameWidth, frameHeight, frameCount, frameStart = 0, framesUntilUpdate = 1) {
        this.activeTime = 0;
        this.rotation = 0;
        this.image = new Image();
        this.image.src = src;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameStart = frameStart;
        this.frameCount = frameCount;
        this.currentFrame = frameStart;
        this.framesUntilUpdate = framesUntilUpdate;
    }
    ;
    getFramePosition(x, y) {
        if (x || y) {
            const final = { x: 0, y: 0 };
            if (x) {
                final.x = x * this.frameWidth;
            }
            ;
            if (y) {
                final.y = y * this.frameHeight;
            }
            ;
            return final;
        }
        ;
        const framesWide = this.image.width / this.frameWidth;
        const frameX = (this.currentFrame % framesWide) * this.frameWidth;
        const frameY = Math.floor(this.currentFrame / framesWide) * this.frameHeight;
        return {
            x: frameX,
            y: frameY
        };
    }
    ;
    update() {
        this.activeTime++;
        if (this.activeTime % this.framesUntilUpdate == 0)
            this.currentFrame++;
        if (this.currentFrame >= this.frameCount + this.frameStart) {
            this.currentFrame = this.frameStart;
        }
        ;
    }
    ;
    draw(ctx, x, y, width, height) {
        ctx.save();
        const spritePos = this.getFramePosition();
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(this.rotation * Math.PI / 180);
        this.image.draw(ctx, -(width / 2), -(height / 2), width, height, spritePos.x, spritePos.y, this.frameWidth, this.frameHeight);
        ctx.setTransform(0, 0, 0, 0, 0, 0);
        ctx.restore();
        this.update();
    }
    ;
}
;
class Rectangle {
    constructor(x, y, width, height) {
        this.sprite = null;
        this.color = "#000000";
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    ;
    bindSprite(sprite) {
        this.sprite = sprite;
    }
    ;
    unbindSprite() {
        this.sprite = null;
    }
    ;
    getSpriteRect(scale = 1) {
        if (this.sprite) {
            if (scale === "same") {
                const ratio = calcRatio(`${this.sprite.frameWidth}:${this.width}`, `1:X`);
                return new Rectangle((this.x + (this.width / 2)) - ((this.sprite.frameWidth * ratio) / 2), (this.y + (this.height / 2)) - ((this.sprite.frameHeight * ratio) / 2), this.sprite.frameWidth * ratio, this.sprite.frameHeight * ratio);
            }
            else if (typeof scale === "number") {
                return new Rectangle((this.x + (this.width / 2)) - ((this.sprite.frameWidth * scale) / 2), (this.y + (this.height / 2)) - ((this.sprite.frameHeight * scale) / 2), this.sprite.frameWidth * scale, this.sprite.frameHeight * scale);
            }
            else {
                return false;
            }
            ;
        }
        else {
            return false;
        }
        ;
    }
    ;
    draw(ctx, spriteScale = 1) {
        if (this.sprite) {
            const spriteRect = this.getSpriteRect(spriteScale);
            if (spriteRect) {
                this.sprite.draw(ctx, spriteRect.x, spriteRect.y, spriteRect.width, spriteRect.height);
                return true;
            }
            ;
            return false;
        }
        else {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
            return true;
        }
        ;
    }
    ;
}
;

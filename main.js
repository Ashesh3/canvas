let canvas = document.getElementById("game");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 130;

let ctx = canvas.getContext("2d");

let width = canvas.width;
let height = canvas.height;

let animation_queue = [];
let currentPos = 0;

let animations = {
    "backward": { "frame_count": 6, "frames": [] },
    "forward": { "frame_count": 6, "frames": [] },
    "block": { "frame_count": 9, "frames": [] },
    "punch": { "frame_count": 7, "frames": [] },
    "kick": { "frame_count": 7, "frames": [] },
    "idle": { "frame_count": 8, "frames": [] },
}

let background;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadImage(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not load image at ' + src));
        img.src = src;
    });
}
async function loadAnimations() {
    return new Promise(async (resolve) => {
        background = await loadImage("images/background.jpg");
        for (let animation in animations) {
            for (let i = 0; i < animations[animation].frame_count; i++) {
                let frame = await loadImage(`images/${animation}/${i + 1}.png`)
                animations[animation].frames.push(frame);
            }
        }
        resolve();
    })
}

async function playAnimation(animation) {
    return new Promise(async (resolve) => {
        for (let i = 0; i < animations[animation].frame_count; i++) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(background, 0, 0, width, height);
            ctx.drawImage(animations[animation].frames[i], currentPos, 0, width / 2.5, height);
            await sleep(100);
        }
        resolve();
    })
}

async function animationManager() {
    while (animation_queue.length > 0) {
        let animation = animation_queue.shift();
        await playAnimation(animation);
    }
    await playAnimation("idle")
    animationManager()
}

async function doAction(action) {
    return new Promise(async (resolve) => {
        animation_queue.push(action);
        if (action == "forward") {
            await sleep(animations[action].frame_count * 100);
            currentPos += 120
        }
        else if (action == "backward") {
            await sleep(animations[action].frame_count * 100);
            currentPos -= 120
        }
        resolve();
    })
}

loadAnimations().then(() => {
    animationManager()
    document.addEventListener("keydown", function keyDown(e) {
        if (e.repeat)
            return;

        var key = e.key;
        switch (key) {
            case "ArrowLeft":
                doAction("backward");
                break;
            case "ArrowRight":
                doAction("forward");
                break;
            case "z":
                doAction("block");
                break;
            case "x":
                doAction("kick");
                break;
            case "c":
                doAction("punch");
                break;
        }
    }, false);
})
/* ==========================================================
   THREADTALES
   BACKGROUND.JS
   PART 1
========================================================== */

const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

/* ----------------------------------
   SETTINGS
-----------------------------------*/

const TOTAL_FRAMES = 180;      // Change to match your JPG count
const FPS = 30;
const FRAME_TIME = 1000 / FPS;

/* ----------------------------------
   VARIABLES
-----------------------------------*/

const images = [];

let loadedImages = 0;
let currentFrame = 0;

let lastFrameTime = 0;

let ready = false;

/* ----------------------------------
   RESIZE
-----------------------------------*/

function resize(){

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

}

window.addEventListener("resize", resize);

/* ----------------------------------
   PRELOAD IMAGES
-----------------------------------*/

function preloadImages(){

    for(let i=1;i<=TOTAL_FRAMES;i++){

        const img = new Image();

        img.src =
        `/static/images/background/ezgif-frame-${String(i).padStart(3,"0")}.jpg`;

        img.onload = ()=>{

            loadedImages++;

            if(loadedImages === TOTAL_FRAMES){

                ready = true;

                hideLoader();

                requestAnimationFrame(render);

            }

        };

        images.push(img);

    }

}

preloadImages();

/* ----------------------------------
   LOADER
-----------------------------------*/

function hideLoader(){

    const loader = document.getElementById("loader");

    if(!loader) return;

    loader.style.opacity = "0";

    setTimeout(()=>{

        loader.style.display = "none";

    },900);

}

/* ----------------------------------
   DRAW IMAGE
-----------------------------------*/

function drawImage(img){

    if(!img) return;

    const imageRatio = img.width / img.height;
    const screenRatio = width / height;

    let drawWidth;
    let drawHeight;

    if(imageRatio > screenRatio){

        drawHeight = height;
        drawWidth = drawHeight * imageRatio;

    }else{

        drawWidth = width;
        drawHeight = drawWidth / imageRatio;

    }

    const x = (width - drawWidth)/2;
    const y = (height - drawHeight)/2;

    ctx.clearRect(0,0,width,height);

    ctx.drawImage(
        img,
        x,
        y,
        drawWidth,
        drawHeight
    );

}

/* ----------------------------------
   ANIMATION LOOP
-----------------------------------*/

function render(time){

    if(!ready){

        requestAnimationFrame(render);

        return;

    }

    if(time-lastFrameTime>=FRAME_TIME){

        drawImage(images[currentFrame]);

        currentFrame++;

        if(currentFrame>=TOTAL_FRAMES){

            currentFrame=0;

        }

        lastFrameTime=time;

    }

    requestAnimationFrame(render);

}

```javascript
/* ==========================================================
   THREADTALES
   BACKGROUND.JS
   PART 2
========================================================== */

/* ----------------------------------
   CINEMATIC VARIABLES
-----------------------------------*/

let zoom = 1.0;
let zoomDirection = 1;

let driftX = 0;
let driftY = 0;

let mouseX = 0;
let mouseY = 0;

let targetMouseX = 0;
let targetMouseY = 0;

const MAX_ZOOM = 1.12;
const MIN_ZOOM = 1.00;

const DRIFT_SPEED = 0.05;

/* ----------------------------------
   MOUSE PARALLAX
-----------------------------------*/

window.addEventListener("mousemove",(e)=>{

    targetMouseX = (e.clientX / width - 0.5) * 40;
    targetMouseY = (e.clientY / height - 0.5) * 25;

});

/* ----------------------------------
   SMOOTH INTERPOLATION
-----------------------------------*/

function lerp(a,b,t){

    return a + (b-a) * t;

}

/* ----------------------------------
   UPDATE CINEMATIC EFFECTS
-----------------------------------*/

function updateEffects(){

    mouseX = lerp(mouseX,targetMouseX,.05);
    mouseY = lerp(mouseY,targetMouseY,.05);

    driftX += DRIFT_SPEED;

    driftY += DRIFT_SPEED * .35;

    if(zoomDirection===1){

        zoom += .00008;

        if(zoom>=MAX_ZOOM){

            zoomDirection=-1;

        }

    }else{

        zoom -= .00008;

        if(zoom<=MIN_ZOOM){

            zoomDirection=1;

        }

    }

}

/* ----------------------------------
   DRAW CINEMATIC FRAME
-----------------------------------*/

function drawImage(img){

    if(!img) return;

    updateEffects();

    ctx.clearRect(0,0,width,height);

    const imageRatio = img.width / img.height;
    const screenRatio = width / height;

    let drawWidth;
    let drawHeight;

    if(imageRatio>screenRatio){

        drawHeight = height * zoom;
        drawWidth = drawHeight * imageRatio;

    }else{

        drawWidth = width * zoom;
        drawHeight = drawWidth / imageRatio;

    }

    const x =
        (width-drawWidth)/2
        - mouseX
        + Math.sin(driftX*.01)*20;

    const y =
        (height-drawHeight)/2
        - mouseY
        + Math.cos(driftY*.01)*12;

    ctx.save();

    ctx.globalAlpha = 1;

    ctx.drawImage(

        img,

        x,

        y,

        drawWidth,

        drawHeight

    );

    ctx.restore();

}

/* ----------------------------------
   PAGE VISIBILITY
-----------------------------------*/

document.addEventListener("visibilitychange",()=>{

    if(document.hidden){

        lastFrameTime=performance.now();

    }

});

/* ----------------------------------
   OPTIONAL FPS DISPLAY
-----------------------------------*/

// const fps=document.createElement("div");
//
// fps.style.position="fixed";
// fps.style.top="10px";
// fps.style.left="10px";
// fps.style.color="white";
// fps.style.zIndex=99999;
//
// document.body.appendChild(fps);
//
// let lastFPS=performance.now();
// let frameCounter=0;
//
// function showFPS(){
//
// frameCounter++;
//
// const now=performance.now();
//
// if(now-lastFPS>=1000){
//
// fps.textContent="FPS : "+frameCounter;
//
// frameCounter=0;
//
// lastFPS=now;
//
// }
//
// requestAnimationFrame(showFPS);
//
// }
//
// showFPS();
```

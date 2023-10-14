import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;
const canvasWidth = 256;
const canvasHeight = 256;

const gameName = "StickerPAD";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;

const canvas = document.createElement("canvas");
canvas.id = "myCanvas";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const ctx = canvas.getContext("2d")!;

ctx.fillStyle = "beige";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

app.append(header, canvas);

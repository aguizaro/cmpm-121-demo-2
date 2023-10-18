import "./style.css";

//----------------------------class def + helper functions-------------------------------------------------------
// class def for a line object
class LineCommand {
  points: { x: number; y: number }[];
  length: number;

  constructor(x?: number, y?: number) {
    this.points = x && y ? [{ x, y }] : [];
    this.length = x && y ? 1 : 0;
  }
  // copy constructor
  copyFrom(original: LineCommand) {
    this.points = [...original.points];
    this.length = original.length;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    const { x, y } = this.points[0];
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  extend(x: number, y: number) {
    this.points.push({ x, y });
    this.length++;
  }
}

// notify observer of change by dispatching a new event
function notifyChange() {
  canvas.dispatchEvent(new Event("drawing-changed"));
}

//--------------------------------create HTML elements + canvas + global vars ------------------------------------------------
// set up main div
const app: HTMLDivElement = document.querySelector("#app")!;
// title
const gameName = "StickerPAD";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
// create canvas
const canvasWidth = 256;
const canvasHeight = 256;
const lineWidth = 1.5;
const canvas = document.createElement("canvas");
canvas.id = "myCanvas";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "beige";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

//set up pen tools
let penDown = false;
let commands: LineCommand[] = [];
let redoStack: LineCommand[] = [];

//---------------------------------create buttons---------------------------------------------------------
//clear canvas button
const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.classList.add("button-container");
//clear canvas when button is clicked
clearButton.addEventListener("click", () => {
  commands = []; //clear stroke history
  redoStack = [];
  notifyChange();
});
// undo button
const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.classList.add("button-container");
undoButton.addEventListener("click", () => {
  if (!commands.length) return;
  redoStack.push(commands.pop()!);
  notifyChange();
});
// redo button
const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.classList.add("button-container");
redoButton.addEventListener("click", () => {
  if (!redoStack.length) return;
  commands.push(redoStack.pop()!);
  notifyChange();
});

//---------------------------------event listeners--------------------------------------------
canvas.addEventListener("mousedown", (e) => {
  console.log("down");
  penDown = true;
  //start new line with fist point
  commands.push(new LineCommand(e.offsetX, e.offsetY));
});
canvas.addEventListener("mousemove", (e) => {
  if (penDown) {
    console.log("draw");
    commands[commands.length - 1].extend(e.offsetX, e.offsetY);
    commands[commands.length - 1].display(ctx);
    redoStack = [];
  } else {
    console.log("move");
  }
});
canvas.addEventListener("mouseleave", () => {
  penDown = false;
  console.log("leave");
});
document.addEventListener("mouseup", () => {
  penDown = false;
  //clear currentLine
  console.log("up");
});
// observer for drawing-changed event - clears and redraws canvas
canvas.addEventListener("drawing-changed", () => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  commands.forEach((line) => {
    if (line.length) {
      line.display(ctx);
    }
  });
});

//-------------------------add HTML Elements to main app div------------------------------------------
app.append(header, canvas, clearButton, undoButton, redoButton);

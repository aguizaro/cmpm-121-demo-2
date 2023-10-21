import "./style.css";

//--------------------------------create HTML elements + canvas + global vars ------------------------------------------------
// set up main div
const app: HTMLDivElement = document.querySelector("#app")!;
// title
const gameName = "StickerPAD";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
// create canvas
const canvasWidth = 500;
const canvasHeight = 500;
const canvas = document.createElement("canvas");
canvas.id = "myCanvas";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style.cursor = "none";
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "beige";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);
// create canvas container div
const leftContainer = document.createElement("div");
leftContainer.id = "left-container";
// create button div
const buttons = document.createElement("div");
buttons.id = "button-container";
leftContainer.append(header, canvas, buttons); //buttons + canvas inside canvas container
// create marker tools
const markerTools = document.createElement("div");
markerTools.id = "marker-tools";
const subhead = document.createElement("h2");
subhead.innerText = "Marker Tools";
markerTools.appendChild(subhead);

//set up pen tools
const firstIndex = 0;
let penDown = false;
let commands: (StickerCommand | LineCommand)[] = [];
let redoStack: (StickerCommand | LineCommand)[] = [];
let lineWidth = 1;
const colors = ["black", "red", "blue", "green", "orange", "white", "yellow"];
let penColor: string | null = colors[firstIndex];
const stickers = [
  "👾",
  "👻",
  "💩",
  "🕸",
  "🐲",
  "🌞",
  "🌳",
  "🍺",
  "⚽️",
  "❤️‍🔥",
  "🚽",
];
let currentSticker: string | null = null;
let cursorComand: CursorComand | null = null;
let stickerCommand: StickerCommand | null = null;

//----------------------------class def + helper functions-------------------------------------------------------
class LineCommand {
  points: { x: number; y: number }[];
  length: number;
  weight: number;
  color: string;

  constructor(x: number, y: number, weight: number, color: string) {
    this.points = [{ x, y }];
    this.length = 1;
    this.weight = weight;
    this.color = color;
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.weight;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.color;
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
class CursorComand {
  x: number;
  y: number;
  size: number;
  color: string | null;
  constructor(x: number, y: number, size: number, color: string | null) {
    this.x = x;
    this.y = y;
    this.size = size * 4;
    this.color = color;
  }
  display(ctx: CanvasRenderingContext2D) {
    const originalFillStyle = ctx.fillStyle;
    ctx.font = `${Math.max(7, this.size)}px monospace`;
    if (this.color) {
      ctx.fillStyle = this.color;
      if (this.size <= 4) {
        ctx.fillText("+", this.x - 2, this.y + 3);
      } else {
        ctx.fillText("+", this.x - 8, this.y + 3);
      }
    }
    ctx.fillStyle = originalFillStyle;
  }
}
class StickerCommand {
  sticker: string;
  x: number;
  y: number;
  size: number;
  length: number;
  constructor(sticker: string, x: number, y: number, size: number) {
    this.sticker = sticker;
    this.x = x;
    this.y = y;
    this.size = size * 20;
    this.length = 1;
  }
  display(ctx: CanvasRenderingContext2D) {
    const originalFillStyle = ctx.fillStyle;
    ctx.fillStyle = "black";
    ctx.font = `${Math.max(7, this.size)}px monospace`;
    ctx.fillText(this.sticker, this.x, this.y);
    ctx.fillStyle = originalFillStyle;
  }
  extend(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// notify observer of change by dispatching a new event
function notifyChange(name: string) {
  canvas.dispatchEvent(new Event(name));
}
//redraw canvas and cursor
function redraw() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  commands.forEach((command) => {
    if (command.length) {
      command.display(ctx);
    }
  });
  // display sticker cursor if selected
  if (currentSticker && stickerCommand) {
    stickerCommand.display(ctx);
  }
  // display pen cursor if selected
  if (penColor && cursorComand) {
    cursorComand.display(ctx);
  }
}
// Disable pen tool and reset colors button
function disablePen() {
  penColor = null;
  colorButton.style.backgroundColor = colors[firstIndex];
  colorButton.style.color = "white";
  colorButton.innerText = `marker`;
}

//---------------------------------create buttons---------------------------------------------------------
//clear canvas button
const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerText = "Clear";
//clear canvas when button is clicked
clearButton.addEventListener("click", () => {
  commands = []; //clear stroke history
  redoStack = [];
  notifyChange("drawing-changed");
});
// undo button
const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.addEventListener("click", () => {
  if (!commands.length) return;
  redoStack.push(commands.pop()!);
  notifyChange("drawing-changed");
});
// redo button
const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.addEventListener("click", () => {
  if (!redoStack.length) return;
  commands.push(redoStack.pop()!);
  notifyChange("drawing-changed");
});
buttons.append(clearButton, undoButton, redoButton);
// line width button
const lineWidthButton: HTMLButtonElement = document.createElement("button");
lineWidthButton.innerText = `${lineWidth}px`;
lineWidthButton.addEventListener("click", () => {
  lineWidth = lineWidth < 10 ? lineWidth + 1 : 1;
  ctx.lineWidth = lineWidth;
  lineWidthButton.innerText = `${lineWidth}px`;
  if (cursorComand) cursorComand.size = lineWidth;
  notifyChange("tool-moved");
});
//button to change pen color
const colorButton: HTMLButtonElement = document.createElement("button");
colorButton.innerText = `${penColor}`;
colorButton.addEventListener("click", () => {
  if (penColor) {
    for (let i = 0; i < colors.length; i++) {
      if (penColor === colors[i]) {
        penColor = i < colors.length - 1 ? colors[i + 1] : colors[firstIndex];
        break;
      }
    }
    colorButton.innerText = `${penColor}`;
    if (penColor === "white" || penColor === "yellow") {
      colorButton.style.color = "black";
    } else {
      colorButton.style.color = "white";
    }
    colorButton.style.backgroundColor = penColor;
  } else {
    //disable stickers pen
    currentSticker = null;
    stickerButton.innerText = "stickers";
    // enable marker pen / pen colors button
    penColor = colors[firstIndex];
    colorButton.innerText = `${penColor}`;
  }
});
//button to change sticker
const stickerButton: HTMLButtonElement = document.createElement("button");
stickerButton.innerText = currentSticker ? currentSticker : "stickers";
stickerButton.addEventListener("click", () => {
  // switch to next sticker
  if (currentSticker) {
    for (let i = firstIndex; i < stickers.length; i++) {
      if (currentSticker === stickers[i]) {
        currentSticker =
          i < stickers.length - 1 ? stickers[i + 1] : stickers[firstIndex];
        break;
      }
    }
  } else {
    // enable sticker button
    currentSticker = stickers[firstIndex];
    disablePen(); //reset color button
  }

  stickerButton.innerText = currentSticker
    ? currentSticker
    : stickers[firstIndex];
  notifyChange("tool-moved");
});
//button for custom sticker
const customButton: HTMLButtonElement = document.createElement("button");
customButton.innerText = "custom sticker";
customButton.addEventListener("click", () => {
  const input: string | null = window.prompt(
    "Input a custom sticker: ",
    undefined
  );
  if (input) {
    stickers.push(input);
    currentSticker = input;
    disablePen();
    stickerButton.innerText = currentSticker;
    notifyChange("tool-moved");
  }
});
// add buttons for pen marker tools
markerTools.append(lineWidthButton, colorButton, stickerButton, customButton);

//---------------------------------event listeners--------------------------------------------
canvas.addEventListener("mousedown", (e) => {
  console.log("down");
  penDown = true;
  //start new line or sticker with first point
  if (currentSticker) {
    commands.push(
      new StickerCommand(currentSticker, e.offsetX, e.offsetY, lineWidth)
    );
  } else {
    commands.push(new LineCommand(e.offsetX, e.offsetY, lineWidth, penColor!));
  }
  redoStack = [];
});
canvas.addEventListener("mousemove", (e) => {
  if (penDown) {
    cursorComand = null;
    stickerCommand = null;
    console.log("draw");
    commands[commands.length - 1].extend(e.offsetX, e.offsetY);
    commands[commands.length - 1].display(ctx);
  }
  // use sticker as cursor
  if (currentSticker) {
    stickerCommand = new StickerCommand(
      currentSticker,
      e.offsetX,
      e.offsetY,
      lineWidth
    );
    // use pen as cursor
  } else if (penColor) {
    cursorComand = new CursorComand(e.offsetX, e.offsetY, lineWidth, penColor);
  }
  notifyChange("tool-moved");
});
canvas.addEventListener("mouseout", () => {
  console.log("out");
  penDown = false;
  stickerCommand = null;
  cursorComand = null;
  notifyChange("tool-moved");
});
canvas.addEventListener("mouseenter", (e) => {
  console.log("enter");
  cursorComand = new CursorComand(e.offsetX, e.offsetY, lineWidth, penColor);
  notifyChange("tool-moved");
});
document.addEventListener("mouseup", () => {
  console.log("up");
  penDown = false;
});
// observer for tool-moved event
canvas.addEventListener("tool-moved", () => {
  redraw();
});
// observer for drawing-changed event - clears and redraws canvas
canvas.addEventListener("drawing-changed", () => {
  redraw();
});

//-------------------------add HTML Elements to main app div------------------------------------------
app.append(leftContainer, markerTools);

import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  generateHash,
  generateShapeFromHash,
  splitHash,
  CANVAS_SIZE,
  Shape,
  UNIT_MULTIPLIER,
} from "./util";
import { DebounceInput } from "react-debounce-input";

const seed = "akkio";

type CanvasProps = {
  shapes: Shape[];
  snapshot: (canvasImage: string | undefined) => void;
};

interface HistoryHash {
  [text: string]: string | undefined;
}

const Canvas = ({ shapes = [], snapshot }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }
    context.fillStyle = "#fff";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // Iterates through shapes to draw
    shapes.forEach((shape, idx) => {
      // Use the multiplier to scale up drawing
      const posX = shape.position[0] * UNIT_MULTIPLIER;
      const posY = shape.position[1] * UNIT_MULTIPLIER;
      if (shape.type === "rectangle") {
        context.beginPath();
        context.fillStyle = "rgba(255, 0, 0, .3)";
        context.roundRect(
          posX,
          posY,
          shape.dimensions[0] * UNIT_MULTIPLIER,
          shape.dimensions[1] * UNIT_MULTIPLIER,
          15
        );
        context.fill();
        context.closePath();
      }

      if (shape.type === "circle") {
        context.beginPath();
        context.fillStyle = "rgba(0, 0, 255, .3)";
        context.arc(
          posX + idx * (2 + UNIT_MULTIPLIER),
          posY,
          35,
          0,
          2 * Math.PI,
          false
        );
        context.fill();
        context.closePath();
      }

      if (shape.type === "triangle") {
        const even = idx % 2 === 0;
        // Add a little bit of flair
        const dimension = even ? shape.dimensions[0] : -shape.dimensions[0];
        context.beginPath();
        context.moveTo(posX, posY);
        context.lineTo(posX, posY + dimension * UNIT_MULTIPLIER);
        context.lineTo(posX + dimension * UNIT_MULTIPLIER, posY);
        context.lineTo(posX, posY);
        context.fillStyle = "rgba(0, 255, 0, .3)";
        context.fill();
        context.closePath();
      }

      snapshot(canvasRef.current?.toDataURL());
    });
  }, []);
  return <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />;
};

function App() {
  const [str, setStr] = useState<string>("Akkio");
  const [history, setHistory] = useState<HistoryHash>({});

  // Generate a hash from our user provided string
  const hash = generateHash(str, seed);
  // Split the string into chunks, so each chunk can be randomized into a shape
  const splitArr = splitHash(hash);

  // Generate the shapes that we want to draw on our canvas
  const shapesToBuild: Shape[] = [];
  splitArr.forEach((spl, idx) => {
    const shape = generateShapeFromHash(spl, 0, 1 + idx);
    shapesToBuild.push(shape);
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>
          <DebounceInput
            className="px-2"
            value={str}
            minLength={1}
            debounceTimeout={500}
            style={{ fontSize: "1.5em" }}
            onChange={(event) => {
              setStr(event.target.value);
            }}
          />
        </p>
        <Canvas
          shapes={shapesToBuild}
          key={str}
          snapshot={(canvasImage) => {
            const capture: HistoryHash = {};
            capture[str] = canvasImage;
            setHistory({ ...history, ...capture });
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row-reverse",
            gap: "20px",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {Object.keys(history).map((h) => (
            <div
              style={{
                fontSize: ".7em",
                width: "100px",
                height: "150px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={h}
            >
              <p>{h}</p>
              <img src={history[h]} style={{ width: "75px", height: "75px" }} />
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;

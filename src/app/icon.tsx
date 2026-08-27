import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#8e2f2b",
          color: "#fbf8f1",
          fontFamily: "serif",
          fontSize: 38,
          fontStyle: "italic",
        }}
      >
        A
      </div>
    ),
    size,
  );
}

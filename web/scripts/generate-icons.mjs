// Generates the PNG app icons (solid indigo background + white check) without
// any image dependency — a minimal PNG encoder via Node's zlib.
// Run: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const BG = [0x63, 0x66, 0xf1]; // #6366F1
const FG = [0xff, 0xff, 0xff];

// Distance from point p to segment ab.
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function buildRgba(size, inset) {
  // Check polyline in normalized [0,1] space, scaled toward center by `inset`.
  const pts = [
    [0.3, 0.52],
    [0.435, 0.66],
    [0.72, 0.35],
  ].map(([x, y]) => [
    (x - 0.5) * inset + 0.5,
    (y - 0.5) * inset + 0.5,
  ]);
  const stroke = 0.09 * size;

  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = Math.min(
        distToSegment(x, y, pts[0][0] * size, pts[0][1] * size, pts[1][0] * size, pts[1][1] * size),
        distToSegment(x, y, pts[1][0] * size, pts[1][1] * size, pts[2][0] * size, pts[2][1] * size)
      );
      const color = d <= stroke / 2 ? FG : BG;
      const i = (y * size + x) * 4;
      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
      data[i + 3] = 0xff;
    }
  }
  return data;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  // Add a filter byte (0) at the start of each scanline.
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const targets = [
  { name: "icon-192.png", size: 192, inset: 1 },
  { name: "icon-512.png", size: 512, inset: 1 },
  { name: "icon-maskable-512.png", size: 512, inset: 0.66 }, // safe-zone padding
];

for (const t of targets) {
  const png = encodePng(t.size, buildRgba(t.size, t.inset));
  writeFileSync(join(outDir, t.name), png);
  console.log("wrote", t.name);
}

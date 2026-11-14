import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUser, hasAccess } from "@/lib/auth";
import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

// Tiny ZIP writer (stored, no compression, CRC-32).
function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function zipDateTime(d) {
  const date =
    ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  return { date, time };
}

function buildZip(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const { date, time } = zipDateTime(new Date());
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, data);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0x0800, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(time, 12);
    cd.writeUInt16LE(date, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(data.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    central.push(cd, nameBuf);
    offset += 30 + nameBuf.length + data.length;
  }
  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...chunks, cdBuf, eocd]);
}

export async function GET(_req, ctx) {
  const { slug } = await ctx.params;
  const game = getGame(slug);
  if (!game) return Response.json({ error: "Game not found." }, { status: 404 });

  const user = await getUser();
  if (!user) return Response.json({ error: "Log in to download." }, { status: 401 });
  if (game.priceCents !== 0 && !(await hasAccess(user, slug)))
    return Response.json({ error: "Buy this game to download it." }, { status: 403 });

  const folder = game.downloadName.replace(/\.html?$/i, "");
  const html = await readFile(path.join(process.cwd(), "private", game.file));
  const icon = await readFile(path.join(process.cwd(), "public", "icons", slug + ".ico"));

  const batLines = [
    "@echo off",
    "setlocal",
    "set CHROME=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe",
    "if not exist \"%CHROME%\" set CHROME=%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe",
    "if exist \"%CHROME%\" (",
    "  start \"\" \"%CHROME%\" --start-fullscreen \"--app=%~dp0" + game.file + "\"",
    ") else (",
    "  start \"\" \"%~dp0" + game.file + "\"",
    ")",
    "",
  ];

  const entries = [
    { name: folder + "/", data: Buffer.alloc(0) },
    { name: folder + "/" + game.file, data: html },
    { name: folder + "/icon.ico", data: icon },
    {
      name: folder + "/desktop.ini",
      data: Buffer.from(
        "[.ShellClassInfo]\r\nIconResource=icon.ico,0\r\n",
        "latin1"
      ),
    },
    {
      name: folder + "/Play.bat",
      data: Buffer.from(batLines.join("\r\n"), "latin1"),
    },
  ];

  const zip = buildZip(entries);
  return new Response(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="' + folder + '.zip"',
      "Cache-Control": "no-store",
    },
  });
}

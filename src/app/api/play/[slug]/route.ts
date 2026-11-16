import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUser, hasAccess } from "@/lib/auth";
import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

const NINJA_TOUCH_CONTROLS = String.raw`
<script>
(() => {
  const isTouch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  if (!isTouch) return;
  const style = document.createElement("style");
  style.textContent = [
    "#jstick-ninja-touch{position:fixed;inset:auto 0 max(12px,env(safe-area-inset-bottom)) 0;z-index:2147483001;display:flex;align-items:end;justify-content:space-between;padding:0 14px;gap:10px;pointer-events:none;user-select:none;-webkit-user-select:none;font:800 10px/1 system-ui,sans-serif}",
    "#jstick-ninja-touch .cluster{display:flex;align-items:end;gap:8px;pointer-events:auto}",
    "#jstick-ninja-touch button{min-width:54px;min-height:54px;border:1px solid rgba(255,255,255,.5);border-radius:18px;color:#fff;background:rgba(8,12,32,.72);box-shadow:0 5px 18px #0008,inset 0 0 18px #ffffff0d;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);touch-action:none;-webkit-tap-highlight-color:transparent;font:900 10px/1 system-ui,sans-serif;letter-spacing:.06em}",
    "#jstick-ninja-touch button:active,#jstick-ninja-touch button.down{background:rgba(30,120,255,.78);border-color:#a8e7ff;transform:scale(.94)}",
    "#jstick-ninja-touch .move button{min-width:58px;min-height:58px;font-size:20px}",
    "#jstick-ninja-touch .jump{min-width:68px;min-height:68px;border-radius:50%;background:rgba(20,105,210,.82)}",
    "#jstick-ninja-touch .small{min-width:52px;min-height:48px}",
    "@media(orientation:landscape){#jstick-ninja-touch{padding-inline:18px}#jstick-ninja-touch button{min-height:48px;min-width:50px}#jstick-ninja-touch .move button{min-height:52px;min-width:54px}#jstick-ninja-touch .jump{min-height:60px;min-width:60px}}"
  ].join("");
  document.head.appendChild(style);
  const dock = document.createElement("div");
  dock.id = "jstick-ninja-touch";
  dock.innerHTML =
    '<div class="cluster move"><button type="button" data-key="KeyA" aria-label="Move left">◀</button><button type="button" data-key="KeyD" aria-label="Move right">▶</button></div>' +
    '<div class="cluster"><button type="button" class="small" data-key="KeyQ">DASH</button><button type="button" class="small" data-key="KeyR">SPECIAL</button><button type="button" class="jump" data-key="Space">JUMP</button></div>';
  document.body.appendChild(dock);
  const keyEvent = (type, code) => {
    const key = code === "Space" ? " " : code.replace("Key", "").toLowerCase();
    window.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true }));
  };
  dock.querySelectorAll("button[data-key]").forEach((button) => {
    const code = button.dataset.key;
    const release = () => { button.classList.remove("down"); keyEvent("keyup", code); };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault(); button.classList.add("down");
      button.setPointerCapture?.(event.pointerId); keyEvent("keydown", code);
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  });
})();
</script>`;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const game = getGame(slug);
  if (!game) return Response.json({ error: "Game not found." }, { status: 404 });

  if (game.priceCents > 0) {
    const user = await getUser();
    if (!user) return Response.json({ error: "Log in to play." }, { status: 401 });
    if (!(await hasAccess(user, slug))) {
      return Response.json({ error: "Purchase required." }, { status: 403 });
    }
  }

  const file = path.join(process.cwd(), "private", game.file);
  const source = await readFile(file, "utf8");
  const html =
    slug === "neon-stickman-ninja"
      ? source.replace("</body>", `${NINJA_TOUCH_CONTROLS}</body>`)
      : source;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": "inline",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "frame-ancestors 'self'",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

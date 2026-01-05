import { PALETTE } from "../constants";
import {
  isProjectModalVisibleAtom,
  chosenProjectDataAtom,
  store,
} from "../store";
import { opacityTrickleDown } from "../utils";

export default function makeProjectCard(k, parent, posVec2, data, thumbnail) {
  const card = parent.add([
    k.anchor("center"),
    k.pos(posVec2),
    k.opacity(0),
    k.offscreen({ hide: true, distance: 300 }),
  ]);

  const W = 640;
  const H = 360;

  const cardMask = card.add([
    k.rect(W, H, { radius: 10 }),
    k.anchor("center"),
    k.mask("intersect"),
    k.opacity(0),
  ]);

  const image = cardMask.add([
    k.sprite(thumbnail),
    k.anchor("center"),
    k.opacity(0),
  ]);

  // cover: 等比缩放填满框，超出部分由 mask 裁切
  const s = Math.max(W / image.width, H / image.height);
  image.scale = k.vec2(s);

  // 可选：每个项目单独微调裁切位置
  const fx = data.thumbFocus?.x ?? 0;
  const fy = data.thumbFocus?.y ?? 0;
  image.pos = k.vec2(fx, fy);

  const cardTitle = card.add([
    k.text(data.title, {
      font: "ibm-bold",
      size: 32,
      width: 600,
      lineSpacing: 12,
    }),
    k.color(k.Color.fromHex(PALETTE.color3)),
    k.pos(-310, 200),
    k.opacity(0),
  ]);

  const cardSwitch = card.add([
    k.circle(30),
    k.area(),
    k.color(k.Color.fromHex(PALETTE.color3)),
    k.pos(400, 0),
    k.opacity(0),
  ]);

  cardSwitch.onCollide("player", () => {
    store.set(isProjectModalVisibleAtom, true);
    store.set(chosenProjectDataAtom, data);
  });

  opacityTrickleDown(parent, [cardMask, image, cardTitle, cardSwitch]);

  return card;
}

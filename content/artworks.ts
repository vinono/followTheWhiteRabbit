export type RabbitEdge = "top" | "bottom" | "left" | "right";

export type Artwork = {
  file: string;
  alt: string;
  label: string;
  title?: string;
  year?: string;
  location?: string;
  allowedEdges?: RabbitEdge[];
};

/** Change this object and the source array below to make a new exhibition. */
export const exhibition = {
  title: "Find the White Rabbit",
  eyebrow: "Exhibition note",
  collectionLabel: "In transit",
  description: "A quiet exhibition of encounters in transit.",
  about: [
    "地铁经过城市，也经过许多没有被说出口的时刻。人们低头、等待、靠近陌生人，又在下一站离开。",
    "屏幕发亮，车门打开又关闭；有人独自醒着，有人把头靠在另一个人肩上。这些照片没有终点。",
    "请停下来。等待那只白兔出现。",
  ],
  endMessage: "The rabbit has gone deeper. Will you start again?",
};

// Files stay in the ignored /media directory. Set NEXT_PUBLIC_MEDIA_BASE_URL in
// production to serve exactly the same keys from object storage/CDN.
const mediaUrl = (file: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/${file}` : `/api/artwork/${file}`;
};

// Keep only object keys here. The original files remain outside Git.
const source: Omit<Artwork, "label">[] = [
  { file: "17941740331294347.jpg", alt: "一名乘客从地铁通道向前走去", title: "Approach / 靠近", allowedEdges: ["bottom", "right"] },
  { file: "17956356046161242.jpg", alt: "一名女子站在地铁车门旁看手机", allowedEdges: ["left", "bottom", "right"] },
  { file: "17958200719158700.jpg", alt: "车厢中的女子低头看着手机", allowedEdges: ["top", "right", "bottom"] },
  { file: "17980396618076789.jpg", alt: "拥挤车厢中，一名女子低头看手机", allowedEdges: ["left", "top", "bottom"] },
  { file: "17940310438200636.jpg", alt: "一名戴眼镜的乘客在地铁中看手机", allowedEdges: ["right", "bottom"] },
  { file: "17979063664108938.jpg", alt: "隔着其他乘客看向车厢一侧的女子", allowedEdges: ["left", "right"] },
  { file: "17896087102320087.jpg", alt: "地铁门口等候的乘客和脚步", allowedEdges: ["top", "right"] },
  { file: "17892799627283956.jpg", alt: "一名乘客靠着车厢座椅使用手机", allowedEdges: ["left", "bottom"] },
  { file: "17916287581237768.jpg", alt: "地铁里戴耳机的女子侧脸", allowedEdges: ["top", "left", "right"] },
  { file: "18005019427046922.jpg", alt: "一名低头乘客的局部近景", allowedEdges: ["right", "bottom"] },
  { file: "201807/17886990100240451.jpg", alt: "一名女子站在车门边低头", allowedEdges: ["left", "top"] },
  { file: "201807/17966449912043585.jpg", alt: "一名乘客举手抓住地铁扶手", allowedEdges: ["right", "bottom"] },
  { file: "201807/17882414959241973.jpg", alt: "拥挤车厢中一名乘客的白色上衣", allowedEdges: ["top", "left"] },
  { file: "17977682125051553.jpg", alt: "两名乘客在车厢里相对而立", allowedEdges: [] }, // Last artwork, no rabbit
];

export const artworks: Artwork[] = source.map((artwork, index) => ({
  ...artwork,
  label: String(index + 1).padStart(2, "0"),
}));

export const getArtworkUrl = (artwork: Artwork) => mediaUrl(artwork.file);

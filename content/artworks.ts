export type RabbitEdge = "top" | "bottom" | "left" | "right";

export type Artwork = {
  file: string;
  alt: string;
  label: string;
  title: string;
  width: number;
  height: number;
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
  { file: "201807/17940891781080539.jpg", alt: "一名女子站在地铁车门旁，望向玻璃中的倒影", title: "Threshold / 临界", width: 1080, height: 1080, allowedEdges: ["bottom", "right"] },
  { file: "17956356046161242.jpg", alt: "一名短发女子站在地铁车门旁低头看手机", title: "Blue Light / 蓝光", width: 1080, height: 1080, allowedEdges: ["left", "bottom", "right"] },
  { file: "17958200719158700.jpg", alt: "拥挤的地铁车厢里，一名女子倚墙低头看手机", title: "Carried Away / 被带走", width: 1080, height: 1080, allowedEdges: ["top", "right", "bottom"] },
  { file: "17980396618076789.jpg", alt: "拥挤的地铁车厢里，多名乘客各自低头看手机", title: "Same Direction / 同向", width: 1080, height: 1077, allowedEdges: ["left", "top", "bottom"] },
  { file: "17940310438200636.jpg", alt: "两名戴耳机的乘客在地铁里各自看手机", title: "Private Channel / 私人频道", width: 1080, height: 1080, allowedEdges: ["right", "bottom"] },
  { file: "17979063664108938.jpg", alt: "地铁扶杆之间，一名女子侧身望向车厢另一端", title: "Between Bodies / 人群之间", width: 1080, height: 1080, allowedEdges: ["left", "right"] },
  { file: "17896087102320087.jpg", alt: "地铁车门开启时，几名乘客的脚停在门槛内侧", title: "Next Stop / 下一站", width: 1440, height: 1440, allowedEdges: ["top", "right"] },
  { file: "17892799627283956.jpg", alt: "一名戴耳机的女子倚靠车厢，闭眼握着手机", title: "Drift / 漂流", width: 1080, height: 1080, allowedEdges: ["left", "bottom"] },
  { file: "17916287581237768.jpg", alt: "一名戴眼镜和耳机的女子坐在地铁里低头阅读", title: "Private Frequency / 私人频率", width: 1080, height: 1080, allowedEdges: ["top", "left", "right"] },
  { file: "18005019427046922.jpg", alt: "一名低头女子的长发遮住侧脸", title: "Veil / 帘幕", width: 1080, height: 1080, allowedEdges: ["right", "bottom"] },
  { file: "201807/17886990100240451.jpg", alt: "一名戴耳机的长发女子在地铁里低头站立", title: "Inward / 向内", width: 1080, height: 1080, allowedEdges: ["left", "top"] },
  { file: "201807/17966449912043585.jpg", alt: "拥挤的地铁里，一名女子举手握住扶手", title: "Hold / 握住", width: 1080, height: 1080, allowedEdges: ["right", "bottom"] },
  { file: "201807/17882414959241973.jpg", alt: "地铁乘客之间，一只印有文字的白色布袋占据画面中央", title: "Passing Words / 掠过的字", width: 1080, height: 1080, allowedEdges: ["top", "left"] },
  { file: "17977682125051553.jpg", alt: "拥挤的车厢里，两名女子隔着人群相向站立", title: "Almost Meeting / 几乎相遇", width: 1080, height: 1080, allowedEdges: [] }, // Last artwork, no rabbit
];

export const artworks: Artwork[] = source.map((artwork, index) => ({
  ...artwork,
  label: String(index + 1).padStart(2, "0"),
}));

export const getArtworkUrl = (artwork: Artwork) => mediaUrl(artwork.file);

/**
 * 图片素材清册。
 *
 * 所有界面用图集中在此，页面只从这里取路径 —— 换图 / 补图只改这一处，不动页面代码。
 * 文件放在 `client/public/assets/<分组>/`，浏览器按绝对路径 `/assets/...` 取用。
 * 含中文的文件名必须 `encodeURI()` 之后再交给浏览器。
 */

export type Photo = {
  /** 绝对 URL，可直接用于 <img src> 或 background-image */
  readonly src: string;
  /** 无障碍描述；装饰性使用时可忽略 */
  readonly alt: string;
  /**
   * 画面主体位置，用于 object-position / background-position。
   * 需要避开水印时也靠它。
   */
  readonly focus: string;
  /** 带第三方水印。禁止用于大图/首屏，卡片裁切须把水印切掉。 */
  readonly watermark?: true;
};

const WEST_LAKE = "/assets/west_lake";
const WEST_LAKE_SUPP = "/assets/westlake_supp_imgs";
const PALACE = "/assets/palace_museum";
const PINGYAO = "/assets/pingyao_ancient_city";
const EXHIBITION = "/assets/Exhibition";
/** 尚未归组的单图直接放在 assets 根目录，补齐分组后再迁移 */
const ROOT = "/assets";

/** 西湖实景 · 竖图（1080×1440，可用于全屏/大图） */
export const westLakePortraits = {
  /** 三潭印月 我心相印亭，月洞门框住落日湖山 */
  heartMirrorGate: {
    src: `${WEST_LAKE}/eefaf2794081f3ac82d6b58b3059865a_compress.jpg`,
    alt: "我心相印亭的圆形门洞框住西湖落日与远山",
    focus: "50% 42%",
  },
  /** 雷峰塔，晴日隔湖远望，前景石拱桥与摇橹船 */
  leifengPagodaDay: {
    src: `${WEST_LAKE}/0e3c6db1fe5a2de1bb1d48c2a5e28699_compress.jpg`,
    alt: "晴日西湖，石拱桥与摇橹船之后是山林中的雷峰塔",
    focus: "50% 40%",
  },
  /** 雷峰夕照，秋林与暖灯 —— 全套里最标志性的一张 */
  leifengSunset: {
    src: `${WEST_LAKE}/ec684778c10e9c6dcec5c248d738d611_compress.jpg`,
    alt: "夕照中的雷峰塔亮起暖灯，秋林之下一叶游船横过湖面",
    focus: "50% 34%",
  },
  /** 三潭印月的石塔，暮色雾紫 */
  threePools: {
    src: `${WEST_LAKE}/90dfef6d66df656c9b842b5ae4a88ac6_compress.jpg`,
    alt: "暮色中湖面上的两座三潭印月石塔，远山如剪影",
    focus: "50% 52%",
  },
  /** 集贤亭，暮色与荷叶 */
  jixianPavilionDusk: {
    src: `${WEST_LAKE}/e4b3db958e0ed623996899d4d7a52249_compress.jpg`,
    alt: "暮色里的集贤亭亮起灯火，前景是大片荷叶",
    focus: "50% 36%",
  },
  /** 集贤亭，落日剪影（948×1264） */
  jixianPavilionSunset: {
    src: `${WEST_LAKE}/f5343457c99139dc1e5ea90be17cdd36_compress.jpg`,
    alt: "落日正落在集贤亭顶，湖面与残荷一片金色剪影",
    focus: "50% 40%",
  },
  /** 集贤亭与荷塘，火烧云。饱和度极高，仅作点睛，不宜大面积 */
  lotusAfterglow: {
    src: `${WEST_LAKE}/027c6e211513a9b85898bada34202b92_compress.jpg`,
    alt: "火烧云下的湖心亭，前景是望不到边的荷叶与荷花",
    focus: "50% 30%",
  },
  /** 山林中的院落群，航拍。近乎单色的墨绿，适合做深色底 */
  mountainCourtyard: {
    src: `${WEST_LAKE}/bcf6e16cbbb081d2a7719468df8559ea_compress.jpg`,
    alt: "航拍山林中的青瓦院落群，四周被竹林与古树环抱",
    focus: "50% 50%",
  },
  /** 荷塘与山顶保俶塔。右下角有小红书水印 */
  lotusPagodaHill: {
    src: `${WEST_LAKE}/c9384283c5449a3654d3c6fc9eaffc74_compress.jpg`,
    alt: "粉霞下的荷塘，远处山顶立着一座细长古塔",
    focus: "50% 30%",
    watermark: true,
  },
  /** 摇橹船穿过林间水道。右下角有小水印 */
  boatCorridor: {
    src: `${WEST_LAKE}/f38de54da598dd34da3feb39593e1c20_compress.jpg`,
    alt: "从摇橹船的篷下望出去，前方另一条船正驶过林间水道",
    focus: "50% 34%",
    watermark: true,
  },
  /**
   * 花港观鱼的金鱼，与林间雾气叠成的创意合成图（金鱼像浮在树林里）。
   * 不是实景，别当景点照片用；右下角有水印。留在册里备做「灵境」类氛围图。
   */
  goldfishGrove: {
    src: `${WEST_LAKE}/c05ace7a3f127c15ea91cfcc7e551a01_compress.jpg`,
    alt: "金鱼与林间雾气叠合的画面，红色游鱼像浮在树林之间",
    focus: "50% 46%",
    watermark: true,
  },
} as const satisfies Record<string, Photo>;

/** 西湖实景 · 横图（512×384，仅够卡片，不要拉满全屏） */
export const westLakeLandscapes = {
  /** 雪后的湖上桥亭，冷灰蓝调 —— 现有素材里最接近「断桥残雪」的氛围 */
  snowBridge: {
    src: encodeURI(`${WEST_LAKE_SUPP}/西湖雪景.jpg`),
    alt: "大雪后的西湖，桥上亭子与两岸树木都覆着白雪，湖面平静",
    focus: "50% 50%",
  },
  /** 乌龟潭，安静的水道与茅顶水榭 */
  turtlePond: {
    src: encodeURI(`${WEST_LAKE_SUPP}/乌龟潭.jpg`),
    alt: "乌龟潭安静的水面，右岸一座茅顶水榭，远处是青翠山峦",
    focus: "60% 50%",
  },
  /**
   * 荷花池。摄图网水印压在正中央，无法裁掉。
   * 保留在册以备将来换成无水印版本，当前不要使用。
   */
  lotusPond: {
    src: encodeURI(`${WEST_LAKE_SUPP}/荷花池.png`),
    alt: "荷花池",
    focus: "50% 50%",
    watermark: true,
  },
} as const satisfies Record<string, Photo>;

/**
 * 首页「今日云游」轮播里除西湖之外的两处目的地。
 * 与西湖不同组，是因为它们不属于西湖景区，将来各自成组时从这里迁走。
 */
export const featuredVenues = {
  /** 松阳时思寺，航拍古刹。近乎单色的墨绿，竖图 1080×1440 */
  shishiTemple: {
    src: encodeURI(`${ROOT}/时思寺.jpg`),
    alt: "航拍深山中的时思寺，黑瓦屋顶与飞檐院落被竹林和古树环抱",
    focus: "52% 46%",
  },
  /**
   * 艺术展览馆内景，当期展览「第贰樂章 · 舞曲」。
   * 横图约 972×730，右下角有淡色水印，卡片里落在明亮地面上不明显；
   * 若要用于大图/首屏，先换成裁掉水印的版本。
   */
  artGallery: {
    src: encodeURI(`${ROOT}/展览馆.jpg`),
    alt: "明亮的白墙展厅里挂着数幅画作，右侧墙上是一幅圆形彩色作品",
    focus: "58% 44%",
    watermark: true,
  },
} as const satisfies Record<string, Photo>;

/**
 * 艺术展览馆内景，供展馆详情页的封面与「云游秘境」使用。
 * 文件名是上传时的哈希，含义写在各自的 alt 里；三张都是横图。
 */
export const exhibitionPhotos = {
  /** 挑高中庭：清水混凝土 + 暖木，异形天窗与旋转楼梯。最有气势，用作封面。约 1680×920 */
  atriumStair: {
    src: `${EXHIBITION}/8421febf-f2b5-4cde-8e44-233ec218a379.png`,
    alt: "挑高的美术馆中庭，异形天窗洒下天光，弧形旋转楼梯旁挂着大幅抽象画",
    focus: "50% 42%",
  },
  /** 天光长廊：格栅玻璃顶下的木饰面回廊，彩色画作沿墙排开，前方有一道绿植台。约 1080×545 */
  skylightHall: {
    src: `${EXHIBITION}/e50df8bc7684d99fd02f7d461644a23e_compress.jpg`,
    alt: "玻璃天窗下的木色展厅长廊，白色展台上依次排开数幅彩色抽象画，画前是一道绿植",
    focus: "50% 52%",
  },
  /** 小画布展区：白墙轨道灯 + 装框小画，墙面图形字「小小之布 · 小画」。约 1068×800 */
  smallCanvas: {
    src: `${EXHIBITION}/f69eb116e7641fc0f2b408b6d5644dce_compress.jpg`,
    alt: "白墙展厅里成排装框的彩色小幅作品，墙面印着「小小之布 · 小画」字样",
    focus: "46% 46%",
  },
} as const satisfies Record<string, Photo>;

/** 故宫博物院（512×384） */
export const palaceMuseumPhotos = {
  /** 紫禁城夜航拍，蓝调天色与满城暖灯 */
  nightAerial: {
    src: `${PALACE}/1.jpg`,
    alt: "夜色中的紫禁城航拍，中轴线上的宫殿群亮起金色灯火",
    focus: "50% 55%",
  },
  /** 阙门夜景，朱红宫墙 */
  gateNight: {
    src: `${PALACE}/2.jpg`,
    alt: "夜晚的宫门，朱红高墙与檐下灯光对称展开",
    focus: "50% 46%",
  },
  /** 角楼与护城河倒影，蓝调时刻 */
  cornerTower: {
    src: `${PALACE}/3.jpg`,
    alt: "蓝调天色下的紫禁城角楼，完整倒映在护城河里",
    focus: "50% 42%",
  },
} as const satisfies Record<string, Photo>;

/** 平遥古城（512×384） */
export const pingyaoPhotos = {
  /** 城墙与城楼，赭石砖色 */
  cityWall: {
    src: `${PINGYAO}/1.jpg`,
    alt: "平遥古城的夯土砖墙拐角，墙上立着一座彩绘城楼",
    focus: "40% 55%",
  },
  /** 明清街，两侧红灯笼与商铺 */
  mingQingStreet: {
    src: `${PINGYAO}/2.jpg`,
    alt: "平遥明清街的青石路面，两侧店铺挂满红灯笼，尽头是市楼",
    focus: "50% 50%",
  },
  /** 灯笼特写。画面中偏右有视觉中国水印 */
  lanterns: {
    src: `${PINGYAO}/3.jpg`,
    alt: "古城屋檐下成排的红灯笼",
    focus: "18% 50%",
    watermark: true,
  },
} as const satisfies Record<string, Photo>;

/**
 * 景区封面（1536×1024，AI 生成）。
 * 目前唯一的高分辨率横图，因此保留给需要满幅铺开的封面位。
 */
export const westLakeHero: Photo = {
  src: "/assets/west-lake-hero.png",
  alt: "西湖全景，湖面、长堤与远处群山层层铺开",
  focus: "50% 42%",
};

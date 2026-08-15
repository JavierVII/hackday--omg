/**
 * 中式日课：节气、十二时辰、物候、日落时刻。
 *
 * 全部按本机时间就地推算，不依赖后端与网络 —— 首页「湖山此刻」只用它做氛围展示。
 * 节气用固定日期近似表（±1 天），日落用杭州逐月近似值（±10 分钟），
 * **不是可信的天文数据**，不要拿去做任何业务判断。
 */

import { westLakeLandscapes, westLakePortraits, type Photo } from "./assets";

/** 一天里的六个时段，决定「此刻最宜」推荐哪一处 */
type DayPartKey = "night" | "dawn" | "noon" | "afternoon" | "dusk" | "evening";

interface DayPart {
  /** 时段名，两字，用作朱红落款印 */
  readonly label: string;
  /** 推荐去处，名字须与 assets 里该张照片的 alt 描述一致，不要另编地名 */
  readonly spot: string;
  /** 一句景象白描 */
  readonly line: string;
  readonly photo: Photo;
}

const DAY_PARTS: Record<DayPartKey, DayPart> = {
  dawn: {
    label: "晨光",
    spot: "乌龟潭",
    line: "一潭静水，山色初醒",
    photo: westLakeLandscapes.turtlePond,
  },
  noon: {
    label: "日中",
    spot: "雷峰塔",
    line: "隔湖望塔，桥下橹声",
    photo: westLakePortraits.leifengPagodaDay,
  },
  afternoon: {
    label: "日昃",
    spot: "我心相印亭",
    line: "一窗圆门，框住湖山",
    photo: westLakePortraits.heartMirrorGate,
  },
  dusk: {
    label: "夕照",
    spot: "集贤亭",
    line: "日头正落在亭顶",
    photo: westLakePortraits.jixianPavilionSunset,
  },
  evening: {
    label: "初夜",
    spot: "三潭印月",
    line: "湖心石塔，远山如剪",
    photo: westLakePortraits.threePools,
  },
  night: {
    label: "夜阑",
    spot: "山间院落",
    line: "竹林深处，灯火将熄",
    photo: westLakePortraits.mountainCourtyard,
  },
};

/** 十二时辰，子时起。索引 = ((hour + 1) % 24) / 2 向下取整 */
const SHICHEN: readonly { readonly name: string; readonly note: string; readonly part: DayPartKey }[] = [
  { name: "子时", note: "湖静无人，山影沉墨", part: "night" },
  { name: "丑时", note: "万籁俱寂，灯火将熄", part: "night" },
  { name: "寅时", note: "天光未启，露气最重", part: "night" },
  { name: "卯时", note: "日出东南，湖面初醒", part: "dawn" },
  { name: "辰时", note: "晨雾未散，山色初开", part: "dawn" },
  { name: "巳时", note: "云开日朗，长堤正好", part: "noon" },
  { name: "午时", note: "日在中天，波光最盛", part: "noon" },
  { name: "未时", note: "斜光过堤，湖面微澜", part: "afternoon" },
  { name: "申时", note: "光转成金，山色空蒙", part: "afternoon" },
  { name: "酉时", note: "日入雷峰，满湖余晖", part: "dusk" },
  { name: "戌时", note: "华灯初上，湖上生月", part: "evening" },
  { name: "亥时", note: "夜风渐凉，塔影摇金", part: "evening" },
];

/** 二十四节气近似起始日（公历，逐年浮动 ±1 天） */
const SOLAR_TERMS: readonly { readonly month: number; readonly day: number; readonly name: string }[] = [
  { month: 1, day: 6, name: "小寒" },
  { month: 1, day: 20, name: "大寒" },
  { month: 2, day: 4, name: "立春" },
  { month: 2, day: 19, name: "雨水" },
  { month: 3, day: 6, name: "惊蛰" },
  { month: 3, day: 21, name: "春分" },
  { month: 4, day: 5, name: "清明" },
  { month: 4, day: 20, name: "谷雨" },
  { month: 5, day: 6, name: "立夏" },
  { month: 5, day: 21, name: "小满" },
  { month: 6, day: 6, name: "芒种" },
  { month: 6, day: 21, name: "夏至" },
  { month: 7, day: 7, name: "小暑" },
  { month: 7, day: 23, name: "大暑" },
  { month: 8, day: 8, name: "立秋" },
  { month: 8, day: 23, name: "处暑" },
  { month: 9, day: 8, name: "白露" },
  { month: 9, day: 23, name: "秋分" },
  { month: 10, day: 8, name: "寒露" },
  { month: 10, day: 24, name: "霜降" },
  { month: 11, day: 8, name: "立冬" },
  { month: 11, day: 22, name: "小雪" },
  { month: 12, day: 7, name: "大雪" },
  { month: 12, day: 22, name: "冬至" },
];

/** 西湖逐月物候，1 月起 */
const PHENOLOGY = [
  "腊梅初绽",
  "早梅将残",
  "桃柳夹岸",
  "春茶新绿",
  "蔷薇满架",
  "荷叶初圆",
  "荷花正盛",
  "荷末桂初",
  "桂子飘香",
  "满陇桂雨",
  "银杏染金",
  "残雪候桥",
] as const;

/** 杭州逐月日落近似时刻（本地时间，1 月起），单位：分钟 */
const SUNSET_MINUTES = [
  17 * 60 + 15,
  17 * 60 + 45,
  18 * 60 + 10,
  18 * 60 + 35,
  18 * 60 + 55,
  19 * 60 + 5,
  19 * 60 + 5,
  18 * 60 + 45,
  18 * 60 + 10,
  17 * 60 + 35,
  17 * 60 + 5,
  16 * 60 + 55,
] as const;

export interface Almanac {
  /** "14:23" */
  readonly clock: string;
  /** 当月物候短语 */
  readonly phenology: string;
  /** 此刻推荐去处 */
  readonly pick: DayPart;
  /** 时辰名，如「未时」 */
  readonly shichen: string;
  /** 时辰景象白描 */
  readonly shichenNote: string;
  /** 节气名，如「立秋」 */
  readonly solarTerm: string;
  /** 日落一句话：未落时带倒数，已落时换夜景说法 */
  readonly sunsetLine: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

function readSolarTerm(month: number, day: number): string {
  let current = SOLAR_TERMS[SOLAR_TERMS.length - 1];

  for (const term of SOLAR_TERMS) {
    if (term.month < month || (term.month === month && term.day <= day)) {
      current = term;
    }
  }

  return current.name;
}

function readSunsetLine(sunsetMinutes: number, nowMinutes: number): string {
  const sunset = `${pad(Math.floor(sunsetMinutes / 60))}:${pad(sunsetMinutes % 60)}`;

  if (nowMinutes >= sunsetMinutes) {
    return `日已落 ${sunset} · 湖上生灯`;
  }

  const left = sunsetMinutes - nowMinutes;
  const hours = Math.floor(left / 60);
  const minutes = left % 60;

  return hours > 0
    ? `日落 ${sunset} · 还有 ${hours} 时 ${minutes} 分`
    : `日落 ${sunset} · 还有 ${minutes} 分`;
}

/** 读取某一刻的日课。传入 Date，便于测试与复现。 */
export function readAlmanac(at: Date): Almanac {
  const hour = at.getHours();
  const minute = at.getMinutes();
  const monthIndex = at.getMonth();
  const shichen = SHICHEN[Math.floor(((hour + 1) % 24) / 2)];

  return {
    clock: `${pad(hour)}:${pad(minute)}`,
    phenology: PHENOLOGY[monthIndex],
    pick: DAY_PARTS[shichen.part],
    shichen: shichen.name,
    shichenNote: shichen.note,
    solarTerm: readSolarTerm(monthIndex + 1, at.getDate()),
    sunsetLine: readSunsetLine(SUNSET_MINUTES[monthIndex], hour * 60 + minute),
  };
}

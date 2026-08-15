export type BeadColorId = 'EMPTY' | 'P19' | 'F12' | 'A17' | 'B29' | 'R5' | 'B8' | 'B31'
export interface BeadTemplate { id: string; name: string; size: 20; grid: BeadColorId[][] }
export interface BeadReward { id: string; name: string; description: string; locationName: string; locationDescription: string; redeemInstructions: string[]; status: 'locked' | 'unlocked' | 'redeemed' }
export const BEAD_COLORS: Record<Exclude<BeadColorId, 'EMPTY'>, { hex: string; label: string }> = { P19:{hex:'#ed8cac',label:'浅粉'}, F12:{hex:'#ca4f76',label:'深粉'}, A17:{hex:'#f4be42',label:'浅黄'}, B29:{hex:'#91b955',label:'浅绿'}, R5:{hex:'#429957',label:'中绿'}, B8:{hex:'#237252',label:'深绿'}, B31:{hex:'#70bec5',label:'水蓝'} }
const E: BeadColorId = 'EMPTY'
const row = (...spots: Array<[number, BeadColorId]>): BeadColorId[] => { const cells = Array<BeadColorId>(20).fill(E); spots.forEach(([column, value]) => cells[column] = value); return cells }
export const LOTUS_TEMPLATE: BeadTemplate = { id:'lotus-petal', name:'荷花花瓣', size:20, grid:[
  row(),row(),row(),row([9,'P19']),row([8,'P19'],[9,'F12'],[10,'P19']),row([7,'P19'],[8,'F12'],[9,'F12'],[10,'F12'],[11,'P19']),
  row([6,'P19'],[7,'P19'],[8,'F12'],[9,'F12'],[10,'F12'],[11,'P19'],[12,'P19']),row([6,'P19'],[7,'F12'],[8,'P19'],[9,'P19'],[10,'P19'],[11,'F12'],[12,'P19']),
  row([5,'P19'],[6,'P19'],[7,'P19'],[8,'P19'],[9,'A17'],[10,'P19'],[11,'P19'],[12,'P19'],[13,'P19']),row([5,'P19'],[6,'F12'],[7,'P19'],[8,'P19'],[9,'A17'],[10,'P19'],[11,'P19'],[12,'F12'],[13,'P19']),
  row([6,'P19'],[7,'P19'],[8,'P19'],[9,'P19'],[10,'P19'],[11,'P19'],[12,'P19']),row([7,'P19'],[8,'P19'],[9,'P19'],[10,'P19'],[11,'P19']),row([8,'P19'],[9,'P19'],[10,'P19']),row([9,'B29']),row([9,'B29']),row(),row(),row(),row(),row()
] }
export const LOTUS_REWARD: BeadReward = { id:'west-lake-lotus-petal-physical', name:'西湖限定 · 荷花实体拼豆纪念品', description:'完成线上「荷花花瓣」拼豆，可领取同款实体拼豆纪念品。', locationName:'曲院风荷游客服务点', locationDescription:'杭州市西湖区北山街 · 曲院风荷景区入口旁', redeemInstructions:['前往指定游客服务点','向工作人员展示本页面','领取同款实体拼豆纪念品'], status:'locked' }
export const PLAYABLE_TEMPLATES = [LOTUS_TEMPLATE]

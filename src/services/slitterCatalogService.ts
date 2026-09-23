import { Product } from '../types/pcp';
import { StorageService } from './storageService';

export interface SlitterCatalogItem {
  code: string;
  name: string;
  larguraFita: number;
  espessura: number;
}

export interface SlitterInfoResult {
  code: string;
  name: string;
  // false = não há ferramental cadastrado (Importador & Cadastros) nem catálogo
  // oficial para esta largura/espessura — o código retornado é apenas um rótulo
  // de alerta, não um código de ferramental real.
  cadastrado: boolean;
}

// Predefined Slitters extracted from official production engineering sheets
export const PERFIL_SLITTERS_CATALOG: { code: string; desc: string; blank: number }[] = [
  {
    "code": "SLT11000",
    "desc": "SLITTER 45 x 17 x 1,80MM",
    "blank": 71.0
  },
  {
    "code": "SLT11270",
    "desc": "SLITTER 45 x 17 x 2,65MM",
    "blank": 69.0
  },
  {
    "code": "SLT11005",
    "desc": "SLITTER 50 x 25 x 1,80MM",
    "blank": 91.0
  },
  {
    "code": "SLT11275",
    "desc": "SLITTER 50 x 25 x 2,65MM",
    "blank": 89.0
  },
  {
    "code": "SLT11010",
    "desc": "SLITTER 50 x 25 x 10 x 1,80MM",
    "blank": 102.0
  },
  {
    "code": "SLT11280",
    "desc": "SLITTER 50 x 25 x 10 x 2,65MM",
    "blank": 100.0
  },
  {
    "code": "SLT11015",
    "desc": "SLITTER 68 x 30 x 1,80MM",
    "blank": 119.0
  },
  {
    "code": "SLT11285",
    "desc": "SLITTER 68 x 30 x 2,65MM",
    "blank": 118.0
  },
  {
    "code": "SLT11020",
    "desc": "SLITTER 75 x 40 x 1,80MM",
    "blank": 146.0
  },
  {
    "code": "SLT11290",
    "desc": "SLITTER 75 x 40 x 2,65MM",
    "blank": 144.0
  },
  {
    "code": "SLT11025",
    "desc": "SLITTER 75 x 40 x 15 x 1,80MM",
    "blank": 165.0
  },
  {
    "code": "SLT11295",
    "desc": "SLITTER 75 x 40 x 15 x 2,65MM",
    "blank": 164.0
  },
  {
    "code": "SLT11030",
    "desc": "SLITTER 92 x 30 x 1,80MM",
    "blank": 144.0
  },
  {
    "code": "SLT11300",
    "desc": "SLITTER 92 x 30 x 2,65MM",
    "blank": 142.0
  },
  {
    "code": "SLT11035",
    "desc": "SLITTER 92 x 40 x 1,80MM",
    "blank": 164.0
  },
  {
    "code": "SLT11305",
    "desc": "SLITTER 92 x 40 x 2,65MM",
    "blank": 162.0
  },
  {
    "code": "SLT11040",
    "desc": "SLITTER 100 x 40 x 1,80MM",
    "blank": 173.0
  },
  {
    "code": "SLT11310",
    "desc": "SLITTER 100 x 40 x 2,65MM",
    "blank": 171.0
  },
  {
    "code": "SLT11045",
    "desc": "SLITTER 100 x 40 x 17 x 1,80MM",
    "blank": 195.0
  },
  {
    "code": "SLT11315",
    "desc": "SLITTER 100 x 40 x 17 x 2,65MM",
    "blank": 191.0
  },
  {
    "code": "SLT11050",
    "desc": "SLITTER 100 x 50 x 1,80MM",
    "blank": 191.0
  },
  {
    "code": "SLT11320",
    "desc": "SLITTER 100 x 50 x 2,65MM",
    "blank": 188.0
  },
  {
    "code": "SLT11055",
    "desc": "SLITTER 100 x 50 x 17 x 1,80MM",
    "blank": 215.0
  },
  {
    "code": "SLT11325",
    "desc": "SLITTER 100 x 50 x 17 x 2,65MM",
    "blank": 213.0
  },
  {
    "code": "SLT11330",
    "desc": "SLITTER 127 x 50 x 2,65MM",
    "blank": 216.0
  },
  {
    "code": "SLT11065",
    "desc": "SLITTER 127 x 50 x 17 x 1,80MM",
    "blank": 237.0
  },
  {
    "code": "SLT11335",
    "desc": "SLITTER 127 x 50 x 17 x 2,65MM",
    "blank": 236.0
  },
  {
    "code": "SLT11070",
    "desc": "SLITTER 150 x 50 x 1,80MM",
    "blank": 237.0
  },
  {
    "code": "SLT11340",
    "desc": "SLITTER 150 x 50 x 2,65MM",
    "blank": 236.0
  },
  {
    "code": "SLT11075",
    "desc": "SLITTER 150 x 60 x 20 x 1,80MM",
    "blank": 288.0
  },
  {
    "code": "SLT11344",
    "desc": "SLITTER 150 x 50 x 2,65MM",
    "blank": 266.0
  },
  {
    "code": "SLT11077",
    "desc": "SLITTER 150 x 50 x 20 x 1,80MM",
    "blank": 269.0
  },
  {
    "code": "SLT11345",
    "desc": "SLITTER 150 x 60 x 20 x 2,65MM",
    "blank": 286.0
  },
  {
    "code": "SLT11080",
    "desc": "SLITTER 200 x 50 x 1,80MM",
    "blank": 292.0
  },
  {
    "code": "SLT11350",
    "desc": "SLITTER 200 x 50 x 2,65MM",
    "blank": 288.0
  },
  {
    "code": "SLT11085",
    "desc": "SLITTER 200 x 60 x 20 x 1,80MM",
    "blank": 340.0
  },
  {
    "code": "SLT11355",
    "desc": "SLITTER 200 x 60 x 20 x 2,65MM",
    "blank": 339.0
  },
  {
    "code": "SLT11086",
    "desc": "SLITTER 200 x 75 x 20 X 1,80MM",
    "blank": 370.0
  },
  {
    "code": "SLT11356",
    "desc": "SLITTER 200 x 75 x 20 X 2,65MM",
    "blank": 366.0
  },
  {
    "code": "SLT11096",
    "desc": "SLITTER 50 x 25 x 1,95MM",
    "blank": 91.0
  },
  {
    "code": "SLT11360",
    "desc": "SLITTER 45 x 17 x 3,00MM",
    "blank": 67.0
  },
  {
    "code": "SLT11102",
    "desc": "SLITTER 50 x 25 x 10 x 1,95MM",
    "blank": 102.0
  },
  {
    "code": "SLT11365",
    "desc": "SLITTER 50 x 25 x 3,00MM",
    "blank": 89.0
  },
  {
    "code": "SLT11111",
    "desc": "SLIITTER 75 x 40 x 1,95MM",
    "blank": 145.0
  },
  {
    "code": "SLT11370",
    "desc": "SLITTER 50 x 25 x 10 x 3,00MM",
    "blank": 101.0
  },
  {
    "code": "SLT11112",
    "desc": "SLITTER 75 x 40 x 15 x 1,95MM",
    "blank": 165.0
  },
  {
    "code": "SLT11375",
    "desc": "SLITTER 68 x 30 x 3,00MM",
    "blank": 116.0
  },
  {
    "code": "SLT11132",
    "desc": "SLITTER 100 x 40 x 1,95MM",
    "blank": 173.0
  },
  {
    "code": "SLT11380",
    "desc": "SLITTER 75 x 40 x 3,00MM",
    "blank": 144.0
  },
  {
    "code": "SLT11152",
    "desc": "SLITTER 127 x 50 x 1,95MM",
    "blank": 217.0
  },
  {
    "code": "SLT11385",
    "desc": "SLITTER 75 x 40 x 15 x 3,00MM",
    "blank": 163.0
  },
  {
    "code": "SLT11137",
    "desc": "SLITTER 100 x 40 x 17 x 1,95MM",
    "blank": 195.0
  },
  {
    "code": "SLT11390",
    "desc": "SLITTER 92 x 30 x 3,00MM",
    "blank": 140.0
  },
  {
    "code": "SLT11147",
    "desc": "SLITTER 100 x 50 x 17 x 1,95MM",
    "blank": 215.0
  },
  {
    "code": "SLT11395",
    "desc": "SLITTER 92 x 40 x 3,00MM",
    "blank": 160.0
  },
  {
    "code": "SLT11157",
    "desc": "SLITTER 127 x 50 x 17 x 1,95MM",
    "blank": 237.0
  },
  {
    "code": "SLT11400",
    "desc": "SLITTER 100 x 40 x 3,00MM",
    "blank": 171.0
  },
  {
    "code": "SLT11167",
    "desc": "SLITTER 150 x 60 x 20 x 1,95MM",
    "blank": 288.0
  },
  {
    "code": "SLT11172",
    "desc": "SLITTER 200 x 50 x 1,95MM",
    "blank": 291.0
  },
  {
    "code": "SLT11410",
    "desc": "SLITTER 100 x 50 x 3,00MM",
    "blank": 188.0
  },
  {
    "code": "SLT11090",
    "desc": "SLITTER 45 x 17 x 2,00MM",
    "blank": 71.0
  },
  {
    "code": "SLT11415",
    "desc": "SLITTER 100 x 50 x 17 x 3,00MM",
    "blank": 210.0
  },
  {
    "code": "SLT11095",
    "desc": "SLITTER 50 x 25 x 2,00MM",
    "blank": 91.0
  },
  {
    "code": "SLT11420",
    "desc": "SLITTER 127 x 50 x 3,00MM",
    "blank": 216.0
  },
  {
    "code": "SLT11100",
    "desc": "SLITTER 50 x 25 x 10 x 2,00MM",
    "blank": 102.0
  },
  {
    "code": "SLT11425",
    "desc": "SLITTER 127 x 50 x 17 x 3,00MM",
    "blank": 236.0
  },
  {
    "code": "SLT11105",
    "desc": "SLITTER 68 x 30 x 2,00MM",
    "blank": 119.0
  },
  {
    "code": "SLT11430",
    "desc": "SLITTER 150 x 50 x 3,00MM",
    "blank": 236.0
  },
  {
    "code": "SLT11110",
    "desc": "SLITTER 75 x 40 x 2,00MM",
    "blank": 145.0
  },
  {
    "code": "SLT11435",
    "desc": "SLITTER 150 x 60 x 20 x 3,00MM",
    "blank": 284.0
  },
  {
    "code": "SLT11115",
    "desc": "SLITTER 75 x 40 x 15 x 2,00MM",
    "blank": 165.0
  },
  {
    "code": "SLT11437",
    "desc": "SLITTER 150 x 50 x 20 x 3,00MM",
    "blank": 266.0
  },
  {
    "code": "SLT11120",
    "desc": "SLITTER 92 x 30 x 2,00MM",
    "blank": 144.0
  },
  {
    "code": "SLT11440",
    "desc": "SLITTER 200 x 50 x 3,00MM",
    "blank": 288.0
  },
  {
    "code": "SLT11125",
    "desc": "SLITTER 92 x 40 x 2,00MM",
    "blank": 164.0
  },
  {
    "code": "SLT11445",
    "desc": "SLITTER 200 x 60 x 20 x 3,00MM",
    "blank": 335.0
  },
  {
    "code": "SLT11130",
    "desc": "SLITTER 100 x 40 x 2,00MM",
    "blank": 173.0
  },
  {
    "code": "SLT11447",
    "desc": "SLITTER 200 x 75 x 20 x 3,00MM",
    "blank": 366.0
  },
  {
    "code": "SLT11135",
    "desc": "SLITTER 100 x 40 x 17 x 2,00MM",
    "blank": 195.0
  },
  {
    "code": "SLT11450",
    "desc": "SLITTER 50 x 25 x 4,75MM",
    "blank": 81.0
  },
  {
    "code": "SLT11140",
    "desc": "SLITTER 100 x 50 x 2,00MM",
    "blank": 191.0
  },
  {
    "code": "SLT11452",
    "desc": "SLITTER 75 x 40 x 15 x 4,75MM",
    "blank": 146.0
  },
  {
    "code": "SLT11145",
    "desc": "SLITTER 100 x 50 x 17 x 2,00MM",
    "blank": 215.0
  },
  {
    "code": "SLT11455",
    "desc": "SLITTER 75 x 40 x 4,75MM",
    "blank": 136.0
  },
  {
    "code": "SLT11150",
    "desc": "SLITTER 127 x 50 x 2,00MM",
    "blank": 217.0
  },
  {
    "code": "SLT11460",
    "desc": "SLITTER 100 x 40 x 17 x 4,75MM",
    "blank": 174.0
  },
  {
    "code": "SLT11155",
    "desc": "SLITTER 127 x 50 x 17 x 2,00MM",
    "blank": 237.0
  },
  {
    "code": "SLT11462",
    "desc": "SLITTER 100 x 40 x 4,75MM",
    "blank": 162.0
  },
  {
    "code": "SLT11160",
    "desc": "SLITTER 150 x 50 x 2,00MM",
    "blank": 237.0
  },
  {
    "code": "SLT11465",
    "desc": "SLITTER 100 x 50 x 17 x 4,75MM",
    "blank": 201.0
  },
  {
    "code": "SLT11165",
    "desc": "SLITTER 150 x 60 x 20 x 2,00MM",
    "blank": 288.0
  },
  {
    "code": "SLT11470",
    "desc": "SLITTER 100 x 50 x 4,75MM",
    "blank": 181.0
  },
  {
    "code": "SLT11168",
    "desc": "SLITTER 150 x 50 x 20 x 2,00MM",
    "blank": 269.0
  },
  {
    "code": "SLT11475",
    "desc": "SLITTER 127 x 50 x 17 x 4,75MM",
    "blank": 225.0
  },
  {
    "code": "SLT11170",
    "desc": "SLITTER 200 x 50 x 2,00MM",
    "blank": 291.0
  },
  {
    "code": "SLT11480",
    "desc": "SLITTER 127 x 50 x 4,75MM",
    "blank": 209.0
  },
  {
    "code": "SLT11175",
    "desc": "SLITTER 200 x 60 x 20 x 2,00MM",
    "blank": 340.0
  },
  {
    "code": "SLT11490",
    "desc": "SLITTER 150 x 60 x 20 x 4,75MM",
    "blank": 272.0
  },
  {
    "code": "SLT11176",
    "desc": "SLITTER 200 x 75 x 20 X 2,00MM",
    "blank": 370.0
  },
  {
    "code": "SLT11495",
    "desc": "SLITTER 150 x 50 x 4,75MM",
    "blank": 232.0
  },
  {
    "code": "SLT11180",
    "desc": "SLITTER 45 x 17 x 2,25MM",
    "blank": 70.0
  },
  {
    "code": "SLT11500",
    "desc": "SLITTER 200 x 75 x 25 x 4,75MM",
    "blank": 356.0
  },
  {
    "code": "SLT11185",
    "desc": "SLITTER 50 x 25 x 2,25MM",
    "blank": 91.0
  },
  {
    "code": "SLT11505",
    "desc": "SLITTER 200 x 50 x 4,75MM",
    "blank": 282.0
  },
  {
    "code": "SLT11190",
    "desc": "SLITTER 50 x 25 x 10 x 2,25MM",
    "blank": 102.0
  },
  {
    "code": "SLT11510",
    "desc": "SLITTER 200 x 60 x 20 x 4,75MM",
    "blank": 322.0
  },
  {
    "code": "SLT11195",
    "desc": "SLITTER 68 x 30 x 2,25MM",
    "blank": 119.0
  },
  {
    "code": "SLT11200",
    "desc": "SLITTER 75 x 40 x 2,25MM",
    "blank": 145.0
  },
  {
    "code": "SLT11205",
    "desc": "SLITTER 75 x 40 x 15 x 2,25MM",
    "blank": 165.0
  },
  {
    "code": "SLT11210",
    "desc": "SLITTER 92 x 30 x 2,25MM",
    "blank": 143.0
  },
  {
    "code": "SLT11215",
    "desc": "SLITTER 92 x 40 x 2,25MM",
    "blank": 163.0
  },
  {
    "code": "SLT11220",
    "desc": "SLITTER 100 x 40 x 2,25MM",
    "blank": 173.0
  },
  {
    "code": "SLT11225",
    "desc": "SLITTER 100 x 40 x 17 x 2,25MM",
    "blank": 195.0
  },
  {
    "code": "SLT11230",
    "desc": "SLITTER 100 x 50 x 2,25MM",
    "blank": 191.0
  },
  {
    "code": "SLT11235",
    "desc": "SLITTER 100 x 50 x 17 x 2,25MM",
    "blank": 215.0
  },
  {
    "code": "SLT11240",
    "desc": "SLITTER 127 x 50 x 2,25MM",
    "blank": 217.0
  },
  {
    "code": "SLT11245",
    "desc": "SLITTER 127 x 50 x 17 x 2,25MM",
    "blank": 237.0
  },
  {
    "code": "SLT11250",
    "desc": "SLITTER 150 x 50 x 2,25MM",
    "blank": 237.0
  },
  {
    "code": "SLT11255",
    "desc": "SLITTER 150 x 60 x 20 x 2,25MM",
    "blank": 288.0
  },
  {
    "code": "SLT11257",
    "desc": "SLITTER 150 x 50 x 20 x 2,25MM",
    "blank": 269.0
  },
  {
    "code": "SLT11260",
    "desc": "SLITTER 200 x 50 x 2,25MM",
    "blank": 291.0
  },
  {
    "code": "SLT11265",
    "desc": "SLITTER 200 x 60 x 20 x 2,25MM",
    "blank": 340.0
  },
  {
    "code": "SLT11266",
    "desc": "SLITTER 200 x 75 x 20 X 2,25MM",
    "blank": 369.0
  }
];

// Predefined TUBO Slitters extracted from official production engineering sheets
// ("Largura dos slitters de Tubo") — code + description as printed there, plus
// numeric espessura/blank parsed for direct matching.
export interface TuboCatalogItem {
  code: string;
  desc: string;
  espessura: number;
  blank: number;
}

export const TUBO_SLITTERS_CATALOG: TuboCatalogItem[] = [
  { "code": "SLT21205", "desc": "SLITTER 0,95 X 80", "espessura": 0.95, "blank": 80 },
  { "code": "SLT21210", "desc": "SLITTER 0,95 X 100", "espessura": 0.95, "blank": 100 },
  { "code": "SLT21215", "desc": "SLITTER 0,95 X 120", "espessura": 0.95, "blank": 120 },
  { "code": "SLT21217", "desc": "SLITTER 0,95 X 140", "espessura": 0.95, "blank": 140 },
  { "code": "SLT21220", "desc": "SLITTER 0,95 X 160", "espessura": 0.95, "blank": 160 },
  { "code": "SLT21225", "desc": "SLITTER 0,95 X 180", "espessura": 0.95, "blank": 180 },
  { "code": "SLT21230", "desc": "SLITTER 1,11 X 40", "espessura": 1.11, "blank": 40 },
  { "code": "SLT21235", "desc": "SLITTER 1,11 X 50", "espessura": 1.11, "blank": 50 },
  { "code": "SLT21240", "desc": "SLITTER 1,11 X 60", "espessura": 1.11, "blank": 60 },
  { "code": "SLT21245", "desc": "SLITTER 1,11 X 69", "espessura": 1.11, "blank": 69 },
  { "code": "SLT21250", "desc": "SLITTER 1,11 X 79", "espessura": 1.11, "blank": 79 },
  { "code": "SLT21255", "desc": "SLITTER 1,11 X 82", "espessura": 1.11, "blank": 82 },
  { "code": "SLT21260", "desc": "SLITTER 1,11 X 99", "espessura": 1.11, "blank": 99 },
  { "code": "SLT21265", "desc": "SLITTER 1,11 X 119", "espessura": 1.11, "blank": 119 },
  { "code": "SLT21270", "desc": "SLITTER 1,11 X 139", "espessura": 1.11, "blank": 139 },
  { "code": "SLT21275", "desc": "SLITTER 1,11 X 150", "espessura": 1.11, "blank": 150 },
  { "code": "SLT21280", "desc": "SLITTER 1,11 X 159", "espessura": 1.11, "blank": 159 },
  { "code": "SLT20000", "desc": "SLITTER 1,20 X 79", "espessura": 1.2, "blank": 79 },
  { "code": "SLT20005", "desc": "SLITTER 1,20 X 99", "espessura": 1.2, "blank": 99 },
  { "code": "SLT20010", "desc": "SLITTER 1,20 X 109", "espessura": 1.2, "blank": 109 },
  { "code": "SLT20015", "desc": "SLITTER 1,20 X 119", "espessura": 1.2, "blank": 119 },
  { "code": "SLT20020", "desc": "SLITTER 1,20 X 139", "espessura": 1.2, "blank": 139 },
  { "code": "SLT20025", "desc": "SLITTER 1,20 X 159", "espessura": 1.2, "blank": 159 },
  { "code": "SLT20030", "desc": "SLITTER 1,20 X 180", "espessura": 1.2, "blank": 180 },
  { "code": "SLT20035", "desc": "SLITTER 1,20 X 199", "espessura": 1.2, "blank": 199 },
  { "code": "SLT20040", "desc": "SLITTER 1,20 X 239", "espessura": 1.2, "blank": 239 },
  { "code": "SLT20045", "desc": "SLITTER 1,25 X 79", "espessura": 1.25, "blank": 79 },
  { "code": "SLT20050", "desc": "SLITTER 1,25 X 99", "espessura": 1.25, "blank": 99 },
  { "code": "SLT20055", "desc": "SLITTER 1,25 X 109", "espessura": 1.25, "blank": 109 },
  { "code": "SLT20060", "desc": "SLITTER 1,25 X 121", "espessura": 1.25, "blank": 121 },
  { "code": "SLT20065", "desc": "SLITTER 1,25 X 139", "espessura": 1.25, "blank": 139 },
  { "code": "SLT20070", "desc": "SLITTER 1,25 X 160", "espessura": 1.25, "blank": 160 },
  { "code": "SLT20075", "desc": "SLITTER 1,25 X 180", "espessura": 1.25, "blank": 180 },
  { "code": "SLT20080", "desc": "SLITTER 1,25 X 199", "espessura": 1.25, "blank": 199 },
  { "code": "SLT20085", "desc": "SLITTER 1,25 X 239", "espessura": 1.25, "blank": 239 },
  { "code": "SLT20090", "desc": "SLITTER 1,25 X 319", "espessura": 1.25, "blank": 319 },
  { "code": "SLT20095", "desc": "SLITTER 1,50 X 80", "espessura": 1.5, "blank": 80 },
  { "code": "SLT20100", "desc": "SLITTER 1,50 X 83", "espessura": 1.5, "blank": 83 },
  { "code": "SLT20105", "desc": "SLITTER 1,50 X 98", "espessura": 1.5, "blank": 98 },
  { "code": "SLT20110", "desc": "SLITTER 1,50 X 104", "espessura": 1.5, "blank": 104 },
  { "code": "SLT20115", "desc": "SLITTER 1,50 X 108", "espessura": 1.5, "blank": 108 },
  { "code": "SLT20120", "desc": "SLITTER 1,50 X 118", "espessura": 1.5, "blank": 118 },
  { "code": "SLT20125", "desc": "SLITTER 1,50 X 131", "espessura": 1.5, "blank": 131 },
  { "code": "SLT20130", "desc": "SLITTER 1,50 X 138", "espessura": 1.5, "blank": 138 },
  { "code": "SLT20135", "desc": "SLITTER 1,50 X 151", "espessura": 1.5, "blank": 151 },
  { "code": "SLT20140", "desc": "SLITTER 1,50 X 159", "espessura": 1.5, "blank": 159 },
  { "code": "SLT20145", "desc": "SLITTER 1,50 X 179", "espessura": 1.5, "blank": 179 },
  { "code": "SLT20150", "desc": "SLITTER 1,50 X 188", "espessura": 1.5, "blank": 188 },
  { "code": "SLT20155", "desc": "SLITTER 1,50 X 198", "espessura": 1.5, "blank": 198 },
  { "code": "SLT20160", "desc": "SLITTER 1,50 X 238", "espessura": 1.5, "blank": 238 },
  { "code": "SLT20165", "desc": "SLITTER 1,50 X 278", "espessura": 1.5, "blank": 278 },
  { "code": "SLT20185", "desc": "SLITTER 1,50 X 298", "espessura": 1.5, "blank": 298 },
  { "code": "SLT20170", "desc": "SLITTER 1,50 X 319", "espessura": 1.5, "blank": 319 },
  { "code": "SLT20175", "desc": "SLITTER 1,50 X 364", "espessura": 1.5, "blank": 364 },
  { "code": "SLT20180", "desc": "SLITTER 1,50 X 399", "espessura": 1.5, "blank": 399 },
  { "code": "SLT20087", "desc": "SLITTER 1,55 X 59", "espessura": 1.55, "blank": 59 },
  { "code": "SLT20089", "desc": "SLITTER 1,55 X 69", "espessura": 1.55, "blank": 69 },
  { "code": "SLT20190", "desc": "SLITTER 1,55 X 80", "espessura": 1.55, "blank": 80 },
  { "code": "SLT20195", "desc": "SLITTER 1,55 X 83", "espessura": 1.55, "blank": 83 },
  { "code": "SLT20200", "desc": "SLITTER 1,55 X 99", "espessura": 1.55, "blank": 99 },
  { "code": "SLT20205", "desc": "SLITTER 1,55 X 104", "espessura": 1.55, "blank": 104 },
  { "code": "SLT20210", "desc": "SLITTER 1,55 X 108", "espessura": 1.55, "blank": 108 },
  { "code": "SLT20215", "desc": "SLITTER 1,55 X 120", "espessura": 1.55, "blank": 120 },
  { "code": "SLT20220", "desc": "SLITTER 1,55 X 131", "espessura": 1.55, "blank": 131 },
  { "code": "SLT20225", "desc": "SLITTER 1,55 X 138", "espessura": 1.55, "blank": 138 },
  { "code": "SLT20230", "desc": "SLITTER 1,55 X 151", "espessura": 1.55, "blank": 151 },
  { "code": "SLT20235", "desc": "SLITTER 1,55 X 158", "espessura": 1.55, "blank": 158 },
  { "code": "SLT20240", "desc": "SLITTER 1,55 X 179", "espessura": 1.55, "blank": 179 },
  { "code": "SLT20245", "desc": "SLITTER 1,55 X 188", "espessura": 1.55, "blank": 188 },
  { "code": "SLT20250", "desc": "SLITTER 1,55 X 199", "espessura": 1.55, "blank": 199 },
  { "code": "SLT20255", "desc": "SLITTER 1,55 X 238", "espessura": 1.55, "blank": 238 },
  { "code": "SLT20260", "desc": "SLITTER 1,55 X 278", "espessura": 1.55, "blank": 278 },
  { "code": "SLT20280", "desc": "SLITTER 1,55 X 298", "espessura": 1.55, "blank": 298 },
  { "code": "SLT20265", "desc": "SLITTER 1,55 X 318", "espessura": 1.55, "blank": 318 },
  { "code": "SLT20270", "desc": "SLITTER 1,55 X 364", "espessura": 1.55, "blank": 364 },
  { "code": "SLT20275", "desc": "SLITTER 1,55 X 399", "espessura": 1.55, "blank": 399 },
  { "code": "SLT20283", "desc": "SLITTER 1,80 X 57", "espessura": 1.8, "blank": 57 },
  { "code": "SLT20284", "desc": "SLITTER 1,80 X 67", "espessura": 1.8, "blank": 67 },
  { "code": "SLT20285", "desc": "SLITTER 1,80 X 78", "espessura": 1.8, "blank": 78 },
  { "code": "SLT20290", "desc": "SLITTER 1,80 X 82", "espessura": 1.8, "blank": 82 },
  { "code": "SLT20295", "desc": "SLITTER 1,80 X 98", "espessura": 1.8, "blank": 98 },
  { "code": "SLT20300", "desc": "SLITTER 1,80 X 103", "espessura": 1.8, "blank": 103 },
  { "code": "SLT20305", "desc": "SLITTER 1,80 X 107", "espessura": 1.8, "blank": 107 },
  { "code": "SLT20310", "desc": "SLITTER 1,80 X 118", "espessura": 1.8, "blank": 118 },
  { "code": "SLT20315", "desc": "SLITTER 1,80 X 130", "espessura": 1.8, "blank": 130 },
  { "code": "SLT20320", "desc": "SLITTER 1,80 X 138", "espessura": 1.8, "blank": 138 },
  { "code": "SLT20325", "desc": "SLITTER 1,80 X 149", "espessura": 1.8, "blank": 149 },
  { "code": "SLT20330", "desc": "SLITTER 1,80 X 158", "espessura": 1.8, "blank": 158 },
  { "code": "SLT20335", "desc": "SLITTER 1,80 X 177", "espessura": 1.8, "blank": 177 },
  { "code": "SLT20340", "desc": "SLITTER 1,80 X 187", "espessura": 1.8, "blank": 187 },
  { "code": "SLT20345", "desc": "SLITTER 1,80 X 197", "espessura": 1.8, "blank": 197 },
  { "code": "SLT20350", "desc": "SLITTER 1,80 X 238", "espessura": 1.8, "blank": 238 },
  { "code": "SLT20355", "desc": "SLITTER 1,80 X 278", "espessura": 1.8, "blank": 278 },
  { "code": "SLT20375", "desc": "SLITTER 1,80 X 298", "espessura": 1.8, "blank": 298 },
  { "code": "SLT20360", "desc": "SLITTER 1,80 X 317", "espessura": 1.8, "blank": 317 },
  { "code": "SLT20365", "desc": "SLITTER 1,80 X 363", "espessura": 1.8, "blank": 363 },
  { "code": "SLT20370", "desc": "SLITTER 1,80 X 399", "espessura": 1.8, "blank": 399 },
  { "code": "SLT20380", "desc": "SLITTER 1,90 X 78", "espessura": 1.9, "blank": 78 },
  { "code": "SLT20385", "desc": "SLITTER 1,90 X 82", "espessura": 1.9, "blank": 82 },
  { "code": "SLT20390", "desc": "SLITTER 1,90 X 97", "espessura": 1.9, "blank": 97 },
  { "code": "SLT20395", "desc": "SLITTER 1,90 X 103", "espessura": 1.9, "blank": 103 },
  { "code": "SLT20400", "desc": "SLITTER 1,90 X 107", "espessura": 1.9, "blank": 107 },
  { "code": "SLT20405", "desc": "SLITTER 1,90 X 118", "espessura": 1.9, "blank": 118 },
  { "code": "SLT20410", "desc": "SLITTER 1,90 X 130", "espessura": 1.9, "blank": 130 },
  { "code": "SLT20415", "desc": "SLITTER 1,90 X 138", "espessura": 1.9, "blank": 138 },
  { "code": "SLT20420", "desc": "SLITTER 1,90 X 149", "espessura": 1.9, "blank": 149 },
  { "code": "SLT20425", "desc": "SLITTER 1,90 X 157", "espessura": 1.9, "blank": 157 },
  { "code": "SLT20430", "desc": "SLITTER 1,90 X 177", "espessura": 1.9, "blank": 177 },
  { "code": "SLT20435", "desc": "SLITTER 1,90 X 187", "espessura": 1.9, "blank": 187 },
  { "code": "SLT20440", "desc": "SLITTER 1,90 X 197", "espessura": 1.9, "blank": 197 },
  { "code": "SLT20445", "desc": "SLITTER 1,90 X 237", "espessura": 1.9, "blank": 237 },
  { "code": "SLT20450", "desc": "SLITTER 1,90 X 278", "espessura": 1.9, "blank": 278 },
  { "code": "SLT20470", "desc": "SLITTER 1,90 X 297", "espessura": 1.9, "blank": 297 },
  { "code": "SLT20455", "desc": "SLITTER 1,90 X 317", "espessura": 1.9, "blank": 317 },
  { "code": "SLT20460", "desc": "SLITTER 1,90 X 363", "espessura": 1.9, "blank": 363 },
  { "code": "SLT20465", "desc": "SLITTER 1,90 X 399", "espessura": 1.9, "blank": 399 },
  { "code": "SLT20473", "desc": "SLITTER 1,95 X 57", "espessura": 1.95, "blank": 57 },
  { "code": "SLT20474", "desc": "SLITTER 1,95 X 67", "espessura": 1.95, "blank": 67 },
  { "code": "SLT20475", "desc": "SLITTER 1,95 X 80", "espessura": 1.95, "blank": 80 },
  { "code": "SLT20480", "desc": "SLITTER 1,95 X 82", "espessura": 1.95, "blank": 82 },
  { "code": "SLT20485", "desc": "SLITTER 1,95 X 98", "espessura": 1.95, "blank": 98 },
  { "code": "SLT20490", "desc": "SLITTER 1,95 X 103", "espessura": 1.95, "blank": 103 },
  { "code": "SLT20495", "desc": "SLITTER 1,95 X 107", "espessura": 1.95, "blank": 107 },
  { "code": "SLT20500", "desc": "SLITTER 1,95 X 118", "espessura": 1.95, "blank": 118 },
  { "code": "SLT20505", "desc": "SLITTER 1,95 X 130", "espessura": 1.95, "blank": 130 },
  { "code": "SLT20510", "desc": "SLITTER 1,95 X 137", "espessura": 1.95, "blank": 137 },
  { "code": "SLT20515", "desc": "SLITTER 1,95 X 149", "espessura": 1.95, "blank": 149 },
  { "code": "SLT20520", "desc": "SLITTER 1,95 X 158", "espessura": 1.95, "blank": 158 },
  { "code": "SLT20525", "desc": "SLITTER 1,95 X 177", "espessura": 1.95, "blank": 177 },
  { "code": "SLT20530", "desc": "SLITTER 1,95 X 187", "espessura": 1.95, "blank": 187 },
  { "code": "SLT20535", "desc": "SLITTER 1,95 X 197", "espessura": 1.95, "blank": 197 },
  { "code": "SLT20540", "desc": "SLITTER 1,95 X 237", "espessura": 1.95, "blank": 237 },
  { "code": "SLT20545", "desc": "SLITTER 1,95 X 277", "espessura": 1.95, "blank": 277 },
  { "code": "SLT20565", "desc": "SLITTER 1,95 X 297", "espessura": 1.95, "blank": 297 },
  { "code": "SLT20550", "desc": "SLITTER 1,95 X 317", "espessura": 1.95, "blank": 317 },
  { "code": "SLT20555", "desc": "SLITTER 1,95 X 363", "espessura": 1.95, "blank": 363 },
  { "code": "SLT20560", "desc": "SLITTER 1,95 X 399", "espessura": 1.95, "blank": 399 },
  { "code": "SLT20570", "desc": "SLITTER 2,00 X 77", "espessura": 2, "blank": 77 },
  { "code": "SLT20575", "desc": "SLITTER 2,00 X 82", "espessura": 2, "blank": 82 },
  { "code": "SLT20580", "desc": "SLITTER 2,00 X 97", "espessura": 2, "blank": 97 },
  { "code": "SLT20585", "desc": "SLITTER 2,00 X 103", "espessura": 2, "blank": 103 },
  { "code": "SLT20590", "desc": "SLITTER 2,00 X 107", "espessura": 2, "blank": 107 },
  { "code": "SLT20595", "desc": "SLITTER 2,00 X 118", "espessura": 2, "blank": 118 },
  { "code": "SLT20600", "desc": "SLITTER 2,00 X 130", "espessura": 2, "blank": 130 },
  { "code": "SLT20605", "desc": "SLITTER 2,00 X 137", "espessura": 2, "blank": 137 },
  { "code": "SLT20610", "desc": "SLITTER 2,00 X 149", "espessura": 2, "blank": 149 },
  { "code": "SLT20615", "desc": "SLITTER 2,00 X 157", "espessura": 2, "blank": 157 },
  { "code": "SLT20620", "desc": "SLITTER 2,00 X 177", "espessura": 2, "blank": 177 },
  { "code": "SLT20625", "desc": "SLITTER 2,00 X 187", "espessura": 2, "blank": 187 },
  { "code": "SLT20630", "desc": "SLITTER 2,00 X 197", "espessura": 2, "blank": 197 },
  { "code": "SLT20635", "desc": "SLITTER 2,00 X 237", "espessura": 2, "blank": 237 },
  { "code": "SLT20640", "desc": "SLITTER 2,00 X 277", "espessura": 2, "blank": 277 },
  { "code": "SLT20660", "desc": "SLITTER 2,00 X 297", "espessura": 2, "blank": 297 },
  { "code": "SLT20645", "desc": "SLITTER 2,00 X 317", "espessura": 2, "blank": 317 },
  { "code": "SLT20650", "desc": "SLITTER 2,00 X 361", "espessura": 2, "blank": 361 },
  { "code": "SLT20655", "desc": "SLITTER 2,00 X 398", "espessura": 2, "blank": 398 },
  { "code": "SLT20665", "desc": "SLITTER 2,25 X 76", "espessura": 2.25, "blank": 76 },
  { "code": "SLT20670", "desc": "SLITTER 2,25 X 81", "espessura": 2.25, "blank": 81 },
  { "code": "SLT20675", "desc": "SLITTER 2,25 X 97", "espessura": 2.25, "blank": 97 },
  { "code": "SLT20680", "desc": "SLITTER 2,25 X 102", "espessura": 2.25, "blank": 102 },
  { "code": "SLT20685", "desc": "SLITTER 2,25 X 106", "espessura": 2.25, "blank": 106 },
  { "code": "SLT20690", "desc": "SLITTER 2,25 X 117", "espessura": 2.25, "blank": 117 },
  { "code": "SLT20695", "desc": "SLITTER 2,25 X 129", "espessura": 2.25, "blank": 129 },
  { "code": "SLT20700", "desc": "SLITTER 2,25 X 137", "espessura": 2.25, "blank": 137 },
  { "code": "SLT20705", "desc": "SLITTER 2,25 X 148", "espessura": 2.25, "blank": 148 },
  { "code": "SLT20710", "desc": "SLITTER 2,25 X 157", "espessura": 2.25, "blank": 157 },
  { "code": "SLT20715", "desc": "SLITTER 2,25 X 176", "espessura": 2.25, "blank": 176 },
  { "code": "SLT20720", "desc": "SLITTER 2,25 X 187", "espessura": 2.25, "blank": 187 },
  { "code": "SLT20725", "desc": "SLITTER 2,25 X 197", "espessura": 2.25, "blank": 197 },
  { "code": "SLT20730", "desc": "SLITTER 2,25 X 238", "espessura": 2.25, "blank": 238 },
  { "code": "SLT20735", "desc": "SLITTER 2,25 X 277", "espessura": 2.25, "blank": 277 },
  { "code": "SLT20755", "desc": "SLITTER 2,25 X 296", "espessura": 2.25, "blank": 296 },
  { "code": "SLT20740", "desc": "SLITTER 2,25 X 316", "espessura": 2.25, "blank": 316 },
  { "code": "SLT20745", "desc": "SLITTER 2,25 X 360", "espessura": 2.25, "blank": 360 },
  { "code": "SLT20750", "desc": "SLITTER 2,25 X 396", "espessura": 2.25, "blank": 396 },
  { "code": "SLT20760", "desc": "SLITTER 2,65 X 76", "espessura": 2.65, "blank": 76 },
  { "code": "SLT20765", "desc": "SLITTER 2,65 X 80", "espessura": 2.65, "blank": 80 },
  { "code": "SLT20770", "desc": "SLITTER 2,65 X 98", "espessura": 2.65, "blank": 98 },
  { "code": "SLT20775", "desc": "SLITTER 2,65 X 101", "espessura": 2.65, "blank": 101 },
  { "code": "SLT20780", "desc": "SLITTER 2,65 X 105", "espessura": 2.65, "blank": 105 },
  { "code": "SLT20785", "desc": "SLITTER 2,65 X 115", "espessura": 2.65, "blank": 115 },
  { "code": "SLT20790", "desc": "SLITTER 2,65 X 128", "espessura": 2.65, "blank": 128 },
  { "code": "SLT20795", "desc": "SLITTER 2,65 X 135", "espessura": 2.65, "blank": 135 },
  { "code": "SLT20800", "desc": "SLITTER 2,65 X 146", "espessura": 2.65, "blank": 146 },
  { "code": "SLT20805", "desc": "SLITTER 2,65 X 156", "espessura": 2.65, "blank": 156 },
  { "code": "SLT20810", "desc": "SLITTER 2,65 X 175", "espessura": 2.65, "blank": 175 },
  { "code": "SLT20815", "desc": "SLITTER 2,65 X 184", "espessura": 2.65, "blank": 184 },
  { "code": "SLT20820", "desc": "SLITTER 2,65 X 195", "espessura": 2.65, "blank": 195 },
  { "code": "SLT20825", "desc": "SLITTER 2,65 X 236", "espessura": 2.65, "blank": 236 },
  { "code": "SLT20830", "desc": "SLITTER 2,65 X 275", "espessura": 2.65, "blank": 275 },
  { "code": "SLT20850", "desc": "SLITTER 2,65 X 296", "espessura": 2.65, "blank": 296 },
  { "code": "SLT20835", "desc": "SLITTER 2,65 X 316", "espessura": 2.65, "blank": 316 },
  { "code": "SLT20840", "desc": "SLITTER 2,65 X 359", "espessura": 2.65, "blank": 359 },
  { "code": "SLT20845", "desc": "SLITTER 2,65 X 396", "espessura": 2.65, "blank": 396 },
  { "code": "SLT20855", "desc": "SLITTER 3,00 X 76", "espessura": 3, "blank": 76 },
  { "code": "SLT20860", "desc": "SLITTER 3,00 X 79", "espessura": 3, "blank": 79 },
  { "code": "SLT20865", "desc": "SLITTER 3,00 X 99", "espessura": 3, "blank": 99 },
  { "code": "SLT20870", "desc": "SLITTER 3,00 X 100", "espessura": 3, "blank": 100 },
  { "code": "SLT20875", "desc": "SLITTER 3,00 X 104", "espessura": 3, "blank": 104 },
  { "code": "SLT20880", "desc": "SLITTER 3,00 X 114", "espessura": 3, "blank": 114 },
  { "code": "SLT20885", "desc": "SLITTER 3,00 X 128", "espessura": 3, "blank": 128 },
  { "code": "SLT20890", "desc": "SLITTER 3,00 X 134", "espessura": 3, "blank": 134 },
  { "code": "SLT20895", "desc": "SLITTER 3,00 X 146", "espessura": 3, "blank": 146 },
  { "code": "SLT20900", "desc": "SLITTER 3,00 X 154", "espessura": 3, "blank": 154 },
  { "code": "SLT20905", "desc": "SLITTER 3,00 X 175", "espessura": 3, "blank": 175 },
  { "code": "SLT20910", "desc": "SLITTER 3,00 X 183", "espessura": 3, "blank": 183 },
  { "code": "SLT20915", "desc": "SLITTER 3,00 X 194", "espessura": 3, "blank": 194 },
  { "code": "SLT20920", "desc": "SLITTER 3,00 X 234", "espessura": 3, "blank": 234 },
  { "code": "SLT20925", "desc": "SLITTER 3,00 X 277", "espessura": 3, "blank": 277 },
  { "code": "SLT20945", "desc": "SLITTER 3,00 X 296", "espessura": 3, "blank": 296 },
  { "code": "SLT20930", "desc": "SLITTER 3,00 X 315", "espessura": 3, "blank": 315 },
  { "code": "SLT20935", "desc": "SLITTER 3,00 X 358", "espessura": 3, "blank": 358 },
  { "code": "SLT20940", "desc": "SLITTER 3,00 X 394", "espessura": 3, "blank": 394 }
];

const WIDTH_TOLERANCE_MM = 0.6;
const THICKNESS_TOLERANCE_MM = 0.03;

// Fallback dos catálogos oficiais (perfil e tubo): além do casamento exato
// (0.6mm), aceita a entrada de blank mais próxima dentro desta tolerância
// maior — cobre desvios de arredondamento do cadastro de produtos em relação
// às planilhas de engenharia.
const CATALOG_FALLBACK_TOLERANCE_MM = 3.5;

function findInCatalog<T extends { blank: number; espessura?: number; desc: string }>(
  catalog: T[],
  larguraFita: number,
  espessura: number,
  espMatches: (item: T) => boolean
): T | null {
  const exact = catalog.find(s => Math.abs(s.blank - larguraFita) < WIDTH_TOLERANCE_MM && espMatches(s));
  if (exact) return exact;

  // Nenhuma correspondência exata: tenta o blank mais próximo dentro de uma
  // tolerância maior (cobre desvio de arredondamento do cadastro de produtos).
  const candidates = catalog.filter(s => Math.abs(s.blank - larguraFita) < CATALOG_FALLBACK_TOLERANCE_MM && espMatches(s));
  if (candidates.length === 0) return null;

  return candidates.reduce((best, c) => Math.abs(c.blank - larguraFita) < Math.abs(best.blank - larguraFita) ? c : best);
}

export class SlitterCatalogService {
  /**
   * Returns the real Slitter Code and Name for a given strip width and thickness.
   *
   * Ordem de resolução:
   * 1. Cadastro mestre de Ferramentais (Importador & Cadastros) — fonte de
   *    verdade editável pelo usuário, casada por largura de fita + espessura reais.
   * 2. Catálogos oficiais de slitters (planilhas de engenharia): perfil
   *    (`PERFIL_SLITTERS_CATALOG`) ou tubo (`TUBO_SLITTERS_CATALOG`, extraído de
   *    "Largura dos slitters de Tubo"), usados como referência quando o
   *    ferramental ainda não foi cadastrado individualmente.
   * 3. Sem correspondência: retorna um rótulo explícito de "não cadastrado" em
   *    vez de inventar um código plausível — evita códigos genéricos incorretos.
   */
  static getSlitterInfo(larguraFita: number, espessura: number, product?: Product): SlitterInfoResult {
    // 1. Cadastro mestre de Ferramentais
    const ferramentais = StorageService.getFerramentais();
    const registrado = ferramentais.find(f =>
      typeof f.larguraFita === 'number' &&
      typeof f.espessura === 'number' &&
      Math.abs(f.larguraFita - larguraFita) < WIDTH_TOLERANCE_MM &&
      Math.abs(f.espessura - espessura) < THICKNESS_TOLERANCE_MM
    );
    if (registrado) {
      return { code: registrado.codigo, name: registrado.nome, cadastrado: true };
    }

    // 2. Catálogos oficiais (fallback para larguras ainda não cadastradas)
    if (product?.familia === 'TUBO' || !product) {
      const match = findInCatalog(TUBO_SLITTERS_CATALOG, larguraFita, espessura, s => Math.abs(s.espessura - espessura) < THICKNESS_TOLERANCE_MM);
      if (match) {
        return { code: match.code, name: match.desc, cadastrado: true };
      }
    }

    if (product?.familia === 'PERFIL' || !product) {
      const espLabel = `${espessura.toFixed(2).replace('.', ',')}MM`;
      const match = findInCatalog(PERFIL_SLITTERS_CATALOG, larguraFita, espessura, s => s.desc.includes(espLabel));
      if (match) {
        return { code: match.code, name: match.desc, cadastrado: true };
      }
    }

    // 3. Sem correspondência: ferramental precisa ser cadastrado em Importador & Cadastros
    const roundedWidth = Math.round(larguraFita);
    const espStr = espessura.toFixed(2).replace('.', ',');
    return {
      code: 'SEM-CADASTRO',
      name: `Ferramental não cadastrado (${roundedWidth} x ${espStr}MM)`,
      cadastrado: false
    };
  }
}

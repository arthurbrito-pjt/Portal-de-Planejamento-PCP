import { Product } from '../types/pcp';

export interface SlitterCatalogItem {
  code: string;
  name: string;
  larguraFita: number;
  espessura: number;
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

export class SlitterCatalogService {
  /**
   * Returns the official Slitter Code and Name for a given strip width and thickness.
   */
  static getSlitterInfo(larguraFita: number, espessura: number, product?: Product): { code: string; name: string } {
    // 1. Check if matching perfil catalog
    if (product?.familia === 'PERFIL' || !product) {
      const match = PERFIL_SLITTERS_CATALOG.find(
        s => Math.abs(s.blank - larguraFita) < 0.5 && s.desc.includes(`${espessura.toFixed(2).replace('.', ',')}MM`)
      );
      if (match) {
        return {
          code: match.code,
          name: match.desc
        };
      }
    }

    // 2. If product is a tubo or generic
    if (product?.codigo && product.codigo.startsWith('TB')) {
      const numPart = product.codigo.replace(/[^0-9]/g, '');
      return {
        code: `SLT10${numPart.slice(-3).padStart(3, '0')}`,
        name: `SLITTER ${larguraFita} x ${espessura.toFixed(2).replace('.', ',')}MM`
      };
    }

    // 3. Standard clean Slitter identification
    const roundedWidth = Math.round(larguraFita);
    const espStr = espessura.toFixed(2).replace('.', '_');
    return {
      code: `SLT-${roundedWidth}x${espStr}`,
      name: `SLITTER ${larguraFita} x ${espessura.toFixed(2).replace('.', ',')}MM`
    };
  }
}

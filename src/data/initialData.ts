import { Product, Coil } from '../types/pcp';

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "PROD_TBZ10500_1_25",
    "codigo": "TBZ10500",
    "descricao": "TUBO IND ZC RD 1,25 X  63,50    NBR6591",
    "tipo": "TUBO",
    "espessura": 1.25,
    "larguraFita": 199.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ105001_1_25",
    "codigo": "TBZ105001",
    "descricao": "TUBO IND ZC RD 1,25 X  63,50    NBR6591 - COMPR. ESPECIAL",
    "tipo": "TUBO",
    "espessura": 1.25,
    "larguraFita": 199.0,
    "demandaT": 5.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ10620_1_25",
    "codigo": "TBZ10620",
    "descricao": "TUBO IND ZC QD 1,25 X   50 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.25,
    "larguraFita": 199.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ107801_1_25",
    "codigo": "TBZ107801",
    "descricao": "TUBO IND ZC RT 1,25 X   40 X  60 NBR6591 - COMPR. ESPECIAL",
    "tipo": "TUBO",
    "espessura": 1.25,
    "larguraFita": 199.0,
    "demandaT": 15.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20060_1_5",
    "codigo": "TBI20060",
    "descricao": "TUBO IND LQ RD 1,50 X  63,50    NBR6591",
    "tipo": "TUBO",
    "espessura": 1.5,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20170_1_5",
    "codigo": "TBI20170",
    "descricao": "TUBO IND LQ QD 1,50 X   60 X  60 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.5,
    "larguraFita": 238.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20320_1_5",
    "codigo": "TBI20320",
    "descricao": "TUBO IND LQ RT 1,50 X 40 X 80 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.5,
    "larguraFita": 238.0,
    "demandaT": 30.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20190_1_5",
    "codigo": "TBI20190",
    "descricao": "TUBO IND LQ QD 1,50 X   80 X  80 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.5,
    "larguraFita": 318.0,
    "demandaT": 30.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20092_1_5",
    "codigo": "TBI20092",
    "descricao": "TUBO IND LQ RD 1,50 X 114,30    NBR6591",
    "tipo": "TUBO",
    "espessura": 1.5,
    "larguraFita": 364.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11040_1_55",
    "codigo": "TBZ11040",
    "descricao": "TUBO IND ZC QD 1,55 X   50 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.55,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11180_1_55",
    "codigo": "TBZ11180",
    "descricao": "TUBO IND ZC RT 1,55 X   30 X  70 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.55,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ10930_1_55",
    "codigo": "TBZ10930",
    "descricao": "TUBO IND ZC RD 1,55 X 76,20 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.55,
    "larguraFita": 238.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11210_1_55",
    "codigo": "TBZ11210",
    "descricao": "TUBO IND ZC RT 1,55 X   40 X  80 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.55,
    "larguraFita": 238.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ10960_1_55",
    "codigo": "TBZ10960",
    "descricao": "TUBO IND ZC RD 1,55 X 101,60 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.55,
    "larguraFita": 318.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ109601_1_55",
    "codigo": "TBZ109601",
    "descricao": "TUBO IND ZC RD 1,55 X 101,60    NBR6591 - COMPR. ESPECIAL",
    "tipo": "TUBO",
    "espessura": 1.55,
    "larguraFita": 318.0,
    "demandaT": 4.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11070_1_55",
    "codigo": "TBZ11070",
    "descricao": "TUBO IND ZC QD 1,55 X   80 X  80 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.55,
    "larguraFita": 318.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_PRF10005_1_8",
    "codigo": "PRF10005",
    "descricao": "PERFIL U ENRIJ LQ 1,80 X 75 X 40 X 15 MM",
    "tipo": "PERFIL",
    "espessura": 1.8,
    "larguraFita": 165.0,
    "demandaT": 20.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10288_1_8",
    "codigo": "PRF10288",
    "descricao": "PERFIL U SIMPLES LQ 1,80 X 150 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 1.8,
    "larguraFita": 237.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10009_1_8",
    "codigo": "PRF10009",
    "descricao": "PERFIL U ENRIJ LQ 1,80 X 150 X 50 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 1.8,
    "larguraFita": 269.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF100081_1_8",
    "codigo": "PRF100081",
    "descricao": "PERFIL U ENRIJ LQ 1,80 X 150 X 60 X 20 MM - COMPR. ESPECIAL",
    "tipo": "PERFIL",
    "espessura": 1.8,
    "larguraFita": 288.0,
    "demandaT": 16.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_TBI20530_1_8",
    "codigo": "TBI20530",
    "descricao": "TUBO IND LQ QD 1,80 X   50 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.8,
    "larguraFita": 198.0,
    "demandaT": 20.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20670_1_8",
    "codigo": "TBI20670",
    "descricao": "TUBO IND LQ RT 1,80 X   30 X  70 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.8,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20680_1_8",
    "codigo": "TBI20680",
    "descricao": "TUBO IND LQ RT 1,80 X   40 X  60 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.8,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20690_1_8",
    "codigo": "TBI20690",
    "descricao": "TUBO IND LQ RT 1,80 X 40 X 80 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.8,
    "larguraFita": 238.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20560_1_8",
    "codigo": "TBI20560",
    "descricao": "TUBO IND LQ QD 1,80 X 80 X 80 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.8,
    "larguraFita": 318.0,
    "demandaT": 15.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20462_1_8",
    "codigo": "TBI20462",
    "descricao": "TUBO IND LQ RD 1,80 X 114,30    NBR6591",
    "tipo": "TUBO",
    "espessura": 1.8,
    "larguraFita": 363.0,
    "demandaT": 15.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_PRZ10140_1_95",
    "codigo": "PRZ10140",
    "descricao": "PERFIL U ENRIJ ZC 1,95 X 150 X 60 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 1.95,
    "larguraFita": 288.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRZ101401_1_95",
    "codigo": "PRZ101401",
    "descricao": "PERFIL U ENRIJ ZC 1,95 X 150 X 60 X 20 MM - COMPR. ESPECIAL",
    "tipo": "PERFIL",
    "espessura": 1.95,
    "larguraFita": 288.0,
    "demandaT": 2.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_TBZ11340_1_95",
    "codigo": "TBZ11340",
    "descricao": "TUBO IND ZC RD 1,95 X  63,50    NBR6591",
    "tipo": "TUBO",
    "espessura": 1.95,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11460_1_95",
    "codigo": "TBZ11460",
    "descricao": "TUBO IND ZC QD 1,95 X   50 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.95,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11350_1_95",
    "codigo": "TBZ11350",
    "descricao": "TUBO IND ZC RD 1,95 X 76,20 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.95,
    "larguraFita": 237.0,
    "demandaT": 30.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11470_1_95",
    "codigo": "TBZ11470",
    "descricao": "TUBO IND ZC QD 1,95 X   60 X  60 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.95,
    "larguraFita": 237.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ113801_1_95",
    "codigo": "TBZ113801",
    "descricao": "TUBO IND ZC RD 1,95 X 101,60    NBR6591 - COMPR. ESPECIAL",
    "tipo": "TUBO",
    "espessura": 1.95,
    "larguraFita": 318.0,
    "demandaT": 5.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11490_1_95",
    "codigo": "TBZ11490",
    "descricao": "TUBO IND ZC QD 1,95 X   80 X  80 NBR6591",
    "tipo": "TUBO",
    "espessura": 1.95,
    "larguraFita": 318.0,
    "demandaT": 20.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ11390_1_95",
    "codigo": "TBZ11390",
    "descricao": "TUBO IND ZC RD 1,95 X 114,30    NBR6591",
    "tipo": "TUBO",
    "espessura": 1.95,
    "larguraFita": 363.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_PRF10321_2_0",
    "codigo": "PRF10321",
    "descricao": "PERFIL U SIMPLES LQ 2,00 X  75 X 40   MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 145.0,
    "demandaT": 25.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10020_2_0",
    "codigo": "PRF10020",
    "descricao": "PERFIL U ENRIJ LQ 2,00 X 75 X 40 X 15 MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 165.0,
    "demandaT": 35.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF100201_2_0",
    "codigo": "PRF100201",
    "descricao": "PERFIL U ENRIJ LQ 2,00 X  75 X 40 X 15 MM - COMPR. ESPECIAL",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 165.0,
    "demandaT": 5.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10342_2_0",
    "codigo": "PRF10342",
    "descricao": "PERFIL U SIMPLES LQ 2,00 X 100 X 40   MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 173.0,
    "demandaT": 25.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10343_2_0",
    "codigo": "PRF10343",
    "descricao": "PERFIL U SIMPLES LQ 2,00 X 100 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 191.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10360_2_0",
    "codigo": "PRF10360",
    "descricao": "PERFIL U SIMPLES LQ 2,00 X 150 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 237.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10051_2_0",
    "codigo": "PRF10051",
    "descricao": "PERFIL U ENRIJ LQ 2,00 X 150 X 50 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 269.0,
    "demandaT": 25.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10050_2_0",
    "codigo": "PRF10050",
    "descricao": "PERFIL U ENRIJ LQ 2,00 X 150 X 60 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 288.0,
    "demandaT": 50.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10370_2_0",
    "codigo": "PRF10370",
    "descricao": "PERFIL U SIMPLES LQ 2,00 X 200 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 291.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10060_2_0",
    "codigo": "PRF10060",
    "descricao": "PERFIL U ENRIJ LQ 2,00 X 200 X 75 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 2.0,
    "larguraFita": 367.0,
    "demandaT": 35.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_TBI20900_2_0",
    "codigo": "TBI20900",
    "descricao": "TUBO IND LQ QD 2,00 X   40 X  40 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 158.0,
    "demandaT": 30.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21041_2_0",
    "codigo": "TBI21041",
    "descricao": "TUBO IND LQ RT 2,00 X   30 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 158.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20800_2_0",
    "codigo": "TBI20800",
    "descricao": "TUBO IND LQ RD 2,00 X  63,50    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20920_2_0",
    "codigo": "TBI20920",
    "descricao": "TUBO IND LQ QD 2,00 X   50 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 198.0,
    "demandaT": 20.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21070_2_0",
    "codigo": "TBI21070",
    "descricao": "TUBO IND LQ RT 2,00 X   30 X  70 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21080_2_0",
    "codigo": "TBI21080",
    "descricao": "TUBO IND LQ RT 2,00 X   40 X  60 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20810_2_0",
    "codigo": "TBI20810",
    "descricao": "TUBO IND LQ RD 2,00 X 76,20 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 238.0,
    "demandaT": 20.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20930_2_0",
    "codigo": "TBI20930",
    "descricao": "TUBO IND LQ QD 2,00 X   60 X  60 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 238.0,
    "demandaT": 55.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21090_2_0",
    "codigo": "TBI21090",
    "descricao": "TUBO IND LQ RT 2,00 X 40 X 80 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 238.0,
    "demandaT": 34.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20830_2_0",
    "codigo": "TBI20830",
    "descricao": "TUBO IND LQ RD 2,00 X 101,60    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 318.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20950_2_0",
    "codigo": "TBI20950",
    "descricao": "TUBO IND LQ QD 2,00 X   80 X  80 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 318.0,
    "demandaT": 45.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI208401_2_0",
    "codigo": "TBI208401",
    "descricao": "TUBO IND LQ RD 2,00 X 114,30    NBR6591   - COMPR. ESPECIAL",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 361.0,
    "demandaT": 16.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI20841_2_0",
    "codigo": "TBI20841",
    "descricao": "TUBO IND LQ RD 2,00 X 114,30    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.0,
    "larguraFita": 361.0,
    "demandaT": 66.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_PRF10080_2_25",
    "codigo": "PRF10080",
    "descricao": "PERFIL U ENRIJ LQ 2,25 X 75 X 40 X 15 MM",
    "tipo": "PERFIL",
    "espessura": 2.25,
    "larguraFita": 165.0,
    "demandaT": 20.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF100801_2_25",
    "codigo": "PRF100801",
    "descricao": "PERFIL U ENRIJ LQ 2,25 X  75 X 40 X 15 MM - COMPR. ESPECIAL",
    "tipo": "PERFIL",
    "espessura": 2.25,
    "larguraFita": 165.0,
    "demandaT": 18.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10431_2_25",
    "codigo": "PRF10431",
    "descricao": "PERFIL U SIMPLES LQ 2,25 X 100 X 40   MM",
    "tipo": "PERFIL",
    "espessura": 2.25,
    "larguraFita": 173.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10430_2_25",
    "codigo": "PRF10430",
    "descricao": "PERFIL U SIMPLES LQ 2,25 X 100 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 2.25,
    "larguraFita": 191.0,
    "demandaT": 20.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10450_2_25",
    "codigo": "PRF10450",
    "descricao": "PERFIL U SIMPLES LQ 2,25 X 150 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 2.25,
    "larguraFita": 237.0,
    "demandaT": 25.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10111_2_25",
    "codigo": "PRF10111",
    "descricao": "PERFIL U ENRIJ LQ 2,25 X 150 X 50 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 2.25,
    "larguraFita": 269.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF101111_2_25",
    "codigo": "PRF101111",
    "descricao": "PERFIL U ENRIJ LQ 2,25 X 150 X 50 X 20 MM - COMPR. ESPECIAL",
    "tipo": "PERFIL",
    "espessura": 2.25,
    "larguraFita": 269.0,
    "demandaT": 3.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10120_2_25",
    "codigo": "PRF10120",
    "descricao": "PERFIL U ENRIJ LQ 2,25 X 200 X 75 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 2.25,
    "larguraFita": 367.0,
    "demandaT": 20.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_TBI21320_2_25",
    "codigo": "TBI21320",
    "descricao": "TUBO IND LQ QD 2,25 X   40 X  40 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 157.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21460_2_25",
    "codigo": "TBI21460",
    "descricao": "TUBO IND LQ RT 2,25 X   30 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 157.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21220_2_25",
    "codigo": "TBI21220",
    "descricao": "TUBO IND LQ RD 2,25 X  63,50    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21340_2_25",
    "codigo": "TBI21340",
    "descricao": "TUBO IND LQ QD 2,25 X   50 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 198.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21230_2_25",
    "codigo": "TBI21230",
    "descricao": "TUBO IND LQ RD 2,25 X  76,20    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 236.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21510_2_25",
    "codigo": "TBI21510",
    "descricao": "TUBO IND LQ RT 2,25 X   40 X  80 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 236.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21250_2_25",
    "codigo": "TBI21250",
    "descricao": "TUBO IND LQ RD 2,25 X 101,60    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 317.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21370_2_25",
    "codigo": "TBI21370",
    "descricao": "TUBO IND LQ QD 2,25 X   80 X  80 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 317.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21260_2_25",
    "codigo": "TBI21260",
    "descricao": "TUBO IND LQ RD 2,25 X 114,30    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 360.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI212601_2_25",
    "codigo": "TBI212601",
    "descricao": "TUBO IND LQ RD 2,25 X 114,30    NBR6591   - COMPR. ESPECIAL",
    "tipo": "TUBO",
    "espessura": 2.25,
    "larguraFita": 360.0,
    "demandaT": 2.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_PRF10500_2_65",
    "codigo": "PRF10500",
    "descricao": "PERFIL U SIMPLES LQ 2,65 X  75 X 40   MM",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 144.0,
    "demandaT": 25.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10140_2_65",
    "codigo": "PRF10140",
    "descricao": "PERFIL U ENRIJ LQ 2,65 X 75 X 40 X 15 MM",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 164.0,
    "demandaT": 20.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10521_2_65",
    "codigo": "PRF10521",
    "descricao": "PERFIL U SIMPLES LQ 2,65 X 100 X 40   MM",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 171.0,
    "demandaT": 40.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10522_2_65",
    "codigo": "PRF10522",
    "descricao": "PERFIL U SIMPLES LQ 2,65 X 100 X 50 MM",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 188.0,
    "demandaT": 81.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10540_2_65",
    "codigo": "PRF10540",
    "descricao": "PERFIL U SIMPLES LQ 2,65 X 150 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 236.0,
    "demandaT": 20.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10816_2_65",
    "codigo": "PRF10816",
    "descricao": "PERFIL U SIMPLES LQ 2,65 X 150 X 50 MM COR400",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 236.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10170_2_65",
    "codigo": "PRF10170",
    "descricao": "PERFIL U ENRIJ LQ 2,65 X 150 X 60 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 286.0,
    "demandaT": 30.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10550_2_65",
    "codigo": "PRF10550",
    "descricao": "PERFIL U SIMPLES LQ 2,65 X 200 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 288.0,
    "demandaT": 15.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10180_2_65",
    "codigo": "PRF10180",
    "descricao": "PERFIL U ENRIJ LQ 2,65 X 200 X 75 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 2.65,
    "larguraFita": 366.0,
    "demandaT": 25.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_TBI21740_2_65",
    "codigo": "TBI21740",
    "descricao": "TUBO IND LQ QD 2,65 X   40 X  40 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.65,
    "larguraFita": 156.0,
    "demandaT": 25.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21860_2_65",
    "codigo": "TBI21860",
    "descricao": "TUBO IND LQ RT 2,65 X   30 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.65,
    "larguraFita": 156.0,
    "demandaT": 20.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21760_2_65",
    "codigo": "TBI21760",
    "descricao": "TUBO IND LQ QD 2,65 X   50 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.65,
    "larguraFita": 196.0,
    "demandaT": 20.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21890_2_65",
    "codigo": "TBI21890",
    "descricao": "TUBO IND LQ RT 2,65 X   30 X  70 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.65,
    "larguraFita": 196.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21690_2_65",
    "codigo": "TBI21690",
    "descricao": "TUBO IND LQ RD 2,65 X 101,60    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.65,
    "larguraFita": 317.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21790_2_65",
    "codigo": "TBI21790",
    "descricao": "TUBO IND LQ QD 2,65 X   80 X  80 NBR6591",
    "tipo": "TUBO",
    "espessura": 2.65,
    "larguraFita": 317.0,
    "demandaT": 15.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI21700_2_65",
    "codigo": "TBI21700",
    "descricao": "TUBO IND LQ RD 2,65 X 114,30    NBR6591",
    "tipo": "TUBO",
    "espessura": 2.65,
    "larguraFita": 359.0,
    "demandaT": 30.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_PRF10611_3_0",
    "codigo": "PRF10611",
    "descricao": "PERFIL U SIMPLES LQ 3,00 X 100 X 40   MM",
    "tipo": "PERFIL",
    "espessura": 3.0,
    "larguraFita": 169.0,
    "demandaT": 35.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10612_3_0",
    "codigo": "PRF10612",
    "descricao": "PERFIL U SIMPLES LQ 3,00 X 100 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 3.0,
    "larguraFita": 188.0,
    "demandaT": 40.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10630_3_0",
    "codigo": "PRF10630",
    "descricao": "PERFIL U SIMPLES LQ 3,00 X 150 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 3.0,
    "larguraFita": 236.0,
    "demandaT": 70.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10229_3_0",
    "codigo": "PRF10229",
    "descricao": "PERFIL U ENRIJ LQ 3,00 X 150 X50 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 3.0,
    "larguraFita": 266.0,
    "demandaT": 30.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10230_3_0",
    "codigo": "PRF10230",
    "descricao": "PERFIL U ENRIJ LQ 3,00 X 150 X 60 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 3.0,
    "larguraFita": 284.0,
    "demandaT": 50.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF102301_3_0",
    "codigo": "PRF102301",
    "descricao": "PERFIL U ENRIJ LQ 3,00 X 150 X 60 X 20 MM - COMPR. ESPECIAL",
    "tipo": "PERFIL",
    "espessura": 3.0,
    "larguraFita": 284.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10642_3_0",
    "codigo": "PRF10642",
    "descricao": "PERFIL U SIMPLES LQ 3,00 X 200 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 3.0,
    "larguraFita": 288.0,
    "demandaT": 30.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10255_3_0",
    "codigo": "PRF10255",
    "descricao": "PERFIL U ENRIJ LQ 3,00 X 200 X 75 X 20 MM",
    "tipo": "PERFIL",
    "espessura": 3.0,
    "larguraFita": 366.0,
    "demandaT": 10.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_TBI22120_3_0",
    "codigo": "TBI22120",
    "descricao": "TUBO IND LQ QD 3,00 X   40 X  40 NBR6591",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 154.0,
    "demandaT": 65.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI22240_3_0",
    "codigo": "TBI22240",
    "descricao": "TUBO IND LQ RT 3,00 X   30 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 154.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI22280_3_0",
    "codigo": "TBI22280",
    "descricao": "TUBO IND LQ RT 3,00 X   40 X  60 NBR6591",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 194.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBZ12300_3_0",
    "codigo": "TBZ12300",
    "descricao": "TUBO IND ZC QD 3,00 X   50 X  50 NBR6591",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 194.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI22060_3_0",
    "codigo": "TBI22060",
    "descricao": "TUBO IND LQ RD 3,00 X 76,20 NBR6591",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 234.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI22150_3_0",
    "codigo": "TBI22150",
    "descricao": "TUBO IND LQ QD 3,00 X   60 X  60 NBR6591",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 234.0,
    "demandaT": 45.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI221501_3_0",
    "codigo": "TBI221501",
    "descricao": "TUBO IND LQ QD 3,00 X   60 X  60 NBR6591 - COMP ESPECIAL",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 234.0,
    "demandaT": 5.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI22080_3_0",
    "codigo": "TBI22080",
    "descricao": "TUBO IND LQ RD 3,00 X 101,60    NBR6591",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 316.0,
    "demandaT": 20.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_TBI22090_3_0",
    "codigo": "TBI22090",
    "descricao": "TUBO IND LQ RD 3,00 X 114,30    NBR6591",
    "tipo": "TUBO",
    "espessura": 3.0,
    "larguraFita": 359.0,
    "demandaT": 10.0,
    "familia": "TUBO"
  },
  {
    "id": "PROD_PRF10651_4_75",
    "codigo": "PRF10651",
    "descricao": "PERFIL U SIMPLES LQ 4,75 X  75 X 40   MM",
    "tipo": "PERFIL",
    "espessura": 4.75,
    "larguraFita": 136.0,
    "demandaT": 40.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10670_4_75",
    "codigo": "PRF10670",
    "descricao": "PERFIL U SIMPLES LQ 4,75 X 100 X 40   MM",
    "tipo": "PERFIL",
    "espessura": 4.75,
    "larguraFita": 162.0,
    "demandaT": 40.0,
    "familia": "PERFIL"
  },
  {
    "id": "PROD_PRF10690_4_75",
    "codigo": "PRF10690",
    "descricao": "PERFIL U SIMPLES LQ 4,75 X 150 X 50   MM",
    "tipo": "PERFIL",
    "espessura": 4.75,
    "larguraFita": 232.0,
    "demandaT": 50.0,
    "familia": "PERFIL"
  }
];

export const INITIAL_COILS: Coil[] = [
  {
    "id": "COIL_001",
    "codigo": "BQN10210",
    "lote": "OB01934",
    "espessura": 2.25,
    "largura": 1000.0,
    "peso": 13.41,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_002",
    "codigo": "BQN30043",
    "lote": "P1192672 - 5,00X1,330",
    "espessura": 4.75,
    "largura": 1500.0,
    "peso": 8.28,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_003",
    "codigo": "BQN10040",
    "lote": "P3017012",
    "espessura": 1.5,
    "largura": 1200.0,
    "peso": 16.61,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_004",
    "codigo": "BQN10060",
    "lote": "P414274",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 25.48,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_005",
    "codigo": "BQN10382",
    "lote": "P5059411",
    "espessura": 2.65,
    "largura": 1500.0,
    "peso": 15.03,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_006",
    "codigo": "BQN20020",
    "lote": "P507371",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.525,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_007",
    "codigo": "BQN10080",
    "lote": "P507885",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 25.13,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_008",
    "codigo": "BQN10040",
    "lote": "O910881",
    "espessura": 1.5,
    "largura": 1200.0,
    "peso": 14.4,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_009",
    "codigo": "BQN30043",
    "lote": "OA121112",
    "espessura": 4.75,
    "largura": 1500.0,
    "peso": 5.14,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_010",
    "codigo": "BQN10210",
    "lote": "OB06021",
    "espessura": 2.25,
    "largura": 1000.0,
    "peso": 11.5,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_011",
    "codigo": "BQN10060",
    "lote": "P414047",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 25.42,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_012",
    "codigo": "BQN10382",
    "lote": "P5059412",
    "espessura": 2.65,
    "largura": 1500.0,
    "peso": 14.43,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_013",
    "codigo": "BQN20020",
    "lote": "P507388",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.487,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_014",
    "codigo": "BQN10080",
    "lote": "P513310",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 25.04,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_015",
    "codigo": "BQN10361",
    "lote": "O8142712",
    "espessura": 1.5,
    "largura": 1200.0,
    "peso": 12.43,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_016",
    "codigo": "BQN10210",
    "lote": "P212225",
    "espessura": 2.25,
    "largura": 1000.0,
    "peso": 10.33,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_017",
    "codigo": "BQN10060",
    "lote": "P406512",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 25.37,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_018",
    "codigo": "BQN20020",
    "lote": "P510802",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.487,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_019",
    "codigo": "BQN10080",
    "lote": "P513815",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 24.94,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_020",
    "codigo": "BQN10210",
    "lote": "P212212",
    "espessura": 2.25,
    "largura": 1000.0,
    "peso": 10.325,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_021",
    "codigo": "BQN10060",
    "lote": "P414275",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 25.26,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_022",
    "codigo": "BQN20020",
    "lote": "P507376",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.475,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_023",
    "codigo": "BQN10080",
    "lote": "P513459",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 24.89,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_024",
    "codigo": "BQN10200",
    "lote": "P202714",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 24.81,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_025",
    "codigo": "BQN10060",
    "lote": "P505352",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 25.16,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_026",
    "codigo": "BQN20020",
    "lote": "P507389",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.475,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_027",
    "codigo": "BQN20020",
    "lote": "P510801",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.462,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_028",
    "codigo": "BQN20020",
    "lote": "P507377",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.437,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_029",
    "codigo": "BQN20020",
    "lote": "P507386",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.425,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_030",
    "codigo": "BQN20020",
    "lote": "P507390",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.412,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_031",
    "codigo": "BQN20020",
    "lote": "P507385",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.35,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_032",
    "codigo": "BQN20020",
    "lote": "P510800",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.287,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_033",
    "codigo": "BQN20020",
    "lote": "P501555",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 25.0,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_034",
    "codigo": "BQN20020",
    "lote": "P504185",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 24.975,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_035",
    "codigo": "BQN20020",
    "lote": "P500355",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 24.747,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_036",
    "codigo": "BQN20020",
    "lote": "P510847",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 20.317,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_037",
    "codigo": "BQN01500",
    "lote": "LOTE-E150-1000-01",
    "espessura": 1.5,
    "largura": 1000.0,
    "peso": 9.12,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_038",
    "codigo": "BQN01500",
    "lote": "LOTE-E150-1100-01",
    "espessura": 1.5,
    "largura": 1100.0,
    "peso": 7.46,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_039",
    "codigo": "BQN01500",
    "lote": "LOTE-E150-1200-01",
    "espessura": 1.5,
    "largura": 1200.0,
    "peso": 9.874,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_040",
    "codigo": "BQN01500",
    "lote": "LOTE-E150-1200-02",
    "espessura": 1.5,
    "largura": 1200.0,
    "peso": 9.874,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_041",
    "codigo": "BQN01500",
    "lote": "LOTE-E150-1200-03",
    "espessura": 1.5,
    "largura": 1200.0,
    "peso": 9.874,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_042",
    "codigo": "BQN01500",
    "lote": "LOTE-E150-1200-04",
    "espessura": 1.5,
    "largura": 1200.0,
    "peso": 9.874,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_043",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-930-01",
    "espessura": 1.8,
    "largura": 930.0,
    "peso": 4.43,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_044",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1000-01",
    "espessura": 1.8,
    "largura": 1000.0,
    "peso": 3.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_045",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1200-01",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 22.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_046",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1200-02",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 22.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_047",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1200-03",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 22.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_048",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1200-04",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 22.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_049",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1200-05",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 22.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_050",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1200-06",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 22.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_051",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1200-07",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 22.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_052",
    "codigo": "BQN01800",
    "lote": "LOTE-E180-1200-08",
    "espessura": 1.8,
    "largura": 1200.0,
    "peso": 22.79,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_053",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1000-01",
    "espessura": 2.0,
    "largura": 1000.0,
    "peso": 16.7,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_054",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1100-01",
    "espessura": 2.0,
    "largura": 1100.0,
    "peso": 5.46,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_055",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1200-01",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 20.07,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_056",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1200-02",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 20.07,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_057",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1200-03",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 20.07,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_058",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1200-04",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 20.07,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_059",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1200-05",
    "espessura": 2.0,
    "largura": 1200.0,
    "peso": 20.07,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_060",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1450-01",
    "espessura": 2.0,
    "largura": 1450.0,
    "peso": 8.45,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_061",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1460-01",
    "espessura": 2.0,
    "largura": 1460.0,
    "peso": 8.57,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_062",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1470-01",
    "espessura": 2.0,
    "largura": 1470.0,
    "peso": 8.54,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_063",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1500-01",
    "espessura": 2.0,
    "largura": 1500.0,
    "peso": 9.924,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_064",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1500-02",
    "espessura": 2.0,
    "largura": 1500.0,
    "peso": 9.924,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_065",
    "codigo": "BQN02000",
    "lote": "LOTE-E200-1500-03",
    "espessura": 2.0,
    "largura": 1500.0,
    "peso": 9.924,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_066",
    "codigo": "BQN02250",
    "lote": "LOTE-E225-1200-01",
    "espessura": 2.25,
    "largura": 1200.0,
    "peso": 10.387,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_067",
    "codigo": "BQN02250",
    "lote": "LOTE-E225-1200-02",
    "espessura": 2.25,
    "largura": 1200.0,
    "peso": 10.387,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_068",
    "codigo": "BQN02250",
    "lote": "LOTE-E225-1200-03",
    "espessura": 2.25,
    "largura": 1200.0,
    "peso": 10.387,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_069",
    "codigo": "BQN02250",
    "lote": "LOTE-E225-1200-04",
    "espessura": 2.25,
    "largura": 1200.0,
    "peso": 10.387,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_070",
    "codigo": "BQN02250",
    "lote": "LOTE-E225-1200-05",
    "espessura": 2.25,
    "largura": 1200.0,
    "peso": 10.387,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_071",
    "codigo": "BQN02250",
    "lote": "LOTE-E225-1200-06",
    "espessura": 2.25,
    "largura": 1200.0,
    "peso": 10.387,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_072",
    "codigo": "BQN02300",
    "lote": "LOTE-E229-1450-01",
    "espessura": 2.3,
    "largura": 1450.0,
    "peso": 0.186,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_073",
    "codigo": "BQN02600",
    "lote": "LOTE-E260-900-01",
    "espessura": 2.6,
    "largura": 900.0,
    "peso": 10.42,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_074",
    "codigo": "BQN02650",
    "lote": "LOTE-E265-1200-01",
    "espessura": 2.65,
    "largura": 1200.0,
    "peso": 3.985,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_075",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1000-01",
    "espessura": 3.0,
    "largura": 1000.0,
    "peso": 7.658,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_076",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1000-02",
    "espessura": 3.0,
    "largura": 1000.0,
    "peso": 7.658,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_077",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1000-03",
    "espessura": 3.0,
    "largura": 1000.0,
    "peso": 7.658,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_078",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1070-01",
    "espessura": 3.0,
    "largura": 1070.0,
    "peso": 8.36,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_079",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1200-01",
    "espessura": 3.0,
    "largura": 1200.0,
    "peso": 23.491,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_080",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1460-01",
    "espessura": 3.0,
    "largura": 1460.0,
    "peso": 10.7,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_081",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1500-01",
    "espessura": 3.0,
    "largura": 1500.0,
    "peso": 10.26,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_082",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1500-02",
    "espessura": 3.0,
    "largura": 1500.0,
    "peso": 10.26,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_083",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1500-03",
    "espessura": 3.0,
    "largura": 1500.0,
    "peso": 10.26,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_084",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1620-01",
    "espessura": 3.0,
    "largura": 1620.0,
    "peso": 20.901,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_085",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1620-02",
    "espessura": 3.0,
    "largura": 1620.0,
    "peso": 20.901,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_086",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1640-01",
    "espessura": 3.0,
    "largura": 1640.0,
    "peso": 10.14,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_087",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1770-01",
    "espessura": 3.0,
    "largura": 1770.0,
    "peso": 7.215,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_088",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1770-02",
    "espessura": 3.0,
    "largura": 1770.0,
    "peso": 7.215,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_089",
    "codigo": "BQN03000",
    "lote": "LOTE-E300-1800-01",
    "espessura": 3.0,
    "largura": 1800.0,
    "peso": 10.135,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_090",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1030-01",
    "espessura": 3.35,
    "largura": 1030.0,
    "peso": 9.37,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_091",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1230-01",
    "espessura": 3.35,
    "largura": 1230.0,
    "peso": 9.4,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_092",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1280-01",
    "espessura": 3.35,
    "largura": 1280.0,
    "peso": 12.54,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_093",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1490-01",
    "espessura": 3.35,
    "largura": 1490.0,
    "peso": 9.1,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_094",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1500-01",
    "espessura": 3.35,
    "largura": 1500.0,
    "peso": 12.94,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_095",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1530-01",
    "espessura": 3.35,
    "largura": 1530.0,
    "peso": 27.512,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_096",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1660-01",
    "espessura": 3.35,
    "largura": 1660.0,
    "peso": 8.31,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_097",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1700-01",
    "espessura": 3.35,
    "largura": 1700.0,
    "peso": 20.145,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_098",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1700-02",
    "espessura": 3.35,
    "largura": 1700.0,
    "peso": 20.145,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_099",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1750-01",
    "espessura": 3.35,
    "largura": 1750.0,
    "peso": 7.78,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_100",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1750-02",
    "espessura": 3.35,
    "largura": 1750.0,
    "peso": 7.78,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_101",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1760-01",
    "espessura": 3.35,
    "largura": 1760.0,
    "peso": 6.71,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_102",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1790-01",
    "espessura": 3.35,
    "largura": 1790.0,
    "peso": 5.93,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_103",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1800-01",
    "espessura": 3.35,
    "largura": 1800.0,
    "peso": 15.22,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_104",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1800-02",
    "espessura": 3.35,
    "largura": 1800.0,
    "peso": 15.22,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_105",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1800-03",
    "espessura": 3.35,
    "largura": 1800.0,
    "peso": 15.22,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_106",
    "codigo": "BQN03350",
    "lote": "LOTE-E335-1870-01",
    "espessura": 3.35,
    "largura": 1870.0,
    "peso": 9.77,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_107",
    "codigo": "BQN03600",
    "lote": "LOTE-E360-925-01",
    "espessura": 3.6,
    "largura": 925.0,
    "peso": 4.06,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_108",
    "codigo": "BQN03600",
    "lote": "LOTE-E360-1200-01",
    "espessura": 3.6,
    "largura": 1200.0,
    "peso": 6.03,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_109",
    "codigo": "BQN03600",
    "lote": "LOTE-E360-1780-01",
    "espessura": 3.6,
    "largura": 1780.0,
    "peso": 9.54,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_110",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1500-01",
    "espessura": 3.75,
    "largura": 1500.0,
    "peso": 13.848,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_111",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1500-02",
    "espessura": 3.75,
    "largura": 1500.0,
    "peso": 13.848,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_112",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1500-03",
    "espessura": 3.75,
    "largura": 1500.0,
    "peso": 13.848,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_113",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1500-04",
    "espessura": 3.75,
    "largura": 1500.0,
    "peso": 13.848,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_114",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1640-01",
    "espessura": 3.75,
    "largura": 1640.0,
    "peso": 5.872,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_115",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1640-02",
    "espessura": 3.75,
    "largura": 1640.0,
    "peso": 5.872,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_116",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1640-03",
    "espessura": 3.75,
    "largura": 1640.0,
    "peso": 5.872,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_117",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1640-04",
    "espessura": 3.75,
    "largura": 1640.0,
    "peso": 5.872,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_118",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1650-01",
    "espessura": 3.75,
    "largura": 1650.0,
    "peso": 6.2,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_119",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1690-01",
    "espessura": 3.75,
    "largura": 1690.0,
    "peso": 8.91,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_120",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1690-02",
    "espessura": 3.75,
    "largura": 1690.0,
    "peso": 8.91,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_121",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1700-01",
    "espessura": 3.75,
    "largura": 1700.0,
    "peso": 4.56,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_122",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1730-01",
    "espessura": 3.75,
    "largura": 1730.0,
    "peso": 5.98,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_123",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1800-01",
    "espessura": 3.75,
    "largura": 1800.0,
    "peso": 20.819,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_124",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1800-02",
    "espessura": 3.75,
    "largura": 1800.0,
    "peso": 20.819,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_125",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1830-01",
    "espessura": 3.75,
    "largura": 1830.0,
    "peso": 7.31,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_126",
    "codigo": "BQN03750",
    "lote": "LOTE-E375-1870-01",
    "espessura": 3.75,
    "largura": 1870.0,
    "peso": 8.95,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_127",
    "codigo": "BQN04000",
    "lote": "LOTE-E400-1040-01",
    "espessura": 4.0,
    "largura": 1040.0,
    "peso": 6.85,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_128",
    "codigo": "BQN04000",
    "lote": "LOTE-E400-1160-01",
    "espessura": 4.0,
    "largura": 1160.0,
    "peso": 5.98,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_129",
    "codigo": "BQN04000",
    "lote": "LOTE-E400-1330-01",
    "espessura": 4.0,
    "largura": 1330.0,
    "peso": 12.44,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_130",
    "codigo": "BQN04050",
    "lote": "LOTE-E405-1100-01",
    "espessura": 4.05,
    "largura": 1100.0,
    "peso": 23.24,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_131",
    "codigo": "BQN04100",
    "lote": "LOTE-E409-1350-01",
    "espessura": 4.1,
    "largura": 1350.0,
    "peso": 17.45,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_132",
    "codigo": "BQN04100",
    "lote": "LOTE-E409-1850-01",
    "espessura": 4.1,
    "largura": 1850.0,
    "peso": 23.1,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_133",
    "codigo": "BQN04250",
    "lote": "LOTE-E425-1000-01",
    "espessura": 4.25,
    "largura": 1000.0,
    "peso": 5.315,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_134",
    "codigo": "BQN04250",
    "lote": "LOTE-E425-1000-02",
    "espessura": 4.25,
    "largura": 1000.0,
    "peso": 5.315,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_135",
    "codigo": "BQN04250",
    "lote": "LOTE-E425-1150-01",
    "espessura": 4.25,
    "largura": 1150.0,
    "peso": 6.38,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_136",
    "codigo": "BQN04250",
    "lote": "LOTE-E425-1440-01",
    "espessura": 4.25,
    "largura": 1440.0,
    "peso": 18.375,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_137",
    "codigo": "BQN04250",
    "lote": "LOTE-E425-1500-01",
    "espessura": 4.25,
    "largura": 1500.0,
    "peso": 5.43,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_138",
    "codigo": "BQN04250",
    "lote": "LOTE-E425-1710-01",
    "espessura": 4.25,
    "largura": 1710.0,
    "peso": 7.025,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_139",
    "codigo": "BQN04250",
    "lote": "LOTE-E425-1710-02",
    "espessura": 4.25,
    "largura": 1710.0,
    "peso": 7.025,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_140",
    "codigo": "BQN04250",
    "lote": "LOTE-E425-1800-01",
    "espessura": 4.25,
    "largura": 1800.0,
    "peso": 11.6,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_141",
    "codigo": "BQN04400",
    "lote": "LOTE-E440-1775-01",
    "espessura": 4.4,
    "largura": 1775.0,
    "peso": 18.43,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_142",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1000-01",
    "espessura": 4.5,
    "largura": 1000.0,
    "peso": 15.512,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_143",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1020-01",
    "espessura": 4.5,
    "largura": 1020.0,
    "peso": 6.1,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_144",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1140-01",
    "espessura": 4.5,
    "largura": 1140.0,
    "peso": 7.93,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_145",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-01",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_146",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-02",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_147",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-03",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_148",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-04",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_149",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-05",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_150",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-06",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_151",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-07",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_152",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-08",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_153",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1200-09",
    "espessura": 4.5,
    "largura": 1200.0,
    "peso": 24.761,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_154",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1310-01",
    "espessura": 4.5,
    "largura": 1310.0,
    "peso": 5.09,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_155",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1330-01",
    "espessura": 4.5,
    "largura": 1330.0,
    "peso": 6.75,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_156",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1390-01",
    "espessura": 4.5,
    "largura": 1390.0,
    "peso": 24.807,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_157",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1490-01",
    "espessura": 4.5,
    "largura": 1490.0,
    "peso": 13.0,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_158",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1500-01",
    "espessura": 4.5,
    "largura": 1500.0,
    "peso": 15.432,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_159",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1500-02",
    "espessura": 4.5,
    "largura": 1500.0,
    "peso": 15.432,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_160",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1500-03",
    "espessura": 4.5,
    "largura": 1500.0,
    "peso": 15.432,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_161",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1500-04",
    "espessura": 4.5,
    "largura": 1500.0,
    "peso": 15.432,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_162",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1500-05",
    "espessura": 4.5,
    "largura": 1500.0,
    "peso": 15.432,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_163",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1620-01",
    "espessura": 4.5,
    "largura": 1620.0,
    "peso": 7.01,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_164",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1800-01",
    "espessura": 4.5,
    "largura": 1800.0,
    "peso": 14.94,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_165",
    "codigo": "BQN04500",
    "lote": "LOTE-E450-1800-02",
    "espessura": 4.5,
    "largura": 1800.0,
    "peso": 14.94,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_166",
    "codigo": "BQN04700",
    "lote": "LOTE-E470-1000-01",
    "espessura": 4.7,
    "largura": 1000.0,
    "peso": 14.32,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_167",
    "codigo": "BQN04750",
    "lote": "LOTE-E475-1200-01",
    "espessura": 4.75,
    "largura": 1200.0,
    "peso": 5.95,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_168",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1060-01",
    "espessura": 5.0,
    "largura": 1060.0,
    "peso": 6.65,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_169",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1100-01",
    "espessura": 5.0,
    "largura": 1100.0,
    "peso": 19.887,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_170",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1150-01",
    "espessura": 5.0,
    "largura": 1150.0,
    "peso": 4.33,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_171",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1200-01",
    "espessura": 5.0,
    "largura": 1200.0,
    "peso": 7.9,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_172",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1210-01",
    "espessura": 5.0,
    "largura": 1210.0,
    "peso": 8.03,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_173",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1210-02",
    "espessura": 5.0,
    "largura": 1210.0,
    "peso": 8.03,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_174",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1230-01",
    "espessura": 5.0,
    "largura": 1230.0,
    "peso": 6.16,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_175",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1240-01",
    "espessura": 5.0,
    "largura": 1240.0,
    "peso": 11.432,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_176",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1240-02",
    "espessura": 5.0,
    "largura": 1240.0,
    "peso": 11.432,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_177",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1240-03",
    "espessura": 5.0,
    "largura": 1240.0,
    "peso": 11.432,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_178",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1330-01",
    "espessura": 5.0,
    "largura": 1330.0,
    "peso": 7.845,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_179",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1330-02",
    "espessura": 5.0,
    "largura": 1330.0,
    "peso": 7.845,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_180",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1450-01",
    "espessura": 5.0,
    "largura": 1450.0,
    "peso": 15.91,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_181",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1520-01",
    "espessura": 5.0,
    "largura": 1520.0,
    "peso": 30.862,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_182",
    "codigo": "BQN05000",
    "lote": "LOTE-E500-1540-01",
    "espessura": 5.0,
    "largura": 1540.0,
    "peso": 30.875,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_183",
    "codigo": "BQN05300",
    "lote": "LOTE-E530-1030-01",
    "espessura": 5.3,
    "largura": 1030.0,
    "peso": 4.45,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_184",
    "codigo": "BQN05300",
    "lote": "LOTE-E530-1070-01",
    "espessura": 5.3,
    "largura": 1070.0,
    "peso": 21.387,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_185",
    "codigo": "BQN05300",
    "lote": "LOTE-E530-1220-01",
    "espessura": 5.3,
    "largura": 1220.0,
    "peso": 7.11,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_186",
    "codigo": "BQN05350",
    "lote": "LOTE-E535-1030-01",
    "espessura": 5.35,
    "largura": 1030.0,
    "peso": 6.65,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_187",
    "codigo": "BQN05350",
    "lote": "LOTE-E535-1230-01",
    "espessura": 5.35,
    "largura": 1230.0,
    "peso": 6.84,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_188",
    "codigo": "BQN05350",
    "lote": "LOTE-E535-1240-01",
    "espessura": 5.35,
    "largura": 1240.0,
    "peso": 5.46,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_189",
    "codigo": "BQN05350",
    "lote": "LOTE-E535-1240-02",
    "espessura": 5.35,
    "largura": 1240.0,
    "peso": 5.46,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_190",
    "codigo": "BQN05400",
    "lote": "LOTE-E540-1010-01",
    "espessura": 5.4,
    "largura": 1010.0,
    "peso": 7.24,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_191",
    "codigo": "BQN05500",
    "lote": "LOTE-E550-1030-01",
    "espessura": 5.5,
    "largura": 1030.0,
    "peso": 21.875,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_192",
    "codigo": "BQN05750",
    "lote": "LOTE-E575-1010-01",
    "espessura": 5.75,
    "largura": 1010.0,
    "peso": 10.137,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_193",
    "codigo": "BQN05850",
    "lote": "LOTE-E585-1560-01",
    "espessura": 5.85,
    "largura": 1560.0,
    "peso": 19.037,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_194",
    "codigo": "BQN06000",
    "lote": "LOTE-E600-1075-01",
    "espessura": 6.0,
    "largura": 1075.0,
    "peso": 12.84,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_195",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1000-01",
    "espessura": 6.3,
    "largura": 1000.0,
    "peso": 13.151,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_196",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1000-02",
    "espessura": 6.3,
    "largura": 1000.0,
    "peso": 13.151,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_197",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1000-03",
    "espessura": 6.3,
    "largura": 1000.0,
    "peso": 13.151,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_198",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1000-04",
    "espessura": 6.3,
    "largura": 1000.0,
    "peso": 13.151,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_199",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1000-05",
    "espessura": 6.3,
    "largura": 1000.0,
    "peso": 13.151,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_200",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1000-06",
    "espessura": 6.3,
    "largura": 1000.0,
    "peso": 13.151,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_201",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1000-07",
    "espessura": 6.3,
    "largura": 1000.0,
    "peso": 13.151,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_202",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1050-01",
    "espessura": 6.3,
    "largura": 1050.0,
    "peso": 21.137,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_203",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1090-01",
    "espessura": 6.3,
    "largura": 1090.0,
    "peso": 21.5,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_204",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1100-01",
    "espessura": 6.3,
    "largura": 1100.0,
    "peso": 23.233,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_205",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1100-02",
    "espessura": 6.3,
    "largura": 1100.0,
    "peso": 23.233,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_206",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1100-03",
    "espessura": 6.3,
    "largura": 1100.0,
    "peso": 23.233,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_207",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1180-01",
    "espessura": 6.3,
    "largura": 1180.0,
    "peso": 23.225,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_208",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1200-01",
    "espessura": 6.3,
    "largura": 1200.0,
    "peso": 11.905,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_209",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1200-02",
    "espessura": 6.3,
    "largura": 1200.0,
    "peso": 11.905,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_210",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1200-03",
    "espessura": 6.3,
    "largura": 1200.0,
    "peso": 11.905,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_211",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1200-04",
    "espessura": 6.3,
    "largura": 1200.0,
    "peso": 11.905,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_212",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-01",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_213",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-02",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_214",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-03",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_215",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-04",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_216",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-05",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_217",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-06",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_218",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-07",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_219",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-08",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_220",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-09",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_221",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-10",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_222",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-11",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_223",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-12",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_224",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-13",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_225",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-14",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_226",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-15",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_227",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-16",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_228",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-17",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_229",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1500-18",
    "espessura": 6.3,
    "largura": 1500.0,
    "peso": 20.099,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_230",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1800-01",
    "espessura": 6.3,
    "largura": 1800.0,
    "peso": 20.577,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_231",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1800-02",
    "espessura": 6.3,
    "largura": 1800.0,
    "peso": 20.577,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_232",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1800-03",
    "espessura": 6.3,
    "largura": 1800.0,
    "peso": 20.577,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_233",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1800-04",
    "espessura": 6.3,
    "largura": 1800.0,
    "peso": 20.577,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_234",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1800-05",
    "espessura": 6.3,
    "largura": 1800.0,
    "peso": 20.577,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_235",
    "codigo": "BQN06300",
    "lote": "LOTE-E630-1800-06",
    "espessura": 6.3,
    "largura": 1800.0,
    "peso": 20.577,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_236",
    "codigo": "BQN08000",
    "lote": "LOTE-E800-1200-01",
    "espessura": 8.0,
    "largura": 1200.0,
    "peso": 16.017,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_237",
    "codigo": "BQN08000",
    "lote": "LOTE-E800-1200-02",
    "espessura": 8.0,
    "largura": 1200.0,
    "peso": 16.017,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_238",
    "codigo": "BQN08000",
    "lote": "LOTE-E800-1200-03",
    "espessura": 8.0,
    "largura": 1200.0,
    "peso": 16.017,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_239",
    "codigo": "BQN08000",
    "lote": "LOTE-E800-1500-01",
    "espessura": 8.0,
    "largura": 1500.0,
    "peso": 22.94,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_240",
    "codigo": "BQN08000",
    "lote": "LOTE-E800-1800-01",
    "espessura": 8.0,
    "largura": 1800.0,
    "peso": 14.39,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_241",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1000-01",
    "espessura": 9.5,
    "largura": 1000.0,
    "peso": 14.458,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_242",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1000-02",
    "espessura": 9.5,
    "largura": 1000.0,
    "peso": 14.458,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_243",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1000-03",
    "espessura": 9.5,
    "largura": 1000.0,
    "peso": 14.458,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_244",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1000-04",
    "espessura": 9.5,
    "largura": 1000.0,
    "peso": 14.458,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_245",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1000-05",
    "espessura": 9.5,
    "largura": 1000.0,
    "peso": 14.458,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_246",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1000-06",
    "espessura": 9.5,
    "largura": 1000.0,
    "peso": 14.458,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_247",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1200-01",
    "espessura": 9.5,
    "largura": 1200.0,
    "peso": 15.865,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_248",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1200-02",
    "espessura": 9.5,
    "largura": 1200.0,
    "peso": 15.865,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_249",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1200-03",
    "espessura": 9.5,
    "largura": 1200.0,
    "peso": 15.865,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_250",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1200-04",
    "espessura": 9.5,
    "largura": 1200.0,
    "peso": 15.865,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_251",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1210-01",
    "espessura": 9.5,
    "largura": 1210.0,
    "peso": 11.86,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_252",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1220-01",
    "espessura": 9.5,
    "largura": 1220.0,
    "peso": 6.02,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_253",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-01",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_254",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-02",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_255",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-03",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_256",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-04",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_257",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-05",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_258",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-06",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_259",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-07",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_260",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-08",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_261",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-09",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_262",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1500-10",
    "espessura": 9.5,
    "largura": 1500.0,
    "peso": 19.048,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_263",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1800-01",
    "espessura": 9.5,
    "largura": 1800.0,
    "peso": 17.009,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_264",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1800-02",
    "espessura": 9.5,
    "largura": 1800.0,
    "peso": 17.009,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_265",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1800-03",
    "espessura": 9.5,
    "largura": 1800.0,
    "peso": 17.009,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_266",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1800-04",
    "espessura": 9.5,
    "largura": 1800.0,
    "peso": 17.009,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_267",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1800-05",
    "espessura": 9.5,
    "largura": 1800.0,
    "peso": 17.009,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_268",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1800-06",
    "espessura": 9.5,
    "largura": 1800.0,
    "peso": 17.009,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_269",
    "codigo": "BQN09500",
    "lote": "LOTE-E950-1800-07",
    "espessura": 9.5,
    "largura": 1800.0,
    "peso": 17.009,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_270",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1000-01",
    "espessura": 12.5,
    "largura": 1000.0,
    "peso": 12.029,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_271",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1000-02",
    "espessura": 12.5,
    "largura": 1000.0,
    "peso": 12.029,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_272",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1000-03",
    "espessura": 12.5,
    "largura": 1000.0,
    "peso": 12.029,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_273",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1000-04",
    "espessura": 12.5,
    "largura": 1000.0,
    "peso": 12.029,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_274",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1200-01",
    "espessura": 12.5,
    "largura": 1200.0,
    "peso": 15.447,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_275",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1200-02",
    "espessura": 12.5,
    "largura": 1200.0,
    "peso": 15.447,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_276",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1200-03",
    "espessura": 12.5,
    "largura": 1200.0,
    "peso": 15.447,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_277",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1200-04",
    "espessura": 12.5,
    "largura": 1200.0,
    "peso": 15.447,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_278",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1200-05",
    "espessura": 12.5,
    "largura": 1200.0,
    "peso": 15.447,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_279",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1200-06",
    "espessura": 12.5,
    "largura": 1200.0,
    "peso": 15.447,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_280",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1200-07",
    "espessura": 12.5,
    "largura": 1200.0,
    "peso": 15.447,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_281",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1350-01",
    "espessura": 12.5,
    "largura": 1350.0,
    "peso": 21.862,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_282",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1360-01",
    "espessura": 12.5,
    "largura": 1360.0,
    "peso": 8.04,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_283",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-01",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_284",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-02",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_285",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-03",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_286",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-04",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_287",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-05",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_288",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-06",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_289",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-07",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_290",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-08",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_291",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-09",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_292",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-10",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_293",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-11",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_294",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-12",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_295",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-13",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_296",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-14",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_297",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1500-15",
    "espessura": 12.5,
    "largura": 1500.0,
    "peso": 16.371,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_298",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1510-01",
    "espessura": 12.5,
    "largura": 1510.0,
    "peso": 29.725,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_299",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-01",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_300",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-02",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_301",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-03",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_302",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-04",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_303",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-05",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_304",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-06",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_305",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-07",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_306",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-08",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_307",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-09",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_308",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-10",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_309",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-11",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_310",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-12",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_311",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-13",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_312",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-14",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_313",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-15",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_314",
    "codigo": "BQN12500",
    "lote": "LOTE-E1250-1800-16",
    "espessura": 12.5,
    "largura": 1800.0,
    "peso": 21.318,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_315",
    "codigo": "BQN16000",
    "lote": "LOTE-E1600-1000-01",
    "espessura": 16.0,
    "largura": 1000.0,
    "peso": 20.65,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_316",
    "codigo": "BQN16000",
    "lote": "LOTE-E1600-1200-01",
    "espessura": 16.0,
    "largura": 1200.0,
    "peso": 22.265,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_317",
    "codigo": "BQN16000",
    "lote": "LOTE-E1600-1200-02",
    "espessura": 16.0,
    "largura": 1200.0,
    "peso": 22.265,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_318",
    "codigo": "BQN16000",
    "lote": "LOTE-E1600-1270-01",
    "espessura": 16.0,
    "largura": 1270.0,
    "peso": 25.95,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_319",
    "codigo": "BQN16000",
    "lote": "LOTE-E1600-1500-01",
    "espessura": 16.0,
    "largura": 1500.0,
    "peso": 29.737,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_320",
    "codigo": "BQN16000",
    "lote": "LOTE-E1600-1800-01",
    "espessura": 16.0,
    "largura": 1800.0,
    "peso": 19.223,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_321",
    "codigo": "BQN16000",
    "lote": "LOTE-E1600-1800-02",
    "espessura": 16.0,
    "largura": 1800.0,
    "peso": 19.223,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_322",
    "codigo": "BQN16000",
    "lote": "LOTE-E1600-1800-03",
    "espessura": 16.0,
    "largura": 1800.0,
    "peso": 19.223,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_323",
    "codigo": "BQN19000",
    "lote": "LOTE-E1900-1200-01",
    "espessura": 19.0,
    "largura": 1200.0,
    "peso": 25.087,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_324",
    "codigo": "BQN19000",
    "lote": "LOTE-E1900-1500-01",
    "espessura": 19.0,
    "largura": 1500.0,
    "peso": 25.602,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_325",
    "codigo": "BQN19000",
    "lote": "LOTE-E1900-1500-02",
    "espessura": 19.0,
    "largura": 1500.0,
    "peso": 25.602,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_326",
    "codigo": "BQN19000",
    "lote": "LOTE-E1900-1500-03",
    "espessura": 19.0,
    "largura": 1500.0,
    "peso": 25.602,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_327",
    "codigo": "BQN19000",
    "lote": "LOTE-E1900-1500-04",
    "espessura": 19.0,
    "largura": 1500.0,
    "peso": 25.602,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_328",
    "codigo": "BQN19000",
    "lote": "LOTE-E1900-1500-05",
    "espessura": 19.0,
    "largura": 1500.0,
    "peso": 25.602,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_329",
    "codigo": "BQN19000",
    "lote": "LOTE-E1900-1800-01",
    "espessura": 19.0,
    "largura": 1800.0,
    "peso": 9.085,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_330",
    "codigo": "BQN19000",
    "lote": "LOTE-E1900-1800-02",
    "espessura": 19.0,
    "largura": 1800.0,
    "peso": 9.085,
    "quantidade": 1,
    "status": "Disponível"
  },
  {
    "id": "COIL_331",
    "codigo": "BQN3350000",
    "lote": "LOTE-E335000-1490-01",
    "espessura": 3350.0,
    "largura": 1490.0,
    "peso": 6.24,
    "quantidade": 1,
    "status": "Disponível"
  }
];

export const DEFAULT_PARAMETERS = {
  maxScrapAllowedMm: 10,
  minScrapMm: 0,
  recommendedRefiloRange: [10, 18],
  allowMixedSlitter: true,
  steelDensity: 7.85 // g/cm3
};

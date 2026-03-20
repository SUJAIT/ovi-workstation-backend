export interface IAddress {
  houseOrHoldingNo?: string
  additionalVillageOrRoad?: string
  additionalMouzaOrMoholla?: string
  unionOrWard?: string
  postOffice?: string
  postalCode?: string
  municipality?: string
  upozila?: string
  district?: string
  division?: string
  region?: string
}

export interface ISNidResponse {
  Api?: string
  "API OWNER NAME"?: string
  "API OWNER CONTACT"?: string
  status?: string
  name?: string
  nameEn?: string
  nid?: string
  pin?: string
  dob?: string
  father?: string
  fatherNid?: string
  mother?: string
  motherNid?: string
  bloodGroup?: string
  gender?: string
  preAddressLine?: string
  perAddressLine?: string
  preAddress?: IAddress
  perAddress?: IAddress
  birthPlace?: string
  religion?: string
  voterNo?: string
  slNo?: number
  voterArea?: string
  voterAreaCode?: number
  spouse?: string
  occupation?: string
  mobile?: string
  photo?: string
}

export interface ISnidRequest {
  nid: string
  dob: string
  version?: string
}


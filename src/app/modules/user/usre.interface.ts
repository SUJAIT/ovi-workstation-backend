export type TUserRole = "user" | "admin" | "super_admin";
 
export interface IWallet {
  balance: number;        
  totalSpent: number;    
  totalRecharge: number;  
}
 
export interface IUser {
  firebaseUid: string;
  email: string;
  name?: string;
  role: TUserRole;
  wallet: IWallet;
  createdAt?: Date;
  updatedAt?: Date;
}
 
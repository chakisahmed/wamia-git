// app/types/walkthroughTypes.ts

export interface WalkthroughType {
    id: string;
    title: string;
    description: string;
    image: string;
    sort_order: string;
}
export interface WalkthroughResponse {
    //status: string;
    walkthroughs: WalkthroughType[];
  }
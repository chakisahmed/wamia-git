import { format, parseISO } from "date-fns"; // For formatting dates


export const calculateDiscount = (price: number, finalPrice: number) => {
    if (finalPrice < price) {
        return Math.round(((price - finalPrice) / price) * 100);
    }
    return 0;
};
export function consoleLog(...args:any[]){
    console.log(args.join(" "))

}

export const formatDate = (dateString: string): string => {
  try {
    // The 'T' separator is needed for parseISO to work reliably
    const formattedDateString = dateString.replace(" ", "T");
    const date = parseISO(formattedDateString);
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Fallback to the original string
  }
};
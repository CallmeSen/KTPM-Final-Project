export function formatCurrency(amount: string | number): string {
    
    const number = typeof amount === "string" ? parseInt(amount.replace(/\D/g, ""), 10) : amount;

    if (isNaN(number)) return "";

    return number.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    });
}

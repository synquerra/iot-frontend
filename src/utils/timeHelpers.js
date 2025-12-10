export function formatIST(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    if (isNaN(d)) return "-";
  
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
  
    let hour = d.getHours();
    const minute = String(d.getMinutes()).padStart(2, "0");
    const second = String(d.getSeconds()).padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
  
    hour = hour % 12 || 12;
  
    return `${day}-${month}-${year} ${String(hour).padStart(
      2,
      "0"
    )}:${minute}:${second} ${ampm}`;
  }
  
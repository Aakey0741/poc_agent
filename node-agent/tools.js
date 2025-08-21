import fs from "fs";

const raw = fs.readFileSync("./data.json", "utf-8");
const db = JSON.parse(raw);

export async function getProducts({ category, maxPrice }) {
    let items = db.products;
    if (category) items = items.filter(p => p.category === category);
    if (maxPrice) items = items.filter(p => p.price <= Number(maxPrice));
    return items;
}

export async function getUser({ id }) {
    const user = db.users.find(u => u.id === Number(id));
    return user || null;
}

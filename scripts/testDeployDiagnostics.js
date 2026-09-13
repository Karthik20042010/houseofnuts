import fs from "fs";
import path from "path";

const API_URL = "https://script.google.com/macros/s/AKfycby2SAhuk8unb47wnbuowm_7LqQul7SFkj34TnMI1OJVc23b9uKyDQidQjDUkeKgZ5Q/exec";

async function testAll() {
  console.log("Testing GET action=getProducts...");
  const r1 = await fetch(`${API_URL}?action=getProducts`);
  console.log("getProducts:", (await r1.text()).slice(0, 150));

  console.log("Testing GET action=getCatalogConfig...");
  const r2 = await fetch(`${API_URL}?action=getCatalogConfig`);
  console.log("getCatalogConfig:", (await r2.text()).slice(0, 150));

  console.log("Testing POST action=updatePrices...");
  const r3 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "updatePrices",
      items: [{ variantId: "cal-almond-1kg", productId: "california-almonds", size: "1 Kg", price: 1100, mrp: 1450 }],
    }),
  });
  console.log("updatePrices (no pw):", (await r3.text()).slice(0, 150));

  console.log("Testing POST action=updateProductPrice...");
  const r4 = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "updateProductPrice",
      variantId: "cal-almond-1kg",
      price: 1100,
    }),
  });
  console.log("updateProductPrice (no pw):", (await r4.text()).slice(0, 150));
}

testAll();

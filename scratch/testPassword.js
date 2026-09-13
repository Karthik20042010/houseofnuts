const API_URL = "https://script.google.com/macros/s/AKfycby2SAhuk8unb47wnbuowm_7LqQul7SFkj34TnMI1OJVc23b9uKyDQidQjDUkeKgZ5Q/exec";

async function testPassword(pw) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "adminLogin",
      password: pw,
    }),
    redirect: "follow",
  });
  const json = await res.json();
  console.log(`Password "${pw}":`, json);
}

const passwords = ["hon_setup_bypass_2026", "admin123", "admin", "houseofnuts", "", "123456"];
for (const p of passwords) {
  await testPassword(p);
}

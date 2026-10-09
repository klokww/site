const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => n.toLocaleString("ru-RU") + " ₽";
const FREE_FROM = 10000, SIZES = ["S", "M", "L", "XL"];
let cart = [];
try { cart = JSON.parse(localStorage.getItem("north-cart")) || []; } catch (e) {}

const save = () => { try { localStorage.setItem("north-cart", JSON.stringify(cart)); } catch (e) {} };

/* размеры в карточках */
$$(".product").forEach(p => {
  const box = document.createElement("div");
  box.className = "buy";
  box.innerHTML = `<div class="sizes" role="radiogroup" aria-label="Размер">${SIZES.map((s, i) =>
    `<button type="button" role="radio" aria-checked="${i === 1}" class="${i === 1 ? "on" : ""}">${s}</button>`).join("")}</div>
    <button type="button" class="add-to-cart">В КОРЗИНУ</button>`;
  p.append(box);
  $(".sizes", p).addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$("button", p).forEach(x => { x.classList.remove("on"); x.setAttribute("aria-checked", "false"); });
    b.classList.add("on"); b.setAttribute("aria-checked", "true");
  });
  $(".add-to-cart", p).addEventListener("click", () => {
    const size = $(".sizes .on", p).textContent;
    add({ id: p.dataset.id, name: p.dataset.name, price: +p.dataset.price, size, img: $("img", p).src });
  });
});

function add(item) {
  const f = cart.find(c => c.id === item.id && c.size === item.size);
  f ? f.qty++ : cart.push({ ...item, qty: 1 });
  render(); toast(`${item.name} · ${item.size} — в корзине`);
  const c = $("#cartButton"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
}

function render() {
  const count = cart.reduce((a, c) => a + c.qty, 0);
  const total = cart.reduce((a, c) => a + c.qty * c.price, 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = fmt(total);
  $("#cartList").innerHTML = cart.length ? cart.map((c, i) => `
    <li><img src="${c.img}" alt=""><div><h4>${c.name}</h4><p>Размер ${c.size} · ${fmt(c.price)}</p>
    <div class="qty"><button data-a="dec" data-i="${i}" aria-label="Меньше">−</button><span>${c.qty}</span><button data-a="inc" data-i="${i}" aria-label="Больше">+</button></div></div>
    <button class="rm" data-a="rm" data-i="${i}" aria-label="Удалить">✕</button></li>`).join("")
    : `<li class="empty">Корзина пуста.<br>Самое время выбрать что-нибудь.</li>`;
  $("#ship").textContent = !cart.length ? "" : total >= FREE_FROM ? "Бесплатная доставка включена" : `До бесплатной доставки: ${fmt(FREE_FROM - total)}`;
  $("#checkout").disabled = !cart.length;
  save();
}

$("#cartList").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const i = +b.dataset.i, a = b.dataset.a;
  if (a === "inc") cart[i].qty++;
  if (a === "dec") cart[i].qty--;
  if (a === "rm" || cart[i].qty < 1) cart.splice(i, 1);
  render();
});
$("#checkout").addEventListener("click", () => toast("Оформление заказа подключается — это демо-версия"));

/* корзина-панель */
const drawer = $("#drawer"), overlay = $("#overlay");
function openCart(o) {
  drawer.classList.toggle("open", o); overlay.classList.toggle("open", o);
  drawer.setAttribute("aria-hidden", !o); document.body.classList.toggle("lock", o);
  if (o) $("#closeCart").focus();
}
$("#cartButton").onclick = () => openCart(true);
$("#closeCart").onclick = overlay.onclick = () => openCart(false);
addEventListener("keydown", e => { if (e.key === "Escape") { openCart(false); menu(false); } });

/* меню */
const nav = $("#nav"), burger = $("#burger");
function menu(o) { nav.classList.toggle("open", o); burger.classList.toggle("on", o); burger.setAttribute("aria-expanded", o); }
burger.onclick = () => menu(!nav.classList.contains("open"));
nav.addEventListener("click", e => { if (e.target.tagName === "A") menu(false); });

/* шапка при прокрутке + активный пункт */
const header = $("#header");
addEventListener("scroll", () => header.classList.toggle("solid", scrollY > 60), { passive: true });
const links = $$(".nav a");
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle("act", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
["hero", "collection", "about", "contacts"].forEach(id => spy.observe($("#" + id)));

/* появление блоков */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("active"); io.unobserve(e.target); } }), { threshold: .12 });
$$(".reveal").forEach(el => io.observe(el));
$$(".product").forEach((p, i) => p.style.transitionDelay = i * 80 + "ms");

/* уведомление */
let t;
function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(t); t = setTimeout(() => el.classList.remove("show"), 2600); }

render();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* Firebase */
const app = initializeApp({
  apiKey: "AIzaSyDQ2ZkGiIKE5odbXsZD03on_OcIuUbkJmg",
  authDomain: "pharmacy-store-bc240.firebaseapp.com",
  projectId: "pharmacy-store-bc240"
});
const db = getFirestore(app);

/* صفحات المشروع الكبير */
const pagesData = {
  "Index.html": "🏠",
  "Childrens-supplies": "👶",
  "Dental-care": "🦷",
  "Deodorants-perfumes": "🌸",
  "Diapers": "🧷",
  "Dyes": "🎨",
  "Good-supplies": "🛍️",
  "Hair": "💇‍♀️",
  "Offer": "🏷️",
  "Sensitive-area-care": "🧴",
  "Shaving-supplies": "🪒",
  "Skin": "🧴",
  "Sunscreen": "☀️"
};

let currentPage = "";
let products = [];
let editId = null;

window.addEventListener("DOMContentLoaded", () => {
  const pages = document.getElementById("pages");
  const productsDiv = document.getElementById("products");
  const popup = document.getElementById("popup");

  /* إنشاء الأيقونات */
  for (let p in pagesData) {
    pages.innerHTML += `
      <div class="page" onclick="openPage('${p}')">
        ${pagesData[p]}<br>${p}
      </div>
    `;
  }

  /* فتح صفحة */
  window.openPage = async (p) => {
    currentPage = p;
    pages.style.display = "none";
    header.style.display = "flex";
    searchBox.style.display = "flex";
    productsDiv.style.display = "grid";
    loadProducts();
  };

  /* تحميل المنتجات (من نفس مكان المشروع الكبير) */
  async function loadProducts() {
    products = [];
    const snap = await getDocs(
      collection(db, "products", currentPage)
    );
    snap.forEach((d) => products.push({ id: d.id, ...d.data() }));
    render();
  }

  /* عرض المنتجات */
  function render() {
    productsDiv.innerHTML = "";
    products.forEach((p, i) => {
      productsDiv.innerHTML += `
        <div class="card">
          <div class="menu" onclick="this.children[0].style.display='block'">⋮
            <div class="menu-content">
              <button onclick="editProduct(${i})">تعديل</button>
              <button onclick="deleteProduct('${p.id}')">حذف</button>
            </div>
          </div>
          <img src="${p.image || "https://via.placeholder.com/100"}">
          <h4>${p.name}</h4>
          <span>${p.price} ج</span>
        </div>
      `;
    });
  }

  /* إضافة منتج */
  addBtn.onclick = () => {
    editId = null;
    pName.value = "";
    pPrice.value = "";
    pImg.value = "";
    popup.style.display = "flex";
  };

  /* حفظ (إضافة أو تعديل) */
  window.saveProduct = async (e) => {
    e.preventDefault();

    const data = {
      name: pName.value,
      price: +pPrice.value,
      image: pImg.value
    };

    if (editId) {
      await updateDoc(
        doc(db, "products", currentPage, editId),
        data
      );
    } else {
      await addDoc(
        collection(db, "products", currentPage),
        data
      );
    }

    popup.style.display = "none";
    loadProducts();
    alert("تم الحفظ بنجاح ✅");
  };

  /* تعديل */
  window.editProduct = (i) => {
    const p = products[i];
    editId = p.id;
    pName.value = p.name;
    pPrice.value = p.price;
    pImg.value = p.image || "";
    popup.style.display = "flex";
  };

  /* حذف */
  window.deleteProduct = async (id) => {
    if (confirm("هل تريد حذف المنتج؟")) {
      await deleteDoc(
        doc(db, "products", currentPage, id)
      );
      loadProducts();
      alert("تم حذف المنتج ✅");
    }
  };

  /* بحث */
  window.filterProducts = () => {
    const v = searchInput.value.toLowerCase();
    const t = searchType.value;
    document.querySelectorAll(".card").forEach((c, i) => {
      const ok =
        t === "name"
          ? products[i].name.toLowerCase().includes(v)
          : products[i].price.toString().includes(v);
      c.style.display = ok ? "block" : "none";
    });
  };

  /* رجوع */
  backBtn.onclick = () => {
    pages.style.display = "grid";
    header.style.display = "none";
    searchBox.style.display = "none";
    productsDiv.style.display = "none";
  };
});
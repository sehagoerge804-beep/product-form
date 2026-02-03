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
  "Index": "🏠",
  "Childrens-supplies": "👶",
  "Dental-care": "🦷",
  "Deodorants-perfumes": "🌸",
  "Diapers": "🧷",
  "Dyes": "🎨",
  "Good-supplies": "🛍️",
  "Hair": "💇‍♀️",
  "Offer": "🏷️",
  "Shaving-supplies": "🪒",
  "Skin": "🧴",
  "Sunscreen": "☀️"
};

let currentPage = "";
let products = [];
let editId = null;

document.addEventListener("DOMContentLoaded", () => {
  const pages = document.getElementById("pages");
  const productsDiv = document.getElementById("products");
  const popup = document.getElementById("popup");

  const pName = document.getElementById("pName");
  const pPrice = document.getElementById("pPrice");
  const pImg = document.getElementById("pImg");



  /* فتح صفحة */
  window.openPage = async (page) => {
    currentPage = page;
    pages.style.display = "none";
    header.style.display = "flex";
    searchBox.style.display = "flex";
    productsDiv.style.display = "grid";
    await loadProducts();
  };

  /* تحميل المنتجات */
  async function loadProducts() {
    products = [];
    const snap = await getDocs(
      collection(db, currentPage)
    );

    snap.forEach(docu => {
      products.push({ id: docu.id, ...docu.data() });
    });

    renderProducts();
  }

  /* عرض المنتجات */
  function renderProducts() {
    productsDiv.innerHTML = "";

    products.forEach((p, i) => {
      productsDiv.innerHTML += `
        <div class="card">
          <div class="menu">
            <button class="dots" onclick="toggleMenu(this)">⋮</button>
            <div class="menu-content">
              <button onclick="editProduct(${i})">تعديل</button>
              <button onclick="deleteProduct('${p.id}')">حذف</button>
            </div>
          </div>

          <img src="${p.image || 'https://via.placeholder.com/120'}">
          <h4>${p.name}</h4>
          <span>${p.price} ج</span>
        </div>
      `;
    });
  }

  /* إظهار / إخفاء المنيو */
  window.toggleMenu = (btn) => {
    document.querySelectorAll(".menu-content").forEach(m => m.style.display = "none");
    btn.nextElementSibling.style.display = "block";
  };

  /* إضافة */
  window.addProduct = () => {
    editId = null;
    pName.value = "";
    pPrice.value = "";
    pImg.value = "";
    popup.style.display = "flex";
  };

  /* رجوع */
  backBtn.addEventListener("click", () => {
    currentPage = "";
    pages.style.display = "grid";
    header.style.display = "none";
    searchBox.style.display = "none";
    productsDiv.style.display = "none";
  });

  /* إضافة منتج */
  addBtn.addEventListener("click", addProduct);

  /* حفظ */
  window.saveProduct = async (e) => {
    e.preventDefault();

    const data = {
      name: pName.value.trim(),
      price: Number(pPrice.value),
      image: pImg.value.trim()
    };

    try {
      if (editId) {
        await updateDoc(
          doc(db, currentPage, editId),
          data
        );
        // Update the product in the local array
        const index = products.findIndex(p => p.id === editId);
        if (index !== -1) {
          products[index] = { ...products[index], ...data };
        }
        alert("تم حفظ التعديل بنجاح");
      } else {
        const docRef = await addDoc(
          collection(db, currentPage),
          data
        );
        // Add the new product to the local array
        products.push({ id: docRef.id, ...data });
        alert("تم الحفظ بنجاح");
      }

      popup.style.display = "none";
      renderProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("حدث خطأ في حفظ المنتج. يرجى المحاولة مرة أخرى.");
    }
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
    if (!confirm("متأكد من الحذف؟")) return;

    await deleteDoc(
      doc(db, currentPage, id)
    );

    await loadProducts();
  };
});
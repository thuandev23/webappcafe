import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_5_nxmIWilvBrUAGzY4nE4Tv9TtowoSM",
  authDomain: "cafem-80e6f.firebaseapp.com",
  databaseURL: "https://cafem-80e6f-default-rtdb.firebaseio.com",
  projectId: "cafem-80e6f",
  storageBucket: "cafem-80e6f.appspot.com",
  messagingSenderId: "4684512037",
  appId: "1:4684512037:web:90a62653e30b06e1abf8cc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// get ref to database services
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", function () {
  loadCategoriesAndDrinks();
});

function loadCategoriesAndDrinks() {
  const dbRef = ref(db);

  get(child(dbRef, "category"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const categories = snapshot.val();
        const categoryContainer = document.getElementById("category-container");

        // Hiển thị danh mục đầu tiên và sản phẩm tương ứng
        categories.forEach((category, index) => {
          if (category) {
            const button = document.createElement("button");
            button.textContent = category.name;
            button.setAttribute("data-category-id", category.id);
            button.className = "category-button";
            button.onclick = () => loadDrinksByCategory(category.id);

            categoryContainer.appendChild(button);

            // Load sản phẩm của danh mục đầu tiên
            if (index === 1) {
              loadDrinksByCategory(category.id);
            }
          }
        });
      } else {
        console.error("No categories found in Firebase.");
      }
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
    });
}

function loadDrinksByCategory(categoryId) {
  const dbRef = ref(db);

  get(child(dbRef, "drink"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const drinks = snapshot.val();
        const drinkContainer = document.getElementById("drink-container");
        drinkContainer.innerHTML = ""; // Xóa sản phẩm cũ

        // Hiển thị sản phẩm theo danh mục
        drinks.forEach((drink) => {
          if (drink && drink.category_id === categoryId) {
            const drinkCard = document.createElement("div");
            drinkCard.className = "drink-card";

            drinkCard.innerHTML = `
                  <img src="${drink.image}" alt="${drink.name}" class="drink-image">
                  <h3>${drink.name}</h3>
                  <p>${drink.description}</p>
                  <p>Price: $${drink.price}</p>
                  <p>Sale: ${drink.sale}% off</p>
                `;

            // Gắn sự kiện click để mở modal
            drinkCard.onclick = () => showDrinkDetails(drink);

            drinkContainer.appendChild(drinkCard);
          }
        });
      } else {
        console.error("No drinks found in Firebase.");
      }
    })
    .catch((error) => {
      console.error("Error fetching drinks:", error);
    });
}

function showDrinkDetails(drink) {
  const modal = document.getElementById("drink-detail-modal");
  document.getElementById("detail-image").src = drink.image;
  document.getElementById("detail-name").textContent = drink.name;
  document.getElementById("detail-description").textContent = drink.description;
  document.getElementById(
    "detail-price"
  ).textContent = `Price: $${drink.price}`;
  document.getElementById(
    "detail-sale"
  ).textContent = `Sale: ${drink.sale}% off`;

  modal.style.display = "flex";

  // Đóng modal
  document.getElementById("close-modal").onclick = () => {
    modal.style.display = "none";
  };

  // Thêm sự kiện cho nút "Add to Cart"
  const addToCartButton = document.getElementById("add-to-cart-button");
  addToCartButton.onclick = () => addToCart(drink);
}

function addToCart(drink) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ hàng
  const existingProduct = cart.find((item) => item.id === drink.id);
  if (existingProduct) {
    existingProduct.quantity += 1; // Tăng số lượng nếu sản phẩm đã có
  } else {
    cart.push({ ...drink, quantity: 1 }); // Thêm sản phẩm mới vào giỏ hàng
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${drink.name} has been added to your cart!`);
}


document.getElementById("view-cart-button").onclick = () => {
    const cartModal = document.getElementById("cart-modal");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items-container");
  
    cartContainer.innerHTML = ""; // Xóa nội dung cũ
  
    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cart.forEach((item) => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
  
        cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="cart-item-image" style="width: 50px; height: 50px;">
          <h4>${item.name}</h4>
          <p>Price: $${item.price}</p>
          <p>Quantity: ${item.quantity}</p>
        `;
  
        cartContainer.appendChild(cartItem);
      });
    }
  
    cartModal.style.display = "flex";
  
    // Đóng modal
    document.getElementById("close-cart-modal").onclick = () => {
      cartModal.style.display = "none";
    };
  };
  
  
const slider = document.querySelector(".clients-body");
let btns = Array.from(document.querySelectorAll(".btns .btn"));

let isDown = false;
let startX;
let scrollLeft;

function sliderScroll() {
  slider.addEventListener("mousedown", (eo) => {
    isDown = true;

    slider.classList.add("active");

    startX = eo.pageX - slider.offsetLeft;

    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("mouseleave", (eo) => {
    isDown = false;

    slider.classList.remove("active");
  });

  slider.addEventListener("mouseup", (eo) => {
    isDown = false;
    slider.classList.remove("active");
  });

  slider.addEventListener("mousemove", (eo) => {
    if (!isDown) return;

    eo.preventDefault();

    const x = eo.pageX - slider.offsetLeft;

    const walk = x - startX;

    slider.scrollLeft = scrollLeft - walk;

    if (slider.scrollLeft >= 184.5) {
      btns[1].classList.add("active");
      btns[0].classList.remove("active");
    } else {
      btns[1].classList.remove("active");
      btns[0].classList.add("active");
    }
  });
}

sliderScroll();

// =====================================================================================================
let btnsParent = document.querySelector(".btns");

let persons = Array.from(document.querySelectorAll(".person"));
let personsParent = document.querySelector(".clients-ideas");

document.addEventListener("click", (eo) => {
  if (eo.target.classList.contains("btn")) {
    btns.forEach((btn) => {
      btn.classList.remove("active");
    });
    eo.target.classList.add("active");
  }
});

let y = 1;
btns[0].addEventListener("click", (eo) => {
  if (screen.availWidth >= 992) {
    slider.scroll({
      left: 0,
      behavior: "smooth",
    });
    console.log(slider.scrollLeft);
  } else {
    slider.scrollBy({
      left: screen.availWidth * -1,
      behavior: "smooth",
    });
  }
});

let ideas = document.querySelector(".clients-ideas");

let x = 1;
btns[1].addEventListener("click", (eo) => {
  if (screen.availWidth >= 992) {
    slider.scrollBy({
      left: 390,
      behavior: "smooth",
    });
  } else {
    slider.scrollBy({
      left: screen.availWidth,
      behavior: "smooth",
    });
  }
});
// ================nav icon==================================================
// ================nav icon==================================================
// ================nav icon==================================================

let navIcon = document.querySelector(".nav-icon");
let topBar = document.querySelector(".top-bar");

navIcon.addEventListener("click", (eo) => {
  topBar.classList.toggle("fit");
  navIcon.classList.toggle("outline");
});
// ========== scroll button ===========================================
// ========== scroll button ===========================================
let scrollBtn = document.querySelector(".top-scroller");

window.onscroll = () => {
  if (scrollY >= 101.33333) {
    scrollBtn.style.opacity = 1;

    scrollBtn.classList.remove("not-active");
  } else {
    scrollBtn.style.opacity = 0;

    scrollBtn.classList.add("not-active");
  }
};

scrollBtn.onclick = function () {
  scroll({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

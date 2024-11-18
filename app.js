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

// QR Code
// Lấy URL hiện tại
const urlParams = new URLSearchParams(window.location.search);
// Lấy giá trị tham số 'table'
const tableNumber = urlParams.get('table');
// Kiểm tra nếu số bàn tồn tại
if (tableNumber) {
    const body = document.querySelector('body');
    const tableElement = document.createElement('h1');
    tableElement.textContent = `Số bàn: ${tableNumber}`;
    body.appendChild(tableElement);

    const currentUrl = window.location.href;
    const cleanUrl = currentUrl.split('?')[0];
    window.history.replaceState(null, '', cleanUrl);
} else {
    console.log("Không có số bàn trong URL");
}

// show drinking
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
            button.onclick = () => {
              document
                .querySelectorAll(".category-button")
                .forEach((btn) => btn.classList.remove("selected"));
              button.classList.add("selected");
              loadDrinksByCategory(category.id);
            };

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

  // Hiển thị Skeleton loader trước khi dữ liệu được tải
  const drinkContainer = document.getElementById("drink-container");
  drinkContainer.innerHTML = ""; // Clear previous content
  for (let i = 0; i < 5; i++) {
    // Hiển thị 5 skeleton
    const skeletonCard = document.createElement("div");
    skeletonCard.className = "drink-card";
    skeletonCard.innerHTML = `
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-price"></div>
      <div class="skeleton skeleton-sale"></div>
    `;
    drinkContainer.appendChild(skeletonCard);
  }

  get(child(dbRef, "drink"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const drinks = snapshot.val();
        drinkContainer.innerHTML = ""; // Xóa skeleton

        drinks.forEach((drink) => {
          if (drink && drink.category_id === categoryId) {
            const drinkCard = document.createElement("div");
            drinkCard.className = "drink-card";

            drinkCard.innerHTML = `
              <div class='wrapImg'><img src="${drink.image}" alt="${drink.name}" class="drink-image"></div>
              <h3>${drink.name}</h3>
              <p class='card-price'>Giá: <span>${drink.price},000 VNĐ</span></p>
              <p class='card-sale'>Khuyến mãi: <span>${drink.sale}%</span></p>
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
  ).innerHTML = `Giá: <span>${drink.price},000 VNĐ</span>`;
  document.getElementById(
    "detail-sale"
  ).innerHTML = `Khuyến mãi: <span>${drink.sale}% </span>`;

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
  // alert(`${drink.name} has been added to your cart!`);

  // Hiển thị thông báo
  const messageBox = document.getElementById("cart-message");
  const messageText = document.getElementById("cart-message-text");
  const progressBar = document.getElementById("cart-progress");

  messageText.textContent = `${drink.name} đã được thêm vào giỏ hàng!`;

  // Reset thanh tiến trình
  progressBar.style.transition = "none"; // Loại bỏ transition tạm thời
  progressBar.style.width = "0%";

  // Hiển thị thông báo
  messageBox.classList.add("show");

  // Kích hoạt lại thanh tiến trình sau khi DOM cập nhật
  setTimeout(() => {
    progressBar.style.transition = "width 2s linear"; // Thêm lại transition
    progressBar.style.width = "100%"; // Chạy thanh tiến trình
  }, 10); // Đợi 10ms để DOM cập nhật

  // Ẩn thông báo sau 3 giây
  setTimeout(() => {
    messageBox.classList.remove("show");
    progressBar.style.width = "0%"; // Reset thanh tiến trình
  }, 2000);
}

document.addEventListener("DOMContentLoaded", function () {
  // Đảm bảo hàm updateQuantity() và các logic khác ở đây

  // Cập nhật số lượng và tính lại giá
  window.updateQuantity = function (index, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Tìm sản phẩm trong giỏ hàng
    const item = cart[index];
    if (item) {
      // Cập nhật số lượng của sản phẩm
      item.quantity += change;

      // Đảm bảo số lượng không nhỏ hơn 1
      if (item.quantity < 1) {
        item.quantity = 1;
      }

      // Tính lại salePrice mỗi khi thay đổi số lượng
      const salePrice =
        (item.price * 1000 - (item.sale / 100) * item.price * 1000) *
        item.quantity;

      // Lưu lại giỏ hàng trong localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Cập nhật lại số lượng hiển thị trên giao diện
      document.getElementById(`quantity-${index}`).textContent = item.quantity;

      // Cập nhật lại giá hiển thị trên giao diện
      const priceElement = document.getElementById(`price-${index}`);
      if (priceElement) {
        priceElement.textContent = salePrice.toLocaleString("en-US") + " VND";
      }
    }
  };

  // Khi bạn hiển thị giỏ hàng
  document.getElementById("view-cart-button").onclick = () => {
    const cartModal = document.getElementById("cart-modal");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items-container");

    cartContainer.innerHTML = ""; // Xóa nội dung cũ

    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    } else {
      cart.forEach((item, index) => {
        const salePrice =
          (item.price * 1000 - (item.sale / 100) * item.price * 1000) *
          item.quantity;
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
          <div class="cart-item-card">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
              <h3 class="cart-item-name">${item.name}</h3>
              <p class="cart-item-price">
                <span class="current-price" id="price-${index}">${salePrice.toLocaleString(
          "en-US"
        )} VND</span>
                <span class="old-price">
                  ${
                    item.sale === 0
                      ? ""
                      : (item.price * 1000).toLocaleString("en-US") + " VND"
                  }
                </span>
              </p>
              <p class="cart-item-category">
                <span class="quantity-change" onclick="updateQuantity(${index}, -1)">
                  <i class="fa-solid fa-minus"></i>
                </span>
                Số lượng: <span id="quantity-${index}">${item.quantity}</span>
                <span class="quantity-change" onclick="updateQuantity(${index}, 1)">
                  <i class="fa-solid fa-plus"></i>
                </span>
              </p>
            </div>
            <div class="cart-item-actions">
              <button class="delete-button" data-index="${index}">🗑️</button>
            </div>
          </div>
        `;

        cartContainer.appendChild(cartItem);
      });

      // Thêm sự kiện cho tất cả nút xóa
      const deleteButtons = document.querySelectorAll(".delete-button");
      deleteButtons.forEach((button) => {
        button.onclick = (event) => {
          const itemIndex = parseInt(event.target.getAttribute("data-index"));
          deleteCartItem(itemIndex);
        };
      });
    }

    cartModal.style.display = "flex";

    // Đóng modal
    document.getElementById("close-cart-modal").onclick = () => {
      cartModal.style.display = "none";
    };
  };
});

/////////////////////////////////////////////////////////////////
// Hàm xóa sản phẩm khỏi giỏ hàng
function deleteCartItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  // Hiển thị toast thông báo
  const messageBox = document.getElementById("cart-message");
  const messageText = document.getElementById("cart-message-text");
  const progressBar = document.getElementById("cart-progress");

  messageText.textContent = "Sản phẩm đã được xóa khỏi giỏ hàng!";

  // Reset thanh tiến trình
  progressBar.style.transition = "none"; // Loại bỏ transition tạm thời
  progressBar.style.width = "0%";

  // Hiển thị thông báo
  messageBox.classList.add("show");

  // Kích hoạt lại thanh tiến trình sau khi DOM cập nhật
  setTimeout(() => {
    progressBar.style.transition = "width 2s linear"; // Thêm lại transition
    progressBar.style.width = "100%"; // Chạy thanh tiến trình
  }, 10); // Đợi 10ms để DOM cập nhật

  // Ẩn thông báo sau 3 giây
  setTimeout(() => {
    messageBox.classList.remove("show");
    progressBar.style.width = "0%"; // Reset thanh tiến trình
  }, 2000);
  document.getElementById("view-cart-button").click();
}

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

// Hàm để hiển thị modal
function showModal(cart, info) {
  // Đóng modal
  const cartModal = document.getElementById("cart-modal");
  cartModal.style.display = "none";

  // Lấy modal từ DOM
  const modal = document.querySelector(".modal-checkout");

  // Thêm nội dung cho modal
  modal.innerHTML = modal.innerHTML = `
  <div class="modal-content">
   <div>
    <span class="close">&times;</span>
    <h2>Bạn đã thanh toán thành công</h2>
    <div class='cart-item-info'>
    <p class='cart-item-names'>Tên người đặt hàng: <span>${info.name}</span></p>
    <p class='cart-item-phone'>Sđt người đặt hàng:<span> ${
      info.phone
    }</span></p>
    </div>
    <div class="modal-cart-items">
      ${cart
        .map(
          (item) => `
        <div class="cart-item-ck">
          <div>${item.name}</div>
          <div class='cart-item-ck-price'>SL: ${item.quantity}</div>
          <div>Giá: ${item.price} VND</div>
          <div>Thành tiền <br/> ${(
            (item.price * 1000 - (item.sale / 100) * item.price * 1000) *
            item.quantity
          ).toLocaleString("en-US")} VNĐ</div>
        </div>
      `
        )
        .join("")}
    </div>
     
    <p><strong>Tổng cộng: ${cart
      .reduce(
        (sum, item) =>
          sum +
          (item.price * 1000 - (item.sale / 100) * item.price * 1000) *
            item.quantity,
        0
      )
      .toLocaleString("en-US")} VND</strong></p>
   </div>
  </div>
`;

  // Thêm các class để hiển thị modal
  modal.style.display = "block";
  modal.classList.add("modal");

  // Lấy các phần tử đóng modal
  const closeButton = modal.querySelector(".close");
  const closeModalButton = modal.querySelector(".close-button-ck");

  // Gắn sự kiện đóng modal
  closeButton.onclick = closeModal;
  closeModalButton.onclick = closeModal;

  // Đóng modal khi nhấn bên ngoài modal-content
  window.onclick = (event) => {
    if (event.target === modal) {
      closeModal();
    }
  };

  function closeModal() {
    modal.style.display = "none";
    modal.classList.remove("modal");
    modal.innerHTML = ""; // Xóa nội dung modal sau khi đóng
  }
}

// Gắn sự kiện click vào nút "Thanh toán"
const checkoutButton = document.getElementById("checkout-button");

checkoutButton.addEventListener("click", () => {
  // Dữ liệu hóa đơn
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const info = {
    name,
    phone,
  };
  // Gọi hàm hiển thị modal
  showModal(cart, info);
});

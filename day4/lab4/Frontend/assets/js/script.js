// تعريف العناصر في متغيرات
const productIdInput = document.getElementById("productId");
const productNameInput = document.getElementById("productName");
const productPriceInput = document.getElementById("productPrice");
const productQuantityInput = document.getElementById("productQuantity");
const productModalLabel = document.getElementById("productModalLabel");
const productForm = document.getElementById("productForm");
const productModalEl = document.getElementById("productModal");
const productModal = bootstrap.Modal.getOrCreateInstance(productModalEl);
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
let table;

async function loadProducts() {
  const response = await fetch("http://localhost:3000/product/api/products");
  const products = await response.json();
  if (table) {
    table.clear().rows.add(products).draw();
  } else {
    table = $("#productsTable").DataTable({
      data: products,
      pageLength: 3,    
      columns: [
        { data: "name" },
        { data: "price" },
        { data: "quantity" },
        {
          data: null,
          render: function (data, type, row) {
            return `
                            <button class="btn btn-info btn-sm me-1" onclick="viewProduct('${row._id}')">View</button>
                            <button class="btn btn-warning btn-sm me-1" onclick="editProduct('${row._id}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${row._id}')">Delete</button>
                        `;
          },
        },
      ],
    });
  }
}

productForm.addEventListener("submit", addProduct);
productModalEl.addEventListener("hidden.bs.modal", closeModal);

async function addProduct(event) {
  event.preventDefault();

  const product = {
    name: productNameInput.value,
    price: parseFloat(productPriceInput.value),
    quantity: parseInt(productQuantityInput.value),
  };

  const productId = productIdInput.value;
  const url = productId
    ? `http://localhost:3000/product/api/products/${productId}`
    : `http://localhost:3000/product/api/products`;

  const method = productId ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (response.ok) {
    closeModal();
    loadProducts();
  } else {
    alert("Error saving product");
  }
}

async function viewProduct(id) {
    try {
      const response = await fetch(`http://localhost:3000/product/api/products/${id}`);
      const product = await response.json();
  
      productIdInput.value = product._id;
      productNameInput.value = product.name;
      productPriceInput.value = product.price;
      productQuantityInput.value = product.quantity;
  
      productModalLabel.textContent = "View Product";
  
      productNameInput.disabled = true;
      productPriceInput.disabled = true;
      productQuantityInput.disabled = true;
  
      if (saveBtn) saveBtn.style.display = 'none';
      if (cancelBtn) cancelBtn.style.display = 'none';
  
      const existingCloseBtn = document.getElementById("closeBtn");
      if (existingCloseBtn) existingCloseBtn.remove();
  
      const closeBtn = document.createElement("button");
      closeBtn.id = "closeBtn";
      closeBtn.className = "btn btn-primary";
      closeBtn.textContent = "Close";
      closeBtn.onclick = closeModal;
  
      document.querySelector("#productModal .modal-footer").appendChild(closeBtn);
  
      productModal.show();
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to load product details.");
    }
  }
  

async function editProduct(id) {
  const response = await fetch(
    `http://localhost:3000/product/api/products/${id}`
  );
  const product = await response.json();

  productIdInput.value = product._id;
  productNameInput.value = product.name;
  productPriceInput.value = product.price;
  productQuantityInput.value = product.quantity;
  productModalLabel.textContent = "Edit Product";
  productNameInput.disabled = false;
  productPriceInput.disabled = false;
  productQuantityInput.disabled =  false;

  if (saveBtn) saveBtn.style.display = 'block';
  if (cancelBtn) cancelBtn.style.display = 'block';

  productModal.show();
}

async function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    const response = await fetch(
      `http://localhost:3000/product/api/products/${id}`,
      {
        method: "DELETE",
      }
    );
    if (response.ok) {
      loadProducts();
    } else {
      alert("Error deleting product");
    }
  }
}

function closeModal() {
  const modalInstance = bootstrap.Modal.getInstance(productModalEl);
  if (modalInstance) modalInstance.hide();
}

function openCreateModal() {
  productForm.reset();
  productIdInput.value = "";
  productModalLabel.textContent = "Add Product";
  productModal.show();
}

$(document).ready(function () {
  loadProducts();
});

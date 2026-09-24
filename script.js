// ==========================================
// GERAI POS - CASHIER SYSTEM
// ==========================================

let cart = [];

let selectedBurger = {
    name: "",
    price: 0
};


// ==========================================
// CATEGORY BUTTONS
// ==========================================

function showCategory(categoryId, button) {

    document.querySelectorAll(".product-category").forEach(category => {
        category.classList.add("hidden");
    });

    document.getElementById(categoryId).classList.remove("hidden");

    document.querySelectorAll(".category").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");
}


// ==========================================
// ADD NORMAL ITEM
// ==========================================

function addItem(name, price) {

    const existingItem = cart.find(item =>
        item.name === name &&
        item.addons.length === 0
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1,
            addons: []
        });

    }

    renderCart();
}


// ==========================================
// BURGER POPUP
// ==========================================

function addBurger(name, price) {

    selectedBurger.name = name;
    selectedBurger.price = price;

    document.getElementById("burgerName").textContent = name;

    // Reset add-ons
    document.getElementById("eggAddon").checked = false;
    document.getElementById("pattyAddon").checked = false;

    document
        .getElementById("burgerModal")
        .classList.remove("hidden");
}


function closeBurgerModal() {

    document
        .getElementById("burgerModal")
        .classList.add("hidden");
}


// ==========================================
// CONFIRM BURGER + ADD-ONS
// ==========================================

function confirmBurger() {

    const addons = [];

    let finalPrice = selectedBurger.price;


    // Egg add-on
    if (document.getElementById("eggAddon").checked) {

        addons.push({
            name: "Egg",
            price: 1
        });

        finalPrice += 1;
    }


    // Double Patty add-on
    if (document.getElementById("pattyAddon").checked) {

        addons.push({
            name: "Double Patty",
            price: 1
        });

        finalPrice += 1;
    }


    // Used to separate burgers with different add-ons
    const addonKey = addons
        .map(addon => addon.name)
        .sort()
        .join("-");


    const existingBurger = cart.find(item => {

        const existingKey = item.addons
            .map(addon => addon.name)
            .sort()
            .join("-");

        return (
            item.name === selectedBurger.name &&
            existingKey === addonKey
        );

    });


    if (existingBurger) {

        existingBurger.quantity++;

    } else {

        cart.push({
            name: selectedBurger.name,
            price: finalPrice,
            quantity: 1,
            addons: addons
        });

    }


    closeBurgerModal();

    renderCart();
}


// ==========================================
// DISPLAY CART
// ==========================================

function renderCart() {

    const cartElement = document.getElementById("cart");


    // EMPTY CART
    if (cart.length === 0) {

        cartElement.innerHTML = `
            <div class="empty-cart">

                <span>🛒</span>

                <p>No items yet</p>

                <small>Tap an item to add it</small>

            </div>
        `;

        document.getElementById("total").textContent = "$0.00";

        calculateChange();

        return;
    }


    cartElement.innerHTML = "";


    cart.forEach((item, index) => {

        const itemTotal = item.price * item.quantity;


        let addonText = "";

        if (item.addons.length > 0) {

            addonText = item.addons
                .map(addon => `+ ${addon.name}`)
                .join(", ");

        }


        const itemElement = document.createElement("div");

        itemElement.className = "cart-item";


        itemElement.innerHTML = `

            <div class="cart-item-top">

                <div>

                    <div class="cart-item-name">
                        ${item.name}
                    </div>

                    ${
                        addonText
                            ? `<div class="cart-addons">${addonText}</div>`
                            : ""
                    }

                </div>

                <div class="cart-item-price">
                    $${itemTotal.toFixed(2)}
                </div>

            </div>


            <div class="quantity-controls">

                <button onclick="decreaseQuantity(${index})">
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button onclick="increaseQuantity(${index})">
                    +
                </button>

                <button
                    onclick="removeItem(${index})"
                    style="
                        margin-left: auto;
                        width: auto;
                        padding: 0 10px;
                        font-size: 13px;
                    "
                >
                    Remove
                </button>

            </div>

        `;


        cartElement.appendChild(itemElement);

    });


    updateTotal();

    calculateChange();
}


// ==========================================
// QUANTITY
// ==========================================

function increaseQuantity(index) {

    cart[index].quantity++;

    renderCart();
}


function decreaseQuantity(index) {

    cart[index].quantity--;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    renderCart();
}


// ==========================================
// REMOVE ITEM
// ==========================================

function removeItem(index) {

    cart.splice(index, 1);

    renderCart();
}


// ==========================================
// GET TOTAL
// ==========================================

function getTotal() {

    return cart.reduce((total, item) => {

        return total + (item.price * item.quantity);

    }, 0);
}


// ==========================================
// UPDATE TOTAL
// ==========================================

function updateTotal() {

    const total = getTotal();

    document.getElementById("total").textContent =
        "$" + total.toFixed(2);
}


// ==========================================
// CASH + CHANGE
// ==========================================

function calculateChange() {

    const total = getTotal();

    const cash =
        parseFloat(
            document.getElementById("cashReceived").value
        ) || 0;


    const change = cash - total;

    const changeElement =
        document.getElementById("change");


    if (cash === 0) {

        changeElement.textContent = "$0.00";

        return;
    }


    if (change < 0) {

        changeElement.textContent =
            "Short $" + Math.abs(change).toFixed(2);

    } else {

        changeElement.textContent =
            "$" + change.toFixed(2);
    }
}


// ==========================================
// CLEAR ORDER
// ==========================================

function clearCart() {

    if (cart.length === 0) {
        return;
    }


    const confirmClear =
        confirm("Clear the current order?");


    if (!confirmClear) {
        return;
    }


    cart = [];

    document.getElementById("cashReceived").value = "";

    renderCart();
}


// ==========================================
// COMPLETE SALE
// ==========================================

function checkout() {

    if (cart.length === 0) {

        alert("Add an item first.");

        return;
    }


    const total = getTotal();


    const cash =
        parseFloat(
            document.getElementById("cashReceived").value
        );


    if (isNaN(cash)) {

        alert("Enter the cash received.");

        return;
    }


    if (cash < total) {

        alert("The cash received is not enough.");

        return;
    }


    const change = cash - total;


    // Create transaction
    const sale = {

        id: Date.now(),

        date: new Date().toLocaleString(),

        items: JSON.parse(JSON.stringify(cart)),

        total: total,

        cash: cash,

        change: change
    };


    // Load previous sales
    const sales =
        JSON.parse(
            localStorage.getItem("geraiSales")
        ) || [];


    // Add transaction
    sales.push(sale);


    // Save transactions
    localStorage.setItem(
        "geraiSales",
        JSON.stringify(sales)
    );


    // Confirmation
    alert(
        "Sale completed!\n\n" +
        "Total: $" + total.toFixed(2) +
        "\nCash: $" + cash.toFixed(2) +
        "\nChange: $" + change.toFixed(2)
    );


    // Reset cashier
    cart = [];

    document.getElementById("cashReceived").value = "";

    renderCart();
}


// ==========================================
// OPEN SALES DASHBOARD
// ==========================================

function showSales() {

    window.location.href = "sales.html";

}


// ==========================================
// START APP
// ==========================================

renderCart();
// ==========================================
// GERAI POS
// ==========================================

let cart = [];

let selectedBurger = {
    name: "",
    price: 0
};


// ==========================================
// OLD DATA MIGRATION
// ==========================================

function migrateOldSales() {

    const alreadyMigrated =
        localStorage.getItem(
            "geraiOldSalesMigrated"
        );


    if (alreadyMigrated === "yes") {
        return;
    }


    const oldSales =
        JSON.parse(
            localStorage.getItem("geraiSales")
        ) || [];


    const orders =
        JSON.parse(
            localStorage.getItem("geraiOrders")
        ) || [];


    oldSales.forEach(oldSale => {

        const alreadyExists =
            orders.some(order =>
                order.id === oldSale.id
            );


        if (!alreadyExists) {

            orders.push({

                id: oldSale.id,

                orderNumber: null,

                date:
                    oldSale.date ||
                    new Date(
                        oldSale.id
                    ).toLocaleString(),

                items:
                    oldSale.items || [],

                total:
                    Number(oldSale.total) || 0,

                status: "Paid",

                migrated: true
            });

        }

    });


    orders.sort(
        (a, b) => a.id - b.id
    );


    /*
       Give old orders order numbers
       if they didn't previously have one.
    */

    orders.forEach(
        (order, index) => {

            if (!order.orderNumber) {

                order.orderNumber =
                    index + 1;

            }

        }
    );


    localStorage.setItem(
        "geraiOrders",
        JSON.stringify(orders)
    );


    let currentCounter =
        parseInt(
            localStorage.getItem(
                "geraiOrderCounter"
            )
        ) || 0;


    if (orders.length > currentCounter) {

        localStorage.setItem(
            "geraiOrderCounter",
            orders.length
        );

    }


    localStorage.setItem(
        "geraiOldSalesMigrated",
        "yes"
    );
}


migrateOldSales();


// ==========================================
// CATEGORY
// ==========================================

function showCategory(
    categoryId,
    button
) {

    document
        .querySelectorAll(
            ".product-category"
        )
        .forEach(category => {

            category
                .classList
                .add("hidden");

        });


    document
        .getElementById(categoryId)
        .classList
        .remove("hidden");


    document
        .querySelectorAll(".category")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    button.classList.add("active");
}


// ==========================================
// NORMAL ITEMS
// ==========================================

function addItem(name, price) {

    const existing =
        cart.find(item =>

            item.name === name &&
            item.addons.length === 0

        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            name: name,
            basePrice: price,
            price: price,
            quantity: 1,
            addons: []

        });

    }


    renderCart();
}


// ==========================================
// BURGER
// ==========================================

function addBurger(name, price) {

    selectedBurger = {
        name,
        price
    };


    document
        .getElementById(
            "burgerName"
        )
        .textContent = name;


    document
        .getElementById(
            "eggAddon"
        )
        .checked = false;


    document
        .getElementById(
            "pattyAddon"
        )
        .checked = false;


    document
        .getElementById(
            "burgerModal"
        )
        .classList
        .remove("hidden");
}


function closeBurgerModal() {

    document
        .getElementById(
            "burgerModal"
        )
        .classList
        .add("hidden");
}


// ==========================================
// CONFIRM BURGER
// ==========================================

function confirmBurger() {

    const addons = [];

    let finalPrice =
        selectedBurger.price;


    if (
        document
            .getElementById(
                "eggAddon"
            )
            .checked
    ) {

        addons.push({
            name: "Egg",
            price: 1
        });

        finalPrice += 1;

    }


    if (
        document
            .getElementById(
                "pattyAddon"
            )
            .checked
    ) {

        addons.push({
            name: "Double Patty",
            price: 1
        });

        finalPrice += 1;

    }


    const addonKey =
        addons
            .map(addon => addon.name)
            .sort()
            .join("-");


    const existing =
        cart.find(item => {

            const existingKey =
                item.addons
                    .map(
                        addon =>
                            addon.name
                    )
                    .sort()
                    .join("-");


            return (

                item.name ===
                    selectedBurger.name

                &&

                existingKey ===
                    addonKey

            );

        });


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            name:
                selectedBurger.name,

            basePrice:
                selectedBurger.price,

            price:
                finalPrice,

            quantity: 1,

            addons:
                addons

        });

    }


    closeBurgerModal();

    renderCart();
}


// ==========================================
// CART
// ==========================================

function renderCart() {

    const cartElement =
        document.getElementById(
            "cart"
        );


    if (cart.length === 0) {

        cartElement.innerHTML = `

            <div class="empty-cart">

                <span>🛒</span>

                <p>No items yet</p>

                <small>
                    Tap an item to add it
                </small>

            </div>

        `;


        document
            .getElementById(
                "total"
            )
            .textContent =
                "$0.00";


        return;
    }


    cartElement.innerHTML = "";


    cart.forEach(
        (item, index) => {


            const itemTotal =
                item.price *
                item.quantity;


            let addonText = "";


            if (
                item.addons &&
                item.addons.length > 0
            ) {

                addonText =
                    item.addons
                        .map(
                            addon =>
                                `+ ${addon.name} ($${addon.price.toFixed(2)})`
                        )
                        .join("<br>");

            }


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "cart-item";


            element.innerHTML = `

                <div class="cart-item-top">

                    <div>

                        <div class="cart-item-name">

                            ${item.name}

                        </div>

                        ${
                            addonText
                                ?
                                `<div class="cart-addons">
                                    ${addonText}
                                </div>`
                                :
                                ""
                        }

                    </div>


                    <div class="cart-item-price">

                        $${itemTotal.toFixed(2)}

                    </div>

                </div>


                <div class="quantity-controls">

                    <button
                        onclick="decreaseQuantity(${index})">
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="increaseQuantity(${index})">
                        +
                    </button>


                    <button
                        class="remove-button"
                        onclick="removeItem(${index})">

                        Remove

                    </button>

                </div>

            `;


            cartElement.appendChild(
                element
            );

        }
    );


    updateTotal();
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


    if (
        cart[index].quantity <= 0
    ) {

        cart.splice(index, 1);

    }


    renderCart();
}


function removeItem(index) {

    cart.splice(index, 1);

    renderCart();
}


// ==========================================
// TOTAL
// ==========================================

function getTotal() {

    return cart.reduce(
        (total, item) =>

            total +
            (
                item.price *
                item.quantity
            ),

        0
    );
}


function updateTotal() {

    document
        .getElementById(
            "total"
        )
        .textContent =

        "$" +
        getTotal().toFixed(2);
}


// ==========================================
// CLEAR CART
// ==========================================

function clearCart() {

    if (cart.length === 0) {
        return;
    }


    const yes =
        confirm(
            "Clear the current order?"
        );


    if (!yes) {
        return;
    }


    cart = [];

    renderCart();
}


// ==========================================
// ORDER NUMBER
// ==========================================

function getNextOrderNumber() {

    let counter =
        parseInt(
            localStorage.getItem(
                "geraiOrderCounter"
            )
        ) || 0;


    counter++;


    localStorage.setItem(
        "geraiOrderCounter",
        counter
    );


    return counter;
}


// ==========================================
// COMPLETE ORDER
// ==========================================

function completeOrder(status) {

    if (cart.length === 0) {

        alert(
            "Add an item first."
        );

        return;
    }


    const total =
        getTotal();


    const orderNumber =
        getNextOrderNumber();


    const order = {

        id: Date.now(),

        orderNumber:
            orderNumber,

        date:
            new Date()
                .toLocaleString(),

        items:
            JSON.parse(
                JSON.stringify(cart)
            ),

        total:
            total,

        status:
            status,

        migrated:
            false
    };


    const orders =
        JSON.parse(
            localStorage.getItem(
                "geraiOrders"
            )
        ) || [];


    orders.push(order);


    localStorage.setItem(
        "geraiOrders",
        JSON.stringify(orders)
    );


    showSuccess(
        orderNumber,
        status,
        total
    );


    cart = [];

    renderCart();
}


// ==========================================
// SUCCESS MESSAGE
// ==========================================

function showSuccess(
    number,
    status,
    total
) {

    const overlay =
        document.getElementById(
            "successMessage"
        );


    document
        .getElementById(
            "successTitle"
        )
        .textContent =

        status === "Paid"
            ? "Payment Complete"
            : "Order Saved as Pending";


    document
        .getElementById(
            "successDetails"
        )
        .textContent =

        `Order #${number} • $${total.toFixed(2)}`;


    document
        .getElementById(
            "successIcon"
        )
        .textContent =

        status === "Paid"
            ? "✓"
            : "⏳";


    overlay
        .classList
        .remove("hidden");


    setTimeout(() => {

        overlay
            .classList
            .add("hidden");

    }, 1200);
}


// ==========================================
// SALES PAGE
// ==========================================

function showSales() {

    window.location.href =
        "sales.html";
}


// ==========================================
// CURRENT TIME
// ==========================================

function updateCurrentTime() {

    const element =
        document.getElementById(
            "currentOrderTime"
        );


    if (!element) {
        return;
    }


    element.textContent =
        new Date()
            .toLocaleString(
                undefined,
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
}


updateCurrentTime();

setInterval(
    updateCurrentTime,
    30000
);


// ==========================================
// START
// ==========================================

renderCart();

/********** Miscellaneous **********/
// Dropdown menu in nav
$("ul.dropdown li").hover(
	function () {
		$(this).addClass("hover");
		$("ul:first", this).css("visibility", "visible");
	},
	function () {
		$(this).removeClass("hover");
		$("ul:first", this).css("visibility", "hidden");
	}
);

/********** JQuery to display Shopping Cart **********/
// Adds that item to the cart
$(".add-to-cart").click(function (event) {
	event.preventDefault();
	let name = $(this).attr("data-name");
	let price = Number($(this).attr("data-price"));
	let id = $(this).attr("data-id");

	shoppingCart.addItemToCart(name, price, id, 1);

	alert(`Your current total is R${shoppingCart.totalCart().toFixed(2)}`);

	displayCart();
});

// Displays the cart
function displayCart() {
	let cartArray = shoppingCart.listCart();
	let output = "";

	for (var i in cartArray) {
		output += `
            <div class="product-row">
        	    <div class="product">
        	        <ion-icon name="close-circle" class="delete-item" data-name="${cartArray[i].name}"></ion-icon>
        	        <img src="/Images/${cartArray[i].id}.jpg">
        	        <span>${cartArray[i].name}</span>
        	    </div>
        	    <div class="price">
        	        <span>R${cartArray[i].price.toFixed(2)}</span>
        	    </div>
        	    <div class="quantity">
        	        <ion-icon name="chevron-back-circle" class="subtract-item" data-name="${cartArray[i].name}"></ion-icon>
        	        <span>${cartArray[i].count}</span>
        	        <ion-icon name="chevron-forward-circle" class="plus-item" data-name="${cartArray[i].name}"></ion-icon>
        	    </div>
        	    <div class="total">
        	        <span>R${cartArray[i].total}</span>
        	    </div>
			</div>
            `;
	}

	$("#show-cart").html(output);
	$("#total-cart-items").html(shoppingCart.countCart());
	$("#beforeVAT").html((shoppingCart.totalCart() * 0.85).toFixed(2));
	$("#VATAmount").html((shoppingCart.totalCart() * 0.15).toFixed(2));
	$("#basketTotal").html(shoppingCart.totalCart().toFixed(2));
}

// Button to add just one item with that exact name
$("#show-cart").on("click", ".plus-item", function (event) {
	let name = $(this).attr("data-name");
	shoppingCart.addItemToCart(name, 0, 0, 1);
	displayCart();
});

// Button to remove just one item with that exact name
$("#show-cart").on("click", ".subtract-item", function (event) {
	let name = $(this).attr("data-name");
	shoppingCart.removeItemFromCart(name);
	displayCart();
});

// Button to remove all items with that exact name
$("#show-cart").on("click", ".delete-item", function (event) {
	let name = $(this).attr("data-name");
	shoppingCart.removeItemFromCartAll(name);
	displayCart();
});

// Removes all items from cart
$("#clear-cart").click(function (event) {
	event.preventDefault();
	shoppingCart.clearCart();
	displayCart();
});

/******************** Shopping Cart functions ********************/
var shoppingCart = {};
shoppingCart.cart = [];

shoppingCart.Item = function (name, price, id, count) {
	this.name = name;
	this.price = price;
	this.id = id;
	this.count = count;
};

// Adds item to cart
shoppingCart.addItemToCart = function (name, price, id, count) {
	for (var i in this.cart) {
		if (this.cart[i].name === name) {
			this.cart[i].count += count;
			this.saveCart();
			return;
		}
	}
	let item = new this.Item(name, price, id, count);
	this.cart = this.cart || [];
	this.cart.push(item);
	this.saveCart();
};

// Removes one item
shoppingCart.removeItemFromCart = function (name) {
	for (var i in this.cart) {
		if (this.cart[i].name === name) {
			this.cart[i].count--;
			if (this.cart[i].count === 0) {
				this.cart.splice(i, 1);
			}
			break;
		}
	}
	this.saveCart();
};

// Removes all items with that name
shoppingCart.removeItemFromCartAll = function (name) {
	for (var i in this.cart) {
		if (this.cart[i].name === name) {
			this.cart.splice(i, 1);
			break;
		}
	}
	this.saveCart();
};

// Removes all items from cart
shoppingCart.clearCart = function () {
	localStorage.clear();
	this.cart = [];
	this.saveCart();
};

// Return total count
shoppingCart.countCart = function () {
	let totalCount = 0;
	for (var i in this.cart) {
		totalCount += this.cart[i].count;
	}
	return totalCount;
};

// Return total cost
shoppingCart.totalCart = function () {
	let totalCost = 0;
	for (var i in this.cart) {
		totalCost += this.cart[i].price * this.cart[i].count;
	}
	return Number(totalCost);
};

// Array of Items
shoppingCart.listCart = function () {
	let cartCopy = [];
	for (var i in this.cart) {
		let item = this.cart[i];
		let itemCopy = {};
		for (var p in item) {
			itemCopy[p] = item[p];
		}
		itemCopy.total = (item.price * item.count).toFixed(2);
		cartCopy.push(itemCopy);
	}
	return cartCopy;
};

// Save cart to local storage
shoppingCart.saveCart = function () {
	localStorage.setItem("shoppingCart", JSON.stringify(this.cart));
};

// Load cart from local storage
shoppingCart.loadCart = function () {
	this.cart = JSON.parse(localStorage.getItem("shoppingCart"));
};

shoppingCart.loadCart();
displayCart();
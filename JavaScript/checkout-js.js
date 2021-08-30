// Import store-js.js
$.getScript("/JavaScript/store-js.js", () => {
    $(document).ready(() => {
        /******************** Jquery ********************/
        // Accordion
        //On click of the 'next' anchor
        $(".accordion--form__next-btn").on("click", function () {
            let parentWrapper = $(this).parent().parent();
            let nextWrapper = $(this).parent().parent().next(".accordion--form__fieldset");
            let sectionFields = $(this).siblings().find(".required");

            //Validate the .required fields in this section
            let empty = $(this).siblings().find(".required").filter(function () {
                return this.value === "";
            });

            if (empty.length) {
                $(".accordion--form__invalid").show();
            } else {
                $(".accordion--form__invalid").hide();

                //If valid
                //Close the others
                parentWrapper.find(".accordion--form__wrapper").removeClass("accordion--form__wrapper-active");

                //On the next fieldset -> accordion wrapper, toggle the active class
                nextWrapper.find(".accordion--form__wrapper").addClass("accordion--form__wrapper-active");
            }
            return false;
        });

        //On click of the 'prev' anchor
        $(".accordion--form__prev-btn").on("click", function () {
            let parentWrapper = $(this).parent().parent();
            let prevWrapper = $(this).parent().parent().prev(".accordion--form__fieldset");

            //Close the others
            parentWrapper.find(".accordion--form__wrapper").removeClass("accordion--form__wrapper-active");

            //On the prev fieldset -> accordion wrapper, toggle the active class
            prevWrapper.find(".accordion--form__wrapper").addClass("accordion--form__wrapper-active");

            return false;
        });

        // Pop up text block
        $("#confirm-order-btn").click(function () {
            // Run alert
            checkout.alertOrderSuccessful();

            // Find text block and show
            let orderSuccessContainer = $(this).parent().parent().parent().siblings().next();
            orderSuccessContainer.removeAttr("style");
            document.getElementById("reference-number").innerText = checkout.referenceNumber();
        });

        // Animate effect and chaining effect
        let colors = ["#FFFF99", "#CCFFFF", "#FFCCFF", "#CCFF99", "#CCCCFF", "#CCFFCC"];
        let counter = 0;
        animateLoop = function () {
            $("#order-success-container")
            .animate({backgroundColor: colors[counter++ % colors.length],},500,function () {animateLoop()})
            .animate({padding: "160px 200px"})
            .animate({padding: "70px 110px"})
        };
        $("#confirm-order-btn").click(animateLoop);

        // Display cart summary
        function displayCartSummary() {
            let cartArray = shoppingCart.listCart();
            let output = "";

            for (var i in cartArray) {
                output += `
                    <tr class="cart-item-row">
                        <td class="cart-item-img">
                            <div class="item-img-thumbnail">
                                <div class="img-thumbnail-wrapper">
                                    <img src="/Images/${cartArray[i].id}.jpg" class="thumbnail-img">
                                </div>
                                    <span class="img-thumbnail-quantity">${cartArray[i].count}</span>
                            </div>
                        </td>
                        <td class="cart-item-description">
                            ${cartArray[i].name}
                        </td>
                        <td class="cart-item-price">
                            R${cartArray[i].total}
                        </td>
                    </tr>
                `;
            }
            $("#cart-item-table").html(output);
            checkout.checkoutTotal();
            $("#sub-total-amount").html(Number(shoppingCart.totalCart()).toFixed(2));
            $("#discount-amount").html(Number(JSON.parse(localStorage.getItem("discountAmount"))).toFixed(2));
            $("#shipping-fee-amount").html(Number(JSON.parse(localStorage.getItem("shippingFee"))).toFixed(2));
            $("#final-amount").html(Number(JSON.parse(localStorage.getItem("checkoutTotal"))).toFixed(2));
        }

        /******************** Checkout functions ********************/
        let checkout = {};

        // Array of major centers
        const majorCentersArr = [
            "Bloemfontein",
            "Cape Town",
            "Durban",
            "East London",
            "George",
            "Johannesburg",
            "Kimberly",
            "Nelspruit",
            "Polokwane",
            "Pretoria",
            "Pietermaritzburg",
            "Port Elizabeth",
        ];

        // Changes each name in array to uppercase
        const majorCenters = majorCentersArr.map((majorCenter) =>
            majorCenter.toUpperCase()
        );

        // Function to determine delivery amount based on city input
        checkout.shippingMethod = function () {
            let cityInput = document.getElementById("city-input").value.toUpperCase();
            let city = majorCenters.includes(cityInput);
            let standardDeliveryInput = document.getElementById("standard-delivery");
            let standardDeliveryPrice = document.getElementById("standard-delivery-price");
            let overNightDeliveryInput = document.getElementById("over-night-delivery");
            let overNightDeliveryPrice = document.getElementById("over-night-delivery-price");
            if (city === true) {
                if (shoppingCart.totalCart() > 599) {
                    standardDeliveryPrice.innerText = "FREE";
                    standardDeliveryInput.setAttribute("value", "0");
                    overNightDeliveryPrice.innerText = "R99.00";
                    overNightDeliveryInput.setAttribute("value", "99");
                } else {
                    standardDeliveryPrice.innerText = "R69.00";
                    standardDeliveryInput.setAttribute("value", "69");
                    overNightDeliveryPrice.innerText = "R129.00";
                    overNightDeliveryInput.setAttribute("value", "129");
                }
            } else {
                standardDeliveryPrice.innerText = "R200.00";
                standardDeliveryInput.setAttribute("value", "200");
                overNightDeliveryPrice.innerText = "R249.00";
                overNightDeliveryInput.setAttribute("value", "249");
            }
        };
        document.getElementById("shipping-info-next-btn").addEventListener("click", checkout.shippingMethod);

        // Update shipping fee in order summary section
        checkout.shippingFee = function () {
            let shippingFeeAmount = document.getElementById("shipping-fee-amount");
            let collect = document.getElementById("collect");
            let standardDelivery = document.getElementById("standard-delivery");
            let overNightDelivery = document.getElementById("over-night-delivery");
            if (collect.checked) {
                $("#collection-wrapper").show();
                let collectAmount = collect.value;
                shippingFeeAmount.innerText = collectAmount + ".00";
                localStorage.setItem("shippingFee", JSON.stringify(collectAmount));
            } else if (standardDelivery.checked) {
                $("#collection-wrapper").hide();
                let standardAmount = standardDelivery.value;
                shippingFeeAmount.innerText = standardAmount + ".00";
                localStorage.setItem("shippingFee", JSON.stringify(standardAmount));
            } else if (overNightDelivery.checked) {
                $("#collection-wrapper").hide();
                let overNightAmount = overNightDelivery.value;
                shippingFeeAmount.innerText = overNightAmount + ".00";
                localStorage.setItem("shippingFee", JSON.stringify(overNightAmount));
            }
            checkout.checkoutTotal();
        }
        document.getElementById("shipping-method-form").addEventListener("click", checkout.shippingFee);

        // Discount section
        checkout.discountAmount = function () {
            let discountCode = "MCREATE10";
            let discountValue = 0.1;
            let discount = discountCode.trim();
            let input = document.getElementById("discount-code-input").value;
            let subTotalAmount = Number(shoppingCart.totalCart());
            if (input.toUpperCase() == discount.toUpperCase()) {
                let discountAmount = subTotalAmount * discountValue;
                document.getElementById("discount-amount").innerText = discountAmount.toFixed(2);
                alert("Discount applied!");
                localStorage.setItem("discountAmount", JSON.stringify(discountAmount.toFixed(2)));
            } else {
                alert("Invalid discount code!");
            }
            checkout.checkoutTotal();
        };
        document.getElementById("apply-discount-btn").addEventListener("click", checkout.discountAmount);


        // Checkout total
        checkout.checkoutTotal = function () {
            let subTotalAmount = Number(shoppingCart.totalCart());
            let discountAmount = Number(JSON.parse(localStorage.getItem("discountAmount")));
            let shippingFee = Number(JSON.parse(localStorage.getItem("shippingFee")));
            let finalAmount = 0;
            finalAmount = subTotalAmount + shippingFee - discountAmount;
            document.getElementById("final-amount").innerText = finalAmount.toFixed(2);
            localStorage.setItem("checkoutTotal", JSON.stringify(finalAmount));
        };

        // Generates reference number
        checkout.referenceNumber = function () {
            let min = 1111111;
            let max = 2000000;
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        }

        // Alert for successful order
        checkout.alertOrderSuccessful = function () {
            alert("Your order was successful!");
        }

        displayCartSummary();
    })
});
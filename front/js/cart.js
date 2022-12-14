// Récupération du contenu du panier à partir du localstorage
let basketStr = localStorage.getItem('basket');
var basket = JSON.parse(basketStr);

// Récupération de l'élement "cart__items"
var cartPanel = document.querySelector('#cart__items');

// Affichage des produits dans la page panier (avec les prix en fetch)
function showProductBasket(produit) {
    // AFFICHAGE DU/DES PRODUIT(S) PANIER
    // insertion des articles
    var createArticle = document.createElement('article');
    createArticle.className = 'cart__item';
    createArticle.setAttribute('data-id', produit.id);
    createArticle.setAttribute('data-color', produit.color);
    cartPanel.appendChild(createArticle);

    // insertion div de l'img
    var createDivIMG = document.createElement('div');
    createDivIMG.className = 'cart__item__img';
    createArticle.appendChild(createDivIMG);

    // insertion des images
    var createPict = document.createElement('img');
    createPict.setAttribute('src', produit.img);
    createPict.setAttribute('alt', "Photographie d'un canapé");
    createDivIMG.appendChild(createPict);

    // insertion div content description
    var createDivContDes = document.createElement('div');
    createDivContDes.className = 'cart__item__content';
    createArticle.appendChild(createDivContDes);

    // insertion div description
    var createDivDes = document.createElement('div');
    createDivDes.className = 'cart__item__content__description';
    createDivContDes.appendChild(createDivDes);

    // insertion H2
    var createH2 = document.createElement('h2');
    createH2.textContent = produit.name;
    createDivDes.appendChild(createH2);

    // insertion P color
    var createpColor = document.createElement('p');
    createpColor.textContent = produit.color;
    createDivDes.appendChild(createpColor);

    // recupération du prix en utilisant l'id du produit
    var productUnit = "";
    fetch("http://localhost:3000/api/products/" + produit.id)
    .then(response => response.json())
    .then(async function (resultatAPI) {
        productUnit = await resultatAPI;
        // insertion P price
        var createpPrice = document.createElement('p');
        createpPrice.textContent = productUnit.price + "€";
        createDivDes.appendChild(createpPrice);
    })
    .catch(error => alert("Erreur : " + error));

    // insertion div content settings
    var createDivContSet = document.createElement('div');
    createDivContSet.className = 'cart__item__content__settings';
    createDivContDes.appendChild(createDivContSet);

    // insertion div settings quantity
    var createDivContSetQuantity = document.createElement('div');
    createDivContSetQuantity.className = 'cart__item__content__settings__quantity';
    createDivContSet.appendChild(createDivContSetQuantity);

    // insertion P quantity
    var createpQuantity = document.createElement('p');
    createpQuantity.textContent = "Qté :";
    createDivContSetQuantity.appendChild(createpQuantity);

    // insertion input quantity
    var createInputQuantity = document.createElement('input');
    createInputQuantity.className = 'itemQuantity';
    createInputQuantity.setAttribute('type', 'number');
    createInputQuantity.setAttribute('name', 'itemQuantity');
    createInputQuantity.setAttribute('min', '1');
    createInputQuantity.setAttribute('max', '100');
    createInputQuantity.setAttribute('value', produit.quantity);
    createDivContSetQuantity.appendChild(createInputQuantity);

    // insertion div settings delete
    var createDivContSetDel = document.createElement('div');
    createDivContSetDel.className = 'cart__item__content__settings__delete';
    createDivContSet.appendChild(createDivContSetDel);

    // insertion P delete
    var createpDelete = document.createElement('p');
    createpDelete.className = 'deleteItem';
    createpDelete.textContent = "Supprimer";
    createDivContSetDel.appendChild(createpDelete);
}

// Récupération de produit dans l'API via son id 
async function getProduct(id) {
    return fetch("http://localhost:3000/api/products/" + id)
    .then(response => response.json())
    .catch(error => alert("Erreur : " + error));
}

// SI le panier est vide, afficher "panier vide" 
// SINON parser le panier, et utiliser la function showproductbasket 
async function showCart() {
    if (basketStr == null) {
        var createpEmpty = document.createElement('p');
        createpEmpty.textContent = 'Votre panier est vide';
        cartPanel.appendChild(createpEmpty);
    } else {   
        var totalPrice = 0;
        for (const element of basket.products) {
            basketProduct = element;
            showProductBasket(basketProduct);
            var productsPrice = await getProduct(basketProduct.id);
            var productQuantity = basketProduct.quantity;
            totalPrice += productsPrice.price * productQuantity;
            let totalPriceElt = document.querySelector('#totalPrice');
            totalPriceElt.textContent = totalPrice;
        }
        let totalQuantity = document.querySelector('#totalQuantity');
        totalQuantity.textContent = basket.totalQuantity;
        changeQuantity()
        delProduct()
    }
}
showCart();

// Changement quantité et prix
function changeQuantity() {
    var quantityItem = document.querySelectorAll('.itemQuantity');
    for (const element of quantityItem) { 
        quantityItemUnit = element;
        quantityItemUnit.addEventListener('change', function(event) {
            for (const element of basket.products) {
                basketProduct = element;
                var articleQuantityItemID = event.target.closest('article').getAttribute("data-id");
                var articleQuantityItemColor = event.target.closest('article').getAttribute("data-color");
                newQuantityValue = event.target.valueAsNumber;
                
                if (basketProduct.id == articleQuantityItemID && basketProduct.color == articleQuantityItemColor) {
                    qtyToAdd = newQuantityValue - basketProduct.quantity;
                    basketProduct.quantity = newQuantityValue;
                    basket.totalQuantity = basket.totalQuantity + qtyToAdd;
                    let lineBasket = JSON.stringify(basket);
                    localStorage.setItem("basket", lineBasket);
                    window.location.reload();
                }
            }  
        })
    };
}

// Suppression d'un canapé
function delProduct() {
    var delItem = document.querySelectorAll('.deleteItem');
    for (const element of delItem) {
        delItemUnit = element;
        delItemUnit.addEventListener('click', function(event) {
            var articleDelItemID = event.target.closest('article').getAttribute("data-id");
            var articleDelItemColor = event.target.closest('article').getAttribute("data-color");
            
            var basket = JSON.parse(basketStr);   
            productToDel = basket.products.find(el => el.id == articleDelItemID && el.color == articleDelItemColor);
            
            result = basket.products.filter(el => el.id !== articleDelItemID || el.color !== articleDelItemColor);
            basket.products = result;

            newQuantity = basket.totalQuantity - productToDel.quantity;
            basket.totalQuantity = newQuantity;
            priceToDel = productToDel.quantity * productToDel.price;
            alert('Vous avez bien supprimé votre produit du panier !');

            if (basket.totalQuantity == 0) {
                localStorage.clear();
                window.location.reload()
            } else {
                let lineBasket = JSON.stringify(basket);
                localStorage.setItem("basket", lineBasket);
                window.location.reload()
            }
        })
    };
}

// Validation formulaire
let form = document.querySelector(".cart__order__form");

// REGEX
var adressRegExp = new RegExp("^[A-zÀ-ú0-9 ,.'\-]+$");
var nameRegExp = new RegExp("^[A-zÀ-ú \-]+$");
var emailRegExp = new RegExp("^[a-zA-Z0-9_. -]+@[a-zA-Z.-]+[.]{1}[a-z]{2,10}$");

var firstNameErrorMsg = document.querySelector('#firstNameErrorMsg');
form.firstName.addEventListener('change', function(e) {
    var value = e.target.value;
    if (nameRegExp.test(value)){
        firstNameErrorMsg.innerHTML = '';
    } else {
        firstNameErrorMsg.innerHTML = 'Champ invalide, veuillez vérifier votre prénom.';
    }
});

let lastNameErrorMsg = form.lastName.nextElementSibling;
form.lastName.addEventListener('change', function(e) {
    var value = e.target.value;
    if (nameRegExp.test(value)){
        lastNameErrorMsg.innerHTML = '';
    } else {
        lastNameErrorMsg.innerHTML = 'Champ invalide, veuillez vérifier votre nom.';
    }
});

var adressErrorMsg = document.querySelector('#addressErrorMsg');
form.address.addEventListener('change', function(e) {
    var value = e.target.value;
    if (adressRegExp.test(value)){
        adressErrorMsg.innerHTML = '';
    } else {
        adressErrorMsg.innerHTML = 'Champ invalide, veuillez vérifier votre adresse postale.';
    }
});

var cityErrorMsg = document.querySelector('#cityErrorMsg');
form.city.addEventListener('change', function(e) {
    var value = e.target.value;
    if (nameRegExp.test(value)){
        cityErrorMsg.innerHTML = '';
    } else {
        cityErrorMsg.innerHTML = 'Champ invalide, veuillez vérifier votre ville.';
    }
});

var emailErrorMsg = document.querySelector('#emailErrorMsg');
form.email.addEventListener('change', function(e) {
    var value = e.target.value;
    if (emailRegExp.test(value)){
        emailErrorMsg.innerHTML = '';
    } else {
        emailErrorMsg.innerHTML = 'Champ invalide, veuillez vérifier votre adresse email.';
    }
});

// Passer commande
var btnOrder = document.querySelector('#order');

btnOrder.addEventListener('click', function(e) {
    e.preventDefault();
    let inputFirstName = document.getElementById('firstName');
    let inputLastName = document.getElementById('lastName');
    let inputAddress = document.getElementById('address');
    let inputCity = document.getElementById('city');
    let inputEmail = document.getElementById('email');
    
    

    if (basketStr == null) {
        alert("Pour passer commande, veuillez ajouter des produits à votre panier");
        e.preventDefault();
    } else if (firstName.value === "" || lastName.value === "" || address.value === "" || city.value === "" || email.value === "") {
        alert("Vous devez renseigner vos coordonnées pour passer la commande !");
        e.preventDefault();
    } else if (nameRegExp.test(inputFirstName.value) ==  false || nameRegExp.test(inputLastName.value) ==  false || adressRegExp.test(inputAddress.value) ==  false || nameRegExp.test(inputCity.value) ==  false || emailRegExp.test(inputEmail.value) ==  false) {
        alert("Vérifiez vos coordonnées pour passer la commande !");
        e.preventDefault();
    } else {
        productID = [];
        for (const element of basket.products) {
        productID.push(element.id);
        }

        let order = {
        contact : {
            firstName: inputFirstName.value,
            lastName: inputLastName.value,
            address: inputAddress.value,
            city: inputCity.value,
            email: inputEmail.value,
        },
        products : productID
        }

        fetch("http://localhost:3000/api/products/order", {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 
            'Accept': 'application/json', 
            'Content-Type': 'application/json' 
            },
        })
        .then((response) => response.json())
        .then(async function (resultOrder) {
            order = await resultOrder;
            document.location.href = "confirmation.html?orderId=" + order.orderId;
            localStorage.clear();
        })
    }
});
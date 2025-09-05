const burgerMenu = document.getElementById('burger-menu');
const menu = document.querySelector('.header__menu');
const menuItems = document.querySelectorAll('.header__item');
const basketCount = document.getElementById('basket-count');

const cartBasket = document.querySelector('.header__basket');
const cartModal = document.getElementById('cart-modal');
const cartClose = document.getElementById('cart-close');
const cartItemsBox = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartOrderBtn = document.getElementById('cart-order');
const cartForm = document.getElementById('cart-form');
const cartMessage = document.getElementById('cart-message');

let cart = [];

// Відкрити корзину
cartBasket.addEventListener('click', () => {
	cartModal.classList.add('open');
	renderCart();
	document.body.style.overflow = 'hidden';
});

// Закрити корзину
cartClose.addEventListener('click', closeCart);
cartModal.addEventListener('click', e => {
	if (e.target === cartModal) closeCart();
});
function closeCart() {
	cartModal.classList.remove('open');
	document.body.style.overflow = '';
	cartForm.style.display = 'none';
}

// Додаємо товар у корзину з анімацією (залишаємо тільки цей блок!)
document.querySelectorAll('.card-item__btn').forEach((btn, idx) => {
	btn.addEventListener('click', e => {
		const card = btn.closest('.card-item');
		const name = card.querySelector('.card-item__name').textContent;
		const price = card.querySelector('.card-item__price').textContent;
		const id = name;
		let item = cart.find(i => i.id === id);
		if (item) {
			item.qty += 1;
		} else {
			cart.push({ id, name, price, qty: 1 });
		}
		// --- Анімація ---
		const img = card.querySelector('.card-item__img');
		const cartIcon = document.querySelector('.header__basket');
		if (img && cartIcon) {
			const imgRect = img.getBoundingClientRect();
			const cartRect = cartIcon.getBoundingClientRect();
			const flyImg = img.cloneNode(true);
			flyImg.classList.add('fly-to-cart-img');
			document.body.appendChild(flyImg);
			flyImg.style.left = imgRect.left + 'px';
			flyImg.style.top = imgRect.top + 'px';
			flyImg.style.width = imgRect.width + 'px';
			flyImg.style.height = imgRect.height + 'px';
			setTimeout(() => {
				flyImg.style.transform = `translate(${
					cartRect.left - imgRect.left
				}px, ${cartRect.top - imgRect.top}px) scale(0.2)`;
				flyImg.style.opacity = '0.3';
			}, 10);
			setTimeout(() => {
				flyImg.remove();
			}, 900);
		}
		// --- /Анімація ---
		renderCart();
	});
});

// Оновлення лічильника
function updateBasketCount() {
	const total = cart.reduce((sum, item) => sum + item.qty, 0);
	basketCount.textContent = total;
	basketCount.style.display = total > 0 ? 'flex' : 'none';
}

// Рендер корзини
function renderCart() {
	cartItemsBox.innerHTML = '';
	if (cart.length === 0) {
		cartEmpty.style.display = '';
		cartOrderBtn.style.display = 'none';
		updateBasketCount();
		return;
	}
	cartEmpty.style.display = 'none';
	cartOrderBtn.style.display = '';
	cart.forEach((item, idx) => {
		const div = document.createElement('div');
		div.className = 'cart-modal__item';
		div.innerHTML = `
      <span class="cart-modal__item-name">${item.name}</span>
      <input type="number" min="1" value="${item.qty}" class="cart-modal__item-qty" data-idx="${idx}">
      <span>${item.price}</span>
      <button class="cart-modal__item-remove" data-idx="${idx}">&times;</button>
    `;
		cartItemsBox.appendChild(div);
	});
	updateBasketCount();
}

// Зміна кількості
cartItemsBox.addEventListener('input', e => {
	if (e.target.classList.contains('cart-modal__item-qty')) {
		const idx = +e.target.dataset.idx;
		let val = parseInt(e.target.value, 10);
		if (isNaN(val) || val < 1) val = 1;
		cart[idx].qty = val;
		renderCart();
	}
});

// Видалення товару
cartItemsBox.addEventListener('click', e => {
	if (e.target.classList.contains('cart-modal__item-remove')) {
		const idx = +e.target.dataset.idx;
		cart.splice(idx, 1);
		renderCart();
	}
});

// Замовити
cartOrderBtn.addEventListener('click', () => {
	cartForm.style.display = '';
	cartOrderBtn.style.display = 'none';
});

// Відправка форми (зараз просто очищає корзину)
cartForm.addEventListener('submit', e => {
	e.preventDefault();
	cart = [];
	renderCart();
	cartForm.reset();
	cartForm.style.display = 'none';
	// alert("Дякуємо за замовлення! Ми зв'яжемось з вами найближчим часом.");
	cartMessage.textContent =
		"Дякуємо за замовлення! Ми зв'яжемось з вами найближчим часом.";
	cartMessage.style.display = '';
	setTimeout(() => {
		cartMessage.style.display = 'none';
		closeCart();
	}, 2500);
	updateBasketCount();
});

burgerMenu.addEventListener('click', () => {
	burgerMenu.classList.toggle('open');
	menu.classList.toggle('open');

	// Забороняємо скрол на body при відкритті меню
	if (menu.classList.contains('open')) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';
	}
});

// Додаємо обробник події для кожного елемента меню
menuItems.forEach(item => {
	item.addEventListener('click', () => {
		if (menu.classList.contains('open')) {
			burgerMenu.classList.remove('open');
			menu.classList.remove('open');

			// Відновлюємо скрол після закриття меню
			document.body.style.overflow = '';
		}
	});
});

// Закриття меню при кліку поза меню
document.addEventListener('click', e => {
	const isClickInsideMenu =
		menu.contains(e.target) || burgerMenu.contains(e.target);
	if (!isClickInsideMenu && menu.classList.contains('open')) {
		burgerMenu.classList.remove('open');
		menu.classList.remove('open');
		document.body.style.overflow = '';
	}
});

// --- Модалка товару ---
const productModal = document.getElementById('product-modal');
const productModalClose = document.getElementById('product-modal-close');
const productModalImg = document.getElementById('product-modal-img');
const productModalName = document.getElementById('product-modal-name');
const productModalPrice = document.getElementById('product-modal-price');
const productModalDesc = document.getElementById('product-modal-desc');

// Додаткова інформація для кожного товару (можна розширити)
const productDescriptions = {
	'Кондиціонер для тканини, 2 л':
		"Додає м'якості та приємного аромату вашим речам. Підходить для всіх типів тканин.",
	'Мило для рук, 500 мл':
		'Делікатно очищає шкіру, не пересушує, має приємний аромат. Підходить для щоденного використання.',
	'Гель для прання, 3 л':
		'Ефективно видаляє забруднення навіть у холодній воді. Підходить для кольорових і білих речей.',
	'Рідина для миття посуду, 1 л':
		'Легко справляється з жиром, не залишає розводів. Має приємний аромат і легко змивається.',
	'Гель для чищення туалету, 750 мл':
		'Глибоко очищає та дезінфікує, залишає свіжий аромат. Допомагає підтримувати ідеальну чистоту.',
};

document.querySelectorAll('.card-item__img').forEach(img => {
	img.addEventListener('click', () => {
		const card = img.closest('.card-item');
		const name = card.querySelector('.card-item__name').textContent;
		const price = card.querySelector('.card-item__price').textContent;
		const descBlock = card.querySelector('.card-item__desc');
		const desc = descBlock
			? descBlock.innerHTML
			: 'Детальна інформація про товар незабаром.';
		const label = card.querySelector('.card-item__label')?.textContent || '';
		productModalImg.src = img.src;
		productModalImg.alt = img.alt;
		// Додаємо літраж у назву (після коми), окремий рядок не потрібен
		productModalName.textContent = name;
		productModalPrice.textContent = price;
		productModalDesc.innerHTML = desc;

		// Додаємо id картки до кнопки в модалці
		productModalAddBtn.dataset.name = name;
		productModalAddBtn.dataset.price = price;

		productModal.style.display = 'flex';
		document.body.style.overflow = 'hidden';
	});
});

// Додаємо кнопку "Додати в кошик" у модалку
const productModalAddBtn = document.createElement('button');
productModalAddBtn.className = 'product-modal__add-btn card-item__btn';
productModalAddBtn.textContent = 'Додати в кошик';
productModalDesc.after(productModalAddBtn);

// Обробник для кнопки в модалці
productModalAddBtn.addEventListener('click', () => {
	const name = productModalAddBtn.dataset.name;
	const price = productModalAddBtn.dataset.price;
	const id = name;
	let item = cart.find(i => i.id === id);
	if (item) {
		item.qty += 1;
	} else {
		cart.push({ id, name, price, qty: 1 });
	}
	renderCart();

	// Анімація (імітація з центру модалки до корзини)
	const cartIcon = document.querySelector('.header__basket');
	const modalImgRect = productModalImg.getBoundingClientRect();
	const cartRect = cartIcon.getBoundingClientRect();
	const flyImg = productModalImg.cloneNode(true);
	flyImg.classList.add('fly-to-cart-img');
	document.body.appendChild(flyImg);
	flyImg.style.left = modalImgRect.left + 'px';
	flyImg.style.top = modalImgRect.top + 'px';
	flyImg.style.width = modalImgRect.width + 'px';
	flyImg.style.height = modalImgRect.height + 'px';
	setTimeout(() => {
		flyImg.style.transform = `translate(${
			cartRect.left - modalImgRect.left
		}px, ${cartRect.top - modalImgRect.top}px) scale(0.2)`;
		flyImg.style.opacity = '0.3';
	}, 10);
	setTimeout(() => {
		flyImg.remove();
	}, 900);
});

productModalClose.addEventListener('click', closeProductModal);
productModal.addEventListener('click', e => {
	if (e.target === productModal) closeProductModal();
});
function closeProductModal() {
	productModal.style.display = 'none';
	document.body.style.overflow = '';
}

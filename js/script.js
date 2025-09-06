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

// === Google Sheets Web App endpoint ===
const GOOGLE_SHEET_ENDPOINT =
	'https://script.google.com/macros/s/AKfycbzMUTHaWjrg7fB0sb1g0sRrph_NqC28axSlfSufXtlWkzI9AVgsC9tOsUPmnwAkXzVE/exec';
// ======================================

// Універсальне очищення тексту (прибираємо перенос рядків, таби, зайві пробіли)
function cleanText(str) {
	return (str || '')
		.toString()
		.replace(/[\r\n\t]+/g, ' ') // прибрати переноси/таби
		.replace(/\s{2,}/g, ' ') // кілька пробілів -> один
		.replace(/\s+,/g, ',') // пробіл перед комою
		.replace(/,\s+/g, ', ') // один пробіл після коми
		.trim();
}

// Побудова читабельного рядка без зайвих пробілів / переносів
function buildItemsReadable(items) {
	return items
		.map(i => {
			const cleanName = cleanText(i.name);
			let num = parseFloat(
				String(i.price)
					.replace(/[^\d.,]/g, '')
					.replace(',', '.')
			);
			if (isNaN(num)) num = 0;
			const priceStr = num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
			return `${cleanName} x${i.qty} @ ${priceStr} грн`;
		})
		.join('; ')
		.replace(/\s{2,}/g, ' ') // фінальний прохід
		.trim();
}

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
		const name = cleanText(card.querySelector('.card-item__name').textContent);
		const price = cleanText(
			card.querySelector('.card-item__price').textContent
		);
		const id = name; // вже очищений -> стабільний ключ
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
	const cartTotalBlock = document.getElementById('cart-total');
	const cartTotalSum = document.getElementById('cart-total-sum');
	if (cart.length === 0) {
		cartEmpty.style.display = '';
		cartOrderBtn.style.display = 'none';
		if (cartTotalBlock) cartTotalBlock.style.display = 'none';
		updateBasketCount();
		return;
	}
	cartEmpty.style.display = 'none';
	cartOrderBtn.style.display = '';
	let total = 0;
	cart.forEach((item, idx) => {
		const div = document.createElement('div');
		div.className = 'cart-modal__item';
		// Витягуємо число з ціни (наприклад, "126.50 грн" -> 126.50)
		let priceNum = parseFloat(
			(item.price + '').replace(/[^\d.,]/g, '').replace(',', '.')
		);
		if (isNaN(priceNum)) priceNum = 0;
		total += priceNum * item.qty;
		// Нормалізуємо відображення ціни до формату 0.00 грн
		let displayPrice = parseFloat(
			(item.price + '').replace(/[^\d.,]/g, '').replace(',', '.')
		);
		if (isNaN(displayPrice)) displayPrice = 0;
		const formattedPrice = displayPrice.toFixed(2) + ' грн';
		div.innerHTML = `
	<span class="cart-modal__item-name" title="${item.name}">${item.name}</span>
	<input type="number" min="1" value="${item.qty}" class="cart-modal__item-qty" data-idx="${idx}">
	<span class="cart-modal__item-price">${formattedPrice}</span>
	<button class="cart-modal__item-remove" data-idx="${idx}" aria-label="Видалити позицію">&times;</button>
	    `;
		cartItemsBox.appendChild(div);
	});
	if (cartTotalBlock && cartTotalSum) {
		cartTotalSum.textContent = total.toFixed(2) + ' грн';
		cartTotalBlock.style.display = '';
	}
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

	// Якщо корзина порожня – не відправляємо
	if (!cart.length) return;

	const submitBtn = cartForm.querySelector('button[type="submit"]');
	const originalBtnText = submitBtn.textContent;
	submitBtn.disabled = true;
	submitBtn.textContent = 'Відправка...';

	const formData = new FormData(cartForm);
	// Формуємо payload
	const cleanedCart = cart.map(i => ({
		name: cleanText(i.name),
		price: cleanText(i.price),
		qty: i.qty,
	}));
	const orderData = {
		name: cleanText(formData.get('name')),
		surname: cleanText(formData.get('surname')),
		city: cleanText(formData.get('city')),
		np_branch: cleanText(formData.get('np_branch')),
		phone: cleanText(formData.get('phone')),
		items: cleanedCart,
		items_readable: buildItemsReadable(cleanedCart),
		total: cleanedCart.reduce((sum, i) => {
			let p = parseFloat(
				String(i.price)
					.replace(/[^\d.,]/g, '')
					.replace(',', '.')
			);
			if (isNaN(p)) p = 0;
			return sum + p * i.qty;
		}, 0),
		created_at: new Date().toISOString(),
		client_user_agent: navigator.userAgent,
	};

	// Функція показу повідомлення
	function showMessage(text, ok = true) {
		cartMessage.textContent = text;
		cartMessage.style.display = '';
		cartMessage.style.color = ok ? '#1a7f37' : '#b00020';
		cartMessage.classList.remove('show');
		void cartMessage.offsetWidth;
		cartMessage.classList.add('show');
	}

	// Відправка в Google Sheets (simple request: Content-Type text/plain => без preflight)
	(() => {
		// Перевірка що endpoint замінений
		if (
			!GOOGLE_SHEET_ENDPOINT ||
			GOOGLE_SHEET_ENDPOINT.includes('PASTE_GOOGLE')
		) {
			showMessage('Налаштуйте Google Sheets endpoint.', false);
			submitBtn.disabled = false;
			submitBtn.textContent = originalBtnText;
			return;
		}
		// Fire & forget: no-cors => не читаємо відповідь, вважаємо успішно якщо не зловили network error
		fetch(GOOGLE_SHEET_ENDPOINT, {
			method: 'POST',
			mode: 'no-cors', // opaque відповідь, недоступна для читання
			headers: { 'Content-Type': 'text/plain;charset=utf-8' },
			body: JSON.stringify(orderData),
		})
			.then(() => {
				showMessage(
					"Дякуємо за замовлення! Ми зв'яжемось з вами найближчим часом.",
					true
				);
				cart = [];
				renderCart();
				cartForm.reset();
				cartForm.style.display = 'none';
				setTimeout(() => {
					cartMessage.style.display = 'none';
					closeCart();
				}, 3000);
			})
			.catch(() => {
				showMessage('Не вдалося відправити. Перевірте інтернет.', false);
			})
			.finally(() => {
				updateBasketCount();
				submitBtn.disabled = false;
				submitBtn.textContent = originalBtnText;
			});
	})();
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

// === Вирівнювання висот карток у блоці "чому DOBREX" ===
function equalizeWhyCards() {
	// На вузьких екранах (коли колонки стають одна під одною) скидаємо стилі
	if (window.innerWidth <= 1100) {
		document.querySelectorAll('.why-card').forEach(c => {
			c.style.minHeight = '';
			c.style.height = '';
		});
		return;
	}
	const leftCards = document.querySelectorAll('.why__left .why-card');
	const rightCards = document.querySelectorAll('.why__right .why-card');
	if (!leftCards.length || !rightCards.length) return;
	const pairCount = Math.min(leftCards.length, rightCards.length);
	// Скидаємо перед перерахунком
	[...leftCards, ...rightCards].forEach(c => {
		c.style.minHeight = '';
		c.style.height = '';
	});
	for (let i = 0; i < pairCount; i++) {
		const l = leftCards[i];
		const r = rightCards[i];
		const maxH = Math.max(l.offsetHeight, r.offsetHeight);
		l.style.minHeight = r.style.minHeight = maxH + 'px';
	}
}

// Запуск після повного завантаження стилів / контенту
window.addEventListener('load', () => {
	equalizeWhyCards();
});
window.addEventListener('resize', () => {
	equalizeWhyCards();
});
// Можливо контент змінюється (шрифти / картинки) – додаткова затримка
setTimeout(equalizeWhyCards, 800);

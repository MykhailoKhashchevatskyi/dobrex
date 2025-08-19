const burgerMenu = document.getElementById('burger-menu');
const menu = document.querySelector('.header__menu');
const menuItems = document.querySelectorAll('.header__item');

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

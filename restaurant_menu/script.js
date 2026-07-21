(function() {
    const menuData = [
        { id: 1, category: 'panimula', name: 'Potato Salad', desc: 'Potatoes, mayo, carrots, onions, eggs', price: 100, emoji: '🥔', image: 'media/potato-salad.jpg' },
        { id: 2, category: 'panimula', name: 'Kani Salad', desc: 'Crab sticks, cucumber, carrots, sesame', price: 180, emoji: '🦀', image: 'media/kani-salad.jpg' },
        { id: 3, category: 'pangunahin', name: 'Cochinillo', desc: 'Slow-roasted pork, garlic, lemongrass', price: 450, emoji: '🐖', image: 'media/cochinillo.jpg' },
        { id: 4, category: 'pangunahin', name: 'Roasted Chicken', desc: 'Half chicken, wild rice, vegetables', price: 500, emoji: '🍗', image: 'media/roasted-chicken.jpg' },
        { id: 5, category: 'clscs', name: 'Adobo', desc: 'Chicken, soy sauce, vinegar, garlic', price: 650, emoji: '🍗', image: 'media/adobo.jpg' },
        { id: 6, category: 'clscs', name: 'Kare-Kare', desc: 'Beef, peanut sauce, eggplant, beans', price: 500, emoji: '🥩', image: 'media/kare-kare.jpg' },
        { id: 7, category: 'clscs', name: 'Menudo', desc: 'Pork, liver, tomato, potatoes, raisins', price: 500, emoji: '🍲', image: 'media/menudo.jpg' },
        { id: 8, category: 'clscs', name: 'Lechon Kawali', desc: 'Crispy pork belly, garlic, salt', price: 500, emoji: '🥓', image: 'media/lechon-kawali.jpg' },
        { id: 9, category: 'panghimagas', name: 'Halo-Halo', desc: 'Crushed ice, milk, beans, fruits, leche flan', price: 120, emoji: '🍧', image: 'media/halo-halo.jpg' },
        { id: 10, category: 'panghimagas', name: 'Leche Flan', desc: 'Egg yolks, condensed milk, caramel', price: 100, emoji: '🍮', image: 'media/leche-flan.jpg' },
        { id: 11, category: 'panghimagas', name: 'Mango Float', desc: 'Mangoes, graham, cream, condensed milk', price: 280, emoji: '🥭', image: 'media/mango-float.jpg' },
        { id: 12, category: 'panghimagas', name: 'Tiramisu', desc: 'Espresso ladyfingers, mascarpone', price: 290, emoji: '🍰', image: 'media/tiramisu.jpg' },
        { id: 13, category: 'inumin', name: 'House Wine', desc: 'Red or White selection', price: 150, emoji: '🍷', image: 'media/house-wine.jpg' },
        { id: 14, category: 'inumin', name: 'Tuba', desc: 'Coconut wine from fermented sap', price: 200, emoji: '🥥', image: 'media/tuba.jpg' },
        { id: 15, category: 'inumin', name: 'Bottomless Iced Tea', desc: 'Iced Tea', price: 150, emoji: '🧊', image: 'media/iced-tea.jpg' }
    ];

    let cart = [];
    let currentCategory = 'all';
    let reservations = JSON.parse(localStorage.getItem('lamesa_reservations') || '[]');
    let orderCounter = parseInt(localStorage.getItem('lamesa_order_counter') || '0');
    let bookingCounter = parseInt(localStorage.getItem('lamesa_booking_counter') || '0');

    function getNextOrderNumber() {
        orderCounter += 1;
        localStorage.setItem('lamesa_order_counter', orderCounter.toString());
        return 'ORD-' + String(orderCounter).padStart(4, '0');
    }

    function getNextBookingNumber() {
        bookingCounter += 1;
        localStorage.setItem('lamesa_booking_counter', bookingCounter.toString());
        return 'BOOK-' + String(bookingCounter).padStart(4, '0');
    }

    const productGrid = document.getElementById('productGrid');
    const categoryTitle = document.getElementById('categoryTitle');
    const itemCount = document.getElementById('itemCount');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutContent = document.getElementById('checkoutContent');

    document.querySelectorAll('.nav-tabs button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-tabs button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');
            if (tab === 'reservations') renderReservations();
        });
    });

    function getProductImage(product) {
        return product.image || '';
    }

    function renderProducts(category = 'all') {
        const filtered = category === 'all' ? menuData : menuData.filter(item => item.category === category);
        if (filtered.length === 0) {
            productGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px 0;">No items in this category</p>`;
            itemCount.textContent = '0 items';
            return;
        }
        let html = '';
        filtered.forEach(item => {
            const imageSrc = getProductImage(item);
            const imageHtml = imageSrc ?
                `<img src="${imageSrc}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'fallback-emoji\\'>${item.emoji}</span>';">` :
                `<span class="fallback-emoji">${item.emoji}</span>`;
            html += `
                <div class="product-card" data-id="${item.id}">
                    <div class="product-image">${imageHtml}</div>
                    <div class="product-name">${item.name}</div>
                    <div class="product-desc">${item.desc}</div>
                    <div class="product-footer">
                        <span class="product-price">₱${item.price}</span>
                        <button class="btn-add" data-id="${item.id}"><i class="fas fa-plus"></i> Add</button>
                    </div>
                </div>
            `;
        });
        productGrid.innerHTML = html;
        itemCount.textContent = `${filtered.length} items`;
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const product = menuData.find(p => p.id === id);
                if (product) addToCart(product);
            });
        });
    }

    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        renderCart();
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        renderCart();
    }

    function updateQuantity(id, delta) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        renderCart();
    }

    function clearCart() {
        cart = [];
        renderCart();
    }

    function getTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItemsEl.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px 0;">Your cart is empty</p>`;
            cartTotalEl.textContent = '₱0';
            return;
        }
        let html = '';
        cart.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-meta">
                            <div class="cart-qty">
                                <button data-id="${item.id}" data-delta="-1">−</button>
                                <span>${item.quantity}</span>
                                <button data-id="${item.id}" data-delta="1">+</button>
                            </div>
                            <span class="cart-item-price">₱${item.price * item.quantity}</span>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}"><i class="fas fa-times"></i></button>
                </div>
            `;
        });
        cartItemsEl.innerHTML = html;
        cartTotalEl.textContent = `₱${getTotal()}`;
        document.querySelectorAll('.cart-qty button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const delta = parseInt(btn.dataset.delta);
                updateQuantity(id, delta);
            });
        });
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                removeFromCart(id);
            });
        });
    }

    function setCategory(cat) {
        currentCategory = cat;
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === cat);
        });
        const names = { all: 'All Menu', panimula: 'Starters', pangunahin: 'Mains', clscs: 'Classics', panghimagas: 'Desserts', inumin: 'Drinks' };
        categoryTitle.textContent = names[cat] || 'Menu';
        renderProducts(cat);
    }

    function sendEmailNotification(type, data) {
        const accessKey = 'dc830092-c83d-462f-aa28-99b00725d262';
        let subject = '';
        let message = '';

        if (type === 'reservation') {
            subject = `New Table Reservation: ${data.id}`;
            message = `New Reservation at Lamesa Restaurant\n\nReservation ID: ${data.id}\nCustomer: ${data.name}\nContact: ${data.phone}${data.email ? '\nEmail: ' + data.email : ''}\nDate: ${data.date}\nTime: ${data.time}\nGuests: ${data.guests}\n${data.requests ? 'Special Requests: ' + data.requests : ''}\nStatus: ${data.status}\n\nThank you for choosing Lamesa!`;
        } else if (type === 'order') {
            subject = `New Food Order: ${data.orderNumber}`;
            let itemsList = data.items.map(i => `  ${i.name} x${i.quantity} = ₱${i.price * i.quantity}`).join('\n');
            message = `New Order at Lamesa Restaurant\n\nOrder Number: ${data.orderNumber}\nOrder Type: ${data.orderType.toUpperCase()}\n${data.orderType === 'delivery' ? 'Delivery Address: ' + data.deliveryAddress + '\n' : ''}\n${data.orderType === 'dinein' ? 'Table: ' + (data.tableNumber || 'Not specified') + '\n' : ''}\n${data.orderType === 'pickup' ? 'Pickup Time: ' + (data.estimatedPickup || 'ASAP') + '\n' : ''}\nCustomer: ${data.customerName}\nContact: ${data.contactNumber}\n\nOrdered Items:\n${itemsList}\n\nTotal: ₱${data.total}\nPayment Method: ${data.paymentMethod}\n\nThank you for your order!`;
        }

        const formData = new FormData();
        formData.append('access_key', accessKey);
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('from_name', 'Lamesa Restaurant');
        formData.append('email', 'theeasybadger@gmail.com');

        fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Email sent successfully!');
                } else {
                    console.error('Email failed:', data);
                    fallbackMailTo(type, data);
                }
            })
            .catch(error => {
                console.error('Error sending email:', error);
                fallbackMailTo(type, data);
            });
    }

    function fallbackMailTo(type, data) {
        let subject = '';
        let body = '';
        const to = 'theeasybadger@gmail.com';

        if (type === 'reservation') {
            subject = `New Table Reservation: ${data.id}`;
            body = `New Reservation at Lamesa Restaurant\n\nReservation ID: ${data.id}\nCustomer: ${data.name}\nContact: ${data.phone}${data.email ? '\nEmail: ' + data.email : ''}\nDate: ${data.date}\nTime: ${data.time}\nGuests: ${data.guests}\n${data.requests ? 'Special Requests: ' + data.requests : ''}\nStatus: ${data.status}\n\nThank you for choosing Lamesa!`;
        } else if (type === 'order') {
            subject = `New Food Order: ${data.orderNumber}`;
            let itemsList = data.items.map(i => `  ${i.name} x${i.quantity} = ₱${i.price * i.quantity}`).join('\n');
            body = `New Order at Lamesa Restaurant\n\nOrder Number: ${data.orderNumber}\nOrder Type: ${data.orderType.toUpperCase()}\n${data.orderType === 'delivery' ? 'Delivery Address: ' + data.deliveryAddress + '\n' : ''}\n${data.orderType === 'dinein' ? 'Table: ' + (data.tableNumber || 'Not specified') + '\n' : ''}\n${data.orderType === 'pickup' ? 'Pickup Time: ' + (data.estimatedPickup || 'ASAP') + '\n' : ''}\nCustomer: ${data.customerName}\nContact: ${data.contactNumber}\n\nOrdered Items:\n${itemsList}\n\nTotal: ₱${data.total}\nPayment Method: ${data.paymentMethod}\n\nThank you for your order!`;
        }

        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
    }

    let selectedPayment = 'gcash';
    let selectedOrderType = 'dinein';

    function openCheckout() {
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        renderCheckoutModal();
        checkoutOverlay.classList.add('open');
    }

    function closeCheckout() {
        checkoutOverlay.classList.remove('open');
    }

    function renderCheckoutModal() {
        const total = getTotal();
        let html = `
            <h2><i class="fas fa-receipt"></i> Checkout</h2>
            <p style="color: var(--text-muted); margin-bottom: 6px;">Total <strong>₱${total}</strong> · ${cart.length} items</p>

            <div style="margin: 12px 0 8px;">
                <label style="font-weight:600; display:block; margin-bottom:6px;"><i class="fas fa-truck"></i> Order Type</label>
                <div class="order-type-group">
                    <button class="order-type-btn ${selectedOrderType === 'delivery' ? 'active' : ''}" data-type="delivery">
                        <i class="fas fa-truck"></i> Delivery
                    </button>
                    <button class="order-type-btn ${selectedOrderType === 'pickup' ? 'active' : ''}" data-type="pickup">
                        <i class="fas fa-store"></i> Pickup
                    </button>
                    <button class="order-type-btn ${selectedOrderType === 'dinein' ? 'active' : ''}" data-type="dinein">
                        <i class="fas fa-utensils"></i> Dine-in
                    </button>
                </div>
            </div>

            <div id="orderTypeFields" style="margin: 6px 0 12px; padding: 12px 16px; background: var(--bg-light); border-radius: var(--radius-xs);">
        `;

        if (selectedOrderType === 'delivery') {
            html += `
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Full Name</label>
                    <input type="text" id="deliveryName" placeholder="Full name" value="${localStorage.getItem('lamesa_delivery_name') || ''}">
                </div>
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Contact Number</label>
                    <input type="tel" id="deliveryPhone" placeholder="+63 915 123 4567" value="${localStorage.getItem('lamesa_delivery_phone') || ''}">
                </div>
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Delivery Address</label>
                    <input type="text" id="deliveryAddress" placeholder="Street, City, Postal code" value="${localStorage.getItem('lamesa_delivery_address') || ''}">
                </div>
                <div class="form-group">
                    <label>Delivery Instructions (optional)</label>
                    <input type="text" id="deliveryInstructions" placeholder="Gate code, landmarks, etc." value="${localStorage.getItem('lamesa_delivery_instructions') || ''}">
                </div>
            `;
        } else if (selectedOrderType === 'pickup') {
            html += `
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Full Name</label>
                    <input type="text" id="pickupName" placeholder="Full name" value="${localStorage.getItem('lamesa_pickup_name') || ''}">
                </div>
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Contact Number</label>
                    <input type="tel" id="pickupPhone" placeholder="+63 915 123 4567" value="${localStorage.getItem('lamesa_pickup_phone') || ''}">
                </div>
                <div class="form-group">
                    <label>Estimated Pickup Time</label>
                    <select id="pickupTime">
                        <option value="15 min">15 minutes</option>
                        <option value="30 min" selected>30 minutes</option>
                        <option value="45 min">45 minutes</option>
                        <option value="60 min">1 hour</option>
                    </select>
                </div>
            `;
        } else if (selectedOrderType === 'dinein') {
            html += `
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Full Name</label>
                    <input type="text" id="dineinName" placeholder="Full name" value="${localStorage.getItem('lamesa_dinein_name') || ''}">
                </div>
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Contact Number</label>
                    <input type="tel" id="dineinPhone" placeholder="+63 915 123 4567" value="${localStorage.getItem('lamesa_dinein_phone') || ''}">
                </div>
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Table Number (optional)</label>
                    <input type="text" id="dineinTable" placeholder="e.g. Table 5" value="${localStorage.getItem('lamesa_dinein_table') || ''}">
                </div>
                <div class="form-group">
                    <label>Number of People</label>
                    <select id="dineinPeople">
                        <option value="1">1</option><option value="2" selected>2</option>
                        <option value="3">3</option><option value="4">4</option>
                        <option value="5">5</option><option value="6">6+</option>
                    </select>
                </div>
            `;
        }

        html += `
            </div>

            <div style="margin: 10px 0 8px;">
                <label style="font-weight:600; display:block; margin-bottom:6px;"><i class="fas fa-credit-card"></i> Payment Method</label>
                <div class="payment-methods">
                    <button class="payment-btn ${selectedPayment === 'gcash' ? 'active' : ''}" data-method="gcash"><i class="fas fa-mobile-alt"></i> GCash</button>
                    <button class="payment-btn ${selectedPayment === 'cash' ? 'active' : ''}" data-method="cash"><i class="fas fa-money-bill-wave"></i> Cash</button>
                    <button class="payment-btn ${selectedPayment === 'card' ? 'active' : ''}" data-method="card"><i class="fas fa-credit-card"></i> Card</button>
                </div>
            </div>

            <div class="payment-detail" id="paymentDetail">
        `;

        if (selectedPayment === 'gcash') {
            html += `<p><i class="fas fa-check-circle" style="color: var(--primary);"></i> Pay with GCash</p>
                <p>Send to: <span class="highlight">0915-123-4567</span></p>
                <p style="font-size:0.9rem;">Reference: ${getNextOrderNumber()}</p>`;
        } else if (selectedPayment === 'cash') {
            html += `<p><i class="fas fa-coins"></i> Pay with Cash</p>
                <p>Total: <span class="highlight">₱${total}</span></p>
                <div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap;">
                    <button class="btn-secondary" style="flex:1; padding:8px;" id="cashPreset500">₱500</button>
                    <button class="btn-secondary" style="flex:1; padding:8px;" id="cashPreset1000">₱1000</button>
                    <button class="btn-secondary" style="flex:1; padding:8px;" id="cashPresetExact">Exact</button>
                </div>
                <p style="margin-top:8px;">Change: <span id="cashChange">₱0</span></p>`;
        } else {
            html += `<p><i class="fas fa-credit-card"></i> Card Payment</p>
                <div style="background:white; padding:12px; border-radius:12px;">
                    <p>💳 ***********1234</p>
                    <p style="display:flex; gap:16px; font-size:0.9rem;"><span>Expiry: 08/28</span><span>CVV: ***</span></p>
                </div>
                <p style="font-size:0.9rem;">Tap or insert your card</p>`;
        }

        html += `
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="closeCheckoutBtn">Back</button>
                <button class="btn-primary" id="confirmOrderBtn"><i class="fas fa-check"></i> Confirm Order</button>
            </div>
        `;

        checkoutContent.innerHTML = html;

        document.querySelectorAll('.order-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedOrderType = btn.dataset.type;
                renderCheckoutModal();
            });
        });

        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedPayment = btn.dataset.method;
                renderCheckoutModal();
            });
        });

        document.getElementById('closeCheckoutBtn').addEventListener('click', closeCheckout);
        document.getElementById('confirmOrderBtn').addEventListener('click', confirmOrder);

        const cash500 = document.getElementById('cashPreset500');
        const cash1000 = document.getElementById('cashPreset1000');
        const cashExact = document.getElementById('cashPresetExact');
        if (cash500) {
            cash500.addEventListener('click', () => {
                const change = 500 - total;
                document.getElementById('cashChange').textContent = `₱${change >= 0 ? change : 0}`;
            });
        }
        if (cash1000) {
            cash1000.addEventListener('click', () => {
                const change = 1000 - total;
                document.getElementById('cashChange').textContent = `₱${change >= 0 ? change : 0}`;
            });
        }
        if (cashExact) {
            cashExact.addEventListener('click', () => {
                document.getElementById('cashChange').textContent = '₱0';
            });
        }
    }

    function confirmOrder() {
        let customerName = '',
            contactNumber = '',
            deliveryAddress = '',
            tableNumber = '',
            estimatedPickup = '';

        if (selectedOrderType === 'delivery') {
            customerName = document.getElementById('deliveryName')?.value || 'Not provided';
            contactNumber = document.getElementById('deliveryPhone')?.value || 'Not provided';
            deliveryAddress = document.getElementById('deliveryAddress')?.value || 'Not provided';
            const instructions = document.getElementById('deliveryInstructions')?.value || '';
            if (instructions) deliveryAddress += ' (Instructions: ' + instructions + ')';
            localStorage.setItem('lamesa_delivery_name', customerName);
            localStorage.setItem('lamesa_delivery_phone', contactNumber);
            localStorage.setItem('lamesa_delivery_address', document.getElementById('deliveryAddress')?.value || '');
            localStorage.setItem('lamesa_delivery_instructions', document.getElementById('deliveryInstructions')?.value || '');
        } else if (selectedOrderType === 'pickup') {
            customerName = document.getElementById('pickupName')?.value || 'Not provided';
            contactNumber = document.getElementById('pickupPhone')?.value || 'Not provided';
            estimatedPickup = document.getElementById('pickupTime')?.value || '30 min';
            localStorage.setItem('lamesa_pickup_name', customerName);
            localStorage.setItem('lamesa_pickup_phone', contactNumber);
        } else if (selectedOrderType === 'dinein') {
            customerName = document.getElementById('dineinName')?.value || 'Not provided';
            contactNumber = document.getElementById('dineinPhone')?.value || 'Not provided';
            tableNumber = document.getElementById('dineinTable')?.value || 'Not specified';
            localStorage.setItem('lamesa_dinein_name', customerName);
            localStorage.setItem('lamesa_dinein_phone', contactNumber);
            localStorage.setItem('lamesa_dinein_table', tableNumber);
        }

        const orderNumber = getNextOrderNumber();
        const orderData = {
            orderNumber: orderNumber,
            orderType: selectedOrderType,
            customerName: customerName,
            contactNumber: contactNumber,
            deliveryAddress: deliveryAddress,
            tableNumber: tableNumber,
            estimatedPickup: estimatedPickup,
            items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            total: getTotal(),
            paymentMethod: selectedPayment.charAt(0).toUpperCase() + selectedPayment.slice(1)
        };

        sendEmailNotification('order', orderData);

        checkoutContent.innerHTML = `
            <div class="order-confirmation">
                <div class="big-icon"><i class="fas fa-check-circle"></i></div>
                <h2>Order Confirmed!</h2>
                <p>Thank you for your order</p>
                <div class="order-number">${orderNumber}</div>
                <div style="background:var(--bg-light); border-radius:var(--radius-sm); padding:16px; text-align:left; margin:12px 0;">
                    <p><strong>Order Type:</strong> ${selectedOrderType.toUpperCase()}</p>
                    <p><strong>Customer:</strong> ${customerName}</p>
                    <p><strong>Items:</strong> ${cart.length}</p>
                    <p><strong>Total:</strong> ₱${getTotal()}</p>
                    <p><strong>Payment:</strong> ${orderData.paymentMethod}</p>
                    ${selectedOrderType === 'delivery' ? `<p><strong>Delivery:</strong> ${deliveryAddress}</p>` : ''}
                    ${selectedOrderType === 'pickup' ? `<p><strong>Pickup:</strong> ~${estimatedPickup}</p>` : ''}
                    ${selectedOrderType === 'dinein' ? `<p><strong>Table:</strong> ${tableNumber}</p>` : ''}
                </div>
                <p style="color:var(--text-muted); font-size:0.9rem;">A confirmation email has been sent to the restaurant.</p>
                <button class="btn-primary" style="margin-top:16px; width:100%;" id="newOrderBtn">
                    <i class="fas fa-undo-alt"></i> New Order
                </button>
            </div>
        `;
        document.getElementById('newOrderBtn').addEventListener('click', () => {
            clearCart();
            closeCheckout();
            selectedOrderType = 'dinein';
        });
    }

    const bookingForm = document.getElementById('bookingForm');
    const bookingDate = document.getElementById('bookingDate');
    const bookingTime = document.getElementById('bookingTime');
    const bookingGuests = document.getElementById('bookingGuests');
    const bookingName = document.getElementById('bookingName');
    const bookingPhone = document.getElementById('bookingPhone');
    const bookingEmail = document.getElementById('bookingEmail');
    const bookingRequests = document.getElementById('bookingRequests');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summaryGuests = document.getElementById('summaryGuests');
    const bookingFormContainer = document.getElementById('bookingFormContainer');
    const bookingConfirmation = document.getElementById('bookingConfirmation');

    const today = new Date().toISOString().split('T')[0];
    bookingDate.setAttribute('min', today);

    function updateBookingSummary() {
        summaryDate.textContent = bookingDate.value || 'Date not selected';
        summaryTime.textContent = bookingTime.value || 'Time not selected';
        summaryGuests.textContent = (bookingGuests.value || '0') + ' guests';
    }
    bookingDate.addEventListener('change', updateBookingSummary);
    bookingTime.addEventListener('change', updateBookingSummary);
    bookingGuests.addEventListener('change', updateBookingSummary);

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const date = bookingDate.value;
        const time = bookingTime.value;
        const guests = parseInt(bookingGuests.value);
        const name = bookingName.value.trim();
        const phone = bookingPhone.value.trim();
        const email = bookingEmail.value.trim();
        const requests = bookingRequests.value.trim();

        if (!date || !time || !name || !phone) {
            alert('Please fill in all required fields.');
            return;
        }

        const bookingId = getNextBookingNumber();
        const booking = {
            id: bookingId,
            date,
            time,
            guests,
            name,
            phone,
            email,
            requests,
            status: 'Confirmed',
            createdAt: new Date().toISOString()
        };

        reservations.push(booking);
        localStorage.setItem('lamesa_reservations', JSON.stringify(reservations));

        sendEmailNotification('reservation', booking);

        bookingFormContainer.style.display = 'none';
        bookingConfirmation.style.display = 'block';
        bookingConfirmation.innerHTML = `
            <div class="booking-confirmation">
                <div class="big-icon"><i class="fas fa-check-circle"></i></div>
                <h2>Reservation Confirmed!</h2>
                <div class="booking-number">${booking.id}</div>
                <div class="details">
                    <p><strong>Date:</strong> ${booking.date}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Guests:</strong> ${booking.guests}</p>
                    <p><strong>Name:</strong> ${booking.name}</p>
                    <p><strong>Contact:</strong> ${booking.phone}</p>
                    ${booking.email ? `<p><strong>Email:</strong> ${booking.email}</p>` : ''}
                    ${booking.requests ? `<p><strong>Special Requests:</strong> ${booking.requests}</p>` : ''}
                </div>
                <div class="booking-status">
                    <span class="status-badge"><i class="fas fa-check"></i> ${booking.status}</span>
                    <p style="margin-top:8px; font-size:0.9rem;">A confirmation email has been sent to the restaurant.</p>
                </div>
                <button class="btn-primary" style="margin-top:20px; width:100%;" id="newBookingBtn">
                    <i class="fas fa-plus"></i> Make Another Reservation
                </button>
            </div>
        `;
        document.getElementById('newBookingBtn').addEventListener('click', function() {
            bookingForm.reset();
            bookingFormContainer.style.display = 'block';
            bookingConfirmation.style.display = 'none';
            bookingDate.value = today;
            updateBookingSummary();
            document.querySelector('[data-tab="reservations"]').click();
        });
    });

    function renderReservations() {
        const list = document.getElementById('reservationList');
        if (reservations.length === 0) {
            list.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 40px 0;">
                <i class="fas fa-calendar-times" style="font-size:2rem; display:block; margin-bottom:12px;"></i>
                No reservations yet.
            </p>`;
            return;
        }
        let html = '';
        [...reservations].reverse().forEach(r => {
            html += `
                <div style="background:var(--bg-light); border-radius:var(--radius-sm); padding:16px 20px; margin-bottom:12px; border-left:4px solid var(--primary);">
                    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                        <strong>${r.name}</strong>
                        <span style="background:#3baa5c; color:white; padding:2px 14px; border-radius:40px; font-size:0.8rem;">${r.status}</span>
                    </div>
                    <p style="margin:6px 0;">${r.date} · ${r.time} · ${r.guests} guests</p>
                    <p style="font-size:0.85rem; color:var(--text-muted);">${r.phone} · ${r.id}</p>
                    ${r.requests ? `<p style="font-size:0.85rem; color:var(--text-muted);">${r.requests}</p>` : ''}
                </div>
            `;
        });
        list.innerHTML = html;
    }

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => setCategory(btn.dataset.category));
    });

    checkoutBtn.addEventListener('click', openCheckout);
    clearCartBtn.addEventListener('click', clearCart);
    checkoutOverlay.addEventListener('click', (e) => {
        if (e.target === checkoutOverlay) closeCheckout();
    });

    setCategory('all');
    renderCart();
    bookingDate.value = today;
    updateBookingSummary();
})();
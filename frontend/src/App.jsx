
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "https://multimart-2.vercel.app/api";

const demoProducts = [
  {
    _id: "demo-1",
    name: "Sony Wireless Headphones",
    seller: "TechZone",
    price: 2499,
    oldPrice: 3999,
    discount: "38% OFF",
    rating: "4.7 ★",
    reviews: "2.4k",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
  },
  {
    _id: "demo-2",
    name: "Premium Smart Watch",
    seller: "Digital World",
    price: 1999,
    oldPrice: 3499,
    discount: "43% OFF",
    rating: "4.6 ★",
    reviews: "1.8k",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    category: "Smart Gadgets",
  },
  {
    _id: "demo-3",
    name: "Nike Running Shoes",
    seller: "SportX",
    price: 3299,
    oldPrice: 5499,
    discount: "40% OFF",
    rating: "4.8 ★",
    reviews: "3.1k",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    category: "Shoes",
  },
  {
    _id: "demo-4",
    name: "Premium Travel Backpack",
    seller: "Urban Store",
    price: 1499,
    oldPrice: 2499,
    discount: "40% OFF",
    rating: "4.5 ★",
    reviews: "1.2k",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    category: "Accessories",
  },
];

const categories = [
  {
    name: "Electronics",
    count: "120+ Products",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fashion",
    count: "250+ Products",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Shoes",
    count: "180+ Products",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Smart Gadgets",
    count: "90+ Products",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Accessories",
    count: "160+ Products",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
  },
];

const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getPrice = (product) => {
  const value = product?.price ?? product?.sellingPrice ?? 0;

  if (typeof value === "string") {
    return Number(value.replace(/[₹,\s]/g, "")) || 0;
  }

  return Number(value) || 0;
};

const normalizeProduct = (product, index) => {
  const price = getPrice(product);

  return {
    ...product,
    _id: product._id || product.id || `product-${index}`,
    name: product.name || product.title || "Product",
    seller:
      product.seller?.name ||
      product.sellerName ||
      product.vendor?.name ||
      product.seller ||
      "MultiMart Seller",
    price,
    oldPrice:
      Number(
        String(
          product.oldPrice ??
            product.originalPrice ??
            product.mrp ??
            price
        ).replace(/[₹,\s]/g, "")
      ) || price,
    discount: product.discount || "",
    rating: product.rating || "4.5 ★",
    reviews: product.reviews || product.reviewCount || "0",
    image:
      product.image ||
      product.imageUrl ||
      product.images?.[0] ||
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
  };
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}

function App() {
  const [backendProducts, setBackendProducts] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState(() => {
    try {
      const currentOrder = sessionStorage.getItem("multimart-current-order");
      return currentOrder ? [JSON.parse(currentOrder)] : [];
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("multimart-cart") || "[]");
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("multimart-wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("multimart-user") || "null");
    } catch {
      return null;
    }
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const products = backendConnected
    ? backendProducts
    : demoProducts.map(normalizeProduct);

  useEffect(() => {
    localStorage.setItem("multimart-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("multimart-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    // Keep only the latest order in this browser tab's session. This intentionally
    // does not read old orders from localStorage or another customer/session.
    if (orders[0]) {
      sessionStorage.setItem("multimart-current-order", JSON.stringify(orders[0]));
    } else {
      sessionStorage.removeItem("multimart-current-order");
    }
  }, [orders]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("multimart-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("multimart-user");
    }
  }, [user]);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoadingProducts(true);

      try {
        const data = await apiRequest("/products");
        const list = Array.isArray(data)
          ? data
          : data.products || data.data || [];

        if (active && Array.isArray(list)) {
          setBackendProducts(list.map(normalizeProduct));
          setBackendConnected(true);
        }
      } catch (error) {
        if (active) {
          setBackendConnected(false);
          console.error("Products API:", error.message);
        }
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timeout = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = searchText.trim().toLowerCase();

      const matchesSearch =
        !text ||
        product.name.toLowerCase().includes(text) ||
        String(product.seller).toLowerCase().includes(text) ||
        String(product.category || "").toLowerCase().includes(text);

      const matchesCategory =
        selectedCategory === "All" ||
        String(product.category || "").toLowerCase() ===
          selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, selectedCategory]);

  const cartCount = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + getPrice(item) * (Number(item.quantity) || 1),
    0
  );

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);

      if (existing) {
        return current.map((item) =>
          item._id === product._id
            ? { ...item, quantity: (Number(item.quantity) || 1) + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setNotice(`${product.name} added to cart`);
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item._id === id
            ? { ...item, quantity: (Number(item.quantity) || 1) + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item._id !== id));
    setNotice("Product removed from cart");
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item._id === product._id);

    setWishlist((current) =>
      exists
        ? current.filter((item) => item._id !== product._id)
        : [...current, product]
    );

    setNotice(exists ? "Removed from wishlist" : "Added to wishlist");
  };

  const scrollToSection = (id) => {
    setShowCart(false);
    setShowWishlist(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const handleLogin = async (event) => {
    event.preventDefault();
    setRequestLoading(true);

    try {
      // Keep the local demo account usable even when the backend is offline.
      const { email, password } = loginForm;
      if (
        email.trim().toLowerCase() === "demo@multimart.com" &&
        password === "demo123"
      ) {
        setUser({ name: "Demo User", email: "demo@multimart.com" });
        setShowLogin(false);
        setLoginForm({ email: "", password: "" });
        setNotice("Login successful!");
        return;
      }

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });

      const loggedInUser = data.user || data.data?.user || data;
      if (data.token) {
        localStorage.setItem("multimart-token", data.token);
      }

      setUser(loggedInUser);
      setShowLogin(false);
      setLoginForm({ email: "", password: "" });
      setNotice("Login successful");
    } catch (error) {
      setNotice(`Login failed: ${error.message}`);
    } finally {
      setRequestLoading(false);
    }
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("multimart-token");
    setNotice("Logged out");
  };

  const saveCompletedOrder = (responseData, orderPayload, fallbackMessage = "Order placed successfully") => {
    const responseOrder = responseData?.order || responseData?.data?.order || responseData?.data || responseData || {};
    const order = {
      ...responseOrder,
      orderId: responseOrder.orderId || responseOrder._id || `MM-${Date.now().toString(36).toUpperCase()}`,
      createdAt: responseOrder.createdAt || new Date().toISOString(),
      items: Array.isArray(responseOrder.items) && responseOrder.items.length ? responseOrder.items : orderPayload.items,
      shippingAddress: responseOrder.shippingAddress || orderPayload.shippingAddress,
      totalAmount: responseOrder.totalAmount ?? responseOrder.total ?? orderPayload.totalAmount,
      status: responseOrder.status || responseOrder.orderStatus || "Order Placed",
      customer: responseOrder.customer || orderPayload.customer || { name: checkoutForm.name },
    };
    // One checkout = one visible order. A new checkout replaces the current session order.
    setOrders([order]);
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    setShowWishlist(false);
    setShowOrders(true);
    setNotice(responseData?.message || fallbackMessage);
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (!cart.length) {
      setNotice("Your cart is empty");
      return;
    }

    setRequestLoading(true);
    const orderPayload = {
      items: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        quantity: Number(item.quantity) || 1,
        price: getPrice(item),
        image: item.image,
      })),
      shippingAddress: checkoutForm,
      totalAmount: cartTotal,
      ...(user ? { customer: { name: user.name, email: user.email } } : {}),
    };

    try {
      const token = localStorage.getItem("multimart-token");
      const data = await apiRequest("/orders", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify(orderPayload),
      });
      saveCompletedOrder(data, orderPayload);
    } catch (error) {
      if (error instanceof TypeError || error.message === "Failed to fetch") {
        saveCompletedOrder({ status: "Order Placed" }, orderPayload, "Order placed (demo only; saved in this browser)");
      } else {
        setNotice(`Order failed: ${error.message}`);
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const refreshOrderTracking = async (order) => {
    try {
      const token = localStorage.getItem("multimart-token");
      const data = await apiRequest("/orders", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const remoteOrders = Array.isArray(data) ? data : data.orders || data.data?.orders || [];
      const latest = remoteOrders.find((item) =>
        String(item.orderId || item._id) === String(order.orderId)
      );
      if (!latest) {
        setNotice("No newer tracking update is available yet");
        return;
      }
      setOrders((current) => current.map((item) => item.orderId === order.orderId
        ? { ...item, ...latest, orderId: item.orderId, shippingAddress: latest.shippingAddress || item.shippingAddress }
        : item));
      setNotice("Tracking details refreshed");
    } catch {
      setNotice("Tracking refresh is unavailable while the order service is offline");
    }
  };

  return (
    <div className="app">
      {notice && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "14px 20px",
            borderRadius: 10,
            background: "#171717",
            color: "#fff",
            border: "1px solid #d4af37",
            maxWidth: "90vw",
          }}
        >
          {notice}
        </div>
      )}

      <nav className="navbar">
        <button
          className="logo"
          onClick={() => scrollToSection("home")}
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Multi<span>Mart</span>
        </button>

        <div className="nav-links">
          <button onClick={() => scrollToSection("home")}>Home</button>
          <button onClick={() => scrollToSection("categories")}>
            Categories
          </button>
          <button onClick={() => scrollToSection("products")}>Products</button>
          <button onClick={() => scrollToSection("seller")}>
            Become a Seller
          </button>
          <button onClick={() => { setShowOrders(true); setShowCart(false); setShowWishlist(false); }}>
            My Orders{orders.length ? ` (${orders.length})` : ""}
          </button>
        </div>

        {showSearch && (
          <div className="search-box">
            <input
              type="search"
              placeholder="Search products..."
              value={searchText}
              autoFocus
              onChange={(event) => {
                setSearchText(event.target.value);
                setShowWishlist(false);
                setShowCart(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") scrollToSection("products");
              }}
            />
          </div>
        )}

        <div className="nav-actions">
          <button
            className="nav-icon"
            title="Search"
            onClick={() => {
              setShowSearch((current) => !current);
              setShowCart(false);
              setShowWishlist(false);
            }}
          >
            ⌕
          </button>

          <button
            className="nav-icon"
            title="Wishlist"
            onClick={() => {
              setShowWishlist(true);
              setShowCart(false);
              setShowSearch(false);
            }}
          >
            ♡
            {wishlist.length > 0 && (
              <span className="cart-badge">{wishlist.length}</span>
            )}
          </button>

          <button
            className="nav-icon cart-button"
            title="Cart"
            onClick={() => {
              setShowCart(true);
              setShowWishlist(false);
              setShowSearch(false);
            }}
          >
            🛒
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>

          {user ? (
            <button className="login" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="login" onClick={() => setShowLogin(true)}>
              Login
            </button>
          )}
        </div>
      </nav>

      {showCart ? (
        <main className="cart-page">
          <div className="cart-glow glow-one" />
          <div className="cart-glow glow-two" />
          <div className="cart-glow glow-three" />

          <main className="cart-main">
            <button
              className="back-shopping"
              onClick={() => setShowCart(false)}
            >
              ← Back to Shopping
            </button>

            <div className="cart-title">
              <p>YOUR SHOPPING BAG</p>
              <h1>
                Your <span>Cart</span>
              </h1>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add some products and come back here.</p>
                <button onClick={() => scrollToSection("products")}>
                  Start Shopping →
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="trendy-cart-item" key={item._id}>
                      <div className="item-glow" />
                      <div className="product-image-wrap">
                        <img src={item.image} alt={item.name} />
                      </div>

                      <div className="product-info">
                        <h2>{item.name}</h2>
                        <p className="seller-name">
                          Sold by <span>{item.seller}</span>
                        </p>
                        <strong className="product-price">
                          {formatPrice(getPrice(item))}
                        </strong>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginTop: 12,
                          }}
                        >
                          <button
                            onClick={() => changeQuantity(item._id, -1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span>{item.quantity || 1}</span>
                          <button
                            onClick={() => changeQuantity(item._id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="remove-product"
                          onClick={() => removeFromCart(item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-bottom">
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>

                  <button
                    className="checkout-neon-btn"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout <b>→</b>
                  </button>
                </div>
              </>
            )}
          </main>
        </main>
      ) : showWishlist ? (
        <main className="section">
          <div className="section-title">
            <div>
              <p>SAVED ITEMS</p>
              <h2>Your Wishlist</h2>
            </div>
            <button
  className="wishlist-close-btn"
  onClick={() => setShowWishlist(false)}
>
  Close
</button>
          </div>

          {wishlist.length === 0 ? (
            <p>Your wishlist is empty.</p>
          ) : (
            <div className="product-grid">
              {wishlist.map((product) => (
                <div className="product-card" key={product._id}>
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <strong>{formatPrice(getPrice(product))}</strong>
                    <button
                      className="add-cart"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                    <button
  className="remove-wishlist-btn"
  onClick={() => toggleWishlist(product)}
>
  Remove from Wishlist
</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : showOrders ? (
        <main className="orders-page">
          <button className="back-shopping" onClick={() => setShowOrders(false)}>← Back to Shopping</button>
          <div className="orders-heading">
            <p className="eyebrow">YOUR MULTIMART PURCHASES</p>
            <h1>Order <span>Details & Tracking</span></h1>
            <p>Customer, delivery address, and shipment progress for your orders.</p>
          </div>
          {orders.length === 0 ? (
            <section className="empty-orders">
              <div className="empty-icon">📦</div>
              <h2>No orders yet</h2>
              <p>Your placed orders and delivery updates will appear here.</p>
              <button className="primary-btn" onClick={() => setShowOrders(false)}>Continue shopping</button>
            </section>
          ) : (
            <div className="order-list">
              {orders.map((order) => {
                const address = order.shippingAddress || {};
                const customer = order.customer || {};
                const status = order.status || order.orderStatus || "Order Placed";
                const normalized = String(status).toLowerCase();
                const currentStep = normalized.includes("out for") ? 4
                  : normalized.includes("deliver") ? 5
                  : normalized.includes("ship") || normalized.includes("transit") ? 3
                  : normalized.includes("pack") || normalized.includes("process") ? 2
                  : normalized.includes("confirm") ? 1 : 0;
                const steps = ["Order placed", "Confirmed", "Packed", "Shipped", "Out for delivery", "Delivered"];
                return (
                  <article className="order-card" key={order.orderId}>
                    <div className="order-card-head">
                      <div><p className="eyebrow">ORDER ID</p><h2>{order.orderId}</h2></div>
                      <span className="order-status">{status}</span>
                    </div>
                    <p className="order-date">Placed {new Date(order.createdAt || Date.now()).toLocaleString()}</p>
                    <div className="order-section">
                      <h3>Customer & delivery details</h3>
                      <p><strong>{address.name || customer.name || "Customer"}</strong>{address.phone ? ` · ${address.phone}` : ""}</p>
                      {customer.email && <p>{customer.email}</p>}
                      <p>{[address.address, address.city, address.pincode].filter(Boolean).join(", ") || "Delivery address not provided"}</p>
                    </div>
                    <div className="order-section">
                      <h3>Products</h3>
                      {(order.items || []).map((item, index) => (
                        <div className="order-product" key={`${item.productId || item._id || item.name}-${index}`}>
                          {item.image && <img src={item.image} alt={item.name || "Ordered product"} />}
                          <div><strong>{item.name || item.title || "Product"}</strong><p>Qty {item.quantity || 1} · {formatPrice(item.price || 0)}</p></div>
                        </div>
                      ))}
                      <div className="order-total"><span>Order total</span><strong>{formatPrice(order.totalAmount || order.total || 0)}</strong></div>
                    </div>
                    <div className="order-section tracking-section">
                      <div className="tracking-title"><div><h3>Shipment progress</h3><p>Current update: <strong>{status}</strong></p></div>
                        <button className="tracking-refresh" onClick={() => refreshOrderTracking(order)}>Refresh status</button></div>
                      <div className="tracking-steps">
                        {steps.map((step, index) => <div className={`tracking-step ${index <= currentStep ? "is-complete" : ""} ${index === currentStep ? "is-current" : ""}`} key={step}>
                          <span className="tracking-dot">{index < currentStep ? "✓" : index + 1}</span><span>{step}</span>
                        </div>)}
                      </div>
                      <p className="tracking-note">Shipment status is shown from the order service when available. Use Refresh status to check for the latest update.</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        <>
          <section className="hero" id="home">
            <div className="hero-content">
              <p className="eyebrow">THE FUTURE OF ONLINE SHOPPING</p>

              <h1>
                Shop Smarter.
                <br />
                <span>Live Better.</span>
              </h1>

              <p className="hero-text">
                Discover premium products from trusted sellers, compare
                prices, and enjoy a modern shopping experience built for the
                next generation.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-btn"
                  onClick={() => scrollToSection("products")}
                >
                  Explore Products →
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => scrollToSection("categories")}
                >
                  Browse Categories
                </button>
              </div>

              <div className="trust">
                <div>
                  <strong>
                    {backendConnected
                      ? `${backendProducts.length}+`
                      : "10K+"}
                  </strong>
                  <small>Products</small>
                </div>
                <div>
                  <strong>500+</strong>
                  <small>Trusted Sellers</small>
                </div>
                <div>
                  <strong>25K+</strong>
                  <small>Happy Customers</small>
                </div>
              </div>
            </div>

            <div className="hero-orbit">
              <div className="orbit-ring ring-one" />
              <div className="orbit-ring ring-two" />
              <div className="orbit-ring ring-three" />

              <div className="multimart-core">
                <div className="core-cart">🛒</div>
                <div className="core-logo">
                  Multi<span>Mart</span>
                </div>
              </div>

              <div className="orbit-product product-top">
                <div className="product-glow" />
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=90"
                  alt="Wireless Headphones"
                />
              </div>

              <div className="orbit-product product-left">
                <div className="product-glow" />
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=90"
                  alt="Shopping accessories"
                />
              </div>

              <div className="orbit-product product-right">
                <div className="product-glow" />
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=90"
                  alt="Smart Watch"
                />
              </div>

              <div className="orbit-product product-bottom">
                <div className="product-glow" />
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=90"
                  alt="Running Shoes"
                />
              </div>
            </div>
          </section>

          <section className="section" id="categories">
            <div className="section-title">
              <div>
                <p>EXPLORE</p>
                <h2>Shop by Category</h2>
              </div>
              <button
                className="view-all"
                onClick={() => {
                  setSelectedCategory("All");
                  scrollToSection("products");
                }}
              >
                View All →
              </button>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <button
                  className="category-card"
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    scrollToSection("products");
                  }}
                  style={{
                    padding: 0,
                    border: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <img src={category.image} alt={category.name} />
                  <div className="category-overlay">
                    <h3>{category.name}</h3>
                    <span>{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="section products-section" id="products">
            <div className="section-title">
              <div>
                <p>TRENDING NOW</p>
                <h2>
                  {selectedCategory === "All"
                    ? "Featured Products"
                    : selectedCategory}
                </h2>
              </div>

              <button
                className="view-all"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchText("");
                }}
              >
                Clear Filters
              </button>
            </div>

            {showSearch && (
              <div className="search-box" style={{ marginBottom: 24 }}>
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
            )}

            {loadingProducts && (
              <p>Loading products...</p>
            )}

            <div className="product-grid">
              {filteredProducts.map((product) => {
                const wished = wishlist.some(
                  (item) => item._id === product._id
                );

                return (
                  <div className="product-card" key={product._id}>
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />

                      {product.discount && (
                        <span className="discount">
                          {product.discount}
                        </span>
                      )}

                      <button
                        className="wishlist"
                        title="Add to wishlist"
                        onClick={() => toggleWishlist(product)}
                      >
                        {wished ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="product-info">
                      <p className="seller">Sold by {product.seller}</p>
                      <h3>{product.name}</h3>

                      <div className="rating">
                        {product.rating}
                        <span> ({product.reviews})</span>
                      </div>

                      <div className="price">
                        <strong>{formatPrice(getPrice(product))}</strong>
                        {product.oldPrice > getPrice(product) && (
                          <del>{formatPrice(product.oldPrice)}</del>
                        )}
                      </div>

                      <button
                        className="add-cart"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {!loadingProducts && filteredProducts.length === 0 && (
              <p>No products found. Try another search or category.</p>
            )}
          </section>

          <section className="seller-banner" id="seller">
            <div>
              <p className="eyebrow">GROW WITH MULTIMART</p>
              <h2>
                Turn Your Products
                <br />
                Into a Business.
              </h2>
              <p>
                Join MultiMart as a seller and reach customers with inventory
                management and a modern marketplace experience.
              </p>
              <button
                className="primary-btn"
                onClick={() => setShowLogin(true)}
              >
                Login to Get Started →
              </button>
            </div>

            <div className="seller-stat">
              <strong>500+</strong>
              <span>Active Sellers</span>
            </div>
          </section>

          <footer>
            <div>
              <h2>
                Multi<span>Mart</span>
              </h2>
              <p>A smarter marketplace for everyone.</p>
            </div>

            <div className="footer-links">
              <button onClick={() => scrollToSection("home")}>Home</button>
              <button onClick={() => scrollToSection("categories")}>
                Categories
              </button>
              <button onClick={() => scrollToSection("products")}>
                Products
              </button>
              <button onClick={() => scrollToSection("seller")}>Sellers</button>
            </div>

            <div className="copyright">
              <p>© 2026 MultiMart. All rights reserved.</p>
            </div>
          </footer>
        </>
      )}

      {showLogin && (
        <div
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowLogin(false);
          }}
          style={modalOverlayStyle}
        >
          <form onSubmit={handleLogin} style={modalStyle}>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              style={closeButtonStyle}
            >
              ×
            </button>

            <p className="eyebrow">WELCOME BACK</p>
            <h2>Login to MultiMart</h2>

            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm({ ...loginForm, email: event.target.value })
              }
              placeholder="Enter your email"
              style={inputStyle}
            />

            <label style={labelStyle}>Password</label>
            
<div style={{ position: "relative", width: "100%" }}>
  <input
    type={showPassword ? "text" : "password"}
    value={loginForm.password}
    onChange={(event) =>
      setLoginForm((current) => ({
        ...current,
        password: event.target.value,
      }))
    }
    placeholder="Enter your password"
    style={{ ...inputStyle, width: "100%", paddingRight: 75 }}
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword((current) => !current)}
    style={{
      position: "absolute",
      right: 10,
      top: "50%",
      transform: "translateY(-50%)",
      background: "transparent",
      border: "none",
      color: "#d4af37",
      cursor: "pointer",
    }}
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>


            <button
              type="submit"
              className="primary-btn"
              disabled={requestLoading}
              style={{ width: "100%", marginTop: 20 }}
            >
              {requestLoading ? "Please wait..." : "Login"}
            </button>
          </form>
        </div>
      )}

      {showCheckout && (
        <div
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowCheckout(false);
          }}
          style={modalOverlayStyle}
        >
          <form onSubmit={handleCheckout} style={modalStyle}>
            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              style={closeButtonStyle}
            >
              ×
            </button>

            <p className="eyebrow">DELIVERY DETAILS</p>
            <h2>Checkout</h2>

            <p>
              Order total: <strong>{formatPrice(cartTotal)}</strong>
            </p>

            {[
              ["name", "Full Name", "text"],
              ["phone", "Phone Number", "tel"],
              ["address", "Full Address", "text"],
              ["city", "City", "text"],
              ["pincode", "PIN Code", "text"],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={type}
                  required
                  value={checkoutForm[key]}
                  onChange={(event) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      [key]: event.target.value,
                    })
                  }
                  placeholder={label}
                  style={inputStyle}
                />
              </div>
            ))}

            <button
              type="submit"
              className="primary-btn"
              disabled={requestLoading}
              style={{ width: "100%", marginTop: 20 }}
            >
              {requestLoading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  overflowY: "auto",
};

const modalStyle = {
  position: "relative",
  width: "100%",
  maxWidth: 440,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#111116",
  color: "#fff",
  border: "1px solid #d4af37",
  borderRadius: 16,
  padding: 28,
};

const closeButtonStyle = {
  position: "absolute",
  top: 12,
  right: 16,
  background: "transparent",
  color: "#fff",
  border: 0,
  fontSize: 28,
  cursor: "pointer",
};

const labelStyle = {
  display: "block",
  marginTop: 14,
  marginBottom: 6,
  color: "#ddd",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid #444",
  background: "#1b1b22",
  color: "#fff",
  outline: "none",
};

export default App;


const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("MultiMart Backend is running!");
});

// Products API
app.get("/api/products", (req, res) => {
  res.json([
    {
      name: "Sony Wireless Headphones",
      seller: "TechZone",
      price: "₹2,499",
      oldPrice: "₹3,999",
      discount: "38% OFF",
      rating: "4.7 ★",
      reviews: "2.4k",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Premium Smart Watch",
      seller: "Digital World",
      price: "₹1,999",
      oldPrice: "₹3,499",
      discount: "43% OFF",
      rating: "4.6 ★",
      reviews: "1.8k",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Nike Running Shoes",
      seller: "SportX",
      price: "₹3,299",
      oldPrice: "₹5,499",
      discount: "40% OFF",
      rating: "4.8 ★",
      reviews: "3.1k",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    },
    {
      name: "Premium Travel Backpack",
      seller: "Urban Store",
      price: "₹1,499",
      oldPrice: "₹2,499",
      discount: "40% OFF",
      rating: "4.5 ★",
      reviews: "1.2k",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    },
  ]);
});

// Place Order API
app.post("/api/orders", (req, res) => {
  const { items, customer, shippingAddress, totalAmount } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Your cart is empty",
    });
  }

  if (
    !shippingAddress ||
    !shippingAddress.name ||
    !shippingAddress.phone ||
    !shippingAddress.address ||
    !shippingAddress.city ||
    !shippingAddress.pincode
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all delivery details",
    });
  }

  const order = {
    orderId: "MM" + Date.now(),
    customer: customer || {
      name: shippingAddress.name,
    },
    items,
    shippingAddress,
    totalAmount,
    status: "Order Placed",
    createdAt: new Date().toISOString(),
  };

  console.log("New order received:", order);

  return res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    order,
  });
});

// Start server
app.listen(5000, () => {
  console.log("MultiMart Backend running on http://localhost:5000");
});

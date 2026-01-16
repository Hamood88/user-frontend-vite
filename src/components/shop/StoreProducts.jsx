import React, { useEffect, useState } from "react";
import axios from "axios";

const StoreProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("storeToken");
        const res = await axios.get("http://localhost:5000/api/store/my-products", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ marginLeft: 220, padding: 40 }}>
      <h2>My Products</h2>
      <ul>
        {products.map(product => (
          <li key={product._id} style={{ marginBottom: 30 }}>
            <div><b>{product.name}</b></div>
            <div>{product.description}</div>
            <div>Views: {product.views || 0}</div>
            {/* Show photo/video thumbnails if needed */}
          </li>
        ))}
      </

import React, { useState } from "react";
import axios from "axios";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gender: "",
    ageFrom: "",
    ageTo: "",
    interest: "",
    sport: "",
  });

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    if (name === "image") setImage(files[0]);
    if (name === "video") setVideo(files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem("storeToken");

    const form = new FormData();
    Object.entries(formData).forEach(([key, val]) => form.append(key, val));
    if (image) form.append("image", image);
    if (video) form.append("video", video);

    try {
      await axios.post("http://localhost:5000/api/store/add-product", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("✅ Product added successfully!");
      setFormData({
        name: "",
        description: "",
        gender: "",
        ageFrom: "",
        ageTo: "",
        interest: "",
        sport: "",
      });
      setImage(null);
      setVideo(null);
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.message || "Upload failed"));
    }
  };

  return (
    <div style={{ marginLeft: 220, padding: 40 }}>
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required /><br /><br />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Product Description" /><br /><br />
        
        <label>Target Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">--Select--</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="any">Any</option>
        </select><br /><br />

        <label>Target Age Range:</label>
        <input type="number" name="ageFrom" value={formData.ageFrom} onChange={handleChange} placeholder="From" required />
        <input type="number" name="ageTo" value={formData.ageTo} onChange={handleChange} placeholder="To" required /><br /><br />

        <input type="text" name="interest" value={formData.interest} onChange={handleChange} placeholder="Interest match (e.g. Music, Fitness)" /><br /><br />
        <input type="text" name="sport" value={formData.sport} onChange={handleChange} placeholder="Favorite Sport (optional)" /><br /><br />

        <label>Upload Product Image:</label>
        <input type="file" name="image" accept="image/*" onChange={handleFileChange} /><br /><br />

        <label>Upload Product Video:</label>
        <input type="file" name="video" accept="video/*" onChange={handleFileChange} /><br /><br />

        <button type="submit" style={{ padding: 10, fontWeight: "bold" }}>Add Product</button>
      </form>
      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
};

export default AddProduct;

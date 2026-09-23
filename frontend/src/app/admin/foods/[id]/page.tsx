"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiArrowLeft, FiSave, FiUpload } from "react-icons/fi";
import Link from "next/link";
import { uploadImage, getFoodById } from "@/lib/api";

export default function EditFoodPage() {
  const router = useRouter();
  const params = useParams();
  const foodId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    prepTime: "",
    available: true,
  });

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await getFoodById(foodId);
        if (res.success && res.data) {
          setFormData({
            name: res.data.name || "",
            description: res.data.description || "",
            price: res.data.price?.toString() || "",
            category: res.data.category?.toLowerCase() || "",
            image: res.data.image || "",
            prepTime: res.data.prepTime?.toString() || "15",
            available: res.data.available !== false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch food", error);
      } finally {
        setFetching(false);
      }
    };
    
    if (foodId) fetchFood();
  }, [foodId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const res = await uploadImage(file);
      if (res.success && res.data) {
        setFormData({ ...formData, image: res.data.url });
      } else {
        alert("Upload failed: " + res.message);
      }
    } catch (error) {
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/foods/${foodId}`;
      
      const payload = {
        ...formData,
        price: Number(formData.price),
        prepTime: Number(formData.prepTime || 15),
      };

      const res = await fetch(url, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        router.push("/admin/foods");
      } else {
        alert(data.message || "Failed to update food");
      }
    } catch (err) {
      alert("Error saving food item");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="animate-pulse bg-white h-64 rounded-2xl p-8">Loading...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/foods" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <FiArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Food</h1>
          <p className="text-gray-500 mt-1">Update menu item details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Food Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. Classic Cheeseburger"
            />
          </div>
          
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Describe the dish..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Price (৳)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="350"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="" disabled>Select a category</option>
              <option value="burgers">Burgers</option>
              <option value="pizza">Pizza</option>
              <option value="asian">Asian</option>
              <option value="salads">Salads</option>
              <option value="desserts">Desserts</option>
              <option value="drinks">Drinks</option>
              <option value="burger">Burger</option>
              <option value="sushi">Sushi</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Prep Time (minutes)</label>
            <input
              type="number"
              name="prepTime"
              required
              value={formData.prepTime}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="15"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Image</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 border border-gray-200"
              >
                <FiUpload />
                {uploadingImage ? "Uploading..." : "Change Image"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              {formData.image && (
                <div className="h-10 w-10 relative rounded overflow-hidden">
                  <img src={formData.image} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>
            {formData.image && (
              <input type="hidden" name="image" value={formData.image} />
            )}
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Available for order</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 shadow-sm"
          >
            <FiSave className="w-5 h-5" />
            {loading ? "Updating..." : "Update Food Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

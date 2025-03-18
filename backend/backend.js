import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/models', express.static(path.join(__dirname, 'models')));

// Sample items data with unique IDs and model file paths
const items = [
    { id: "1", title: "Item One", description: "Description for Item One", price: 10, category: "A", image: "https://tailwind-generator.b-cdn.net/images/card-generator/tailwind-card-generator-card-preview.png", modelPath: "/models/apple_pencil.glb" },
    { id: "2", title: "Item Two", description: "Description for Item Two", price: 20, category: "B", image: "https://tailwind-generator.b-cdn.net/images/card-generator/tailwind-card-generator-card-preview.png", modelPath: "/models/model.glb" },
    { id: "3", title: "Item Three", description: "Description for Item Three", price: 30, category: "A", image: "https://tailwind-generator.b-cdn.net/images/card-generator/tailwind-card-generator-card-preview.png", modelPath: "/models/model3.glb" }
];

app.post("/listing/3d/", (req, res) => {
    const { id } = req.body;
    console.log("Received ID:", id);  // Debugging log
    const item = items.find(item => item.id === String(id));
    
    if (!item) {
        console.log("Item not found for ID:", id);
        return res.status(404).json({ error: "Item not found" });
    }

    // Send back the full item data including the model URL
    const response = {
        ...item,
        modelURL: `http://localhost:${PORT}${item.modelPath}`
    };
    console.log("Sending response:", JSON.stringify(response, null, 2));  // Pretty print the response
    res.json(response);
});

// Endpoint to fetch items with sorting, filtering, and pagination
app.post("/items", (req, res) => {
    const { sort, index, count } = req.body;
    const [minPrice, maxPrice, search, category] = sort;
    
    let filteredItems = [...items];
    
    // Filter by price range
    filteredItems = filteredItems.filter(item => item.price >= minPrice && item.price <= maxPrice);
    
    // Filter by category if provided
    if (category) {
        filteredItems = filteredItems.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    
    // Filter by search keyword in title or description
    if (search != "") {
        filteredItems = filteredItems.filter(item => 
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Sort items by price (ascending)
    filteredItems.sort((a, b) => a.price - b.price);
    
    // Paginate results
    const paginatedItems = filteredItems.slice(index, index + count);
    
    res.json({ 
        items: paginatedItems, 
        index: index + count,
        hasMore: index + count < filteredItems.length 
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

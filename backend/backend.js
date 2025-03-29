import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/models', express.static(path.join(__dirname, 'models')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Sample items data with unique IDs and model file paths
const items = [
    { id: "1", title: "Apple Pencil", description: "Someone's parents are going to be mad...", price: 60, seller: "John Doe", category: "A", image: "/images/Screenshot 2025-03-26 at 2.01.36 PM.png", modelPath: "/models/apple_pencil.glb" },
    { id: "2", title: "Cube", description: "Kevin the Cube", price: 20, seller: "Kevin the Cube", category: "B", image: "/images/image.png", modelPath: "/models/model.glb" },
    { id: "3", title: "AirPod Max", description: "Do people actually buy these?", price: 30, seller: "TJ Louie", category: "A", image: "/images/Screenshot 2025-03-26 at 2.15.05 PM.png", modelPath: "/models/model.glb" },
];

app.post("/listing/3d/", (req, res) => {
    const { id } = req.body;
    console.log("3D: Received ID:", id);  // Debugging log
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
    //filteredItems.sort((a, b) => a.price - b.price);
    
    // Paginate results
    const paginatedItems = filteredItems.slice(index, index + count);
    
    res.json({ 
        items: paginatedItems, 
        index: index + count,
        hasMore: index + count < filteredItems.length 
    });
});

app.post("/checkout", (req, res) => {
    const { id } = req.body;
    console.log("Checkout: Received ID:", id);  // Debugging log
    const item = items.find(item => item.id === String(id));
    
    if (!item) {
        console.log("Item not found for ID:", id);
        return res.status(404).json({ error: "Item not found" });
    }

    const response = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        seller: item.seller
    };
    console.log("Sending response:", JSON.stringify(response, null, 2));  // Pretty print the response
    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

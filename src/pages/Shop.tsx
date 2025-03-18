import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import { ChartNoAxesCombined } from "lucide-react";

export default function Shop() {
    const [items, setItems] = useState<{ id: number; title: string; description: string; price: number; category: string; image: string; }[]>([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [count, setCount] = useState(3);
    const [index, setIndex] = useState(0);
    const [fail, setFail] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); 

    const fetchItems = async (reset = false) => {
        if (isLoading || (!hasMore && !reset)) return;
        
        const requestId = Math.random().toString(36).substring(7);
        console.log(`Starting fetch ${requestId}`, new Date().toISOString());
        setIsLoading(true);
        
        try {
            const res = await fetch("http://localhost:3000/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sort: [minPrice, maxPrice, search, category],
                    index: reset ? 0 : index,
                    count
                }),
            });
            const data = await res.json();
            
            setItems(prevItems => reset ? data.items : [...prevItems, ...data.items]);
            setIndex(data.index);
            setHasMore(data.hasMore);
            setFail(false);
        } catch (error) {
            console.error(`Error in fetch ${requestId}:`, error);
            setFail(true);
        }
        setIsLoading(false);
        console.log(`Completed fetch ${requestId}`, new Date().toISOString());
    };

    const routeChange = (route: string) =>{ 
        let path = route; 
        navigate(path);
    }

    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchItems(true);
            initialFetchDone.current = true;
            return;
        }
        
        // Reset and fetch when filters change
        fetchItems(true);
    }, [minPrice, maxPrice, search, category]);

    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchItems();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLoading]);

    return (
        <div className="scrollbar-hide overflow-hidden">
            <div className="bg-gradient-to-b from-gray-800 to-black font-[mokoto] tracking-wide py-10">
                <div className="flex justify-end mr-5">
                    <Navbar onStateChange={setIsNavOpen}/>
                </div>
                <motion.div 
                    className="mt-4 w-full flex-1 flex flex-col"
                    animate={{
                        y: isNavOpen ? 40 : 0,
                        opacity: isNavOpen ? 0.8 : 1,
                        scale: isNavOpen ? 0.98 : 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                >
                <div className="flex flex-wrap gap-7 px-3 py-3 justify-center pt-[2%]">
                    {items.map((item, index) => (
                    <div 
                    key={index} 
                    className="flex flex-col rounded-2xl w-[30%] bg-slate-500 shadow-[-1px_-4px_16px_1px_rgba(191,_113,_250,_0.15)] 
                                transition-transform transform hover:scale-105 cursor-pointer"
                                style={{ backfaceVisibility: "hidden", willChange: "transform" }}
                                onClick={() => navigate(`/listing/${item.id}`, { state: { item } })}
                    >
                    <figure className="flex items-center justify-center h-64 overflow-hidden rounded-t-2xl">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </figure>
                    <div className="flex flex-col p-8">
                        <div className="text-2xl font-bold text-white pb-6">{item.title}</div>
                        <div className="text-lg text-white">{item.description}</div>
                        <div className="flex items-center gap-4 pt-4">
                        <div className="grid grid-cols-3 xl:grid-cols-3 gap-4 flex-grow">
                        <button 
                            className="w-full h-16 bg-slate-500/10 backdrop-blur-2xl backdrop-brightness-150 shadow-lg rounded-xl 
                                        text-white font-bold text-lg text-center flex items-center justify-center col-span-2 
                                        hover:bg-slate-500/50 active:scale-95 transition-transform"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                window.location.href = "/pricing/";
                            }}
                            >
                            {item.price}
                        </button>
                        <button 
                            className="w-full h-16 bg-blue-900 rounded-xl col-span-1 flex items-center justify-center 
                                        hover:bg-blue-900/80 active:scale-95 transition-transform"
                            onClick={(e) => { 
                                e.stopPropagation();
                                window.location.href = "/chart/" + item.title;
                            }}
                            >
                            <ChartNoAxesCombined strokeWidth={0.75} className="size-10 text-white" />
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>
                    ))} 
                </div>
                <div ref={observerTarget} className="mt-8 text-center">
                    {isLoading && (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    )}
                    {!hasMore && items.length > 0 && (
                        <p className="text-gray-600">No more items to load :(<br/>Check out our upcoming drops for future items!</p>
                    )}
                </div>
                </motion.div>
            </div>
        </div>
      );
};

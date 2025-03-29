import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/navbar';

export default function Checkout() {
    const {id} = useParams();
    const [showPayment, setShowPayment] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [itemData, setItemData] = useState<any>({
        id: 0,
        title: '',
        description: '',
        price: 0,
        category: '',
        seller: '',
        image: '',
    });

    useEffect(() => {
        fetch('http://localhost:3000/checkout', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        })
        .then(res => res.json())
        .then(data => {
            console.log('Received data:', data);
            setItemData(data);
        })
        .catch(err => {
            console.error('Error:', err);
        });
    }, [id]);

    const cardVariants = {
        hidden: { x: -1000, zIndex: 0 },
        visible: { x: 0, zIndex: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    return (
        <div className="bg-gradient-to-b from-gray-800 to-black font-[mokoto] tracking-wide py-10 text-white min-h-screen">
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
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative md:col-span-1">
                        {/* Stack both cards in the same grid cell */}
                        <motion.div 
                            className="absolute w-full"
                            animate={showPayment ? "hidden" : "visible"}
                            variants={cardVariants}
                            initial="visible"
                        >
                            <div className="flex flex-col rounded-2xl bg-slate-500 shadow-[-1px_-4px_16px_1px_rgba(191,_113,_250,_0.15)]">
                                <figure className="flex items-center justify-center h-64 overflow-hidden rounded-t-2xl">
                                    <img src={`http://localhost:3000${itemData.image}`} alt={itemData.title} className="w-full h-full object-cover" />
                                </figure>
                                <div className="flex flex-col p-8">
                                    <div className="text-2xl font-bold text-white pb-6">{itemData.title}</div>
                                    <div className="text-lg text-white pb-4 overflow-y-scroll max-h-[200px]">{itemData.description}</div>
                                    <div className="text-lg text-white pb-4">Seller: {itemData.seller}</div>
                                    <div className="text-xl font-bold text-white pb-6">Price: ${itemData.price}/Month</div>
                                    <button 
                                        className="w-full h-16 bg-purple-600 shadow-lg rounded-xl 
                                                text-white font-bold text-lg text-center flex items-center justify-center 
                                                hover:bg-purple-700 active:scale-95 transition-transform"
                                        onClick={() => setShowPayment(true)}
                                    >
                                        Proceed to Payment
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="absolute w-full"
                            animate={showPayment ? "visible" : "hidden"}
                            variants={cardVariants}
                            initial="hidden"
                        >
                            <div className="flex rounded-2xl bg-slate-500 shadow-[-1px_-4px_16px_1px_rgba(191,_113,_250,_0.15)]">
                                <div className="flex flex-col h-full p-8 justify-between text-left text-white w-full">
                                    <div>
                                        <div className="flex justify-between items-center pb-5">
                                            <div className="text-3xl font-bold">Payment Details</div>
                                            <button 
                                                className="text-white hover:text-purple-300 transition-colors"
                                                onClick={() => setShowPayment(false)}
                                            >
                                                ← Back to Product
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm pb-2">Card Holder Name</label>
                                                <input type="text" 
                                                    className="w-full p-2 rounded-lg bg-slate-600 text-white" 
                                                    placeholder="First Last"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm pb-2">Card Number</label>
                                                <input type="text" 
                                                    className="w-full p-2 rounded-lg bg-slate-600 text-white" 
                                                    placeholder="**** **** **** ****"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm pb-2">Expiry Date</label>
                                                    <input type="text" 
                                                        className="w-full p-2 rounded-lg bg-slate-600 text-white" 
                                                        placeholder="MM/YY"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm pb-2">CVV</label>
                                                    <input type="text" 
                                                        className="w-full p-2 rounded-lg bg-slate-600 text-white" 
                                                        placeholder="***"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full pt-6">
                                        <div className="flex justify-between text-xl pb-4">
                                            <span>Total Amount:</span>
                                            <span>${itemData.price}/Month</span>
                                        </div>
                                        <button 
                                            className="w-full h-16 bg-purple-600 shadow-lg rounded-xl 
                                                    text-white font-bold text-lg text-center flex items-center justify-center 
                                                    hover:bg-purple-700 active:scale-95 transition-transform"
                                        >
                                            Pay Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                 </div>
            </div>
        </motion.div>
        </div>
    );
}

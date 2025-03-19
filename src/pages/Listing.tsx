import { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';
import { MeshPhysicalMaterial, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import { ChartNoAxesCombined } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

interface ItemData {
    modelURL: string;
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string;
    seller: string;
}

const Model = ({ url }: { url: string }) => {
    const { scene, animations } = useGLTF(url);
    const { camera } = useThree();
    const { actions, names } = useAnimations(animations, scene);

    useEffect(() => {
        if (scene) {
            camera.position.set(0, 1, 0.5);
            camera.lookAt(0, 0, 0);
            
        }
    }, [scene, camera]);

    useEffect(() => {
        if (scene) {
            scene.traverse((child: Object3D) => {
                if (child instanceof Mesh) {
                    const mesh = child as Mesh;
                    const material = mesh.material;
                    if (material instanceof MeshStandardMaterial) {
                        const newMaterial = new MeshPhysicalMaterial({
                            color: material.color,
                            metalness: material.metalness,
                            roughness: material.roughness,
                            clearcoat: 1,
                            clearcoatRoughness: 0,
                        });
                        mesh.material = newMaterial;
                    }
                }
            });
        }
    }, [scene]);

    // If animations are available, play the first one.
    useEffect(() => {
        if (animations && animations.length > 0 && names.length > 0) {
            const firstAnimationName = names[0];
            if (actions[firstAnimationName]) {
                actions[firstAnimationName].play();
            }
        }
    }, [animations, actions, names]);

    // If no animations, spin the scene.
    useFrame(() => {
        if (!animations || animations.length === 0) {
            scene.rotation.y += 0.01;  // Rotate around the Y-axis
        }
    });


    return <primitive object={scene} />;
};

export default function Listing(props: { id: number }) {
    const [itemData, setItemData] = useState<ItemData>({
        modelURL: '',
        id: 0,
        title: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        seller: ''
    });

    useEffect(() => {
        fetch('http://localhost:3000/listing/3d/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: props.id }),
        })
        .then(res => res.json())
        .then(data => {
            console.log('Received data:', data);
            setItemData(data);
        })
        .catch(err => {
            console.error('Error:', err);
        });
    }, [props.id]);

    if (!itemData.modelURL) {
        return <div>Loading...</div>;
    }


    return (
        <div className="scrollbar-hide overflow-hidden bg-gradient-to-b from-gray-800 to-black font-[mokoto] w-full h-screen">
            <div className="grid grid-cols-3 xl:grid-cols-3 gap-4 flex-grow">
                {/* Left 2/3: 3D Model */}
                <div className="col-span-2 h-screen">
                    <Canvas>
                    <ambientLight intensity={1} />
                    <pointLight position={[0, 1, 0]} intensity={10} />
                    <directionalLight position={[0, 2, 0]} intensity={10}/>
                        <Suspense fallback={null}>
                            <Model url={itemData.modelURL} />
                        </Suspense>
                        <OrbitControls />
                    </Canvas>
                </div>

                {/* Right 1/3: Empty div */}
                <div className="col-span-1 h-screen flex flex-col overflow-hidden pr-[5%] pb-[5%]">
                    <div className="pt-[5%] flex justify-end pr-5">
                        <Navbar />
                    </div>
                    <div 
                        className="flex-1 flex flex-col rounded-2xl w-full bg-slate-500 shadow-[-1px_-4px_16px_1px_rgba(191,_113,_250,_0.15)] mt-4 overflow-hidden"
                    >
                        <div className="flex flex-col h-full p-8 justify-between">
                            <div>
                                <div className="text-2xl font-bold text-white pb-6">{itemData.title}</div>
                                <div className="text-lg text-white">{itemData.description}</div>
                            </div>
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
                                        {itemData.price}
                                    </button>
                                    <button 
                                        className="w-full h-16 bg-blue-900 rounded-xl col-span-1 flex items-center justify-center 
                                                    hover:bg-blue-900/80 backdrop-blur-2xl backdrop-brightness-150 shadow-lg active:scale-95 transition-transform"
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            window.location.href = "/chart/" + itemData.title;
                                        }}
                                        >
                                        <ChartNoAxesCombined strokeWidth={0.75} className="size-10 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

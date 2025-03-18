import { useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';
import { MeshPhysicalMaterial, Mesh, MeshStandardMaterial, Object3D } from 'three';

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
                <div className="col-span-1 bg-white h-screen">
                    {/* This can contain content later */}
                </div>
            </div>
        </div>
    );
}

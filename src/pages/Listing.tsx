import { useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

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
    const { scene } = useGLTF(url);
    const { camera } = useThree();
    
    useEffect(() => {
        if (scene) {
            camera.position.set(0, 0.5, 0.5);
            camera.lookAt(0, 0, 0);
        }
    }, [scene, camera]);

    if (!scene) return null;

    useFrame(() => {
        if (scene) {
            scene.rotation.y += 0.01;  // Rotate around the Y-axis
        }
    });

    return <primitive object={scene} />;
};

export default function Listing(props: { id: number}) {
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
            body: JSON.stringify({
                id: props.id
            }),
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
        <div className="scrollbar-hide overflow-hidden bg-gradient-to-b from-gray-800 to-black font-[mokoto]"style={{ width: '100%', height: '100vh' }}>
            <Canvas>
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} />
                <Suspense fallback={null}>
                    <Model url={itemData.modelURL} />
                </Suspense>
                <OrbitControls />
                <gridHelper />
            </Canvas>
        </div>
    );
}
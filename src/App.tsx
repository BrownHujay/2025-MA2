import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PriceChart from './components/priceChart';
import Home from "./pages/Home.tsx";
import Listing from "./pages/Listing.tsx";
import Shop from "./pages/Shop.tsx";

const queryClient = new QueryClient();

const ListingWrapper = () => {
  const { id } = useParams();
  return <Listing id={Number(id)} />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/listing/:id" element={<ListingWrapper />} />
          
          {/* Chart routes */}
          <Route path="/chart">
            {/* Optionally, render a prompt if no symbol is provided */}
            <Route index element={
              <div className="bg-gradient-to-b from-gray-800 to-black font-[mokoto] tracking-wide py-10 text-white text-center w-full h-screen">
                Please select a item to view 
              </div>
            } />
            <Route path=":symbol" element={<PriceChart />} />
            <Route path=":symbol/:startDate/:endDate" element={<PriceChart />} />
          </Route>
        </Routes>
    </QueryClientProvider>
  );
}

export default App;

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import type { PriceData } from '../types';
import Navbar from '../components/navbar';
import { motion } from 'framer-motion';

const fetchPriceData = async (
  symbol: string,
  startDate: string,
  endDate: string
): Promise<PriceData[]> => {
  const days = Math.floor(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const targetPoints = 40; // Keep the same number of data points
  const step = Math.max(2, Math.floor(days / targetPoints)); // Ensure at least a 2-day interval

  return Array.from({ length: targetPoints }, (_, i) => ({
    date: format(subDays(new Date(endDate), i * step), 'yyyy-MM-dd'),
    price: Math.random() * 1000 + 500,
  })).reverse();
};

export default function PriceChart() {
  const { symbol, startDate, endDate } = useParams();
  const navigate = useNavigate();

  const resolvedSymbol = symbol || 'Pencil';
  const defaultStartDate = startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const defaultEndDate = endDate || format(new Date(), 'yyyy-MM-dd');

  const [dateRange, setDateRange] = useState({
    start: defaultStartDate,
    end: defaultEndDate,
  });

  const [isNavOpen, setIsNavOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['priceData', resolvedSymbol, dateRange.start, dateRange.end],
    queryFn: () => fetchPriceData(resolvedSymbol, dateRange.start, dateRange.end),
  });

  const priceChange = useMemo(() => {
    if (!data || data.length < 2) return 0;
    return data[data.length - 1].price - data[0].price;
  }, [data]);

  const chartColor = priceChange >= 0 ? '#22C55E' : '#EF4444';

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [type]: value };
    setDateRange(newRange);
    navigate(`/chart/${resolvedSymbol}/${newRange.start}/${newRange.end}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 h-screen flex flex-col p-6">
      <div className="flex justify-end">
        <Navbar onStateChange={setIsNavOpen} />
      </div>
      <motion.div 
        className="mt-4 bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 w-full flex-1 flex flex-col"
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{resolvedSymbol} Price Chart</h2>
            {data && data.length > 0 && (
              <p className={`text-sm mt-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)} 
                ({((priceChange / data[0].price) * 100).toFixed(2)}%)
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border-gray-600 text-white rounded-lg 
                  focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border-gray-600 text-white rounded-lg 
                  focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#4B5563' }}
                stroke="#4B5563"
                dy={10}
                tickFormatter={(value, index) => {
                  const totalTicks = 4; // Number of dates to show
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  if (index % Math.floor(data.length / totalTicks) === 0) {
                    return value; // Show only some labels
                  }
                  return ''; // Hide others
                }}
              />
              <YAxis
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#4B5563' }}
                stroke="#4B5563"
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

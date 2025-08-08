"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import '../../../global.css';
import { useState } from "react";
import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart, Pie, Cell, PieLabelRenderProps
} from 'recharts';

export default function Home() {
  const router = useRouter();
  const [duration, setDuration] = useState("");

  const addCustomer = ()=>{
    router.push('/dashboard/customer');
  }
  const deposit = ()=>{
    router.push('/dashboard/wallet');
  }
  // Sample data for the chart
  const data = [
    { name: 'Jan', Collection: 162000, Investment: 120000, Loan: 85000 },
    { name: 'Feb', Collection: 88000, Investment: 82000, Loan: 85000 },
    { name: 'Mar', Collection: 30000, Investment: 68000, Loan: 85000 },
    { name: 'Apr', Collection: 82000, Investment: 155000, Loan: 85000 },
    { name: 'May', Collection: 200000, Investment: 105000, Loan: 85000 },
    { name: 'Jun', Collection: 192000, Investment: 125000, Loan: 85000 },
    { name: 'Jul', Collection: 125000, Investment: 170000, Loan: 85000 },
    { name: 'Aug', Collection: 162000, Investment: 73000, Loan: 85000 },
    { name: 'Sep', Collection: 170000, Investment: 85000, Loan: 85000 },
    { name: 'Oct', Collection: 160000, Investment: 118000, Loan: 85000 },
    { name: 'Nov', Collection: 100000, Investment: 35000, Loan: 85000 },
    { name: 'Dec', Collection: 120000, Investment: 65000, Loan: 85000 },
  ];
  const pie_data = [
    { name: 'Active', value: 20 },
    { name: 'Total', value: 80 },
  ];
  // The colors for each segment
  const PIE_COLORS = ['#A89CFB', '#2F85A5'];
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) => {
    if (cx === undefined || cy === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined || percent === undefined) {
      return null;
    }
    
    const numCx = Number(cx);
    const numCy = Number(cy);
    const numMidAngle = Number(midAngle);
    const numInnerRadius = Number(innerRadius);
    const numOuterRadius = Number(outerRadius);

    const radius = numInnerRadius + (numOuterRadius - numInnerRadius) * 0.5;
    const x = numCx + radius * Math.cos(-numMidAngle * Math.PI / 180);
    const y = numCy + radius * Math.sin(-numMidAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > numCx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const totalValue = pie_data.reduce((sum, entry) => sum + entry.value, 0);
  type CustomCenterTextProps = {
    totalValue: number;
  };
  const CustomCenterText = ({ totalValue }: CustomCenterTextProps) => (
    <div className="mt-[-130px] mb-[130px] text-center">
      <span className="text-xl font-bold text-gray-800">{totalValue}</span>
    </div>
  );

  
  return (
    <div className="">
      <h1 className="font-inter font-semibold text-2xl leading-8 ">Dashboard</h1>
      <div className="flex items-center">
        <p className="text-sm">Monitor overview of all activities across customers, agents and branch</p>
        <div className="ml-auto">
          <button type="button" onClick={addCustomer} className="auth-btn flex"> <img src="/icons/plus.png" alt="" />&nbsp;&nbsp; Add customer</button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="w-full md:w-6/12">
          <div className="flex dashboard-card bg-[#D3CDFE]">
            <div>
              <p className="text-sm">Live wallet balance</p>
              <p className="text-md text-black">₦20,000</p>
            </div>
            <div className="ml-auto">
              <button type="button" onClick={deposit} className="btn-sm">
                Deposit
              </button>
            </div>
          </div>
        </div>
        <div className="w-full md:w-6/12">
          <div className="dashboard-card bg-white flex flex-col md:flex-row">
            <div className="flex items-center">
              <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
              <div>
                <p className="text-sm">All collection wallet</p>
                <p className="text-md text-black">₦20,000</p>
              </div>
            </div>
            <div className="flex items-center ml-auto">
              <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
              <div>
                <p className="text-sm">Total due</p>
                <p className="text-md text-black">₦20,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="dashboard-card bg-white">
          <div className="flex items-center ml-auto">
            <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
            <div>
              <p className="text-sm">SMS unit balance</p>
              <p className="text-md text-black">8</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card bg-white">
          <div className="flex items-center ml-auto">
            <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
            <div>
              <p className="text-sm">Total collection</p>
              <p className="text-md text-black">8</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card bg-white">
          <div className="flex items-center ml-auto">
              <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
            <div>
              <p className="text-sm">Agents</p>
              <p className="text-md text-black">8</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card bg-white">
          <div className="flex items-center ml-auto">
            <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
            <div>
              <p className="text-sm">Customers</p>
              <p className="text-md text-black">8</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card bg-white">
          <div className="flex items-center ml-auto">
            <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
            <div>
              <p className="text-sm">Active loan</p>
              <p className="text-md text-black">8</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card bg-white">
          <div className="flex items-center ml-auto">
            <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
            <div>
              <p className="text-sm">Active investment</p>
              <p className="text-md text-black">8</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card bg-white">
          <div className="flex items-center ml-auto">
            <img src="/icons/tag.png" className="tag-icon" /> &nbsp;&nbsp;&nbsp;
            <div>
              <p className="text-sm">Active investment</p>
              <p className="text-md text-black">8</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="w-full md:w-8/12">
          <div className="dashboard-card bg-white">
            <div className="flex items-center">
              <p className="text-md text-black">Transaction stats</p>
              <div className="ml-auto relative" style={{width: '200px'}}>
                <select 
                    className="input-field appearance-none"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    >
                    <option value="Last 12 months">Last 12 months</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-9 flex items-center">
                  <img src="/icons/arrow-down.png" className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="chart-section">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}`}
                   
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend verticalAlign="top" align="center" height={36} />
                  <Bar dataKey="Collection" barSize={14} fill="#8884d8" />
                  <Bar dataKey="Loan" barSize={14} fill="#008080" />
                  <Line type="monotone" dataKey="Investment" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="w-full md:w-4/12">
            <div className="dashboard-card bg-white" style={{height: '100%'}}>
              <div className="flex items-center">
                <p className="text-md text-black">Agent vs Customers</p>
              </div>
              <div className="flex w-full items-center h-full">
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pie_data}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={5}
                          startAngle={90}
                          endAngle={450}
                          label={CustomLabel}
                          labelLine={false}
                        >
                          {/* Map over the data to assign a color to each segment */}
                          {pie_data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
          
                    <CustomCenterText totalValue={totalValue} />

                    <div className="flex justify-start mt-4 space-x-6">
                      {pie_data.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                          <span className="text-sm">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

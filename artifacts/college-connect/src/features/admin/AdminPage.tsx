import React from "react";
import { motion } from "framer-motion";
import { Bell, Settings, Download, Activity, AlertTriangle, CheckCircle, Info, ShoppingBag, ShieldAlert, TrendingUp, Users, Server, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

/**
 * @typedef {Object} StatData
 * @property {string} name
 * @property {number} users
 */

const chartData = [
  { name: "Mon", users: 38000 },
  { name: "Tue", users: 42000 },
  { name: "Wed", users: 41500 },
  { name: "Thu", users: 45000 },
  { name: "Fri", users: 48000 },
  { name: "Sat", users: 32000 },
  { name: "Sun", users: 35000 },
];

export default function Admin() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-8 h-16 flex items-center justify-between">
          <Tabs defaultValue="overview" className="w-[400px]">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="overview" className="font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="reports" className="font-medium text-slate-600">Reports</TabsTrigger>
              <TabsTrigger value="server" className="font-medium text-slate-600">Server Logs</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <Avatar className="h-9 w-9 border border-slate-200 cursor-pointer">
              <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
              <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Health Dashboard</h1>
            <p className="text-slate-500 mt-1 text-base font-medium">System-wide monitoring and moderation hub.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-200 text-slate-700 font-semibold shadow-sm bg-white hover:bg-slate-50">
              <Download className="mr-2 h-4 w-4" /> Export Reports
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
              <Activity className="mr-2 h-4 w-4" /> Quick Action
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active User Dynamics */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" /> Active User Dynamics
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold text-xs animate-pulse">
                  LIVE UPDATES
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Active</p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-3xl font-black text-slate-900">42.8k</h3>
                      <span className="text-sm font-bold text-emerald-600 mb-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" />+12%</span>
                    </div>
                  </div>
                  <div className="space-y-1 pl-6 border-l border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Verified (EDU)</p>
                    <h3 className="text-3xl font-black text-slate-900">38.2k</h3>
                  </div>
                  <div className="space-y-1 pl-6 border-l border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unverified</p>
                    <h3 className="text-3xl font-black text-slate-900">4.6k</h3>
                  </div>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="users" fill="#1e293b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Alerts */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200 shadow-sm bg-white h-full flex flex-col">
              <CardHeader className="pb-4 border-b border-slate-50">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Server className="h-5 w-5 text-slate-600" /> System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-50 bg-red-50/50 flex gap-4 items-start">
                  <div className="mt-0.5"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-red-900 leading-none mb-1.5">High CPU Latency</h4>
                    <p className="text-xs font-medium text-red-700/80 mb-2">Database cluster db-main-02 is experiencing 85% load.</p>
                    <span className="text-[10px] font-bold text-red-600 uppercase">2 mins ago</span>
                  </div>
                </div>
                <div className="p-4 border-b border-slate-50 flex gap-4 items-start">
                  <div className="mt-0.5"><CheckCircle className="h-5 w-5 text-emerald-500" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none mb-1.5">Backup Successful</h4>
                    <p className="text-xs font-medium text-slate-500 mb-2">Daily incremental backup completed for all user media.</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">1 hour ago</span>
                  </div>
                </div>
                <div className="p-4 border-b border-slate-50 flex gap-4 items-start">
                  <div className="mt-0.5"><Info className="h-5 w-5 text-blue-500" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none mb-1.5">API Version Deprecation</h4>
                    <p className="text-xs font-medium text-slate-500 mb-2">v1 endpoint usage dropped to 2%. Scheduled for teardown.</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">5 hours ago</span>
                  </div>
                </div>
                
                <div className="mt-auto p-4 pt-6">
                  <Button variant="outline" className="w-full text-slate-700 border-slate-200 font-semibold shadow-sm">View System Logs</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-blue-600" /> Marketplace Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Daily Volume</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-2xl font-black text-slate-900">$12,480</h3>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 mb-1">+4.2%</Badge>
                </div>
              </div>
              
              <div className="space-y-4 w-full">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Textbooks</span><span>54%</span>
                  </div>
                  <Progress value={54} className="h-2 bg-slate-100 [&>div]:bg-indigo-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Electronics</span><span>32%</span>
                  </div>
                  <Progress value={32} className="h-2 bg-slate-100 [&>div]:bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Services</span><span>14%</span>
                  </div>
                  <Progress value={14} className="h-2 bg-slate-100 [&>div]:bg-sky-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" /> Moderation Queue
              </CardTitle>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-bold">14 PENDING</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="mt-0.5"><AlertTriangle className="h-4 w-4 text-red-500" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Spam Post Report</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">Multiple users reported "Free Crypto" post in community.</p>
                </div>
              </div>
              <div className="p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="mt-0.5"><AlertTriangle className="h-4 w-4 text-amber-500" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Marketplace Dispute</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">Item not delivered. ID: #ORD-992</p>
                </div>
              </div>
              <div className="p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="mt-0.5"><AlertTriangle className="h-4 w-4 text-amber-500" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Fake ID Suspected</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">Student verification failed manual check.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader className="pb-4 border-b border-slate-700/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Reporting Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 text-2xl font-black text-emerald-400">98%</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span className="uppercase tracking-wider">Uptime</span>
                  </div>
                  <Progress value={98} className="h-1.5 bg-slate-700 [&>div]:bg-emerald-400" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 text-2xl font-black text-amber-400">12m</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span className="uppercase tracking-wider">Avg Response</span>
                  </div>
                  <Progress value={45} className="h-1.5 bg-slate-700 [&>div]:bg-amber-400" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 text-2xl font-black text-blue-400">2.1k</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span className="uppercase tracking-wider">New Signups</span>
                  </div>
                  <Progress value={65} className="h-1.5 bg-slate-700 [&>div]:bg-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

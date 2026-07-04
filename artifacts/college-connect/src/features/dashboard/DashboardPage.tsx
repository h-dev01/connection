import React from "react";
import { motion } from "framer-motion";
import { Search, Bell, Star, Settings, Trophy, FileText, Download, MoreHorizontal, ArrowRight, Clock, MessageSquare, ThumbsUp, MapPin, Laptop, File } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

/**
 * @typedef {Object} StudyMaterial
 * @property {string} id
 * @property {string} title
 * @property {string} course
 * @property {string} size
 * @property {string} uploader
 * @property {string} type
 */

const mockMaterials = [
  { id: "1", title: "OS Final Notes", course: "CS301", size: "2.4 MB", uploader: "Rahul Sharma", type: "pdf" },
  { id: "2", title: "ML Lecture Slides", course: "CS405", size: "15 MB", uploader: "Priya Patel", type: "ppt" },
  { id: "3", title: "UI/UX Design Guide", course: "DE201", size: "8 MB", uploader: "Ananya Desai", type: "pdf" },
  { id: "4", title: "Discrete Math Cheatsheet", course: "MA204", size: "1.2 MB", uploader: "Vikram Singh", type: "doc" },
];

const mockMarketplace = [
  { id: "1", title: "Looking for Roommate", category: "ROOMMATE WANTED", price: "₹8,000/mo", desc: "2BHK near North Campus. Fully furnished." },
  { id: "2", title: "Intro to Algorithms", category: "TEXTBOOK", price: "₹450", desc: "Slightly used, good condition. 3rd Edition." },
  { id: "3", title: "Scientific Calculator", category: "GADGETS", price: "₹600", desc: "Casio fx-991EX. Works perfectly." },
];

export default function Dashboard() {
  return (
    <div className="flex-1 p-8 space-y-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search courses, people, or items..." className="pl-9 bg-slate-50 border-none" />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon"><Star className="h-5 w-5 text-slate-600" /></Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon"><Settings className="h-5 w-5 text-slate-600" /></Button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-900">Arjun Verma</p>
              <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-1.5">GOLD CONTRIBUTOR</Badge>
            </div>
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-blue-600 text-white font-medium">AV</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good morning, Arjun!</h1>
          <p className="text-slate-500 mt-1">Wednesday, October 25 • 09:41 AM</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-slate-700">Top 5% Helper</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
            <Star className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700">Dean's List</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -4 }}>
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Current CGPA</p>
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-bold text-slate-900">3.82<span className="text-lg text-slate-400 font-normal">/4.0</span></h2>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none mb-1">+0.2 from LY</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ y: -4 }}>
          <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Attendance</p>
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-bold text-slate-900">94.5%</h2>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none mb-1">Normal</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ y: -4 }}>
          <Card className="border-none shadow-sm bg-indigo-600 text-white hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-indigo-200">Upcoming Exam</p>
                <Badge className="bg-white/20 text-white hover:bg-white/20 border-none backdrop-blur-sm">48h Left</Badge>
              </div>
              <h2 className="text-2xl font-bold">Adv. Algos (CS401)</h2>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Recent Study Materials</h3>
              <Link href="/study" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All Materials <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockMaterials.map((mat) => (
                <Card key={mat.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{mat.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{mat.course} • {mat.size}</p>
                      <p className="text-xs text-slate-400 mt-2">by {mat.uploader}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Marketplace Highlights</h3>
              <Link href="/marketplace" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Explore Market <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockMarketplace.map((item) => (
                <Card key={item.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                  <div className="h-32 bg-slate-200 flex items-center justify-center relative">
                    {item.category === "ROOMMATE WANTED" ? <MapPin className="h-8 w-8 text-slate-400" /> : 
                     item.category === "GADGETS" ? <Laptop className="h-8 w-8 text-slate-400" /> : 
                     <File className="h-8 w-8 text-slate-400" />}
                    <Badge className="absolute top-2 left-2 bg-black/70 hover:bg-black/70 text-[10px] border-none backdrop-blur-md">
                      {item.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    <p className="text-lg font-bold text-teal-600 mt-1">{item.price}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 flex-1">{item.desc}</p>
                    <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white" size="sm">Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="border border-slate-100 shadow-sm sticky top-8">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Campus Feed</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">SC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">Student Council</p>
                    <p className="text-xs text-slate-500">Trending Poll • 2h ago</p>
                  </div>
                </div>
                <p className="text-sm font-medium mb-3">Where should the post-exam mixer be held?</p>
                <div className="space-y-2">
                  <div className="relative h-8 bg-slate-100 rounded-md overflow-hidden flex items-center px-3 z-0">
                    <div className="absolute top-0 left-0 h-full bg-blue-100 -z-10" style={{ width: "65%" }}></div>
                    <span className="text-xs font-medium relative z-10">North Campus Ground (65%)</span>
                  </div>
                  <div className="relative h-8 bg-slate-100 rounded-md overflow-hidden flex items-center px-3 z-0">
                    <div className="absolute top-0 left-0 h-full bg-blue-100 -z-10" style={{ width: "20%" }}></div>
                    <span className="text-xs font-medium relative z-10">Student Union Hall (20%)</span>
                  </div>
                  <div className="relative h-8 bg-slate-100 rounded-md overflow-hidden flex items-center px-3 z-0">
                    <div className="absolute top-0 left-0 h-full bg-blue-100 -z-10" style={{ width: "15%" }}></div>
                    <span className="text-xs font-medium relative z-10">Cafeteria Hub (15%)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">482 total voters</p>
              </div>

              <div className="p-4 border-b border-slate-50 bg-amber-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <Bell className="h-3 w-3 text-amber-600" />
                  </div>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">System Notice</p>
                </div>
                <p className="text-sm text-slate-800 font-medium">Library servers will be down for maintenance from 2 AM to 4 AM tonight.</p>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-bold">PR</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">Prof. R. Menon</p>
                    <p className="text-xs text-slate-500">CS Dept • 5h ago</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mb-3">Great participation in today's algorithmic complexity session! Uploaded the supplementary materials to the portal.</p>
                <div className="flex items-center gap-4 text-slate-500">
                  <button className="flex items-center gap-1 text-xs hover:text-blue-600 transition-colors">
                    <ThumbsUp className="h-3 w-3" /> 124
                  </button>
                  <button className="flex items-center gap-1 text-xs hover:text-blue-600 transition-colors">
                    <MessageSquare className="h-3 w-3" /> 18
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  Join the Campus Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="bg-red-50 rounded-lg p-2 text-center min-w-[50px]">
                  <p className="text-xs font-bold text-red-600 uppercase">OCT</p>
                  <p className="text-xl font-black text-red-700 leading-none mt-1">28</p>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Tech Symposium '23</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Clock className="h-3 w-3" /> 10:00 AM • Main Aud
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="bg-blue-50 rounded-lg p-2 text-center min-w-[50px]">
                  <p className="text-xs font-bold text-blue-600 uppercase">NOV</p>
                  <p className="text-xl font-black text-blue-700 leading-none mt-1">02</p>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Career Fair Pitch</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Clock className="h-3 w-3" /> 14:00 PM • Career Center
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

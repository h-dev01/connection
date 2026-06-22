import React from "react";
import { motion } from "framer-motion";
import { Search, Plus, Heart, Share2, MapPin, Wifi, ShieldCheck, Flame, Tag, ArrowRight, Home, ShoppingBag, Wrench, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockProducts = [
  { id: "1", title: "Sony WH-1000XM4 Headphones", price: "₹12,500", category: "ELECTRONICS", seller: "Neha K.", rep: "4.9", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80" },
  { id: "2", title: "Engineering Drawing Kit (Complete)", price: "₹850", category: "SUPPLIES", seller: "Rohan D.", rep: "4.7", image: "https://images.unsplash.com/photo-1585675100414-22b04fbb3530?w=400&q=80" },
  { id: "3", title: "MacBook Air M1 (2020) 256GB", price: "₹45,000", category: "LAPTOPS", seller: "Karan S.", rep: "5.0", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80" },
  { id: "4", title: "Physics Vol 1 & 2 - Resnick Halliday", price: "₹600", category: "TEXTBOOKS", seller: "Pooja M.", rep: "4.2", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80" },
];

const mockHousing = [
  { id: "1", title: "Premium 2BHK Shared Flat - North Campus", price: "₹8,500", type: "PG/Flat", desc: "Looking for 1 flatmate for a fully furnished 2BHK. Includes AC, fridge, washing machine. 5 mins walk from campus gate.", amenities: ["Fiber WiFi", "Maid Incl.", "Gated Society"], verified: true, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" }
];

export default function Marketplace() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">Marketplace</span>
          </div>
          <div className="flex-1 max-w-xl mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search for textbooks, flats, or services..." className="pl-9 bg-slate-50 w-full" />
          </div>
          <Button variant="ghost" className="text-slate-600 font-medium hidden md:flex">Dash</Button>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-slate-900 rounded-2xl p-10 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <Badge className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/20 border-none mb-4">CAMPUS COMMERCE</Badge>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">Student-to-Student Economy.</h1>
            <p className="text-lg text-slate-300 mb-8 font-medium">Buy, sell, find housing, and discover campus services—safely and securely with verified college peers.</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-auto text-lg font-bold">
              <Plus className="mr-2 h-5 w-5" /> Post an Ad
            </Button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none"></div>
          <Flame className="absolute -right-10 -bottom-10 h-64 w-64 text-blue-600/10 pointer-events-none" />
        </div>

        <Tabs defaultValue="buy-sell" className="w-full mb-8">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-lg">
            <TabsTrigger value="buy-sell" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">Buy/Sell Items</TabsTrigger>
            <TabsTrigger value="housing" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">Housing (PG/Hostels)</TabsTrigger>
            <TabsTrigger value="services" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">Local Services</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <Badge className="absolute top-3 left-3 bg-black/70 text-white border-none backdrop-blur-md font-bold">{product.category}</Badge>
                    <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-white/80 hover:bg-white text-slate-700 rounded-full h-8 w-8 backdrop-blur-sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{product.title}</h3>
                    <p className="text-xl font-black text-blue-600 mb-4">{product.price}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-slate-200 text-xs">{product.seller[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-600">{product.seller}</span>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-amber-50 text-amber-700">★ {product.rep}</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0 flex gap-2">
                    <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white">Contact Seller</Button>
                    <Button variant="outline" size="icon" className="border-slate-200 text-slate-600"><Share2 className="h-4 w-4" /></Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">Featured Housing <Home className="h-5 w-5 text-slate-400" /></h2>
              {mockHousing.map((house) => (
                <Card key={house.id} className="overflow-hidden border-slate-200 shadow-sm flex flex-col md:flex-row">
                  <div className="md:w-2/5 h-64 md:h-auto bg-slate-100 relative">
                    <img src={house.image} alt={house.title} className="w-full h-full object-cover" />
                    <Badge className="absolute top-3 left-3 bg-indigo-600 text-white border-none font-bold">HOUSING</Badge>
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 text-xl md:text-2xl leading-tight">{house.title}</h3>
                      <p className="text-2xl font-black text-blue-600 whitespace-nowrap ml-4">{house.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 flex-1">{house.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {house.amenities.map((amenity, i) => (
                        <Badge key={i} variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 font-medium">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3">
                        <ShieldCheck className="h-4 w-4 mr-1" /> Estate Verified
                      </Badge>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Book Visit</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <Card className="bg-slate-900 text-white border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold">Roommate Finder</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">Find compatible roommates based on major, lifestyle, and budget.</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-600">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                        <AvatarFallback>AK</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-white">Ananya K.</p>
                        <p className="text-xs text-slate-400">CS Major • Early Bird</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-600">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                        <AvatarFallback>VS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-white">Vikram S.</p>
                        <p className="text-xs text-slate-400">Design • Night Owl</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">Match Me Now</Button>
              </CardContent>
            </Card>

            <Card className="border-red-100 border-2 bg-gradient-to-b from-white to-red-50/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Tag className="h-24 w-24 text-red-500" />
              </div>
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-red-100 text-red-700 hover:bg-red-100 border-none mb-2 text-xs font-bold px-2 py-0.5 animate-pulse">ENDING SOON</Badge>
                <CardTitle className="text-lg font-bold text-slate-900">Flash Discounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="h-12 w-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center font-bold text-lg text-slate-800">50%</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Campus Cafe</p>
                    <p className="text-xs text-slate-500">On all iced beverages</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="h-12 w-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center font-bold text-lg text-slate-800">25%</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Tech Repairs Hub</p>
                    <p className="text-xs text-slate-500">Screen replacements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="pt-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["#calculus", "#hostel", "#macbook", "#miniproject", "#tutor", "#tickets"].map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

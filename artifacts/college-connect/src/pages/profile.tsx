import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Share2, Edit2, MapPin, Building, GraduationCap, ThumbsUp, Star, Award, Code, BookOpen, Download, FileText, Plus, ChevronRight, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * @typedef {Object} ProfileData
 * @property {string} name
 * @property {string} major
 * @property {string} location
 * @property {string} avatar
 * @property {number} helpfulVotes
 * @property {number} sellerRating
 */

const mockProjects = [
  { id: "1", title: "Campus Navigation AR", role: "Lead Developer", desc: "An augmented reality app helping freshmen navigate the campus buildings.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80" },
  { id: "2", title: "Smart Canteen POS", role: "UI Designer", desc: "Redesigned the cafeteria point-of-sale system reducing queue times by 30%.", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=600&q=80" }
];

export default function Profile() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-3 flex items-center justify-between">
        <Tabs defaultValue="profile" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="dashboard" className="text-slate-600">Dashboard</TabsTrigger>
            <TabsTrigger value="study" className="text-slate-600">Study Hub</TabsTrigger>
            <TabsTrigger value="profile" className="font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 shadow-sm">Profile</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="max-w-5xl mx-auto p-8 space-y-8">
        {/* Profile Header */}
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          </div>
          <CardContent className="p-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 mb-6">
              <div className="flex items-end gap-5">
                <Avatar className="h-32 w-32 border-4 border-white shadow-md bg-white">
                  <AvatarImage src="https://i.pravatar.cc/250?u=ArjunV" />
                  <AvatarFallback className="text-3xl bg-blue-100 text-blue-700 font-bold">AV</AvatarFallback>
                </Avatar>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Arjun Verma</h1>
                    <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-50" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-bold text-xs uppercase tracking-wider mb-2">
                    <Star className="h-3 w-3 mr-1 fill-current" /> Gold Contributor
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3 pb-2">
                <Button variant="outline" className="border-slate-200 text-slate-700 font-semibold shadow-sm">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm">
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-400" />
                <span>B.Tech Computer Science '25</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-400" />
                <span>North Campus, Block C</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Mumbai, MH</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" /> Reputation Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between">
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 flex-1 mr-4">
                  <ThumbsUp className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-slate-900">1.2k</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Helpful Votes</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 flex-1">
                  <Star className="h-6 w-6 text-amber-500 mx-auto mb-2 fill-current" />
                  <p className="text-2xl font-black text-slate-900">4.9</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Seller Rating</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-bold text-slate-900">Contribution Level</p>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold border-none text-[10px]">TOP 1%</Badge>
                </div>
                <Progress value={85} className="h-2.5 bg-slate-100 [&>div]:bg-blue-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 text-right">
                  Next badge: Diamond Peer Mentor (150 votes to go)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" /> Academic Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-8">
                {["Machine Learning", "System Design", "UI/UX", "Web3", "Product Management"].map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 font-semibold px-3 py-1 text-xs">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="outline" className="bg-white border-dashed border-slate-300 text-slate-500 font-semibold px-3 py-1 text-xs cursor-pointer hover:bg-slate-50">
                  <Plus className="h-3 w-3 mr-1" /> Add Skill
                </Badge>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative">
                <Code className="absolute top-4 left-4 h-6 w-6 text-indigo-200" />
                <p className="text-sm font-medium text-indigo-900 italic pl-8 leading-relaxed">
                  "I believe the best way to learn is by teaching. Building tools that help my peers navigate campus life more efficiently."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Showcase */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Project Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockProjects.map(proj => (
              <Card key={proj.id} className="overflow-hidden border-none shadow-sm group cursor-pointer">
                <div className="h-40 bg-slate-200 relative overflow-hidden">
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 hover:bg-white border-none font-bold backdrop-blur-sm shadow-sm text-xs">
                    {proj.role}
                  </Badge>
                  <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white tracking-tight leading-tight">{proj.title}</h3>
                </div>
                <CardContent className="p-5 bg-white border border-t-0 border-slate-100 rounded-b-xl">
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{proj.desc}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-white"><AvatarImage src="https://i.pravatar.cc/150?u=12" /></Avatar>
                      <Avatar className="h-8 w-8 border-2 border-white"><AvatarImage src="https://i.pravatar.cc/150?u=13" /></Avatar>
                      <Avatar className="h-8 w-8 border-2 border-white"><AvatarImage src="https://i.pravatar.cc/150?u=14" /></Avatar>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 font-semibold text-xs h-8">
                      View Project <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" /> Uploaded Notes
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8 font-semibold">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded"><FileText className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Advanced DB Queries.pdf</p>
                    <p className="text-xs text-slate-500 font-medium">CS305 • 2 weeks ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> 142
                </div>
              </div>
              <div className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded"><FileText className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">ML Exam Cheatsheet.ppt</p>
                    <p className="text-xs text-slate-500 font-medium">CS405 • 1 month ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> 89
                </div>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded"><FileText className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Network Protocols.docx</p>
                    <p className="text-xs text-slate-500 font-medium">CS302 • 2 months ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  <Download className="h-3 w-3" /> 415
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-600" /> Marketplace Listings
              </CardTitle>
              <Button size="sm" className="text-xs bg-slate-900 text-white hover:bg-slate-800 h-8 font-semibold">
                <Plus className="mr-1 h-3 w-3" /> Post New
              </Button>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="h-16 w-16 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80" alt="Item" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">Physics Vol 1 & 2 - Resnick Halliday</h4>
                  <p className="text-sm font-black text-blue-600 mt-1">₹600</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Listed 3 days ago</p>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><Eye className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="h-16 w-16 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1585675100414-22b04fbb3530?w=200&q=80" alt="Item" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">Engineering Drawing Kit</h4>
                  <p className="text-sm font-black text-blue-600 mt-1">₹850</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Listed 1 week ago</p>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><Eye className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { Users, Code, Camera, Music, MessageCircle, Heart, Share2, Bookmark, Image as ImageIcon, BarChart2, Smile, ArrowRight, Info, Shield, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Community() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Community & Social Hub</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Hobby Communities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Code className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Hackathon Squad</h4>
                    <p className="text-xs text-slate-500">1.2k members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Camera className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Photography Club</h4>
                    <p className="text-xs text-slate-500">856 members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Music className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Campus Bands</h4>
                    <p className="text-xs text-slate-500">432 members</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-sm font-medium mt-2 border-slate-200">
                  View All Communities
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-b from-orange-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-bold text-slate-900">Meetup Requests</CardTitle>
                <p className="text-xs text-slate-500">Casual tea/coffee hangouts</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026701d" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">Sneha J.</p>
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-1.5 py-0 mt-1 text-[10px]">Architecture</Badge>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">10m ago</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-4">Anyone up for grabbing coffee at the South Canteen? Need a break from studio work! ☕</p>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs font-bold">Join</Button>
                    <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 h-8 text-xs font-bold">Ignore</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4 mb-3">
                  <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarFallback className="bg-blue-600 text-white font-medium">AV</AvatarFallback>
                  </Avatar>
                  <Textarea 
                    placeholder="What's happening on campus?" 
                    className="border-none bg-slate-50 resize-none focus-visible:ring-0 text-base"
                    rows={3}
                  />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50 h-9 w-9"><ImageIcon className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50 h-9 w-9"><BarChart2 className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50 h-9 w-9"><Smile className="h-5 w-5" /></Button>
                  </div>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 rounded-full">Post</Button>
                </div>
              </CardContent>
            </Card>

            {/* Feed Post */}
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-slate-100">
                      <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026702d" />
                      <AvatarFallback>JC</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">Julian Chen</h4>
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none text-[10px] px-1.5 flex items-center gap-1">
                          <Shield className="h-3 w-3" /> PLATINUM
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">CS Dept • 2h ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 -mr-2"><Info className="h-4 w-4" /></Button>
                </div>
                
                <p className="text-slate-800 mb-4 leading-relaxed">
                  Just wrapped up the 48-hour global hackathon! Massive shoutout to my team. We built an AI tool that converts lecture recordings into interactive flashcards. It's rough, but it works! 🚀💻 Anyone want to beta test it?
                </p>
                
                <div className="rounded-xl overflow-hidden mb-4 border border-slate-100 bg-slate-100 aspect-video relative">
                  <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80" alt="Hackathon team" className="object-cover w-full h-full" />
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex gap-6">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors group">
                      <Heart className="h-5 w-5 group-hover:fill-current" /> <span className="text-sm font-medium">142</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-5 w-5" /> <span className="text-sm font-medium">28</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                  <button className="text-slate-500 hover:text-slate-900 transition-colors">
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Founder Matchmaker */}
            <Card className="bg-slate-900 text-white border-none shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-400" />
                  Founder Matchmaker
                </CardTitle>
                <p className="text-sm text-slate-400">Connect with peers to build startups & projects</p>
              </CardHeader>
              <CardContent className="p-5 pt-2 relative z-10 space-y-3">
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <Badge className="bg-blue-900/50 text-blue-300 border-blue-800 mb-2">LOOKING FOR: UI DESIGNER</Badge>
                    <h4 className="font-bold text-white mb-1">Fintech App for Students</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2 border-slate-800"><AvatarImage src="https://i.pravatar.cc/150?u=a" /></Avatar>
                        <Avatar className="h-6 w-6 border-2 border-slate-800"><AvatarImage src="https://i.pravatar.cc/150?u=b" /></Avatar>
                      </div>
                      <span className="text-xs text-slate-400">2 Founders</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200">Connect</Button>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-800 mb-2">LOOKING FOR: BACKEND DEV</Badge>
                    <h4 className="font-bold text-white mb-1">Campus EV Rental System</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <Avatar className="h-6 w-6 border-2 border-slate-800"><AvatarImage src="https://i.pravatar.cc/150?u=c" /></Avatar>
                      </div>
                      <span className="text-xs text-slate-400">1 Founder</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border border-slate-100 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50 rounded-t-xl">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  Anonymous Q&A
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 border-none">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-800">"What are the best electives to take in 5th semester if I want to focus on AI?"</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><ArrowRight className="h-3 w-3 -rotate-90" /> 42 Upvotes</span>
                    <button className="text-xs font-semibold text-blue-600 hover:underline">Reply</button>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-800">"Is it normal to feel completely lost in Data Structures? Need advice."</p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><ArrowRight className="h-3 w-3 -rotate-90" /> 89 Upvotes</span>
                    <button className="text-xs font-semibold text-blue-600 hover:underline">8 Replies</button>
                  </div>
                </div>
                <Button className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800 text-sm h-9">
                  Ask Anonymously
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-bold text-slate-900 flex items-center gap-2">
                  Reputation Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {[
                  { rank: "1", name: "Priya S.", score: "14.2k", medal: "🥇" },
                  { rank: "2", name: "Rahul M.", score: "12.8k", medal: "🥈" },
                  { rank: "3", name: "Anita K.", score: "10.5k", medal: "🥉" }
                ].map(leader => (
                  <div key={leader.rank} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{leader.medal}</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-slate-200 text-slate-700">{leader.name[0]}</AvatarFallback></Avatar>
                        <span className="text-sm font-bold text-slate-900">{leader.name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{leader.score}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="border border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-red-50 text-red-600 border-none mb-2 hover:bg-red-50">Active Poll</Badge>
                <CardTitle className="text-md font-bold text-slate-900 leading-tight">Should the library be open 24/7 during finals week?</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Yes, absolutely</span>
                    <span>82%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[82%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>No, it's unnecessary</span>
                    <span>18%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 w-[18%]"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center">1,204 votes • 2 days left</p>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Add a simple Rocket icon since it wasn't exported from lucide-react in my first pass
function Rocket(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 3.82-13 1.5 1.5 0 0 0-2.18 2.08A22 22 0 0 0 3.9 12a1.5 1.5 0 0 0 2.08-2.18 22 22 0 0 1 13 3.82" />
      <path d="M12 15c.6-.6 1.46-.86 2.29-.71l4.8 1.05c.81.18 1.41.87 1.41 1.7v0c0 1.1-.9 2-2 2h-3.5" />
    </svg>
  );
}

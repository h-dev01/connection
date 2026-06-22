import React from "react";
import { motion } from "framer-motion";
import { Users, Calendar, ArrowRight, Grid, List, Medal, Shield, Award, Tent, Plus, Search, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

/**
 * @typedef {Object} Club
 * @property {string} id
 * @property {string} name
 * @property {string} desc
 * @property {number} members
 * @property {boolean} isOfficial
 * @property {string} upcomingEvent
 * @property {number} activityLevel
 */

const mockClubs = [
  { id: "1", name: "Robotics Society", desc: "Building autonomous robots for national competitions.", members: 145, isOfficial: true, upcomingEvent: "Maze Solver Draft", activityLevel: 85 },
  { id: "2", name: "Debate Club", desc: "Weekly parliamentary style debates on current affairs.", members: 89, isOfficial: true, upcomingEvent: "Inter-college Qualifiers", activityLevel: 60 },
  { id: "3", name: "Open Source Hub", desc: "Contributing to FOSS and learning Git/GitHub together.", members: 210, isOfficial: false, upcomingEvent: "Hacktoberfest Prep", activityLevel: 95 },
  { id: "4", name: "Drama Dramatics", desc: "Street plays, stage productions, and improv sessions.", members: 112, isOfficial: true, upcomingEvent: "Annual Fest Auditions", activityLevel: 75 },
];

export default function Clubs() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Tent className="h-8 w-8 text-blue-600" /> Clubs & Organizations
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Discover your tribe, build skills, and lead initiatives.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6">
          <Plus className="mr-2 h-4 w-4" /> Start a Club
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm overflow-hidden h-full group cursor-pointer relative bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/90 mix-blend-multiply z-10 pointer-events-none"></div>
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 pointer-events-none"></div>
            <CardContent className="p-8 relative z-20 flex flex-col h-full justify-end">
              <Badge className="w-fit bg-emerald-500 text-white border-none mb-4 hover:bg-emerald-600">HIGH GROWTH</Badge>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Entrepreneurship Society</h2>
              <p className="text-blue-100 text-lg mb-6 max-w-lg">Incubating student startups and hosting weekly pitches with alumni investors. Join the fastest growing network on campus.</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/20 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-slate-900"><AvatarImage src="https://i.pravatar.cc/150?u=1" /></Avatar>
                    <Avatar className="h-10 w-10 border-2 border-slate-900"><AvatarImage src="https://i.pravatar.cc/150?u=2" /></Avatar>
                    <Avatar className="h-10 w-10 border-2 border-slate-900"><AvatarImage src="https://i.pravatar.cc/150?u=3" /></Avatar>
                  </div>
                  <div className="text-white">
                    <p className="font-bold text-lg leading-none">342</p>
                    <p className="text-xs text-blue-200">Active Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Next Event</p>
                    <p className="text-sm font-semibold text-white">Startup Pitch Deck</p>
                  </div>
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold">Join Club</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm overflow-hidden h-full group cursor-pointer relative bg-slate-900 min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-0 opacity-60 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 pointer-events-none"></div>
          <CardContent className="p-6 relative z-20 flex flex-col h-full justify-end">
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Photography Collective</h3>
            <p className="text-slate-300 text-sm mb-4">Capturing campus life, workshops on editing, and weekend photowalks.</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-white/80">
                <Users className="h-4 w-4" /> <span className="text-sm font-medium">128</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="h-4 w-4" /> <span className="text-sm font-medium">3 Events</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Organizations</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search clubs..." className="pl-9 bg-white" />
            </div>
            <div className="flex items-center bg-white rounded-md border border-slate-200 p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-100 text-slate-900"><Grid className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockClubs.map((club) => (
            <Card key={club.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Tent className="h-6 w-6 text-blue-600" />
                  </div>
                  {club.isOfficial && (
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-[10px] font-bold">
                      <Shield className="h-3 w-3 mr-1" /> OFFICIAL
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">{club.name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">{club.desc}</p>
                
                <div className="space-y-4 w-full">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Activity Level</span>
                      <span>{club.activityLevel}%</span>
                    </div>
                    <Progress value={club.activityLevel} className="h-1.5" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-md">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <span className="truncate">{club.upcomingEvent}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-semibold">{club.members}</span>
                    </div>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-medium">Join</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-none shadow-sm bg-gradient-to-r from-blue-900 to-indigo-900 text-white overflow-hidden relative">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Trophy className="h-64 w-64 -mb-10 -mr-10" />
        </div>
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">Build Your Leadership Reputation</h2>
            <p className="text-blue-100 text-lg">Earn badges by organizing events, maintaining high club activity, and contributing to the campus ecosystem.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center shadow-lg border-2 border-slate-300">
                <Medal className="h-6 w-6 text-slate-500" />
              </div>
              <span className="text-xs font-bold text-blue-200">SILVER</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center shadow-lg border-2 border-yellow-300 transform scale-110">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-xs font-bold text-yellow-400">GOLD</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-cyan-100 flex items-center justify-center shadow-lg border-2 border-cyan-300">
                <Trophy className="h-6 w-6 text-cyan-600" />
              </div>
              <span className="text-xs font-bold text-cyan-300">PLATINUM</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Building2, MapPin, DollarSign, ExternalLink, FileText, MonitorPlay, BrainCircuit, Search, ArrowRight, UserPlus, Zap, Plus, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockInternships = [
  { id: "1", title: "SDE Intern (Summer '24)", company: "Amazon India", location: "Bangalore / Remote", salary: "₹80k/mo", status: "NEW" },
  { id: "2", title: "Product Marketing Intern", company: "Zomato", location: "Gurgaon", salary: "₹45k/mo", status: "OPEN" },
  { id: "3", title: "Data Science Intern", company: "Fractal Analytics", location: "Mumbai", salary: "₹60k/mo", status: "OPEN" },
  { id: "4", title: "UI/UX Design Intern", company: "Cred", location: "Gurgaon", salary: "₹40k/mo", status: "CLOSED" },
];

export default function Career() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Career Corner</h1>
        <p className="text-slate-500 mt-2 text-lg">Internships, placements, and startup networking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Resume Builder</h3>
            <p className="text-sm text-slate-500 mt-2">Create ATS-friendly resumes optimized for top tech companies.</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow group bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 bg-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MonitorPlay className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Interview Prep</h3>
            <p className="text-sm text-slate-500 mt-2">Mock interviews with peers and AI-based feedback sessions.</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 bg-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Aptitude Practice</h3>
            <p className="text-sm text-slate-500 mt-2">Daily quant and logic puzzles to clear online assessments.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Latest Opportunities</h2>
          <Button variant="outline" className="text-slate-600">View All Jobs</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockInternships.map((intern) => (
            <Card key={intern.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{intern.title}</h3>
                      <p className="text-sm font-medium text-slate-600">{intern.company}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    intern.status === 'NEW' ? 'text-blue-700 bg-blue-50 border-blue-200 font-bold' :
                    intern.status === 'OPEN' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold' :
                    'text-slate-500 bg-slate-100 border-slate-200 font-bold'
                  }>
                    {intern.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                    <MapPin className="h-4 w-4" /> {intern.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">
                    <DollarSign className="h-4 w-4" /> {intern.salary}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800">Apply Now</Button>
                  <Button variant="outline" size="icon" className="border-slate-200 text-slate-600"><ExternalLink className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
            <div>
              <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white border-none mb-3">CO-FOUNDER FINDER</Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight">Build the next big thing.</h2>
              <p className="text-indigo-200 mt-2 text-lg max-w-xl">Find talented peers from different departments to turn your ideas into reality.</p>
            </div>
            <Button className="bg-white text-slate-900 hover:bg-slate-100 mt-4 md:mt-0 font-bold">
              <Plus className="mr-2 h-4 w-4" /> Post an Idea
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {[
              { role: "Developer", color: "bg-blue-500", name: "Siddharth Rao", idea: "AI study planner app", icon: <Code className="h-5 w-5" /> },
              { role: "Designer", color: "bg-pink-500", name: "Maya Patel", idea: "Sustainable fashion marketplace", icon: <Zap className="h-5 w-5" /> },
              { role: "Marketing", color: "bg-amber-500", name: "Kunal Singh", idea: "Campus event aggregator", icon: <Search className="h-5 w-5" /> },
              { role: "Business", color: "bg-emerald-500", name: "Aryan Mehta", idea: "B2B SaaS for local vendors", icon: <Building2 className="h-5 w-5" /> }
            ].map((person, i) => (
              <Card key={i} className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-lg ${person.color} flex items-center justify-center text-white`}>
                      {person.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Looking for</p>
                      <p className="font-bold text-white leading-tight">{person.role}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-300">Project Idea:</p>
                    <p className="font-semibold text-white leading-snug">{person.idea}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-slate-600"><AvatarFallback className="text-[10px] bg-slate-700 text-white">{person.name[0]}</AvatarFallback></Avatar>
                      <span className="text-xs text-slate-300 font-medium">{person.name}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-400 hover:text-white hover:bg-indigo-600/50">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

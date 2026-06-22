import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Download, Star, Eye, Filter, Clock, ChevronRight, Briefcase, Zap, FileText, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockMaterials = [
  { id: "1", title: "Data Structures & Algorithms - Complete Notes", course: "CS301", downloads: 1240, rating: 4.9, type: "pdf", color: "text-red-500 bg-red-50" },
  { id: "2", title: "Machine Learning Midterm Review", course: "CS405", downloads: 856, rating: 4.8, type: "ppt", color: "text-orange-500 bg-orange-50" },
  { id: "3", title: "Database Management Systems Lab Manual", course: "CS305", downloads: 642, rating: 4.6, type: "doc", color: "text-blue-500 bg-blue-50" },
  { id: "4", title: "Computer Networks Previous Year Papers", course: "CS302", downloads: 2105, rating: 4.9, type: "pdf", color: "text-red-500 bg-red-50" },
];

const mockInternships = [
  { id: "1", title: "Frontend Developer Intern", company: "TechCorp India", salary: "₹25k/mo", status: "NEW" },
  { id: "2", title: "Data Analyst Intern", company: "DataSync Solutions", salary: "₹30k/mo", status: "OPEN" },
  { id: "3", title: "Product Design Intern", company: "Creative Minds", salary: "₹20k/mo", status: "CLOSED" },
];

export default function Study() {
  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Study & Career Hub</h1>
          <p className="text-slate-500 mt-1">Accelerate your academic success</p>
        </div>
        <Tabs defaultValue="student" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student View</TabsTrigger>
            <TabsTrigger value="contributor">Contributor Mode</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Study Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-6">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="cs">Computer Science</SelectItem>
                    <SelectItem value="ee">Electrical Eng</SelectItem>
                    <SelectItem value="me">Mechanical Eng</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="sem5">
                  <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sem4">Semester 4</SelectItem>
                    <SelectItem value="sem5">Semester 5</SelectItem>
                    <SelectItem value="sem6">Semester 6</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="cs301">
                  <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs301">CS301: DSA</SelectItem>
                    <SelectItem value="cs405">CS405: ML</SelectItem>
                    <SelectItem value="cs305">CS305: DBMS</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-slate-900 text-white hover:bg-slate-800">Apply Filters</Button>
              </div>

              <div className="space-y-3">
                {mockMaterials.map((mat) => (
                  <motion.div key={mat.id} whileHover={{ scale: 1.01 }} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all bg-white group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${mat.color}`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{mat.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">{mat.course}</span>
                          <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {mat.downloads}</span>
                          <span className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-current" /> {mat.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900"><Eye className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" className="text-blue-600 border-blue-200 hover:bg-blue-50"><Download className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <Zap className="h-8 w-8 text-yellow-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">AI Summarizer</h3>
                <p className="text-indigo-100 text-sm mb-6">Upload long lecture notes or PDFs and get concise, bulleted summaries instantly.</p>
                <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold">Launch Summarizer</Button>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm bg-slate-900 text-white">
              <CardContent className="p-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Exam Prep Hub</h3>
                <p className="text-slate-400 text-sm mb-6">Generate mock tests from past year papers and test your knowledge before finals.</p>
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold">Start Practice Test</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-lg font-bold">Academic Tools</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Smart Timetable</p>
                  <p className="text-sm font-semibold text-slate-900">Next Class: ML (14:00)</p>
                  <p className="text-xs text-slate-500">Room 402, Block B</p>
                </div>
                <Clock className="h-8 w-8 text-blue-300" />
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">GPA Calculator</p>
                  <p className="text-sm font-semibold text-slate-900">Current: 3.85/4.0</p>
                  <p className="text-xs text-slate-500">Target: 3.90</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Career Corner</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              {mockInternships.map((intern) => (
                <div key={intern.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-200 rounded-md flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{intern.title}</h4>
                        <p className="text-xs text-slate-500">{intern.company}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      intern.status === 'NEW' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                      intern.status === 'OPEN' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                      'text-slate-500 bg-slate-100 border-slate-200'
                    }>
                      {intern.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-semibold text-slate-700">{intern.salary}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Apply</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="border-none bg-slate-900 overflow-hidden relative group cursor-pointer">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')] bg-cover bg-center mix-blend-overlay transition-transform duration-500 group-hover:scale-105"></div>
            <CardContent className="p-6 relative z-10">
              <Badge className="bg-blue-600 hover:bg-blue-600 text-white mb-3">CLUBS</Badge>
              <h3 className="text-lg font-bold text-white mb-1">Join the Coding Club</h3>
              <p className="text-sm text-slate-300 mb-4">Build real projects, network with alumni, and prepare for tech interviews.</p>
              <Button size="sm" className="w-full bg-white text-slate-900 hover:bg-slate-100">Explore Clubs</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom stats bar - fixed at bottom */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 py-3 px-8 z-10 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">1,248</strong> Students Online</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">15.4k</strong> Total Resources</span>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
          <div className="items-center gap-2 hidden md:flex">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">+12%</strong> Avg Grade Increase</span>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
          <div className="items-center gap-2 hidden md:flex">
            <Users className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium text-slate-600"><strong className="text-slate-900">482</strong> Verified Contributors</span>
          </div>
        </div>
      </div>
    </div>
  );
}

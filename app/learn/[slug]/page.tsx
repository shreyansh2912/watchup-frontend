"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { CheckCircle, PlayCircle, Lock, Menu, ChevronLeft } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer'; // Reuse if possible, or use simple video tag if HLS needed

interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'text';
    videoId?: number;
    content?: string;
    video?: {
        url: string;
        title: string;
        description: string;
        slug: string;
        id: number;
    };
}

interface Module {
    id: number;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    modules: Module[];
}

export default function LearnPage() {
    const { slug } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchCourse();
    }, [slug]);

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/courses/${slug}`);
            if (res.data.success) {
                setCourse(res.data.data);
                // Check enrollment
                const enrollRes = await api.get(`/courses/${res.data.data.id}/enrollment`);
                if (!enrollRes.data.data.isEnrolled) {
                    toast.error("You are not enrolled in this course");
                    router.push(`/courses/${slug}`);
                    return;
                }

                // Set first lesson as active
                if (res.data.data.modules?.[0]?.lessons?.[0]) {
                    setActiveLesson(res.data.data.modules[0].lessons[0]);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load course");
        } finally {
            setLoading(false);
        }
    };

    const handleLessonSelect = async (lesson: Lesson) => {
        // If lesson has videoId but no video details, we might need to fetch video details
        // But getCourse usually includes nested relations if configured.
        // My getCourse includes modules -> lessons -> video?
        // Let's check courseController.js.
        // It includes `modules: { with: { lessons: ... } }`.
        // It does NOT include `video` in lessons relation in `getCourse`.
        // I should update `getCourse` to include video details for lessons.
        // Or fetch lesson details separately.
        // Fetching separately is better for performance if course is huge.
        // But for now, let's update `getCourse` to include video relation for lessons.
        
        setActiveLesson(lesson);
    };

    if (loading) return <div>Loading...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r bg-gray-50 dark:bg-gray-900 flex flex-col`}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="font-bold truncate">{course.title}</h2>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {course.modules.map((module, mIndex) => (
                                <div key={module.id}>
                                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Module {mIndex + 1}: {module.title}</h3>
                                    <div className="space-y-1">
                                        {module.lessons.map((lesson, lIndex) => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleLessonSelect(lesson)}
                                                className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 ${activeLesson?.id === lesson.id ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                                            >
                                                {lesson.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                <span className="truncate">{lIndex + 1}. {lesson.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                    {!sidebarOpen && (
                        <div className="p-4">
                            <Button variant="outline" onClick={() => setSidebarOpen(true)}>
                                <Menu className="w-4 h-4 mr-2" /> Course Content
                            </Button>
                        </div>
                    )}
                    
                    <div className="p-8 max-w-4xl mx-auto w-full">
                        {activeLesson ? (
                            <div className="space-y-6">
                                <h1 className="text-2xl font-bold">{activeLesson.title}</h1>
                                
                                {activeLesson.videoId && activeLesson.video ? (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                        {/* Use VideoPlayer or simple video tag */}
                                        {/* Since VideoPlayer expects a complex video object and handles comments etc, 
                                            we might just want the player part. 
                                            But VideoPlayer is coupled. 
                                            For now, let's try to use VideoPlayer if we have the full video object.
                                            Or just a simple HLS player if we have the URL.
                                        */}
                                        <VideoPlayer video={activeLesson.video} />
                                    </div>
                                ) : activeLesson.content ? (
                                    <div className="prose dark:prose-invert max-w-none">
                                        {activeLesson.content}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center border rounded-lg bg-gray-50 dark:bg-gray-900">
                                        <p>Select a lesson to start learning</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center mt-20">
                                <h2 className="text-xl font-semibold">Welcome to the course!</h2>
                                <p className="text-muted-foreground">Select a lesson from the sidebar to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

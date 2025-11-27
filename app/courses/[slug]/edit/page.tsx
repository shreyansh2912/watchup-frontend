"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { Plus, Video, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface Lesson {
    id: number;
    title: string;
    type: 'video' | 'text';
    order: number;
}

interface Module {
    id: number;
    title: string;
    lessons: Lesson[];
    order: number;
}

interface Course {
    id: number;
    title: string;
    slug: string;
    modules: Module[];
    isPublished: boolean;
}

export default function EditCoursePage() {
    const { slug } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [isAddingModule, setIsAddingModule] = useState(false);
    
    // Lesson adding state
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newLessonType, setNewLessonType] = useState<'video' | 'text'>('video');
    const [newLessonVideoId, setNewLessonVideoId] = useState('');
    const [newLessonContent, setNewLessonContent] = useState('');

    const router = useRouter();

    useEffect(() => {
        fetchCourse();
    }, [slug]);

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/courses/${slug}`);
            if (res.data.success) {
                setCourse(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load course");
        } finally {
            setLoading(false);
        }
    };

    const handleAddModule = async () => {
        if (!newModuleTitle || !course) return;
        try {
            const res = await api.post(`/courses/${course.id}/modules`, {
                title: newModuleTitle,
                order: course.modules.length,
            });
            if (res.data.success) {
                toast.success("Module added");
                setNewModuleTitle('');
                setIsAddingModule(false);
                fetchCourse();
            }
        } catch (err) {
            toast.error("Failed to add module");
        }
    };

    const handleAddLesson = async (moduleId: number) => {
        if (!newLessonTitle) return;
        try {
            const payload: any = {
                title: newLessonTitle,
                order: 999, // Backend should handle or we calculate
            };
            if (newLessonType === 'video') {
                payload.videoId = newLessonVideoId;
            } else {
                payload.content = newLessonContent;
            }

            const res = await api.post(`/courses/modules/${moduleId}/lessons`, payload);
            if (res.data.success) {
                toast.success("Lesson added");
                setActiveModuleId(null);
                setNewLessonTitle('');
                setNewLessonVideoId('');
                setNewLessonContent('');
                fetchCourse();
            }
        } catch (err) {
            toast.error("Failed to add lesson");
        }
    };

    const handlePublish = async () => {
        if (!course) return;
        try {
            const res = await api.put(`/courses/${course.id}`, {
                isPublished: !course.isPublished
            });
            if (res.data.success) {
                toast.success(course.isPublished ? "Course unpublished" : "Course published");
                fetchCourse();
            }
        } catch (err) {
            toast.error("Failed to update course status");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <div className="container mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <div className="space-x-4">
                        <Button variant="outline" onClick={() => router.push(`/courses/${course.slug}`)}>
                            View Public Page
                        </Button>
                        <Button onClick={handlePublish} variant={course.isPublished ? "destructive" : "default"}>
                            {course.isPublished ? "Unpublish" : "Publish Course"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Curriculum</h2>
                            <Button size="sm" onClick={() => setIsAddingModule(true)}><Plus className="w-4 h-4 mr-2" /> Add Module</Button>
                        </div>

                        {isAddingModule && (
                            <Card className="mb-4 border-dashed">
                                <CardContent className="pt-6">
                                    <div className="flex gap-4">
                                        <Input 
                                            value={newModuleTitle} 
                                            onChange={(e) => setNewModuleTitle(e.target.value)} 
                                            placeholder="Module Title" 
                                        />
                                        <Button onClick={handleAddModule}>Add</Button>
                                        <Button variant="ghost" onClick={() => setIsAddingModule(false)}>Cancel</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {course.modules.map((module) => (
                            <Card key={module.id}>
                                <CardHeader className="py-4 bg-gray-100 dark:bg-gray-900">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">{module.title}</CardTitle>
                                        <Button size="sm" variant="ghost" onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}>
                                            <Plus className="w-4 h-4" /> Add Lesson
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-2">
                                    {module.lessons.length === 0 && <p className="text-sm text-muted-foreground italic">No lessons yet</p>}
                                    {module.lessons.map((lesson) => (
                                        <div key={lesson.id} className="flex items-center p-3 bg-white dark:bg-gray-800 rounded border">
                                            {lesson.type === 'video' ? <Video className="w-4 h-4 mr-3" /> : <FileText className="w-4 h-4 mr-3" />}
                                            <span>{lesson.title}</span>
                                        </div>
                                    ))}

                                    {activeModuleId === module.id && (
                                        <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-900">
                                            <h4 className="font-medium mb-2">New Lesson</h4>
                                            <div className="space-y-4">
                                                <Input 
                                                    value={newLessonTitle} 
                                                    onChange={(e) => setNewLessonTitle(e.target.value)} 
                                                    placeholder="Lesson Title" 
                                                />
                                                <div className="flex gap-4">
                                                    <Button 
                                                        variant={newLessonType === 'video' ? 'default' : 'outline'} 
                                                        onClick={() => setNewLessonType('video')}
                                                        size="sm"
                                                    >
                                                        Video
                                                    </Button>
                                                    <Button 
                                                        variant={newLessonType === 'text' ? 'default' : 'outline'} 
                                                        onClick={() => setNewLessonType('text')}
                                                        size="sm"
                                                    >
                                                        Text
                                                    </Button>
                                                </div>

                                                {newLessonType === 'video' && (
                                                    <Input 
                                                        value={newLessonVideoId} 
                                                        onChange={(e) => setNewLessonVideoId(e.target.value)} 
                                                        placeholder="Video ID (Upload video first and get ID)" 
                                                    />
                                                )}
                                                {newLessonType === 'text' && (
                                                    <textarea 
                                                        className="w-full p-2 border rounded" 
                                                        value={newLessonContent} 
                                                        onChange={(e) => setNewLessonContent(e.target.value)} 
                                                        placeholder="Lesson Content"
                                                    />
                                                )}

                                                <div className="flex gap-2">
                                                    <Button onClick={() => handleAddLesson(module.id)}>Save Lesson</Button>
                                                    <Button variant="ghost" onClick={() => setActiveModuleId(null)}>Cancel</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Price, Thumbnail, and other settings can be edited here.</p>
                                {/* Add edit form here if needed */}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

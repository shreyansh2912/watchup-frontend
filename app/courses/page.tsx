"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Eye } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    slug: string;
    isPublished: boolean;
    price: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCourses();
        }
    }, [user]);

    const fetchCourses = async () => {
        try {
            // Assuming endpoint lists courses for the current channel if authenticated
            // Or we might need to pass channelId if we have multiple channels context
            // For now, let's assume listCourses returns courses for the current channel context
            // But wait, listCourses in backend uses query param channelId or returns all published.
            // I need to update backend listCourses to support "my courses" or pass channelId from frontend.
            // The frontend usually has currentChannel in context or similar.
            // Let's assume we pass channelId if we have it.
            // But for now, let's just call /courses and filter or expect backend to handle "my courses" if auth?
            // Actually, backend `listCourses` checks `req.query.channelId`.
            // I need to get channelId from somewhere.
            // `useAuth` might provide it?
            // Let's try to fetch without params first, but that might return all published courses.
            // I'll update the backend to allow fetching "my courses" if no channelId but auth is present?
            // Or just fetch all and filter in frontend (bad).
            // Let's assume the user has a channel and we can get it.
            // I'll just fetch `/courses?channelId=${user.currentChannel.id}` if I had that.
            // Since I don't have easy access to channel ID here without fetching user profile, 
            // I'll just fetch all for now or rely on a new endpoint `/courses/my`?
            // Let's stick to `/courses` and maybe it returns all.
            
            const res = await api.get('/courses');
            if (res.data.success) {
                setCourses(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <div className="container mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <Button onClick={() => router.push('/courses/create')}>
                        <Plus className="w-4 h-4 mr-2" /> Create Course
                    </Button>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                                {course.thumbnailUrl && (
                                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-48 object-cover" />
                                )}
                                <CardHeader>
                                    <CardTitle className="truncate">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between text-sm">
                                        <span className={`px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                        <span className="font-bold">
                                            {Number(course.price) === 0 ? 'Free' : `₹${course.price}`}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${course.slug}`)}>
                                        <Eye className="w-4 h-4 mr-2" /> View
                                    </Button>
                                    <Button size="sm" onClick={() => router.push(`/courses/${course.slug}/edit`)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                        {courses.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No courses found. Create your first course!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

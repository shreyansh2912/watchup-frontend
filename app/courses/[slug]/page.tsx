"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
// import PaymentModal from '@/components/PaymentModal'; // Payment Gateway Disabled
import { CheckCircle, PlayCircle, Lock } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    price: string;
    modules: any[];
    slug: string;
    visibility: 'public' | 'members-only' | 'paid';
    channelId: number;
}

export default function CourseLandingPage() {
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    // const [showPaymentModal, setShowPaymentModal] = useState(false); // Payment Gateway Disabled
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get('success')) {
            toast.success("Payment successful! You are now enrolled.");
        }
        if (searchParams.get('canceled')) {
            toast.error("Payment canceled.");
        }
    }, [searchParams]);

    useEffect(() => {
        fetchCourse();
    }, [slug]);

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/courses/${slug}`);
            if (res.data.success) {
                setCourse(res.data.data);
                if (user) {
                    checkEnrollment(res.data.data.id);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load course");
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollment = async (courseId: number) => {
        try {
            const res = await api.get(`/courses/${courseId}/enrollment`);
            if (res.data.success) {
                setIsEnrolled(res.data.data.isEnrolled);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <Navbar />
            
            {/* Hero Section */}
            <div className="bg-gray-100 dark:bg-gray-900 py-12">
                <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <h1 className="text-4xl font-bold">{course.title}</h1>
                        <p className="text-lg text-muted-foreground">{course.description}</p>
                        <div className="flex items-center gap-4">
                            {isEnrolled ? (
                                <Button size="lg" onClick={() => router.push(`/learn/${course.slug}`)}>
                                    Go to Course
                                </Button>
                            ) : (
                                <>
                                    {course.visibility === 'public' && (
                                        <Button size="lg" onClick={() => router.push(`/learn/${course.slug}`)}>
                                            Start Learning (Free)
                                        </Button>
                                    )}
                                    {course.visibility === 'members-only' && (
                                        <Button size="lg" onClick={() => router.push(`/channel/${course.channelId}/join`)}>
                                            Join Channel to Access
                                        </Button>
                                    )}
                                    {/* Payment Gateway Disabled
                                    {course.visibility === 'paid' && (
                                        <Button size="lg" onClick={() => setShowPaymentModal(true)}>
                                            Enroll Now - ₹{course.price}
                                        </Button>
                                    )}
                                    */}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        {course.thumbnailUrl && (
                            <img src={course.thumbnailUrl} alt={course.title} className="rounded-lg shadow-lg w-full max-w-md mx-auto" />
                        )}
                    </div>
                </div>
            </div>

            {/* Curriculum Preview */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                <div className="space-y-4 max-w-3xl">
                    {course.modules?.map((module, index) => (
                        <Card key={module.id}>
                            <CardHeader className="py-4 bg-gray-50 dark:bg-gray-900">
                                <CardTitle className="text-lg flex justify-between">
                                    <span>Module {index + 1}: {module.title}</span>
                                    <span className="text-sm font-normal text-muted-foreground">{module.lessons?.length} Lessons</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <ul className="space-y-2">
                                    {module.lessons?.map((lesson: any) => (
                                        <li key={lesson.id} className="flex items-center gap-2 text-sm">
                                            {lesson.isFreePreview || isEnrolled ? (
                                                <PlayCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Lock className="w-4 h-4 text-gray-400" />
                                            )}
                                            <span>{lesson.title}</span>
                                            {lesson.isFreePreview && !isEnrolled && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-auto">Free Preview</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Payment Gateway Disabled
            <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)} 
                courseId={course.id} 
                price={Number(course.price)} 
                title={course.title} 
            />
            */}
        </div>
    );
}

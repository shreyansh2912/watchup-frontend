"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Plan {
    id: number;
    name: string;
    description: string;
    price: string;
}

interface MembershipCardProps {
    plan: Plan;
    channelId: number;
}

export default function MembershipCard({ plan, channelId }: MembershipCardProps) {
    const { user, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ membershipId: plan.id })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to join');
            }

            toast.success(`Welcome to ${plan.name}!`);
            // Refresh or redirect
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-[300px]">
            <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{plan.price}/month</div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleJoin} disabled={loading}>
                    {loading ? 'Processing...' : 'Join'}
                </Button>
            </CardFooter>
        </Card>
    );
}

"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MembershipCard from '@/components/MembershipCard';
import { useAuth } from '@/context/AuthContext';

interface Plan {
    id: number;
    name: string;
    description: string;
    price: string;
    channelId: number;
}

export default function JoinPage() {
    const params = useParams();
    const channelId = params.id;
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships/channel/${channelId}`);
                const data = await res.json();
                if (data.success) {
                    setPlans(data.data);
                }
            } catch (error) {
                console.error("Error fetching plans:", error);
            } finally {
                setLoading(false);
            }
        };

        if (channelId) {
            fetchPlans();
        }
    }, [channelId]);

    if (loading) return <div className="p-8 text-center">Loading plans...</div>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Join this Channel</h1>
            {plans.length === 0 ? (
                <div className="text-center text-muted-foreground">No membership plans available.</div>
            ) : (
                <div className="flex flex-wrap justify-center gap-6">
                    {plans.map(plan => (
                        <MembershipCard key={plan.id} plan={plan} channelId={Number(channelId)} />
                    ))}
                </div>
            )}
        </div>
    );
}

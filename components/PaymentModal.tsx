"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    price: number;
    title: string;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PaymentModal({ isOpen, onClose, courseId, price, title }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);

    const handleStripePayment = async () => {
        setLoading(true);
        try {
            const res = await api.post('/payments/create-stripe-session', { courseId });
            if (res.data.success) {
                window.location.href = res.data.data.url;
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to initiate Stripe payment");
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        try {
            // Load Razorpay SDK
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = async () => {
                const res = await api.post('/payments/create-razorpay-order', { courseId });
                if (res.data.success) {
                    const order = res.data.data;
                    const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Needs to be in env
                        amount: order.amount,
                        currency: order.currency,
                        name: "Stremers Education",
                        description: `Purchase ${title}`,
                        order_id: order.id,
                        handler: async function (response: any) {
                            // Verify payment via webhook or separate verification endpoint
                            // For now, we rely on webhook to update DB, but we can show success
                            toast.success("Payment Successful!");
                            onClose();
                            // Reload or redirect
                            window.location.reload();
                        },
                        prefill: {
                            // name: user.name,
                            // email: user.email,
                        },
                        theme: {
                            color: "#3399cc"
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                }
            };
        } catch (err) {
            console.error(err);
            toast.error("Failed to initiate Razorpay payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Purchase Course</DialogTitle>
                    <DialogDescription>
                        Choose your preferred payment method to enroll in <strong>{title}</strong>.
                        <br />
                        Price: <strong>₹{price}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                    <Button onClick={handleStripePayment} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Pay with Stripe (Card)
                    </Button>
                    <Button onClick={handleRazorpayPayment} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                        Pay with Razorpay (UPI/Card)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

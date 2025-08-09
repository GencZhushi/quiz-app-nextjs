"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSkeleton, DashboardStatsSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { PageLoadingSkeleton } from "@/components/skeletons/PageSkeleton";

interface DashboardStats {
  quizzesCreated: number;
  studentsEnrolled: number;
  totalResponses: number;
  totalQuestions: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    quizzesCreated: 0,
    studentsEnrolled: 0,
    totalResponses: 0,
    totalQuestions: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  // Refresh stats when user navigates back to dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (session) {
        fetchStats();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session]);

  if (status === "loading") {
    return <PageLoadingSkeleton />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white/90">EducHorizon Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white/80">Welcome, {session.user?.name || 'User'}!</span>
            <Button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white/90 mb-2">Welcome to EducHorizon!</h2>
            <p className="text-white/70">
              You&apos;ve successfully registered and logged in. Start creating your first quiz or explore our features.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-2">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Quizzes Created:</span>
                <span className="text-white/90">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-700/50 h-6 w-8 rounded"></div>
                  ) : (
                    stats.quizzesCreated
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Students Enrolled:</span>
                <span className="text-white/90">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-700/50 h-6 w-8 rounded"></div>
                  ) : (
                    stats.studentsEnrolled
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Total Questions:</span>
                <span className="text-white/90">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-700/50 h-6 w-8 rounded"></div>
                  ) : (
                    stats.totalQuestions
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/quizzes/new">
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                  Create New Quiz
                </Button>
              </Link>
              <Link href="/quizzes">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  View All Quizzes
                </Button>
              </Link>
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                View Analytics
              </Button>
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                Manage Students
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <p className="text-white/70">No recent activity yet. Start by creating your first quiz!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

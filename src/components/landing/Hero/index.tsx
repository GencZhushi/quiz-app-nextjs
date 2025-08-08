import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      <div className="container px-4 md:px-6 grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_600px] lg:gap-12 mx-auto">
        {/* text */}
        <div className="flex flex-col justify-center space-y-4 lg:pl-12 xl:pl-24">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl text-white/90">
            Create &amp; Take Exams
            <span className="block text-red-400">Made Simple</span>
          </h1>
          <p className="max-w-[600px] md:text-xl text-white/80">
            The ultimate platform for educators to build, share and analyse engaging assessments.
          </p>

          <div className="flex flex-col min-[400px]:flex-row gap-2">
            <Button asChild className="h-12 px-8 bg-red-500 hover:bg-red-600 text-white">
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button className="h-12 px-8 border border-white/30 bg-transparent text-white hover:bg-white/10">
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/80">
            <CheckCircle className="h-4 w-4 text-red-500" /> Free forever plan
            <CheckCircle className="h-4 w-4 text-red-500" /> No credit card required
          </div>
        </div>

        {/* hero image */}
        <div className="flex items-center justify-center">
          <Image src="/modern-quiz-dashboard.png" alt="Quiz Platform Dashboard"
                 width={600} height={400}
                 className="aspect-video rounded-xl object-cover shadow-2xl" />
        </div>
      </div>
    </section>
  );
}

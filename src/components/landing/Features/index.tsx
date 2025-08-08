import FeatureCard from "./FeatureCard";
import { PenTool, Users, BarChart3, Clock, Shield, Zap, LucideIcon } from "lucide-react";

type FeatureItem = [LucideIcon, string, string];

const data: FeatureItem[] = [
  [PenTool,  "Easy Question Creation", "Build quizzes with multiple choice, true/false, short answer and essays."],
  [Users,    "Student Management",     "Organize classes, track progress, manage permissions."],
  [BarChart3,"Advanced Analytics",     "Drill into performance, question difficulty and trends."],
  [Clock,    "Timed Assessments",      "Set limits per exam or per question."],
  [Shield,   "Secure Testing",         "Randomize items, lock browsers and detect plagiarism."],
  [Zap,      "Instant Feedback",       "Show results and explanations immediately."],
];

export default function Features() {
  return (
    <section id="features" className="py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      <div className="container px-4 md:px-6 text-center space-y-4 mx-auto">
        <div className="lg:pl-12 xl:pl-24">
          <span className="inline-block rounded-lg bg-gray-700 px-3 py-1 text-sm text-white/90">Features</span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white/90 mt-4">
            Everything You Need for Online Assessment
          </h2>
          <p className="mx-auto max-w-[900px] text-white/80 md:text-xl mt-4">
            Powerful tools for educators and an intuitive experience for students.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2 lg:gap-12 lg:px-12 xl:px-24">
          <div className="grid gap-6">{data.slice(0, 3).map(([icon, title, desc]) => <FeatureCard key={title} icon={icon} title={title} desc={desc} />)}</div>
          <div className="grid gap-6">{data.slice(3).map(([icon, title, desc]) => <FeatureCard key={title} icon={icon} title={title} desc={desc} />)}</div>
        </div>
      </div>
    </section>
  );
}

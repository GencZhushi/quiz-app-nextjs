import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export default function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <Card className="border-gray-700 bg-gray-800/50">
      <CardHeader>
        <Icon className="h-8 w-8 text-red-400" />
        <CardTitle className="text-white/90">{title}</CardTitle>
        <CardDescription className="text-white/70">{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}

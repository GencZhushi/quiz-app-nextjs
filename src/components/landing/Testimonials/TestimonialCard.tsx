import { Card, CardContent } from "@/components/ui/card";

export default function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <Card className="border-gray-700 bg-gray-800/50">
      <CardContent className="pt-6 space-y-4">
        <p className="text-sm text-white/80">“{quote}”</p>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-700" />
          <div>
            <p className="text-sm font-medium text-white/90">{name}</p>
            <p className="text-xs text-white/70">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

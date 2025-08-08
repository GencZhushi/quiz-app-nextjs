import { CheckCircle } from "lucide-react";

export default function Step({ badgeClass, number, title, items }: { badgeClass: string; number: string; title: string; items: string[] }) {
  return (
    <div className="space-y-4">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${badgeClass} text-white text-xl font-bold`}>
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <div className="space-y-2">
        {items.map(text => (
          <div key={text} className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <span className="text-sm text-gray-600">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

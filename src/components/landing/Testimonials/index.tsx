// src/components/landing/Testimonials/index.tsx
import TestimonialCard from "./TestimonialCard";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "EducHorizon has revolutionized how I conduct assessments. The analytics help me understand exactly where my students need more support.",
      name: "Dr. Sarah Johnson",
      role: "Professor of Biology, MIT",
    },
    {
      quote:
        "The interface is so intuitive that my students adapted immediately. No more technical difficulties during exam time!",
      name: "Prof. Michael Chen",
      role: "Computer Science, Stanford",
    },
    {
      quote:
        "Creating quizzes used to take hours. Now I can build comprehensive assessments in minutes with EducHorizon. Game changer!",
      name: "Dr. Emily Rodriguez",
      role: "Mathematics, Harvard",
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Section heading */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 lg:pl-12 xl:pl-24">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white/90">
              Loved by Educators Worldwide
            </h2>
            <p className="max-w-[900px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See what professors and students are saying about EducHorizon
            </p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-8 lg:px-12 xl:px-24">
          {testimonials.map((t) => (
            <TestimonialCard
              key={t.name}
              quote={t.quote}
              name={t.name}
              role={t.role}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

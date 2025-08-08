import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Cta() {
  return (
    <section className="py-12 md:py-24 lg:py-32 bg-red-500 text-white">
      <div className="container px-4 md:px-6 text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          Ready to Transform Your Assessments?
        </h2>
        <p className="mx-auto max-w-[600px] text-white/90 md:text-xl">
          Join thousands of educators who have already made the switch.
        </p>

        <form className="mx-auto flex w-full max-w-sm gap-2">
          <Input type="email" placeholder="Enter your email"
                 className="flex-1 bg-white text-gray-900 border-white" />
          <Button type="submit" className="bg-gray-800 hover:bg-gray-900">
            Get Started
          </Button>
        </form>

        <p className="text-xs text-white/70">Start your free trial today. No credit card required.</p>
      </div>
    </section>
  );
}

import Step from "./Step";

export default function HowItWorks() {
  const prof = [
    "Create your account and set up your first class",
    "Build quizzes using our intuitive question builder",
    "Share quiz codes with your students",
    "Monitor progress and review detailed analytics",
  ];
  const student = [
    "Receive quiz code from your professor",
    "Join the quiz using the provided code",
    "Complete the assessment at your own pace",
    "Get instant feedback and see your results",
  ];
  return (
    <section id="how-it-works" className="py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6 text-center space-y-4 mx-auto">
        <div className="lg:pl-12 xl:pl-24">
          <span className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700">How It Works</span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900 mt-4">
            Simple Process, Powerful Results
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 py-12 lg:grid-cols-2 lg:gap-12 lg:px-12 xl:px-24">
          <Step number="1" badgeClass="bg-red-500" title="For Professors" items={prof} />
          <Step number="2" badgeClass="bg-gray-800" title="For Students" items={student} />
        </div>
      </div>
    </section>
  );
}

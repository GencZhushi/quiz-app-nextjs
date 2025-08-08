function Stat({ value, label }: { value: string; label: string }) {
    return (
      <div className="flex flex-col items-center space-y-2 text-center">
        <span className="text-3xl font-bold text-red-500">{value}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
    );
  }
  
  export default function Stats() {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6 grid gap-6 lg:grid-cols-4 md:grid-cols-2">
          <Stat value="50K+"  label="Active Educators" />
          <Stat value="2M+"   label="Students Served" />
          <Stat value="10M+"  label="Quizzes Created" />
          <Stat value="99.9%" label="Uptime" />
        </div>
      </section>
    );
  }
  
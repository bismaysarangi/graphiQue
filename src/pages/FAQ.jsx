import { Plus, Minus } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "Is GraphiQue free to use?",
      answer: "GraphiQue offers a free tier with essential editing features. For advanced tools and premium features, we provide affordable subscription plans to meet different needs."
    },
    {
      question: "Do I need to download any software?",
      answer: "No, GraphiQue is entirely cloud-based. You can access all features directly from your web browser without any downloads or installations."
    },
    {
      question: "What file formats does GraphiQue support?",
      answer: "GraphiQue supports multiple file formats including PNG, JPG, SVG, and GIF. You can also export in high-resolution formats for professional use."
    },
    {
      question: "Can I use GraphiQue on my mobile device?",
      answer: "Yes! GraphiQue is fully responsive and works seamlessly on desktops, tablets, and mobile devices, ensuring flexibility wherever you go."
    }
  ];

  return (
    <section id="faq" className="w-full py-20 md:py-28 lg:py-32 bg-black">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-white">FAQ</h2>
            <p className="mx-auto max-w-[900px] text-gray-400 md:text-xl lg:text-2xl">
              Answers to common questions about GraphiQue.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((item, index) => (
            <details 
              key={index} 
              className="group rounded-lg bg-gray-900 p-6 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-lg font-medium text-white">
                <h3>{item.question}</h3>
                <div className="relative h-5 w-5 shrink-0">
                  <Plus className="absolute h-5 w-5 opacity-100 group-open:opacity-0" />
                  <Minus className="absolute h-5 w-5 opacity-0 group-open:opacity-100" />
                </div>
              </summary>
              <p className="mt-4 text-sm text-gray-400 text-left">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

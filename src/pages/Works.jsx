import { Upload, Edit, Wand2, Download } from "lucide-react";

export default function Works() {
  const steps = [
    { icon: Upload, title: "Upload", desc: "Securely upload your image to our cloud platform." },
    { icon: Edit, title: "Edit", desc: "Use our powerful tools to enhance and transform your image." },
    { icon: Wand2, title: "Refine", desc: "Apply finishing touches with advanced features." },
    { icon: Download, title: "Download", desc: "Save your masterpiece in your preferred format." },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 md:py-28 lg:py-32 bg-black">
      <div className=" px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-white">How It Works</h2>
        <p className="mx-auto max-w-[900px] text-gray-400 md:text-xl lg:text-2xl">
          Transform your images in minutes with these simple steps.
        </p>
        <div className="grid max-w-5xl mx-auto gap-12 lg:grid-cols-4 mt-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-75 blur"></div>
                <div className="relative h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">
                {index + 1}. {step.title}
              </h3>
              <p className="text-gray-400 text-center">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
